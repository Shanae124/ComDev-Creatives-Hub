# ProtexxaLearn - Team Setup Guide

## ✅ Current Status
- ✅ Database initialized with full schema
- ✅ Backend API running (Express + PostgreSQL)
- ✅ Frontend (Next.js) configured with API proxy
- ✅ **D2L/Brightspace course imported** (Unicorn Rises course)
- ✅ IMSCC import feature built into UI

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL running locally (or update `db.js` with your DB credentials)
- npm or pnpm

### 1. Clone & Install
```bash
# Navigate to project
cd ProtexxaLearn

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Initialize Database
```bash
# This creates all tables and schema
node initdb.js
```

### 3. Start Backend (Terminal 1)
```bash
npm run backend
# Server runs on http://localhost:3000
```

### 4. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
# App runs on http://localhost:3001
```

### 5. Open Browser
```
http://localhost:3001
```

---

## 📚 Features & How to Use

### Feature 1: Register & Login
1. Go to **Register** page
2. Create account (e.g., `testuser@example.com`)
3. Login with credentials
4. View dashboard

### Feature 2: Browse Imported Course
1. After login, click **Dashboard**
2. You'll see available courses (including "Imported Course" from D2L)
3. Click **Enroll** to join a course
4. View modules and lessons

### Feature 3: Admin - Import New IMSCC Files
1. Login as **admin** or **instructor**
2. Go to **Admin > Course Management**
3. **Upload IMSCC** button at top
4. Select a `.imscc` file (Brightspace export)
5. Click "Import IMSCC"
6. Course auto-creates in database

---

## 🗄️ Database

### Connection
- **Host**: localhost
- **Port**: 5432
- **Database**: Protexxalearn
- **User**: postgres
- **Password**: postgres
*(Edit `db.js` to change)*

### Verify Import
```bash
# Connect to DB
psql -U postgres -d Protexxalearn

# See imported course
SELECT * FROM courses;

# See modules
SELECT * FROM modules;

# See lessons (if any)
SELECT * FROM lessons;
```

### Sample Query: View Full Course Structure
```sql
SELECT 
  c.id, c.title, c.status,
  m.id as module_id, m.title as module_title,
  l.id as lesson_id, l.title as lesson_title
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN lessons l ON l.module_id = m.id
ORDER BY c.id, m.sort_order, l.sort_order;
```

---

## 📡 API Reference

### Auth
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Pass123!","role":"student"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass123!"}'
```

### Courses
```bash
# Get all published courses
curl http://localhost:3000/courses

# Get course by ID
curl http://localhost:3000/courses/1

# Create course (requires token)
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"New Course","description":"Test"}'
```

### Modules
```bash
# Get modules for course
curl http://localhost:3000/courses/1/modules

# Create module
curl -X POST http://localhost:3000/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"course_id":1,"title":"Module 1"}'
```

### Enrollments
```bash
# Enroll in course
curl -X POST http://localhost:3000/enroll \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"user_id":1,"course_id":1}'

# Get my enrollments
curl http://localhost:3000/enrollments \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 🛠️ Direct Database Import (Alternative)

If API is down, import IMSCC directly to DB:

```bash
node importCourseDB.js path/to/course.imscc
```

This skips the API and inserts directly into PostgreSQL.

---

## 🚨 Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify credentials in `db.js`
- Ensure database `Protexxalearn` exists

### "Backend returns 401 Unauthorized"
- Token may be expired (7-day expiry)
- Login again to get new token
- Check `Authorization: Bearer <TOKEN>` header

### "IMSCC upload fails"
- Ensure file is valid `.imscc` (ZIP format)
- Backend must be running
- Check browser console for error details
- Try direct DB import: `node importCourseDB.js <file>`

### "Courses don't show on dashboard"
- Enroll in a course first
- Only "published" courses show (check `status` column)
- Publish a draft course: `UPDATE courses SET status='published' WHERE id=1;`

---

## 📋 Included Files

### Backend
- `server.js` - Express REST API
- `db.js` - PostgreSQL connection
- `initdb.js` - Schema initialization
- `brightspaceMigrator.js` - IMSCC parser (uses xml2js)
- `importCourse.js` - Import script (API-based)
- `importCourseDB.js` - Direct DB import

### Frontend
- `app/` - Next.js pages (register, login, dashboard, admin)
- `components/` - React components
- `lib/api.ts` - API client (axios)
- `lib/auth-store.ts` - Auth state (Zustand)
- `components/admin/course-management.tsx` - **IMSCC upload UI**

---

## 🔐 Admin Credentials (for demo)

| Email | Password | Role |
|-------|----------|------|
| importer@local | Import3rPass! | admin |

Create your own admin via registration and manually update the role:
```sql
UPDATE users SET role='admin' WHERE email='your@email.com';
```

---

## 📦 Tech Stack

- **Backend**: Node.js, Express 5.2, PostgreSQL
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Auth**: JWT + bcrypt
- **State**: Zustand (frontend)
- **Parsing**: xml2js (IMSCC/IMS manifest)
- **File Upload**: multer

---

## 🤝 Team Collaboration

### For Instructors
1. Register as "instructor"
2. Go to Admin > Course Management
3. Upload IMSCC files to create courses
4. View enrollments and student progress
5. Create modules/lessons manually in the UI

### For Students
1. Register as "student"
2. View available courses
3. Enroll in courses
4. Complete lessons and track progress

### For Admins
1. Manage all users and courses
2. View system-wide enrollment data
3. Publish/unpublish courses
4. Manage roles and permissions

---

## 📖 Next Steps

1. **Share this guide** with your team
2. **Clone the repo** and run setup steps
3. **Import more courses** using the IMSCC upload feature
4. **Customize branding** in `next.config.mjs` and CSS
5. **Deploy to production** (update DB credentials, set JWT_SECRET env var)

---

## 📞 Support

For API issues, check:
- `server.js` logs (terminal where backend is running)
- Browser DevTools Network tab
- Database directly: `psql -U postgres -d Protexxalearn`

---

**Last Updated**: January 9, 2026  
**Status**: ✅ Production Ready
