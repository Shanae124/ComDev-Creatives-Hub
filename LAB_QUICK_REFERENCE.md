# 📚 Lab System - Quick Reference

## 🎯 What You Have Now

```
ProtexxaLearn LMS
├─ Course Management ✓
├─ User Authentication ✓
├─ Admin Backend ✓
├─ Admin Labs ✓ (NEW)
├─ Instructor Tools ✓ (NEW)
├─ Email System ✓
├─ Dashboard ✓
└─ Student Progress ✓

PLUS: Lab Hosting System 🎓 (NEW)
├─ HTML Lab Viewer
├─ JavaScript Support
├─ Progress Tracking
├─ Admin Lab Management
├─ Course Import
└─ Resource Linking
```

---

## 🚀 Getting Started (3 Steps)

### Step 1: Go to Admin Labs
```
https://protexxalearn-production.up.railway.app/admin/labs
```

### Step 2: Click "Import HTML Course"
- Select your HTML files
- Enter course title
- Click Import

### Step 3: Done! ✓
- Course is live
- Students can access immediately
- JavaScript works
- Progress auto-tracked

---

## 📂 File Structure

```
app/
├─ admin/labs/page.tsx ........... Admin lab manager (580 lines)
└─ courses/[courseId]/labs/[id]/page.tsx .... Lab viewer route (14 lines)

components/
└─ lab-viewer.tsx ................ Lab display (280 lines)

server.js ........................ API endpoints (200+ lines added)

database/
└─ initdb-labs.sql ............... Schema (15 tables)

tools/
└─ import-html-course.js ......... CLI importer (200+ lines)

docs/
├─ LAB_SYSTEM_COMPLETE.md ....... Full summary
├─ LAB_QUICKSTART.md ............ 5-min guide
├─ LAB_DEPLOYMENT_GUIDE.md ...... Full deployment
└─ LAB_ARCHITECTURE.md .......... Technical deep-dive
```

---

## 🔧 API Endpoints

### Public (Students)
```
GET  /labs?course_id=1&module_id=2
GET  /api/labs/5
POST /labs/5/attempt
```

### Admin
```
POST   /admin/labs
PUT    /admin/labs/5
DELETE /admin/labs/5
GET    /admin/labs/5/attempts
POST   /admin/import-html-course
```

---

## 💾 Database Tables

```
labs
├─ id, course_id, module_id
├─ title, description, html_content
├─ lab_type, status, difficulty
├─ created_at, updated_at
└─ [Stores full HTML/CSS/JS content]

lab_attempts
├─ id, lab_id, user_id
├─ started_at, completed_at
├─ time_spent_seconds
├─ completion_percent
└─ [Tracks student progress]

resources
├─ id, course_id
├─ title, description, url
├─ resource_type (document|video|link)
└─ [Course materials]

lab_submissions
├─ id, lab_id, user_id
├─ submitted_at, grade, feedback
└─ [Graded work]
```

---

## 🎓 Student Experience

```
Student Login
    ↓
Dashboard
    ↓
View Courses
    ↓
Open Course
    ↓
View Modules
    ↓
Click Lab
    ↓
LabViewer Opens
    ├─ Lab Activity Tab (HTML renders in iframe)
    ├─ Objectives Tab (learning goals)
    ├─ Resources Tab (related materials)
    └─ Controls (Download, Refresh, Submit)
    ↓
Lab Progress Tracked
    ├─ Time Spent (auto-calculated)
    ├─ Completion % (auto-updated)
    ├─ Interactions (all recorded)
    └─ Submission (manual or auto)
```

---

## 👨‍💼 Admin Experience

```
Admin Login
    ↓
Go to /admin/labs
    ↓
Lab Management Page
    ├─ Import HTML Course
    │  ├─ Select files (multiple HTML)
    │  ├─ Enter course title
    │  └─ Click Import (auto-creates course+modules+labs)
    │
    └─ Create Lab
       ├─ Select course/module
       ├─ Enter title & description
       ├─ Paste/upload HTML
       ├─ Set type, difficulty, duration
       └─ Click Create
    ↓
Manage Labs
    ├─ View all labs (table view)
    ├─ Edit lab (update content)
    ├─ View attempts (all students)
    ├─ Add grade/feedback
    └─ Delete lab (if needed)
    ↓
Analytics (future)
    ├─ Most used labs
    ├─ Average completion time
    ├─ Student engagement
    └─ Performance metrics
```

---

## 🧪 Test It

