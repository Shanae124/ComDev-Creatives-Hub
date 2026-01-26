# Data Import Testing & Workflow Guide

## Quick Start

Your colleagues can now populate course data in three ways:

### 1. **Via Web UI - Data Import Reference Page**
**URL:** https://protexxalearn-production.up.railway.app/admin/data-import

This page shows:
- All available API endpoints
- Complete field specifications for courses, modules, lessons
- Expected data types and required fields
- Example JSON payloads
- Authentication requirements
- Test account credentials

**Perfect for:** Showing colleagues exactly what data structure is needed before they start creating content.

---

### 2. **API Endpoints for Programmatic Import**

#### IMSCC Import (Brightspace Files)
```
POST /import-course
Content-Type: multipart/form-data

Field: imscc (file upload - .imscc or .zip format)

Requires: Admin or Instructor role
```

**Response:**
```json
{
  "message": "Import successful",
  "course": {
    "id": 7,
    "title": "Imported Course",
    "description": "...",
    "created_by": 2,
    "status": "draft"
  }
}
```

**What it creates:**
- 1 Course (draft status)
- Multiple Modules (from IMSCC structure)
- Multiple Lessons (attached to modules)

---

#### HTML Course Import (JSON API)
```
POST /admin/import-html-course
Content-Type: application/json

Requires: Admin role
```

**Payload:**
```json
{
  "course_title": "Web Development Basics",
  "course_description": "Learn HTML, CSS, and JavaScript fundamentals",
  "modules_html": [
    {
      "title": "Module 1: HTML Fundamentals",
      "description": "Introduction to HTML structure",
      "html_content": "<h2>HTML Tutorial</h2><p>Learn HTML...</p>",
      "objectives": ["Learn HTML tags", "Write semantic markup"]
    },
    {
      "title": "Module 2: CSS Styling",
      "description": "Introduction to CSS",
      "html_content": "<h2>CSS Tutorial</h2><p>Learn CSS...</p>",
      "objectives": ["Learn CSS selectors", "Style web pages"]
    }
  ]
}
```

**Response:**
```json
{
  "message": "Course imported successfully",
  "course": {
    "id": 8,
    "title": "Web Development Basics",
    "description": "Learn HTML, CSS, and JavaScript fundamentals",
    "created_by": 1,
    "status": "published"
  },
  "modules": [
    { "id": 1, "title": "Module 1: HTML Fundamentals" },
    { "id": 2, "title": "Module 2: CSS Styling" }
  ]
}
```

**What it creates:**
- 1 Course (published status)
- Multiple Modules
- Labs created from each module's HTML content

---

### 3. **Manual API Calls (cURL / Postman)**

#### Get Authentication Token
```bash
curl -X POST https://protexxalearn-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@test.com",
    "password": "Password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Instructor",
    "email": "instructor@test.com",
    "role": "instructor"
  }
}
```

#### Create a Course
```bash
curl -X POST https://protexxalearn-production.up.railway.app/courses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Programming",
    "description": "Learn Python from basics to advanced",
    "content_html": "<h2>Welcome</h2>",
    "status": "draft"
  }'
```

#### Create a Module
```bash
curl -X POST https://protexxalearn-production.up.railway.app/modules \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": 7,
    "title": "Module 1: Variables",
    "description": "Learn about variables",
    "sort_order": 1
  }'
```

#### Create a Lesson
```bash
curl -X POST https://protexxalearn-production.up.railway.app/lessons \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": 5,
    "title": "Understanding Variables",
    "content_html": "<h2>Variables</h2><p>A variable is...</p>",
    "lesson_type": "reading",
    "duration_minutes": 20,
    "sort_order": 1
  }'
```

---

## Environment Details

**Production Server:** https://protexxalearn-production.up.railway.app

**Test Accounts:**
- **Instructor:** instructor@test.com / Password123
- **Admin:** admin@test.com / Password123
- **Student:** student@test.com / Password123

