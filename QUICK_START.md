# ProtexxaLearn - Quick Reference Card

## 🚀 Get Started in 3 Steps

### Step 1: Install & Initialize (One time)
```bash
npm install
node initdb.js
```

### Step 2: Start Backend (Terminal A)
```bash
npm run backend
```
→ Runs on `http://localhost:3000`

### Step 3: Start Frontend (Terminal B)
```bash
cd frontend && npm run dev
```
→ Runs on `http://localhost:3001`

---

## 👤 Demo Account

| Field | Value |
|-------|-------|
| **Email** | importer@local |
| **Password** | Import3rPass! |
| **Role** | admin |

Or create your own: Register → Create Account

---

## 📚 What's Already Imported?

**Course**: "Imported Course" (from D2L Brightspace)
- **ID**: 1
- **Status**: Published ✅
- **Modules**: 1
- **Lessons**: 0 (content not in export)

**View in Browser**:
1. Login → Dashboard → See "Imported Course"
2. Click Enroll
3. View modules and progress

---

## 📤 How to Import More Courses

### Method 1: UI (Recommended for Team)
1. Login as **instructor/admin**
2. Go **Admin → Course Management**
3. Click **"Import IMSCC"** button
4. Select `.imscc` file from Brightspace export
5. Done! Course auto-creates

### Method 2: Command Line
```bash
node importCourseDB.js your-export.imscc
```

---

## 🔗 API Endpoints (Backend)

### Public
- `GET /` - Health check
- `GET /courses` - List published courses
- `GET /courses/:id` - Get course details
- `GET /courses/:id/modules` - Get modules

### Auth Required
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `POST /enroll` - Enroll in course
- `GET /enrollments` - My enrollments

### Admin Only
- `POST /courses` - Create course
- `POST /modules` - Create module
- `POST /lessons` - Create lesson
- `POST /import-course` - Upload IMSCC

---

## 📊 Database Status

✅ **Connected**: PostgreSQL `Protexxalearn`
✅ **Tables**: users, courses, modules, lessons, enrollments, lesson_progress, etc.
✅ **Data**: "Imported Course" ready to use

**Credentials** (default):
- Host: `localhost`
- Port: `5432`
- DB: `Protexxalearn`
- User: `postgres`
- Password: `postgres`

*(Edit in `db.js` if different)*

---

## ❓ Common Tasks

### "I want to see the imported course"
→ Login → Dashboard → Look for "Imported Course"

### "I want to enroll in a course"
→ Dashboard → Find course → Click "Enroll"

### "I want to upload a new D2L export"
→ Admin > Course Management → Import IMSCC button

### "I want to create a course manually"
→ Admin > Course Management → Create Course button → Add modules/lessons

### "I want to track student progress"
→ Admin > View enrollments → See status and completion %

---

## 🐛 Quick Troubleshoot

| Problem | Solution |
|---------|----------|
| Backend won't start | Check port 3000 is free: `taskkill /IM node.exe /F` |
| Can't connect to DB | Verify PostgreSQL running, check `db.js` credentials |
| Login fails | Ensure backend is running, check browser Network tab |
| IMSCC upload fails | File must be `.imscc` (ZIP), backend must be running |
| Course doesn't show | Enroll first, check `status='published'` in DB |

---

## 📞 Key Files to Know

| File | Purpose |
|------|---------|
| `server.js` | REST API (backend logic) |
| `db.js` | Database connection settings |
| `app/register/page.tsx` | Registration form |
| `app/dashboard/page.tsx` | Student dashboard |
| `components/admin/course-management.tsx` | **Course upload UI** |
| `brightspaceMigrator.js` | IMSCC parser |
| `importCourseDB.js` | Direct DB import script |

---

## 🎯 Team Checklist

- [ ] Clone repo
- [ ] Run `npm install`
- [ ] Run `node initdb.js`
- [ ] Start backend (`npm run backend`)
- [ ] Start frontend (`npm run dev` in `frontend/`)
- [ ] Open `http://localhost:3001`
- [ ] Register or login with demo account
- [ ] See "Imported Course" on dashboard
- [ ] Try uploading a new IMSCC file
- [ ] Share feedback!

---

**Everything is ready to go! 🚀**

For full details, see `TEAM_SETUP.md`
