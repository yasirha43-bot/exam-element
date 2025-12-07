# Science Revision Pro - GCSE & A-Level

A comprehensive AI-powered revision platform for GCSE and A-Level science students with flashcards, quizzes, mock exams, and detailed progress analytics.

## Features

✨ **Core Features:**
- User authentication (signup, login, logout)
- Subscription system with Stripe integration (£4.99/month)
- AI-powered flashcard generation (OpenAI)
- AI-powered quiz generation
- AI-powered mock exam generation
- Progress tracking and analytics
- Performance graphs and weak topic detection

📚 **Supported Subjects:**
- Biology
- Chemistry
- Physics

🏢 **Supported Exam Boards:**
- AQA
- OCR
- Edexcel

## Tech Stack

**Frontend:**
- React 18
- React Router v6
- Vite
- Tailwind CSS
- Chart.js for analytics
- Axios for API calls

**Backend:**
- Node.js with Express
- PostgreSQL database
- Stripe API
- OpenAI API
- JWT authentication
- bcryptjs for password hashing

## Prerequisites

Before starting, you need:

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v12+) - [Download](https://www.postgresql.org/)
3. **OpenAI API Key** - [Get one](https://platform.openai.com/api-keys)
4. **Stripe Account** - [Sign up](https://stripe.com)

## Installation & Setup

### 1. Clone and Setup Directories

```bash
cd /Users/yusra/Desktop/flashcardweb2
npm install
```

### 2. Setup PostgreSQL Database

```bash
# Create database
createdb flashcard_db

# Or use PostgreSQL GUI (pgAdmin)
```

### 3. Configure Environment Variables

**Backend** (`server/.env`):

```bash
# Database
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/flashcard_db

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Stripe
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret

# OpenAI
OPENAI_API_KEY=sk-your_openai_key

# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):

```bash
VITE_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Go back to root
cd ..
```

### 5. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to API Keys section
3. Copy your test keys and add to `server/.env`
4. Go to Webhooks section
5. Add endpoint: `http://localhost:5000/api/subscription/webhook`
6. Select events: `customer.subscription.updated`, `customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_failed`
7. Copy signing secret to `.env`

### 6. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Go to API Keys
3. Create new API key
4. Add to `server/.env`

## Running the Application

### Development Mode

```bash
# From root directory - runs both frontend and backend
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Manual Start (Separate Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Log in
- `GET /api/auth/me` - Get current user

### Subscription
- `POST /api/subscription/create-checkout-session` - Create Stripe session
- `GET /api/subscription/status` - Check subscription status
- `POST /api/subscription/webhook` - Stripe webhook (internal)

### Flashcards
- `POST /api/flashcards/generate` - Generate flashcards
- `GET /api/flashcards` - Get user's flashcards
- `POST /api/flashcards/:id/review` - Record review
- `DELETE /api/flashcards/:id` - Delete flashcard

### Quizzes (Premium Only)
- `POST /api/quizzes/generate` - Generate quiz
- `GET /api/quizzes/:id` - Get quiz
- `POST /api/quizzes/:id/submit` - Submit answers
- `GET /api/quizzes/:id/results` - Get results

### Mock Exams (Premium Only)
- `POST /api/mock-exams/generate` - Generate mock exam
- `GET /api/mock-exams/:id` - Get exam
- `POST /api/mock-exams/:id/submit` - Submit exam
- `GET /api/mock-exams/:id/results` - Get results

### Dashboard & Analytics
- `GET /api/dashboard` - Get dashboard stats
- `GET /api/dashboard/analytics/:subject` - Get subject analytics
- `GET /api/dashboard/history/:subject` - Get performance history

## Paywall Rules

### Free Users:
- 1 free flashcard generation per day (max 5 cards)
- Cannot access: Quizzes, Mock Exams, Advanced Analytics
- Can view basic progress

### Subscribed Users (£4.99/month):
- Unlimited flashcard generation
- Full access to all quiz features
- Full access to mock exams
- Detailed progress analytics
- Performance graphs

## Features Breakdown

### Flashcard Generation
1. User selects subject, exam board, topic
2. AI generates structured flashcards with:
   - Question
   - Answer
   - Explanation
3. User reviews flashcards and marks as correct/incorrect
4. Progress is tracked

### Quiz Generator
1. User creates quiz on specific topic
2. AI generates 5-20 multiple choice questions
3. User answers questions
4. System scores and shows results
5. Progress saved for analytics

### Mock Exams
1. User selects subject, level (GCSE/A-Level), exam board
2. AI generates realistic exam questions
3. User attempts exam with time tracking
4. User manually awards marks to own answers
5. Results saved with model answers for review

### Progress Dashboard
- Displays:
  - Total flashcards generated
  - Quiz completion count & average score
  - Mock exam count & average score
  - Weak topics detection
  - Performance trends
  - Subject breakdowns

## Database Schema

### Tables:
- `users` - User accounts and subscription info
- `flashcards` - Generated flashcards
- `flashcard_reviews` - User performance on flashcards
- `quizzes` - Quiz records
- `quiz_questions` - MCQ questions
- `quiz_responses` - User answers
- `mock_exams` - Mock exam records
- `mock_exam_questions` - Exam questions
- `progress_tracking` - Performance metrics
- `subscription_events` - Payment history

## Deployment

### Vercel (Frontend)

```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```

### Heroku (Backend)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set DATABASE_URL=...
heroku config:set JWT_SECRET=...
heroku config:set STRIPE_SECRET_KEY=...
# ... etc

# Deploy
git push heroku main
```

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
psql -U your_username -d flashcard_db

# Verify DATABASE_URL format
postgresql://username:password@localhost:5432/flashcard_db
```

### Stripe Webhook Issues
- Ensure webhook endpoint is public (not localhost)
- Check webhook signing secret is correct
- Verify event types are selected in dashboard

### OpenAI API Issues
- Check API key is valid
- Ensure billing is set up on OpenAI account
- Check rate limits aren't exceeded

### CORS Issues
- Ensure CLIENT_URL in .env matches frontend URL
- Check CORS middleware in server/index.js

## Testing the Stripe Integration

1. Use Stripe test cards:
   - Successful: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Auth Required: `4000 2500 0000 3155`

2. Use future dates for expiry

## Performance Tips

1. **Caching**: Implement Redis for quiz/flashcard caching
2. **Database**: Add indexes on frequently queried columns
3. **Frontend**: Lazy load components
4. **API**: Implement pagination for large datasets
5. **Images**: Optimize and compress media

## Security Best Practices

1. ✅ Passwords hashed with bcryptjs
2. ✅ JWT tokens for authentication
3. ✅ HTTPS in production
4. ✅ Environment variables for secrets
5. ✅ Subscription checks on premium endpoints
6. ⚠️ TODO: Rate limiting on API
7. ⚠️ TODO: CSRF protection
8. ⚠️ TODO: SQL injection prevention

## Future Enhancements

- [ ] Real-time collaboration
- [ ] AI tutoring chat
- [ ] Spaced repetition algorithm
- [ ] Video tutorials
- [ ] Mobile app (React Native)
- [ ] Teacher dashboard
- [ ] Classroom features
- [ ] More subjects (Maths, English, etc.)
- [ ] Custom exam boards
- [ ] Progress export (PDF)

## Support

For issues, check:
1. Logs in terminal
2. Browser console for frontend errors
3. PostgreSQL connection
4. API keys and environment variables
5. Network tab in DevTools

## License

MIT License - Use freely for educational purposes

## Contact

For questions or issues, create an issue in the repository.

---

**Happy Revising! 📚✨**
