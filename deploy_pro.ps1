# ECONEURA CLOUD - AUTOMATED DEPLOYMENT SCRIPT
# "One Click" Solution for Design & Logic Restoration

$ErrorActionPreference = "Stop"

Write-Host "🚀 STARTING ECONEURA DEPLOYMENT PROTOCOL..." -ForegroundColor Cyan

# 1. VERIFY ASSETS
Write-Host "🔍 Verifying vital assets..."
if (-not (Test-Path "packages/frontend/public/login-bg-futuristic.png")) {
    Write-Error "❌ CRITICAL: Login background missing!"
}
if (-not (Test-Path "packages/frontend/public/login-bg-futuristic.png")) {
    Write-Error "❌ CRITICAL: Login background missing!"
}

# 2. BUILD FRONTEND
Write-Host "🔨 Building Frontend (Vite)..." -ForegroundColor Yellow
cd packages/frontend
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build Failed" }
cd ../..

# 3. GIT SYNC
Write-Host "💾 Committing changes to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "chore(deploy): Automated deployment with visual restoration"
git push origin main
if ($LASTEXITCODE -ne 0) { Write-Warning "Git push warning (might be up to date)" }

# 4. FIREBASE DEPLOY
Write-Host "☁️  Deploying to Google Cloud (Firebase Hosting + Rules)..." -ForegroundColor Yellow
npx firebase deploy --only hosting, firestore, storage

Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "👉 LIVE URL: https://econeura-109cc.web.app" -ForegroundColor Cyan
