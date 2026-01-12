# ProtexxaLearn - System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PROTEXXALEARN SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       CLIENT LAYER (Port 3001)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Next.js 16 + TypeScript Frontend               │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                         Pages                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │   Login      │  │  Register    │  │   Dashboard      │ │ │
│  │  │   (Public)   │  │   (Public)   │  │   (Protected)    │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │ │
│  │         ↓                ↓                     ↓            │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │              Components (Shadcn UI)                │   │ │
│  │  │  Button, Card, Input, Form, Table, etc (40+)      │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  │              ↓                                              │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │          State Management (Zustand)                │   │ │
│  │  │  • User state (id, name, email, role)             │   │ │
│  │  │  • Token (JWT in localStorage)                    │   │ │
│  │  │  • Persistent auth store                          │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  │              ↓                                              │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │         API Client Layer (lib/api.ts)              │   │ │
│  │  │  ┌──────────────────────────────────────────────┐ │   │ │
│  │  │  │           Axios HTTP Client                 │ │   │ │
│  │  │  │  • Base URL: http://localhost:3000         │ │   │ │
│  │  │  │  • Auto JWT token injection               │ │   │ │
│  │  │  │  • Request/response interceptors          │ │   │ │
│  │  │  │  • Error handling with auto-logout       │ │   │ │
│  │  │  └──────────────────────────────────────────────┘ │   │ │
│  │  │         ↓                                          │   │ │
│  │  │  ┌─────────────────────────────────────────────┐  │   │ │
│  │  │  │      API Functions (15+ endpoints)          │  │   │ │
│  │  │  │  authAPI  - login, register, logout       │  │   │ │
│  │  │  │  courseAPI - getAll, create, update       │  │   │ │
│  │  │  │  moduleAPI - getByCourseId, create        │  │   │ │
│  │  │  │  lessonAPI - getByModuleId, create        │  │   │ │
│  │  │  │  progressAPI - update, getProgress        │  │   │ │
│  │  │  │  assignmentAPI - getAll, create           │  │   │ │
│  │  │  │  gradeAPI - create, getByByCourse         │  │   │ │
│  │  │  │  [+ 8 more API functions]                 │  │   │ │
│  │  │  └─────────────────────────────────────────────┘  │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓ HTTPS                                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   API GATEWAY / BACKEND (Port 3000)               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │        Express.js 5 REST API Server (server.js)            │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                   Routes (25+ endpoints)                    │ │
│  │                                                             │ │
│  │  POST /auth/register ────────────────────────┐            │ │
│  │  POST /auth/login ───────────────────────────├──┐         │ │
│  │                                              │  │         │ │
│  │  GET/POST /courses ──────────────────────────┤  │         │ │
│  │  GET /courses/:id ───────────────────────────┤  │         │ │
│  │  PUT /courses/:id ───────────────────────────┤  │         │ │
│  │  DELETE /courses/:id ────────────────────────┤  │         │ │
│  │                                              │  │         │ │
│  │  GET /courses/:id/modules ───────────────────┤  │         │ │
│  │  POST /modules ──────────────────────────────┤  │         │ │
│  │  PUT /modules/:id ───────────────────────────┤  │         │ │
│  │  DELETE /modules/:id ────────────────────────┤  │         │ │
│  │                                              │  │         │ │
│  │  GET /modules/:id/lessons ───────────────────┤  │         │ │
│  │  POST /lessons ──────────────────────────────┤  │         │ │
│  │  PUT /lessons/:id ───────────────────────────┤  │         │ │
│  │  DELETE /lessons/:id ────────────────────────┤  │         │ │
│  │                                              │  │         │ │
│  │  POST /enroll ───────────────────────────────┤  │         │ │
│  │  GET /enrollments ───────────────────────────┤  │         │ │
│  │  POST /lesson-progress ──────────────────────┤  │         │ │
│  │  GET /courses/:id/progress ──────────────────┤  │         │ │
│  │                                              │  │         │ │
│  │  POST /assignments ──────────────────────────┤  │         │ │
│  │  POST /submissions ───────────────────────────┤  │         │ │
│  │  POST /grades ───────────────────────────────┤  │         │ │
│  │                                              │  │         │ │
│  │  POST /announcements ────────────────────────┘  │         │ │
│  │  [+ 3 more endpoints]                          │         │ │
│  │                    ↓                            │         │ │
│  │  ┌─────────────────────────────────────────┐  │         │ │
│  │  │      Middleware & Authentication        │  │         │ │
│  │  │  • CORS - enabled globally              │  │         │ │
│  │  │  • JWT - verify token, extract user    │  │         │ │
│  │  │  • Auth - check role (admin/instructor)│  │         │ │
│  │  │  • Error - catch and format errors     │  │         │ │
│  │  │  • Logging - request/response logs     │  │         │ │
│  │  └─────────────────────────────────────────┘  │         │ │
│  │                    ↓                            │         │ │
│  │  ┌─────────────────────────────────────────┐  │         │ │
│  │  │    Controllers & Business Logic         │  │         │ │
│  │  │  • User registration + JWT creation   │  │         │ │
│  │  │  • Course CRUD operations             │  │         │ │
│  │  │  • Enrollment management              │  │         │ │
│  │  │  • Progress tracking                  │  │         │ │
│  │  │  • Assignment & grading               │  │         │ │
│  │  └─────────────────────────────────────────┘  │         │ │
│  │                    ↓                            │         │ │
│  │  ┌─────────────────────────────────────────┐  │         │ │
│  │  │   Data Access Layer (db.js)             │  │         │ │
│  │  │  • Connection pooling (20 connections) │  │         │ │
│  │  │  • Query execution                     │  │         │ │
│  │  │  • Result parsing                      │  │         │ │
│  │  │  • Parameterized queries (SQL inject) │  │         │ │
│  │  │  • Error handling                      │  │         │ │
│  │  └─────────────────────────────────────────┘  │         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  DATABASE LAYER (Port 5432)                       │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            PostgreSQL 12+ (Protexxalearn DB)               │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │                       Tables (12)                           │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ users (id, name, email, password_hash, role, ...)   │  │ │
│  │  │ ↓ ↓ ↓ ↓ ↓                                            │  │ │
│  │  │ courses (id, title, created_by, ...)                │  │ │
│  │  │ ↓ ↓ ↓ ↓                                              │  │ │
│  │  │ modules (id, course_id, title, ...)                 │  │ │
│  │  │ ↓ ↓ ↓ ↓                                              │  │ │
│  │  │ lessons (id, module_id, title, ...)                 │  │ │
│  │  │ ↓ ↓ ↓ ↓                                              │  │ │
│  │  │ enrollments (user_id, course_id, ...)               │  │ │
│  │  │ lesson_progress (user_id, lesson_id, ...)           │  │ │
│  │  │ assignments (id, course_id, ...)                    │  │ │
│  │  │ submissions (id, assignment_id, user_id, ...)       │  │ │
│  │  │ grades (id, submission_id, score, ...)              │  │ │
│  │  │ announcements (id, course_id, ...)                  │  │ │
│  │  │ files (id, course_id, filename, ...)                │  │ │
│  │  │ audit_logs (id, user_id, action, ...)               │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  Features:                                                 │ │
│  │  • Foreign key constraints with CASCADE deletes           │ │
│  │  • Performance indexes on user_id, course_id, created_at  │ │
│  │  • Unique constraints (e.g., user_id + course_id)        │ │
│  │  • Timestamp columns for audit trails                    │ │
│  │  • Default values (CURRENT_TIMESTAMP, roles)             │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### User Registration Flow
```
User Form (Register Page)
   ↓ Form submission
Frontend (app/register/page.tsx)
   ↓ authAPI.register(name, email, password, role)
Axios Client (lib/api.ts)
   ↓ POST /auth/register
Express Route (server.js)
   ↓ Validate input
   ↓ Hash password with bcrypt
   ↓ Insert into users table
PostgreSQL (Protexxalearn DB)
   ↓ Return new user + generated JWT
Express
   ↓ Return {token, user}
Axios Client
   ↓ Store token in localStorage
Zustand Store (lib/auth-store.ts)
   ↓ Update user state
Frontend Component
   ↓ Redirect to /dashboard
Next.js Router
   ↓ Protected page checks isAuthenticated
Dashboard Component
   ↓ Fetch courses from API
   ↓ Display to user
```

