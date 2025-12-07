import express from 'express';
import pool from '../db.js';
import { authMiddleware, subscriptionCheckMiddleware } from '../middleware/auth.js';
import { generateMockExam } from '../services/aiService.js';

const router = express.Router();

// Generate mock exam
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { subject, examLevel, examBoard } = req.body;
    const userId = req.user.id;

    // Generate mock exam
    const mockExam = await generateMockExam(subject, examLevel, examBoard);

    // Create mock exam record
    const examResult = await pool.query(
      'INSERT INTO mock_exams (user_id, subject, exam_board, exam_level, title, total_marks) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, subject, examBoard, examLevel, mockExam.title || `${subject} Mock Exam`, mockExam.totalMarks]
    );

    const mockExamId = examResult.rows[0].id;

    // Save questions
    for (const q of mockExam.questions) {
      await pool.query(
        'INSERT INTO mock_exam_questions (mock_exam_id, question_number, question_text, question_type, marks, sample_answer) VALUES ($1, $2, $3, $4, $5, $6)',
        [mockExamId, q.number, q.text, q.type, q.marks, q.sampleAnswer]
      );
    }

    // Update progress
    const existingProgress = await pool.query(
      'SELECT id FROM progress_tracking WHERE user_id = $1 AND subject = $2 AND topic = $3',
      [userId, subject, `${examLevel} Mock`]
    );

    if (existingProgress.rows.length > 0) {
      await pool.query(
        'UPDATE progress_tracking SET mock_count = mock_count + 1 WHERE user_id = $1 AND subject = $2 AND topic = $3',
        [userId, subject, `${examLevel} Mock`]
      );
    } else {
      await pool.query(
        'INSERT INTO progress_tracking (user_id, subject, topic, mock_count) VALUES ($1, $2, $3, 1)',
        [userId, subject, `${examLevel} Mock`]
      );
    }

    res.json({ mockExamId, title: mockExam.title, questions: mockExam.questions.length });
  } catch (error) {
    console.error('Mock exam generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate mock exam' });
  }
});

// Get mock exam
router.get('/:mockExamId', authMiddleware, async (req, res) => {
  try {
    const { mockExamId } = req.params;

    // Verify ownership
    const exam = await pool.query(
      'SELECT id, title, total_marks FROM mock_exams WHERE id = $1 AND user_id = $2',
      [mockExamId, req.user.id]
    );

    if (exam.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const questions = await pool.query(
      'SELECT id, question_number, question_text, question_type, marks FROM mock_exam_questions WHERE mock_exam_id = $1 ORDER BY question_number',
      [mockExamId]
    );

    res.json({
      mockExamId,
      title: exam.rows[0].title,
      totalMarks: exam.rows[0].total_marks,
      questions: questions.rows
    });
  } catch (error) {
    console.error('Get mock exam error:', error);
    res.status(500).json({ error: 'Failed to get mock exam' });
  }
});

// Submit mock exam answers
router.post('/:mockExamId/submit', authMiddleware, async (req, res) => {
  try {
    const { mockExamId } = req.params;
    const { answers } = req.body; // Array of {questionId, userAnswer, marksAwarded}

    // Verify ownership
    const exam = await pool.query(
      'SELECT id, total_marks FROM mock_exams WHERE id = $1 AND user_id = $2',
      [mockExamId, req.user.id]
    );

    if (exam.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let totalMarksAwarded = 0;

    // Save answers and marks
    for (const answer of answers) {
      totalMarksAwarded += answer.marksAwarded || 0;

      await pool.query(
        'UPDATE mock_exam_questions SET user_answer = $1, marks_awarded = $2 WHERE id = $3',
        [answer.userAnswer, answer.marksAwarded, answer.questionId]
      );
    }

    const totalMarks = exam.rows[0].total_marks;
    const percentage = Math.round((totalMarksAwarded / totalMarks) * 100);

    // Update mock exam record
    await pool.query(
      'UPDATE mock_exams SET user_score = $1, percentage = $2 WHERE id = $3',
      [totalMarksAwarded, percentage, mockExamId]
    );

    res.json({
      totalMarks,
      userScore: totalMarksAwarded,
      percentage
    });
  } catch (error) {
    console.error('Mock exam submit error:', error);
    res.status(500).json({ error: 'Failed to submit mock exam' });
  }
});

// Get mock exam results
router.get('/:mockExamId/results', authMiddleware, async (req, res) => {
  try {
    const { mockExamId } = req.params;

    // Verify ownership
    const exam = await pool.query(
      'SELECT user_score, percentage, total_marks FROM mock_exams WHERE id = $1 AND user_id = $2',
      [mockExamId, req.user.id]
    );

    if (exam.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const questions = await pool.query(
      'SELECT question_number, question_text, marks, marks_awarded, user_answer, sample_answer FROM mock_exam_questions WHERE mock_exam_id = $1 ORDER BY question_number',
      [mockExamId]
    );

    res.json({
      userScore: exam.rows[0].user_score,
      totalMarks: exam.rows[0].total_marks,
      percentage: exam.rows[0].percentage,
      questions: questions.rows
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;
