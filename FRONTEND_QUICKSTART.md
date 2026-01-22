# Frontend Quick Start Guide

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

## Configuration

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Running the Frontend

### Development Mode
```bash
# Start dev server on port 3001
npm run dev
```

Access at: `http://localhost:3001`

### Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

## Testing Different Roles

### Student Account
```
Email: student@example.com
Password: password123
```
Access: All student features, my courses, assignments, grades

### Instructor Account
```
Email: instructor@example.com
Password: password123
```
Access: Instructor dashboard, course management, student grading

### Admin Account
```
Email: admin@example.com
Password: password123
```
Access: Admin panel, user management, system settings

## Key Pages

| Role | Pages |
|------|-------|
| **Student** | /dashboard, /courses, /assignments, /grades, /announcements, /discussions |
| **Instructor** | /dashboard, /admin/instructor, /instructor/courses/* |
| **Admin** | /admin, /admin/users/*, /admin/courses/*, /admin/settings |

## Development Workflow

1. **Start Backend** (in another terminal)
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   npm run dev
   ```

3. **Login** at http://localhost:3001/login

4. **Make Changes**
   - Changes auto-reload with hot module replacement
   - Check browser console for errors

## Common Tasks

### Add a New Page
1. Create file: `app/newpage/page.tsx`
2. Use existing components
3. Add to sidebar navigation
4. Test all roles can access appropriately

### Create a New Component
1. Create file: `components/MyComponent.tsx`
2. Use existing UI components
3. Export from component barrel
4. Import where needed

### Update API Integration
1. Add endpoint in `backend/routes/`
2. Create API fetch in component
3. Add error handling
4. Test with different roles

### Debug Issues
1. Check browser DevTools (F12)
2. Review Network tab for API calls
3. Check server terminal for backend errors
4. Verify auth token in Application storage
5. Check `.env.local` configuration

## Browser DevTools Tips

- **Network Tab**: See API requests and responses
- **Console**: Watch for JavaScript errors
- **Application Tab**: View stored tokens and user data
- **Performance Tab**: Monitor page load times

## Useful Commands

```bash
# Build without starting server
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Clean build cache
npm run clean
```

## Performance Optimization

- **Images**: Use Next.js Image component
- **Bundles**: Dynamic imports for large components
- **Requests**: Combine multiple API calls where possible
- **Caching**: Use React Query for API data

## Deployment

### Vercel (Recommended)
```bash
# Connect your GitHub repo to Vercel
# Auto-deploys on push to main
```

### Self-Hosted
```bash
# Build production bundle
npm run build

# Start server
npm run start

# Or use PM2
pm2 start npm --name "protexxalearn" -- start
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -i :3001
kill -9 <PID>

# Or use different port
npm run dev -- -p 3002
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### API Connection Issues
1. Verify backend is running on port 3000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Review CORS settings in backend
4. Check browser console for specific error

## Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=

# Debug Mode
DEBUG=false
```

## Next Steps

1. ✅ Start frontend and backend
2. ✅ Login with test account
3. ✅ Explore student features
4. ✅ Switch to instructor view
5. ✅ Try admin panel
6. ✅ Make a test course
7. ✅ Test enrollment workflow
8. ✅ Check grading features

## Support

Need help?
- Check `FRONTEND_COMPREHENSIVE_GUIDE.md`
- Review component examples
- Check backend API documentation
- Review browser console for errors

---

Happy coding! 🚀
