$ErrorActionPreference = "Stop"

# ===== CONFIG =====
# please put the location of your testing repo
$PACK_OUTPUT_DIR = "$HOME\Documents\rangeos-nx-rc5-migration"
# ==================

New-Item -ItemType Directory -Force -Path $PACK_OUTPUT_DIR | Out-Null

npx nx build cmi5-build-common
npx nx build rapid-cmi5-ui
npx nx build rapid-cmi5

Set-Location ./dist/packages

Set-Location common
$COMMON_TGZ = npm pack
Copy-Item $COMMON_TGZ $PACK_OUTPUT_DIR
Set-Location ..

Set-Location ui
$UI_TGZ = npm pack
Copy-Item $UI_TGZ $PACK_OUTPUT_DIR
Set-Location ..

Set-Location rapid-cmi5
$RAPID_TGZ = npm pack
Copy-Item $RAPID_TGZ $PACK_OUTPUT_DIR
Set-Location ..

Write-Host "✅ npm packs copied to: $PACK_OUTPUT_DIR"
