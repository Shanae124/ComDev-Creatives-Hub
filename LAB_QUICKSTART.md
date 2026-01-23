# 🎓 Lab System - Quick Start

## What's Ready Now

Your lab hosting system is **fully implemented** and deployed to Railway! Here's what you can do:

### ✅ For Students
- Access any published lab at: `https://protexxalearn-production.up.railway.app/courses/[courseId]/labs/[labId]`
- See interactive HTML with full JavaScript working
- Track time spent in labs
- Download labs locally
- Submit completions

### ✅ For Admins/Instructors
- **Admin Lab Page**: `/admin/labs`
  - Create new labs
  - Import HTML courses
  - Manage all labs
  - View student attempts

- **Create Single Lab**:
  - Click "Create Lab"
  - Paste/upload HTML content
  - Set difficulty, type, duration
  - Assign to course/module
  - Publish

- **Import Entire Course**:
  - Click "Import HTML Course"
  - Select multiple HTML files
  - Each HTML file = 1 module/lab
  - Enter course title
  - Click Import → Done!

## Getting Started with Your Course

### Option 1: Upload via Web Interface (Easy)
```
1. Go to https://protexxalearn-production.up.railway.app/admin/labs
2. Click "Import HTML Course"
3. Enter: "DTS NETWORKING BASIC"
4. Select your HTML files (Network Basics I, II, etc.)
5. Click Import
6. Done! Course is live
```

### Option 2: Command Line (Fast)
```bash
# Import single file
node import-html-course.js "./course-content/technical-communication-skills.html"

# Import directory with multiple HTML files
node import-html-course.js "./course-content/"

# On Railway
railway run node import-html-course.js "./course-content/"
```

### Option 3: API Direct (Programmatic)
```javascript
fetch('/admin/import-html-course', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    course_title: 'DTS NETWORKING BASIC',
    course_description: 'Learn networking fundamentals',
    modules_html: [
      {
        title: 'Network Basics I',
        description: 'Introduction',
        html_content: '<h2>...</h2>...',
        objectives: ['Objective 1']
      },
      // ... more modules
    ]
  })
})
```

## Key Features

### 🎨 Full HTML/CSS/JavaScript Support
- All styling preserved
- Interactive elements work
- Form submissions
- Event handlers
- AJAX requests
- Canvas and WebGL
- Video/Audio players

### 🔒 Secure Sandbox
- JavaScript runs in isolated iframe
- Prevents XSS attacks
- Maintains performance
- No pollution of global scope

### 📊 Student Progress Tracking
- Time spent per lab
- Completion percentage
- Submission history
- Notes and feedback
- Instructor view of all attempts

### 🎯 Easy Management
- Drag-and-drop HTML uploads
- Batch import entire courses
- Edit lab metadata
- Change difficulty/type
- Archive old labs
- Delete labs

## Database Schema

Automatically initialized on first deployment:

```sql
-- Stores lab HTML content
CREATE TABLE labs (
  id, course_id, module_id, title, description,
  lab_type, html_content, status, created_at, ...
);

-- Tracks student progress
CREATE TABLE lab_attempts (
  id, lab_id, user_id, started_at, completed_at,
  time_spent_seconds, completion_percent, status, ...
);

-- Store course materials
CREATE TABLE resources (
  id, course_id, title, resource_type, url, ...
);

-- Student submissions with grades
CREATE TABLE lab_submissions (
  id, lab_id, user_id, submitted_at, grade, feedback, ...
);
```

## Files Created

| File | Purpose |
|------|---------|
| `app/admin/labs/page.tsx` | Admin lab management interface |
| `app/courses/[courseId]/labs/[id]/page.tsx` | Student lab viewing page |
| `components/lab-viewer.tsx` | Lab display component (iframe-based) |
| `server.js` (added 200+ lines) | 8 new API endpoints for labs |
| `initdb-labs.sql` | Database schema (15 tables) |
| `import-html-course.js` | CLI tool for batch importing |
| `LAB_DEPLOYMENT_GUIDE.md` | Full deployment documentation |

## API Endpoints

### Public (Students)
```
GET  /labs?course_id=X&module_id=Y
GET  /api/labs/:id
POST /labs/:id/attempt
```

### Admin Only
```
POST   /admin/labs
PUT    /admin/labs/:id
DELETE /admin/labs/:id
GET    /admin/labs/:id/attempts
POST   /admin/import-html-course
```

## What Happens When You Import

1. **Parse**: Extract title, sections, content from HTML
2. **Create**: Course record in database
3. **Create**: Module for each section
4. **Create**: Lab with full HTML content (no external dependencies)
5. **Index**: Database indexes for fast queries
6. **Publish**: Labs immediately available to students
7. **Track**: Student progress recorded automatically

## Testing Your Labs

1. **Local**: 
   ```bash
   npm run dev        # Starts on port 8080
   node server.js     # Starts on port 3001
   ```

2. **Production**: 
   ```
   https://protexxalearn-production.up.railway.app/admin/labs
   ```

3. **Test Import**:
   ```bash
   node import-html-course.js ./course-content/
   ```

4. **View Lab**:
   ```
   /courses/1/labs/1
   ```

## Common Questions

**Q: Will my JavaScript work?**
A: Yes! Full JavaScript support with iframe sandbox that allows: scripts, forms, popups, modals, same-origin access.

**Q: What about external scripts/CSS?**
A: All imports work normally (CDN libraries, external stylesheets, etc.)

**Q: How do I update a lab?**
A: Edit via admin interface or use PUT endpoint. Changes visible immediately.

**Q: Can students download labs?**
A: Yes! Download button saves the HTML locally with all CSS/JS embedded.

**Q: How is student progress tracked?**
A: Automatically via POST /labs/:id/attempt endpoint. Time, completion %, notes all recorded.

**Q: Can I grade student work?**
A: Yes! Use lab_submissions table. Instructor view shows all attempts with feedback capability.

## Deployment Status

✅ **Deployed to Railway**
- Frontend: `https://protexxalearn-production.up.railway.app`
- Backend: Running on port 3001
- Database: PostgreSQL initialized with schema
- Auto-deploys on git push to master

## Next Steps

1. **Import Your Course**
   - Go to `/admin/labs`
   - Upload HTML files
   - See course live in minutes

2. **Test Labs**
   - Access as student
   - Verify JavaScript works
   - Check progress tracking

3. **Enroll Students**
   - They get instant access
   - Can view all published labs
   - Progress auto-tracked

4. **Monitor Progress**
   - Admin view shows all attempts
   - Time and completion data
   - Student feedback capability

---

## Support Commands

```bash
# View deployment logs
railway logs

# Check database
railway postgres

# Run tests
npm test

# Build frontend
npm run build

# Deploy specific branch
git push origin master
```

🚀 **Your lab system is ready!** Go to `/admin/labs` to get started.
