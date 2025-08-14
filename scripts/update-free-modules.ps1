# Script pour mettre à jour les modules gratuits
Write-Host "Mise à jour des modules gratuits" -ForegroundColor Green

# 1. Vérifier que le script SQL existe
if (Test-Path "scripts/update-free-modules.sql") {
    Write-Host "Script SQL trouve: scripts/update-free-modules.sql" -ForegroundColor Green
} else {
    Write-Host "Erreur: Script SQL non trouve" -ForegroundColor Red
    exit 1
}

# 2. Afficher les instructions
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Ouvrez votre interface Supabase" -ForegroundColor White
Write-Host "2. Allez dans l'onglet 'SQL Editor'" -ForegroundColor White
Write-Host "3. Copiez le contenu du fichier scripts/update-free-modules.sql" -ForegroundColor White
Write-Host "4. Collez et executez le script" -ForegroundColor White
Write-Host "5. Redemarrez le serveur avec: npm run dev" -ForegroundColor White

# 3. Afficher le contenu du script SQL
Write-Host "`nContenu du script SQL:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Get-Content "scripts/update-free-modules.sql" | ForEach-Object {
    Write-Host $_ -ForegroundColor White
}
Write-Host "==========================================" -ForegroundColor Gray

Write-Host "`nMise à jour terminee!" -ForegroundColor Green
Write-Host "Redemarrez le serveur pour voir les changements" -ForegroundColor Yellow
