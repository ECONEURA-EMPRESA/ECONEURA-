# Script AUTOMATIZADO para arrancar ECONEURA localmente
# Mejora 1: Arranque inteligente con limpieza automática de puertos
# Uso: .\scripts\start-local-auto.ps1

Write-Host "`n=== 🚀 ECONEURA - ARRANQUE AUTOMATIZADO ===" -ForegroundColor Cyan

# Función para matar procesos en un puerto
function Kill-Port {
    param([int]$Port)
    $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "✅ Proceso $pid en puerto $Port terminado" -ForegroundColor Green
            }
            catch {
                Write-Host "⚠️  No se pudo terminar proceso $pid" -ForegroundColor Yellow
            }
        }
    }
}

# Verificar directorio
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Limpiar puertos ocupados
Write-Host "`n🧹 Limpiando puertos..." -ForegroundColor Yellow
Kill-Port -Port 3000
Kill-Port -Port 5173
Start-Sleep -Seconds 2

# Verificar dependencias
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow
$missing = @()

if (-not (Test-Path "packages\backend\node_modules")) {
    $missing += "backend"
}
if (-not (Test-Path "packages\frontend\node_modules")) {
    $missing += "frontend"
}

if ($missing.Count -gt 0) {
    Write-Host "⚠️  Instalando dependencias faltantes..." -ForegroundColor Yellow
    foreach ($pkg in $missing) {
        Write-Host "   Instalando $pkg..." -ForegroundColor Gray
        Set-Location "packages\$pkg"
        npm install --silent
        Set-Location ..\..
    }
}

# Verificar .env
Write-Host "`n🔐 Verificando configuración..." -ForegroundColor Yellow
if (-not (Test-Path "packages\backend\.env")) {
    Write-Host "⚠️  packages/backend/.env no encontrado" -ForegroundColor Yellow
    Write-Host "   Creando .env básico..." -ForegroundColor Gray
    @"
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=[REDACTED]
PAYLOAD_LIMIT=8mb
MAX_UPLOAD_SIZE=25mb
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
"@ | Out-File -FilePath "packages\backend\.env" -Encoding utf8
    Write-Host "✅ .env creado" -ForegroundColor Green
}

# Verificar health check antes de arrancar
Write-Host "`n🏥 Verificando health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "⚠️  Backend ya está corriendo en puerto 3000" -ForegroundColor Yellow
        Write-Host "   Matando proceso..." -ForegroundColor Gray
        Kill-Port -Port 3000
        Start-Sleep -Seconds 2
    }
}
catch {
    # Backend no está corriendo, perfecto
}

Write-Host "`n✅ Todo listo para arrancar" -ForegroundColor Green
Write-Host "`n📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "`n1. Terminal 1 - BACKEND:" -ForegroundColor Blue
Write-Host "   cd packages\backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`n2. Terminal 2 - FRONTEND:" -ForegroundColor Green
Write-Host "   cd packages\frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "`n3. Abre: http://localhost:5173" -ForegroundColor Yellow
Write-Host "`n✅ Script completado!" -ForegroundColor Green