**API Port:** 3001 (internal, proxied through main domain)
**Next.js Port:** 8080 (internal, proxied through main domain)

---

## Import Functions Verified

✅ **POST /import-course** - IMSCC file upload
- Accepts .imscc and .zip files
- Creates course + modules + lessons automatically
- Sets course to draft status (can be published later)
- File cleanup after import

✅ **POST /admin/import-html-course** - JSON-based HTML import
- Accepts course_title and modules_html array
- Creates course + modules + labs from HTML
- Sets course to published status
- Perfect for custom HTML content

✅ **POST /courses** - Manual course creation
✅ **POST /modules** - Manual module creation
✅ **POST /lessons** - Manual lesson creation

---

## Workflow Examples

### Example 1: Import from Brightspace IMSCC

**For Colleagues:**
1. Export course from Brightspace as IMSCC
2. Go to https://protexxalearn-production.up.railway.app/admin/data-import
3. Login as instructor@test.com / Password123
4. Use the import form to upload IMSCC file
5. Course will be created in draft status
6. Edit and publish when ready

**Via API:**
```bash
# Upload IMSCC file
curl -X POST https://protexxalearn-production.up.railway.app/import-course \
  -H "Authorization: Bearer TOKEN" \
  -F "imscc=@course-export.imscc"
```

---

### Example 2: Create Course with HTML Content

**For Colleagues:**
1. Prepare HTML modules with content
2. Call POST /admin/import-html-course with JSON payload
3. Course created with modules as labs
4. Immediately available for students to view

**Via API:**
```bash
curl -X POST https://protexxalearn-production.up.railway.app/admin/import-html-course \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d @course-payload.json
```

---

### Example 3: Manual Course Building

**For Colleagues (Via UI - Not Yet Built):**
1. Create course on /admin/courses
2. Add modules to course
3. Add lessons to modules
4. Add assignments and labs
5. Publish course

**Via API (Recommended for bulk):**
```bash
# 1. Create course
COURSE_ID=$(curl -s -X POST ... | jq '.id')

# 2. Create modules
MOD1=$(curl -s -X POST ... | jq '.id')

# 3. Create lessons
curl -X POST ... -d "module_id: $MOD1"
```

---

## Troubleshooting

### 401 Unauthorized
**Cause:** Missing or invalid JWT token
**Solution:** Get a new token via POST /auth/login

### 403 Forbidden
**Cause:** User doesn't have required role (admin/instructor)
**Solution:** Log in as admin@test.com or instructor@test.com

### 400 Bad Request
**Cause:** Missing required fields in request body
**Solution:** Check data-import page for required fields per endpoint

### 500 Server Error
**Cause:** Unexpected error (check server logs)
**Solution:** 
- Verify all required fields are present
- Check database connection
- Review server logs: `railway logs --tail 50`

---

## Key Points for Colleagues

1. **Authentication Required** - All endpoints require JWT token from login
2. **Role-Based Access** - Import endpoints require admin or instructor role
3. **Cascading Structure** - Courses → Modules → Lessons → Labs
4. **Status Codes:**
   - Draft = Not visible to students
   - Published = Visible to enrolled students
5. **Bulk Import** - IMSCC files import entire course structure at once
6. **HTML Import** - Creates labs from HTML content, good for interactive content

---

## Share This Link with Colleagues

🔗 **Data Reference Page:** https://protexxalearn-production.up.railway.app/admin/data-import

This page shows:
- Complete field documentation
- All available endpoints
- Example payloads
- Required/optional fields
- Workflow examples

---

## Next Steps

1. ✅ Colleagues access https://protexxalearn-production.up.railway.app
2. ✅ Login with test accounts (or create their own via /register)
3. ✅ Visit /admin/data-import to see field specifications
4. ✅ Choose import method (IMSCC, HTML, or manual API calls)
5. ✅ Start populating course data
6. ✅ Publish courses for students to view

---

**Last Updated:** 2024-01-26  
**Status:** ✅ All import functions tested and documented
