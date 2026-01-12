# 🚀 RAILWAY DEPLOYMENT - IN PROGRESS

## ✅ Completed Steps
- ✅ Railway CLI installed
- ✅ Account verified and plan updated
- ✅ Project created: **protexxalearn**
- ✅ PostgreSQL database added
- ✅ Code uploaded to Railway
- ✅ JWT secret generated
- ✅ Dashboard opened: https://railway.com/project/d80e12d6-a675-4152-8e2a-e282c32e4712

## 📋 COMPLETE THESE STEPS IN RAILWAY DASHBOARD (OPEN NOW):

### Step 1: Create Application Service
1. In the dashboard, click **"+ New"** (top right)
2. Select **"Empty Service"** or **"GitHub Repo"** (if you want to connect GitHub)
3. Name it: **protexxalearn-app** (or any name you like)

### Step 2: Add Environment Variables
Click your new service → **"Variables"** tab → Add these:

```
NODE_ENV=production
JWT_SECRET=01dbc64d38cfa426f2f402ebbd040c0ce1b49a0dd84edcde5eea6c00ddf12ee1
EMAIL_SERVICE=ethereal
EMAIL_FROM_NAME=ProtexxaLearn Team
EMAIL_FROM=noreply@protexxalearn.com
CORS_ORIGINS=*
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Important:** The `DATABASE_URL=${{Postgres.DATABASE_URL}}` format tells Railway to automatically inject the PostgreSQL connection string.

### Step 3: Configure Build Settings
Click your service → **"Settings"** tab:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start` (for Next.js frontend + backend combined)

**OR** if you want separate services:

**For Backend Service:**
- **Start Command**: `node server.js`

**For Frontend Service:**
- **Start Command**: `npm start`

### Step 4: Deploy
- If you created an Empty Service, it will deploy automatically after adding variables
- If you connected GitHub, push your code and it auto-deploys
- Watch the logs in the **"Deployments"** tab

### Step 5: Initialize Database
After first successful deploy, run this command locally:

```powershell
railway run --service protexxalearn-app node initdb.js
```

Or in Railway dashboard → your service → **"Settings"** → temporarily change **Start Command** to:
```
node initdb.js && node server.js
```
Then change back to `node server.js` after one deploy.

### Step 6: Generate Public Domain
1. Click your service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. Copy your live URL: `https://protexxalearn-app-production.up.railway.app`

### Step 7: Update CORS (After Getting Domain)
1. Go back to **"Variables"** tab
2. Update `CORS_ORIGINS` from `*` to your actual domain:
   ```
   CORS_ORIGINS=https://your-actual-domain.up.railway.app
   ```

## 🎯 ALTERNATIVE: GitHub Integration (Recommended)

If you prefer GitHub auto-deploy:

1. **Create GitHub repo** (if not done):
   ```powershell
   # On GitHub, create new repo: ProtexxaLearn
   
   # Then push your code:
   git remote add origin https://github.com/YOUR_USERNAME/ProtexxaLearn.git
   git branch -M main
   git push -u origin main
   ```

2. **In Railway Dashboard**:
   - Click **"+ New"** → **"GitHub Repo"**
   - Select **ProtexxaLearn**
   - Railway auto-detects and deploys!

3. Add environment variables as shown above

4. Railway auto-redeploys on every git push

## 🔧 Useful Commands

```powershell
# View logs
railway logs

# Check status
railway status

# Run commands on Railway server
railway run node initdb.js

# Open dashboard
railway open

# Link to specific service
railway service

# Re-deploy
railway up --detach
```

## 📊 Your Project URLs

- **Dashboard**: https://railway.com/project/d80e12d6-a675-4152-8e2a-e282c32e4712
- **Database**: PostgreSQL (internal only, accessed via DATABASE_URL)
- **Application**: (will show after generating domain)

## 🆘 Troubleshooting

### Build fails
- Check logs in Dashboard → Deployments
- Verify `package.json` has correct scripts
- Ensure `npm install` works locally

### Database connection error
- Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}` in variables
- Run `railway run node initdb.js` to initialize schema

### "Site cannot be reached"
- Check if service is running (green status in dashboard)
- Verify domain was generated
- Check logs for startup errors

### CORS errors in browser
- Update `CORS_ORIGINS` with your actual frontend domain
- Format: `https://your-domain.railway.app` (no trailing slash)

## 🎉 After Deployment

Your LMS will be live at: `https://your-service-name.up.railway.app`

**Test it:**
1. Visit the URL
2. Register a new account
3. Check email in terminal (Ethereal preview URLs)
4. Create a course
5. Enroll students

**Switch to real email:**
```powershell
railway variables --set EMAIL_SERVICE=gmail
railway variables --set EMAIL_USER=your-email@gmail.com
railway variables --set EMAIL_PASSWORD=your-app-password
```

---

## 📍 YOU ARE HERE:
✅ Code uploaded
✅ JWT generated
✅ Variables ready
⏳ **Next: Configure service in dashboard (open now)**

The dashboard should be open. Complete Steps 1-6 above to go live!
