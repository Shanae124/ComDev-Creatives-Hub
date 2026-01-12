# 🚀 DEPLOY PROTEXXA LEARN - FINAL STEPS

## ✅ What's Done
- Railway CLI installed ✓
- Logged in as tiffanyforde98@gmail.com ✓
- Project "protexxalearn" created ✓
- PostgreSQL database added ✓
- Project URL: https://railway.com/project/d80e12d6-a675-4152-8e2a-e282c32e4712

## 🎯 OPTION 1: Deploy via Railway Dashboard (RECOMMENDED - 5 minutes)

This avoids the large file upload issue and gives you better control.

### Steps:

1. **Go to your project**: https://railway.com/project/d80e12d6-a675-4152-8e2a-e282c32e4712

2. **Click "+ New"** → **"GitHub Repo"**
   - If not connected, click "Configure GitHub App"
   - Authorize Railway to access repositories
   - Select your ProtexxaLearn repository (or create one first - see below)

3. **Configure the service** (Railway auto-detects):
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start` (for Next.js frontend)
   
4. **Add environment variables** (click your service → Variables tab):
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=<generate below>
   EMAIL_SERVICE=ethereal
   EMAIL_FROM_NAME=ProtexxaLearn Team
   EMAIL_FROM=noreply@protexxalearn.com
   CORS_ORIGINS=*
   PORT=3000
   ```
   
   **Generate JWT_SECRET locally:**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste as JWT_SECRET value.

5. **Create Backend Service**:
   - Click "+ New" → "Empty Service"
   - Name it "backend"
   - Connect same GitHub repo
   - **Root Directory**: (leave blank)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - Add same environment variables

6. **Initialize Database**:
   - Click backend service → Settings
   - Under "Deploy" section, click "Custom Start Command"
   - Temporarily change to: `node initdb.js && node server.js`
   - Wait for deploy
   - Change back to: `node server.js`

7. **Generate Public Domain**:
   - Click your frontend service → Settings
   - Scroll to "Networking" → Click "Generate Domain"
   - Copy your URL (e.g., `protexxalearn-production.up.railway.app`)

8. **Update CORS**:
   - Go to backend variables
   - Update `CORS_ORIGINS` to your frontend URL
   - Backend will auto-redeploy

**DONE! Your site is live! 🎉**

---

## 🐙 Create GitHub Repository First (if you don't have one)

```powershell
# 1. Create repo on GitHub
#    Go to: https://github.com/new
#    Name: ProtexxaLearn
#    Keep it private or public (your choice)
#    DON'T initialize with README (you already have files)

# 2. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/ProtexxaLearn.git
git branch -M main
git push -u origin main

# 3. Return to Railway dashboard and connect the repo
```

---

## 🎯 OPTION 2: Deploy via CLI (ADVANCED - for small projects)

The CLI upload failed because your project with node_modules is too large (1.7GB). You have two solutions:

### Solution A: Create .railwayignore
```powershell
# Create .railwayignore file
@"
node_modules/
.next/
frontend/
.git/
uploads/
imscc_inspect/
"@ | Out-File -Encoding utf8 .railwayignore

# Try deploy again
railway up --detach
```

### Solution B: Use .gitignore properly
Check that `.gitignore` includes:
```
node_modules/
.next/
.env
.env.local
uploads/
imscc_inspect/
```

Then commit and use GitHub integration (Option 1).

---

## 📊 Current Project Status

**Railway Project**: protexxalearn
**URL**: https://railway.com/project/d80e12d6-a675-4152-8e2a-e282c32e4712
**Services**:
- ✅ PostgreSQL (ready)
- ⏳ Frontend (needs deployment)
- ⏳ Backend (needs deployment)

**Next Action**: Choose Option 1 (GitHub) or Option 2 (CLI with .railwayignore)

---

## 🆘 Troubleshooting

### "File too large" error
- Use Option 1 (GitHub integration)
- Or create .railwayignore and exclude node_modules

### "No GitHub repository" error
1. Create repo on GitHub: https://github.com/new
2. Push your code:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/ProtexxaLearn.git
   git push -u origin main
   ```
3. Connect in Railway dashboard

### Backend not starting
- Check logs in Railway dashboard
- Verify DATABASE_URL variable exists
- Run `railway run node initdb.js` to initialize DB

### CORS errors
- Update CORS_ORIGINS in backend variables to match your frontend URL
- Format: `https://your-frontend.railway.app`

---

## 🎉 After Deployment

Once live, you can:
- View logs: `railway logs`
- Run commands: `railway run <command>`
- Open dashboard: `railway open`
- Check status: `railway status`

**Your LMS will be at:**
- Frontend: `https://<service-name>.up.railway.app`
- Backend: `https://<backend-name>.up.railway.app`

---

**Recommended: Use Option 1 (GitHub Dashboard) - it's the most reliable!**
