# ProtexxaLearn User Roles & Permissions

## Overview

ProtexxaLearn supports three primary user roles, each with distinct permissions and features.

---

## 👨‍🎓 Student Role

### Purpose
Primary learners who enroll in courses and complete assignments.

### Permissions
- ✅ View and enroll in courses
- ✅ Submit assignments
- ✅ View grades and feedback
- ✅ Participate in discussions
- ✅ View announcements
- ✅ Access course materials
- ✅ Update profile and settings
- ❌ Create courses
- ❌ Grade other students
- ❌ Manage users
- ❌ Access admin panel

### Key Pages
```
/dashboard          - Personal dashboard with stats
/courses            - Browse and manage enrolled courses
/assignments        - View and submit assignments
/grades             - Track grades and feedback
/announcements      - View course announcements
/discussions        - Participate in forums
/calendar          - View schedule and due dates
/settings          - Manage profile
```

### Default Features
- Personal dashboard with progress overview
- Course enrollment and management
- Assignment tracking and submission
- Grade tracking with visual indicators
- Discussion participation
- Announcement notifications

### Workflows
1. **Enrolling in Course**
   - Browse courses page
   - View course details
   - Click "Enroll Now"
   - Course appears in "My Courses"

2. **Submitting Assignment**
   - Navigate to Assignments
   - Find assignment
   - Click to view details
   - Upload files/submit work
   - Track submission status

3. **Checking Grades**
   - Go to Grades page
   - View all grades with percentages
   - See instructor feedback
   - Track performance trends

---

## 👨‍🏫 Instructor Role

### Purpose
Create courses, manage materials, and grade student work.

### Permissions
- ✅ Create and edit courses
- ✅ Manage course materials
- ✅ Add and grade assignments
- ✅ View student progress
- ✅ Create announcements
- ✅ Send messages to students
- ✅ Generate performance reports
- ✅ Manage course access
- ❌ Create other courses (unless assigned)
- ❌ Manage users
- ❌ Access system admin panel
- ❌ Manage billing/organization

### Key Pages
```
/dashboard                 - Instructor dashboard overview
/admin/instructor         - Main instructor portal
/instructor/courses       - Manage taught courses
/instructor/assignments   - Grade student submissions
/instructor/students      - View student progress
/instructor/grading       - Bulk grading interface
/instructor/analytics     - Course and student analytics
/instructor/courses/:id   - Course detail & editing
```

### Default Features
- Personal dashboard with student count
- Course creation and management
- Material upload and organization
- Assignment creation and auto-grading
- Student performance tracking
- Grade management and feedback
- Course analytics and reports
- Student communication tools

### Workflows
1. **Creating a Course**
   - Click "New Course"
   - Fill course details
   - Set course dates
   - Add course materials
   - Publish course
   - Share enrollment link

2. **Managing Assignments**
   - Go to Course
   - Create Assignment
   - Set due date
   - Set grading criteria
   - View submissions
   - Grade and provide feedback

3. **Viewing Student Progress**
   - Go to Students tab
   - View student list
   - Click student name
   - View grades, attendance, engagement
   - Send messages if needed

4. **Creating Announcement**
   - Go to Announcements
   - Click "New Announcement"
   - Set priority level
   - Select courses
   - Publish

---

## 🔐 Admin Role

### Purpose
System-wide management, user administration, and platform configuration.

### Permissions
- ✅ Create, edit, delete users
- ✅ Create, edit, delete courses
- ✅ Assign instructors to courses
- ✅ Manage user roles
- ✅ Suspend/activate accounts
- ✅ View system analytics
- ✅ Configure system settings
- ✅ View audit logs
- ✅ Manage organization settings
- ✅ Access all student/instructor features
- ❌ Student/instructor limits don't apply (full access)

### Key Pages
```
/admin                    - Main admin dashboard
/admin/users             - User management
/admin/users/:id         - Edit user
/admin/users/new         - Create user
/admin/courses           - Course management
/admin/courses/:id       - Edit course
/admin/courses/new       - Create course
/admin/settings          - System settings
/admin/analytics         - System-wide analytics
/admin/activity          - Activity logs
```

### Default Features
- User management (create, edit, delete)
- Role assignment
- Course oversight
- System analytics
- Configuration management
- Audit logging
- Security settings
- Backup management

### Workflows
1. **Adding a New User**
   - Go to User Management
   - Click "New User"
   - Fill details (email, name, role)
   - Set status (active/inactive)
   - Send welcome email (optional)
   - User can login immediately

2. **Creating System Course**
   - Go to Courses
   - Click "New Course"
   - Fill details
   - Assign instructor
   - Publish
   - Course available for enrollment

3. **Suspending User Account**
   - Go to Users
   - Find user
   - Change status to "Suspended"
   - User cannot login
   - Can be reactivated later

4. **Viewing System Analytics**
   - Go to Admin Dashboard
   - View system stats (users, courses, enrollments)
   - Check active users
   - Review performance metrics

---

## Permission Matrix

| Feature | Student | Instructor | Admin |
|---------|---------|-----------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| Browse Courses | ✅ | ❌ | ✅ |
| Enroll in Course | ✅ | ❌ | ✅ |
| Create Course | ❌ | ✅ | ✅ |
| Edit Course | ❌ | ✅ (own) | ✅ |
| Delete Course | ❌ | ❌ | ✅ |
| Submit Assignment | ✅ | ❌ | ✅ |
| Grade Assignment | ❌ | ✅ | ✅ |
| View All Grades | ❌ | ✅ (own students) | ✅ |
| Create User | ❌ | ❌ | ✅ |
| Edit User | ❌ | ❌ | ✅ |
| Delete User | ❌ | ❌ | ✅ |
| View System Stats | ❌ | ❌ | ✅ |
| Manage Settings | ❌ | ❌ | ✅ |
| View All Courses | ❌ | ✅ (own) | ✅ |
| View All Users | ❌ | ❌ | ✅ |

---

## Role Assignment

### Default Creation
- New users default to **Student** role
- Instructors must be manually assigned
- Admins must be explicitly set

### Changing Roles
**By Admin**: Go to Users → Edit User → Change Role

**Self-Service**: Not available - must contact admin

### Role Hierarchy
```
Admin > Instructor > Student
```

Admins have all permissions of lower roles.
Instructors have some student permissions.

---

## Special Considerations

### Multiple Roles
Users can only have ONE role at a time.

### Role-Specific Settings
- **Students**: Personal grade tracking, enrollment history
- **Instructors**: Course statistics, class roster, grading settings
- **Admins**: Organization settings, user policies, security

### Switching Roles
- Users cannot self-switch roles
- Only admins can change user roles
- Session updates on next login

### Temporary Access
- Instructors can temporarily view student dashboard
- Admins can masquerade as any user (coming soon)
- Activity tracked for security

---

## Best Practices

### For Students
1. Keep profile updated
2. Check announcements regularly
3. Submit assignments early
4. Participate in discussions
5. Contact instructor with questions

### For Instructors
1. Set clear grading rubrics
2. Provide timely feedback
3. Keep course materials organized
4. Communicate expectations
5. Use announcements for updates

### For Admins
1. Regular user audits
2. Monitor system performance
3. Keep security settings current
4. Backup data regularly
5. Document procedures

---

## Support by Role

### Student Support
- Course help forums
- Peer discussion
- Instructor office hours
- Help center articles

### Instructor Support
- Admin portal documentation
- Training resources
- Direct admin contact
- Community forums

### Admin Support
- System documentation
- Technical support team
- Security guidelines
- Performance optimization guides

---

**Last Updated**: January 2026
**Version**: 1.0.0
