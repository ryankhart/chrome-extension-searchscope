Add-Type -AssemblyName System.Drawing

function Create-Icon {
    param([int]$size, [string]$path)

    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = 'AntiAlias'

    # Blue background
    $graphics.Clear([System.Drawing.Color]::FromArgb(26, 115, 232))

    # Calculate dimensions
    $lensRadius = $size * 0.18
    $lensDiameter = $lensRadius * 2
    $strokeWidth = [Math]::Max(2, $size / 14)
    $bridgeHeight = [Math]::Max(3, $size * 0.08)

    # Left lens center at (35%, 50%)
    $leftX = $size * 0.35 - $lensRadius
    $leftY = $size * 0.50 - $lensRadius

    # Right lens center at (65%, 50%)
    $rightX = $size * 0.65 - $lensRadius
    $rightY = $size * 0.50 - $lensRadius

    # Draw white lens outlines
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, $strokeWidth)
    $whitePen.StartCap = 'Round'
    $whitePen.EndCap = 'Round'
    $graphics.DrawEllipse($whitePen, $leftX, $leftY, $lensDiameter, $lensDiameter)
    $graphics.DrawEllipse($whitePen, $rightX, $rightY, $lensDiameter, $lensDiameter)

    # Draw orange bridge connecting the lenses
    $orangeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 107, 53))
    $bridgeX = $size * 0.35 + $lensRadius
    $bridgeY = $size * 0.50 - ($bridgeHeight / 2)
    $bridgeWidth = ($size * 0.65) - ($size * 0.35) - ($lensRadius * 2)
    $graphics.FillRectangle($orangeBrush, $bridgeX, $bridgeY, $bridgeWidth, $bridgeHeight)

    $whitePen.Dispose()
    $orangeBrush.Dispose()

    $graphics.Dispose()
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Create-Icon 16 (Join-Path $scriptDir "icon16.png")
Create-Icon 32 (Join-Path $scriptDir "icon32.png")
Create-Icon 48 (Join-Path $scriptDir "icon48.png")
Create-Icon 128 (Join-Path $scriptDir "icon128.png")

Write-Host "Icons created successfully"
