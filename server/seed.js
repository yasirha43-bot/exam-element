import { initializeDatabase } from './schema.js';
import pool from './db.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('Initializing database schema...');
    await initializeDatabase();

    // Create demo users
    console.log('Creating demo users...');
    const hashedPassword = await bcrypt.hash('demo123', 10);

    const demoUsers = [
      {
        email: 'student@example.com',
        password_hash: hashedPassword,
        first_name: 'John',
        last_name: 'Student',
        is_subscribed: false
      },
      {
        email: 'premium@example.com',
        password_hash: hashedPassword,
        first_name: 'Jane',
        last_name: 'Premium',
        is_subscribed: true
      }
    ];

    for (const user of demoUsers) {
      try {
        await pool.query(
          'INSERT INTO users (email, password_hash, first_name, last_name, is_subscribed) VALUES ($1, $2, $3, $4, $5)',
          [user.email, user.password_hash, user.first_name, user.last_name, user.is_subscribed]
        );
        console.log(`✓ Created user: ${user.email} (subscribed: ${user.is_subscribed})`);
      } catch (err) {
        if (err.code === '23505') { // unique violation
          console.log(`- User ${user.email} already exists`);
        } else {
          throw err;
        }
      }
    }

    console.log('✅ Database seeding complete!');
    console.log('\nDemo Credentials:');
    console.log('Free User: student@example.com / demo123');
    console.log('Premium User: premium@example.com / demo123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
