# Configuration de Git pour PowerShell
Write-Host "Configuration de Git..." -ForegroundColor Green

# Désactiver le pager
git config --global core.pager ""
git config --global core.pager cat

# Configurer l'encodage
git config --global core.quotepath false
git config --global i18n.logoutputencoding utf8
git config --global i18n.commitencoding utf8

# Configurer l'éditeur
git config --global core.editor "notepad"

Write-Host "Configuration terminée!" -ForegroundColor Green

# Test de la configuration
Write-Host "`nTest de git status:" -ForegroundColor Yellow
git status

Write-Host "`nTest de git log (5 derniers commits):" -ForegroundColor Yellow
git log --oneline -5 