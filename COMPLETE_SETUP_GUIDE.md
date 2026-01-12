# ✨ ProtexxaLearn - Complete Setup & Testing Guide

## 🚀 Phase 1: Setup Locally (Development)

### Step 1: Install Dependencies
```bash
cd c:\Users\tiffa\ProtexxaLearn
npm install
```

### Step 2: Initialize Database
```bash
node initdb.js
```

Expected output:
```
✅ Database initialized
✅ Schema created
```

### Step 3: Seed Sample Data
```bash
node seedCourses.js
```

Expected output:
```
✅ Created course: Web Development Fundamentals
✅ Created course: Advanced JavaScript Concepts
✅ Created course: React.js for Beginners
✅ Created course: Database Design & SQL
✅ Created course: Introduction to Python
  📚 Created module: HTML Basics
  📚 Created module: CSS Styling
  📚 Created module: JavaScript Introduction
    📖 Created lesson: What is HTML?
    ... (more lessons)
✅ Enrolled student in: Web Development Fundamentals

Test accounts created:
  📧 Instructor: instructor@example.com
  📧 Student: student@example.com
  📧 Admin: admin@example.com
```

### Step 4: Start Development Servers

**Terminal 1 - Backend (Port 3000):**
```bash
npm run backend
```

Expected output:
```
✅ Server running on http://localhost:3000
✅ Database connected
✅ CORS enabled for: http://localhost:3001
```

**Terminal 2 - Frontend (Port 3001):**
```bash
npm run dev
```

Expected output:
```
  ▲ Next.js 16.x.x
  ◇ Local: http://localhost:3001
```

---

## 🎯 Phase 2: Test All Three User Roles

### 👨‍🎓 **Test 1: Student Journey**

1. Go to `http://localhost:3001`
2. Click **Login**
3. Enter credentials:
   - Email: `student@example.com`
   - Password: (any password if you created one during registration)
   
   *Alternative: Use seed password if created*

4. **Dashboard** should show:
   - ✅ Welcome message with student name
   - ✅ "Web Development Fundamentals" in courses
   - ✅ Progress tracker showing "0%" initially
   - ✅ Module list with "HTML Basics", "CSS Styling", "JavaScript"

5. **Click a Course:**
   - See modules list
   - Click "HTML Basics" module
   - View lessons: "What is HTML?", "HTML Tags and Elements", "Forms and Input"
   - Click a lesson to view content

6. **Mark Progress:**
   - After viewing a lesson, mark it as "Complete"
   - See progress bar update
   - Progress percentage should increase

**✅ Student Test Passed if:** Can view courses, modules, lessons, and track progress

---

### 👨‍🏫 **Test 2: Instructor Journey**

1. Go to `http://localhost:3001`
2. Click **Login** → Register new instructor account:
   - Name: `Your Name`
   - Email: `youremail@example.com`
   - Password: `Secure@123`
   - **Role: Instructor** (select from dropdown)

3. After login, **Dashboard** should show:
   - ✅ "Create Course" button (visible only to instructors)
   - ✅ Stats about "Students Enrolled" instead of "Assignments"
   - ✅ Existing published courses in courses section

4. **Create a New Course:**
   - Click "Create Course"
   - Fill in:
     - Title: "Advanced Python Programming"
     - Description: "Master Python for data science"
     - Choose status: "Draft" (to test before publishing)
   - Click "Save"

5. **Add Modules to Course:**
   - Course should appear in dashboard
   - Click on course
   - Click "Add Module"
   - Fill in: "Module 1: Basics"
   - Save

6. **Add Lessons to Module:**
   - Click module
   - Click "Add Lesson"
   - Fill in: "Lesson 1: Introduction"
   - Add content
   - Save

7. **Publish Course:**
   - Go back to course
   - Change status from "Draft" → "Published"
   - Now students will see this course

8. **View Enrollments:**
   - Click course
   - See "Enrolled Students: 0" initially
   - (If a student enrolls later, this number updates)

**✅ Instructor Test Passed if:** Can create course, add modules/lessons, and publish

---

### 🔐 **Test 3: Admin Journey**

1. Go to `http://localhost:3001`
2. Click **Login**
3. Enter credentials:
   - Email: `admin@example.com`
   - Password: (set if you created during registration)

4. **Admin Dashboard** should show:
   - ✅ Enhanced stats and analytics
   - ✅ "All Courses" section (includes draft courses)
   - ✅ All 5 sample courses visible (including drafts)
   - ✅ Admin-only controls

5. **Admin Course Management:**
   - Go to `/admin/courses` endpoint
   - See all courses (published + draft + archived)
   - Can edit/delete ANY course
   - Can change course status directly

6. **User Management:**
   - Go to `/admin/users` endpoint (if available)
   - See all user accounts created
   - Can view student progress
   - Can manage user roles

