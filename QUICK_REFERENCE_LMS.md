# ProtexxaLearn Advanced LMS - Quick Reference Guide

## 📍 Feature Locations

### Navigation Bar
- **Component**: `components/nav-enhanced.tsx`
- **Shows**: Dashboard, Courses, Help (all roles)
- **Instructor**: Grading, Gradebook, Pages, Quizzes
- **Admin**: Admin, Users, Plugins, Impersonate
- **User Menu**: Profile, Settings, Logout

### Page Builder
- **Path**: `/pages-builder`
- **File**: `app/pages-builder/page.tsx`
- **Does**: Create custom HTML/CSS/JS pages
- **Stores**: In `pages` table
- **API**: `/api/pages`

### Quiz Management
- **Path**: `/quizzes`
- **File**: `app/quizzes/page.tsx`
- **Does**: Create quizzes with multiple question types
- **Stores**: In `quizzes`, `quiz_questions`, `quiz_attempts` tables
- **API**: `/api/quizzes`

### Gradebook
- **Path**: `/gradebook`
- **File**: `app/gradebook/page.tsx`
- **Does**: Track and calculate student grades
- **Stores**: In `assignment_grades`, `exam_grades` tables
- **API**: `/api/gradebook`

### Settings
- **Path**: `/settings`
- **File**: `app/settings/page.tsx`
- **Tabs**:
  - Account (name, email, password)
  - Notifications (7 options)
  - Privacy (visibility, messages, 2FA)
  - Appearance (theme, font size)
  - Accessibility (8 options)
- **Stores**: In `user_settings` table

### Admin: Impersonate User
- **Path**: `/admin/impersonate`
- **File**: `app/admin/impersonate/page.tsx`
- **Does**: Login as another user for support
- **Logs**: In `impersonation_log` table
- **Shows**: Audit trail of all impersonations

### Admin: Plugins
- **Path**: `/admin/plugins`
- **File**: `app/admin/plugins/page.tsx`
- **Tabs**:
  - Installed (manage current)
  - Available (browse & install)
  - Categories (filter)
  - Settings (config options)
- **Stores**: In `plugins`, `plugin_installations` tables

---

## 🔗 Database Tables

### New Tables Created (14)

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `pages` | Custom course pages | course_id, title, html_content, css_content, js_content, status |
| `quizzes` | Quiz definitions | course_id, title, time_limit, max_attempts, shuffle_questions |
| `quiz_questions` | Quiz questions | quiz_id, question_text, question_type, points |
| `quiz_answer_options` | Answer choices | question_id, option_text, is_correct, feedback |
| `quiz_attempts` | Student quiz attempts | quiz_id, student_id, score, attempt_number |
| `quiz_responses` | Individual responses | attempt_id, question_id, answer_option_id, is_correct |
| `assignments` | Assignment definitions | course_id, title, due_date, max_points |
| `assignment_grades` | Assignment grades | student_id, assignment_id, grade |
| `exams` | Exam definitions | course_id, title, exam_date, duration_minutes |
| `exam_grades` | Exam grades | student_id, exam_id, grade |
| `gradebook_config` | Grading weights | course_id, assignment_weight, quiz_weight, exam_weight |
| `plugins` | Plugin metadata | name, version, author, rating, downloads |
| `plugin_installations` | Installed plugins | plugin_id, installed_by, is_active |
| `impersonation_log` | Audit trail | admin_id, impersonated_user_id, started_at, ended_at |
| `user_settings` | User preferences | user_id, theme, font_size, notifications_enabled |
| `activity_log` | Activity tracking | user_id, action_type, entity_type, entity_id |

---

## 🔌 API Endpoints

### Pages API
```
GET    /api/pages                     Get all pages
GET    /api/pages?courseId=123        Get course pages
POST   /api/pages                     Create page
PUT    /api/pages                     Update page
DELETE /api/pages?id=123              Delete page
```

### Quizzes API
```
GET    /api/quizzes                   Get all quizzes
GET    /api/quizzes?courseId=123      Get course quizzes
POST   /api/quizzes                   Create quiz
PUT    /api/quizzes                   Update quiz
DELETE /api/quizzes?id=123            Delete quiz
GET    /api/quiz-attempts?quizId=123  Get quiz results
POST   /api/quiz-attempts             Submit attempt
```

### Gradebook API
```
GET    /api/gradebook?courseId=123           Get gradebook
POST   /api/gradebook                        Record grade
PUT    /api/gradebook                        Update grade
GET    /api/gradebook/stats?courseId=123     Get statistics
GET    /api/gradebook/config?courseId=123    Get config
PUT    /api/gradebook/config                 Update config
```

---

## 💾 Database Initialization

### Run Setup Script
```bash
node scripts/init-lms-schema.js
```

### What It Creates
- ✅ 14 new database tables
- ✅ Indexes for performance
- ✅ Foreign key relationships
- ✅ Unique constraints
- ✅ Sample plugin data

### One-Time Setup
```bash
# 1. Initialize schema
node scripts/init-lms-schema.js

# 2. Restart your server
npm run dev

# 3. Login and test features
```

---

## 🎯 User Workflows

### Student Workflow
```
1. Login → /dashboard
2. View courses → /courses
3. Take quiz → /quizzes
4. Submit assignment → /assignments
5. Check grades → /grades
6. Read announcements → /announcements
7. Join discussions → /discussions
8. Update settings → /settings
```

