# ProtexxaLearn LMS - Complete API Reference

## 🚀 Phase 3 Complete: All API Routes Live

This document provides comprehensive reference for all API endpoints in the ProtexxaLearn enterprise LMS.

---

## 🔐 Authentication

All endpoints (except SSO callbacks) require JWT authentication via Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

**Get token by logging in:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student"
  }
}
```

---

## 📦 Organizations API

### Create Organization
```http
POST /api/organizations
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Acme University",
  "slug": "acme-u",
  "subdomain": "acme",
  "domain": "acme-university.edu",
  "settings": {
    "timezone": "America/New_York",
    "language": "en"
  },
  "branding": {
    "logoUrl": "https://cdn.example.com/logo.png",
    "primaryColor": "#3b82f6"
  }
}
```

### Get Organization Details
```http
GET /api/organizations/:id
Authorization: Bearer <token>
```

### Update Organization
```http
PATCH /api/organizations/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Acme University (Updated)",
  "status": "active"
}
```

### Create Custom Role
```http
POST /api/organizations/:id/roles
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "content_creator",
  "displayName": "Content Creator",
  "description": "Create and edit course content",
  "permissions": [
    "courses.create",
    "courses.edit_own",
    "content.manage"
  ]
}
```

### Add User to Organization
```http
POST /api/organizations/:id/users
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": 123,
  "roleName": "instructor"
}
```

### Get User Permissions
```http
GET /api/organizations/:id/users/:userId/permissions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "roles": [
    {
      "name": "instructor",
      "displayName": "Instructor"
    }
  ],
  "permissions": [
    "courses.view",
    "courses.edit_own",
    "assignments.grade",
    "discussions.moderate"
  ]
}
```

### Get Organization Analytics
```http
GET /api/organizations/:id/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_users": 1250,
  "total_courses": 45,
  "total_enrollments": 3200,
  "completed_enrollments": 890,
  "avg_quiz_score": 78.5
}
```

### Create Cohort
```http
POST /api/organizations/:id/cohorts
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Spring 2024 Cohort",
  "description": "New student intake for Spring semester",
  "startDate": "2024-01-15",
  "endDate": "2024-05-30"
}
```

### Add Users to Cohort
```http
POST /api/organizations/cohorts/:cohortId/members
Content-Type: application/json
Authorization: Bearer <token>

{
  "userIds": [101, 102, 103, 104]
}
```

### Enroll Cohort in Courses
```http
POST /api/organizations/cohorts/:cohortId/enroll
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseIds": [10, 11, 12]
}
```

---

## 📚 SCORM API

### Upload SCORM Package
```http
POST /api/scorm/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "package": <ZIP file>,
  "courseId": 123
}
```

**Response:**
```json
{
  "success": true,
  "package": {
    "id": 5,
    "title": "Introduction to JavaScript",
    "version": "SCORM 2004",
    "scos": [
      {
        "id": "sco_1",
        "title": "Chapter 1",
        "launchUrl": "index.html"
      }
    ]
  }
}
```

### Get Package Details
```http
GET /api/scorm/packages/:id
Authorization: Bearer <token>
```

### Get Launch URL for SCO
```http
GET /api/scorm/packages/:packageId/launch/:scoId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "launchUrl": "/scorm/packages/5/content/sco_1/index.html"
}
```

### Track SCORM Progress
```http
POST /api/scorm/packages/:packageId/track
Content-Type: application/json
Authorization: Bearer <token>

{
  "scoId": "sco_1",
  "progressData": {
    "cmi.core.lesson_status": "completed",
    "cmi.core.score.raw": "85",
    "cmi.core.session_time": "00:15:30"
  }
}
```

### Get Learner Progress
```http
GET /api/scorm/packages/:packageId/progress
Authorization: Bearer <token>
```

---

## 📊 xAPI (Tin Can) API

### Record xAPI Statement
```http
POST /api/xapi/statements
Content-Type: application/json
Authorization: Bearer <token>

