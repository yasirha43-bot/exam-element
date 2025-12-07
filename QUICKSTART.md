# Quick Start Guide

## 1. Initial Setup (5 minutes)

### Step 1: Prepare PostgreSQL
```bash
# Open PostgreSQL
createdb flashcard_db

# Or use pgAdmin GUI to create database named 'flashcard_db'
```

### Step 2: Configure Environment Variables

**Create `server/.env` file:**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/flashcard_db
JWT_SECRET=your_secret_key_here_minimum_32_characters
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxx
OPENAI_API_KEY=sk-xxx
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Step 3: Install Dependencies
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

## 2. Get API Keys (10 minutes)

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and paste into `server/.env`

### Stripe Test Keys
1. Go to https://dashboard.stripe.com
2. Toggle "Test mode" ON
3. Go to API Keys → Standard keys
4. Copy Secret and Publishable keys
5. Paste into `server/.env`

### Stripe Webhook Secret
1. In Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. For now, use: `http://localhost:5000/api/subscription/webhook`
4. Select events: 
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy signing secret and add to `server/.env`

## 3. Run the Application

```bash
# From root directory
npm run dev
```

This opens:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

## 4. Test the Features

### Test Signup/Login
1. Go to http://localhost:5173
2. Click "Sign up"
3. Create account
4. Log in

### Test Free Flashcard Generation
1. Click "Flashcards" in navbar
2. Select: Biology, AQA, "Photosynthesis"
3. Click "Generate Flashcards"
4. You get 1 free generation per day

### Test Subscription/Paywall
1. Try to click "Quizzes" - should show upgrade prompt
2. Click "Upgrade Now"
3. Use Stripe test card: `4242 4242 4242 4242`
4. Expiry: Any future date
5. CVC: Any 3 digits
6. After success, you get premium access

### Test Quizzes (Premium Only)
1. After upgrade, go to Quizzes
2. Create quiz on any topic
3. Answer questions
4. See score

### Test Mock Exams (Premium Only)
1. Go to Mock Exams
2. Select Biology, GCSE, AQA
3. Take exam
4. Score appears

### Test Dashboard
1. Go to Dashboard
2. See all your stats:
   - Flashcards generated
   - Quiz scores
   - Mock exam averages
   - Weak topics
   - Performance graphs

## 5. Common Issues & Solutions

### "Cannot POST /api/auth/signup"
- Check backend is running on port 5000
- Check database is running

### "ECONNREFUSED"
- Start PostgreSQL
- Start backend server

### AI Generation Getting Errors
- Check OPENAI_API_KEY is valid
- Check you have credits on OpenAI account
- Check API key doesn't have spaces

### Stripe Webhook Not Working
- Make sure webhook endpoint is correct
- Webhook only works from public URLs (use ngrok for localhost)
- For development, Stripe test mode is fine

### "Unexpected token" in JavaScript
- Clear browser cache
- Restart Vite dev server
- Check for typos in API responses

## 6. Database Check

```bash
# Connect to database
psql -U username -d flashcard_db

# Check tables created
\dt

# Exit
\q
```

## 7. File Structure Overview

```
flashcardweb2/
├── server/
│   ├── routes/        # API endpoints
│   ├── services/      # AI generation (OpenAI)
│   ├── middleware/    # Auth checks
│   ├── db.js          # Database connection
│   ├── schema.js      # Database tables
│   └── index.js       # Main server
├── client/
│   ├── src/
│   │   ├── pages/     # React pages
│   │   ├── components/# React components
│   │   ├── api.js     # API calls
│   │   └── App.jsx    # Main app
│   └── index.html
└── README.md
```

## 8. Next Steps

1. **Customize**: Edit subjects, exam boards, etc.
2. **Deploy**: Use Vercel (frontend) + Heroku (backend)
3. **Production**: Use real Stripe keys, not test keys
4. **Security**: Use strong JWT_SECRET, enable HTTPS
5. **Analytics**: Add Google Analytics
6. **Email**: Add email notifications on subscription

## 9. Production Checklist

Before going live:
- [ ] Use production Stripe keys
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Use PostgreSQL on managed hosting (not localhost)
- [ ] Set up proper error logging
- [ ] Add rate limiting
- [ ] Backup database regularly
- [ ] Test Stripe webhooks on production
- [ ] Add CSRF protection
- [ ] Set up SSL certificate

## Need Help?

Check these files:
- `README.md` - Full documentation
- `server/index.js` - Backend setup
- `client/src/App.jsx` - Frontend setup
- `.env.example` - Environment template

---

**You're all set! Happy coding! 🚀**
