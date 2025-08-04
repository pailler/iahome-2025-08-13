Write-Host "=== Sauvegarde Git - 5 aout 2025 ===" -ForegroundColor Green
Write-Host ""

Write-Host "1. Vérification du statut git..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2. Ajout de tous les fichiers..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3. Commit avec le message 'Sauvegarde : 5 aout 2025'..." -ForegroundColor Yellow
git commit -m "Sauvegarde : 5 aout 2025"

Write-Host ""
Write-Host "4. Vérification du commit..." -ForegroundColor Yellow
git log --oneline -3

Write-Host ""
Write-Host "=== Sauvegarde terminée ===" -ForegroundColor Green
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 