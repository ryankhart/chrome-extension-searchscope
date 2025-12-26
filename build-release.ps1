# NOTE: This file should be kept in sync with build-release.sh
# When making changes, update both files to maintain feature parity

# Package SearchScout extension for Chrome Web Store
# This script creates a ZIP file containing only the runtime files

# Read version from manifest.json
$manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json
$extensionName = $manifest.name
$version = $manifest.version
$outputFile = "$extensionName-$version.zip"
$tempDir = "temp-package"

Write-Host "Building release package for $extensionName v$version"
Write-Host ""

# Remove old package and temp directory if they exist
if (Test-Path $outputFile) {
    Remove-Item $outputFile
    Write-Host "Removed old package: $outputFile"
}

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

# Create temporary directory structure
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path "$tempDir/icons" | Out-Null

# Copy files to temp directory
Write-Host "Copying files:"
Copy-Item "manifest.json" -Destination $tempDir
Write-Host "  - manifest.json"

Copy-Item "background.js" -Destination $tempDir
Write-Host "  - background.js"

Copy-Item -Recurse "modules" -Destination $tempDir
Write-Host "  - modules/"

Copy-Item -Recurse "popup" -Destination $tempDir
Write-Host "  - popup/"

# Copy only the required icon files
Copy-Item "icons/icon16.png" -Destination "$tempDir/icons/"
Copy-Item "icons/icon32.png" -Destination "$tempDir/icons/"
Copy-Item "icons/icon48.png" -Destination "$tempDir/icons/"
Copy-Item "icons/icon128.png" -Destination "$tempDir/icons/"
Write-Host "  - icons/ (4 PNG files)"

Write-Host ""

# Create ZIP from temp directory
$items = Get-ChildItem -Path $tempDir
Compress-Archive -Path $items.FullName -DestinationPath $outputFile -Force

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

Write-Host "Package created successfully: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Upload $outputFile to Chrome Web Store Developer Dashboard"
Write-Host "2. Upload screenshots separately in the store listing interface"
