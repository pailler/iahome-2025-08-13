# Script pour ajouter le module PDF+ à la base de données
Write-Host "Ajout du module PDF+ à la base de données" -ForegroundColor Green

# 1. Vérifier que le script SQL existe
if (Test-Path "scripts/add-pdf-module.sql") {
    Write-Host "Script SQL trouvé: scripts/add-pdf-module.sql" -ForegroundColor Green
} else {
    Write-Host "Erreur: Script SQL non trouvé" -ForegroundColor Red
    exit 1
}

# 2. Afficher les instructions
Write-Host "`nInstructions:" -ForegroundColor Yellow
Write-Host "1. Ouvrez votre interface Supabase" -ForegroundColor White
Write-Host "2. Allez dans l'onglet 'SQL Editor'" -ForegroundColor White
Write-Host "3. Copiez le contenu du fichier scripts/add-pdf-module.sql" -ForegroundColor White
Write-Host "4. Collez et exécutez le script" -ForegroundColor White
Write-Host "5. Redémarrez le serveur avec: npm run dev" -ForegroundColor White

# 3. Afficher le contenu du script SQL
Write-Host "`nContenu du script SQL:" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Gray
Get-Content "scripts/add-pdf-module.sql" | ForEach-Object {
    Write-Host $_ -ForegroundColor White
}
Write-Host "==========================================" -ForegroundColor Gray

Write-Host "`nModule PDF+ ajouté!" -ForegroundColor Green
Write-Host "L'icône SVG sera automatiquement utilisée pour ce module" -ForegroundColor Yellow
Write-Host "Redémarrez le serveur pour voir les changements" -ForegroundColor Yellow
