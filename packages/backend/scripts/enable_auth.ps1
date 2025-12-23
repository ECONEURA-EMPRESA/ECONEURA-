$ErrorActionPreference = "Stop"
Write-Host "?? Getting Access Token..."
$token = gcloud auth print-access-token
if (!$token) { throw "No token found. Run 'gcloud auth login' first." }

$project = "econeura-109cc"
$url = "https://identitytoolkit.googleapis.com/v2/projects/$project/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired"
$body = @{
    signIn = @{
        email = @{
            enabled          = $true
            passwordRequired = $true
        }
    }
} | ConvertTo-Json -Depth 5

Write-Host "?? Enabling Email/Password Auth via REST API..."
try {
    $response = Invoke-RestMethod -Uri $url -Method Patch -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
    Write-Host "? SUCCESS! Auth Config Updated:"
    Write-Host ($response | ConvertTo-Json -Depth 5)
}
catch {
    Write-Host "? ERROR: $_"
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host $reader.ReadToEnd()
    }
    catch {
        Write-Host "No detailed error response."
    }
    exit 1
}
