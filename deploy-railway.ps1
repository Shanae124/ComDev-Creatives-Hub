# Railway Deployment Script
$ErrorActionPreference = "Stop"

Write-Host "🚀 ProtexxaLearn Railway Deployment" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# 1. Initialize database
Write-Host "1️⃣ Initializing database schema..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:zDgEvcYUlLTuYaHIeOnUVrpcBuRuVXdW@switchyard.proxy.rlwy.net:45083/railway"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

try {
    node initdb.js
    Write-Host "✅ Database schema initialized`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Database init failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Create test users
Write-Host "2️⃣ Creating test users..." -ForegroundColor Yellow
try {
    node createTestUsers.js
    Write-Host "✅ Test users created`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Test users creation issue (may already exist): $_" -ForegroundColor Yellow
}

# 3. Deploy to Railway
Write-Host "3️⃣ Deploying to Railway..." -ForegroundColor Yellow
Write-Host "Setting DATABASE_URL on web service..." -ForegroundColor Cyan

# Note: Railway CLI interactive mode - user must complete this manually
Write-Host "`n⚠️ IMPORTANT: Complete these steps in Railway Dashboard:`n" -ForegroundColor Yellow
Write-Host "1. Go to: https://railway.app/project/d80e12d6-a675-4152-8e2a-e282c32e4712" -ForegroundColor White
Write-Host "2. Click Postgres service → Variables tab" -ForegroundColor White
Write-Host "3. Copy DATABASE_URL value" -ForegroundColor White
Write-Host "4. Click protexxalearn (web) service → Variables tab" -ForegroundColor White
Write-Host "5. Add new variable: DATABASE_URL = <paste value>" -ForegroundColor White
Write-Host "6. Click Save (auto-redeploy will start)" -ForegroundColor White
Write-Host "`nThen test at: https://protexxalearn.up.railway.app/login" -ForegroundColor Green
Write-Host "Credentials: admin@test.com / Password123`n" -ForegroundColor Green
