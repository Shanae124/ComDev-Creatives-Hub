# ProtexxaLearn - Complete API Documentation

## System Architecture

```
Users (roles: student, instructor, admin)
  ├── Courses (created by instructor)
  │   ├── Modules (organize content)
  │   │   └── Lessons (learning units with HTML)
  │   │       └── Attachments (files)
  │   └── Enrollments (student enrollment)
  │       └── Progress (completion tracking)
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student" // or "instructor", "admin"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "eyJhbGc..."
}
```

### POST /api/auth/login
Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** Same as register

---

## Courses

### POST /api/courses
Create a new course (instructor/admin only).

**Request:**
```json
{
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript basics"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript basics",
  "instructor_id": 2,
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z"
}
```

### GET /api/courses
List all courses with instructor info.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript basics",
    "instructor_id": 2,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "created_at": "2024-01-21T10:00:00Z",
    "updated_at": "2024-01-21T10:00:00Z"
  }
]
```

### GET /api/courses/:id
Get course with all modules.

**Response:**
```json
{
  "id": 1,
  "title": "Introduction to JavaScript",
  "description": "Learn JavaScript basics",
  "instructor_id": 2,
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z",
  "modules": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Module 1: Basics",
      "order_index": 0,
      "created_at": "2024-01-21T10:00:00Z",
      "updated_at": "2024-01-21T10:00:00Z"
    }
  ]
}
```

### PUT /api/courses/:id
Update course (instructor/admin only, must own course).

**Request:**
```json
{
  "title": "Advanced JavaScript",
  "description": "Learn advanced JavaScript concepts"
}
```

### DELETE /api/courses/:id
Delete course (instructor/admin only, must own course).

---

## Modules

### POST /api/modules
Create a module within a course.

**Request:**
```json
{
  "courseId": 1,
  "title": "Module 1: Basics",
  "orderIndex": 0
}
```

### GET /api/modules/:id
Get module with all lessons.

**Response:**
```json
{
  "id": 1,
  "course_id": 1,
  "title": "Module 1: Basics",
  "order_index": 0,
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z",
  "lessons": [
    {
      "id": 1,
      "module_id": 1,
      "title": "Lesson 1: Introduction",
      "content": "<h2>Welcome</h2><p>Content here...</p>",
      "lesson_type": "content",
      "order_index": 0,
      "created_at": "2024-01-21T10:00:00Z",
      "updated_at": "2024-01-21T10:00:00Z"
    }
  ]
}
```

### PUT /api/modules/:id
Update module.

**Request:**
```json
{
  "title": "Updated Module Title",
  "orderIndex": 1
}
```

### DELETE /api/modules/:id
Delete module (cascades to all lessons).

---

## Lessons

### POST /api/lessons
Create a lesson within a module.

**Request:**
```json
{
  "moduleId": 1,
  "title": "Lesson 1: Introduction",
  "content": "<h2>Welcome</h2><p>HTML content here...</p>",
  "lessonType": "content",
  "orderIndex": 0
}
```

### GET /api/lessons/:id
Get lesson with attachments.

**Response:**
```json
{
  "id": 1,
  "module_id": 1,
  "title": "Lesson 1: Introduction",
  "content": "<h2>Welcome</h2><p>HTML content here...</p>",
  "lesson_type": "content",
  "order_index": 0,
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z",
  "attachments": [
    {
      "id": 1,
      "lesson_id": 1,
      "file_name": "slides.pdf",
      "file_path": "550e8400-e29b-41d4-a716-446655440000.pdf",
      "file_type": "application/pdf",
      "file_size": 2048576,
      "created_at": "2024-01-21T10:00:00Z"
    }
  ]
}
```

### PUT /api/lessons/:id
Update lesson content and metadata.

**Request:**
```json
{
  "title": "Updated Lesson Title",
  "content": "<h2>Updated Content</h2>",
  "lessonType": "content",
  "orderIndex": 1
}
```

### POST /api/lessons/:id/upload
Upload a file to a lesson (multipart/form-data).

**Request:** Form data with file
```
Content-Type: multipart/form-data
file: <binary file data>
```

**Response:**
```json
{
  "id": 1,
  "lesson_id": 1,
  "file_name": "slides.pdf",
  "file_path": "550e8400-e29b-41d4-a716-446655440000.pdf",
  "file_type": "application/pdf",
  "file_size": 2048576,
  "created_at": "2024-01-21T10:00:00Z"
}
```

**Note:** Files are stored in the `/uploads` directory and can be accessed via:
```
GET /uploads/<file_path>
```

### DELETE /api/lessons/:id
Delete lesson (cascades to attachments and progress).

---

## Enrollments

### POST /api/enrollments
Enroll user in a course (authenticated users only).

**Request:**
```json
{
  "courseId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "course_id": 1,
  "status": "active",
  "enrolled_at": "2024-01-21T10:00:00Z"
}
```

**Note:** If user is already enrolled, this updates their status to "active".

### GET /api/enrollments
Get authenticated user's enrollments.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "status": "active",
    "enrolled_at": "2024-01-21T10:00:00Z",
    "title": "Introduction to JavaScript",
    "description": "Learn JavaScript basics",
    "first_name": "John",
    "last_name": "Doe"
  }
]
```

