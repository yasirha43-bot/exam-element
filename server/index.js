import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import dotenv from 'dotenv';
import { initializeDatabase } from './schema.js';

// Routes
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import flashcardRoutes from './routes/flashcards.js';
import quizRoutes from './routes/quizzes.js';
import mockExamRoutes from './routes/mockExams.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Special handling for Stripe webhooks (raw body)
app.post('/api/subscription/webhook', express.raw({type: 'application/json'}));

// Regular JSON parsing for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/mock-exams', mockExamRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
