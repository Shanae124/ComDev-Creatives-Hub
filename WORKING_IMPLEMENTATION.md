# ProtexxaLearn - Complete Working Implementation Guide

## Overview

This is a fully functional Learning Management System (LMS) with:
- ✅ User authentication with role-based access
- ✅ Course creation and management
- ✅ Rich HTML content editing for lessons
- ✅ File uploads to lessons
- ✅ Canvas-based content preview
- ✅ Student enrollment system
- ✅ Progress tracking for lessons
- ✅ Role-based dashboards (instructor vs student)

## Quick Start (5 Minutes)

### Prerequisites
- PostgreSQL installed and running
- Node.js 18+
- Two terminal windows

### Step 1: Backend Setup & Run

Terminal 1:
```bash
cd backend
npm install
npm run init-db
npm run dev
```

Expected output:
```
[dotenv] injecting env (5) from .env
Server running on port 3000
```

### Step 2: Frontend Setup & Run

Terminal 2:
```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
VITE v5.0.7 ready in 123 ms

➜  Local:   http://localhost:5173/
```

### Step 3: Access Application

Open http://localhost:5173 in your browser

---

## Working Features

### 1. User Authentication

**Register New User:**
1. Click "Register" on login page
2. Enter email, password, name
3. Select role: "Instructor" or "Student"
4. Click "Register"
5. Automatically logged in and redirected to dashboard

**Login:**
1. Enter credentials
2. Click "Login"
3. JWT token stored in localStorage

### 2. Instructor Workflow

**Create Course:**
1. Login as instructor
2. Dashboard shows "Your Courses"
3. Click "+ Create New Course"
4. Enter title and description
5. Course created and appears in list

**Add Content to Course:**
1. Click on course in dashboard
2. Click "Add Module"
3. Enter module title
4. Module appears in course structure
5. Click "Add Lesson" to module
6. Enter lesson title
7. Rich HTML editor appears for content editing

**Edit Lesson Content:**
1. In lesson editor:
   - Write/paste HTML content
   - Use toolbar for formatting (bold, italic, links, etc.)
   - Insert images and videos
   - Format as code blocks, lists, quotes, etc.

**Upload Files to Lesson:**
1. In lesson editor, click "Upload Files"
2. Select file to upload (PDF, Word, Excel, etc.)
3. File uploaded and attached to lesson
4. Attachment appears in "Attachments" list
5. Save lesson content

**Preview Content:**
1. Canvas preview shows lesson content
2. Updates as you type
3. Stripped HTML for readability

### 3. Student Workflow

**Browse Courses:**
1. Login as student
2. Dashboard shows "Enrolled Courses" (initially empty)
3. Click "Browse Courses" link
4. See list of all available courses

**Enroll in Course:**
1. Click on course card
2. Click "Enroll in Course"
3. Enrollment created
4. Course now appears in dashboard

**View Course Content:**
1. Click enrolled course in dashboard
2. See course structure:
   - Modules listed in order
   - Lessons within each module
   - Lesson content with rich HTML

**Access Lesson Files:**
1. Open lesson
2. See attached files listed
3. Click file to download
4. Files available at `/uploads/<filename>`

**Track Progress:**
1. Open lesson
2. Click "Mark as Complete"
3. Completion recorded with timestamp
4. Progress indicator updates
5. Can view all progress in "Progress" section

### 4. Progress Tracking

**For Instructors:**
1. Click course
2. See "Enrollments" tab
3. View list of enrolled students
4. See each student's progress stats

**For Students:**
1. Dashboard shows completion percentage
2. Can view individual lesson progress
3. See completed lessons with timestamps

---

## Database Schema

### Users Table
```sql
users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'student', -- 'student', 'instructor', 'admin'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Courses Table
```sql
courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Modules Table
```sql
modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255),
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Lessons Table
```sql
lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT, -- HTML content
  lesson_type VARCHAR(50) DEFAULT 'content',
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Lesson Attachments Table
```sql
lesson_attachments (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  file_size INTEGER,
  created_at TIMESTAMP
)
```

### Enrollments Table
```sql
enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'active',
  enrolled_at TIMESTAMP,
  UNIQUE(user_id, course_id)
)
```

### Lesson Progress Table
```sql
lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, lesson_id)
)
```

---

## API Endpoints Reference

All endpoints require `Authorization: Bearer <token>` header (except auth endpoints).

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course with modules
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Modules
- `GET /api/modules/:id` - Get module with lessons
- `POST /api/modules` - Create module
- `PUT /api/modules/:id` - Update module
- `DELETE /api/modules/:id` - Delete module

