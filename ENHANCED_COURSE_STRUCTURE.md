# ProtexxaLearn - Enhanced Course Structure Guide

## Overview

ProtexxaLearn now supports a comprehensive hierarchical course structure with:
- **Modules & Lessons**: Organize content into logical sections
- **Multiple Content Types**: Reading, Videos, Quizzes, Assignments, Interactive content
- **Rich Media Support**: YouTube, Vimeo, and embedded video players
- **Lesson Management**: Edit individual lessons without affecting entire course
- **Course Builder**: Visual interface for managing course structure

## Architecture

### Course Hierarchy
```
Course
├── Module 1
│   ├── Lesson 1 (Reading)
│   ├── Lesson 2 (Video)
│   └── Lesson 3 (Quiz)
├── Module 2
│   ├── Lesson 4 (Interactive)
│   └── Lesson 5 (Assignment)
└── Module 3
    └── Lesson 6 (Video)
```

## Database Schema

### Existing Tables
- `courses` - Course metadata
- `modules` - Module organization
- `lessons` - Individual lesson content
- `enrollments` - User course enrollments

### Lesson Types
```sql
lesson_type: 'reading' | 'video' | 'quiz' | 'assignment' | 'interactive'
```

## Features

### 1. Course Builder Interface
**Path:** `/admin/courses/[id]/structure`

Provides:
- Overview of course statistics
- Module and lesson count
- Quick actions to manage content
- Structure visualization
- Course management options
- Analytics dashboard

**Key Components:**
- Module overview with lesson counts
- Quick action buttons
- Course settings access
- Analytics integration ready

### 2. Lesson Management
**Path:** `/admin/courses/[id]/lessons`

Features:
- **Hierarchical Module Navigation**: Sidebar shows all modules with expandable lessons
- **Individual Lesson Editing**: Edit title, type, duration, and HTML content
- **Content Preview**: Live iframe preview while editing
- **Create New Lessons**: Add lessons to any module
- **Delete Lessons**: Remove lessons with confirmation
- **Type Support**: 5 lesson types with unique icons

**Supported Lesson Types:**
- 📖 Reading - Traditional text-based lessons
- 🎥 Video - Video content (embed URL based)
- ❓ Quiz - Interactive quizzes
- ✏️ Assignment - Assignment submissions
- 🎮 Interactive - Interactive learning experiences

### 3. Video Management
**Path:** `/admin/courses/[id]/videos`

Complete video management system:
- **Video Upload**: Add videos by embed URL
- **Platform Support**: YouTube, Vimeo, custom embed URLs
- **Video Grid**: Visual grid display of all videos
- **Video Details**: Title, duration, description, module assignment
- **Statistics**: Total videos, modules, duration tracking
- **Edit/Delete**: Modify or remove video lessons
- **Preview**: Live video preview before publishing

**Supported Video Platforms:**
- YouTube (including YouTube Nocookie for privacy)
- Vimeo
- Custom HTML5 video embeds
- Kaltura or other LMS video platforms

### 4. Enhanced Course Viewer
**Path:** `/courses/[courseId]`

Improved student experience:
- **Hierarchical Navigation**: Sidebar shows full course structure
- **Module Expansion**: Click to expand/collapse modules
- **Lesson Selection**: Click any lesson to view
- **Tab-Based Interface**:
  - Overview: Course description and structure
  - Content View: Interactive lesson viewer
  - Instructor: Instructor information
- **Responsive Design**: Works on all devices
- **Progress Tracking Ready**: Foundation for completion tracking

**Key Features:**
- Enrollment management
- Course metadata display
- Module/lesson navigation
- Iframe-based content isolation
- Video and text content support

## API Endpoints

### Modules
```
GET  /courses/:courseId/modules           - Get all modules for course
POST /modules                             - Create new module
PUT  /modules/:moduleId                   - Update module
DELETE /modules/:moduleId                 - Delete module
```

### Lessons
```
GET  /courses/:courseId/lessons           - Get all lessons for course
POST /lessons                             - Create new lesson
PUT  /lessons/:lessonId                   - Update lesson
DELETE /lessons/:lessonId                 - Delete lesson
GET  /courses/:courseId/videos            - Get all video lessons
```

### Lesson Progress
```
GET  /lessons/:lessonId/progress          - Get user's progress
PUT  /lessons/:lessonId/progress          - Update progress
POST /lessons/:lessonId/complete          - Mark as complete
```

## Usage Guide

### For Instructors

#### Creating a Course with Multiple Lessons

1. **Create Course**
   - Go to `/admin/courses`
   - Create new course with title and description

2. **Add Modules**
   - Navigate to `/admin/courses/[id]/structure`
   - Click "Add Module"
   - Enter module title and description

3. **Add Lessons**
   - Go to `/admin/courses/[id]/lessons`
   - Select module from sidebar
   - Click "Add Lesson"
   - Choose lesson type (reading, video, quiz, etc.)
   - Add content and save

4. **Add Videos**
   - Navigate to `/admin/courses/[id]/videos`
   - Click "Add Video Lesson"
   - Paste video embed URL (YouTube, Vimeo, etc.)
   - Set duration and description
   - Save

5. **Manage Content**
   - Use Course Editor (`/admin/courses/[id]/edit`) for legacy HTML content
   - Use Lesson Management for granular control
   - Use Video Management for media-rich content

#### Adding Video Content

**YouTube Videos:**
```
https://www.youtube.com/embed/VIDEO_ID
```