{
  "actor": {
    "mbox": "mailto:john@example.com",
    "name": "John Doe"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "en-US": "completed" }
  },
  "object": {
    "id": "http://example.com/course/123",
    "definition": {
      "name": { "en-US": "JavaScript Fundamentals" },
      "description": { "en-US": "Complete JavaScript course" }
    }
  },
  "result": {
    "score": { "scaled": 0.85 },
    "success": true,
    "duration": "PT1H30M",
    "completion": true
  }
}
```

### Get xAPI Statements
```http
GET /api/xapi/statements?actor=john@example.com&verb=completed&limit=50
Authorization: Bearer <token>
```

**Query Parameters:**
- `actor` - Filter by actor email
- `verb` - Filter by verb ID
- `activity` - Filter by activity ID
- `since` - ISO timestamp (statements after this time)
- `until` - ISO timestamp (statements before this time)
- `limit` - Number of results (default 100)

### Get Statements by Actor
```http
GET /api/xapi/statements/actor/:email
Authorization: Bearer <token>
```

### Get Activity Statistics
```http
GET /api/xapi/activities/:activityId/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "unique_learners": 250,
  "total_statements": 1850,
  "completions": 230,
  "avg_score": 0.82
}
```

---

## 🎯 Programs API (Learning Paths)

### Create Program
```http
POST /api/programs
Content-Type: application/json
Authorization: Bearer <token>

{
  "orgId": 1,
  "name": "Full Stack Developer Certification",
  "description": "Comprehensive 6-month program",
  "status": "active"
}
```

### Add Course to Program
```http
POST /api/programs/:id/courses
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": 15,
  "sortOrder": 2,
  "prerequisites": [14],
  "dripDays": 7
}
```

### Enroll in Program
```http
POST /api/programs/:id/enroll
Authorization: Bearer <token>
```

### Get Program Progress
```http
GET /api/programs/:id/progress?userId=123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "programId": 5,
  "userId": 123,
  "progressPercentage": 65.5,
  "coursesCompleted": 4,
  "coursesTotal": 6,
  "courses": [
    {
      "courseId": 14,
      "title": "JavaScript Basics",
      "status": "completed",
      "completedAt": "2024-01-15T10:30:00Z"
    },
    {
      "courseId": 15,
      "title": "React Fundamentals",
      "status": "in_progress",
      "progress": 45
    }
  ]
}
```

### Get Next Lesson
```http
GET /api/programs/:id/next-lesson
Authorization: Bearer <token>
```

**Response:**
```json
{
  "courseId": 15,
  "moduleId": 3,
  "lessonId": 12,
  "title": "State Management with Redux",
  "unlocked": true
}
```

---

## ❓ Questions API (Question Bank)

### Create Question
```http
POST /api/questions
Content-Type: application/json
Authorization: Bearer <token>

{
  "orgId": 1,
  "type": "multiple_choice",
  "text": "What is the output of console.log(typeof [])?",
  "options": ["array", "object", "undefined", "null"],
  "correct_answer": "object",
  "difficulty": "medium",
  "category": "JavaScript",
  "tags": ["arrays", "types"],
  "points": 2,
  "explanation": "In JavaScript, arrays are actually objects."
}
```

### Search Questions
```http
GET /api/questions?q=javascript&type=multiple_choice&difficulty=medium&category=JavaScript
Authorization: Bearer <token>
```

### Get Random Questions
```http
POST /api/questions/random
Content-Type: application/json
Authorization: Bearer <token>

{
  "count": 10,
  "difficulty": "medium",
  "category": "JavaScript",
  "tags": ["arrays", "objects"]
}
```

### Create Question Pool
```http
POST /api/questions/pools
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "JavaScript Basics Pool",
  "criteria": {
    "difficulty": ["easy", "medium"],
    "category": "JavaScript",
    "minQuestions": 50
  }
}
```

### Import Questions from QTI
```http
POST /api/questions/import/qti
Content-Type: application/json
Authorization: Bearer <token>

{
  "qtiXml": "<questestinterop>...</questestinterop>",
  "orgId": 1
}
```

### Export Questions to QTI
```http
POST /api/questions/export/qti
Content-Type: application/json
Authorization: Bearer <token>

{
  "questionIds": [1, 2, 3, 4, 5]
}
```

---

## ✅ Assessments API (Quizzes)

### Create Assessment
```http
POST /api/assessments
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your knowledge of JavaScript basics",
  "courseId": 10,
  "moduleId": 2,
  "lessonId": 5,
  "orgId": 1,
  "instructions": "Answer all questions to the best of your ability.",
  "timeLimit": 30,
  "passThreshold": 70,
  "maxAttempts": 3,
  "shuffleQuestions": true,
  "shuffleAnswers": true,
  "showFeedback": true,
  "showCorrectAnswers": false,
  "availableFrom": "2024-01-20T00:00:00Z",
  "availableUntil": "2024-03-20T23:59:59Z"
}
```

### Add Questions to Assessment
```http
POST /api/assessments/:id/questions
Content-Type: application/json
Authorization: Bearer <token>

