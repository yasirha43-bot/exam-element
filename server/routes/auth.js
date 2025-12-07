import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate password
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    if (!hasUpperCase || !hasNumber || !isLongEnough) {
      return res.status(400).json({ error: 'Password must be at least 8 characters, contain one uppercase letter, and one number' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (last_name is optional, can be NULL)
    await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, is_subscribed) VALUES ($1, $2, $3, $4, FALSE)',
      [email, hashedPassword, firstName, lastName || null]
    );

    // Fetch the created user
    const userResult = await pool.query('SELECT id, email, is_subscribed FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, is_subscribed: user.is_subscribed },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT id, email, password_hash, is_subscribed FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_subscribed: user.is_subscribed },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, is_subscribed: user.is_subscribed } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, is_subscribed, daily_flashcard_count FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
