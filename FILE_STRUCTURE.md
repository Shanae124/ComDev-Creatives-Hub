# Frontend File Structure & Architecture

## Directory Overview

```
ProtexxaLearn/
├── app/                          # Next.js app directory (pages & layouts)
│   ├── admin/                    # Admin-only features
│   │   ├── courses/              # Course management
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Course detail/edit
│   │   │   └── new/
│   │   │       └── page.tsx      # Create course
│   │   ├── instructor/           # Instructor dashboard
│   │   │   └── page.tsx          # Instructor portal
│   │   ├── users/                # User management
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx      # Edit user
│   │   │   ├── new/
│   │   │   │   └── page.tsx      # Create user
│   │   │   └── page.tsx          # User list
│   │   ├── settings/             # System settings
│   │   │   └── page.tsx
│   │   └── page.tsx              # Admin dashboard
│   │
│   ├── announcements/
│   │   └── page.tsx              # Announcements page
│   │
│   ├── assignments/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Assignment detail
│   │   └── page.tsx              # Assignments list
│   │
│   ├── calendar/
│   │   └── page.tsx              # Calendar view
│   │
│   ├── courses/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Course detail
│   │   └── page.tsx              # Courses browse/list
│   │
│   ├── dashboard/
│   │   └── page.tsx              # Student dashboard
│   │
│   ├── discussions/
│   │   ├── [id]/
│   │   │   └── page.tsx          # Discussion thread
│   │   └── page.tsx              # Discussions list
│   │
│   ├── grades/
│   │   └── page.tsx              # Grades & performance
│   │
│   ├── login/
│   │   └── page.tsx              # Login page
│   │
│   ├── register/
│   │   └── page.tsx              # Registration page
│   │
│   ├── settings/
│   │   └── page.tsx              # User settings
│   │
│   ├── submissions/              # Assignment submissions
│   │   └── page.tsx
│   │
│   ├── verify-email/             # Email verification
│   │   └── page.tsx
│   │
│   ├── globals.css               # Global styles & animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home/landing page
│
├── components/                   # Reusable React components
│   ├── admin/                    # Admin-specific components
│   │
│   ├── ui/                       # Shadcn/Radix UI components
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toggle.tsx
│   │   └── ... (20+ more)
│   │
│   ├── course-grid.tsx           # Course card grid
│   ├── dashboard-content.tsx     # Dashboard main content
│   ├── header.tsx                # Top navigation bar
│   ├── protected-layout.tsx      # Auth wrapper layout
│   ├── sidebar.tsx               # Original sidebar (archived)
│   ├── sidebar-enhanced.tsx      # New role-based sidebar
│   ├── stats-cards.tsx           # Statistics cards
│   └── theme-provider.tsx        # Theme management
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection
│   └── use-toast.ts              # Toast notifications
│
├── lib/                          # Utility functions & configurations
│   ├── api.ts                    # API client utilities
│   ├── auth-store.ts             # Zustand auth store
│   └── utils.ts                  # General utilities
│
├── public/                       # Static assets
│   ├── icon.svg
│   ├── apple-icon.png
│   ├── icon-light-32x32.png
│   └── icon-dark-32x32.png
│
├── styles/                       # Additional styles
│   └── globals.css               # (backup)
│
├── .env.local                    # Environment variables
├── .env.example                  # Example env template
├── .eslintrc.json                # ESLint config
├── next.config.mjs               # Next.js config
├── package.json                  # Dependencies
├── postcss.config.mjs            # PostCSS config
├── tailwind.config.js            # Tailwind config
├── tsconfig.json                 # TypeScript config
│
└── Documentation/
    ├── FRONTEND_BUILD_SUMMARY.md      # This file - build overview
    ├── FRONTEND_COMPREHENSIVE_GUIDE.md # Complete feature guide
    ├── FRONTEND_QUICKSTART.md          # Quick start guide
    ├── ROLES_AND_PERMISSIONS.md        # Role documentation
    └── FILE_STRUCTURE.md               # This file

```

---

## Component Architecture

### Page Components (Pages with Logic)

#### Student Pages
- `dashboard/page.tsx` - Dashboard with stats & quick actions
- `courses/page.tsx` - Browse courses, view enrolled courses
- `announcements/page.tsx` - View announcements with filtering
- `discussions/page.tsx` - Forum/discussion threads
- `assignments/page.tsx` - Assignment tracking (coming soon)
- `grades/page.tsx` - Grade tracking (coming soon)
- `calendar/page.tsx` - Schedule & calendar (coming soon)

#### Instructor Pages
- `admin/instructor/page.tsx` - Main instructor portal
  - Course management tabs
  - Student progress tracking
  - Assignment grading queue

#### Admin Pages
- `admin/page.tsx` - Admin dashboard with system stats
- `admin/users/[id]/page.tsx` - Create/edit users
- `admin/courses/[id]/page.tsx` - Create/edit courses

#### Auth Pages
- `login/page.tsx` - Login form
- `register/page.tsx` - Registration form
- `verify-email/page.tsx` - Email verification

---

## Reusable Components

### Layout Components
```
components/
├── header.tsx              # Top navigation with search & user menu
├── sidebar-enhanced.tsx    # Role-based navigation sidebar
├── protected-layout.tsx    # Auth verification wrapper
└── theme-provider.tsx      # Dark/light mode provider
```

### Display Components
```
components/
├── course-grid.tsx         # Grid of course cards
├── dashboard-content.tsx   # Dashboard main section
└── stats-cards.tsx         # Statistics display cards
```

