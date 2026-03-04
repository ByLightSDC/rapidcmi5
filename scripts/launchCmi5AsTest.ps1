# User can add name as param when running script
param(
    [string]$Name
)

if (-not $Name) {
    $Name = Read-Host "Enter actor name"
    $Name = $Name.Trim()  # remove extra spaces at start/end
}

$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ1cm46Y2F0YXB1bHQ6cGxheWVyIiwiYXVkIjoidXJuOmNhdGFwdWx0OnN0cmluZyIsInN1YiI6MSwianRpIjoiNDIzOTZhMmYtOTlmOC00YTI1LTg4MTMtNjdlMjRiNzQzNmRiIiwiaWF0IjoxNzQyMzA5OTQyfQ.iu3gSisB6GUFLbrygeHuMb3KSX60vjC2rbsf0VB8iQU"

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