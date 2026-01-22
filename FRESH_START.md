# ProtexxaLearn - Fresh Start Guide

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   npm install
   npm run init-db
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## Database Schema

The system includes:
- **Users** - Authentication with roles (student, instructor, admin)
- **Courses** - Created by instructors
- **Modules** - Organize course content
- **Lessons** - Individual learning units with HTML content
- **Lesson Attachments** - Files uploaded to lessons
- **Enrollments** - Track student enrollment
- **Lesson Progress** - Track completion status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course with modules
- `POST /api/courses` - Create course (instructor only)
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
- `POST /api/lessons/:id/upload` - Upload file to lesson
- `DELETE /api/lessons/:id` - Delete lesson

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments` - Get user enrollments
- `GET /api/enrollments/course/:courseId` - Get course enrollments

### Progress
- `POST /api/progress/:lessonId/complete` - Mark lesson as completed
- `GET /api/progress/course/:courseId` - Get course progress
- `GET /api/progress/:lessonId` - Get lesson progress

## Key Features

✅ User Authentication & Roles
✅ Course Management
✅ Enrollment System
✅ Progress Tracking
✅ Rich HTML Editor for Content
✅ File Uploads
✅ Canvas Preview

## Frontend Components

- **CourseEditor** - Rich HTML editor with file uploads
- **CanvasPreview** - Visual preview of course content
- **DashboardPage** - Main dashboard for users
- **AuthContext** - Global authentication state

## Development

- Backend: Express.js with PostgreSQL
- Frontend: React with React Router
- Styling: Tailwind CSS
- Editor: React Quill (Rich text editor)

---

For production deployment, see DEPLOYMENT.md
