# Deployment Guide

This guide covers deploying Science Revision Pro to production.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Heroku)](#backend-deployment-heroku)
4. [Database Setup (PostgreSQL)](#database-setup-postgresql)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

- [ ] All code committed and pushed to Git
- [ ] No console.log statements in production code
- [ ] All environment variables configured
- [ ] Database backups created
- [ ] Stripe production keys obtained (not test)
- [ ] OpenAI API account has sufficient credits
- [ ] HTTPS certificate ready
- [ ] Domain name registered and configured
- [ ] CDN setup (optional, for performance)
- [ ] Error tracking service configured (optional)
- [ ] Email service configured (optional)
- [ ] Backup strategy documented
- [ ] Monitoring alerts configured

---

## Frontend Deployment (Vercel)

### Option 1: Deploy via Git (Recommended)

#### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/science-revision.git
git push -u origin main
```

#### Step 2: Connect Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub account
3. Click "Import Project"
4. Select your repository
5. Click "Import"

#### Step 3: Configure Build Settings
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/dist`
- **Environment Variables**: (see next section)

#### Step 4: Deploy
Click "Deploy" - Vercel will automatically build and deploy

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to connect GitHub
```

### Frontend Environment Variables

In Vercel dashboard, add:
```
VITE_API_URL=https://your-backend-domain.com/api
```

### Custom Domain

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Update DNS records pointing to Vercel
4. Wait for DNS propagation (5-48 hours)

---

## Backend Deployment (Heroku)

### Prerequisites
- Heroku account: https://signup.heroku.com
- Heroku CLI: `npm install -g heroku`

### Step 1: Create Heroku App
```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Or link to existing app
heroku git:remote -a your-app-name
```

### Step 2: Add PostgreSQL Database
```bash
# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0

# View database URL (automatically set as DATABASE_URL)
heroku config:get DATABASE_URL
```

### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your_super_secret_key_minimum_32_chars"
heroku config:set STRIPE_SECRET_KEY="sk_live_your_production_key"
heroku config:set STRIPE_PUBLISHABLE_KEY="pk_live_your_production_key"
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_your_production_secret"
heroku config:set OPENAI_API_KEY="sk_your_openai_key"
heroku config:set CLIENT_URL="https://your-frontend-domain.com"
heroku config:set PORT=5000
```

### Step 4: Create Procfile
```
web: node server/index.js
```

Save in root directory.

### Step 5: Update package.json
```json
{
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "start": "node server/index.js",
    "postinstall": "echo 'Build complete'"
  }
}
```

### Step 6: Deploy
```bash
# Push to Heroku
git push heroku main

# View logs
heroku logs --tail

# Initialize database
heroku run node server/seed.js
```

### Step 7: Verify Deployment
```bash
# Test API health check
curl https://your-app-name.herokuapp.com/api/health

# Should return: {"status":"ok"}
```

---

## Database Setup (PostgreSQL)

### Option 1: Heroku PostgreSQL (Included above)

Automatically created and managed by Heroku.

### Option 2: Amazon RDS

1. Go to AWS RDS Console
2. Click "Create database"
3. Select PostgreSQL
4. Configure:
   - Instance class: db.t3.micro (free tier)
   - Allocated storage: 20 GB
   - DB name: flashcard_db
   - Master username: postgres
5. Note the endpoint
6. Add security group rule for Heroku IP
7. Add DATABASE_URL to Heroku config

### Option 3: DigitalOcean PostgreSQL

1. Go to DigitalOcean Console
2. Create managed PostgreSQL cluster
3. Get connection string
4. Add DATABASE_URL to Heroku config

### Database Initialization

On Heroku:
```bash
heroku run node server/seed.js
```

This will:
- Create all tables
- Seed demo users
- Initialize database schema

---

## Environment Configuration

### Production Environment Variables

Create `server/.env.production` (never commit):

```bash
# Database (from PostgreSQL host)
DATABASE_URL=postgresql://user:password@db-host:5432/flashcard_db

# JWT (use strong random key)
JWT_SECRET=your_production_secret_minimum_32_characters_use_openssl_rand_hex_32

# Stripe (use LIVE keys, not test)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# OpenAI
OPENAI_API_KEY=sk_your_openai_key

# Environment
NODE_ENV=production
PORT=5000 (set by Heroku)

# Frontend
CLIENT_URL=https://your-frontend-domain.com
```

### Generate Strong JWT Secret

```bash
# macOS/Linux
openssl rand -hex 32

# Windows (PowerShell)
[convert]::ToHexString((1..32 | ForEach-Object {Get-Random -Max 256}))
```

### Verify Production Keys

1. **Stripe**: Dashboard shows "Live" toggle ON
2. **OpenAI**: Account shows production environment
3. **JWT_SECRET**: Minimum 32 characters, no spaces
4. **DATABASE_URL**: Correct host/port/credentials

---

## Post-Deployment Verification

### Test Sign Up
```bash
curl -X POST https://your-api.herokuapp.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

### Test Login
```bash
curl -X POST https://your-api.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Frontend
1. Open https://your-frontend-domain.com
2. Sign up
3. Log in
4. Try flashcard generation
5. Check dashboard loads

### Test Stripe Integration
1. Try clicking "Upgrade"
2. Go through checkout with test card
3. Payment should succeed
4. User should become subscribed
5. Check dashboard - subscription status updated

### Test Webhooks
In Stripe Dashboard:
1. Go to Webhooks
2. Add production endpoint: `https://your-api.herokuapp.com/api/subscription/webhook`
3. Select events (same as dev)
4. Send test event
5. Check Heroku logs for webhook received

### Test OpenAI Integration
1. Generate flashcards
2. Check Heroku logs for API calls
3. Verify flashcards display correctly

### Test Database
```bash
# Check Heroku database connection
heroku pg:info

# Open PostgreSQL prompt
heroku pg:psql

# Check tables
\dt

# Exit
\q
```

---

## Monitoring & Maintenance

### Heroku Monitoring

#### View Logs
```bash
heroku logs --tail
heroku logs --tail --dyno web
heroku logs -n 100  # Last 100 lines
```

#### Check Resource Usage
```bash
heroku ps
heroku metrics
```

#### Scaling (if needed)
```bash
# Scale web dyno
heroku ps:scale web=2

# Check current state
heroku ps
```

### Database Monitoring

```bash
# Check database size
heroku pg:info

# View slow queries
heroku pg:outliers

# See total connections
heroku pg:connections
```

### Backup Strategy

#### Automatic Backups
Heroku PostgreSQL creates automatic backups every day.

#### Manual Backup
```bash
# Create backup
heroku pg:backups:capture

# List backups
heroku pg:backups

# Restore from backup
heroku pg:backups:restore b002 DATABASE_URL
```

### Error Tracking (Optional)

Add Sentry for error tracking:
```bash
npm install @sentry/node

# In server/index.js
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: "your_sentry_dsn",
  environment: process.env.NODE_ENV
});
```

### Performance Monitoring

1. **NewRelic**: `heroku addons:create newrelic:wayne`
2. **Datadog**: `heroku addons:create datadog:trial`
3. **Scout**: `heroku addons:create scout:free`

### Email Notifications (Optional)

For password resets, subscription notifications:
```bash
npm install nodemailer

# Configure in .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## Troubleshooting Deployment

### App Won't Start

```bash
# Check logs
heroku logs --tail

# Common issues:
# - Missing environment variables
# - Database connection issue
# - Wrong Node version

# Check buildpack
heroku buildpacks
```

### Database Connection Error

```bash
# Verify DATABASE_URL
heroku config:get DATABASE_URL

# Test connection
heroku pg:psql

# Check if tables exist
heroku pg:psql << EOF
\dt
EOF
```

### Stripe Webhook Not Working

1. Verify webhook endpoint in Stripe Dashboard
2. Check Heroku logs for errors
3. Ensure signing secret is correct
4. Test with Stripe CLI:
```bash
stripe listen --forward-to your-api.herokuapp.com/api/subscription/webhook
```

### OpenAI API Errors

1. Verify API key is valid
2. Check account has credits
3. Monitor API usage on OpenAI website
4. Check rate limits haven't been exceeded

### CORS Issues

1. Verify CLIENT_URL is set correctly in backend
2. Check frontend is making requests to correct API URL
3. Test API endpoint directly in browser

---

## Scaling for Production

### Database Performance
```bash
# Add indexes
heroku pg:psql << EOF
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX idx_progress_user_id ON progress_tracking(user_id);
EOF
```

### Caching (Redis)
```bash
# Add Redis add-on
heroku addons:create heroku-redis:premium-0

# Install in backend
npm install redis

# Use for caching quiz/flashcard data
```

### Load Balancing
```bash
# Scale to multiple dynos
heroku ps:scale web=3
```

### CDN
Use Vercel's built-in CDN for frontend or add CloudFlare.

---

## Security Checklist

- [ ] HTTPS enabled (automatic with Vercel/Heroku)
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] API keys not in version control (.gitignore)
- [ ] Database passwords strong
- [ ] Stripe webhook secret correct
- [ ] CORS limited to frontend domain
- [ ] Rate limiting enabled (TODO)
- [ ] SQL injection protection (pg library handles)
- [ ] XSS protection (React handles)
- [ ] CSRF protection (TODO)
- [ ] Environment variables not logged
- [ ] HTTPS redirect enabled

---

## Domain Setup

### Update Frontend URL
```bash
# On Vercel dashboard
1. Domains → Add Domain
2. Point DNS records to Vercel
3. Update VITE_API_URL in environment
```

### Update Backend URL
```bash
# On Heroku
1. Settings → Domains
2. Add custom domain
3. Get the target domain (*.herokuapp.com)
4. Point DNS to target
5. Update Stripe webhook endpoint
6. Update CLIENT_URL in .env
```

### DNS Records

```
Type: CNAME
Name: api
Value: your-app-name.herokuapp.com

Type: CNAME
Name: www (or @)
Value: cname.vercel-dns.com
```

---

## Cost Estimation (Monthly)

- **Vercel Frontend**: $0-20 (free tier available)
- **Heroku Backend**: $50+ (standard-0 PostgreSQL)
- **OpenAI API**: Varies (typically $5-20 for this usage)
- **Stripe**: 2.2% + £0.20 per transaction
- **Domain**: $10-15 per year

**Total**: Approximately $60-100/month for full production

---

## Maintenance Tasks

### Weekly
- [ ] Check error logs
- [ ] Monitor database size
- [ ] Verify Stripe webhooks working

### Monthly
- [ ] Create database backup
- [ ] Update dependencies
- [ ] Review performance metrics
- [ ] Check API usage/costs

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Update Node.js version if needed
- [ ] Review scaling needs

---

## Support & Help

- **Vercel Docs**: https://vercel.com/docs
- **Heroku Docs**: https://devcenter.heroku.com
- **PostgreSQL**: https://www.postgresql.org/docs
- **Stripe Support**: https://support.stripe.com
- **OpenAI Docs**: https://platform.openai.com/docs

---

**Deployment complete! Your app is now live. 🚀**
