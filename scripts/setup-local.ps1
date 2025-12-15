# setup-local.ps1
# Automates the setup of the local development environment for ECONEURA

Write-Host "🚀 Starting ECONEURA Local Setup..." -ForegroundColor Cyan

# 1. Check Docker
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH. Please install Docker Desktop."
    exit 1
}

# 2. Install Dependencies
Write-Host "📥 Installing Dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies."
    exit 1
}

# 3. Start Infrastructure
Write-Host "🏗️ Starting Infrastructure (Postgres + Redis)..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Docker Compose failed. Please check if Docker Desktop is running."
    Write-Warning "Trying to proceed... (Backend might fail if DB is not ready)"
}
else {
    Write-Host "✅ Infrastructure is running." -ForegroundColor Green
}

# 4. Wait for DB
Write-Host "⏳ Waiting for Database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 5. Run Migrations
Write-Host "🔄 Running Database Migrations..." -ForegroundColor Yellow
npx turbo run db:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Database migration failed. Check if Postgres is running on port 5432."
}

# 6. Seed Database (Optional but recommended)
Write-Host "🌱 Seeding Database..." -ForegroundColor Yellow
# We will create this script next
if (Test-Path "packages/backend/scripts/seed-local.ts") {
    npx tsx packages/backend/scripts/seed-local.ts
}
else {
    Write-Host "Seed script not found, skipping." -ForegroundColor Gray
}

Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "👉 Run 'npm run dev' to start the application." -ForegroundColor Cyan
