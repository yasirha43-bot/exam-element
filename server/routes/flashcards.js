import express from 'express';
import pool from '../db.js';
import { authMiddleware, subscriptionCheckMiddleware } from '../middleware/auth.js';
import { generateFlashcards } from '../services/aiService.js';

const router = express.Router();

// Generate flashcards
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { subject, topic, examBoard, count = 5 } = req.body;
    const userId = req.user.id;

    // Check free user limit
    const user = await pool.query(
      'SELECT daily_flashcard_count, daily_flashcard_reset_date, is_subscribed FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    const today = new Date().toISOString().split('T')[0];
    const resetDate = userData.daily_flashcard_reset_date.toISOString().split('T')[0];

    // Reset count if new day
    if (resetDate !== today) {
      await pool.query('UPDATE users SET daily_flashcard_count = 0, daily_flashcard_reset_date = $1 WHERE id = $2', [today, userId]);
      userData.daily_flashcard_count = 0;
    }

    // Check limit
    if (!userData.is_subscribed && userData.daily_flashcard_count >= 1) {
      return res.status(403).json({
        error: 'Daily free flashcard limit reached',
        needsSubscription: true,
        limit: 1
      });
    }

    // Generate flashcards using AI
    const flashcards = await generateFlashcards(subject, topic, examBoard, count);

    // Save to database
    const savedFlashcards = [];
    for (const flashcard of flashcards) {
      const result = await pool.query(
        'INSERT INTO flashcards (user_id, subject, exam_board, topic, question, answer, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, question, answer, explanation',
        [userId, subject, examBoard, topic, flashcard.question, flashcard.answer, flashcard.explanation]
      );
      savedFlashcards.push(result.rows[0]);
    }

    // Increment daily count for free users
    if (!userData.is_subscribed) {
      await pool.query('UPDATE users SET daily_flashcard_count = daily_flashcard_count + 1 WHERE id = $1', [userId]);
    }

    // Update progress tracking
    const existingProgress = await pool.query(
      'SELECT id FROM progress_tracking WHERE user_id = $1 AND subject = $2 AND topic = $3',
      [userId, subject, topic]
    );

    if (existingProgress.rows.length > 0) {
      await pool.query(
        'UPDATE progress_tracking SET flashcards_generated = flashcards_generated + $1 WHERE user_id = $2 AND subject = $3 AND topic = $4',
        [flashcards.length, userId, subject, topic]
      );
    } else {
      await pool.query(
        'INSERT INTO progress_tracking (user_id, subject, topic, flashcards_generated) VALUES ($1, $2, $3, $4)',
        [userId, subject, topic, flashcards.length]
      );
    }

    res.json({ flashcards: savedFlashcards, generated: flashcards.length });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate flashcards' });
  }
});

// Get user's flashcards
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { subject, topic } = req.query;
    let query = 'SELECT id, subject, exam_board, topic, question, answer, explanation, created_at FROM flashcards WHERE user_id = $1';
    const params = [req.user.id];

    if (subject) {
      query += ' AND subject = $2';
      params.push(subject);
    }

    if (topic) {
      const paramIndex = params.length + 1;
      query += ` AND topic = $${paramIndex}`;
      params.push(topic);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ error: 'Failed to get flashcards' });
  }
});

// Record flashcard review
router.post('/:flashcardId/review', authMiddleware, async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const { isCorrect } = req.body;

    // Verify ownership
    const flashcard = await pool.query('SELECT user_id FROM flashcards WHERE id = $1', [flashcardId]);
    if (flashcard.rows.length === 0 || flashcard.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Save review
    await pool.query(
      'INSERT INTO flashcard_reviews (user_id, flashcard_id, is_correct) VALUES ($1, $2, $3)',
      [req.user.id, flashcardId, isCorrect]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

// Delete flashcard
router.delete('/:flashcardId', authMiddleware, async (req, res) => {
  try {
    const { flashcardId } = req.params;

    // Verify ownership
    const flashcard = await pool.query('SELECT user_id FROM flashcards WHERE id = $1', [flashcardId]);
    if (flashcard.rows.length === 0 || flashcard.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM flashcards WHERE id = $1', [flashcardId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

export default router;
