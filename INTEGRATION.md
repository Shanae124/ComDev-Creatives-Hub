# ProtexxaLearn Frontend-Backend Integration Guide

## Overview

ProtexxaLearn is now fully integrated with:
- **Backend**: Node.js + Express REST API (port 3000)
- **Frontend**: Next.js 16 + TypeScript + Shadcn UI (port 3001)
- **Database**: PostgreSQL with full schema
- **Authentication**: JWT tokens with secure storage

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Initialize Database (First Time Only)
```bash
node initdb.js
```

### 4. Start Backend (Terminal 1)
```bash
npm run backend
```
✅ Backend will start on `http://localhost:3000`

### 5. Start Frontend (Terminal 2)
```bash
npm run dev
```
✅ Frontend will start on `http://localhost:3001` (or next available port)

### 6. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Default Login**: Create new account via Register page

## Architecture

### API Layer (`lib/api.ts`)
Centralized Axios client with:
- Base URL configuration from `NEXT_PUBLIC_API_URL`
- Automatic JWT token injection in headers
- Request/response interceptors
- Auto-redirect to login on 401 errors

**Available API Functions:**
```typescript
// Auth
authAPI.register(name, email, password, role)
authAPI.login(email, password)

// Courses
courseAPI.getAll()
courseAPI.getById(id)
courseAPI.create(data)
courseAPI.update(id, data)

// Modules
moduleAPI.getByCourseId(courseId)
moduleAPI.create(data)
moduleAPI.update(id, data)

// Lessons
lessonAPI.getByModuleId(moduleId)
lessonAPI.getById(id)
lessonAPI.create(data)
lessonAPI.update(id, data)

// Enrollments
enrollmentAPI.getAll()
enrollmentAPI.enroll(userId, courseId)

// Progress
progressAPI.update(data)
progressAPI.getByCourseId(courseId)

// Assignments & Grading
assignmentAPI.getByCourseId(courseId)
submissionAPI.create(data)
gradeAPI.create(data)
```

### State Management (`lib/auth-store.ts`)
Zustand-based auth store with:
- User state (id, name, email, role)
- Token persistence in localStorage
- Session restoration on app load
- Automatic logout on 401

**Usage:**
```typescript
import { useAuthStore } from '@/lib/auth-store'

// In a component:
const user = useAuthStore((state) => state.user)
const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
const logout = useAuthStore((state) => state.logout)
```

### Pages & Components

#### Authentication Pages
- `/login` - Login page with email/password
- `/register` - Registration with role selection (student/instructor)

#### Dashboard Pages
- `/` (dashboard) - Main dashboard with course grid
  - Requires authentication
  - Redirects to `/login` if not authenticated
  - Displays user's enrolled courses

#### Admin Pages
- `/admin/courses` - Course management
- `/admin/courses/new` - Create new course

#### UI Components
All components from Shadcn/Radix UI library:
- `Button`, `Card`, `Input`, `Select`, `Dialog`
- `Form`, `Table`, `Tabs`, `Accordion`
- `Alert`, `Badge`, `Progress`, `Toast`

## API Integration Examples

### Fetch Courses on Component Load
```typescript
'use client'

import { useEffect, useState } from 'react'
import { courseAPI } from '@/lib/api'

export function CourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    courseAPI.getAll()
      .then(res => setCourses(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  return <div>{courses.map(c => <div key={c.id}>{c.title}</div>)}</div>
}
```