### GET /api/enrollments/course/:courseId
Get all enrollments for a course (instructor can view their students).

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 2,
    "course_id": 1,
    "status": "active",
    "enrolled_at": "2024-01-21T10:00:00Z",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com"
  }
]
```

---

## Progress Tracking

### POST /api/progress/:lessonId/complete
Mark a lesson as completed by authenticated user.

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "lesson_id": 1,
  "completed": true,
  "completed_at": "2024-01-21T10:30:00Z",
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

### GET /api/progress/:lessonId
Get user's progress for a specific lesson.

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "lesson_id": 1,
  "completed": true,
  "completed_at": "2024-01-21T10:30:00Z",
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:30:00Z"
}
```

Or if not started:
```json
{
  "completed": false
}
```

### GET /api/progress/course/:courseId
Get all lesson progress for a course.

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "lesson_id": 1,
    "completed": true,
    "completed_at": "2024-01-21T10:30:00Z",
    "created_at": "2024-01-21T10:00:00Z",
    "updated_at": "2024-01-21T10:30:00Z",
    "title": "Lesson 1: Introduction"
  }
]
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Status Codes
- **200** - Success
- **201** - Created
- **400** - Bad request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not found
- **500** - Server error

---

## Example Workflow

1. **User Registration**
   ```
   POST /api/auth/register
   → Token received
   ```

2. **Instructor Creates Course**
   ```
   POST /api/courses (with token)
   → Course ID received
   ```

3. **Instructor Creates Module**
   ```
   POST /api/modules
   {
     "courseId": <course_id>,
     "title": "Module 1"
   }
   → Module ID received
   ```

4. **Instructor Creates Lesson with HTML Content**
   ```
   POST /api/lessons
   {
     "moduleId": <module_id>,
     "title": "Lesson 1",
     "content": "<h2>Welcome</h2><p>Course content...</p>",
     "lessonType": "content"
   }
   → Lesson ID received
   ```

5. **Instructor Uploads Files to Lesson**
   ```
   POST /api/lessons/<lesson_id>/upload
   → File attachment created
   ```

6. **Student Enrolls in Course**
   ```
   POST /api/enrollments
   {
     "courseId": <course_id>
   }
   → Enrollment created
   ```

7. **Student Views Course**
   ```
   GET /api/courses/<course_id>
   → Full course structure with modules and lessons
   ```

8. **Student Completes Lesson**
   ```
   POST /api/progress/<lesson_id>/complete
   → Progress recorded
   ```

9. **Student Checks Progress**
   ```
   GET /api/progress/course/<course_id>
   → List of completed lessons with timestamps
   ```

---

## Implementation Notes

- All timestamps are in ISO 8601 format (UTC)
- Passwords are hashed with bcrypt
- Tokens expire after 7 days
- File uploads are stored in `/uploads` directory
- Database uses cascading deletes to maintain referential integrity
- The `order_index` field in modules and lessons is used for ordering content
