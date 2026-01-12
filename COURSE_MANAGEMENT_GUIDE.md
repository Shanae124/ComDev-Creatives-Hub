# GUI Course & File Management System - User Guide

## Overview

A complete graphical user interface (GUI) for creating courses, adding modules, and uploading files has been implemented. This guide shows you how to use these features.

---

## Features Added

### 1. **Course Management Dashboard** (`/admin/courses`)
- View all courses in a searchable table
- Filter courses by status (Draft, Published, Archived)
- Quick statistics on course totals
- Bulk actions (Import, Export)
- Manage course enrollments

### 2. **Enhanced Course Builder** (`/admin/courses/new`)
A three-tab interface for complete course creation:

#### Tab 1: Course Info
- **Course Title** - Name of the course
- **Description** - Course overview and learning objectives
- **Thumbnail URL** - Course image/thumbnail
- **Status** - Draft, Published, or Archived
- **Content HTML** - Rich course content (supports HTML)

#### Tab 2: Modules
- Add multiple modules to organize course content
- Module titles and descriptions
- Sequential ordering (enabled after course creation)

#### Tab 3: Files
- Upload course resources (PDFs, images, videos, documents)
- Supported formats: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .jpg, .png, .gif, .mp4, .zip
- Files automatically stored in `/uploads` folder
- Accessible via URLs

---

## Step-by-Step Usage

### Creating a New Course

1. **Login to Admin Dashboard**
   - Navigate to `/admin/courses`
   - Ensure you're logged in with admin or instructor role

2. **Click "New Course" Button**
   - Opens the enhanced course builder

3. **Fill Course Information (Tab 1)**
   ```
   Course Title: "Advanced Security Training"
   Description: "Learn the latest security practices and threat detection"
   Thumbnail URL: "https://example.com/course-image.jpg"
   Status: Select "Draft" or "Published"
   Content: "<h2>Welcome</h2><p>This course covers...</p>"
   ```

4. **Click "Create Course"**
   - Course is saved to database
   - Course ID appears in success message
   - Tabs 2 & 3 become active

5. **Add Modules (Tab 2)**
   ```
   Module Title: "Module 1: Fundamentals"
   Description: "Basic security concepts"
   Click "Add Module"
   ```
   Repeat for each module needed

6. **Upload Files (Tab 3)**
   - Click file input or drag-and-drop
   - Select file from your computer
   - Click "Upload"
   - File URL appears in "Uploaded Files" list
   - Copy URL to share or embed in content

---

## Backend Endpoints

### Course Management

**Create Course**
```bash
POST /api/courses
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "title": "Course Name",
  "description": "Course description",
  "content_html": "<h2>Content</h2>",
  "status": "draft",
  "thumbnail_url": "https://example.com/image.jpg"
}
```

**Get All Courses**
```bash
GET /api/courses
```

**Update Course**
```bash
PUT /api/courses/:id
Authorization: Bearer <TOKEN>
```

### Module Management

**Create Module**
```bash
POST /api/modules
Authorization: Bearer <TOKEN>

{
  "course_id": 1,
  "title": "Module Title",
  "description": "Module description",
  "sort_order": 1
}
```

**Get Course Modules**
```bash
GET /api/courses/:course_id/modules
```

### File Upload

**Upload File**
```bash
POST /api/upload
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

file: <binary file data>
```

**Response**
```json
{
  "url": "/uploads/1705084800000.pdf",
  "filename": "1705084800000.pdf",
  "originalName": "document.pdf",
  "size": 245000
}
```

---

## File Management

### File Storage
- Files are stored in `/uploads` directory
- Automatic naming with timestamps to prevent conflicts
- Accessible via `/uploads/<filename>` URL

### Supported File Types
- **Documents**: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx
- **Images**: .jpg, .png, .gif
- **Video**: .mp4
- **Archives**: .zip

### File URLs
After upload, files are accessible at:
```
http://localhost:3000/uploads/1705084800000.pdf
```

