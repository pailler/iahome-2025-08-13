Write-Host "=== Vérification des contraintes de la table modules ===" -ForegroundColor Green
Write-Host ""
Write-Host "Exécutez ce script SQL dans votre dashboard Supabase :" -ForegroundColor Yellow
Write-Host ""
Get-Content "check-modules-constraints.sql" | Write-Host
Write-Host ""
Write-Host "Cela nous permettra de voir :" -ForegroundColor Cyan
Write-Host "- La structure exacte de la table" -ForegroundColor White
Write-Host "- Les contraintes existantes" -ForegroundColor White
Write-Host "- Les index" -ForegroundColor White
Write-Host "- La clé primaire" -ForegroundColor White
Write-Host ""
Write-Host "Une fois que nous aurons ces informations, nous pourrons créer le bon script de correction." -ForegroundColor Yellow


















