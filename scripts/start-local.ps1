# Script para arrancar ECONEURA localmente
# Uso: .\scripts\start-local.ps1

Write-Host "`n=== 🚀 ECONEURA - ARRANQUE LOCAL ===" -ForegroundColor Cyan
Write-Host "`n📋 Verificando dependencias..." -ForegroundColor Yellow

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Ejecuta este script desde la raíz del proyecto" -ForegroundColor Red
    exit 1
}

# Verificar que node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "packages\backend\node_modules")) {
    Write-Host "⚠️  Dependencias de backend no encontradas. Instalando..." -ForegroundColor Yellow
    cd packages\backend
    npm install
    cd ..\..
}

if (-not (Test-Path "packages\frontend\node_modules")) {
    Write-Host "⚠️  Dependencias de frontend no encontradas. Instalando..." -ForegroundColor Yellow
    cd packages\frontend
    npm install
    cd ..\..
}

Write-Host "`n✅ Dependencias verificadas" -ForegroundColor Green

Write-Host "`n📋 INSTRUCCIONES:" -ForegroundColor Cyan
Write-Host "`n1. Abre DOS terminales nuevas" -ForegroundColor White
Write-Host "`n2. Terminal 1 - BACKEND:" -ForegroundColor Blue
Write-Host "   cd C:\Users\Usuario\ECONEURA-FULL" -ForegroundColor Gray
Write-Host "   npm run dev:backend" -ForegroundColor White
Write-Host "`n3. Terminal 2 - FRONTEND:" -ForegroundColor Green
Write-Host "   cd C:\Users\Usuario\ECONEURA-FULL" -ForegroundColor Gray
Write-Host "   npm run dev:frontend" -ForegroundColor White
Write-Host "`n4. Abre en el navegador:" -ForegroundColor Yellow
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host "`n5. Verifica health check:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000/api/health" -ForegroundColor White
Write-Host "`n⚠️  NOTA: Asegúrate de tener PostgreSQL y Redis corriendo si los usas" -ForegroundColor Yellow
Write-Host "`n✅ Listo para arrancar!" -ForegroundColor Green


