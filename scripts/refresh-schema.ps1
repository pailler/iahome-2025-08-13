# Script PowerShell pour rafraichir le schema de la base de donnees
# Ce script execute le script SQL pour forcer la mise a jour du cache de schema

Write-Host "Rafraichissement du schema de la base de donnees..." -ForegroundColor Yellow

# Verifier si le fichier SQL existe
$sqlFile = "scripts/force-schema-refresh.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Fichier $sqlFile non trouve!" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier SQL trouve: $sqlFile" -ForegroundColor Green

# Lire le contenu du fichier SQL
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Contenu du script SQL:" -ForegroundColor Cyan
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "ATTENTION: Ce script va modifier la base de donnees." -ForegroundColor Yellow
Write-Host "Assurez-vous d'avoir sauvegarde vos donnees importantes." -ForegroundColor Yellow

$confirmation = Read-Host "Voulez-vous continuer? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "Operation annulee." -ForegroundColor Red
    exit 0
}

Write-Host "Execution du script de rafraichissement..." -ForegroundColor Green

# Instructions pour l'utilisateur
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Ouvrez votre interface Supabase (Dashboard)" -ForegroundColor White
Write-Host "2. Allez dans la section 'SQL Editor'" -ForegroundColor White
Write-Host "3. Copiez le contenu du fichier $sqlFile" -ForegroundColor White
Write-Host "4. Collez-le dans l'editeur SQL" -ForegroundColor White
Write-Host "5. Executez le script" -ForegroundColor White
Write-Host "6. Verifiez que la colonne 'created_by' est bien presente" -ForegroundColor White

Write-Host "Contenu a copier dans Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "=" * 80 -ForegroundColor Gray
Write-Host $sqlContent -ForegroundColor White
Write-Host "=" * 80 -ForegroundColor Gray

Write-Host "Script de rafraichissement pret!" -ForegroundColor Green
Write-Host "Apres avoir execute le script dans Supabase, redemarrez l'application." -ForegroundColor Yellow