### Course Enrollment Flow
```
Student Dashboard
   ↓ Click "Enroll"
Frontend
   ↓ enrollmentAPI.enroll(userId, courseId)
Axios Client
   ↓ POST /enroll with {user_id, course_id}
   ↓ Auto-injects JWT token
Express Route
   ↓ Verify JWT token
   ↓ Extract user_id from token
   ↓ INSERT INTO enrollments ON CONFLICT DO UPDATE
PostgreSQL
   ↓ Upsert pattern - handles re-enrollment
   ↓ Return enrollment record
Express
   ↓ Return {status: 'active'}
Frontend
   ↓ Show success message
   ↓ Refresh enrolled courses list
```

### Student Progress Tracking
```
Student Lesson Page
   ↓ Click "Mark as Complete"
Frontend
   ↓ progressAPI.update({user_id, lesson_id, progress_percent: 100})
Axios Client
   ↓ POST /lesson-progress
Express Route
   ↓ Verify authentication
   ↓ INSERT/UPDATE lesson_progress
PostgreSQL
   ↓ Store progress record
   ↓ Calculate completion percentage
Express
   ↓ Return progress record
Frontend
   ↓ Update progress bar
   ↓ Show completion status
```

## Technology Stack Details

### Frontend Stack
```
┌─────────────────────────────────────┐
│      Next.js 16.0.10                │
│  (Framework + App Router + SSR)     │
│  ↓                                   │
│  TypeScript 5 (Type Safety)         │
│  ↓                                   │
│  React 19.2.0 (UI Library)          │
│  ├─ Hooks (useState, useEffect)     │
│  ├─ Context (for auth context)      │
│  └─ Server Components (optional)    │
│  ↓                                   │
│  Shadcn UI Components               │
│  ├─ Radix UI (Primitives)           │
│  ├─ Tailwind CSS (Styling)          │
│  └─ Lucide Icons (Icons)            │
│  ↓                                   │
│  State Management                   │
│  ├─ Zustand (Global state)          │
│  └─ localStorage (Persistence)      │
│  ↓                                   │
│  Forms & Validation                 │
│  ├─ React Hook Form                 │
│  └─ Zod (Schema validation)         │
│  ↓                                   │
│  HTTP Client                        │
│  └─ Axios (with interceptors)       │
│  ↓                                   │
│  Utilities                          │
│  ├─ clsx (Class merging)            │
│  ├─ tailwind-merge (CSS merge)      │
│  └─ date-fns (Date formatting)      │
└─────────────────────────────────────┘
```

