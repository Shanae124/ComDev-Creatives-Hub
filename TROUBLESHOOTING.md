# ProtexxaLearn - Quick Troubleshooting Guide

## Common Issues & Solutions

### 🔴 Backend Won't Start

#### Error: "listen EADDRINUSE: address already in use :::3000"
**Problem:** Port 3000 is already in use
**Solution:**
```bash
# Windows - Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

#### Error: "Cannot find module './config/db'"
**Problem:** Directory structure incomplete
**Solution:**
```bash
cd backend
npm install
# Verify all files exist in backend/ directory
```

#### Error: "Cannot connect to the database server"
**Problem:** PostgreSQL not running
**Solution:**
```bash
# Windows - Start PostgreSQL
# Services > PostgreSQL > Start

# Mac
brew services start postgresql

# Linux
sudo service postgresql start

# Verify connection
psql -U postgres -h localhost
```

#### Error: "password authentication failed for user 'postgres'"
**Problem:** Wrong PostgreSQL credentials
**Solution:**
```bash
# Test connection
psql -U postgres -h localhost

# Update backend/.env with correct credentials
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/protexxalearn

# Retry
npm run init-db
```

---

### 🔴 Frontend Won't Start

#### Error: "npm: command not found"
**Problem:** Node.js not installed
**Solution:**
- Install Node.js 18+ from [nodejs.org](https://nodejs.org)
- Verify: `node --version` and `npm --version`

#### Error: "Port 5173 already in use"
**Problem:** Another process using port 5173
**Solution:**
```bash
# Change Vite port in frontend/vite.config.js or use
npm run dev -- --port 3000
```

#### Error: "Module not found: react-quill"
**Problem:** Dependencies not installed
**Solution:**
```bash
cd frontend
npm install
npm run dev
```

---

### 🔴 Database Issues

#### Error: "Database 'protexxalearn' does not exist"
**Problem:** Database not created
**Solution:**
```bash
# Create database
createdb protexxalearn

# Then run init
cd backend
npm run init-db
```

#### Error: "Table already exists"
**Problem:** Running init-db multiple times
**Solution:**
```bash
# Safe to run multiple times (uses IF NOT EXISTS)
npm run init-db

# Or reset database
dropdb protexxalearn
createdb protexxalearn
npm run init-db
```

#### Error: "Relation 'users' does not exist"
**Problem:** Database tables not initialized
**Solution:**
```bash
cd backend
npm run init-db
```

---

### 🔴 Authentication Issues

#### Error: "401 Unauthorized" or "Invalid token"
**Problem:** Missing or expired token
**Solution:**
1. Login again to get fresh token
2. Token stored in localStorage automatically
3. Check browser DevTools > Application > localStorage

#### Error: "Token not provided"
**Problem:** Not including Authorization header
**Solution:**
Frontend automatically adds header. If using cURL:
```bash
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/courses
```

#### Error: "Insufficient permissions"
**Problem:** User role doesn't have access
**Solution:**
- Only instructors/admins can create courses
- Use instructor role when registering for instructor access

---

### 🔴 API Issues

#### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"
**Problem:** Frontend can't reach backend
**Solution:**
1. Ensure backend is running: `npm run dev` in backend directory
2. Check `REACT_APP_API_URL` in frontend/.env.local
3. Should be: `http://localhost:3000/api`
4. Restart frontend after changing .env

#### Error: "404 Not Found"
**Problem:** Endpoint doesn't exist or typo
**Solution:**
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for correct endpoints
- Verify URL format and parameters
- Check backend console for request logs

#### Error: "Method not allowed"
**Problem:** Using wrong HTTP method
**Solution:**
- GET for retrieving data
- POST for creating
- PUT for updating
- DELETE for removing
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

### 🔴 File Upload Issues

#### Error: "No file provided"
**Problem:** File input empty
**Solution:**
- Select file before uploading
- Ensure file exists and is readable

#### Error: "ENOENT: no such file or directory 'uploads'"
**Problem:** Uploads directory missing
**Solution:**
```bash
cd backend
mkdir -p uploads
npm run dev
```

