# Troubleshooting Guide

Quick solutions to common issues.

---

## Installation & Setup

### "npm command not found"
**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Then verify installation
node --version
npm --version
```

### "createdb: command not found"
**Solution:**
```bash
# Install PostgreSQL from https://www.postgresql.org/download/
# On macOS:
brew install postgresql
# Then verify
psql --version
```

### "ECONNREFUSED 127.0.0.1:5432"
**Solution:**
```bash
# PostgreSQL not running
# Start it:
brew services start postgresql
# Or on Windows, start PostgreSQL service
```

### "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Database Issues

### "error: database "flashcard_db" does not exist"
**Solution:**
```bash
# Create database
createdb flashcard_db

# Or use PostgreSQL GUI (pgAdmin)
```

### "FATAL: role "user" does not exist"
**Solution:**
```bash
# Check your DATABASE_URL in .env
# Should be: postgresql://username:password@localhost:5432/flashcard_db

# Get your username:
whoami

# Connect with correct credentials:
psql -U postgres -c "CREATE DATABASE flashcard_db"
```

### "Permission denied" on database
**Solution:**
```bash
# Reset PostgreSQL password
sudo -u postgres psql << EOF
ALTER USER postgres WITH PASSWORD 'newpassword';
EOF

# Update DATABASE_URL with new password
```

### "Relation 'users' does not exist"
**Solution:**
```bash
# Database wasn't initialized
# Run seed script
node server/seed.js

# Or manually initialize
node -e "import('./server/schema.js').then(m => m.initializeDatabase())"
```

---

## Server Issues

### "Error: listen EADDRINUSE :::5000"
**Solution:**
```bash
# Port 5000 is already in use
# Option 1: Kill process
lsof -i :5000
kill -9 <PID>

# Option 2: Change port in .env
PORT=5001
```

### "Cannot find module 'express'"
**Solution:**
```bash
cd server
npm install
cd ..
```

### "OPENAI_API_KEY is not set"
**Solution:**
```bash
# Add to server/.env
OPENAI_API_KEY=sk_your_key_here

# Restart server
npm run dev
```

### "OpenAI API Error: 401 Unauthorized"
**Solution:**
```bash
# Check API key is valid
# Verify at https://platform.openai.com/api-keys

# Check account has credits
# Verify billing at https://platform.openai.com/account/billing/overview

# Ensure no extra spaces in key
OPENAI_API_KEY=sk_... (no spaces)
```

### "OpenAI API Error: 429 Rate Limited"
**Solution:**
```bash
# You're hitting rate limits
# Wait a few minutes
# Or upgrade OpenAI account

# Check usage: https://platform.openai.com/account/usage/overview
```

### "Stripe: Invalid API Key"
**Solution:**
```bash
# Verify keys in server/.env:
# STRIPE_SECRET_KEY=sk_test_xxx
# STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Check they're test keys (sk_test_)
# Get from https://dashboard.stripe.com/apikeys
# Make sure "Test mode" is ON
```

---

## Frontend Issues

### "Module not found: vite"
**Solution:**
```bash
cd client
npm install
cd ..
```

### "Port 5173 already in use"
**Solution:**
```bash
# Kill process
lsof -i :5173
kill -9 <PID>

# Or use different port
# Edit client/vite.config.js
// server: { port: 5174 }
```

### "VITE_API_URL is not defined"
**Solution:**
```bash
# Frontend doesn't need .env
# API URL is in client/src/api.js
// const API_URL = '/api'
# Routes through Vite proxy
```

### "Cannot POST /api/auth/signup"
**Solution:**
```bash
# Backend not running
# Check:
1. Terminal 1: npm run dev (backend on 5000)
2. Terminal 2: npm run dev (in /client)

# Or check backend is accessible:
curl http://localhost:5000/api/health
```

### "Blank page / Nothing loads"
**Solution:**
```bash
# Check browser console (F12)
# Common issues:
1. Backend not running
2. Backend responds with error
3. API_URL wrong in api.js
4. Build failed

# Clear cache
# Hard refresh: Ctrl+Shift+R or Cmd+Shift+R
```

### "Tailwind styles not loading"
**Solution:**
```bash
cd client
npm install tailwindcss postcss autoprefixer

# Check tailwind.config.js has correct paths
# content: ["./index.html", "./src/**/*.{js,jsx}"]

# Restart dev server
```

---

## Authentication Issues

### "Invalid credentials"
**Solution:**
```bash
# Wrong email or password
# Try demo account:
Email: student@example.com
Password: demo123

