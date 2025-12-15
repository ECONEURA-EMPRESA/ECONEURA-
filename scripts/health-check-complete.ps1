# ECONEURA-FULL - Health Check Completo Post-Deploy
# Verifica que TODO funciona correctamente después del deploy

param(
    [string]$BackendUrl = "https://app-econeura-full-staging-backend.azurewebsites.net",
    [string]$FrontendUrl = "",
    [int]$TimeoutSeconds = 30
)

$ErrorActionPreference = "Stop"

Write-Host "`n🏥 HEALTH CHECK COMPLETO - ECONEURA-FULL`n" -ForegroundColor Cyan
Write-Host "Backend URL: $BackendUrl" -ForegroundColor Cyan
if ($FrontendUrl) {
    Write-Host "Frontend URL: $FrontendUrl`n" -ForegroundColor Cyan
}

$global:Errors = @()
$global:Warnings = @()

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ ERROR: $Message" -ForegroundColor Red
    $global:Errors += $Message
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠️  WARNING: $Message" -ForegroundColor Yellow
    $global:Warnings += $Message
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Test-HttpEndpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [int]$ExpectedStatus = 200,
        [int]$TimeoutSeconds = 10
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $Headers -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq $ExpectedStatus) {
            return $true
        } else {
            return $false
        }
    } catch {
        return $false
    }
}

# ============================================================================
# 1. HEALTH CHECK ENDPOINT
# ============================================================================
Write-Host "💚 1. Verificando Health Check..." -ForegroundColor Yellow

$healthUrl = "$BackendUrl/health"
$healthOk = Test-HttpEndpoint -Url $healthUrl -ExpectedStatus 200 -TimeoutSeconds 5

if ($healthOk) {
    Write-Success "Health endpoint responde: $healthUrl"
} else {
    Write-Error-Custom "Health endpoint NO responde: $healthUrl"
    Write-Host "Verificar logs: az webapp log tail --name app-econeura-full-staging-backend --resource-group rg-econeura-full-staging" -ForegroundColor Yellow
}

# ============================================================================
# 2. API ENDPOINTS
# ============================================================================
Write-Host "`n🔌 2. Verificando API Endpoints..." -ForegroundColor Yellow

$apiEndpoints = @(
    @{ Path = "/api/neuras"; ExpectedStatus = 401 }, # 401 es esperado sin auth
    @{ Path = "/api/conversations"; ExpectedStatus = 401 },
    @{ Path = "/api/agents"; ExpectedStatus = 401 },
    @{ Path = "/api/library"; ExpectedStatus = 401 },
    @{ Path = "/api/metrics"; ExpectedStatus = 200 } # Metrics no requiere auth
)

foreach ($endpoint in $apiEndpoints) {
    $url = "$BackendUrl$($endpoint.Path)"
    $ok = Test-HttpEndpoint -Url $url -ExpectedStatus $endpoint.ExpectedStatus -TimeoutSeconds 5
    
    if ($ok) {
        Write-Success "Endpoint responde: $($endpoint.Path) (HTTP $($endpoint.ExpectedStatus))"
    } else {
        Write-Warning-Custom "Endpoint no responde correctamente: $($endpoint.Path)"
    }
}

# ============================================================================
# 3. VERIFICAR LOGS DE ERRORES
# ============================================================================
Write-Host "`n📋 3. Verificando logs recientes..." -ForegroundColor Yellow

if (Get-Command az -ErrorAction SilentlyContinue) {
    try {
        Write-Host "Obteniendo últimas 50 líneas de logs..." -ForegroundColor Gray
        $logs = az webapp log tail --name "app-econeura-full-staging-backend" --resource-group "rg-econeura-full-staging" --num-lines 50 2>&1
        
        $errorLogs = $logs | Select-String -Pattern "error|Error|ERROR|failed|Failed|FAILED" | Select-Object -First 5
        if ($errorLogs) {
            Write-Warning-Custom "Errores encontrados en logs:"
            foreach ($log in $errorLogs) {
                Write-Host "  ⚠️  $log" -ForegroundColor Yellow
            }
        } else {
            Write-Success "No se encontraron errores críticos en logs recientes"
        }
    } catch {
        Write-Warning-Custom "No se pudieron obtener logs (Azure CLI no configurado o sin acceso)"
    }
} else {
    Write-Warning-Custom "Azure CLI no disponible - no se pueden verificar logs"
}

