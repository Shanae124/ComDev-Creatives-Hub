# ProtexxaLearn - Enterprise Learning Management System

A complete, **enterprise-grade** Learning Management System built with **Node.js + Express + PostgreSQL + Next.js 15 + React 19 + TypeScript**.

![Status](https://img.shields.io/badge/status-production_ready-green)
![Node.js](https://img.shields.io/badge/node.js-22.x-green)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)
![Version](https://img.shields.io/badge/version-2.0.0_Enterprise-blue)

---

## 🎉 What's New in Version 2.0 (Enterprise Edition)

**Phase 2-4 Complete!** - 24 files, 8,400+ lines of production code added

### NEW: Advanced Enterprise Features

- ✅ **Multi-Tenant Organizations** - Custom branding, roles, and permissions per organization
- ✅ **SCORM 1.2/2004 Support** - Upload and track SCORM packages
- ✅ **xAPI/Tin Can API** - Learning Record Store (LRS) implementation
- ✅ **Learning Paths & Programs** - Sequential learning with prerequisites and drip content
- ✅ **Advanced Question Bank** - QTI import/export, question pools, randomization
- ✅ **Assessment Engine** - Auto-grading, timed tests, partial credit
- ✅ **Enterprise Gradebook** - Weighted categories, rubrics, CSV export
- ✅ **SSO Authentication** - SAML 2.0, OIDC, Google, Microsoft

**📚 Documentation:**
- [PHASE_2-4_IMPLEMENTATION_COMPLETE.md](./PHASE_2-4_IMPLEMENTATION_COMPLETE.md) - Full implementation details
- [PHASE_2-4_QUICK_START.md](./PHASE_2-4_QUICK_START.md) - Testing guide
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete REST API documentation (100+ endpoints)

---

## ✨ Features

### Core LMS (Phase 1)
- 📚 **Courses** - Create, organize, and manage courses
- 📖 **Modules & Lessons** - Hierarchical content structure
- 👥 **User Management** - Students, Instructors, Admins
- 📝 **Enrollments** - Easy course enrollment
- 🎯 **Progress Tracking** - Real-time student progress

### Enterprise Features (Phase 2-4)

#### Multi-Tenancy
- 🏢 **Organizations** - Isolated tenants with custom branding
- 🎨 **Custom Branding** - Logo, colors, domain per organization
- 👤 **Custom Roles** - Granular permission system
- 👥 **Cohorts** - Learner grouping and bulk enrollment

#### Content Standards
- 📦 **SCORM Support** - SCORM 1.2 and SCORM 2004 packages
- 🎓 **xAPI/Tin Can** - Learning Record Store (xAPI 1.0.3)
- 📊 **xAPI Analytics** - Actor summaries, activity statistics

#### Learning Paths
- 🛤️ **Programs** - Sequential learning paths
- 🔒 **Prerequisites** - Course dependencies
- ⏰ **Drip Content** - Time-based unlocking
- 📈 **Progress Tracking** - Multi-course completion

#### Assessments
- ❓ **Question Bank** - Multiple choice, T/F, short answer, essay
- 🎲 **Question Pools** - Random selection
- ⏱️ **Timed Tests** - Auto-submit on expiry
- ✅ **Auto-Grading** - Immediate results with partial credit
- 💾 **Auto-Save** - Progress saved every 30 seconds
- 📤 **QTI Import/Export** - Interoperability standard

#### Gradebook
- 📊 **Weighted Categories** - Assignments, quizzes, exams
- 📏 **Rubric Grading** - Criteria-based assessment
- 📝 **Letter Grades** - Automatic conversion (A-F)
- 📈 **Statistics** - Average, median, std deviation
- 💾 **CSV Export** - Downloadable reports

#### Single Sign-On
- 🔐 **SAML 2.0** - Enterprise SSO
- 🔑 **OpenID Connect** - Modern OAuth2-based SSO
- 🚀 **Quick Setup** - Google and Microsoft integration
- 📋 **Audit Logging** - Complete SSO activity trail

### Content Management
- 🌐 **Rich HTML Editor** - TinyMCE integration for course content
- 📄 **Lesson Types** - Reading, Video, Quiz, Assignment
- ⏱️ **Duration Tracking** - Lesson time tracking

### Additional Features
- 📢 **Announcements** - Course-wide announcements
- 🔐 **Authentication** - JWT-based auth with bcrypt
- 🔑 **Role-Based Access** - Admin, Instructor, Student roles
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - shadcn/ui components with Tailwind CSS

---

## 🏗️ Architecture

### Backend (Express REST API)
- **Framework**: Express.js 5.2.1 (Node.js 22.x)
- **Database**: PostgreSQL (Railway production)
- **Authentication**: JWT + bcrypt
- **APIs**: RESTful with 100+ endpoints
- **Services**: 8 enterprise services (3,500+ lines)
- **Routes**: 8 API route files (2,500+ lines)

### Frontend (Next.js 15 + React 19)
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **TypeScript**: Full type safety
- **Components**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Editor**: TinyMCE

### Database Schema (50+ Tables)
- Core LMS tables (users, courses, modules, lessons, enrollments)
- Organizations (multi-tenant isolation)
- SCORM (packages, SCOs, tracking)
- xAPI (statements, actors, verbs, activities)
- Programs (learning paths, sequences, progress)
- Question Bank (questions, pools)
- Assessments (quizzes, attempts, answers)
- Gradebook (categories, items, grades, rubrics)
- SSO (providers, mappings, sessions, logs)
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and setup backend**:
```bash
# Install backend dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Initialize database
node initdb.js
```

2. **Setup frontend**:
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

3. **Run the application**:

**Terminal 1 - Backend**:
```bash
npm start
# Or with auto-reload:
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## 📚 API Documentation

### Authentication
```
POST /auth/register - Create new account
POST /auth/login    - Login user
```

### Courses
```
GET    /courses              - List all courses
GET    /courses/:id          - Get course details
POST   /courses              - Create course (instructor/admin)
PUT    /courses/:id          - Update course
```

### Modules
```
GET    /courses/:id/modules  - Get modules for course
POST   /modules              - Create module
PUT    /modules/:id          - Update module
```

### Lessons
```
GET    /modules/:id/lessons  - Get lessons in module
GET    /lessons/:id          - Get lesson details
POST   /lessons              - Create lesson
PUT    /lessons/:id          - Update lesson
```

### Progress
```
POST   /lesson-progress      - Update lesson progress
GET    /lesson-progress/:id  - Get progress for lesson
GET    /courses/:id/progress - Get course progress
```

### Assignments
```
GET    /courses/:id/assignments    - Get assignments
POST   /assignments                - Create assignment
POST   /submissions                - Submit assignment
GET    /assignments/:id/submissions - Get all submissions
```

### Grades
```
POST   /grades                     - Create/update grade
GET    /courses/:id/grades         - Get grades for course
```

## 🗄️ Database Schema

**Core Tables**:
- `users` - User accounts with roles
- `courses` - Course definitions
- `modules` - Course modules
- `lessons` - Individual lessons
- `enrollments` - Student course enrollments
- `lesson_progress` - Student progress tracking
- `assignments` - Assignment definitions
- `submissions` - Student submissions
- `grades` - Assignment grades
- `announcements` - Course announcements
- `audit_logs` - Activity logging

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing
- ✅ CORS configuration
- ✅ Role-based access control
- ✅ SQL parameter binding (prevents injection)
- ✅ Request validation
- ✅ Error logging

## 📊 Scalability Considerations

- Database indexes on frequently queried fields
- Connection pooling (pg)
- Pagination-ready API design
- Efficient joins to prevent N+1 queries
- Asset separation (frontend/backend)
- Stateless backend for easy horizontal scaling

## 🛠️ Development

### Code Structure
```
ProtexxaLearn/
├── server.js            # Main API server
├── db.js                # Database connection
├── middleware.js        # Auth middleware
├── initdb.js            # Database initialization
└── frontend/
    ├── src/
    │   ├── pages/       # Page components
    │   ├── components/  # Reusable components
    │   ├── services/    # API services
    │   ├── store/       # Zustand stores
    │   └── styles/      # CSS files
```

### Common Tasks

**Create a new course**:
```bash
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python 101",
    "description": "Learn Python basics",
    "content_html": "<p>Welcome to Python 101</p>"
  }'
```

**Enroll a student**:
```bash
curl -X POST http://localhost:3000/enroll \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "course_id": 1}'
```

## 🤝 Integration with Brightspace

To migrate from Brightspace:
1. Export course content from Brightspace (typically as .imscc or ZIP)
2. Use `BrightspaceMigrator` tool to parse and convert
3. Import content into ProtexxaLearn via API
4. Verify all content and structure

Migration support coming in v1.1

## 📈 Production Deployment

Before going live:
- [ ] Set strong JWT_SECRET in .env
- [ ] Configure PostgreSQL with backups
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Test under load (1000+ concurrent users)
- [ ] Set up automated backups
- [ ] Configure CDN for static assets

## 🐛 Troubleshooting

**Database connection error**:
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify .env credentials
cat .env
```

**Port already in use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Frontend not loading**:
- Clear browser cache
- Check that backend is running
- Verify VITE_API_URL in frontend/.env

## 📝 License

ISC

## 👨‍💻 Support

For issues or questions, create an issue in the repository.

---

**ProtexxaLearn** - Built for modern education. 🎓
