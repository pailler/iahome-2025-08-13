# Script pour vérifier la structure de la table modules
Write-Host "Verification de la structure de la table modules..." -ForegroundColor Green

Write-Host "`nScript SQL a executer dans Supabase:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Get-Content "check-modules-structure.sql" | ForEach-Object { Write-Host $_ -ForegroundColor White }
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "`nInstructions:" -ForegroundColor Yellow
Write-Host "1. Allez dans votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Ouvrez l'editeur SQL" -ForegroundColor White
Write-Host "3. Copiez-collez le script ci-dessus" -ForegroundColor White
Write-Host "4. Executez le script pour voir la structure de la table" -ForegroundColor White

Write-Host "`nCe script va vous montrer:" -ForegroundColor Yellow
Write-Host "- Les colonnes exactes de la table modules" -ForegroundColor White
Write-Host "- Les contraintes de la table" -ForegroundColor White
Write-Host "- Quelques exemples de modules existants" -ForegroundColor White
Write-Host "- Les modules contenant 'metube' ou 'tube'" -ForegroundColor White
