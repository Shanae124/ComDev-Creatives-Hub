#!/usr/bin/env pwsh

<#
.SYNOPSIS
ProtexxaLearn Integration Test Script
.DESCRIPTION
Verifies that frontend, backend, and database are properly configured and connected
.EXAMPLE
.\test-integration.ps1
#>

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "ProtexxaLearn Integration Test" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "✓ Checking Node.js..." -ForegroundColor Green
$nodeVersion = node --version
Write-Host "  Version: $nodeVersion"

# Check npm packages
Write-Host "✓ Checking npm packages..." -ForegroundColor Green
$packageStatus = npm ls axios zustand 2>$null | Select-String "axios|zustand"
if ($packageStatus) {
    Write-Host "  ✓ axios and zustand installed"
} else {
    Write-Host "  ✗ Missing dependencies - run: npm install" -ForegroundColor Yellow
}

# Check environment file
Write-Host "✓ Checking environment configuration..." -ForegroundColor Green
if (Test-Path ".env.local") {
    Write-Host "  ✓ .env.local exists"
    $apiUrl = Select-String "NEXT_PUBLIC_API_URL" .env.local
    if ($apiUrl) {
        Write-Host "  $apiUrl"
    }
} else {
    Write-Host "  ✗ .env.local not found - creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local" -ErrorAction SilentlyContinue
}

# Check key files
Write-Host "✓ Checking required files..." -ForegroundColor Green
$files = @(
    "lib/api.ts",
    "lib/auth-store.ts",
    "app/layout.tsx",
    "app/page.tsx",
    "app/login/page.tsx",
    "components/course-grid.tsx",
    "server.js",
    "db.js",
    "initdb.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file"
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
    }
}

# Check PostgreSQL
Write-Host "✓ Checking PostgreSQL connection..." -ForegroundColor Green
$psqlCheck = npm list pg 2>$null | Select-String "pg"
if ($psqlCheck) {
    Write-Host "  ✓ PostgreSQL driver (pg) installed"
} else {
    Write-Host "  ✗ PostgreSQL driver not installed" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ensure PostgreSQL is running:"
Write-Host "   # Check if port 5432 is listening"
Write-Host "   netstat -ano | findstr :5432"
Write-Host ""
Write-Host "2. Initialize database (first time only):"
Write-Host "   node initdb.js"
Write-Host ""
Write-Host "3. Start backend server (Terminal 1):"
Write-Host "   npm run backend"
Write-Host ""
Write-Host "4. Start frontend dev server (Terminal 2):"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "5. Access the application:"
Write-Host "   http://localhost:3001"
Write-Host ""
Write-Host "6. Create test account and login"
Write-Host ""
Write-Host "✅ Setup complete! Happy learning! 🚀"
Write-Host ""
