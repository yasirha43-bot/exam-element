# API Reference

## Base URL
```
http://localhost:5000/api
```

All endpoints except `/auth/signup` and `/auth/login` require:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Sign Up
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response (201):
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_subscribed": false
  }
}
```

### Log In
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_subscribed": false
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "is_subscribed": false,
  "daily_flashcard_count": 0
}
```

---

## Subscription Endpoints

### Create Checkout Session
```
POST /subscription/create-checkout-session
Authorization: Bearer <token>

Response (200):
{
  "sessionId": "cs_test_xxx"
}

Note: Use sessionId with Stripe checkout
```

### Get Subscription Status
```
GET /subscription/status
Authorization: Bearer <token>

Response (200):
{
  "is_subscribed": true
}
```

---

## Flashcard Endpoints

### Generate Flashcards
```
POST /flashcards/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Biology",
  "topic": "Photosynthesis",
  "examBoard": "AQA",
  "count": 5
}

Response (200):
{
  "flashcards": [
    {
      "id": 1,
      "question": "What is photosynthesis?",
      "answer": "Process plants use to convert light...",
      "explanation": "Detailed explanation..."
    }
  ],
  "generated": 5
}

Response (403):
{
  "error": "Daily free flashcard limit reached",
  "needsSubscription": true,
  "limit": 1
}
```

### Get Flashcards
```
GET /flashcards?subject=Biology&topic=Photosynthesis
Authorization: Bearer <token>

Response (200):
[
  {
    "id": 1,
    "subject": "Biology",
    "exam_board": "AQA",
    "topic": "Photosynthesis",
    "question": "...",
    "answer": "...",
    "explanation": "...",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### Review Flashcard
```
POST /flashcards/:flashcardId/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "isCorrect": true
}

Response (200):
{
  "success": true
}
```

### Delete Flashcard
```
DELETE /flashcards/:flashcardId
Authorization: Bearer <token>

Response (200):
{
  "success": true
}
```

---

## Quiz Endpoints

### Generate Quiz
```
POST /quizzes/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Chemistry",
  "topic": "Chemical Bonding",
  "examBoard": "OCR",
  "count": 10
}

Response (200):
{
  "quizId": 5,
  "questions": 10
}

Response (403):
{
  "error": "Premium feature - subscription required",
  "needsSubscription": true
}
```

### Get Quiz
```
GET /quizzes/:quizId
Authorization: Bearer <token>

Response (200):
{
  "quizId": 5,
  "questions": [
    {
      "id": 1,
      "question_number": 1,
      "question": "What is a covalent bond?",
      "option_a": "...",
      "option_b": "...",
      "option_c": "...",
      "option_d": "...",
      "marks": 1
    }
  ]
}
```

### Submit Quiz
```
POST /quizzes/:quizId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "userAnswer": "A"
    },
    {
      "questionId": 2,
      "userAnswer": "B"
    }
  ]
}

Response (200):
{
  "totalMarks": 10,
  "earnedMarks": 8,
  "percentage": 80
}
```

### Get Quiz Results
```
GET /quizzes/:quizId/results
Authorization: Bearer <token>

Response (200):
[
  {
    "question_id": 1,
    "question": "...",
    "user_answer": "A",
    "correct_answer": "A",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "marks": 1,
    "is_correct": true
  }
]
```

---

## Mock Exam Endpoints

### Generate Mock Exam
```
POST /mock-exams/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Physics",
  "examLevel": "GCSE",
  "examBoard": "Edexcel"
}

Response (200):
{
  "mockExamId": 3,
  "title": "Physics GCSE Mock",
  "questions": 6
}
```

### Get Mock Exam
```
GET /mock-exams/:mockExamId
Authorization: Bearer <token>

Response (200):
{
  "mockExamId": 3,
  "title": "Physics GCSE Mock",
  "totalMarks": 50,
  "questions": [
    {
      "id": 1,
      "question_number": 1,
      "question_text": "...",
      "question_type": "short-answer",
      "marks": 3
    }
  ]
}
```

### Submit Mock Exam
```
POST /mock-exams/:mockExamId/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionId": 1,
      "userAnswer": "The speed of light is 3×10⁸ m/s",
      "marksAwarded": 2
    }
  ]
}

Response (200):
{
  "totalMarks": 50,
  "userScore": 35,
  "percentage": 70
}
```

### Get Mock Exam Results
```
GET /mock-exams/:mockExamId/results
Authorization: Bearer <token>

Response (200):
{
  "userScore": 35,
  "totalMarks": 50,
  "percentage": 70,
  "questions": [
    {
      "question_number": 1,
      "question_text": "...",
      "marks": 3,
      "marks_awarded": 2,
      "user_answer": "...",
      "sample_answer": "..."
    }
  ]
}
```

---

## Dashboard Endpoints

### Get Dashboard Summary
```
GET /dashboard
Authorization: Bearer <token>

Response (200):
{
  "flashcardsGenerated": 15,
  "quizzes": {
    "count": 3,
    "averageScore": 75
  },
  "mockExams": {
    "count": 1,
    "averageScore": 70,
    "highestScore": 70
  },
  "weakTopics": [
    {
      "subject": "Biology",
      "topic": "Photosynthesis",
      "avg_quiz_score": 45,
      "avg_mock_score": null
    }
  ],
  "subjectBreakdown": [
    {
      "subject": "Biology",
      "topics_studied": 5,
      "mocks_taken": 1
    }
  ]
}
```

### Get Subject Analytics
```
GET /dashboard/analytics/Biology
Authorization: Bearer <token>

Response (200):
{
  "topics": [
    {
      "topic": "Photosynthesis",
      "flashcards_generated": 5,
      "avg_quiz_score": 80,
      "avg_mock_score": 75,
      "quiz_count": 2,
      "mock_count": 1
    }
  ],
  "recentQuizzes": [...],
  "recentMocks": [...]
}
```

### Get Performance History
```
GET /dashboard/history/Biology?days=30
Authorization: Bearer <token>

Response (200):
[
  {
    "date": "2024-01-01",
    "quizzes": 1,
    "mocks": 0,
    "avg_quiz_score": 80,
    "avg_mock_score": null
  }
]
```

---

## Error Responses

### Unauthorized (401)
```json
{
  "error": "No token provided"
}
```

### Forbidden (403)
```json
{
  "error": "Premium feature - subscription required",
  "needsSubscription": true
}
```

### Not Found (404)
```json
{
  "error": "User not found"
}
```

### Bad Request (400)
```json
{
  "error": "Email already exists"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized (no/invalid token)
- **403** - Forbidden (subscription required)
- **404** - Not Found
- **500** - Server Error

---

## Data Types

### Subjects
- Biology
- Chemistry
- Physics

### Exam Boards
- AQA
- OCR
- Edexcel

### Exam Levels
- GCSE
- A-Level

### Question Types (Mock Exams)
- short-answer
- long-answer
- multi-choice

---

## Rate Limits

Current: No rate limiting implemented
- TODO: Add 100 req/min per user

---

## Testing with cURL

```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","firstName":"John","lastName":"Doe"}'

# Generate flashcards
curl -X POST http://localhost:5000/api/flashcards/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"subject":"Biology","topic":"Photosynthesis","examBoard":"AQA","count":5}'

# Get dashboard
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

---

## Webhooks

### Stripe Events
- `customer.subscription.created` → Set is_subscribed = true
- `customer.subscription.updated` → Update subscription
- `customer.subscription.deleted` → Set is_subscribed = false
- `invoice.payment_failed` → Set is_subscribed = false

---

**Last Updated**: January 2024
