# Mejora 3: Validación Automática de .env
# Verifica que todas las variables necesarias estén configuradas
# Uso: .\scripts\validate-env-auto.ps1

Write-Host "`n=== 🔐 ECONEURA - VALIDACIÓN DE .ENV ===" -ForegroundColor Cyan

$envFile = "packages\backend\.env"
$errors = 0
$warnings = 0

if (-not (Test-Path $envFile)) {
    Write-Host "❌ Archivo .env no encontrado en $envFile" -ForegroundColor Red
    Write-Host "`nCreando .env básico..." -ForegroundColor Yellow
    
    $basicEnv = @"
NODE_ENV=development
PORT=3000
OPENAI_API_KEY=[REDACTED]
PAYLOAD_LIMIT=8mb
MAX_UPLOAD_SIZE=25mb
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
"@
    $basicEnv | Out-File -FilePath $envFile -Encoding utf8
    Write-Host "✅ .env básico creado" -ForegroundColor Green
    exit 0
}

$envContent = Get-Content $envFile -Raw
$envVars = @{}

# Parsear .env
foreach ($line in (Get-Content $envFile)) {
    $line = $line.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        if ($line -match "^([^=]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
}

Write-Host "`n📋 Variables encontradas: $($envVars.Count)" -ForegroundColor Gray

# Variables requeridas
$required = @{
    "NODE_ENV"       = "development|test|production"
    "PORT"           = "\d+"
    "OPENAI_API_KEY" = "sk-.+"
}

# Variables recomendadas
$recommended = @{
    "PAYLOAD_LIMIT"        = "\d+(mb|gb)"
    "MAX_UPLOAD_SIZE"      = "\d+(mb|gb)"
    "CORS_ALLOWED_ORIGINS" = "http.*"
}

Write-Host "`n✅ Verificando variables requeridas..." -ForegroundColor Yellow
foreach ($var in $required.Keys) {
    if ($envVars.ContainsKey($var)) {
        $pattern = $required[$var]
        if ($envVars[$var] -match $pattern) {
            Write-Host "   ✅ $var: OK" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ $var: Formato inválido (esperado: $pattern)" -ForegroundColor Red
            $errors++
        }
    }
    else {
        Write-Host "   ❌ $var: NO ENCONTRADA" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n⚠️  Verificando variables recomendadas..." -ForegroundColor Yellow
foreach ($var in $recommended.Keys) {
    if ($envVars.ContainsKey($var)) {
        $pattern = $recommended[$var]
        if ($envVars[$var] -match $pattern) {
            Write-Host "   ✅ $var: OK" -ForegroundColor Green
        }
        else {
            Write-Host "   ⚠️  $var: Formato puede ser mejor (esperado: $pattern)" -ForegroundColor Yellow
            $warnings++
        }
    }
    else {
        Write-Host "   ⚠️  $var: No configurada (recomendada)" -ForegroundColor Yellow
        $warnings++
    }
}

# Resumen
Write-Host "`n📊 RESUMEN:" -ForegroundColor Cyan
Write-Host "   Errores: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host "   Advertencias: $warnings" -ForegroundColor $(if ($warnings -eq 0) { "Green" } else { "Yellow" })

if ($errors -eq 0) {
    Write-Host "`n✅ Validación completada" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n❌ Validación falló - Corrige los errores" -ForegroundColor Red
    exit 1
}


