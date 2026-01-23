# ProtexxaLearn Admin Backend - Complete Guide

## Overview

ProtexxaLearn now includes a comprehensive administrative backend for managing all aspects of your LMS. This guide covers all administrative features, endpoints, and setup instructions.

## Features Implemented

### 1. Course Administration ✅
- **Site Configuration**: Manage platform-wide settings
- **Availability Dates**: Set default course availability
- **Course Builder**: Create and manage course structures
- **Content Management**: Organize course materials
- **Calendar Integration**: Academic calendar and events
- **External Learning Tools**: LTI integrations
- **FAQ Management**: Course-specific help content
- **Glossary**: Term definitions and resources
- **Import/Export**: Course migration tools
- **File Management**: Upload and organize course files

### 2. Learner Management ✅
- **Classlist**: View and manage enrolled students
- **Attendance Tracking**: Record daily attendance
- **Class Progress**: Monitor student completion rates
- **Student Groups**: Organize students into teams

### 3. Assessment Tools ✅
- **Assignments**: Create and grade assignments
- **Quizzes**: Question banks and automated grading
- **Grades**: Comprehensive gradebook
- **Rubrics**: Grading criteria and standards
- **Checklists**: Learning objectives tracking
- **Competencies**: Skills assessment
- **Self Assessments**: Student reflections
- **Surveys**: Course feedback collection
- **Awards/Badges**: Achievement recognition
- **Quick Eval**: Fast evaluation tools

### 4. Communication ✅
- **Announcements**: Course-wide messaging
- **Discussions**: Forum system
- **Intelligent Agents**: Automated notifications (planned)
- **Bulk Email**: Mass communication tools

### 5. Administration Tools ✅
- **Database Management**: Backup and restore
- **User Management**: Full CRUD operations
- **Analytics**: System-wide reports
- **Security Settings**: Access control
- **System Maintenance**: Health monitoring
- **Global Settings**: Platform configuration

## Database Schema

Run the admin database migration:

```bash
node init-admin-features.js
```

This creates the following tables:
- `attendance` - Attendance tracking
- `groups` & `group_members` - Student grouping
- `quizzes`, `quiz_questions`, `quiz_attempts` - Quiz system
- `rubrics` - Grading rubrics
- `checklists` & `checklist_progress` - Learning checklists
- `competencies` & `user_competencies` - Skills tracking
- `surveys` & `survey_responses` - Feedback collection
- `awards` & `user_awards` - Badge system
- `system_settings` - Platform configuration
- `email_logs` - Email audit trail
- `faq` - FAQ content
- `glossary` - Term definitions
- `discussions` & `discussion_posts` - Forum system
- `external_tools` - LTI integrations
- `calendar_events` - Academic calendar
- `quick_links` - Resource shortcuts

## API Endpoints

### System Statistics
```
GET /admin/stats - Get system-wide statistics
```

### User Management
```
GET /admin/users - List all users with details
PUT /admin/users/:id/role - Update user role
PUT /admin/users/:id/status - Suspend/activate user
DELETE /admin/users/:id - Delete user
```

### Attendance
```
GET /admin/courses/:course_id/attendance?date=YYYY-MM-DD
POST /admin/attendance - Record attendance
```

### Groups
```
POST /admin/groups - Create student group
GET /admin/courses/:course_id/groups - List course groups
POST /admin/groups/:group_id/members - Add member to group
```

### Quizzes
```
POST /admin/quizzes - Create quiz
GET /admin/courses/:course_id/quizzes - List course quizzes
```

### Rubrics
```
POST /admin/rubrics - Create rubric
GET /admin/courses/:course_id/rubrics - List course rubrics
```

### Surveys
```
POST /admin/surveys - Create survey
GET /admin/courses/:course_id/surveys - List course surveys
```

### System Settings
```
GET /admin/settings - Get all settings
PUT /admin/settings - Update settings (bulk)
```

### Analytics
```
GET /admin/analytics/overview - System analytics dashboard
GET /admin/courses/:course_id/progress-report - Detailed progress report
```

### Bulk Operations
```
POST /admin/bulk-email - Send bulk emails
```

### FAQ
```
POST /admin/faq - Create FAQ entry
GET /admin/faq?course_id=X - List FAQ entries
```

### Glossary
```
POST /admin/glossary - Add glossary term
GET /admin/glossary?course_id=X - List glossary terms
```

## Frontend Routes

### Admin Settings Hub
```
/admin/settings - Main admin settings dashboard
```

