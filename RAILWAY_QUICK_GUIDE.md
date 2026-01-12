# 🚀 RAILWAY SERVICE CREATION & DEPLOYMENT - QUICK GUIDE

## 📋 CHECKLIST

- [ ] **STEP 1**: Dashboard open → https://railway.app/project/d80e12d6-a675-4152-8e2a-e282c32e4712
- [ ] **STEP 2**: Created service named "protexxalearn-app"
- [ ] **STEP 3**: Added environment variables (copy-paste from below)
- [ ] **STEP 4**: Set Start Command: `node server.js`
- [ ] **STEP 5**: Ran `railway up --detach` in terminal
- [ ] **STEP 6**: Generated domain in Settings → Networking
- [ ] **STEP 7**: Updated CORS_ORIGINS with live domain

---

## 🎯 ENVIRONMENT VARIABLES (Copy Entire Block)

**In Railway Dashboard:**
1. Service → Variables tab
2. Click "Raw Editor"
3. Replace all with this:

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

Click **Save**

---

## ⚡ QUICK COMMANDS

```powershell
# Step 5: Deploy code
railway up --detach
# Then select: protexxalearn-app

# After deployment, initialize database
railway run node initdb.js

# View logs
railway logs

# Check status
railway status
```

---

## 📍 YOUR URLS

- **Local**: http://localhost:3001
- **Railway Dashboard**: https://railway.app/project/d80e12d6-a675-4152-8e2a-e282c32e4712
- **Railway Live** (after domain generation): `https://protexxalearn-app-production.up.railway.app`

---

## 🔧 CUSTOM DOMAIN (Optional)

**Have your own domain? (e.g., myschool.com)**

In Railway Settings → Custom Domain:
1. Enter your domain
2. Railway shows DNS instructions
3. Update your domain registrar's DNS
4. Takes 5-30 minutes to activate

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:
- [ ] Service shows "UP" (green) in dashboard
- [ ] Domain generates successfully
- [ ] Frontend accessible at domain
- [ ] Can register new user
- [ ] Can login
- [ ] Can create course
- [ ] Emails send (check Ethereal preview URLs)

---

## 🆘 TROUBLESHOOTING

**Service won't start:**
- Check logs: `railway logs`
- Verify DATABASE_URL variable exists
- Check Start Command is exactly: `node server.js`

**Domain won't generate:**
- Service must be running (green status)
- Click "Settings" → "Networking" section
- Look for "Generate Domain" button

**CORS errors:**
- Update CORS_ORIGINS with exact domain (no trailing slash)
- Format: `https://your-domain.up.railway.app`

**Deployment stuck:**
- Run: `railway logs` to see what's happening
- Common issue: large files (check .railwayignore)

---

## 📞 NEXT: Tell Me When...

1. Service created ✓
2. Code deployed ✓
3. Domain generated ✓

Then I'll help initialize the database and test the live site!