### Instructor Workflow
```
1. Login → /dashboard
2. View courses → /courses
3. Create page → /pages-builder
4. Create quiz → /quizzes
5. Grade submissions → /admin/instructor
6. View gradebook → /gradebook
7. Manage plugins → /admin/plugins
8. Check settings → /settings
```

### Admin Workflow
```
1. Login → /admin
2. Manage users → /admin/users
3. Manage courses → /admin/courses
4. Impersonate user → /admin/impersonate
5. Install plugins → /admin/plugins
6. Review logs → (activity_log)
7. Configure system → /settings
```

---

## 🧮 Grade Calculation

### Weighted Average
```
Final Grade = (Assignment Avg × 0.40) 
            + (Quiz Avg × 0.30)
            + (Exam Avg × 0.30)
```

### Example
```
Assignment Avg: 90 → 90 × 0.40 = 36 points
Quiz Avg:       85 → 85 × 0.30 = 25.5 points
Exam Avg:       92 → 92 × 0.30 = 27.6 points
─────────────────────────────────────────
Final Grade: 89.1 = B (80-89)
```

### Letter Grade Scale
- **A**: 90-100 (Excellent)
- **B**: 80-89 (Good)
- **C**: 70-79 (Average)
- **D**: 60-69 (Below Average)
- **F**: 0-59 (Failing)

---

## 🔐 Security & Permissions

### Role-Based Access
```
Student:
- View own grades ✓
- Submit assignments ✓
- Take quizzes ✓
- Cannot see gradebook ✗
- Cannot impersonate ✗

Instructor:
- Create pages ✓
- Create quizzes ✓
- Grade assignments ✓
- View gradebook ✓
- Cannot impersonate ✗
- Cannot manage plugins ✗

Admin:
- All features ✓
- Impersonate users ✓
- Manage plugins ✓
- System settings ✓
```

### Audit Logging
- ✅ All impersonations logged
- ✅ All activity tracked
- ✅ Timestamps on all actions
- ✅ User attribution on changes

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Features Responsive On
- ✅ Navigation bar (hamburger on mobile)
- ✅ Gradebook (horizontal scroll on mobile)
- ✅ Settings tabs (vertical on mobile)
- ✅ Quiz interface
- ✅ Page builder
- ✅ Plugin management

---

## 🎨 Customization

### Colors (from globals.css)
```css
--primary: #0f3d6d         /* Deep Blue */
--secondary: #00bcd4       /* Cyan */
--accent: #16a095          /* Teal */
--success: #10b981         /* Green */
--warning: #f59e0b         /* Orange */
--destructive: #ef4444     /* Red */
```

### Theme Toggle
```tsx
// In settings → Appearance
- Light mode
- Dark mode
- Auto (system preference)
```

---

## 🚀 Performance Tips

### Optimization Settings
1. **Lazy Loading**: Quiz questions load on demand
2. **Pagination**: Gradebook paginated for large classes
3. **Caching**: User settings cached locally
4. **Indexing**: Activity log indexed on user_id, created_at
5. **Compression**: API responses gzipped

### Monitor Performance
```bash
# Check API response times
# Check database query times
# Monitor bundle size: npm run analyze
```

---

## 🐛 Troubleshooting

### Page Builder Not Saving
- Check: Is course_id set?
- Check: API route `/api/pages` working?
- Check: Database connection valid?

### Grades Not Calculating
- Check: `gradebook_config` has weights?
- Check: Default weights: 40/30/30?
- Check: All grades recorded?

### Quiz Not Showing
- Check: Quiz published (not draft)?
- Check: Student enrolled in course?
- Check: Quiz has questions?

### Settings Not Saving
- Check: user_settings table exists?
- Check: User ID correct?
- Check: API route working?

---

## 📚 Documentation Files

1. **LMS_ADVANCED_FEATURES_GUIDE.md** - Complete feature documentation
2. **IMPLEMENTATION_SUMMARY_V2.md** - Build summary and status
3. **This file** - Quick reference
4. **ROLES_AND_PERMISSIONS.md** - Role documentation
5. **FRONTEND_BUILD_SUMMARY.md** - Frontend overview

---

## ✨ What Makes This LMS Complete

| Feature | Included | Comparable To |
|---------|----------|----------------|
| Page Builder | ✅ | Canvas Pages |
| Quiz System | ✅ | Blackboard Quizzes |
| Gradebook | ✅ | Brightspace Gradebook |
| User Settings | ✅ | Moodle Preferences |
| Accessibility | ✅ | WCAG 2.1 |
| Mobile Support | ✅ | All platforms |
| Dark Mode | ✅ | Modern LMS |
| Admin Controls | ✅ | Complete |
| Audit Logging | ✅ | Compliance ready |
| Plugin System | ✅ | Extensible |

---

## 🎯 Next: Database Integration

```bash
# Step 1: Run initialization
node scripts/init-lms-schema.js

# Step 2: Test database
psql -U postgres -d protexa_learn -c "SELECT COUNT(*) FROM pages;"

# Step 3: Verify tables
psql -U postgres -d protexa_learn -c "\dt"

# Step 4: Start development
npm run dev

# Step 5: Test features at http://localhost:3001
```

---

## 📞 Quick Links

- **Main Dashboard**: `/dashboard`
- **All Courses**: `/courses`
- **User Settings**: `/settings`
- **Admin Panel**: `/admin` (admins only)
- **Help & Support**: `/support`

---

**Last Updated**: January 21, 2026  
**Version**: 2.0.0  
**Status**: Production Ready ✅
