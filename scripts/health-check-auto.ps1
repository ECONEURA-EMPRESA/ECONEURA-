# Mejora 2: Health Check Automático Pre-Deploy
# Verifica que todo esté funcionando antes de desplegar
# Uso: .\scripts\health-check-auto.ps1

Write-Host "`n=== 🏥 ECONEURA - HEALTH CHECK AUTOMÁTICO ===" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# 1. Verificar que el backend está corriendo
Write-Host "`n1️⃣ Verificando backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $health = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ Backend respondiendo" -ForegroundColor Green
        Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Backend respondió con código $($response.StatusCode)" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ❌ Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

# 2. Verificar endpoints críticos
Write-Host "`n2️⃣ Verificando endpoints críticos..." -ForegroundColor Yellow
$endpoints = @(
    @{ Path = "/api/health"; Name = "Health Check" },
    @{ Path = "/api/invoke/a-ceo-01"; Name = "Invoke API"; Method = "POST"; Body = '{"input":"test"}' }
)

foreach ($ep in $endpoints) {
    try {
        $params = @{
            Uri = "http://localhost:3000$($ep.Path)"
            Method = $ep.Method ?? "GET"
            TimeoutSec = 3
            ErrorAction = "Stop"
        }
        if ($ep.Body) {
            $params.Body = $ep.Body
            $params.ContentType = "application/json"
        }
        $response = Invoke-WebRequest @params
        Write-Host "   ✅ $($ep.Name): OK" -ForegroundColor Green
    } catch {
        if ($ep.Name -eq "Invoke API") {
            # Invoke puede requerir auth, solo verificamos que no sea 404
            if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
                Write-Host "   ⚠️  $($ep.Name): Requiere autenticación (esperado)" -ForegroundColor Yellow
                $warnings++
            } else {
                Write-Host "   ❌ $($ep.Name): Error" -ForegroundColor Red
                $errors++
            }
        } else {
            Write-Host "   ❌ $($ep.Name): Error" -ForegroundColor Red
            $errors++
        }
    }
}

# 3. Verificar TypeScript
Write-Host "`n3️⃣ Verificando TypeScript..." -ForegroundColor Yellow
Set-Location packages\backend
try {
    $result = npm run type-check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Backend TypeScript: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Backend TypeScript: Errores encontrados" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar TypeScript" -ForegroundColor Yellow
    $warnings++
}
Set-Location ..\frontend
try {
    $result = npm run type-check 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Frontend TypeScript: OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend TypeScript: Errores encontrados" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar TypeScript" -ForegroundColor Yellow
    $warnings++
}
Set-Location ..\..

# 4. Verificar variables de entorno críticas
Write-Host "`n4️⃣ Verificando configuración..." -ForegroundColor Yellow
if (Test-Path "packages\backend\.env") {
    $envContent = Get-Content "packages\backend\.env"
    $required = @("OPENAI_API_KEY", "PAYLOAD_LIMIT", "CORS_ALLOWED_ORIGINS")
    foreach ($var in $required) {
        if ($envContent -match $var) {
            Write-Host "   ✅ $var configurado" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $var no encontrado" -ForegroundColor Yellow
            $warnings++
        }
    }
} else {
    Write-Host "   ⚠️  .env no encontrado" -ForegroundColor Yellow
    $warnings++
}

# Resumen
Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "   Errores: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host "   Advertencias: $warnings" -ForegroundColor $(if ($warnings -eq 0) { "Green" } else { "Yellow" })

if ($errors -eq 0) {
    Write-Host "`n✅ Health check completado - Sistema listo" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Health check falló - Revisa los errores" -ForegroundColor Red
    exit 1
}