### Backend Stack
```
┌──────────────────────────────────┐
│   Node.js 22.x Runtime           │
│  ↓                                │
│  Express.js 5.0.0                │
│  (Web Framework)                  │
│  ├─ Route handlers               │
│  ├─ Middleware                   │
│  └─ Error handling               │
│  ↓                                │
│  Authentication                  │
│  ├─ jsonwebtoken (JWT)          │
│  └─ bcryptjs (Password hash)    │
│  ↓                                │
│  Database                        │
│  ├─ pg (PostgreSQL driver)      │
│  └─ Connection pooling          │
│  ↓                                │
│  Utilities                       │
│  └─ cors (CORS middleware)      │
└──────────────────────────────────┘
```

### Database
```
PostgreSQL 12+
├─ Query execution
├─ Connection pooling (20)
├─ Indexes (performance)
├─ Foreign keys (integrity)
├─ Timestamps (auditing)
└─ Transactions (consistency)
```

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                     END USERS                               │
│                    (Browsers)                               │
└─────────────────────────────────────────────────────────────┘
                         ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  CLOUD LOAD BALANCER                        │
│         (Distribute traffic across instances)               │
└─────────────────────────────────────────────────────────────┘
                    ↙            ↘
         ┌──────────────────┐  ┌──────────────────┐
         │ Frontend Instance│  │ Frontend Instance│
         │   Next.js Server │  │   Next.js Server │
         │  (Vercel/AWS)    │  │  (Vercel/AWS)    │
         └──────────────────┘  └──────────────────┘
                    ↘            ↙
         ┌──────────────────────────────────────┐
         │        Backend Load Balancer         │
         │     (Distribute API requests)        │
         └──────────────────────────────────────┘
              ↙        ↓        ↓        ↘
    ┌──────────────┐  ┌──────────────┐
    │ Backend (1)  │  │ Backend (2)  │ ...
    │ Express/Node │  │ Express/Node │
    │  (PM2)       │  │  (PM2)       │
    └──────────────┘  └──────────────┘
            ↓              ↓
    ┌─────────────────────────────┐
    │   PostgreSQL Primary        │
    │   (Master Database)         │
    ├─────────────────────────────┤
    │  ↓ Replication              │
    │ ┌──────────────────────┐   │
    │ │ PostgreSQL Replica   │   │
    │ │ (Read scaling)       │   │
    │ └──────────────────────┘   │
    └─────────────────────────────┘
            ↓ Backup
    ┌─────────────────────────────┐
    │  S3/Cloud Storage Backup    │
    └─────────────────────────────┘
```

This diagram shows how ProtexxaLearn scales in production with load balancing, multiple backend instances, and database replication.

---

**ProtexxaLearn Architecture v1.0**
