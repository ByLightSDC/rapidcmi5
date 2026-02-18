$ErrorActionPreference = "Stop"

# ===== CONFIG =====
$AppName   = "cc-cmi5-player"
$DistDir   = "dist/apps/$AppName"
$ZipName   = "$AppName.zip"
$TargetDir = "apps/rapid-cmi5-electron-frontend/src/assets"
# ==================

Write-Host "▶ Building $AppName..."
npx nx build $AppName

Write-Host "▶ Zipping build output..."

$ZipPath = Join-Path $DistDir $ZipName
if (Test-Path $ZipPath) {
  Remove-Item $ZipPath -Force
}

Compress-Archive `
  -Path (Join-Path $DistDir "*") `
  -DestinationPath $ZipPath `
  -Force

Write-Host "▶ Copying zip to Electron assets..."
New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
Copy-Item $ZipPath (Join-Path $TargetDir $ZipName) -Force

Write-Host "✅ Done!"
Write-Host "📦 $TargetDir/$ZipName"
