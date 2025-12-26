#!/bin/bash
# NOTE: This file should be kept in sync with build-release.ps1
# When making changes, update both files to maintain feature parity

# Package SearchScout extension for Chrome Web Store
# This script creates a ZIP file containing only the runtime files

# Read version from manifest.json
# Using grep and sed for cross-platform compatibility (doesn't require jq)
extensionName=$(grep '"name"' manifest.json | sed -E 's/.*"name"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
version=$(grep '"version"' manifest.json | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
outputFile="${extensionName}-${version}.zip"
tempDir="temp-package"

echo "Building release package for $extensionName v$version"
echo ""

# Remove old package and temp directory if they exist
if [ -f "$outputFile" ]; then
    rm "$outputFile"
    echo "Removed old package: $outputFile"
fi

if [ -d "$tempDir" ]; then
    rm -rf "$tempDir"
fi

# Create temporary directory structure
mkdir -p "$tempDir/icons"

# Copy files to temp directory
echo "Copying files:"
cp "manifest.json" "$tempDir/"
echo "  - manifest.json"

cp "background.js" "$tempDir/"
echo "  - background.js"

cp -r "modules" "$tempDir/"
echo "  - modules/"

cp -r "popup" "$tempDir/"
echo "  - popup/"

# Copy only the required icon files
cp "icons/icon16.png" "$tempDir/icons/"
cp "icons/icon32.png" "$tempDir/icons/"
cp "icons/icon48.png" "$tempDir/icons/"
cp "icons/icon128.png" "$tempDir/icons/"
echo "  - icons/ (4 PNG files)"

echo ""

# Create ZIP from temp directory
cd "$tempDir"
zip -r "../$outputFile" . > /dev/null
cd ..

# Clean up temp directory
rm -rf "$tempDir"

echo "Package created successfully: $outputFile"
echo ""
echo "Next steps:"
echo "1. Upload $outputFile to Chrome Web Store Developer Dashboard"
echo "2. Upload screenshots separately in the store listing interface"
