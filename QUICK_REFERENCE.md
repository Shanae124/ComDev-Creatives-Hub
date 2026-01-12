# Quick Reference: Course & File Management

## Access the GUI

| Feature | URL | Role Required |
|---------|-----|---------------|
| **Admin Dashboard** | http://localhost:3001/admin/courses | Admin/Instructor |
| **Create Course** | http://localhost:3001/admin/courses/new | Admin/Instructor |
| **View Courses** | http://localhost:3001 | Student (published only) |

---

## Quick Start

### 1️⃣ **Create a Course** (3 steps)
```
1. Go to /admin/courses → Click "New Course"
2. Fill form: Title, Description, Status → Click "Create"
3. Copy Course ID from success message ✓
```

### 2️⃣ **Add Modules** (in Tab 2)
```
1. Module Title: "Module 1: Intro"
2. Description: "Learn the basics"
3. Click "Add Module" → Repeat for each module ✓
```

### 3️⃣ **Upload Files** (in Tab 3)
```
1. Select file from computer
2. Click "Upload"
3. Copy file URL from "Uploaded Files" ✓
```

---

## Common Tasks

### Search for a Course
```
Dashboard → Type in search box → Results filter automatically
```

### Change Course Status
```
Dashboard → Find course → More menu (⋯) → Edit → Change status → Save
```

### Download Course
```
Dashboard → Find course → More menu (⋯) → Export (saves as JSON)
```

### Delete Course
```
Dashboard → Find course → More menu (⋯) → Delete → Confirm
```

### Embed File in Content
```
Course Info Tab → Content HTML → Use file URL:
<a href="/uploads/1705084800000.pdf" target="_blank">Download PDF</a>
```

---

## File Types Accepted

| Category | Formats |
|----------|---------|
| **Documents** | .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx |
| **Images** | .jpg, .png, .gif |
| **Video** | .mp4 |
| **Archives** | .zip |

**Max File Size**: 50MB

---

## API Endpoints Quick Reference

```bash
# Create Course
POST /api/courses
Authorization: Bearer TOKEN

# List Courses  
GET /api/courses

# Update Course
PUT /api/courses/:id
Authorization: Bearer TOKEN

# Create Module
POST /api/modules
Authorization: Bearer TOKEN

# Upload File
POST /api/upload
Authorization: Bearer TOKEN
Content-Type: multipart/form-data
```

---

## Status Meanings

| Status | Meaning | Visible to Students |
|--------|---------|-------------------|
| **Draft** | Under development | ❌ No |
| **Published** | Active & ready | ✅ Yes |
| **Archived** | Inactive/old | ❌ No |

---

## File Upload Response Example

```json
{
  "url": "/uploads/1705084800000.pdf",
  "filename": "1705084800000.pdf",
  "originalName": "course-material.pdf",
  "size": 245000
}
```

**Use this URL to:**
- Embed in course content
- Share with students
- Link in announcements

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New Course |
| `Cmd/Ctrl + K` | Search |
| `Enter` | Submit form |
| `Esc` | Close dialog |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't create course | ✓ Check you're logged in as admin/instructor |
| File won't upload | ✓ Verify file type & size < 50MB |
| Can't see modules tab | ✓ Create course first, then tab activates |
| File URL not working | ✓ Use full URL: http://localhost:3000/uploads/... |
| Authentication fails | ✓ Logout and login again, check token |

---

## Sample HTML Content

```html
<h1>Welcome to the Course</h1>
<p>This course teaches you essential skills.</p>

<h2>Learning Objectives</h2>
<ul>
  <li>Understand key concepts</li>
  <li>Apply techniques</li>
  <li>Complete projects</li>
</ul>

<h2>Resources</h2>
<a href="/uploads/1705084800000.pdf">Download Study Guide</a>
<video width="320" height="240" controls>
  <source src="/uploads/1705084800001.mp4" type="video/mp4">
</video>
```

---

## Tips & Tricks

✨ **Pro Tips:**
1. Use meaningful course titles (helps with search)
2. Keep descriptions concise but informative
3. Organize content with clear module structure
4. Test file URLs before sharing
5. Archive old courses instead of deleting
6. Use HTML for rich formatting
7. Include learning objectives in description
8. Upload resources after modules are set up

🚀 **Best Practices:**
- Create 3-5 modules per course
- Upload 1-3 resources per module
- Keep file names simple & descriptive
- Publish only when course is complete
- Regularly backup exported courses

---

## Getting Help

**Logs & Diagnostics:**
```bash
# View backend logs
npm run backend

# Check database
node initdb.js

# Test API with curl
curl http://localhost:3000/courses
```

**Frontend Console:**
- Press `F12` or `Cmd+Opt+J` (Mac) to open Developer Tools
- Check Console tab for errors
- Network tab shows API calls

---

**Created:** January 12, 2026  
**Version:** 1.0.0  
**Last Updated:** January 12, 2026
