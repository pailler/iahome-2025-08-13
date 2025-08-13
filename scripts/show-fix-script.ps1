# Script pour afficher le script de correction de la colonne created_by

Write-Host "Script de correction pour la colonne created_by" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

$sqlFile = "scripts/fix-created-by-column.sql"
if (Test-Path $sqlFile) {
    $content = Get-Content $sqlFile -Raw
    Write-Host $content -ForegroundColor White
} else {
    Write-Host "Fichier $sqlFile non trouve!" -ForegroundColor Red
}

Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Copiez le script SQL ci-dessus" -ForegroundColor White
Write-Host "2. Allez dans Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "3. Collez et executez le script" -ForegroundColor White
Write-Host "4. Redemarrez l'application Docker" -ForegroundColor White
