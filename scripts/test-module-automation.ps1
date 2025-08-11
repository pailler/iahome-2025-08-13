# Script de test pour vérifier l'automatisation des modules
# Ce script teste l'API de génération de token webhook

Write-Host "🧪 Test de l'automatisation des modules - IAHome" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configuration
$baseUrl = $env:NEXT_PUBLIC_APP_URL
if (-not $baseUrl) {
    $baseUrl = "http://localhost:3000"
}

Write-Host "🌐 URL de base: $baseUrl" -ForegroundColor Yellow

# Test 1: Vérifier que l'API webhook est accessible
Write-Host "`n🔍 Test 1: Vérification de l'API webhook..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/generate-module-token-webhook" -Method POST -ContentType "application/json" -Body '{"moduleId":"1","userId":"test","paymentId":"test_payment"}' -ErrorAction Stop
    Write-Host "✅ API webhook accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur API webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier que l'API de génération de token est accessible
Write-Host "`n🔍 Test 2: Vérification de l'API de génération de token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/generate-module-token" -Method POST -ContentType "application/json" -Body '{"moduleId":"1","moduleTitle":"Test Module"}' -ErrorAction Stop
    Write-Host "✅ API de génération de token accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur API de génération de token: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier que la page encours est accessible
Write-Host "`n🔍 Test 3: Vérification de la page encours..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/encours" -Method GET -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page encours accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page encours retourne le statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page encours: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier la structure de la base de données
Write-Host "`n🔍 Test 4: Vérification de la structure de la base de données..." -ForegroundColor Yellow

# Vérifier si les variables d'environnement Supabase sont définies
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Variables d'environnement Supabase manquantes" -ForegroundColor Red
} else {
    Write-Host "✅ Variables d'environnement Supabase trouvées" -ForegroundColor Green
    
    # Test de connexion à Supabase
    try {
        $headers = @{
            "apikey" = $supabaseKey
            "Authorization" = "Bearer $supabaseKey"
            "Content-Type" = "application/json"
        }
        
        # Test de la table modules
        $modulesResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/modules?select=count" -Headers $headers -Method GET
        Write-Host "✅ Table modules accessible" -ForegroundColor Green
        
        # Test de la table module_access
        $accessResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/module_access?select=count" -Headers $headers -Method GET
        Write-Host "✅ Table module_access accessible" -ForegroundColor Green
        
        # Test de la table access_tokens
        $tokensResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/access_tokens?select=count" -Headers $headers -Method GET
        Write-Host "✅ Table access_tokens accessible" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Erreur connexion Supabase: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Vérifier les logs d'erreur
Write-Host "`n🔍 Test 5: Vérification des logs..." -ForegroundColor Yellow
$logFiles = @(
    "logs/nginx/error.log",
    "logs/traefik/access.log"
)

foreach ($logFile in $logFiles) {
    if (Test-Path $logFile) {
        $recentErrors = Get-Content $logFile -Tail 10 | Where-Object { $_ -match "error|Error|ERROR" }
        if ($recentErrors) {
            Write-Host "⚠️ Erreurs récentes dans $logFile:" -ForegroundColor Yellow
            $recentErrors | ForEach-Object { Write-Host "  $($_)" -ForegroundColor Gray }
        } else {
            Write-Host "✅ Aucune erreur récente dans $logFile" -ForegroundColor Green
        }
    } else {
        Write-Host "ℹ️ Fichier de log non trouvé: $logFile" -ForegroundColor Gray
    }
}

Write-Host "`n🎯 Recommandations pour tester l'automatisation:" -ForegroundColor Cyan
Write-Host "1. Effectuez un paiement de test avec StableDiffusion" -ForegroundColor White
Write-Host "2. Vérifiez que le webhook Stripe est configuré correctement" -ForegroundColor White
Write-Host "3. Surveillez les logs pour détecter les erreurs" -ForegroundColor White
Write-Host "4. Vérifiez que le module apparaît dans la page /encours" -ForegroundColor White

Write-Host "`n✅ Tests terminés!" -ForegroundColor Green
