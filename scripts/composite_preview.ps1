Add-Type -AssemblyName System.Drawing

$spritePath = 'C:\Users\This PC\.gemini\antigravity-ide\brain\f4243eb1-3b00-4f93-aaec-327220655ce0\deverhung_seated_anime_v1_1791913837249.jpg'
$mapPath = 'D:\THStudy\DeverClub\DEVER_TOWN\public\devertown_tech_lab_v2.jpg'
$outPath = 'C:\Users\This PC\.gemini\antigravity-ide\brain\f4243eb1-3b00-4f93-aaec-327220655ce0\deverhung_sit_in_tech_lab_preview.jpg'

$spriteBmp = New-Object System.Drawing.Bitmap($spritePath)
$mapBmp = New-Object System.Drawing.Bitmap($mapPath)

$colW = [int]($spriteBmp.Width / 6)
$rowH = [int]($spriteBmp.Height / 4)

function GetFrameBitmap($col, $row, $targetW, $targetH) {
    $frameBmp = New-Object System.Drawing.Bitmap($colW, $rowH)
    for ($y = 0; $y -lt $rowH; $y++) {
        for ($x = 0; $x -lt $colW; $x++) {
            $c = $spriteBmp.GetPixel($col * $colW + $x, $row * $rowH + $y)
            if ($c.R -gt 185 -and $c.B -gt 185 -and $c.G -lt 95) {
                $frameBmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            } else {
                $frameBmp.SetPixel($x, $y, $c)
            }
        }
    }
    $scaled = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g = [System.Drawing.Graphics]::FromImage($scaled)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $g.DrawImage($frameBmp, 0, 0, $targetW, $targetH)
    $g.Dispose()
    $frameBmp.Dispose()
    return $scaled
}

$gMap = [System.Drawing.Graphics]::FromImage($mapBmp)

$charW = 36
$charH = 46

# 1. Seated at Hackathon Alpha 1 (Col 0, Row 2) -> seated on gaming chair facing desk
$sitDesk1 = GetFrameBitmap 0 2 $charW $charH
$gMap.DrawImage($sitDesk1, [int](430 - $charW / 2), [int](490 - $charH / 2))

# 2. Seated at Hackathon Alpha 2 (Col 1, Row 2) -> seated on gaming chair facing desk
$sitDesk2 = GetFrameBitmap 1 2 $charW $charH
$gMap.DrawImage($sitDesk2, [int](650 - $charW / 2), [int](490 - $charH / 2))

# 3. Seated at Sofa Lounge (Col 0, Row 3) -> (1175, 235)
$sitSofa = GetFrameBitmap 0 3 $charW $charH
$gMap.DrawImage($sitSofa, [int](1175 - $charW / 2), [int](245 - $charH / 2))

# 4. Standing walking in hallway (Col 0, Row 0) -> (650, 560)
$walkFront = GetFrameBitmap 0 0 $charW $charH
$gMap.DrawImage($walkFront, [int](650 - $charW / 2), [int](560 - $charH / 2))

$gMap.Dispose()
$mapBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$mapBmp.Dispose()
$spriteBmp.Dispose()
Write-Host "Composite saved successfully to $outPath"