# Or create new account
```

### "Token expired"
**Solution:**
```bash
# Log out and log in again
# Tokens last 30 days

# Or clear localStorage and refresh
```

### "401 Unauthorized"
**Solution:**
```bash
# Token missing or invalid
# Check localStorage in DevTools:
1. F12 → Application → LocalStorage
2. Should have 'token' key
3. If missing, log in again
```

### "Cannot get /auth/me"
**Solution:**
```bash
# Backend not running
# Or missing token header

# Frontend sends:
Authorization: Bearer <token>

# Check API client in src/api.js
# Should have interceptor
```

---

## Flashcard Generation Issues

### "Failed to generate flashcards"
**Solution:**
```bash
# Check OpenAI API:
1. Valid key in .env?
2. Account has credits?
3. Rate limited?

# Check inputs:
1. Subject selected?
2. Topic entered?
3. Exam board selected?

# Check logs:
npm run dev
# Look for error messages
```

### "Daily flashcard limit reached"
**Solution:**
```bash
# Free users: 1 generation per day
# This is working as intended

# Options:
1. Wait until tomorrow (UTC)
2. Upgrade to premium
3. Create new account for testing
```

### "Permission denied" on premium features
**Solution:**
```bash
# User not subscribed
# This is working as intended

# Options:
1. Complete payment on Stripe
2. Use premium test account:
   Email: premium@example.com
   Password: demo123
```

---

## Stripe Issues

### "Failed to create checkout session"
**Solution:**
```bash
# Check .env:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Keys should start with:
# sk_test_ (secret)
# pk_test_ (public)

# Get from https://dashboard.stripe.com/apikeys
```

### "Webhook signature verification failed"
**Solution:**
```bash
# Check webhook secret:
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Get from Stripe Dashboard:
1. Developers → Webhooks
2. Click webhook endpoint
3. Copy "Signing secret"

# Webhook endpoint should be:
http://localhost:5000/api/subscription/webhook
```

### "Stripe test payment not working"
**Solution:**
```bash
# Use correct test card:
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)

# Or try:
Card: 5555 5555 5555 4444
Expiry: Any future date
CVC: Any 3 digits
```

### "Payment succeeded but user not subscribed"
**Solution:**
```bash
# Webhook not working
# Check:
1. Endpoint is public (not localhost)
2. Signing secret is correct
3. Events selected: customer.subscription.created

# For development, test locally:
npm install -g stripe
stripe listen --forward-to http://localhost:5000/api/subscription/webhook

# Check logs:
heroku logs --tail
```

---

## API Issues

### "401: No token provided"
**Solution:**
```bash
# Authorization header missing
# Frontend should send:
Authorization: Bearer <token>

# Check in DevTools:
1. F12 → Network
2. Click request
3. Check Headers
4. Should have Authorization header
```

### "403: Premium feature required"
**Solution:**
```bash
# User not subscribed
# This is working as intended

# To fix:
1. Subscribe through Stripe
2. Or use premium test account
```

### "404: Not found"
**Solution:**
```bash
# Endpoint doesn't exist
# Check:
1. URL spelling
2. Backend running on :5000
3. Route exists in server/routes/

# Test:
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}
```

### "500: Internal server error"
**Solution:**
```bash
# Server error - check logs
npm run dev

# Look for error message
# Common causes:
1. Database connection failed
2. API key invalid
3. Syntax error in code

# Check:
1. .env file exists and correct
2. PostgreSQL running
3. All dependencies installed
```

---

## Database Query Issues

### "Cannot INSERT into users: Duplicate key"
**Solution:**
```bash
# Email already exists
# Use different email or:
psql flashcard_db
# Check users:
SELECT * FROM users;

# Delete test user:
DELETE FROM users WHERE email='test@example.com';
```

### "Column 'xyz' does not exist"
**Solution:**
```bash
# Table schema outdated
# Reinitialize:
node server/seed.js

# Or manually:
node -e "import('./server/schema.js').then(m => m.initializeDatabase())"
```

### "Foreign key constraint fails"
**Solution:**
```bash
# Deleting user but flashcards still exist
# Solution: Cascade delete is enabled
# Just delete the user, flashcards will delete too
```

---

## Performance Issues

### "App loads slowly"
**Solution:**
```bash
# Check:
1. Backend responding? 
   curl http://localhost:5000/api/health
2. Database connected?
   psql flashcard_db
3. OpenAI API slow?
   Check OpenAI status page

# Optimization:
1. Use local database (not remote)
2. Restart dev servers
3. Clear browser cache
```

### "Quiz generation takes long time"
**Solution:**
```bash
# OpenAI API can take 5-10 seconds
# This is normal