#### Error: "File too large"
**Problem:** Exceeds Multer size limit
**Solution:**
Edit `backend/routes/lessons.js` to increase limit:
```javascript
const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});
```

#### Files not accessible
**Problem:** Files uploaded but can't be accessed
**Solution:**
- Verify file path: `/uploads/<filename>`
- Check backend is serving static files
- Ensure uploads directory has read permissions

---

### 🔴 Content Editor Issues

#### Rich text editor not working
**Problem:** React Quill not loaded
**Solution:**
```bash
cd frontend
npm install react-quill
npm run dev
```

#### HTML content not rendering
**Problem:** Content not saved
**Solution:**
1. Click "Save Content" button
2. Wait for success message
3. Refresh page to verify save

#### Preview not updating
**Problem:** Canvas not refreshing
**Solution:**
1. Make sure lesson content is saved
2. Refresh browser
3. Check browser console for errors

---

### 🔴 Enrollment Issues

#### Error: "UNIQUE constraint failed"
**Problem:** Already enrolled in course
**Solution:**
- System prevents duplicate enrollments
- Same user can't enroll twice
- Use different user account for test

#### Can't see enrolled courses
**Problem:** Courses not showing on dashboard
**Solution:**
1. Verify enrollment was successful (check API response)
2. Refresh browser
3. Check user role is "student"
4. Check course hasn't been deleted

---

### 🔴 Progress Issues

#### Progress not showing
**Problem:** Completion not tracked
**Solution:**
1. Verify lesson is marked complete
2. Refresh browser
3. Check progress API: `/api/progress/course/:courseId`

#### Can't mark lesson complete
**Problem:** Progress endpoint error
**Solution:**
1. Ensure you're logged in as student
2. Ensure lesson exists
3. Check API response for error details

---

### 🔴 Environment Variables

#### Error: "undefined" values in config
**Problem:** .env file not loaded
**Solution:**
```bash
# Backend
cp .env.example .env
# Edit .env with your values
npm run dev

# Frontend
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

#### Variables not updating
**Problem:** Changes to .env not reflected
**Solution:**
1. Stop server
2. Update .env file
3. Restart server

---

### 🟡 Performance Issues

#### Slow API responses
**Problem:** Large datasets or unoptimized queries
**Solution:**
- API uses efficient joins (no N+1)
- Check database is indexed
- Restart backend server
- Check network tab in DevTools

#### Frontend freezing
**Problem:** Large course structures
**Solution:**
- Clear browser cache
- Check browser console for errors
- Restart development server

---

### 🔧 Verification Commands

Run these to verify your setup:

```bash
# Check Node.js
node --version  # Should be v18+

# Check npm
npm --version

# Check PostgreSQL
psql --version

# Test backend health
curl http://localhost:3000/health

# Test frontend (after starting)
curl http://localhost:5173

# Check database connection
psql -U postgres -d protexxalearn -c "SELECT * FROM users;"
```

---

### 📋 Debug Checklist

Before asking for help, verify:

- [ ] Node.js 18+ installed: `node --version`
- [ ] PostgreSQL running and accessible
- [ ] Backend dependencies installed: `npm install` in /backend
- [ ] Frontend dependencies installed: `npm install` in /frontend
- [ ] Database initialized: `npm run init-db`
- [ ] `.env` files created and configured
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] No errors in backend console
- [ ] No errors in browser console (F12)
- [ ] Network requests successful (check DevTools)

---

### 🆘 If Still Not Working

1. **Check logs**
   - Backend console for error messages
   - Browser console (F12) for frontend errors
   - Network tab (F12) for API issues

2. **Verify setup**
   - Run commands from correct directories
   - Ensure all prerequisites installed
   - Check file permissions

3. **Review documentation**
   - [README_FRESH_BUILD.md](./README_FRESH_BUILD.md)
   - [INSTALLATION_TESTING.md](./INSTALLATION_TESTING.md)
   - [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

4. **Restart everything**
   ```bash
   # Kill backend and frontend
   # Restart both servers
   # Clear browser cache (Ctrl+Shift+Delete)
   # Try again
   ```

---

**Last resort:** Check individual component files have correct imports and paths. Verify no typos in .env files.

Good luck! 🚀
