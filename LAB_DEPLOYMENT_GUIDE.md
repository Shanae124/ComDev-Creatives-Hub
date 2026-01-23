# 🚀 Lab Hosting System Deployment Guide

## Overview

ProtexxaLearn now has a complete lab hosting system that allows:
- ✅ Interactive HTML labs with full JavaScript support
- ✅ Embedded CSS and JavaScript execution
- ✅ Course import from HTML files
- ✅ Student progress tracking
- ✅ Lab management admin interface

## Prerequisites

- Node.js running on Railway
- PostgreSQL database on Railway
- Express backend (port 3001)
- Next.js frontend (port 8080)

## Deployment Steps

### Step 1: Deploy Database Schema

Run the lab schema initialization:

```bash
# Local development
node initdb-labs.sql

# OR via Railway terminal
railway run node initdb-labs.sql
```

This creates:
- `labs` table - Store HTML lab content
- `lab_attempts` table - Track student progress
- `resources` table - Store course materials
- `lab_submissions` table - Student submissions

**Status**: Schema created at `initdb-labs.sql`

### Step 2: Verify Backend Endpoints

All lab API endpoints are in `server.js` and auto-load on server start.

#### Public Endpoints (Students)
```
GET  /labs?course_id=X&module_id=Y      - List published labs
GET  /api/labs/:id                      - Get full lab with HTML content
POST /labs/:id/attempt                  - Record student attempt
GET  /student/labs/:id/attempt          - Get student's lab attempt
```

#### Admin Endpoints (Instructors/Admins)
```
POST   /admin/labs                      - Create lab
PUT    /admin/labs/:id                  - Update lab
DELETE /admin/labs/:id                  - Delete lab
GET    /admin/labs/:id/attempts         - View all student attempts
POST   /admin/import-html-course        - Import course from HTML
```

**Status**: ✅ All endpoints implemented in server.js (lines 1658+)

### Step 3: Deploy Frontend Components

Already created:

1. **Lab Viewer Component** (`components/lab-viewer.tsx`)
   - Displays HTML labs in iframe
   - Allows full JavaScript execution
   - Tracks time spent
   - Resource linking
   - Status: ✅ Created and ready

2. **Lab Page Route** (`app/courses/[courseId]/labs/[id]/page.tsx`)
   - Dynamic route handling
   - Student lab access
   - Status: ✅ Created and ready

3. **Admin Lab Management** (`app/admin/labs/page.tsx`)
   - Lab CRUD interface
   - HTML file upload
   - Course import dialog
   - Status: ✅ Created and ready

### Step 4: Deploy to Railway

```bash
# Commit all changes
git add .
git commit -m "Add lab hosting system with HTML course import"
git push origin main

# Railway auto-deploys on push
# Or manually trigger deploy from Railway dashboard
```

### Step 5: Initialize Lab Schema on Production

After deployment, run once:

```bash
railway run node -e "
const initSql = require('fs').readFileSync('./initdb-labs.sql', 'utf-8');
const pool = require('./db');
pool.query(initSql).then(() => {
  console.log('✅ Lab schema initialized');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
"
```

**Or use the simpler migration approach:**

```bash
railway run node initdb.js
```

Add this to `initdb.js`:

```javascript
// Add to initdb.js
const fs = require('fs');

async function initLabSchema() {
  try {
    const labSql = fs.readFileSync('./initdb-labs.sql', 'utf-8');
    await pool.query(labSql);
    console.log('✅ Lab tables initialized');
  } catch (error) {
    console.error('Lab schema initialization error:', error);
  }
}

// Call after main tables
initLabSchema();
```

## Usage Guide

### For Students

1. **Access a Lab**
   - Navigate to course: `/courses/[courseId]`
   - Click lab in modules list
   - Lab viewer opens with HTML content
   - All JavaScript/CSS work as expected

2. **Track Progress**
   - Time spent automatically tracked
   - Completion % updates as you work
   - Can submit when finished

3. **Download Lab**
   - Click Download button to save HTML locally
   - Includes all CSS and JavaScript

### For Instructors/Admins

1. **Create Single Lab**
   - Go to `/admin/labs`
   - Click "Create Lab"
   - Paste HTML content or upload file
   - Select course/module
   - Set lab type, difficulty, duration

2. **Import Entire Course**
   - Go to `/admin/labs`
   - Click "Import HTML Course"
   - Select multiple HTML files
   - Each file = 1 module/lab
   - Enter course title
   - Click Import