{
  "questions": [
    { "questionId": 101, "sortOrder": 1, "points": 2 },
    { "questionId": 102, "sortOrder": 2, "points": 2 },
    { "questionId": 103, "sortOrder": 3, "points": 3 }
  ]
}
```

### Start Assessment Attempt
```http
POST /api/assessments/:id/start
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 501,
  "assessmentId": 25,
  "userId": 123,
  "startedAt": "2024-01-27T14:30:00Z",
  "dueAt": "2024-01-27T15:00:00Z",
  "status": "in_progress",
  "questions": [
    {
      "id": 101,
      "text": "What is the output of typeof []?",
      "type": "multiple_choice",
      "options": ["array", "object", "undefined", "null"],
      "points": 2
    }
  ]
}
```

### Submit Answer
```http
POST /api/assessments/attempts/:attemptId/answer
Content-Type: application/json
Authorization: Bearer <token>

{
  "questionId": 101,
  "answer": "object"
}
```

### Submit Attempt for Grading
```http
POST /api/assessments/attempts/:attemptId/submit
Authorization: Bearer <token>
```

**Response:**
```json
{
  "attemptId": 501,
  "score": 85.5,
  "pointsEarned": 17.1,
  "pointsPossible": 20,
  "passed": true,
  "gradedAnswers": [
    {
      "questionId": 101,
      "isCorrect": true,
      "pointsEarned": 2,
      "pointsPossible": 2,
      "feedback": "Correct!"
    }
  ]
}
```

### Get Attempt Results
```http
GET /api/assessments/attempts/:attemptId/results
Authorization: Bearer <token>
```

### Get User's Attempts
```http
GET /api/assessments/:id/attempts
Authorization: Bearer <token>
```

---

## 📝 Gradebook API

### Create Gradebook
```http
POST /api/gradebook/courses/:courseId/gradebook
Content-Type: application/json
Authorization: Bearer <token>

{
  "calculationMethod": "weighted_categories",
  "categories": [
    { "name": "Assignments", "weight": 0.40, "dropLowest": 1, "sortOrder": 1 },
    { "name": "Quizzes", "weight": 0.30, "dropLowest": 0, "sortOrder": 2 },
    { "name": "Exams", "weight": 0.30, "dropLowest": 0, "sortOrder": 3 }
  ],
  "settings": {
    "displayType": "percentage",
    "latePenalty": 10,
    "extraCredit": true
  }
}
```

### Create Grade Item
```http
POST /api/gradebook/items
Content-Type: application/json
Authorization: Bearer <token>

{
  "gradebookId": 5,
  "categoryId": 2,
  "name": "Assignment 1: JavaScript Basics",
  "description": "Complete the JavaScript exercises",
  "type": "assignment",
  "pointsPossible": 100,
  "dueDate": "2024-02-15T23:59:59Z",
  "gradingType": "points"
}
```

### Record Grade
```http
POST /api/gradebook/grades
Content-Type: application/json
Authorization: Bearer <token>

{
  "gradeItemId": 15,
  "userId": 123,
  "score": 85,
  "pointsPossible": 100,
  "percentage": 85,
  "letterGrade": "B",
  "feedback": "Great work! Consider edge cases.",
  "lateSubmission": false,
  "submissionDate": "2024-02-14T10:30:00Z"
}
```

### Get Student Gradebook View
```http
GET /api/gradebook/courses/:courseId/student?userId=123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "gradebook": {
    "id": 5,
    "courseId": 10,
    "calculationMethod": "weighted_categories"
  },
  "overallGrade": {
    "overallScore": 87.5,
    "overallPercentage": 87.5,
    "overallLetter": "B+"
  },
  "categories": [
    {
      "id": 1,
      "name": "Assignments",
      "weight": 0.40,
      "categoryAverage": 85.5
    }
  ],
  "gradeItems": [
    {
      "id": 15,
      "name": "Assignment 1",
      "pointsPossible": 100,
      "score": 85,
      "percentage": 85,
      "letterGrade": "B",
      "feedback": "Great work!"
    }
  ]
}
```

### Get Instructor Gradebook View
```http
GET /api/gradebook/courses/:courseId/instructor
Authorization: Bearer <token>
```

### Export Gradebook to CSV
```http
GET /api/gradebook/courses/:courseId/export
Authorization: Bearer <token>
```

**Response:** CSV file download

### Create Grading Rubric
```http
POST /api/gradebook/rubrics
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": 10,
  "title": "Essay Grading Rubric",
  "description": "Rubric for grading essay assignments",
  "totalPoints": 100,
  "criteria": [
    {
      "description": "Thesis Statement",
      "points": 20,
      "sortOrder": 1,
      "levels": [
        { "description": "Excellent", "points": 20, "sortOrder": 1 },
        { "description": "Good", "points": 15, "sortOrder": 2 },
        { "description": "Fair", "points": 10, "sortOrder": 3 },
        { "description": "Poor", "points": 5, "sortOrder": 4 }
      ]
    }
  ]
}
```

### Grade with Rubric
```http
POST /api/gradebook/grade-with-rubric
Content-Type: application/json
Authorization: Bearer <token>

