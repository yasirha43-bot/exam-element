# Feature Documentation

## Table of Contents
1. [User Accounts & Authentication](#user-accounts--authentication)
2. [Subscription System](#subscription-system)
3. [Flashcard Generation](#flashcard-generation)
4. [Quiz Generator](#quiz-generator)
5. [Mock Exam Generator](#mock-exam-generator)
6. [Progress Dashboard](#progress-dashboard)
7. [Paywall & Access Control](#paywall--access-control)

---

## User Accounts & Authentication

### Overview
Complete user authentication system with secure password storage and JWT tokens.

### Features
- ✅ User signup with email validation
- ✅ Secure login with password hashing (bcryptjs)
- ✅ JWT token-based sessions (30-day expiry)
- ✅ Automatic logout
- ✅ User profile tracking

### User Data Stored
```javascript
{
  id: 1,
  email: "user@example.com",
  password_hash: "bcrypt_hashed",
  first_name: "John",
  last_name: "Doe",
  is_subscribed: false,
  stripe_customer_id: "cus_xxx",
  stripe_subscription_id: "sub_xxx",
  daily_flashcard_count: 0,
  daily_flashcard_reset_date: "2024-01-15",
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-15T14:30:00Z"
}
```

### Sign Up Flow
1. User enters email, password, first name, last name
2. Backend checks email doesn't already exist
3. Password is hashed with bcryptjs (10 rounds)
4. User record created in database
5. JWT token generated
6. Token stored in localStorage
7. Redirected to dashboard

### Login Flow
1. User enters email and password
2. User looked up in database
3. Password compared with hash
4. JWT token generated
5. Token stored in localStorage
6. Redirected to dashboard

### Security
- Passwords never stored in plain text
- JWT tokens signed with secret key
- Tokens expire after 30 days
- HTTPS required in production
- CORS enabled for frontend origin only

---

## Subscription System

### Overview
Stripe-integrated payment system with automatic subscription management.

### Pricing
- **Monthly Subscription**: £4.99/month
- **Billing**: Monthly recurring charge
- **Currency**: GBP (British Pounds)
- **Test Mode**: Available for development

### Subscription States
```
Free User → clicks "Upgrade" → Stripe Checkout → Payment Success → Subscribed User
   ↓                                                                        ↓
   • 1 flashcard gen/day                                    • Unlimited features
   • Premium features locked                               • Full quiz access
                                                          • Full mock exam access
```

### Stripe Integration

#### Checkout Process
1. User clicks "Upgrade" button
2. Frontend calls `/api/subscription/create-checkout-session`
3. Server creates Stripe Customer (if needed)
4. Server creates Checkout Session
5. Frontend redirects to Stripe Checkout
6. User enters card details
7. Stripe processes payment
8. Webhook notifies backend
9. User marked as subscribed
10. Redirected to dashboard

#### Webhook Events Handled
```
customer.subscription.created  → Set is_subscribed = TRUE
customer.subscription.updated  → Update subscription status
customer.subscription.deleted  → Set is_subscribed = FALSE
invoice.payment_failed        → Set is_subscribed = FALSE
```

### Test Cards
```
Successful Payment: 4242 4242 4242 4242
Declined:           4000 0000 0000 0002
Auth Required:      4000 2500 0000 3155
Expiry:             Any future date (e.g., 12/25)
CVC:                Any 3 digits (e.g., 123)
```

### Database Schema
```sql
-- Users subscription fields
stripe_customer_id      -- Stripe customer ID
stripe_subscription_id  -- Current subscription ID
is_subscribed          -- Boolean flag

-- Events table
subscription_events    -- Log of all subscription changes
```

### Subscription Lifecycle
```
1. New User Signs Up
   └─ is_subscribed = FALSE
   └─ stripe_customer_id = NULL

2. User Clicks Upgrade
   └─ Create Stripe Customer
   └─ Create Checkout Session
   └─ Redirect to Stripe

3. Payment Successful
   └─ Stripe Webhook triggered
   └─ is_subscribed = TRUE
   └─ stripe_subscription_id = "sub_xxx"

4. Monthly Renewal
   └─ Stripe charges customer
   └─ Webhook: customer.subscription.updated

5. User Cancels
   └─ Customer cancels in Stripe
   └─ Webhook: customer.subscription.deleted
   └─ is_subscribed = FALSE

6. Payment Fails
   └─ Webhook: invoice.payment_failed
   └─ is_subscribed = FALSE
   └─ User notified to update payment
```

---

## Flashcard Generation

### Overview
AI-powered flashcard generation using OpenAI GPT-3.5-turbo.

### Features
- ✅ Generate flashcards on any topic
- ✅ Multiple exam boards (AQA, OCR, Edexcel)
- ✅ All three sciences (Biology, Chemistry, Physics)
- ✅ Include explanations
- ✅ Track correct/incorrect answers
- ✅ Daily limit for free users

### Generation Parameters
```javascript
{
  subject: "Biology",           // Required
  topic: "Photosynthesis",      // Required
  examBoard: "AQA",             // Required
  count: 5                      // Optional, default 5
}
```

### AI Prompt Structure
```
"Generate 5 GCSE/A-Level flashcards for Biology on the topic 
'Photosynthesis' (AQA exam board).

Format each flashcard as JSON with:
- question: "..."
- answer: "..."
- explanation: "..."

Return a JSON array of flashcards. Make sure questions are 
appropriate for GCSE/A-Level level."
```

### Generated Flashcard Example
```json
{
  "question": "What is photosynthesis?",
  "answer": "Process by which plants convert light energy into chemical energy stored in glucose",
  "explanation": "Occurs in chloroplasts, requires light, water, and carbon dioxide, produces glucose and oxygen"
}
```

### Daily Limit System
```
Free Users:   1 generation per day, max 5 cards per generation
Paid Users:   Unlimited generations, up to 20 cards per generation

Reset: Daily at 00:00 UTC
Tracking:     daily_flashcard_count, daily_flashcard_reset_date in users table
```

### Flashcard Storage
```javascript
{
  id: 1,
  user_id: 5,
  subject: "Biology",
  exam_board: "AQA",
  topic: "Photosynthesis",
  question: "What is photosynthesis?",
  answer: "Process by which plants convert...",
  explanation: "Detailed explanation...",
  created_at: "2024-01-15T10:00:00Z"
}
```

### Review Tracking
```javascript
// flashcard_reviews table
{
  id: 1,
  user_id: 5,
  flashcard_id: 1,
  is_correct: true,
  reviewed_at: "2024-01-15T10:05:00Z"
}
```

### Flashcard UI Flow
1. Select subject, exam board, topic
2. Choose number of cards (1-5 for free, 1-20 for paid)
3. Click "Generate"
4. AI generates flashcards
5. Frontend displays one at a time
6. User marks as correct/incorrect
7. Progress saved
8. Move to next card
9. Quiz complete

### Performance Calculation
```javascript
// For analytics
correct_answers / total_reviews * 100 = percentage

// Topics with <50% are marked as "weak topics"
avg_quiz_score < 50 → add to weak topics list
```

---

## Quiz Generator

### Overview
AI-generated multiple-choice questions with automatic scoring.

### Features
- ✅ Generate 5-20 MCQs on any topic
- ✅ Exam board specific
- ✅ GCSE/A-Level appropriate
- ✅ Automatic scoring
- ✅ Review answers with explanations
- ✅ Premium feature (subscription required)

### Generation Parameters
```javascript
{
  subject: "Chemistry",
  topic: "Chemical Bonding",
  examBoard: "OCR",
  count: 10              // 5-20 questions
}
```

### Generated Quiz Structure
```json
{
  "question": "What type of bond forms between two non-metal atoms?",
  "options": {
    "A": "Ionic bond",
    "B": "Covalent bond",
    "C": "Metallic bond",
    "D": "Hydrogen bond"
  },
  "correctAnswer": "B",
  "marks": 1
}
```

### Quiz Storage
```javascript
// quizzes table
{
  id: 5,
  user_id: 3,
  subject: "Chemistry",
  exam_board: "OCR",
  topic: "Chemical Bonding",
  title: "Chemistry - Chemical Bonding Quiz",
  created_at: "2024-01-15T10:00:00Z"
}

// quiz_questions table
{
  id: 1,
  quiz_id: 5,
  question_number: 1,
  question: "What type of bond...",
  option_a: "Ionic bond",
  option_b: "Covalent bond",
  option_c: "Metallic bond",
  option_d: "Hydrogen bond",
  correct_answer: "B",
  marks: 1
}
```

### User Responses
```javascript
// quiz_responses table
{
  id: 1,
  quiz_id: 5,
  user_id: 3,
  question_id: 1,
  user_answer: "B",
  is_correct: true,
  submitted_at: "2024-01-15T10:10:00Z"
}
```

### Scoring Calculation
```javascript
Total Marks = Sum of all marks
Earned Marks = Sum of marks where is_correct = TRUE
Percentage = (Earned Marks / Total Marks) * 100

Example:
- 10 questions × 1 mark each = 10 total marks
- 8 correct answers = 8 earned marks
- 8 / 10 * 100 = 80%
```

### Quiz UI Flow
1. Select subject, topic, exam board
2. Choose number of questions (5-20)
3. Click "Generate Quiz"
4. Display one question at a time
5. Allow navigation between questions
6. Submit all answers
7. Show score and percentage
8. Display detailed results with correct answers
9. Save to progress tracking

---

## Mock Exam Generator

### Overview
Full-length practice exams with realistic GCSE/A-Level questions.

### Features
- ✅ Generate 5-8 questions per exam
- ✅ Mix of short and long-form questions
- ✅ Total marks: 50 (typical)
- ✅ Sample answers for marking guidance
- ✅ User marks own responses
- ✅ Premium feature (subscription required)

### Generation Parameters
```javascript
{
  subject: "Physics",
  examLevel: "GCSE",     // or "A-Level"
  examBoard: "Edexcel"
}
```

### Generated Exam Structure
```json
{
  "title": "Physics GCSE Paper 1",
  "totalMarks": 50,
  "questions": [
    {
      "number": 1,
      "text": "A student investigates the relationship between...",
      "type": "short-answer",
      "marks": 3,
      "sampleAnswer": "Student should have measured time taken for ball to fall and calculated acceleration..."
    },
    {
      "number": 2,
      "text": "Discuss the advantages and disadvantages of renewable energy...",
      "type": "long-answer",
      "marks": 6,
      "sampleAnswer": "Advantages: renewable, clean, etc. Disadvantages: intermittent, space required, etc."
    }
  ]
}
```

### Exam Storage
```javascript
// mock_exams table
{
  id: 3,
  user_id: 3,
  subject: "Physics",
  exam_board: "Edexcel",
  exam_level: "GCSE",
  title: "Physics GCSE Mock",
  total_marks: 50,
  user_score: 35,
  percentage: 70,
  created_at: "2024-01-15T10:00:00Z"
}

// mock_exam_questions table
{
  id: 1,
  mock_exam_id: 3,
  question_number: 1,
  question_text: "A student investigates...",
  question_type: "short-answer",
  marks: 3,
  sample_answer: "Student should have measured...",
  user_answer: "They measured time using a stopwatch...",
  marks_awarded: 2
}
```

### Marking Process
1. User attempts all questions
2. Backend stores user's answers
3. Frontend shows results page
4. Displays model answer alongside user answer
5. Student can award themselves marks (or teacher does)
6. Total score calculated
7. Percentage calculated
8. Saved to progress tracking

### Mock Exam UI Flow
1. Select subject, level (GCSE/A-Level), exam board
2. Click "Generate Mock Exam"
3. Display exam title and total marks
4. Show one question at a time
5. User types answer in text area
6. Allow navigation between questions
7. Submit exam
8. Show score and percentage
9. Display detailed results with:
   - User answer
   - Model answer
   - Marks awarded / total marks
   - Question breakdown

---

## Progress Dashboard

### Overview
Comprehensive analytics and progress tracking system.

### Dashboard Summary
Shows at a glance:
- Total flashcards generated
- Quiz completion count & average score
- Mock exam count & average score
- Subscription status (Free/Premium)

### Key Metrics
```javascript
{
  flashcardsGenerated: 25,
  quizzes: {
    count: 5,
    averageScore: 76
  },
  mockExams: {
    count: 2,
    averageScore: 68,
    highestScore: 75
  },
  subscription: "Premium"
}
```

### Weak Topics Detection
Identifies topics where user struggles:
```javascript
{
  topic: "Photosynthesis",
  subject: "Biology",
  avg_quiz_score: 45,      // Below 50% threshold
  avg_mock_score: 52
}
```

Criteria: Any topic with avg score < 50% is flagged

### Analytics by Subject
For each subject (Biology, Chemistry, Physics):
- Topics studied
- Flashcards per topic
- Quiz performance per topic
- Mock exam performance per topic

### Performance Over Time
- Line graphs showing:
  - Average quiz score trend
  - Average mock exam score trend
- Time periods: 7, 14, 30 days
- X-axis: Date
- Y-axis: Percentage (0-100%)

### Performance Tracking Table
```javascript
// progress_tracking table
{
  id: 1,
  user_id: 3,
  subject: "Biology",
  topic: "Photosynthesis",
  flashcards_generated: 10,
  avg_quiz_score: 75,
  avg_mock_score: 70,
  quiz_count: 3,
  mock_count: 1,
  weak_topic: false,
  updated_at: "2024-01-15T10:00:00Z"
}
```

### Dashboard Updates
Real-time updates after:
- Flashcard generation
- Quiz submission
- Mock exam submission

### Subject Breakdown
```javascript
{
  subject: "Biology",
  topics_studied: 5,
  mocks_taken: 2,
  latest_mock_score: 75
}
```

### Analytics Features
- **Performance Trends**: Line chart of scores over time
- **Topic Breakdown**: Table of each topic with stats
- **Recent Activity**: List of quizzes and mocks taken
- **Weak Topics**: Highlighted list of topics needing work
- **Subject Comparison**: See performance across subjects

---

## Paywall & Access Control

### Overview
Subscription-based access control for premium features.

### Access Control Rules

#### Free Users Can:
- ✅ Sign up and log in
- ✅ Generate 1 flashcard set per day (max 5 cards)
- ✅ View basic dashboard
- ✅ See generated flashcards
- ❌ Generate quizzes
- ❌ Generate mock exams
- ❌ View detailed analytics

#### Subscribed Users Can:
- ✅ Everything free users can do
- ✅ Unlimited flashcard generation
- ✅ Generate unlimited quizzes
- ✅ Generate unlimited mock exams
- ✅ View detailed analytics and graphs
- ✅ Weak topic detection

### Paywall Implementation

#### Frontend Checks
```javascript
// Check before rendering
if (!user.is_subscribed) {
  return <SubscriptionModal />;
}
```

#### Backend Checks
```javascript
// Middleware
app.post('/api/quizzes/generate', 
  authMiddleware,
  subscriptionCheckMiddleware,  // ← Blocks free users
  generateQuiz
);
```

#### Middleware Code
```javascript
const subscriptionCheckMiddleware = (req, res, next) => {
  if (!req.user.is_subscribed) {
    return res.status(403).json({
      error: 'Premium feature - subscription required',
      needsSubscription: true
    });
  }
  next();
};
```

### User Experience Flow

#### Free User Tries Premium Feature
1. User on free plan clicks "Quizzes"
2. Modal appears: "Unlock Premium Features"
3. Shows benefits:
   - ✓ Unlimited quizzes
   - ✓ Mock exams
   - ✓ Analytics
4. Displays price: £4.99/month
5. "Upgrade Now" button
6. Or "Not Now" to dismiss

#### Subscription Modal
```javascript
<SubscriptionModal
  isOpen={!user.is_subscribed}
  onClose={() => closeModal()}
  user={user}
/>
```

#### Upgrade Flow
1. User clicks "Upgrade Now"
2. Calls: POST /api/subscription/create-checkout-session
3. Redirects to Stripe checkout
4. User enters payment details
5. Stripe processes payment
6. Webhook updates database
7. User redirected to dashboard
8. Features now unlocked

### Daily Flashcard Limit

#### Tracking
```javascript
// Users table
daily_flashcard_count: 0      // Increments on generation
daily_flashcard_reset_date: "2024-01-15"  // Resets daily
```

#### Check Logic
```javascript
const today = new Date().toISOString().split('T')[0];
if (resetDate !== today) {
  // Reset counter to 0
  daily_flashcard_count = 0;
}

if (!is_subscribed && daily_flashcard_count >= 1) {
  // Return error
  return "Daily limit reached";
}
```

#### Error Response
```javascript
{
  error: "Daily free flashcard limit reached",
  needsSubscription: true,
  limit: 1
}
```

### Protected Routes

#### Frontend Routes
```javascript
<Route
  path="/quizzes"
  element={
    <ProtectedRoute user={user}>
      {user.is_subscribed ? <Quizzes /> : <UpgradePrompt />}
    </ProtectedRoute>
  }
/>
```

#### Backend Routes
```javascript
// Public (free access after auth)
POST   /api/flashcards/generate       ← Limited by daily count
GET    /api/flashcards
GET    /api/dashboard                 ← Basic only
GET    /api/dashboard/history/:subject ← Limited analytics

// Premium (requires subscription)
POST   /api/quizzes/generate          ← subscriptionCheckMiddleware
GET    /api/quizzes/:id
POST   /api/quizzes/:id/submit

POST   /api/mock-exams/generate       ← subscriptionCheckMiddleware
GET    /api/mock-exams/:id
POST   /api/mock-exams/:id/submit

GET    /api/dashboard/analytics/:subject  ← Full analytics
```

---

## Feature Interactions

### Complete User Journey

#### Day 1: New User
1. Signs up → Free plan
2. Generates 1 flashcard set (limit hit for day)
3. Reviews flashcards
4. Tries to access quizzes → Paywall
5. Clicks "Upgrade"
6. Goes through Stripe checkout
7. Becomes subscribed

#### Day 2: Subscribed User
1. Logs in
2. Generates multiple flashcard sets (no limit)
3. Takes multiple quizzes
4. Takes mock exam
5. Reviews progress on dashboard
6. Identifies weak topics
7. Generates more flashcards on weak topics
8. Takes quizzes again on weak topics

---

## Analytics Calculation

### Quiz Performance
```
Per Quiz:
- Correct: number of correct answers
- Total: number of questions
- Score: correct / total * 100

Average:
- avg_quiz_score = SUM(all quiz scores) / COUNT(all quizzes)
```

### Mock Exam Performance
```
Per Exam:
- user_score: marks awarded by user
- total_marks: maximum possible marks
- percentage: user_score / total_marks * 100

Average:
- avg_mock_score = SUM(all percentages) / COUNT(all exams)
```

### Topic Performance
```
Per Topic:
- avg_quiz_score = AVG(all quiz scores for topic)
- avg_mock_score = AVG(all mock percentages for topic)
- is_weak_topic = avg < 50%
```

---

**End of Feature Documentation**
