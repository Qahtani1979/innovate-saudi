$files = Get-ChildItem -Path "src" -Recurse -Include "*.jsx", "*.js"
$pattern = "^\s*import\s+\{\s*base44\s*\}\s+from\s+['`"]@/api/base44Client['`"];?\s*$"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match $pattern) {
        $newContent = $content -replace "(?m)$pattern", ""
        # Remove empty lines left behind if any (optional, but cleaner)
        # $newContent = $newContent -replace "(?m)^\s*`r`n", "" 
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Cleaned: $($file.Name)"
    }
}
Write-Host "Cleanup Complete."
