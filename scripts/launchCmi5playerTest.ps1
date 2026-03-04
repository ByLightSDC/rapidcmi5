# User can add name as param when running script
param(
    [string]$Name
)

if (-not $Name) {
    $Name = Read-Host "Enter actor name"
    $Name = $Name.Trim()  # remove extra spaces at start/end
}
# Load the secret token from .env
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $_ = $_.Trim()
        if ($_ -and $_ -notmatch "^#") {
            $parts = $_ -split "=", 2
            if ($parts.Count -eq 2) {
                [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim())
            }
        }
    }
}

# Get the token safely
$token = $env:BEARER_TOKEN.Trim()

# Registration number must always be different, because to the player these are different sessions and cannot repeat.
# This is the form of a registration number as string - "713eb82a-bca1-26ab-d1dc-abb20965c24b
$reg = [guid]::NewGuid().ToString()

$body = @{
  actor = @{
    objectType = "Agent"
    account = @{
      homePage = "https://moodle.com"
      name     = $Name
    }
  }

  reg = $reg
  
  returnUrl = "https://lms.example.com/return"
} | ConvertTo-Json -Depth 5

$response = Invoke-RestMethod `
  -Method POST `
  -Uri "https://cpt-player.develop-cp.rangeos.engineering/api/v1/course/1604/launch-url/0" `
  -Headers @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $body

# Extract query string from returned URL and rewrite host
$uri = [System.Uri]$response.url
$localUrl = "http://localhost:4200$($uri.PathAndQuery)"

Write-Output $localUrl

