# 🚀 DEPLOY PROTEXXA LEARN NOW - QUICK START GUIDE

## ⚡ FASTEST: Railway (10 minutes, $5/month)

### Why Railway?
- ✅ Built-in PostgreSQL (auto-configured)
- ✅ Zero Docker config needed
- ✅ Auto-detects Node.js projects
- ✅ Free $5 credit, then ~$5/month
- ✅ Custom domains included
- ✅ Auto-HTTPS/SSL
- ✅ GitHub auto-deploy

### Steps:

1. **Sign up:** https://railway.app (use GitHub login)

2. **Create new project** → "Deploy from GitHub repo"

3. **Add PostgreSQL:**
   - Click "+ New" → Database → PostgreSQL
   - Railway auto-creates DB and connection URL

4. **Deploy Backend:**
   - Click "+ New" → GitHub Repo → Select ProtexxaLearn
   - **Settings → Environment Variables:**
     ```env
     NODE_ENV=production
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
     
     # Email (choose one)
     EMAIL_SERVICE=ethereal
     # OR for real emails:
     EMAIL_SERVICE=gmail
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     
     CORS_ORIGINS=*
     PORT=3000
     ```
   - **Settings → Build Command:** (leave empty)
   - **Settings → Start Command:** `node server.js`
   - **Settings → Generate Domain** (creates public URL)

5. **Initialize Database:**
   - Once deployed, go to **Settings → Variables** and copy `DATABASE_URL`
   - Run locally with Railway DB:
     ```powershell
     $env:DATABASE_URL="<paste-railway-db-url>"
     node initdb.js
     ```

6. **Deploy Frontend:**
   - Click "+ New" → GitHub Repo → Same repo
   - **Settings → Root Directory:** leave blank (Next.js detects automatically)
   - **Settings → Environment Variables:**
     ```env
     NEXT_PUBLIC_API_URL=<your-backend-railway-url>
     ```
   - **Settings → Generate Domain**
   - Railway auto-detects Next.js and runs `npm run build && npm start`

7. **Update CORS:**
   - Copy your frontend Railway URL
   - Add to backend env var: `CORS_ORIGINS=https://your-frontend.railway.app`
   - Redeploy backend

**Done! Your site is live at: `https://your-app.railway.app`**

---

## 🎯 OPTION 2: Render (15 minutes, Free tier available)

### Why Render?
- ✅ Free tier (75GB bandwidth/month)
- ✅ Built-in PostgreSQL
- ✅ Auto-deploy from GitHub
- ✅ Auto-HTTPS

### Steps:

1. **Sign up:** https://render.com (GitHub login)

2. **Create PostgreSQL Database:**
   - New → PostgreSQL
   - Name: `protexxalearn-db`
   - Plan: Free (expires after 90 days) or Starter ($7/month)
   - **Copy Internal Database URL**

3. **Deploy Backend:**
   - New → Web Service
   - Connect GitHub → Select repo
   - Settings:
     - **Name:** protexxalearn-backend
     - **Root Directory:** (blank)
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
     - **Environment Variables:** (add these)
       ```env
       NODE_ENV=production
       DATABASE_URL=<paste-internal-db-url>
       JWT_SECRET=<generate-random-32-chars>
       EMAIL_SERVICE=ethereal
       PORT=10000
       ```
   - **Create Web Service**
   - Wait for build (~3 min)
   - **Copy service URL:** `https://protexxalearn-backend.onrender.com`

4. **Initialize Database:**
   - In Render dashboard, go to your DB → "Connection" tab
   - Copy PSQL command
   - Run locally:
     ```powershell
     # Connect to Render DB
     psql <paste-connection-string>
     
     # Or initialize via local script:
     $env:DATABASE_URL="<render-db-url>"
     node initdb.js
     ```

5. **Deploy Frontend:**
   - New → Static Site
   - Connect GitHub → Same repo
   - Settings:
     - **Build Command:** `npm run build`
     - **Publish Directory:** `.next`
     - **Environment Variables:**
       ```env
       NEXT_PUBLIC_API_URL=https://protexxalearn-backend.onrender.com
       ```
   - **Create Static Site**

6. **Update Backend CORS:**
   - Add env var: `CORS_ORIGINS=https://your-site.onrender.com`
   - Trigger redeploy

**Done! Site live at: `https://protexxalearn.onrender.com`**

---

## 🔥 OPTION 3: Vercel (Frontend) + Railway (Backend) - BEST PERFORMANCE

### Why This Combo?
- ✅ Vercel = Fastest Next.js hosting (creators of Next.js)
- ✅ Railway = Easy backend + DB
- ✅ Both have generous free tiers
- ✅ Auto GitHub deployments

### Steps:

1. **Deploy Backend to Railway** (follow Option 1, steps 1-5)

2. **Deploy Frontend to Vercel:**
   - Sign up: https://vercel.com (GitHub login)
   - New Project → Import Git Repository → Select ProtexxaLearn
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** leave blank
   - **Environment Variables:**
     ```env
     NEXT_PUBLIC_API_URL=<your-railway-backend-url>
     ```
   - **Deploy**
   - Vercel gives you: `https://protexxalearn.vercel.app`

3. **Update Railway backend CORS:**
   - Add env var: `CORS_ORIGINS=https://protexxalearn.vercel.app`

