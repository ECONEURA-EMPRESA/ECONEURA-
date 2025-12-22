# deploy.ps1
# SCRIPT MAESTRO DE DESPLIEGUE PARA ECONEURA
# v4: ASCII ONLY (To avoid encoding issues)

$ErrorActionPreference = "Stop"
$PROJECT_ID = "econeura-109cc"

Write-Host ">>> DESPLEGANDO ECONEURA A GOOGLE CLOUD..." -ForegroundColor Cyan
Write-Host ">>> PROYECTO: $PROJECT_ID" -ForegroundColor Gray

# 0. CHECKS & PATH FIX
$TargetTerraform = "terraform"
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    $WingetPath = "$env:LOCALAPPDATA/Programs/Common/terraform.exe"
    if (Test-Path $WingetPath) {
        Write-Host "WARING: Terraform encontrado en WinGet." -ForegroundColor Gray
        $TargetTerraform = $WingetPath
    }
    else {
        Write-Error "ERROR: 'terraform' no encontrado. Instala con: winget install HashiCorp.Terraform"
        exit 1
    }
}

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "ERROR: 'gcloud' no encontrado."
    exit 1
}

# 1. VERIFICACION DE CREDENCIALES
Write-Host ">>> Verificando credenciales..." -ForegroundColor Yellow
$CurrentProject = gcloud config get-value project 2>$null
if ($CurrentProject -ne $PROJECT_ID) {
    Write-Host "WARNING: Cambiando proyecto activo a $PROJECT_ID..." -ForegroundColor Yellow
    gcloud config set project $PROJECT_ID
}

# Verificar Application Default Credentials (ADC)
if (-not (Test-Path "$env:APPDATA\gcloud\application_default_credentials.json")) {
    Write-Host "ATENCION: Faltan credenciales. Iniciando login..." -ForegroundColor Yellow
    Write-Host "Se abrira tu navegador. Por favor inicia sesion." -ForegroundColor Cyan
    gcloud auth application-default login
}

# 2. HABILITAR APIS Y PERMISOS
Write-Host ">>> Activando APIs y corrigiendo Permisos..." -ForegroundColor Yellow
try {
    gcloud services enable run.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com --project $PROJECT_ID
    
    # FIX: Dar permisos a la Service Account por defecto de Compute/Build
    $ProjectNum = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
    $ComputeSA = "$ProjectNum-compute@developer.gserviceaccount.com"
    $CloudBuildSA = "$ProjectNum@cloudbuild.gserviceaccount.com"
    Write-Host ">>> Arreglando permisos para SAs: $ComputeSA / $CloudBuildSA" -ForegroundColor Gray
    
    # Compute SA
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$ComputeSA" --role="roles/storage.admin" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$ComputeSA" --role="roles/cloudbuild.builds.editor" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$ComputeSA" --role="roles/logging.logWriter" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$ComputeSA" --role="roles/artifactregistry.admin" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$ComputeSA" --role="roles/cloudsql.client" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$ComputeSA" --role="roles/secretmanager.secretAccessor" --condition=None --quiet


    # Cloud Build SA (CRITICAL for logs and registry)
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CloudBuildSA" --role="roles/logging.logWriter" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CloudBuildSA" --role="roles/storage.admin" --condition=None --quiet
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$CloudBuildSA" --role="roles/artifactregistry.admin" --condition=None --quiet
    
    Write-Host "OK: APIs Activas y Permisos Corregidos. Esperando propagación (10s)..." -ForegroundColor Green
    Start-Sleep -Seconds 10
}
catch {
    Write-Host "WARNING: Error ajustando permisos (continuando)..." -ForegroundColor Gray
}

# 3. INFRAESTRUCTURA
Write-Host ">>> Aplicando Terraform..." -ForegroundColor Yellow
Set-Location "infrastructure"

# FIX: Forzar ADC Login si Terraform falla
try {
    & $TargetTerraform init -migrate-state
}
catch {
    Write-Host "WARNING: Error en Terraform Init. Probablemente faltan credenciales ADC." -ForegroundColor Red
    Write-Host ">>> Abriendo login de aplicacion..."
    gcloud auth application-default login
    & $TargetTerraform init -migrate-state
}

& $TargetTerraform apply -auto-approve
Set-Location ..

# 4. BACKEND
Write-Host ">>> Desplegando Backend a Cloud Run..." -ForegroundColor Yellow
$BackendPath = Join-Path (Get-Location) "packages\backend"
if (Test-Path $BackendPath) {
    Set-Location $BackendPath
    gcloud run deploy econeura-backend `
        --source . `
        --region us-central1 `
        --allow-unauthenticated `
        --set-env-vars "USE_MEMORY_STORE=true,NODE_ENV=production" `
        --project $PROJECT_ID `
        --quiet
    Set-Location ../..
}
else {
    Write-Error "ERROR: No encuentro la carpeta backend en: $BackendPath"
}

# 5. FRONTEND
Write-Host ">>> Desplegando Frontend a Firebase Hosting..." -ForegroundColor Yellow
$FrontendPath = Join-Path (Get-Location) "packages\frontend"
if (Test-Path $FrontendPath) {
    Set-Location $FrontendPath
    
    # FIX: Limpieza profunda ROBUSTA para evitar conflictos
    Write-Host ">>> Limpiando node_modules antiguos..." -ForegroundColor Gray
    if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue }
    
    # Retry loop for node_modules deletion
    $MaxRetries = 3
    $RetryCount = 0
    while ((Test-Path "node_modules") -and ($RetryCount -lt $MaxRetries)) {
        try {
            Remove-Item "node_modules" -Recurse -Force -ErrorAction Stop
        }
        catch {
            Write-Host ">>> node_modules bloqueado, reintentando en 2s..." -ForegroundColor DarkGray
            Start-Sleep -Seconds 2
            $RetryCount++
        }
    }
    
    if (Test-Path "node_modules") {
        Write-Warning "No se pudo borrar node_modules completamente. La instalación podría ser inestable."
    }
    else {
        Write-Host ">>> Limpieza completada." -ForegroundColor Green
    }
    
    Write-Host ">>> Instalando dependencias (Frescas)..." -ForegroundColor Gray
    npm install
    
    Write-Host ">>> Construyendo Frontend..." -ForegroundColor Gray
    npm run build
    
    Set-Location ../..
    firebase deploy --only hosting --project $PROJECT_ID
}
else {
    Write-Error "ERROR: No encuentro la carpeta frontend en: $FrontendPath"
}

Write-Host "---------------------------------------------------"
Write-Host "DONE: SCRIPT FINALIZADO." -ForegroundColor Green
Write-Host "URL:" 
firebase hosting:channel:list --project $PROJECT_ID --json | Select-String "url"