### UI Component Library
```
components/ui/
├── badge.tsx               # Colored status badges
├── button.tsx              # Button variants (primary, secondary, ghost, outline)
├── card.tsx                # Card container (Header, Content)
├── input.tsx               # Text input field
├── label.tsx               # Form label
├── select.tsx              # Dropdown select
├── tabs.tsx                # Tab navigation
├── dropdown-menu.tsx       # Dropdown menu
├── dialog.tsx              # Modal dialog
├── progress.tsx            # Progress bar
└── ... (15+ more)
```

---

## State Management

### Zustand Auth Store (`lib/auth-store.ts`)
```typescript
{
  user: { id, email, name, role },
  token: string,
  isAuthenticated: boolean,
  
  login(email, password),
  logout(),
  restoreSession(),
  setUser(user),
  setToken(token)
}
```

**Usage in Components:**
```typescript
const { user, isAuthenticated, logout } = useAuthStore(state => ({...}))
```

---

## API Integration Pattern

### Fetching Data
```typescript
const fetchData = async () => {
  try {
    const token = useAuthStore.getState().token
    const response = await fetch('/api/endpoint', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    setData(data)
  } catch (error) {
    setError(error.message)
  }
}
```

---

## Styling Approach

### Color System (CSS Variables)
```css
--primary: oklch(0.35 0.22 240)       /* Deep blue */
--secondary: oklch(0.55 0.25 200)     /* Cyan */
--accent: oklch(0.65 0.22 190)        /* Teal */
--success: oklch(0.65 0.20 150)       /* Green */
--warning: oklch(0.70 0.20 50)        /* Orange */
--destructive: oklch(0.55 0.22 25)    /* Red */
```

### Tailwind Utility Classes
```tsx
<div className="p-6 md:p-8">           {/* Responsive padding */}
  <h1 className="text-4xl font-bold">  {/* Responsive font size */}
  <button className="bg-primary hover:bg-primary/90">
</div>
```

---

## Responsive Design

### Mobile-First Approach
```
sm:  640px   (tablets)
md:  768px   (larger tablets)
lg:  1024px  (desktops)
xl:  1280px  (large desktops)
2xl: 1536px  (very large screens)
```

### Example Usage
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Authentication Flow

```
1. User visits /login
2. Enter email/password
3. POST /api/auth/login
4. Receive JWT token
5. Store in auth-store
6. Redirect to /dashboard
7. Header auth verification
8. Sidebar shows based on role
9. Protected routes accessible
10. Token expires after 7 days
11. Auto-logout & redirect to login
```

---

## Role-Based Navigation

```
Student Dashboard
├── My Dashboard
├── My Courses
├── Assignments
├── Grades
├── Calendar
├── Announcements
├── Discussions
└── Settings

Instructor Dashboard
├── My Dashboard
├── My Courses
├── Assignments (to grade)
├── Students
├── Grading
└── Settings

Admin Dashboard
├── System Admin
├── Users Management
├── Courses Management
├── System Settings
└── Activity Logs
```

---

## Build Process

### Development
```bash
npm run dev
# - Hot module replacement
# - Fast refresh on file changes
# - Source maps for debugging
# - Runs on http://localhost:3001
```

### Production Build
```bash
npm run build
# - Code splitting
# - Minification
# - Image optimization
# - Tree shaking
# - ~2-3MB bundle size
```

---

## Performance Optimizations

1. **Code Splitting**
   - Dynamic imports for large components
   - Route-based splitting

2. **Image Optimization**
   - Next.js Image component
   - Automatic format conversion
   - Lazy loading

3. **Caching**
   - Browser cache for static assets
   - API response caching

4. **Bundling**
   - Minified CSS/JS
   - CSS modules for isolation
   - Unused code removal

---

## Key Technologies

| Technology | Purpose | Version |
|-----------|---------|---------|
| Next.js | React framework | 16.0.10 |
| React | UI library | 18.x |
| TypeScript | Type safety | 5.x |
| TailwindCSS | Styling | 3.x |
| Radix UI | Component primitives | latest |
| Zustand | State management | 4.x |
| Lucide React | Icons | latest |

---

## Adding New Features

### Create a New Page
1. Create `app/[feature]/page.tsx`
2. Import components and hooks
3. Add navigation link to sidebar
4. Test with all roles

### Create a New Component
1. Create `components/[Component].tsx`
2. Use existing UI components
3. Accept props for reusability
4. Export and import where needed

### Add API Integration
1. Create fetch function
2. Add error handling
3. Use auth token in headers
4. Test in browser DevTools

---

## File Size Reference

```
Total Bundle: ~2-3MB
CSS: ~500KB
JavaScript: ~1.5MB
Images: ~500KB-1MB
Fonts: ~200KB

Optimized Production: ~800KB-1MB (gzipped)
```

---

## Testing File Structure

```
(Recommended for future)

__tests__/
├── unit/
│   ├── lib/
│   ├── hooks/
│   └── utils/
├── integration/
│   ├── api/
│   └── auth/
└── e2e/
    ├── auth/
    ├── student/
    ├── instructor/
    └── admin/
```

---

## CI/CD Integration

```
.github/workflows/
├── test.yml          # Run tests on PR
├── build.yml         # Build check
└── deploy.yml        # Deploy to production
```

---

## Environment Configuration

```
.env.local
├── NEXT_PUBLIC_API_URL=http://localhost:3000
├── NEXT_PUBLIC_ANALYTICS_ID=(optional)
└── DEBUG=false
```

---

## Quick Reference

| Task | File |
|------|------|
| Add new page | `app/[page]/page.tsx` |
| Create component | `components/[Name].tsx` |
| Update styles | `app/globals.css` |
| Change colors | `app/globals.css` (CSS variables) |
| Auth logic | `lib/auth-store.ts` |
| API calls | Component files |
| UI components | `components/ui/` |
| Navigation | `components/sidebar-enhanced.tsx` |

---

**Version**: 1.0.0
**Last Updated**: January 21, 2026
