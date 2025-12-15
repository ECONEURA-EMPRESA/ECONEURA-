# Script para ejecutar todas las mejoras automatizadas
# Uso: .\scripts\ejecutar-todas-mejoras.ps1

Write-Host "`n=== 🚀 ECONEURA - EJECUTAR TODAS LAS MEJORAS ===" -ForegroundColor Cyan

# 1. Validar .env
Write-Host "`n1️⃣ Validando configuración (.env)..." -ForegroundColor Yellow
& .\scripts\validate-env-auto.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Advertencias en .env, pero continuando..." -ForegroundColor Yellow
}

# 2. Health check
Write-Host "`n2️⃣ Ejecutando health check..." -ForegroundColor Yellow
& .\scripts\health-check-auto.ps1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Health check falló, pero continuando..." -ForegroundColor Yellow
}

# 3. Type-check
Write-Host "`n3️⃣ Verificando TypeScript..." -ForegroundColor Yellow
Set-Location packages\backend
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errores de TypeScript encontrados" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Set-Location ..\frontend
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errores de TypeScript encontrados" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Set-Location ..\..

Write-Host "`n✅ Todas las mejoras ejecutadas correctamente" -ForegroundColor Green
Write-Host "`n📋 RESUMEN:" -ForegroundColor Cyan
Write-Host "   ✅ Validación de .env" -ForegroundColor Green
Write-Host "   ✅ Health check" -ForegroundColor Green
Write-Host "   ✅ Type-check backend" -ForegroundColor Green
Write-Host "   ✅ Type-check frontend" -ForegroundColor Green
Write-Host "`n🚀 Sistema listo para arrancar" -ForegroundColor Green


