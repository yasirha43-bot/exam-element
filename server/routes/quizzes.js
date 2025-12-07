import express from 'express';
import pool from '../db.js';
import { authMiddleware, subscriptionCheckMiddleware } from '../middleware/auth.js';
import { generateQuiz } from '../services/aiService.js';

const router = express.Router();

// Generate quiz
router.post('/generate', authMiddleware, subscriptionCheckMiddleware, async (req, res) => {
  try {
    const { subject, topic, examBoard, count = 10 } = req.body;
    const userId = req.user.id;

    // Generate quiz questions
    const questions = await generateQuiz(subject, topic, examBoard, count);

    // Create quiz record
    const quizResult = await pool.query(
      'INSERT INTO quizzes (user_id, subject, exam_board, topic, title) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [userId, subject, examBoard, topic, `${subject} - ${topic} Quiz`]
    );

    const quizId = quizResult.rows[0].id;

    // Save questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question_number, question, option_a, option_b, option_c, option_d, correct_answer, marks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [quizId, i + 1, q.question, q.options.A, q.options.B, q.options.C, q.options.D, q.correctAnswer, q.marks]
      );
    }

    // Update progress
    const existingProgress = await pool.query(
      'SELECT id FROM progress_tracking WHERE user_id = $1 AND subject = $2 AND topic = $3',
      [userId, subject, topic]
    );

    if (existingProgress.rows.length > 0) {
      await pool.query(
        'UPDATE progress_tracking SET quiz_count = quiz_count + 1 WHERE user_id = $1 AND subject = $2 AND topic = $3',
        [userId, subject, topic]
      );
    } else {
      await pool.query(
        'INSERT INTO progress_tracking (user_id, subject, topic, quiz_count) VALUES ($1, $2, $3, 1)',
        [userId, subject, topic]
      );
    }

    res.json({ quizId, questions: questions.length });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate quiz' });
  }
});

// Get quiz
router.get('/:quizId', authMiddleware, async (req, res) => {
  try {
    const { quizId } = req.params;

    // Verify ownership
    const quiz = await pool.query('SELECT id FROM quizzes WHERE id = $1 AND user_id = $2', [quizId, req.user.id]);
    if (quiz.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const questions = await pool.query(
      'SELECT id, question_number, question, option_a, option_b, option_c, option_d, marks FROM quiz_questions WHERE quiz_id = $1 ORDER BY question_number',
      [quizId]
    );

    res.json({
      quizId,
      questions: questions.rows
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

// Submit quiz answers
router.post('/:quizId/submit', authMiddleware, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of {questionId, userAnswer}

    // Verify ownership
    const quiz = await pool.query('SELECT id FROM quizzes WHERE id = $1 AND user_id = $2', [quizId, req.user.id]);
    if (quiz.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let totalMarks = 0;
    let earnedMarks = 0;

    // Save responses and calculate score
    for (const answer of answers) {
      const question = await pool.query('SELECT correct_answer, marks FROM quiz_questions WHERE id = $1', [answer.questionId]);

      if (question.rows.length > 0) {
        const q = question.rows[0];
        const isCorrect = answer.userAnswer === q.correct_answer;
        totalMarks += q.marks;
        if (isCorrect) earnedMarks += q.marks;

        await pool.query(
          'INSERT INTO quiz_responses (quiz_id, user_id, question_id, user_answer, is_correct) VALUES ($1, $2, $3, $4, $5)',
          [quizId, req.user.id, answer.questionId, answer.userAnswer, isCorrect]
        );
      }
    }

    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;

    res.json({
      totalMarks,
      earnedMarks,
      percentage
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get quiz results
router.get('/:quizId/results', authMiddleware, async (req, res) => {
  try {
    const { quizId } = req.params;

    // Verify ownership
    const quiz = await pool.query('SELECT id FROM quizzes WHERE id = $1 AND user_id = $2', [quizId, req.user.id]);
    if (quiz.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const results = await pool.query(
      `SELECT qr.question_id, qq.question, qr.user_answer, qq.correct_answer, qq.option_a, qq.option_b, qq.option_c, qq.option_d, qq.marks, qr.is_correct
       FROM quiz_responses qr
       JOIN quiz_questions qq ON qr.question_id = qq.id
       WHERE qr.quiz_id = $1
       ORDER BY qq.question_number`,
      [quizId]
    );

    res.json(results.rows);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;
