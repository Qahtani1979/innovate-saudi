$files = Get-ChildItem -Path "src" -Recurse -Include "*.jsx", "*.js"

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    # Regex to match the import statement, more flexible
    # matches: import { base44 } from '@/api/base44Client'; (with optional semi-colon, whitespace, different quotes)
    if ($content -match "import\s+\{\s*base44\s*\}\s+from\s+['`""]@/api/base44Client['`""];?") {
        $newContent = $content -replace "import\s+\{\s*base44\s*\}\s+from\s+['`""]@/api/base44Client['`""]; ?\r?\n?", ""
        [System.IO.File]::WriteAllText($file.FullName, $newContent)
        Write-Host "Cleaned: $($file.Name)"
    }
}
Write-Host "Cleanup V2 Complete."
