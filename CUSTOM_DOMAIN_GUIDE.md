# 🚀 Custom Domain Setup for Railway

## Option 1: Using Namecheap (Recommended - $8.88/year)

### Step 1: Purchase Domain on Namecheap
1. Go to [namecheap.com](https://www.namecheap.com)
2. Search for your domain (e.g., `myprotexxa.com`)
3. Add to cart and purchase (~$8.88/year for .com)
4. Note: Take the cheapest option with auto-renew OFF first

### Step 2: Connect Domain to Railway
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your **ProtexxaLearn** project
3. Click on **Settings** → **Domain**
4. Enter your custom domain (e.g., `myprotexxa.com`)
5. Railway will show you **nameservers** to add

### Step 3: Update Nameservers on Namecheap
1. Log into [namecheap.com](https://www.namecheap.com)
2. Go to **Domain List** → Select your domain → **Manage**
3. Find **Nameservers** section
4. Change from "Namecheap BasicDNS" to "Custom DNS"
5. Add Railway's nameservers:
   - `ns1.railway.app`
   - `ns2.railway.app`
   - `ns3.railway.app`
6. Click **Save**
7. **Wait 24-48 hours** for DNS propagation

### Step 4: Verify & Update Environment Variables
1. In Railway Dashboard, check domain status (should show green ✅)
2. Update your `CORS_ORIGINS` environment variable:
   ```
   CORS_ORIGINS=https://myprotexxa.com,http://localhost:3001
   ```
3. Redeploy service (Railway auto-detects changes)

---

## Option 2: Free Subdomain on Railway (Instant)

You already have this! Your current domain is:
```
https://protexxalearn-app-production.up.railway.app
```

This works immediately and is **perfectly valid** for demo/testing.

---

## Option 3: Using Vercel for Frontend Only

If you want your custom domain to just point to the frontend:

1. Deploy frontend to Vercel (free)
2. Connect custom domain in Vercel settings
3. Update API calls to use Railway's backend URL
4. Update CORS_ORIGINS to include Vercel domain

---

## DNS Troubleshooting

### Domain not resolving after 24 hours?
1. Check nameserver propagation:
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter your domain and check if nameservers resolved globally
   
2. Force clear DNS cache (Windows):
   ```powershell
   ipconfig /flushdns
   ```

3. Test domain connectivity:
   ```powershell
   nslookup myprotexxa.com
   ping myprotexxa.com
   ```

---

## Testing Your Domain

Once DNS propagates:

```bash
# Test frontend accessibility
curl https://myprotexxa.com

# Test backend API
curl https://myprotexxa.com/api/health

# Test courses endpoint (as logged-in user)
curl -H "Authorization: Bearer YOUR_TOKEN" https://myprotexxa.com/api/courses
```

---

## Cost Breakdown

| Option | Cost | Setup Time | HTTPS | Benefits |
|--------|------|-----------|-------|----------|
| Railway Free Domain | $0 | Instant | ✅ Yes | Immediate, no DNS needed |
| Namecheap Domain | $8.88/year | 24-48h | ✅ Yes | Professional brand, memorable |
| Freenom (.tk/.ml) | $0 | 24-48h | ✅ Yes | Completely free but less professional |

**Recommendation for Demo:** Use Railway's free subdomain now, then purchase Namecheap domain later when going into production.

---

## Update Production Environment Variables

Once your domain works, update Railway:

```bash
# From terminal with Railway CLI
railway env DATABASE_URL <keep-existing>
railway env CORS_ORIGINS "https://myprotexxa.com,http://localhost:3001"
railway env NODE_ENV production
railway env JWT_SECRET <keep-existing>
```

Then redeploy:
```bash
railway up --detach
```

---

## For Multi-Domain Support (Prod + Dev)

If you want both localhost and production to work:

```
CORS_ORIGINS=https://myprotexxa.com,https://www.myprotexxa.com,http://localhost:3001,http://localhost:3000
```

This allows:
- ✅ Local development on `localhost:3001` (frontend) + `localhost:3000` (backend)
- ✅ Production at `myprotexxa.com`
- ✅ WWW subdomain `www.myprotexxa.com`
