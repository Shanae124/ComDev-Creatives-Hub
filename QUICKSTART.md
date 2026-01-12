# 🚀 ProtexxaLearn - Quick Start Guide

## 5-Minute Setup

### Step 1: Initialize Database
```bash
node initdb.js
```
This creates all tables and prepares PostgreSQL for your LMS.

### Step 2: Start Backend Server
**Terminal 1:**
```bash
npm start
```
Backend runs at: **http://localhost:3000**

### Step 3: Start Frontend
**Terminal 2:**
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

### Step 4: Create Your First Account
1. Open http://localhost:5173
2. Click "Register"
3. Fill in:
   - Name: `Admin User`
   - Email: `admin@example.com`
   - Password: `securepass123`
   - Role: `admin`
4. Click "Register"

### Step 5: Create a Course
1. From dashboard, click "➕ New Course"
2. Enter course details
3. Add rich content using the HTML editor
4. Click "Create Course"

### Step 6: Add Modules & Lessons
1. View your course
2. Create modules (course sections)
3. Add lessons to modules
4. Each lesson can have:
   - Rich HTML content
   - Duration (minutes)
   - Lesson type (reading, video, quiz)

---

## 📊 Test Data Script

Create test courses and users:

```bash
# Run test data setup
node scripts/seedData.js
```

This will create:
- 5 test users (admin, instructors, students)
- 3 sample courses
- 10+ lessons with content
- Sample assignments

---

## 🎯 Common Tasks

### Add a Student User
```bash
# Use the API directly
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Student",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Enroll Student in Course
```bash
# First, get the token from login response
# Then enroll:
curl -X POST http://localhost:3000/enroll \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2, "course_id": 1}'
```

### Create Assignment
```bash
curl -X POST http://localhost:3000/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "title": "Essay Assignment",
    "description_html": "<p>Write a 500-word essay...</p>",
    "due_date": "2024-02-01T23:59:59Z",
    "points_possible": 100,
    "submission_type": "text"
  }'
```

### View Student Progress
```bash
curl -X GET http://localhost:3000/courses/1/progress \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

---

## 🔧 Admin Dashboard

Access admin functions:
1. Create/edit courses
2. Create/edit modules and lessons
3. View enrollments
4. Grade assignments
5. View student progress
6. Post announcements

---

## 📱 Mobile & Responsive

The interface automatically adapts to:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 🖥️ Desktop (1024px+)

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Try again
npm start
```

### Database connection error
```bash
# Make sure PostgreSQL is running
# Check credentials in .env file

# Test connection
psql -U postgres -h localhost -d Protexxalearn
```

### Frontend not loading
```bash
# Clear node_modules and reinstall
cd frontend
rm -r node_modules
npm install
npm run dev
```

---

## 📚 Documentation

- **API Docs**: See [README.md](README.md)
- **Production**: See [PRODUCTION_GUIDE.md](PRODUCTION_GUIDE.md)
- **Architecture**: See [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

## 🎓 Features Overview

### For Students
✅ Browse and enroll in courses
✅ View lessons and complete them
✅ Track progress with visual indicators
✅ Submit assignments
✅ View grades and feedback
✅ Responsive mobile interface

### For Instructors
✅ Create and manage courses
✅ Build course structure (modules/lessons)
✅ Create assignments with due dates
✅ Grade student submissions
✅ Provide feedback
✅ View student progress reports
✅ Post course announcements

### For Admins
✅ Manage all courses and users
✅ View system analytics
✅ Manage user roles
✅ System-wide reporting
✅ User account management

---

## 🚀 Next Steps

1. ✅ Database initialized
2. ✅ Backend running
3. ✅ Frontend running
4. 📝 Create your first course
5. 👥 Add students
6. ✏️ Create assignments
7. 📊 Monitor progress
8. 🚀 Go live!

---

## 💡 Tips & Tricks

**Use the Rich Editor**:
- Format text (bold, italic, underline)
- Add links and images
- Embed videos
- Create lists and tables

**Track Progress**:
- Students see completion percentage
- Auto-tracks time spent
- Visual progress bars

**Responsive Design**:
- Test on mobile/tablet
- All features accessible
- Touch-friendly buttons

---

## 🆘 Need Help?

- Check [README.md](README.md) for API documentation
- Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for architecture
- Check browser console for errors (F12)
- Review server logs in terminal

---

**ProtexxaLearn** - Built for educators, powered by technology. 🎓

Ready to launch your learning platform!
