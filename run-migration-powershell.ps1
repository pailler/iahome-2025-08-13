# Script PowerShell pour exécuter la migration des catégories multiples
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration vers les categories multiples" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Node.js est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier que les variables d'environnement sont présentes
if (-not (Test-Path ".env")) {
    Write-Host "❌ Fichier .env manquant" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier .env trouvé" -ForegroundColor Green

# Étape 1: Créer la table module_categories
Write-Host ""
Write-Host "1. Création de la table module_categories..." -ForegroundColor Yellow
try {
    node migrate-to-multiple-categories.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Table module_categories créée avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la création de la table" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du script de migration" -ForegroundColor Red
    exit 1
}

# Étape 2: Ajouter les catégories multiples
Write-Host ""
Write-Host "2. Ajout des categories multiples..." -ForegroundColor Yellow
try {
    node add-multiple-categories.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Catégories multiples ajoutées avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'ajout des catégories" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du script d'ajout" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration terminee avec succes !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Les modules peuvent maintenant avoir plusieurs catégories" -ForegroundColor Yellow
Write-Host "🚀 L'interface a été mise à jour pour supporter les catégories multiples" -ForegroundColor Yellow

Read-Host "Appuyez sur Entrée pour continuer..." 