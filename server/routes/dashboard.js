import express from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard data
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get flashcard count
    const flashcardCount = await pool.query(
      'SELECT COUNT(*) as count FROM flashcards WHERE user_id = $1',
      [userId]
    );

    // Get quiz stats
    const quizStats = await pool.query(
      `SELECT 
        COUNT(DISTINCT qr.quiz_id) as quiz_count,
        AVG(CAST(SUM(CASE WHEN qr.is_correct THEN qq.marks ELSE 0 END) as DECIMAL) / NULLIF(SUM(qq.marks), 0) * 100) as avg_score
       FROM quiz_responses qr
       JOIN quiz_questions qq ON qr.question_id = qq.id
       WHERE qr.user_id = $1
       GROUP BY qr.quiz_id`,
      [userId]
    );

    // Get mock exam stats
    const mockStats = await pool.query(
      `SELECT 
        COUNT(*) as mock_count,
        AVG(percentage) as avg_score,
        MAX(percentage) as highest_score
       FROM mock_exams 
       WHERE user_id = $1 AND user_score IS NOT NULL`,
      [userId]
    );

    // Get weak topics
    const weakTopics = await pool.query(
      `SELECT DISTINCT subject, topic, avg_quiz_score, avg_mock_score
       FROM progress_tracking
       WHERE user_id = $1 
       AND (COALESCE(avg_quiz_score, 0) < 50 OR COALESCE(avg_mock_score, 0) < 50)
       ORDER BY COALESCE(avg_quiz_score, 0) ASC
       LIMIT 5`,
      [userId]
    );

    // Get subject-wise breakdown
    const subjectStats = await pool.query(
      `SELECT 
        subject,
        COUNT(DISTINCT CASE WHEN topic LIKE '%Mock%' THEN NULL ELSE topic END) as topics_studied,
        SUM(CASE WHEN topic LIKE '%Mock%' THEN 1 ELSE 0 END) as mocks_taken
       FROM progress_tracking
       WHERE user_id = $1
       GROUP BY subject`,
      [userId]
    );

    res.json({
      flashcardsGenerated: parseInt(flashcardCount.rows[0].count),
      quizzes: {
        count: quizStats.rows.length,
        averageScore: quizStats.rows.length > 0 ? Math.round(quizStats.rows[0].avg_score || 0) : 0
      },
      mockExams: {
        count: mockStats.rows.length > 0 ? parseInt(mockStats.rows[0].mock_count) : 0,
        averageScore: mockStats.rows.length > 0 && mockStats.rows[0].avg_score ? Math.round(mockStats.rows[0].avg_score) : 0,
        highestScore: mockStats.rows.length > 0 && mockStats.rows[0].highest_score ? Math.round(mockStats.rows[0].highest_score) : 0
      },
      weakTopics: weakTopics.rows,
      subjectBreakdown: subjectStats.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get performance analytics
router.get('/analytics/:subject', authMiddleware, async (req, res) => {
  try {
    const { subject } = req.params;
    const userId = req.user.id;

    // Topic performance
    const topicPerformance = await pool.query(
      `SELECT topic, flashcards_generated, avg_quiz_score, avg_mock_score, quiz_count, mock_count
       FROM progress_tracking
       WHERE user_id = $1 AND subject = $2
       ORDER BY topic`,
      [userId, subject]
    );

    // Recent quiz performance
    const recentQuizzes = await pool.query(
      `SELECT 
        q.id, q.topic, q.created_at,
        COUNT(qr.id) as total_questions,
        SUM(CASE WHEN qr.is_correct THEN 1 ELSE 0 END) as correct_answers
       FROM quizzes q
       LEFT JOIN quiz_responses qr ON q.id = qr.quiz_id
       WHERE q.user_id = $1 AND q.subject = $2
       GROUP BY q.id, q.topic, q.created_at
       ORDER BY q.created_at DESC
       LIMIT 10`,
      [userId, subject]
    );

    // Recent mock exams
    const recentMocks = await pool.query(
      `SELECT id, title, user_score, total_marks, percentage, created_at
       FROM mock_exams
       WHERE user_id = $1 AND subject = $2
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId, subject]
    );

    res.json({
      topics: topicPerformance.rows,
      recentQuizzes: recentQuizzes.rows,
      recentMocks: recentMocks.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get performance history (for graphs)
router.get('/history/:subject', authMiddleware, async (req, res) => {
  try {
    const { subject } = req.params;
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily performance
    const performance = await pool.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT CASE WHEN source = 'quiz' THEN id END) as quizzes,
        COUNT(DISTINCT CASE WHEN source = 'mock' THEN id END) as mocks,
        AVG(CASE WHEN source = 'quiz' THEN score ELSE NULL END) as avg_quiz_score,
        AVG(CASE WHEN source = 'mock' THEN score ELSE NULL END) as avg_mock_score
       FROM (
         SELECT q.id, q.created_at, 'quiz' as source, AVG(CASE WHEN qr.is_correct THEN 100 ELSE 0 END) as score
         FROM quizzes q
         LEFT JOIN quiz_responses qr ON q.id = qr.quiz_id
         WHERE q.user_id = $1 AND q.subject = $2
         UNION ALL
         SELECT id, created_at, 'mock' as source, percentage as score
         FROM mock_exams
         WHERE user_id = $1 AND subject = $2
       ) combined
       WHERE created_at >= $3
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId, subject, startDate]
    );

    res.json(performance.rows);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