### Learner Management
```
/admin/learners/classlist - Student roster
/admin/learners/attendance - Attendance tracking
/admin/learners/progress - Progress monitoring
/admin/learners/groups - Group management
```

### Assessment Management
```
/admin/assessment/assignments - Assignment management
/admin/assessment/quizzes - Quiz builder
/admin/assessment/grades - Gradebook
/admin/assessment/rubrics - Rubric editor
/admin/assessment/awards - Badge system
/admin/assessment/checklists - Checklist management
/admin/assessment/competencies - Competency tracking
/admin/assessment/self-assessment - Self-assessment tools
/admin/assessment/surveys - Survey management
/admin/assessment/quick-eval - Quick evaluation
```

### Communication
```
/admin/communication/announcements - Announcement center
/admin/communication/discussions - Forum management
/admin/communication/agents - Intelligent agents
```

### Admin Tools
```
/admin/tools/database - Database management
/admin/tools/analytics - Analytics dashboard
/admin/tools/security - Security settings
/admin/tools/maintenance - System maintenance
/admin/tools/global-settings - Global configuration
```

### Course Administration
```
/admin/settings/site-config - Site configuration
/admin/settings/availability - Availability dates
/admin/settings/course-builder - Course templates
/admin/settings/content - Content management
/admin/settings/calendar - Calendar settings
/admin/settings/external-tools - LTI integration
/admin/settings/faq - FAQ management
/admin/settings/glossary - Glossary editor
/admin/settings/import-export - Migration tools
/admin/settings/links - Quick links
/admin/settings/files - File management
```

## Access Control

All admin endpoints require authentication and role-based authorization:

**Admin Role Required:**
- System statistics
- User management
- System settings
- Analytics
- Database management

**Admin or Instructor Role:**
- Course management
- Attendance tracking
- Grade management
- Content creation
- Student groups
- Quizzes and assessments

## System Settings

Default settings can be configured via `/admin/settings`:

```javascript
{
  site_name: "ProtexxaLearn",
  allow_registration: true,
  require_email_verification: false,
  default_course_availability: "immediate",
  max_file_upload_size: 50, // MB
  session_timeout: 480, // minutes
  maintenance_mode: false,
  enable_discussions: true,
  enable_announcements: true,
  enable_assignments: true,
  enable_quizzes: true,
  enable_grades: true,
  enable_attendance: true
}
```

## Data Models

### Attendance Record
```typescript
{
  user_id: number
  course_id: number
  date: Date
  status: 'present' | 'absent' | 'late' | 'excused'
  notes?: string
  recorded_by: number
}
```

### Quiz
```typescript
{
  course_id: number
  title: string
  description: string
  duration_minutes: number
  due_date: Date
  attempts_allowed: number
  status: 'draft' | 'published' | 'archived'
}
```

### Rubric
```typescript
{
  course_id: number
  title: string
  description: string
  criteria: Array<{
    name: string
    levels: Array<{
      description: string
      points: number
    }>
  }>
}
```

### Survey
```typescript
{
  course_id: number
  title: string
  description: string
  questions: Array<{
    question: string
    type: 'text' | 'multiple_choice' | 'rating' | 'yes_no'
    options?: string[]
  }>
  due_date: Date
  anonymous: boolean
}
```

## Setup Instructions

### 1. Run Database Migration
```bash
node init-admin-features.js
```

### 2. Create Admin User
If you need to promote a user to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 3. Configure System Settings
Access `/admin/settings` and configure your platform preferences.

### 4. Start Using Admin Features
Navigate to `/admin/settings` to access all administrative tools.

## Best Practices

### Security
- Always verify user roles before granting access
- Use rate limiting on bulk operations
- Audit all administrative actions
- Regularly backup your database

### Performance
- Use pagination for large datasets
- Cache frequently accessed settings
- Index database queries appropriately
- Monitor query performance

### Data Management
- Schedule automatic backups
- Implement data retention policies
- Archive old courses and data
- Monitor storage usage

## Future Enhancements

Planned features:
- Advanced analytics dashboard
- Intelligent agents for automated notifications
- Course templates and duplication
- Advanced grading workflows
- Integration with external SIS systems
- Mobile app admin panel
- Real-time collaboration tools
- AI-powered insights and recommendations

## Support

For issues or questions:
1. Check the API documentation above
2. Review error logs in `/admin/tools/maintenance`
3. Test endpoints using the provided examples
4. Check database connectivity and permissions

## License

Part of ProtexxaLearn LMS - All rights reserved.
