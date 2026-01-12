# =====================================================
# RAILWAY ONE-CLICK DEPLOYMENT SCRIPT
# =====================================================
# This script automates deployment to Railway.app
# Run: .\railway-deploy.ps1

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   PROTEXXA LEARN - RAILWAY DEPLOYMENT WIZARD                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Command "node")) {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green

if (-not (Test-Command "npm")) {
    Write-Host "✗ npm not found." -ForegroundColor Red
    exit 1
}

Write-Host "✓ npm installed" -ForegroundColor Green

if (-not (Test-Command "git")) {
    Write-Host "✗ Git not found. Please install Git from https://git-scm.com" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Git installed" -ForegroundColor Green
Write-Host ""

# Step 2: Install Railway CLI
Write-Host "Step 2: Installing Railway CLI..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Command "railway")) {
    Write-Host "Installing Railway CLI via npm..." -ForegroundColor Cyan
    npm install -g @railway/cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install Railway CLI" -ForegroundColor Red
        Write-Host "Try manual install: npm install -g @railway/cli" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✓ Railway CLI ready" -ForegroundColor Green
Write-Host ""

# Step 3: Verify project build
Write-Host "Step 3: Verifying project build..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install --silent

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "Building Next.js frontend..." -ForegroundColor Cyan
npm run build 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed. Please fix errors and try again." -ForegroundColor Red
    Write-Host "Run 'npm run build' to see detailed errors" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Git check
Write-Host "Step 4: Checking Git repository..." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    git add .
    git commit -m "Initial commit - ProtexxaLearn LMS"
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✓ Git repository found" -ForegroundColor Green
    
    $uncommitted = git status --porcelain
    if ($uncommitted) {
        Write-Host "Committing latest changes..." -ForegroundColor Cyan
        git add .
        git commit -m "Pre-deployment commit - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
}
Write-Host ""

# Step 5: Railway login and project creation
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   RAILWAY DEPLOYMENT - ACTION REQUIRED                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 5: Railway login and project setup" -ForegroundColor Yellow
Write-Host ""

Write-Host "About to open Railway login in your browser..." -ForegroundColor Cyan
Write-Host "If you don't have an account, sign up at: https://railway.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press ANY KEY to continue to Railway login..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Railway login failed or was cancelled" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Logged into Railway" -ForegroundColor Green
Write-Host ""

# Initialize Railway project
Write-Host "Creating Railway project..." -ForegroundColor Cyan
Write-Host ""

railway init

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Railway project creation failed" -ForegroundColor Red
    Write-Host "You may need to create the project manually at https://railway.app" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Railway project created" -ForegroundColor Green
Write-Host ""

# Step 6: Add PostgreSQL
Write-Host "Step 6: Adding PostgreSQL database..." -ForegroundColor Yellow
Write-Host ""

Write-Host "About to add PostgreSQL to your project..." -ForegroundColor Cyan
Write-Host "This will create a managed database (included in Railway pricing)" -ForegroundColor Cyan
Write-Host ""

railway add postgresql

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Could not add PostgreSQL via CLI" -ForegroundColor Yellow
    Write-Host "Please add PostgreSQL manually:" -ForegroundColor Cyan
    Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor Cyan
    Write-Host "2. Select your project" -ForegroundColor Cyan
    Write-Host "3. Click '+ New' → 'Database' → 'PostgreSQL'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press ANY KEY after adding PostgreSQL..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "✓ PostgreSQL database added" -ForegroundColor Green
}
Write-Host ""

# Step 7: Set environment variables
Write-Host "Step 7: Setting environment variables..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Generating secure JWT secret..." -ForegroundColor Cyan
$jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Write-Host "Setting variables..." -ForegroundColor Cyan
railway variables --set NODE_ENV=production
railway variables --set JWT_SECRET=$jwtSecret
railway variables --set EMAIL_SERVICE=ethereal
railway variables --set EMAIL_FROM_NAME="ProtexxaLearn Team"
railway variables --set EMAIL_FROM=noreply@protexxalearn.com
railway variables --set CORS_ORIGINS=*

Write-Host "✓ Environment variables configured" -ForegroundColor Green
Write-Host ""
Write-Host "Note: DATABASE_URL is automatically set by Railway" -ForegroundColor Gray
Write-Host ""

# Step 8: Deploy
Write-Host "Step 8: Deploying to Railway..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Uploading and deploying your application..." -ForegroundColor Cyan
Write-Host "This may take 2-3 minutes..." -ForegroundColor Cyan
Write-Host ""

railway up

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Deployment failed" -ForegroundColor Red
    Write-Host "Check logs with: railway logs" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Deployment successful!" -ForegroundColor Green
Write-Host ""

# Step 9: Initialize database
Write-Host "Step 9: Initializing database schema..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Running database initialization script..." -ForegroundColor Cyan
railway run node initdb.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Database initialization may have failed" -ForegroundColor Yellow
    Write-Host "You can retry with: railway run node initdb.js" -ForegroundColor Cyan
} else {
    Write-Host "✓ Database schema created" -ForegroundColor Green
}
Write-Host ""

# Step 10: Get deployment URL
Write-Host "Step 10: Getting your live URL..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Opening Railway dashboard..." -ForegroundColor Cyan
railway open

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   DEPLOYMENT COMPLETE! 🎉                                   ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Your ProtexxaLearn LMS is now live on Railway!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. In the Railway dashboard that just opened:" -ForegroundColor White
Write-Host "   - Click your service → 'Settings' → 'Generate Domain'" -ForegroundColor Gray
Write-Host "   - Copy your URL (e.g., protexxalearn.railway.app)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update CORS for security:" -ForegroundColor White
Write-Host "   railway variables --set CORS_ORIGINS=https://your-url.railway.app" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set up real email (optional):" -ForegroundColor White
Write-Host "   railway variables --set EMAIL_SERVICE=gmail" -ForegroundColor Gray
Write-Host "   railway variables --set EMAIL_USER=your-email@gmail.com" -ForegroundColor Gray
Write-Host "   railway variables --set EMAIL_PASSWORD=your-app-password" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Useful commands:" -ForegroundColor White
Write-Host "   railway logs          # View live logs" -ForegroundColor Gray
Write-Host "   railway open          # Open dashboard" -ForegroundColor Gray
Write-Host "   railway run <cmd>     # Run commands on server" -ForegroundColor Gray
Write-Host "   railway status        # Check deployment status" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Push updates:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Update'" -ForegroundColor Gray
Write-Host "   railway up" -ForegroundColor Gray
Write-Host ""
Write-Host "Need help? Visit: https://docs.railway.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   📚 Your LMS is ready for students!                        ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""