# ============================================================================
# 4. VERIFICAR APPLICATION INSIGHTS
# ============================================================================
Write-Host "`n📊 4. Verificando Application Insights..." -ForegroundColor Yellow

Write-Host "Verificar manualmente en Azure Portal:" -ForegroundColor Gray
Write-Host "  - Application Insights → appi-econeura-full-staging" -ForegroundColor Gray
Write-Host "  - Verificar que hay telemetría llegando" -ForegroundColor Gray
Write-Host "  - Verificar que no hay errores críticos`n" -ForegroundColor Gray

# ============================================================================
# 5. VERIFICAR FRONTEND (si URL proporcionada)
# ============================================================================
if ($FrontendUrl) {
    Write-Host "🌐 5. Verificando Frontend..." -ForegroundColor Yellow
    
    $frontendOk = Test-HttpEndpoint -Url $FrontendUrl -ExpectedStatus 200 -TimeoutSeconds 10
    
    if ($frontendOk) {
        Write-Success "Frontend responde: $FrontendUrl"
    } else {
        Write-Error-Custom "Frontend NO responde: $FrontendUrl"
    }
}

# ============================================================================
# 6. VERIFICAR CONECTIVIDAD A SERVICIOS
# ============================================================================
Write-Host "`n🔗 6. Verificando conectividad a servicios..." -ForegroundColor Yellow

Write-Host "Verificar manualmente en Azure Portal:" -ForegroundColor Gray
Write-Host "  - App Service → Configuration → Application settings" -ForegroundColor Gray
Write-Host "    - DATABASE_URL configurada" -ForegroundColor Gray
Write-Host "    - REDIS_URL configurada (si se usa)" -ForegroundColor Gray
Write-Host "    - APPLICATIONINSIGHTS_CONNECTION_STRING configurada" -ForegroundColor Gray
Write-Host "  - Verificar que PostgreSQL está corriendo (no pausado)" -ForegroundColor Gray
Write-Host "  - Verificar que Redis está corriendo (si se usa)`n" -ForegroundColor Gray

# ============================================================================
# RESUMEN FINAL
# ============================================================================
Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "📊 RESUMEN DE HEALTH CHECK" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

$errorCount = $global:Errors.Count
$warningCount = $global:Warnings.Count

if ($errorCount -eq 0 -and $warningCount -eq 0) {
    Write-Host "`n✅ HEALTH CHECK EXITOSO - Todo funciona correctamente`n" -ForegroundColor Green
    exit 0
} elseif ($errorCount -eq 0) {
    Write-Host "`n⚠️  HEALTH CHECK CON ADVERTENCIAS" -ForegroundColor Yellow
    Write-Host "Errores: 0" -ForegroundColor Green
    Write-Host "Advertencias: $warningCount`n" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "`n❌ HEALTH CHECK FALLIDO" -ForegroundColor Red
    Write-Host "Errores: $errorCount" -ForegroundColor Red
    Write-Host "Advertencias: $warningCount`n" -ForegroundColor Yellow
    
    Write-Host "ERRORES ENCONTRADOS:" -ForegroundColor Red
    foreach ($error in $global:Errors) {
        Write-Host "  ❌ $error" -ForegroundColor Red
    }
    
    Write-Host "`n🔧 ACCIONES RECOMENDADAS:" -ForegroundColor Yellow
    Write-Host "  1. Verificar logs: az webapp log tail --name app-econeura-full-staging-backend --resource-group rg-econeura-full-staging" -ForegroundColor White
    Write-Host "  2. Verificar Application Insights para errores" -ForegroundColor White
    Write-Host "  3. Verificar variables de entorno en App Service" -ForegroundColor White
    Write-Host "  4. Verificar que PostgreSQL y Redis están corriendo`n" -ForegroundColor White
    
    exit 1
}