### Lessons
- `GET /api/lessons/:id` - Get lesson with attachments
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson
- `POST /api/lessons/:id/upload` - Upload file
- `DELETE /api/lessons/:id` - Delete lesson

### Enrollments
- `POST /api/enrollments` - Enroll user
- `GET /api/enrollments` - Get user enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments

### Progress
- `POST /api/progress/:lessonId/complete` - Mark complete
- `GET /api/progress/:lessonId` - Get lesson progress
- `GET /api/progress/course/:courseId` - Get course progress

---

## Frontend Components

### Core Components
- **AuthContext.jsx** - Global authentication state (login, register, token)
- **CourseEditor.jsx** - Rich HTML editor for lessons + file uploads
- **CanvasPreview.jsx** - Canvas-based content preview

### Pages
- **LoginPage.jsx** - User login
- **RegisterPage.jsx** - User registration with role selection
- **DashboardPage.jsx** - Main dashboard (instructor or student view)
- **CoursePage.jsx** - Course detail and content
- **LessonPage.jsx** - Individual lesson with editor/viewer

### Navigation
- **Sidebar.jsx** - Navigation menu with role-based options
- **Navbar.jsx** - Top navigation bar
- **Header.jsx** - Page headers

---

## Example Workflow

### Instructor Setup (2 min)

1. **Register as Instructor**
   - Email: instructor@example.com
   - Password: password123
   - Role: Instructor

2. **Create Course**
   - Title: "JavaScript Basics"
   - Description: "Learn JavaScript from scratch"

3. **Add Module**
   - Title: "Getting Started"
   - Order: 0

4. **Add Lesson**
   - Title: "Welcome"
   - Content: `<h2>Welcome!</h2><p>In this course, you'll learn JavaScript.</p>`
   - Type: Content

5. **Upload File**
   - Upload syllabus.pdf or any PDF

### Student Enrollment & Learning (1 min)

1. **Register as Student**
   - Email: student@example.com
   - Password: password123
   - Role: Student

2. **Enroll in Course**
   - Browse courses → Click "JavaScript Basics"
   - Click "Enroll in Course"

3. **View Content**
   - Dashboard → Click "JavaScript Basics"
   - See module "Getting Started"
   - See lesson "Welcome" with content and attachments

4. **Mark Complete**
   - Open lesson
   - Click "Mark as Complete"
   - Progress recorded

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** 
- Start PostgreSQL: `pg_ctl start` (Mac/Linux) or check Services (Windows)
- Verify DATABASE_URL in `.env`

### Issue: "Module not found" errors
**Solution:**
- Run `npm install` in both backend and frontend
- Verify .env files exist

### Issue: CORS errors
**Solution:**
- Backend CORS is enabled globally (dev mode)
- Verify REACT_APP_API_URL points to http://localhost:3000/api

### Issue: Files not uploading
**Solution:**
- Check `/uploads` directory exists in backend
- Verify file permissions
- Check file size limits

### Issue: Lesson content not showing
**Solution:**
- Ensure you click "Save Content" after editing
- Check browser console for errors
- Verify API call succeeded

---

## Performance Tips

1. **File Uploads**: Large files may take time. Show progress indicator.
2. **Course Loading**: Multiple nested modules load in single API call (no N+1 queries)
3. **Progress Tracking**: Each lesson completion is instant
4. **Caching**: Implement localStorage caching for courses (optional)

---

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Role-based access control on all endpoints
- SQL injection prevented with parameterized queries
- CORS enabled globally in dev (restrict in production)

---

## Next Steps for Production

1. **Environment Variables**
   - Set strong JWT_SECRET
   - Use production PostgreSQL URL
   - Set NODE_ENV=production

2. **CORS Configuration**
   - Restrict to specific frontend domain
   - Remove credentials header exposure

3. **Database Backups**
   - Implement regular backups
   - Use read replicas for scaling

4. **File Storage**
   - Consider S3 or cloud storage
   - Implement file size limits
   - Add virus scanning

5. **Deployment**
   - Use PM2 or similar for process management
   - Implement CI/CD pipeline
   - Set up monitoring and logging

6. **Monitoring**
   - Track API response times
   - Monitor error rates
   - Set up alerts

---

## Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
For installation/testing details, see [INSTALLATION_TESTING.md](./INSTALLATION_TESTING.md)
