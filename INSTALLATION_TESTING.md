# ProtexxaLearn Setup & Testing Guide

## Prerequisites

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 12 or higher
- **npm** or **yarn**

## Installation

### Step 1: Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/protexxalearn
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

Install dependencies:
```bash
npm install
```

### Step 2: Database Initialization

Create the PostgreSQL database:
```bash
createdb protexxalearn
```

Initialize the schema:
```bash
npm run init-db
```

This will create all tables:
- `users`
- `courses`
- `modules`
- `lessons`
- `lesson_attachments`
- `enrollments`
- `lesson_progress`

### Step 3: Start Backend Server

```bash
npm run dev
```

Server will start on `http://localhost:3000`

### Step 4: Frontend Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:
```
REACT_APP_API_URL=http://localhost:3000/api
```

Install dependencies:
```bash
npm install
```

Start frontend:
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## Testing the API

### Test 1: User Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "instructor"
  }'
```

Save the returned `token` for subsequent requests.

### Test 2: Create a Course

```bash
TOKEN="<your-token-from-registration>"

curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript fundamentals"
  }'
```

Save the returned `id` as `COURSE_ID`.

### Test 3: Create a Module

```bash
COURSE_ID="<course-id-from-test-2>"

curl -X POST http://localhost:3000/api/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "courseId": '$COURSE_ID',
    "title": "Module 1: Basics",
    "orderIndex": 0
  }'
```

Save the returned `id` as `MODULE_ID`.

### Test 4: Create a Lesson with HTML Content

```bash
MODULE_ID="<module-id-from-test-3>"

curl -X POST http://localhost:3000/api/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "moduleId": '$MODULE_ID',
    "title": "Lesson 1: Getting Started",
    "content": "<h2>Welcome to JavaScript</h2><p>In this lesson, we will learn the basics of JavaScript.</p><ul><li>Variables</li><li>Data Types</li><li>Functions</li></ul>",
    "lessonType": "content",
    "orderIndex": 0
  }'
```

Save the returned `id` as `LESSON_ID`.

### Test 5: Upload a File to Lesson

```bash
LESSON_ID="<lesson-id-from-test-4>"

# Create a test file
echo "This is a test document for the course." > test-document.txt

curl -X POST http://localhost:3000/api/lessons/$LESSON_ID/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-document.txt"
```

### Test 6: Get Course Structure

```bash
curl -X GET http://localhost:3000/api/courses/$COURSE_ID \
  -H "Authorization: Bearer $TOKEN"
```

Should return the course with all modules and lessons.

### Test 7: Student Registration and Enrollment

Register a student:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "student"
  }'
```

Save the student token as `STUDENT_TOKEN`.

Enroll in course:
```bash
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{
    "courseId": '$COURSE_ID'
  }'
```

### Test 8: Get Student Enrollments

```bash
curl -X GET http://localhost:3000/api/enrollments \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

Should show the course they enrolled in.

### Test 9: Mark Lesson as Complete

```bash
curl -X POST http://localhost:3000/api/progress/$LESSON_ID/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Test 10: Get Course Progress

```bash
curl -X GET http://localhost:3000/api/progress/course/$COURSE_ID \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

Should show completed lessons.

---

## Testing the Frontend

### 1. Access the Application

Open browser to `http://localhost:5173`

### 2. Register as Instructor

- Click "Register"
- Enter instructor credentials
- Select "Instructor" role
- Submit

### 3. Create a Course

- Click "Create New Course"
- Enter title and description
- Submit

### 4. Edit Course Content

- Click on course
- Add a module
- Add a lesson to module
- Use rich HTML editor to add content
- Upload files as attachments
- Click "Save"

### 5. Preview with Canvas

- Content preview appears in canvas
- Shows HTML content preview
- File attachments listed

### 6. Register as Student

- Logout
- Register with student credentials
- Select "Student" role

### 7. Enroll in Course

- Browse available courses
- Click "Enroll"
- Course appears in dashboard

### 8. Track Progress

- Open course
- View lessons
- Mark lessons as complete
- Progress tracked on dashboard

---

## Troubleshooting

### Database Connection Error

**Error:** "password authentication failed"

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in `.env`
3. Verify credentials: `psql -U postgres -h localhost -d protexxalearn`

### Module Not Found

**Error:** "Cannot find module './config/db'"

**Solution:**
- Ensure all files in `/backend` directory are properly created
- Run `npm install` again
- Check file paths in require statements

### Port Already in Use

**Error:** "listen EADDRINUSE: address already in use :::3000"

**Solution:**
1. Kill process on port 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. Or change PORT in `.env` to a different port

### CORS Error

**Error:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution:**
- Verify `REACT_APP_API_URL` points to correct backend
- Check CORS middleware in backend (should allow all origins in dev)

---

## File Structure

```
ProtexxaLearn/
├── backend/
│   ├── config/
│   │   └── db.js          # PostgreSQL pool
│   ├── middleware/
│   │   └── auth.js        # JWT authentication
│   ├── routes/
│   │   ├── auth.js        # Authentication endpoints
│   │   ├── courses.js     # Course management
│   │   ├── modules.js     # Module management
│   │   ├── lessons.js     # Lesson management & uploads
│   │   ├── enrollments.js # Enrollment management
│   │   └── progress.js    # Progress tracking
│   ├── scripts/
│   │   └── initdb.js      # Database initialization
│   ├── server.js          # Express app setup
│   ├── package.json
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state management
│   │   ├── components/
│   │   │   ├── CourseEditor.jsx   # Rich editor for lessons
│   │   │   ├── CanvasPreview.jsx  # Canvas preview
│   │   │   └── ...
│   │   ├── pages/
│   │   │   └── ...
│   │   └── App.jsx
│   ├── package.json
│   └── .env.local         # Frontend environment variables
└── API_DOCUMENTATION.md   # API reference
```

---

## Production Deployment

See `DEPLOYMENT.md` for production setup instructions.

---

## Support

For issues or questions, refer to:
- API_DOCUMENTATION.md - Full API reference
- FRESH_START.md - Quick start guide
- Backend and frontend package.json files for dependency versions
