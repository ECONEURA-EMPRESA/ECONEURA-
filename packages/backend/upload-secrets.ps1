# Script para subir secretos de .env local a Google Secret Manager
# Ejecutar desde: packages/backend

$envPath = ".env"

if (!(Test-Path $envPath)) {
    Write-Error "No se encuentra el archivo .env en $envPath"
    exit 1
}

# Función para subir secreto
function Upload-Secret ($key, $gcpName) {
    $val = Get-Content $envPath | Where-Object { $_ -match "^$key=" } | ForEach-Object { $_.Split('=', 2)[1] }
    if ($val) {
        Write-Host "Subiendo $key -> $gcpName..."
        $val | gcloud secrets versions add $gcpName --data-file=-
    }
    else {
        Write-Warning "Variable $key no encontrada en .env"
    }
}

Upload-Secret "DB_PASSWORD" "ECONEURA_DB_PASSWORD"
Upload-Secret "GEMINI_API_KEY" "ECONEURA_GEMINI_API_KEY"
Upload-Secret "JWT_SECRET" "ECONEURA_JWT_SECRET"
Upload-Secret "CRM_WEBHOOK_SECRET" "ECONEURA_CRM_SECRET"
Upload-Secret "STRIPE_SECRET_KEY" "ECONEURA_STRIPE_SECRET_KEY"
Upload-Secret "STRIPE_WEBHOOK_SECRET" "ECONEURA_STRIPE_WEBHOOK_SECRET"

Write-Host "✅ Carga de secretos completada."