7. **System Health:**
   - Visit `/health` endpoint
   - See database status
   - See memory usage
   - Verify all services running

**✅ Admin Test Passed if:** Can see all courses (including drafts), access admin endpoints

---

## 📊 Phase 3: Verify Full Workflow

### Complete User Journey Test

**Step 1: Student Enrolls**
- Student logs in
- Browses available courses
- Clicks "Enroll" on a course
- Course now appears in their dashboard

**Step 2: Instructor Creates Content**
- Instructor creates new course
- Adds modules with lessons
- Publishes course
- Course becomes visible to students

**Step 3: Student Completes Course**
- Student views modules and lessons
- Marks lessons as complete
- Progress bar updates
- (Optional) Views assignments and submits work

**Step 4: Instructor Grades Work**
- Instructor views student submissions
- Leaves feedback/grades
- Student sees grade in dashboard

---

## 🌐 Phase 4: Deploy to Railway (Production)

### Step 1: Check Deployment Status
```bash
railway status
```

### Step 2: If Service Not Running
```bash
railway up --detach
```

Wait 2-3 minutes for build to complete.

### Step 3: Initialize Production Database
```bash
railway run node initdb.js
```

### Step 4: Seed Production Data
```bash
railway run node seedCourses.js
```

### Step 5: Test Live Site
- Visit: `https://protexxalearn-app-production.up.railway.app`
- Register a new account
- Login and verify courses display
- Test enrollment and progress

---

## 🎁 Phase 5: Get Custom Domain

**Quick Option (Instant - No Cost):**
- Use Railway's free domain: `protexxalearn-app-production.up.railway.app`
- This is fully functional and SSL-secured

**Professional Option ($8.88/year):**
1. Buy domain on Namecheap
2. Point nameservers to Railway
3. Configure in Railway dashboard
4. Wait 24-48 hours for DNS

See [CUSTOM_DOMAIN_GUIDE.md](./CUSTOM_DOMAIN_GUIDE.md) for detailed instructions.

---

## ✅ Final Verification Checklist

- [ ] Backend server runs without errors
- [ ] Frontend loads at localhost:3001
- [ ] Student can login and see courses
- [ ] Instructor can create a course
- [ ] Admin can see all courses including drafts
- [ ] Courses display in dashboard (not just "No courses yet")
- [ ] Can enroll in a course
- [ ] Can view modules inside a course
- [ ] Can view lessons inside a module
- [ ] Progress tracking works
- [ ] Production deployment successful
- [ ] Custom domain working (if purchased)

---

## 🆘 Troubleshooting

### "No courses enrolled yet" on student dashboard?
```bash
# Check if student is enrolled
node -e "const pool = require('./db'); pool.query('SELECT * FROM enrollments WHERE user_id = 2').then(r => console.table(r.rows)).catch(e => console.log('Error:', e.message))"
```

**Solution:** Enroll student using API or UI, or run `seedCourses.js` which auto-enrolls the student.

### "Failed to load courses" error?
```bash
# Check if courses exist
node -e "const pool = require('./db'); pool.query('SELECT * FROM courses WHERE status = \\'published\\'').then(r => console.table(r.rows)).catch(e => console.log('Error:', e.message))"
```

**Solution:** Run `node seedCourses.js` to create sample courses.

### Login not working?
```bash
# Verify user exists and is verified
node -e "const pool = require('./db'); pool.query('SELECT email, role, email_verified FROM users').then(r => console.table(r.rows)).catch(e => console.log('Error:', e.message))"
```

**Solution:** User must have `email_verified = true` to login. Check [USER_ROLES_TESTING.md](./USER_ROLES_TESTING.md) for API instructions.

### Backend on Railway won't start?
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway env`
3. Check build logs in Railway dashboard
4. Redeploy: `railway up --detach`

---

## 📱 Quick Test Commands

```bash
# Backend health
curl http://localhost:3000/health

# List all published courses
curl http://localhost:3000/courses

# Get admin courses (requires token)
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/admin/courses

# Register student
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"Test@123","role":"student"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"pass"}' | jq '.token'
```

---

## 🎉 You're Ready!

Your LMS is now:
- ✅ Deployed locally and on Railway
- ✅ Has sample data for testing
- ✅ Supports three user roles
- ✅ Ready for demonstration

**Next:** Show your deployed site at `https://protexxalearn-app-production.up.railway.app` to stakeholders!

---

**Questions?** Check:
- [CUSTOM_DOMAIN_GUIDE.md](./CUSTOM_DOMAIN_GUIDE.md) - Domain setup
- [USER_ROLES_TESTING.md](./USER_ROLES_TESTING.md) - Detailed role testing
- [RAILWAY_QUICK_GUIDE.md](./RAILWAY_QUICK_GUIDE.md) - Deployment help