{
  "gradeItemId": 20,
  "userId": 123,
  "rubricScores": [
    { "criterionId": 1, "points": 18, "feedback": "Strong thesis" },
    { "criterionId": 2, "points": 22, "feedback": "Well organized" }
  ]
}
```

---

## 🔐 SSO Authentication API

### Register SAML Provider
```http
POST /api/auth/sso/providers/saml
Content-Type: application/json
Authorization: Bearer <token>

{
  "orgId": 1,
  "name": "Okta SAML",
  "entryPoint": "https://your-org.okta.com/app/abc123/sso/saml",
  "issuer": "http://www.okta.com/abc123",
  "certificate": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "callbackUrl": "https://yourdomain.com/api/auth/sso/callback/saml"
}
```

### Configure Google SSO
```http
POST /api/auth/sso/providers/google
Content-Type: application/json
Authorization: Bearer <token>

{
  "orgId": 1,
  "credentials": {
    "clientId": "your-google-client-id.apps.googleusercontent.com",
    "clientSecret": "your-google-client-secret"
  }
}
```

### Configure Microsoft SSO
```http
POST /api/auth/sso/providers/microsoft
Content-Type: application/json
Authorization: Bearer <token>

{
  "orgId": 1,
  "credentials": {
    "tenantId": "your-azure-tenant-id",
    "clientId": "your-azure-client-id",
    "clientSecret": "your-azure-client-secret"
  }
}
```

### Get Organization's SSO Providers
```http
GET /api/auth/sso/providers?orgId=1
```

**Response:**
```json
[
  {
    "id": 1,
    "provider_type": "oidc",
    "provider_name": "Google",
    "status": "active",
    "created_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "provider_type": "saml",
    "provider_name": "Okta SAML",
    "status": "active",
    "created_at": "2024-01-20T15:30:00Z"
  }
]
```

### Initiate SSO Login
```http
GET /api/auth/sso/login/:providerId?orgId=1&returnUrl=/dashboard
```

**Response:** Redirect to SSO provider login page

### OIDC Callback (handled automatically)
```http
GET /api/auth/sso/callback/oidc?code=auth_code&state=csrf_token
```

### SAML Callback (handled automatically)
```http
POST /api/auth/sso/callback/saml
Content-Type: application/x-www-form-urlencoded

SAMLResponse=<base64_encoded>&RelayState=<state>
```

### Test SSO Configuration
```http
GET /api/auth/sso/providers/:providerId/test
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "provider": {
    "id": 1,
    "type": "oidc",
    "name": "Google"
  }
}
```

---

## 📊 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

---

## 🛠️ Error Response Format

All errors follow this format:

```json
{
  "error": "Descriptive error message"
}
```

**Example:**
```json
{
  "error": "Assessment not found"
}
```

---

## 📈 Rate Limits

- **General API:** 100 requests per 15 minutes
- **Authentication:** 5 requests per 15 minutes
- **File uploads:** 10 requests per hour

---

## 🎉 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run database migration:**
   ```bash
   node migrate-phase2.js
   ```

3. **Start server:**
   ```bash
   npm run backend
   ```

4. **Test authentication:**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

5. **Use returned token for all requests:**
   ```bash
   curl http://localhost:3001/api/organizations/1 \
     -H "Authorization: Bearer <your-token>"
   ```

---

## 📚 Additional Resources

- [Phase 2 Implementation Guide](PHASE_2_IMPLEMENTATION.md)
- [Enhanced Course Structure](ENHANCED_COURSE_STRUCTURE.md)
- [Architecture Overview](ARCHITECTURE.md)

---

**ProtexxaLearn LMS** - Enterprise-grade learning management system with SCORM, xAPI, SSO, and multi-tenant support.