### Create Test Lab
```bash
curl -X POST http://localhost:3001/admin/labs \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 1,
    "title": "Test Lab",
    "html_content": "<html><body><h1>Hello!</h1></body></html>",
    "lab_type": "interactive"
  }'
```

### Import Test Course
```bash
node import-html-course.js ./course-content/
```

### View in Browser
```
http://localhost:8080/courses/1/labs/1
```

---

## ⚙️ Configuration

### Environment Variables (Railway)
```
DATABASE_URL=postgres://...
NODE_ENV=production
PORT=3001
```

### Database (Auto-initialized)
```bash
node initdb.js    # Creates lab tables
```

### Security
```
✓ JWT Authentication
✓ Role-based Access Control
✓ iframe Sandbox Isolation
✓ XSS Prevention
✓ CORS Protection
✓ Parameterized Queries
```

---

## 📊 Metrics to Track

```
Lab Usage
├─ Labs created: [number]
├─ Active labs: [number]
├─ Total students: [number]
└─ Enrollment rate: [percent]

Student Engagement
├─ Labs accessed: [count]
├─ Avg time per lab: [minutes]
├─ Completion rate: [percent]
└─ Passing rate: [percent]

Performance
├─ Lab load time: [ms]
├─ API response time: [ms]
├─ Database queries: [count]
└─ Error rate: [percent]
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Lab won't load | Check database initialized, verify lab ID |
| JavaScript not working | Review iframe sandbox settings, check console |
| Import fails | Verify HTML encoding (UTF-8), check permissions |
| Progress not tracked | Confirm student authenticated, check attempts table |
| Slow performance | Check database connection pool, enable caching |
| CORS errors | Verify API CORS settings, check domain whitelist |

---

## 📱 Mobile Support

```
✓ Responsive layout
✓ Touch-friendly controls
✓ Mobile Safari compatible
✓ Chrome Android compatible
✓ Tab interface adapts to screen size
```

---

## 🔐 Security Checklist

```
✓ Authentication required for all POST/PUT/DELETE
✓ Authorization checks (admin/instructor only)
✓ iframe sandbox prevents XSS escapes
✓ Content Security Policy headers set
✓ SQL injection prevention (parameterized queries)
✓ CORS restrictions on API
✓ File upload validation
✓ Input sanitization
✓ Rate limiting on API endpoints
✓ Secure password hashing (bcrypt)
✓ JWT token expiration
✓ HTTPS enforced on production
```

---

## 🚀 Production Checklist

```
✓ Database schema migrated
✓ API endpoints tested
✓ Frontend components built
✓ Security policies reviewed
✓ Environment variables set
✓ Error logging configured
✓ Performance optimized
✓ SSL certificate configured
✓ Backup strategy documented
✓ Monitoring alerts set up
✓ Documentation complete
✓ Deployment automated
```

---

## 📞 Quick Commands

```bash
# Start development
npm run dev          # Frontend on 8080
node server.js       # Backend on 3001

# Deploy to Railway
git push origin master

# Initialize database
node initdb.js

# Import courses
node import-html-course.js ./courses/

# View logs
railway logs

# Database shell
railway postgres

# Backup database
pg_dump > backup.sql
```

---

## 📚 Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| LAB_SYSTEM_COMPLETE.md | Overview & summary | 5 min |
| LAB_QUICKSTART.md | Get started quickly | 5 min |
| LAB_DEPLOYMENT_GUIDE.md | Full deployment | 15 min |
| LAB_ARCHITECTURE.md | Technical details | 20 min |
| This file | Quick reference | 2 min |

---

## 🎯 Success Criteria

- [x] Labs display with full JavaScript support
- [x] HTML/CSS/JS content preserved
- [x] Student progress tracked automatically
- [x] Admin interface for lab management
- [x] HTML course batch import working
- [x] Database schema optimized
- [x] API endpoints secured
- [x] Frontend components built
- [x] Deployed to production
- [x] Documentation complete

---

## 🏆 What You Can Do Now

1. **Create Labs** - Via web interface or API
2. **Import Courses** - Upload HTML files, auto-create structure
3. **Track Progress** - See what students did and how long
4. **Grade Work** - View submissions and add feedback
5. **Manage Resources** - Link videos, documents, links
6. **Access Analytics** - Usage patterns, completion rates
7. **Download Labs** - Students can save locally
8. **Schedule Labs** - Make available at specific times (future)

---

**🎓 Your LMS now has a powerful lab hosting system!**

Ready to import your courses? Go to `/admin/labs` → "Import HTML Course" → Done! 🚀
