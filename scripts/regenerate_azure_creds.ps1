# Script to regenerate Azure Credentials for GitHub Actions
# SECURITY: This version does NOT print credentials to console
$subscriptionId = "a0991f95-16e0-4f03-85df-db3d69004d94"
$resourceGroup = "rg-econeura-ok-prod"
$appName = "econeura-backend-sp-$(Get-Date -Format yyyyMMddHHmmss)"

Write-Host "Logging into Azure..."
az login

Write-Host "Setting subscription..."
az account set --subscription $subscriptionId

Write-Host "Creating Service Principal with LEAST PRIVILEGE..."

# SECURITY FIX: Use specific roles instead of Contributor
# Create SP without SDK auth format (avoid printing credentials)
$spOutput = az ad sp create-for-rbac --name $appName --skip-assignment --output json | ConvertFrom-Json

# Assign minimal required roles
Write-Host "Assigning minimal roles to Resource Group scope..."
az role assignment create --assignee $spOutput.appId --role "Website Contributor" --scope "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup"
az role assignment create --assignee $spOutput.appId --role "Web Plan Contributor" --scope "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup"
az role assignment create --assignee $spOutput.appId --role "Key Vault Secrets User" --scope "/subscriptions/$subscriptionId/resourceGroups/$resourceGroup"

# Create SDK auth format WITHOUT printing to console
$credentials = @{
    clientId                       = $spOutput.appId
    clientSecret                   = $spOutput.password
    subscriptionId                 = $subscriptionId
    tenantId                       = $spOutput.tenant
    activeDirectoryEndpointUrl     = "https://login.microsoftonline.com"
    resourceManagerEndpointUrl     = "https://management.azure.com/"
    activeDirectoryGraphResourceId = "https://graph.windows.net/"
    sqlManagementEndpointUrl       = "https://management.core.windows.net:8443/"
    galleryEndpointUrl             = "https://gallery.azure.com/"
    managementEndpointUrl          = "https://management.core.windows.net/"
}

# SECURITY FIX: Save to file instead of printing to console
$jsonPath = "azure_credentials_$(Get-Date -Format yyyyMMddHHmmss).json"
$credentials | ConvertTo-Json | Out-File -FilePath $jsonPath -Encoding UTF8

Write-Host "`n✅ Service Principal created with MINIMAL PRIVILEGES" -ForegroundColor Green
Write-Host "`n⚠️  SECURITY:" -ForegroundColor Yellow
Write-Host "Credentials saved to: $jsonPath" -ForegroundColor Cyan
Write-Host "NEVER commit this file to version control!" -ForegroundColor Red
Write-Host "Add to .gitignore: azure_credentials_*.json" -ForegroundColor Yellow
Write-Host "`n👉 ACTION REQUIRED:" -ForegroundColor Cyan
Write-Host "1. Copy content from $jsonPath" -ForegroundColor White
Write-Host "2. Update 'AZURE_CREDENTIALS' secret in GitHub" -ForegroundColor White
Write-Host "3. DELETE the file: Remove-Item $jsonPath" -ForegroundColor Red

