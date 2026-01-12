# ProtexxaLearn - Professional Learning Management System

A complete, production-ready Learning Management System built with **Node.js + Express + PostgreSQL + Next.js + TypeScript**.

![Status](https://img.shields.io/badge/status-production_ready-green)
![Node.js](https://img.shields.io/badge/node.js-22.x-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Database](https://img.shields.io/badge/database-PostgreSQL-blue)

## ✨ Features

### Core LMS
- 📚 **Courses** - Create, organize, and manage courses
- 📖 **Modules & Lessons** - Hierarchical content structure
- 👥 **User Management** - Students, Instructors, Admins
- 📝 **Enrollments** - Easy course enrollment
- 🎯 **Progress Tracking** - Real-time student progress

### Content Management
- 🌐 **Rich HTML Editor** - TinyMCE integration for course content
- 📄 **Lesson Types** - Reading, Video, Quiz, Assignment
- ⏱️ **Duration Tracking** - Lesson time tracking

### Assignments & Grading
- ✏️ **Assignments** - Create assignments with due dates
- 📤 **Submissions** - Student submission handling
- ⭐ **Grading** - Instructor grading with feedback
- 📊 **Grade Tracking** - Comprehensive grade reports

### Additional Features
- 📢 **Announcements** - Course-wide announcements
- 🔐 **Authentication** - JWT-based auth with bcrypt
- 🔑 **Role-Based Access** - Admin, Instructor, Student roles
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Clean, intuitive interface

## 🏗️ Architecture

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT + bcrypt
- **APIs**: RESTful with comprehensive endpoints

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Editor**: TinyMCE
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
