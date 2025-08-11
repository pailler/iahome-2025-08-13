# Script pour extraire les certificats SSL depuis acme.json
Write-Host "🔍 Extraction des certificats SSL depuis acme.json..." -ForegroundColor Green

# Vérifier si le fichier acme.json existe
$acmePath = "traefik\letsencrypt\acme.json"
if (-not (Test-Path $acmePath)) {
    Write-Host "❌ Fichier $acmePath non trouvé!" -ForegroundColor Red
    exit 1
}

# Créer le dossier de sortie
$outputDir = "certificates"
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "📁 Dossier $outputDir créé" -ForegroundColor Yellow
}

# Lire le fichier acme.json
try {
    $acmeData = Get-Content $acmePath | ConvertFrom-Json
    Write-Host "✅ Fichier acme.json lu avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la lecture du fichier acme.json: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérifier s'il y a des certificats
if (-not $acmeData.letsencrypt.Certificates) {
    Write-Host "⚠️  Aucun certificat trouvé dans acme.json" -ForegroundColor Yellow
    Write-Host "   Cela peut être dû à:" -ForegroundColor Yellow
    Write-Host "   - Le conflit avec votre NAS sur le port 80" -ForegroundColor Yellow
    Write-Host "   - Les certificats n'ont pas encore été générés" -ForegroundColor Yellow
    Write-Host "   - Erreur lors de la validation Let's Encrypt" -ForegroundColor Yellow
    Write-Host "`n💡 Solution recommandée:" -ForegroundColor Cyan
    Write-Host "1. Configurez le reverse proxy de votre NAS pour rediriger iahome.fr vers le port 3000" -ForegroundColor White
    Write-Host "2. Votre NAS peut gérer les certificats SSL automatiquement" -ForegroundColor White
    exit 1
}

Write-Host "🎉 Certificats trouvés! Extraction en cours..." -ForegroundColor Green 