**Done! Ultra-fast deployment with global CDN**

---

## 🛡️ OPTION 4: DigitalOcean App Platform (Traditional, $12/month)

### Why DigitalOcean?
- ✅ Managed PostgreSQL included
- ✅ Predictable pricing
- ✅ Great for teams
- ✅ Better control/customization

### Steps:

1. **Sign up:** https://cloud.digitalocean.com

2. **Create PostgreSQL Database:**
   - Create → Databases → PostgreSQL
   - Plan: Basic ($15/month)
   - **Copy connection details**

3. **Create App:**
   - Create → Apps → GitHub
   - Select ProtexxaLearn repo
   - **Add Resource: Web Service (Backend)**
     - HTTP Port: 3000
     - Build Command: `npm install`
     - Run Command: `node server.js`
     - Environment Variables: (add all from .env.example)
   - **Add Resource: Static Site (Frontend)**
     - Build Command: `npm run build`
     - Output Directory: `.next`
   - **Link Database** (auto-adds DATABASE_URL)

4. **Initialize DB:**
   ```powershell
   $env:DATABASE_URL="<do-db-url>"
   node initdb.js
   ```

**Done! Site live with custom domain support**

---

## 🏢 OPTION 5: AWS (Production Scale)

### Why AWS?
- ✅ Enterprise-grade
- ✅ Unlimited scaling
- ✅ Best for 10,000+ users
- ⚠️ More complex setup

**Quick Setup:**
1. **RDS PostgreSQL** (db.t3.micro = $15/month)
2. **Elastic Beanstalk** for backend (Node.js)
3. **S3 + CloudFront** for Next.js frontend
4. **SES** for email (cheapest)

Use AWS Copilot CLI for easy setup:
```bash
copilot init --app protexxalearn --name backend --type "Backend Service"
```

---

## 🚨 AVOID "SITE CANNOT BE REACHED" ERRORS

### Pre-Deployment Checklist:

✅ **Test Locally First:**
```powershell
# Terminal 1: Backend
npm run backend

# Terminal 2: Check health
curl http://localhost:3000/health

# Terminal 3: Frontend
npm run dev

# Visit: http://localhost:3001
```

✅ **Database Connection:**
- Test connection string works before deploying
- Run `node initdb.js` to verify schema

✅ **Environment Variables:**
- Copy ALL required vars from .env.example
- Generate secure JWT_SECRET
- Set correct CORS_ORIGINS

✅ **Port Configuration:**
- Backend: Use `process.env.PORT || 3000`
- Frontend: Use platform defaults (Vercel/Railway auto-detect)

✅ **Build Test:**
```powershell
npm run build
# Should complete without errors
```

### Post-Deployment Checks:

```powershell
# Test backend API
curl https://your-backend.railway.app/health
curl https://your-backend.railway.app/courses

# Test frontend loads
curl https://your-frontend.railway.app

# Check logs in platform dashboard
```

---

## 📊 COST COMPARISON

| Platform | Free Tier | Paid Plan | Best For |
|----------|-----------|-----------|----------|
| **Railway** | $5 credit | ~$5-20/month | Full-stack ease |
| **Render** | 750 hrs/month | $7/month | Budget-friendly |
| **Vercel + Railway** | Both free tier | $0-20/month | Best performance |
| **DigitalOcean** | $200 credit (60 days) | $12-30/month | Team projects |
| **AWS** | 12 months free | $15-50+/month | Enterprise scale |

---

## 🎯 RECOMMENDED PATH

**For immediate deployment (next 30 minutes):**
→ **Railway** (Option 1)

**For best performance:**
→ **Vercel + Railway** (Option 3)

**For long-term production:**
→ **DigitalOcean** (Option 4)

---

## 🆘 TROUBLESHOOTING

### "Cannot connect to database"
```powershell
# Test connection string locally
$env:DATABASE_URL="<your-production-db-url>"
node -e "require('./db').query('SELECT NOW()').then(console.log).catch(console.error)"
```

### "Email not sending"
- Start with `EMAIL_SERVICE=ethereal` (test mode)
- Check email provider logs
- Verify API keys/app passwords

### "CORS errors"
- Add frontend URL to `CORS_ORIGINS` env var
- Restart backend service
- Check browser console for exact error

### "Build failed"
```powershell
# Test build locally
npm run build

# Check for missing dependencies
npm install

# Clear cache
rm -r -fo .next
npm run build
```

### "Port already in use"
```powershell
# Kill conflicting process
taskkill /IM node.exe /F
netstat -ano | findstr "3000"
```

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. **Custom Domain:** Add in platform settings (most support this free)
2. **SSL Certificate:** Auto-enabled on all platforms
3. **Email Setup:** Switch from Ethereal to production service
4. **Monitoring:** Enable platform logging/alerts
5. **Backup Database:** Set up automated backups (all platforms offer this)
6. **CI/CD:** Already enabled via GitHub integration
7. **Environment Secrets:** Use platform secret managers (not .env files)

---

## 🔗 HELPFUL LINKS

- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- DigitalOcean Docs: https://docs.digitalocean.com/products/app-platform
- PostgreSQL Connection Strings: https://www.postgresql.org/docs/current/libpq-connect.html

---

**Ready to deploy? Start with Railway Option 1 - it's the fastest path to a live site.**
