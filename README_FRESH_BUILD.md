# ProtexxaLearn - LMS Backend & Frontend (Fresh Build)

A fully functional Learning Management System built with Node.js/Express backend and React frontend.

## 🚀 Quick Start (30 seconds)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run init-db
npm run dev

# Terminal 2: Frontend  
cd frontend
npm install
npm run dev

# Open http://localhost:5173
```

## ✨ Features

- ✅ **User Authentication** - Register, login, role-based access (Student/Instructor/Admin)
- ✅ **Course Management** - Create, edit, delete courses (instructors only)
- ✅ **Course Structure** - Organize with modules and lessons
- ✅ **Rich Content Editor** - HTML WYSIWYG editor for lesson content
- ✅ **File Uploads** - Attach documents, PDFs, images to lessons
- ✅ **Canvas Preview** - Visual preview of lesson content
- ✅ **Student Enrollment** - Browse and enroll in courses
- ✅ **Progress Tracking** - Mark lessons as complete, track progress
- ✅ **Responsive UI** - Works on desktop, tablet, mobile

## 📁 Project Structure

```
ProtexxaLearn/
├── backend/                    # Express REST API
│   ├── config/
│   │   └── db.js              # PostgreSQL connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── auth.js            # User auth endpoints
│   │   ├── courses.js         # Course CRUD
│   │   ├── modules.js         # Module management
│   │   ├── lessons.js         # Lesson content & uploads
│   │   ├── enrollments.js     # Student enrollment
│   │   └── progress.js        # Completion tracking
│   ├── scripts/
│   │   └── initdb.js          # Database setup
│   ├── server.js              # Main Express app
│   └── package.json
│
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state management
│   │   ├── components/
│   │   │   ├── CourseEditor.jsx    # Rich HTML editor
│   │   │   ├── CanvasPreview.jsx   # Content preview
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── CoursePage.jsx
│   │   │   └── LessonPage.jsx
│   │   └── App.jsx
│   └── package.json
│
├── WORKING_IMPLEMENTATION.md   # Complete feature guide
├── API_DOCUMENTATION.md        # REST API reference
├── INSTALLATION_TESTING.md     # Setup & testing
└── FRESH_START.md              # Quick reference
```

## 🔧 Installation

### Prerequisites
- Node.js 18+ - [Download](https://nodejs.org)
- PostgreSQL 12+ - [Download](https://www.postgresql.org/download/)

### Backend Setup

1. **Install dependencies & configure**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

2. **Edit `.env` with your PostgreSQL credentials**
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/protexxalearn
   JWT_SECRET=your_secret_key_here
   PORT=3000
   ```

3. **Initialize database**
   ```bash
   npm run init-db
   ```

4. **Start server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Install dependencies & configure**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📖 Usage Guide

### For Instructors

1. **Register** with role "Instructor"
2. **Create Course** - Add title and description
3. **Organize Content** - Create modules, add lessons
4. **Create Lessons** - Use rich HTML editor
   - Format text (bold, italic, headings)
   - Add links and images
   - Create lists and code blocks
5. **Upload Materials** - Attach PDFs, documents, etc.
6. **View Analytics** - See which students are enrolled and their progress

### For Students

1. **Register** with role "Student"
2. **Browse Courses** - See all available courses
3. **Enroll** - Click enroll on any course
4. **View Content** - Read lesson materials
5. **Track Progress** - Mark lessons complete
6. **Download Files** - Access uploaded materials

## 🔑 Key API Endpoints

### Authentication
```
POST /api/auth/register        # Create new user
POST /api/auth/login           # Login user
```

### Courses
```
GET  /api/courses              # List all courses
GET  /api/courses/:id          # Get course with modules
POST /api/courses              # Create course (instructor)
PUT  /api/courses/:id          # Update course
DEL  /api/courses/:id          # Delete course
```

### Lessons & Content
```
POST /api/lessons              # Create lesson
GET  /api/lessons/:id          # Get lesson with attachments
PUT  /api/lessons/:id          # Update lesson content
POST /api/lessons/:id/upload   # Upload file to lesson
```

### Enrollment & Progress
```
POST /api/enrollments          # Enroll user in course
GET  /api/enrollments          # Get user's enrollments
POST /api/progress/:id/complete  # Mark lesson complete
GET  /api/progress/course/:id    # Get course progress
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

### Manual API Testing with cURL

1. **Register User**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "instructor@example.com",
       "password": "password123",
       "firstName": "John",
       "lastName": "Doe",
       "role": "instructor"
     }'
   ```

2. **Create Course**
   ```bash
   TOKEN="<token-from-register>"
   curl -X POST http://localhost:3000/api/courses \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "title": "JavaScript Basics",
       "description": "Learn JavaScript"
     }'
   ```

See [INSTALLATION_TESTING.md](./INSTALLATION_TESTING.md) for detailed testing guide.

## 🎨 Frontend Features

### Rich HTML Editor
- WYSIWYG editor with formatting toolbar
- Supports tables, images, videos, code blocks
- Real-time preview with canvas

### Responsive Design
- Mobile-first layout
- Tailwind CSS styling
- Works on all devices

### State Management
- React Context for authentication
- Persistent login with localStorage
- Automatic session restoration

## 🗄️ Database Schema

**7 Core Tables:**
- `users` - User accounts with roles
- `courses` - Course information
- `modules` - Course modules for organization
- `lessons` - Individual lessons with HTML content
- `lesson_attachments` - Uploaded files
- `enrollments` - Student course enrollment
- `lesson_progress` - Completion tracking

All tables include timestamps and cascading deletes for data integrity.

## 🔐 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT authentication with 7-day expiration
- ✅ Role-based access control (RBAC)
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled for cross-origin requests (dev mode)

## 📝 Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/protexxalearn
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

### Frontend `.env.local`
```
REACT_APP_API_URL=http://localhost:3000/api
```

## 🚢 Deployment

For production deployment:
- Backend: Deploy to Railway, Heroku, AWS, or self-hosted
- Frontend: Deploy to Vercel, Netlify, or CDN
- Database: Use managed PostgreSQL (AWS RDS, Railway, etc.)
- Storage: Use S3 or cloud storage for files

See deployment documentation for specific platform instructions.

## 📚 Documentation

- [WORKING_IMPLEMENTATION.md](./WORKING_IMPLEMENTATION.md) - Complete feature walkthrough
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Full REST API reference
- [INSTALLATION_TESTING.md](./INSTALLATION_TESTING.md) - Setup and testing guide
- [FRESH_START.md](./FRESH_START.md) - Quick reference guide

## 🆘 Troubleshooting

### Database connection fails
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify database exists: `createdb protexxalearn`

### Port already in use
- Change PORT in backend `.env`
- Or kill process: `lsof -i :3000` then `kill -9 <PID>`

### CORS errors
- Check REACT_APP_API_URL in frontend `.env.local`
- Ensure backend server is running

### Files not uploading
- Verify `/uploads` directory exists in backend
- Check file permissions
- Review browser console for errors

## 🤝 Contributing

This is a fresh build ready for further development. Feel free to:
- Add more features
- Improve UI/UX
- Add tests
- Optimize performance

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

**Ready to go!** Your LMS is fully functional. Start by registering as an instructor and creating your first course.

For questions or issues, refer to the documentation files in the root directory.
