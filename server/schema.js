import pool, { initializeDb, saveDb } from './db.js';

// Create all tables
export async function initializeDatabase() {
  try {
    // Initialize the database first
    await initializeDb();
    
    // Enable foreign keys (sql.js doesn't validate, but we set it for consistency)
    try {
      pool.query('PRAGMA foreign_keys = ON;');
    } catch (e) {
      // PRAGMA might not work in sql.js, but that's ok
    }
    
    // Users table
    pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        is_subscribed BOOLEAN DEFAULT 0,
        stripe_customer_id VARCHAR(255),
        stripe_subscription_id VARCHAR(255),
        daily_flashcard_count INTEGER DEFAULT 0,
        daily_flashcard_reset_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Flashcards table
    pool.query(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject VARCHAR(50) NOT NULL,
        exam_board VARCHAR(50) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Flashcard reviews/progress table
    pool.query(`
      CREATE TABLE IF NOT EXISTS flashcard_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        flashcard_id INTEGER NOT NULL,
        is_correct BOOLEAN NOT NULL,
        reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(flashcard_id) REFERENCES flashcards(id) ON DELETE CASCADE
      )
    `);

    // Quizzes table
    pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject VARCHAR(50) NOT NULL,
        exam_board VARCHAR(50) NOT NULL,
        topic VARCHAR(255),
        title VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Quiz questions table
    pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        question_number INTEGER,
        question TEXT NOT NULL,
        option_a VARCHAR(255),
        option_b VARCHAR(255),
        option_c VARCHAR(255),
        option_d VARCHAR(255),
        correct_answer VARCHAR(1),
        marks INTEGER DEFAULT 1,
        FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
      )
    `);

    // Quiz responses table
    pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        user_answer VARCHAR(1),
        is_correct BOOLEAN,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(question_id) REFERENCES quiz_questions(id)
      )
    `);

    // Mock exams table
    pool.query(`
      CREATE TABLE IF NOT EXISTS mock_exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject VARCHAR(50) NOT NULL,
        exam_board VARCHAR(50) NOT NULL,
        exam_level VARCHAR(20) NOT NULL,
        title VARCHAR(255) NOT NULL,
        total_marks INTEGER,
        user_score INTEGER,
        percentage DECIMAL(5, 2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Mock exam questions table
    pool.query(`
      CREATE TABLE IF NOT EXISTS mock_exam_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mock_exam_id INTEGER NOT NULL,
        question_number INTEGER,
        question_text TEXT NOT NULL,
        question_type VARCHAR(20),
        marks INTEGER,
        sample_answer TEXT,
        user_answer TEXT,
        marks_awarded INTEGER,
        FOREIGN KEY(mock_exam_id) REFERENCES mock_exams(id) ON DELETE CASCADE
      )
    `);

    // Progress tracking table
    pool.query(`
      CREATE TABLE IF NOT EXISTS progress_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subject VARCHAR(50) NOT NULL,
        topic VARCHAR(255) NOT NULL,
        flashcards_generated INTEGER DEFAULT 0,
        avg_quiz_score DECIMAL(5, 2),
        avg_mock_score DECIMAL(5, 2),
        quiz_count INTEGER DEFAULT 0,
        mock_count INTEGER DEFAULT 0,
        weak_topic INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Subscription events table
    pool.query(`
      CREATE TABLE IF NOT EXISTS subscription_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_type VARCHAR(50),
        stripe_event_id VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Save database to file
    saveDb();

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

export default pool;
