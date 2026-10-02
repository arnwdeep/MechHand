Add-Type -AssemblyName System.Drawing

$src = "C:\Users\modak\.gemini\antigravity-ide\brain\13acd03a-f318-46b9-9d88-2b78bd06fbbf\.user_uploaded\media_1790943198690.png"
$destRaw = "c:\PROJECTS\shree-rani-gehna\shree-rani-gehna\frontend\public\media\logo.png"
$destTrans = "c:\PROJECTS\shree-rani-gehna\shree-rani-gehna\frontend\public\media\logo-transparent.png"

Copy-Item $src $destRaw -Force

$bmp = [System.Drawing.Bitmap]::FromFile($src)
$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0

for ($x = 0; $x -lt $bmp.Width; $x++) {
  for ($y = 0; $y -lt $bmp.Height; $y++) {
    $c = $bmp.GetPixel($x, $y)
    $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
    if ($lum -lt 210) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}

$pad = 10
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($bmp.Width - $cropX, ($maxX - $minX) + ($pad * 2))
$cropH = [Math]::Min($bmp.Height - $cropY, ($maxY - $minY) + ($pad * 2))

$cropped = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $cropW; $x++) {
  for ($y = 0; $y -lt $cropH; $y++) {
    $origC = $bmp.GetPixel($cropX + $x, $cropY + $y)
    $lum = 0.299 * $origC.R + 0.587 * $origC.G + 0.114 * $origC.B
    if ($lum -gt 228) {
      $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    } else {
      $alpha = [Math]::Min(255, [Math]::Max(0, [int]((228.0 - $lum) / 80.0 * 255.0)))
      $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $origC.R, $origC.G, $origC.B))
    }
  }
}

$cropped.Save($destTrans, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$cropped.Dispose()

Write-Output "Logo successfully processed to $destTrans"