**Vimeo Videos:**
```
https://vimeo.com/VIDEO_ID
```

**YouTube Nocookie (Privacy):**
```
https://www.youtube-nocookie.com/embed/VIDEO_ID
```

### For Students

#### Viewing Course Content

1. **Browse Courses**
   - Navigate to Dashboard → My Courses
   - Click course card

2. **View Course Structure**
   - See all modules in sidebar
   - Expand modules to see lessons

3. **Access Lessons**
   - Click any lesson in sidebar
   - Content loads in main view
   - Videos play directly in iframe
   - Text content renders with full interactivity

4. **Track Progress**
   - View completion status per lesson
   - Progress bar shows overall course completion
   - Resume from last watched lesson

## Code Examples

### Creating a Video Lesson Programmatically

```javascript
// POST /lessons
{
  "module_id": 1,
  "title": "Introduction to Web Security",
  "content_html": "<iframe src=\"https://www.youtube.com/embed/dQw4w9WgXcQ\" ...></iframe>",
  "lesson_type": "video",
  "duration_minutes": 15,
  "sort_order": 1
}
```

### Creating a Reading Lesson

```javascript
// POST /lessons
{
  "module_id": 1,
  "title": "Web Security Fundamentals",
  "content_html": "<h2>Web Security Fundamentals</h2><p>Content here...</p>",
  "lesson_type": "reading",
  "duration_minutes": 20,
  "sort_order": 2
}
```

### Updating Lesson Content

```javascript
// PUT /lessons/123
{
  "title": "Updated Lesson Title",
  "content_html": "<h2>New Content</h2>",
  "lesson_type": "reading",
  "duration_minutes": 25
}
```

## Technical Details

### Content Rendering

All lesson content is rendered in isolated iframes with:
- Script execution enabled (allow-scripts)
- Form support (allow-forms)
- Modal support (allow-modals)
- Full interactivity

```tsx
<iframe
  srcDoc={content}
  className="w-full border-0 rounded-lg"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
  style={{ minHeight: "600px" }}
/>
```

### Lesson Types

| Type | Use Case | Editor |
|------|----------|--------|
| reading | Text, images, interactivity | Lesson Management |
| video | Video content | Video Management |
| quiz | Knowledge checks | Quiz Builder (future) |
| assignment | Student work submissions | Assignment Manager (future) |
| interactive | Interactive simulations | Custom HTML/iframes |

## Storage & Performance

### Database Considerations
- Lesson content stored as HTML in `content_html` field
- Video metadata (URL, duration) stored in lesson records
- Thumbnail URLs can be generated from video services
- Progress tracking in `lesson_progress` table

### Optimization Tips
1. **Lazy Load Videos**: Don't auto-play videos in lists
2. **Compress Media**: Optimize video quality and size
3. **Cache Content**: Enable browser caching for HTML content
4. **Pagination**: Limit module/lesson loading per page
5. **CDN**: Host videos on CDN for faster delivery

## Future Enhancements

### Planned Features
- [ ] Lesson-level progress tracking
- [ ] Video playback resume position
- [ ] Interactive quiz engine
- [ ] Assignment grading interface
- [ ] Inline comments/annotations
- [ ] Learning objectives per lesson
- [ ] Prerequisite lessons
- [ ] Adaptive learning paths
- [ ] AI-powered recommendations
- [ ] Offline lesson downloads

### Under Consideration
- Drag-and-drop lesson reordering
- Lesson templates and presets
- Content versioning
- Collaborative lesson editing
- Rich media asset management
- Advanced analytics per lesson

## Troubleshooting

### Lesson Content Not Displaying
**Issue:** Lesson content shows blank
**Solution:** 
1. Check content_html is valid HTML
2. Verify iframe sandbox settings
3. Test with simple HTML first

### Video Not Playing
**Issue:** Video iframe shows blank or error
**Solution:**
1. Verify embed URL format
2. Check video platform supports embeds
3. Test URL directly in browser
4. Use YouTube Nocookie for privacy compliance

### Module Expansion Not Working
**Issue:** Modules won't expand in sidebar
**Solution:**
1. Refresh page
2. Check browser console for errors
3. Verify module has lessons in database

### Lesson Save Fails
**Issue:** Error when saving lesson
**Solution:**
1. Verify module_id is valid
2. Check content_html for invalid characters
3. Verify user permissions (instructor/admin only)
4. Check API server is running

## Best Practices

### Content Organization
1. **Logical Grouping**: Group related lessons in modules
2. **Clear Naming**: Use descriptive lesson titles
3. **Consistent Formatting**: Use similar content structure
4. **Pacing**: 15-20 minute lessons optimal
5. **Mix Content Types**: Combine videos, text, interactive elements

### Video Strategy
1. **Quality First**: Use high-quality video recordings
2. **Captions**: Add captions for accessibility
3. **Duration**: Keep videos under 20 minutes
4. **Transcripts**: Provide video transcripts
5. **Platform**: Use YouTube or Vimeo for reliability

### Assessment
1. **Frequent Quizzes**: Quick knowledge checks
2. **Assignments**: Hands-on practice
3. **Projects**: Real-world application
4. **Peer Review**: Student feedback
5. **Auto-Grading**: Use quiz engines

## API Reference

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full API documentation.

## Support

For issues or questions:
1. Check this guide
2. Review troubleshooting section
3. Check API logs
4. Contact development team

---

**Last Updated**: January 2025
**Version**: 2.0 (Enhanced Course Structure)