Share these URLs in course content or with students.

---

## Admin Dashboard Features

### Course Table
- **Search**: Find courses by title or description
- **Filter**: By status (Draft, Published, Archived)
- **Statistics**: Total courses, published count, draft count
- **Quick Actions**: 
  - View course details
  - Edit course
  - Manage enrollments
  - Export course
  - Delete course

### Status Management
- **Draft**: Course under development, not visible to students
- **Published**: Active course, visible to all students
- **Archived**: Inactive, hidden from course list

---

## Database Schema

### courses table
```sql
id SERIAL PRIMARY KEY
title VARCHAR(255) NOT NULL
description TEXT
content_html TEXT
status VARCHAR(50) DEFAULT 'draft'
thumbnail_url VARCHAR(500)
created_by INTEGER (user_id)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### modules table
```sql
id SERIAL PRIMARY KEY
course_id INTEGER (references courses)
title VARCHAR(255) NOT NULL
description TEXT
sort_order INTEGER DEFAULT 1
created_at TIMESTAMP
updated_at TIMESTAMP
```

---

## Security & Access Control

### Role Requirements
- **Admin**: Full access to all courses
- **Instructor**: Create/edit their own courses
- **Student**: View published courses only

### Authentication
- JWT token required for course creation/upload
- Token automatically injected in all requests
- Auto-logout on 401 (unauthorized)

---

## Best Practices

### Course Organization
1. Create course with basic info
2. Add 3-5 modules per course
3. Upload supporting materials
4. Publish when ready
5. Archive when obsolete

### File Management
1. Use descriptive filenames
2. Keep files organized in `/uploads`
3. Share URLs only in course content
4. Clean up old files periodically

### Content Guidelines
- Limit course title to 255 characters
- Use HTML for rich content formatting
- Include clear learning objectives
- Add at least one module per course
- Upload relevant resources

---

## Troubleshooting

### Course Creation Fails
- Check course title is not empty
- Verify authentication token is valid
- Ensure user role is admin or instructor

### File Upload Fails
- Check file size < 50MB
- Verify file type is supported
- Ensure course is created first
- Check disk space available

### Can't Access Files
- Verify `/uploads` directory exists
- Check file permissions (755)
- Use correct file URL format
- Test URL in browser

---

## API Integration Examples

### Creating Course with cURL
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Security 101",
    "description": "Introduction to security",
    "status": "published"
  }'
```

### Uploading File with cURL
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf"
```

---

## File Structure

```
ProtexxaLearn/
├── components/admin/
│   ├── admin-dashboard.tsx          (Course management hub)
│   ├── enhanced-course-builder.tsx  (Create course + upload files)
│   ├── course-management.tsx        (Legacy - archived)
│   └── resource-manager.tsx         (Resource organization)
├── app/admin/courses/
│   ├── page.tsx                     (Admin dashboard)
│   └── new/page.tsx                 (Course builder)
├── uploads/                         (File storage)
│   └── [timestamp].[ext]           (Uploaded files)
└── server.js
    ├── POST /courses               (Create course)
    ├── GET /courses                (List courses)
    ├── PUT /courses/:id            (Update course)
    ├── POST /modules               (Create module)
    ├── POST /upload                (Upload file)
    └── /uploads/[static files]     (Serve files)
```

---

## Future Enhancements

- [ ] Bulk course import from CSV
- [ ] Course template library
- [ ] Video processing pipeline
- [ ] Collaborative course editing
- [ ] Course versioning/rollback
- [ ] Advanced analytics dashboard
- [ ] Automated course scheduling
- [ ] AI-powered content suggestions

---

## Support

For issues or questions:
1. Check backend logs: `npm run backend`
2. Verify database: `node initdb.js`
3. Test API directly: Use Postman or curl
4. Review error messages in browser console

---

Last Updated: January 12, 2026
Version: 1.0.0
