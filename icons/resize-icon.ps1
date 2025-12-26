Add-Type -AssemblyName System.Drawing

# Source image path - download the icon from Flaticon and save it here
$sourceImage = Join-Path $PSScriptRoot "binoculars-source.png"

if (-not (Test-Path $sourceImage)) {
    Write-Host "Error: Source image not found at $sourceImage" -ForegroundColor Red
    Write-Host "Please download the icon from Flaticon and save it as 'binoculars-source.png' in the icons folder"
    exit 1
}

function Resize-Image {
    param(
        [string]$sourcePath,
        [int]$size,
        [string]$outputPath
    )

    $sourceImg = [System.Drawing.Image]::FromFile($sourcePath)
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    # High quality resize settings
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($sourceImg, 0, 0, $size, $size)

    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $graphics.Dispose()
    $bitmap.Dispose()
    $sourceImg.Dispose()

    Write-Host "Created $outputPath ($size x $size)" -ForegroundColor Green
}

# Generate all required sizes
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Resize-Image $sourceImage 16 (Join-Path $scriptDir "icon16.png")
Resize-Image $sourceImage 32 (Join-Path $scriptDir "icon32.png")
Resize-Image $sourceImage 48 (Join-Path $scriptDir "icon48.png")
Resize-Image $sourceImage 128 (Join-Path $scriptDir "icon128.png")

Write-Host "`nAll icons created successfully!" -ForegroundColor Cyan
Write-Host "You can now delete binoculars-source.png if you wish"
