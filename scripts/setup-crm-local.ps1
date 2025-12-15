# ============================================
# ECONEURA - Setup CRM Local
# Comandos para configurar y probar CRM
# ============================================

Write-Host "`n=== 🚀 SETUP CRM LOCAL ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que estamos en el directorio correcto
Write-Host "1. Verificando directorio..." -ForegroundColor Yellow
$currentDir = Get-Location
Write-Host "   Directorio actual: $currentDir" -ForegroundColor White

if (-not (Test-Path "packages\backend")) {
    Write-Host "   ⚠️  No se encontró packages\backend" -ForegroundColor Red
    Write-Host "   Cambiando a directorio raíz..." -ForegroundColor Yellow
    Set-Location $PSScriptRoot\..
}

# 2. Verificar compilación TypeScript
Write-Host "`n2. Verificando compilación TypeScript..." -ForegroundColor Yellow
Set-Location packages\backend
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Errores de TypeScript encontrados" -ForegroundColor Red
} else {
    Write-Host "   ✅ TypeScript OK" -ForegroundColor Green
}

# 3. Compilar backend
Write-Host "`n3. Compilando backend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ⚠️  Errores de compilación" -ForegroundColor Red
} else {
    Write-Host "   ✅ Compilación exitosa" -ForegroundColor Green
}

# 4. Verificar migraciones SQL
Write-Host "`n4. Verificando migraciones SQL..." -ForegroundColor Yellow
$migration1 = "database\migrations\002_crm_premium.sql"
$migration2 = "database\migrations\003_crm_indexes.sql"

if (Test-Path $migration1) {
    Write-Host "   ✅ $migration1 encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  $migration1 NO encontrado" -ForegroundColor Red
}

if (Test-Path $migration2) {
    Write-Host "   ✅ $migration2 encontrado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  $migration2 NO encontrado" -ForegroundColor Red
}

# 5. Comandos para ejecutar migraciones
Write-Host "`n5. COMANDOS PARA EJECUTAR MIGRACIONES:" -ForegroundColor Cyan
Write-Host "   (Ejecuta estos comandos manualmente si tienes PostgreSQL configurado)" -ForegroundColor White
Write-Host ""
Write-Host "   # Conectar a PostgreSQL" -ForegroundColor Yellow
Write-Host "   psql -U postgres -d econeura_app" -ForegroundColor White
Write-Host ""
Write-Host "   # O ejecutar migraciones directamente:" -ForegroundColor Yellow
Write-Host "   psql -U postgres -d econeura_app -f database\migrations\002_crm_premium.sql" -ForegroundColor White
Write-Host "   psql -U postgres -d econeura_app -f database\migrations\003_crm_indexes.sql" -ForegroundColor White

# 6. Verificar variables de entorno
Write-Host "`n6. Verificando variables de entorno..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    Write-Host "   ✅ .env encontrado" -ForegroundColor Green
    
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   ✅ DATABASE_URL configurado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  DATABASE_URL NO configurado" -ForegroundColor Yellow
        Write-Host "   Agrega: DATABASE_URL=postgresql://postgres:password@localhost:5432/econeura_app" -ForegroundColor White
    }
    
    if ($envContent -match "CRM_WEBHOOK_SECRET") {
        Write-Host "   ✅ CRM_WEBHOOK_SECRET configurado" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CRM_WEBHOOK_SECRET NO configurado (opcional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  .env NO encontrado" -ForegroundColor Yellow
    Write-Host "   Crea un archivo .env con las variables necesarias" -ForegroundColor White
}

# 7. Comandos para iniciar servidor
Write-Host "`n7. COMANDOS PARA INICIAR SERVIDOR:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   (El servidor iniciará en http://localhost:3000)" -ForegroundColor Gray

# 8. Comandos para probar endpoints
Write-Host "`n8. COMANDOS PARA PROBAR ENDPOINTS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   # Health Check" -ForegroundColor Yellow
Write-Host "   Invoke-WebRequest -Uri http://localhost:3000/health" -ForegroundColor White
Write-Host ""
Write-Host "   # API CRM (requiere token de auth)" -ForegroundColor Yellow
Write-Host "   `$token = 'Bearer <tu-token>'" -ForegroundColor White
Write-Host "   Invoke-WebRequest -Uri 'http://localhost:3000/api/crm/leads?department=cmo&limit=10' -Headers @{Authorization=`$token}" -ForegroundColor White
Write-Host ""
Write-Host "   # Webhook (requiere HMAC signature)" -ForegroundColor Yellow
Write-Host "   `$body = @{email='test@example.com';nombre='Test';department='cmo';agent_name='Lead_Prospector'} | ConvertTo-Json" -ForegroundColor White
Write-Host "   Invoke-WebRequest -Uri http://localhost:3000/api/crm/webhooks/lead-created -Method POST -Body `$body -ContentType 'application/json'" -ForegroundColor White

Write-Host "`n=== ✅ SETUP COMPLETADO ===" -ForegroundColor Green
Write-Host ""

