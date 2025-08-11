# Script PowerShell pour corriger l'automatisation des modules
# Ce script exécute les scripts SQL nécessaires pour créer la table module_access manquante

Write-Host "🔧 Correction de l'automatisation des modules - IAHome" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Vérifier si les variables d'environnement sont définies
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Erreur: Variables d'environnement Supabase manquantes" -ForegroundColor Red
    Write-Host "Veuillez définir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Variables d'environnement Supabase trouvées" -ForegroundColor Green

# Chemin vers les scripts SQL
$createTableScript = Join-Path $PSScriptRoot "create-module-access-table.sql"
$fixDataScript = Join-Path $PSScriptRoot "fix-module-access-data.sql"

# Vérifier que les scripts existent
if (-not (Test-Path $createTableScript)) {
    Write-Host "❌ Erreur: Script create-module-access-table.sql non trouvé" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $fixDataScript)) {
    Write-Host "❌ Erreur: Script fix-module-access-data.sql non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Scripts SQL trouvés" -ForegroundColor Green

# Installer psql si nécessaire (pour Windows)
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "⚠️ psql non trouvé. Tentative d'installation via Chocolatey..." -ForegroundColor Yellow
    
    # Vérifier si Chocolatey est installé
    $chocoPath = Get-Command choco -ErrorAction SilentlyContinue
    if (-not $chocoPath) {
        Write-Host "❌ Chocolatey non installé. Veuillez installer PostgreSQL manuellement" -ForegroundColor Red
        Write-Host "Ou installer Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "📦 Installation de PostgreSQL via Chocolatey..." -ForegroundColor Yellow
    choco install postgresql -y
    RefreshEnvironmentVariables
}

# Extraire les informations de connexion depuis l'URL Supabase
$connectionString = $supabaseUrl -replace "https://", ""
$connectionString = $connectionString -replace "\.supabase\.co", ".supabase.co:5432"
$connectionString = "postgresql://postgres:$supabaseKey@$connectionString/postgres"

Write-Host "🔗 Connexion à Supabase..." -ForegroundColor Yellow

# Exécuter le script de création de table
Write-Host "📋 Création de la table module_access..." -ForegroundColor Yellow
try {
    $createResult = & psql $connectionString -f $createTableScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Table module_access créée avec succès" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Erreur lors de la création de la table (peut déjà exister):" -ForegroundColor Yellow
        Write-Host $createResult -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du script de création:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Exécuter le script de correction des données
Write-Host "🔧 Correction des données existantes..." -ForegroundColor Yellow
try {
    $fixResult = & psql $connectionString -f $fixDataScript 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Données corrigées avec succès" -ForegroundColor Green
        Write-Host $fixResult -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Erreur lors de la correction des données:" -ForegroundColor Yellow
        Write-Host $fixResult -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du script de correction:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎉 Correction terminée!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant tester l'ajout automatique de modules après paiement." -ForegroundColor Cyan
Write-Host "Redémarrez votre application si nécessaire." -ForegroundColor Yellow








