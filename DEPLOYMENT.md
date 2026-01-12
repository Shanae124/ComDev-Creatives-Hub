# ================================
# PROTEXXA LEARN - PRODUCTION DEPLOYMENT GUIDE
# ================================

## 🚀 10-MINUTE DEPLOYMENT CHECKLIST

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ running
- Domain name (optional but recommended)
- Email service account (Gmail/SendGrid/AWS SES)

---

## STEP 1: Environment Configuration (2 minutes)

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your production values:

**REQUIRED SETTINGS:**
```env
# Database (use your production credentials)
DB_HOST=your-db-host.com
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=Protexxalearn

# JWT Secret (generate random 32+ character string)
JWT_SECRET=use-command-node--e-console.log-require-crypto-randomBytes-32-toString-hex

# Email Service - CHOOSE ONE:

## Option A: Gmail (Easiest)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
# Get app password: https://myaccount.google.com/apppasswords

## Option B: SendGrid (Recommended for production)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=noreply@yourdomain.com

## Option C: AWS SES (Enterprise)
EMAIL_SERVICE=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
EMAIL_FROM=noreply@yourdomain.com

# Base URL (your frontend URL)
BASE_URL=https://yourdomain.com

# Security
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

**Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## STEP 2: Database Setup (2 minutes)

1. Create PostgreSQL database:
```sql
CREATE DATABASE Protexxalearn;
```

2. Initialize schema:
```bash
node initdb.js
```

3. Verify connection:
```bash
node -e "require('./db').query('SELECT NOW()').then(r => console.log('✓ DB Connected:', r.rows[0]))"
```

---

## STEP 3: Install Dependencies (2 minutes)

```bash
npm install
npm install pm2 -g
```

---

## STEP 4: Frontend Build (2 minutes)

```bash
# Build Next.js frontend for production
npm run build

# Or if using separate command:
npx next build
```

Update `next.config.mjs` with production API URL:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://your-api-domain.com/:path*' // or keep localhost if same server
    }
  ]
}
```

---

## STEP 5: Start Production Server (1 minute)

### Option A: PM2 (Recommended - Auto-restart, Clustering)
```bash
# Start backend with PM2
pm2 start ecosystem.config.json

# Start frontend
pm2 start npm --name "protexxalearn-frontend" -- run start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Option B: Manual Start
```bash
# Backend
NODE_ENV=production node server.js

# Frontend (separate terminal)
npm run start
```

---

## STEP 6: Verify Deployment (1 minute)

1. **Health Check:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "connected" },
    "email": { "service": "gmail", "configured": true }
  }
}
```

2. **Test Registration:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test1234!"}'
```

3. **Check Email:**
- Gmail: Check your inbox for verification email
- Ethereal: Check console for preview URL

4. **Access Frontend:**
```
http://localhost:3001
```

---

## 🔐 PRODUCTION SECURITY CHECKLIST

- [ ] `.env` file is NOT committed to git
- [ ] JWT_SECRET is random and secure (32+ characters)
- [ ] Database password is strong
- [ ] CORS_ORIGINS is set to your actual domain
- [ ] NODE_ENV=production is set
- [ ] Email service is configured (not using ethereal)
- [ ] SSL/HTTPS is enabled (use nginx reverse proxy)
- [ ] Firewall allows only ports 80/443
- [ ] Database is not publicly accessible
- [ ] Regular backups are configured

---

## 📊 Monitoring & Logs

### PM2 Commands:
```bash
pm2 status              # Show all processes
pm2 logs               # View logs
pm2 monit              # Real-time monitoring
pm2 restart all        # Restart all services
pm2 stop all           # Stop all services
pm2 delete all         # Remove all processes
```

### Log Files:
- Backend: `./logs/pm2-error.log`, `./logs/pm2-out.log`
- Request logs: Console output with timestamps

---

## 🌐 NGINX Reverse Proxy (Optional but Recommended)

Create `/etc/nginx/sites-available/protexxalearn`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # File uploads
    client_max_body_size 50M;
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/protexxalearn /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Install SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🔄 Updates & Maintenance

### Update Application:
```bash
git pull
npm install
npm run build
pm2 restart all
```

### Database Backup:
```bash
pg_dump -U postgres -d Protexxalearn > backup_$(date +%Y%m%d).sql
```

### Restore Backup:
```bash
psql -U postgres -d Protexxalearn < backup_20250112.sql
```

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check logs
pm2 logs protexxalearn-backend

# Common issues:
# 1. Database connection - verify DB_HOST, DB_USER, DB_PASSWORD in .env
# 2. Port already in use - kill existing process: taskkill /IM node.exe /F
# 3. Missing dependencies - run: npm install
```

### Email not sending:
```bash
# Test email configuration
node -e "require('./emailService').verifyEmailConfig().then(console.log)"

# Gmail: Ensure "Less secure app access" is enabled or use App Password
# SendGrid: Verify API key is active and has send permissions
```

### Frontend can't reach API:
```bash
# Check CORS settings in .env
CORS_ORIGINS=https://yourdomain.com

# Verify proxy in next.config.mjs
# Check browser console for CORS errors
```

### Database connection errors:
```bash
# Test connection
psql -h localhost -U postgres -d Protexxalearn

# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify .env credentials match PostgreSQL user
```

---

## 📞 Support

- Documentation: `/docs` folder
- Logs: `./logs/` directory
- Health Check: `http://your-domain.com/api/health`

---

## ✅ POST-DEPLOYMENT VERIFICATION

Run these tests after deployment:

```bash
# 1. Health check
curl https://yourdomain.com/api/health

# 2. Register user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@yourdomain.com","password":"Admin123!","role":"admin"}'

# 3. Check email arrival
# 4. Verify email and login
# 5. Create a test course
# 6. Upload a file
# 7. Enroll a student
```

---

## 🎉 DEPLOYMENT COMPLETE!

Your ProtexxaLearn LMS is now live and ready for production use!

**Default Admin Account:**
After deployment, register your first user with role="admin" to access admin features.

**Next Steps:**
1. Register your admin account
2. Create your first course
3. Invite instructors and students
4. Configure additional settings in the dashboard

**Production URLs:**
- Frontend: https://yourdomain.com
- API: https://yourdomain.com/api
- Health Check: https://yourdomain.com/api/health

---

*Deployed with ❤️ by Protexxa*