### Submit Login Form
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const response = await authAPI.login(email, password)
    const { token, user } = response.data
    
    localStorage.setItem('token', token)
    setAuth(user, token)
    router.push('/dashboard')
  } catch (error) {
    setError(error.response?.data?.error || 'Login failed')
  }
}
```

### Create Course (Instructor)
```typescript
const handleCreateCourse = async (formData: CourseData) => {
  try {
    const response = await courseAPI.create(formData)
    console.log('Course created:', response.data)
    router.push(`/courses/${response.data.id}`)
  } catch (error) {
    console.error('Create failed:', error)
  }
}
```

## Environment Variables

### Required (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Optional
```env
NEXT_PUBLIC_ENABLE_DEMO=true          # Enable demo mode
NEXT_PUBLIC_ANALYTICS_ID=             # Analytics tracking
```

## Backend Requirements

### Database (PostgreSQL)
- Database: `Protexxalearn`
- User: `postgres`
- Password: `postgres`
- Port: `5432`

**Schema Tables:**
- `users` - User accounts
- `courses` - Course definitions
- `modules` - Course modules
- `lessons` - Lesson content
- `enrollments` - Student course enrollments
- `lesson_progress` - Student progress tracking
- `assignments` - Course assignments
- `submissions` - Student submissions
- `grades` - Assignment grades
- `announcements` - Course announcements
- `files` - File uploads
- `audit_logs` - System audit trail

### Backend API Endpoints (Port 3000)

**Authentication:**
- `POST /auth/register` - Create account
- `POST /auth/login` - Login and get JWT token

**Courses (Admin/Instructor):**
- `GET /courses` - List all courses
- `POST /courses` - Create course
- `GET /courses/:id` - Get course details
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

**Modules:**
- `GET /courses/:courseId/modules` - List modules
- `POST /modules` - Create module
- `PUT /modules/:id` - Update module
- `DELETE /modules/:id` - Delete module

**Lessons:**
- `GET /modules/:moduleId/lessons` - List lessons
- `POST /lessons` - Create lesson
- `PUT /lessons/:id` - Update lesson
- `DELETE /lessons/:id` - Delete lesson

**Enrollments:**
- `POST /enroll` - Enroll in course
- `GET /enrollments` - List enrollments
- `GET /courses/:courseId/enrollments` - Course enrollments

**Progress:**
- `POST /lesson-progress` - Update lesson progress
- `GET /courses/:courseId/progress` - Get course progress

See [README.md](README.md) for complete API documentation.

## Troubleshooting

### "Cannot connect to backend"
1. Check backend is running: `npm run backend` (Terminal 1)
2. Verify backend is on port 3000: `netstat -ano | findstr :3000`
3. Check `NEXT_PUBLIC_API_URL` in `.env.local` points to correct backend

### "401 Unauthorized"
1. Token may be expired - logout and re-login
2. Check token is being stored in localStorage
3. Verify JWT_SECRET in backend matches token

### "Courses not loading"
1. Database must be initialized: `node initdb.js`
2. Create test course via backend: See QUICKSTART.md
3. Check browser console for API errors

### "CORS errors"
- Backend has CORS enabled globally (see server.js)
- No additional configuration needed for local development

## File Structure

```
ProtexxaLearn/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with auth initialization
│   ├── page.tsx                 # Dashboard (requires auth)
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   └── admin/                   # Admin area
│
├── components/                  # React components
│   ├── dashboard-content.tsx    # Dashboard content (fetches user from auth store)
│   ├── course-grid.tsx          # Course listing (fetches from API)
│   ├── header.tsx               # Header with user menu
│   ├── sidebar.tsx              # Navigation sidebar
│   └── ui/                      # Shadcn UI components
│
├── lib/
│   ├── api.ts                   # Axios client + API functions (NEW)
│   ├── auth-store.ts            # Zustand auth store (NEW)
│   └── utils.ts
│
├── styles/
│   └── globals.css              # Tailwind CSS
│
├── public/                      # Static assets
├── server.js                    # Node.js Express backend
├── initdb.js                    # Database schema initialization
├── db.js                        # Database connection pool
├── package.json                 # Dependencies (includes axios, zustand)
├── .env.local                   # Environment variables (NEW)
└── tsconfig.json               # TypeScript configuration
```

## Next Steps

1. **Create Test Course**
   - Login as instructor or admin
   - Navigate to admin pages
   - Create a course with modules and lessons

2. **Test Full Flow**
   - Login (create account or use test credentials)
   - View courses on dashboard
   - Enroll in course
   - Update progress

3. **Migrate Brightspace Courses**
   - See PRODUCTION_GUIDE.md for migration steps
   - Use `node importCourse.js D2L_EXPORT.imscc`

4. **Deploy to Production**
   - Update .env variables for production API URL
   - Build frontend: `npm run build`
   - Start production server: `npm start`
   - See PRODUCTION_GUIDE.md for full deployment steps

## Key Features Integrated

✅ JWT Authentication with token refresh
✅ Role-based access control (student/instructor/admin)
✅ Course management (CRUD operations)
✅ Module & lesson organization
✅ Student enrollment tracking
✅ Progress tracking and analytics
✅ Assignment submission & grading
✅ Real-time notifications (via Sonner)
✅ Responsive design (mobile-first)
✅ Dark theme support (via next-themes)
✅ Form validation (React Hook Form + Zod)
✅ Type-safe development (TypeScript)

## Support

For issues or questions:
1. Check QUICKSTART.md for common issues
2. Check PRODUCTION_GUIDE.md for deployment
3. Review API documentation in README.md
4. Check browser console for error messages
5. Check backend logs: `npm run backend`

---

**ProtexxaLearn Frontend-Backend Integration v1.0**