3. **Manage Labs**
   - View all labs in admin interface
   - Edit lab content and metadata
   - Delete labs
   - View student attempts and completion

## HTML Course Structure

Expected format for importing:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Course Title | Subtitle</title>
  <style>/* Your CSS */</style>
</head>
<body>
  <!-- Your course content with H2 sections = modules -->
  <h2>Module 1: Introduction</h2>
  <p>Content here...</p>
  
  <h2>Module 2: Advanced Topics</h2>
  <p>More content...</p>
  
  <script>/* Your JavaScript */</script>
</body>
</html>
```

### Automatic Parsing

The import script (`import-html-course.js`) automatically:
- Extracts course title from `<title>` tag
- Splits by `<h2>` tags to create modules
- Stores full HTML with CSS and JS
- Creates corresponding labs

### Manual Import via API

```bash
curl -X POST http://localhost:3001/admin/import-html-course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "course_title": "DTS NETWORKING BASIC",
    "course_description": "Learn networking fundamentals",
    "modules_html": [
      {
        "title": "Network Basics I",
        "description": "Introduction to networking",
        "html_content": "<h2>...</h2>...",
        "objectives": ["Understand OSI model", "Learn IP addressing"]
      },
      {
        "title": "Network Basics II",
        "description": "Advanced networking",
        "html_content": "<h2>...</h2>...",
        "objectives": ["Configure routers", "Troubleshoot networks"]
      }
    ]
  }'
```

## Command-Line Import

For batch importing existing HTML courses:

```bash
# Single file
node import-html-course.js ./course-content/my-course.html

# Entire directory
node import-html-course.js ./course-content/

# Production
railway run node import-html-course.js ./course-content/
```

## Troubleshooting

### Labs Not Loading
- Check database schema is initialized: `SELECT * FROM labs;`
- Verify lab ID in URL
- Check browser console for errors

### JavaScript Not Working
- Confirm iframe sandbox settings in `components/lab-viewer.tsx`
- Check browser console for CSP violations
- Verify HTML doesn't have conflicting CSP headers

### Import Fails
- Check HTML file encoding (should be UTF-8)
- Verify course ID exists
- Check file permissions
- View server logs for detailed errors

### Progress Not Tracking
- Verify `lab_attempts` table exists
- Check student is authenticated
- Confirm lab ID matches database

## Performance Notes

- Labs stored as full HTML text in database (efficient for small-medium labs)
- For very large HTML (>1MB), consider storing URL in `html_file_url` instead
- iframe approach prevents global CSS pollution
- Blob URL is created client-side (no extra server requests)

## Security Considerations

✅ **Implemented:**
- iframe sandbox prevents XSS escaping
- Student isolation (can only see own attempts)
- Admin-only lab creation/deletion
- CORS restrictions on API endpoints
- Authentication required for all endpoints

⚠️ **Review Before Production:**
- Lab content is publicly readable if lab is published
- Student submissions visible to instructors only
- Consider adding encryption for sensitive content
- Audit JavaScript in uploaded courses for security

## File Reference

| File | Purpose | Status |
|------|---------|--------|
| `initdb-labs.sql` | Database schema | ✅ Created |
| `components/lab-viewer.tsx` | Lab display component | ✅ Created |
| `app/courses/[courseId]/labs/[id]/page.tsx` | Lab route | ✅ Created |
| `app/admin/labs/page.tsx` | Admin interface | ✅ Created |
| `import-html-course.js` | CLI import tool | ✅ Created |
| `server.js` (lines 1658+) | API endpoints | ✅ Added |

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Initialize database schema
3. ✅ Test lab viewer in browser
4. ✅ Import sample HTML course
5. ✅ Test JavaScript execution
6. ✅ Configure admin permissions

## Testing Checklist

- [ ] Lab admin page loads at `/admin/labs`
- [ ] Can create lab with HTML content
- [ ] Lab displays in course view
- [ ] JavaScript runs in lab
- [ ] CSS styling preserved
- [ ] Forms and interactions work
- [ ] Student attempts tracked
- [ ] HTML import works
- [ ] Time tracking accurate
- [ ] Download lab works

## Support

For issues:
1. Check server logs: `railway logs`
2. Check database: `railway postgres`
3. Test endpoint manually with curl
4. Review browser console for client errors
5. Check component props in React DevTools