# Optimize:
1. Use gpt-3.5-turbo (faster, cheaper)
2. Reduce question count
3. Add timeout handling
```

---

## Browser Issues

### "Blank page in browser"
**Solution:**
```bash
# Check browser console (F12)
# Common errors:
1. "Cannot GET /" → Check frontend built
2. "CORS error" → Backend not running
3. "Failed to fetch" → API unreachable

# Try:
1. Hard refresh: Ctrl+Shift+R
2. Clear cache: Ctrl+Shift+Delete
3. Check DevTools → Network tab
```

### "Styles not loading"
**Solution:**
```bash
# Tailwind CSS not compiled
cd client
npm install
npm run dev

# Check index.html has:
<script type="module" src="/src/main.jsx"></script>
```

### "Cannot read property 'token'"
**Solution:**
```bash
# JWT token issue
# Check localStorage:
1. F12 → Application → localStorage
2. Should have 'token' key
3. If missing, log in again
```

---

## Git & Version Control

### "Git merge conflicts"
**Solution:**
```bash
# Resolve conflicts manually
git status

# Edit conflicted files
# Keep desired changes

git add .
git commit -m "Resolve conflicts"
```

### ".env file in git"
**Solution:**
```bash
# Remove if accidentally committed:
git rm --cached server/.env
git commit -m "Remove .env from tracking"

# Ensure .gitignore has:
.env
.env.local
node_modules/
```

---

## Deployment Issues

### "Heroku build fails"
**Solution:**
```bash
# Check Heroku logs:
heroku logs --tail

# Common issues:
1. Missing environment variables
2. Database URL incorrect
3. Node version mismatch

# Set variables:
heroku config:set VAR=value
```

### "Vercel deployment fails"
**Solution:**
```bash
# Check build logs in Vercel dashboard
# Common issues:
1. Wrong build command
2. Missing dependencies
3. Environment variables

# Build command should be:
npm run build
# Or if in subdirectory:
cd client && npm run build
```

### "Cold start on Heroku"
**Solution:**
```bash
# Normal - first request after idle takes longer
# This is expected on free tier

# To improve:
1. Upgrade dyno (costs more)
2. Use third-party monitoring (keeps warm)
3. Accept cold start (5-10 seconds)
```

---

## Getting More Help

1. **Check Logs**: Run `npm run dev` and watch for errors
2. **Browser Console**: F12 → Console tab
3. **Documentation**: Read FEATURES.md and API_REFERENCE.md
4. **Google**: Error message + "node" or "react"
5. **Stack Overflow**: Tag with [node.js], [react], [stripe]
6. **GitHub Issues**: Search in relevant repos

---

## Performance Checklist

- [ ] Backend running? (`npm run dev:server`)
- [ ] Frontend running? (`npm run dev:client`)
- [ ] Database running? (`brew services start postgresql`)
- [ ] .env variables set? (all required keys present)
- [ ] localhost:5000 accessible?
- [ ] localhost:5173 loads?
- [ ] Sign up/login working?
- [ ] Flashcards generating?
- [ ] Dashboard updating?

---

## Common Gotchas

1. **Port Already in Use**: Port 5000 or 5173 in use → Change port
2. **Wrong Database**: Using wrong database → Check DATABASE_URL
3. **API Key Wrong**: API calls failing → Check keys have no spaces
4. **Token Missing**: Can't access endpoints → Log in again
5. **Stripe Test Mode**: Production keys won't work on localhost → Use test keys
6. **Case Sensitivity**: "Biology" ≠ "biology" → Check exact spelling
7. **Timezone Issues**: Daily resets use UTC → Account for time zone
8. **CORS Errors**: Backend returning error → Check CLIENT_URL matches frontend
9. **Async/Await**: Mixing promises and await → Await all API calls
10. **Environment Reload**: Changed .env → Restart dev server

---

## Quick Debug Steps

```bash
# 1. Check all services running
ps aux | grep node
ps aux | grep postgres

# 2. Test backend
curl http://localhost:5000/api/health

# 3. Check database
psql flashcard_db -c "SELECT * FROM users;"

# 4. Check environment
cat server/.env

# 5. View server logs
npm run dev:server

# 6. View frontend logs
# F12 in browser → Console

# 7. Check network requests
# F12 → Network tab
```

---

**Most issues are solved by restarting the dev server!**

```bash
# Stop all terminals: Ctrl+C
# Clear cache: npm cache clean --force
# Reinstall: npm install
# Restart: npm run dev
```

Good luck! 🚀
