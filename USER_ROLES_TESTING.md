# 👥 Testing ProtexxaLearn as Different User Roles

## Quick Start: Seed Sample Data

First, populate the database with sample courses:

```bash
# From project root
node seedCourses.js
```

This creates:
- ✅ 5 sample courses
- ✅ 3 test user accounts
- ✅ Modules and lessons
- ✅ Student enrollment

---

## Test Accounts Created

### 1️⃣ **STUDENT Account**
```
Email:    student@example.com
Password: (set during registration if you register)
Role:     student
```

**What Students Can Do:**
- ✅ View available published courses
- ✅ Enroll in courses
- ✅ View course modules and lessons
- ✅ Track learning progress
- ✅ See assignments
- ✅ Submit assignments
- ❌ Create or modify courses

**Test Flow:**
1. Login with student account
2. Go to **Dashboard** → See enrolled courses
3. Click course → See modules
4. Click module → See lessons
5. Mark lessons as complete
6. View progress bar

---

### 2️⃣ **INSTRUCTOR Account**
```
Email:    instructor@example.com
Password: (set during registration if you register)
Role:     instructor
```

**What Instructors Can Do:**
- ✅ View all published courses (theirs + others)
- ✅ Create new courses
- ✅ Edit/update their own courses
- ✅ Add modules to courses
- ✅ Add lessons to modules
- ✅ View enrolled students
- ✅ Grade submissions
- ✅ Create assignments
- ❌ Delete other instructors' courses
- ❌ Access admin settings

**Test Flow:**
1. Login with instructor account
2. Go to **Dashboard** → See "Create Course" button
3. Click **Create Course** → Fill form → Publish
4. Course now appears in student dashboards
5. View enrollments and student progress
6. Create assignments for the course

---

### 3️⃣ **ADMIN Account**
```
Email:    admin@example.com
Password: (set during registration if you register)
Role:     admin
```

**What Admins Can Do:**
- ✅ View ALL courses (published + draft + archived)
- ✅ Create/edit/delete any course
- ✅ Manage all users
- ✅ View system health and analytics
- ✅ Modify course status (publish/draft/archive)
- ✅ Access admin dashboard
- ✅ View enrollment reports
- ✅ Grade all submissions

**Test Flow:**
1. Login with admin account
2. Go to **/admin/courses** → See all courses including drafts
3. Go to **/admin/users** → Manage user accounts
4. Create new courses
5. Change course status
6. View enrollment analytics

---

## Feature Testing Checklist

### 🎓 Learner Experience (Student)
- [ ] Register new student account
- [ ] Login successfully
- [ ] View Dashboard with stats
- [ ] See enrolled courses
- [ ] Browse available courses (if created more)
- [ ] Enroll in a course
- [ ] View course modules
- [ ] View lessons inside module
- [ ] Mark lesson as complete
- [ ] See progress update
- [ ] View assignment list
- [ ] Submit assignment
- [ ] See grade feedback

### 👨‍🏫 Instructor Experience
- [ ] Register as instructor
- [ ] Login successfully
- [ ] See "Create Course" button
- [ ] Create a new course with:
  - [ ] Title
  - [ ] Description
  - [ ] Content
- [ ] Course status set to "draft"
- [ ] Publish course to make visible to students
- [ ] Add modules to course
- [ ] Add lessons to modules
- [ ] Create assignments
- [ ] View student enrollments
- [ ] View submission scores
- [ ] Leave grade feedback

### 🛠️ Admin Experience
- [ ] Register as admin
- [ ] Access `/admin/courses` endpoint
- [ ] See all courses (including drafts)
- [ ] View course creation statistics
- [ ] Edit/delete any course
- [ ] Manage course status
- [ ] View all enrollments
- [ ] Create system announcements
- [ ] Check system health at `/health`

---

## API Testing (Command Line)

### Test As Student

```bash
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "teststudent@example.com",
    "password": "Test@1234",
    "role": "student"
  }'

# 2. Login to get token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teststudent@example.com",
    "password": "Test@1234"
  }' | jq '.token' -r > token.txt

# 3. Get courses (requires authentication)
TOKEN=$(cat token.txt)
curl http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN"

# 4. Enroll in course (ID = 1)
curl -X POST http://localhost:3000/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": YOUR_USER_ID, "course_id": 1}'
```

### Test As Instructor

```bash
# 1. Register as instructor
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Instructor",
    "email": "testinstructor@example.com",
    "password": "Test@1234",
    "role": "instructor"
  }'

# 2. Login and save token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testinstructor@example.com",
    "password": "Test@1234"
  }' | jq '.token' -r > instructor_token.txt

# 3. Create new course
TOKEN=$(cat instructor_token.txt)
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Awesome Course",
    "description": "Learn something amazing",
    "status": "draft"
  }'
```

### Test As Admin

```bash
# 1. Admin login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin"
  }' | jq '.token' -r > admin_token.txt

# 2. Get ALL courses (including drafts)
TOKEN=$(cat admin_token.txt)
curl http://localhost:3000/admin/courses \
  -H "Authorization: Bearer $TOKEN"

# 3. Publish a course
curl -X PUT http://localhost:3000/courses/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "published"}'
```

---

## Troubleshooting

### Can't Login?
```bash
# 1. Check if user exists
node -e "const pool = require('./db'); pool.query('SELECT * FROM users WHERE email = \$1', ['student@example.com']).then(r => console.log(r.rows[0])).catch(e => console.log('Error:', e.message))"

# 2. Verify password hash exists
node -e "const pool = require('./db'); pool.query('SELECT id, name, email, role, email_verified FROM users').then(r => console.table(r.rows)).catch(e => console.log('Error:', e.message))"
```

### Courses Not Showing?
```bash
# Check if published courses exist
node -e "const pool = require('./db'); pool.query('SELECT * FROM courses WHERE status = \\'published\\'').then(r => console.table(r.rows)).catch(e => console.log('Error:', e.message))"

# If empty, run:
node seedCourses.js
```

### 401 Unauthorized on API?
- Token might be expired (7 day limit)
- Login again to get fresh token
- Include `Authorization: Bearer TOKEN` header
- Token format must be exactly: `Authorization: Bearer eyJhbGc...`

---

## Next Steps After Testing

1. ✅ Verify all 3 roles work correctly
2. ✅ Test course creation workflow (as instructor)
3. ✅ Test enrollment (as student)
4. ✅ Test grading (as instructor on student submission)
5. 🔗 Set up custom domain (see CUSTOM_DOMAIN_GUIDE.md)
6. 🚀 Deploy to production
7. 📊 Monitor at Railway dashboard

---

## Live Testing URLs

**Development:**
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`
- API Docs: `http://localhost:3000/health`

**Production (After Deployment):**
- Frontend: `https://protexxalearn-app-production.up.railway.app`
- Backend: `https://protexxalearn-app-production.up.railway.app/api`
- API Docs: `https://protexxalearn-app-production.up.railway.app/health`

**With Custom Domain:**
- Frontend: `https://your-domain.com`
- Backend: `https://your-domain.com/api`
- API Docs: `https://your-domain.com/api/health`
