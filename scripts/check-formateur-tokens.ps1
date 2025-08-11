# Script PowerShell pour tester les tokens de formateur_tic@hotmail.com
# À exécuter pour vérifier que l'API fonctionne correctement

Write-Host "🔍 Test des tokens de formateur_tic@hotmail.com" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# URL de l'API
$apiUrl = "http://localhost:3000/api/get-user-tokens"

# Données de test
$testData = @{
    userEmail = "formateur_tic@hotmail.com"
} | ConvertTo-Json

Write-Host "📡 Appel de l'API: $apiUrl" -ForegroundColor Yellow
Write-Host "📋 Données envoyées: $testData" -ForegroundColor Yellow

try {
    # Appel de l'API
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $testData -ContentType "application/json"
    
    Write-Host "✅ Réponse reçue avec succès!" -ForegroundColor Green
    Write-Host "📊 Nombre de tokens: $($response.tokens.Count)" -ForegroundColor Green
    
    if ($response.tokens.Count -gt 0) {
        Write-Host "`n📋 Détails des tokens:" -ForegroundColor Cyan
        foreach ($token in $response.tokens) {
            Write-Host "  - ID: $($token.id)" -ForegroundColor White
            Write-Host "    Nom: $($token.name)" -ForegroundColor White
            Write-Host "    Module: $($token.module_name)" -ForegroundColor White
            Write-Host "    Niveau: $($token.access_level)" -ForegroundColor White
            Write-Host "    Usage: $($token.current_usage)/$($token.max_usage)" -ForegroundColor White
            Write-Host "    Actif: $($token.is_active)" -ForegroundColor White
            Write-Host "    Expire: $($token.expires_at)" -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "Aucun token trouvé pour formateur_tic@hotmail.com" -ForegroundColor Yellow
    }
    
    Write-Host "👤 Informations utilisateur:" -ForegroundColor Cyan
    Write-Host "  - ID: $($response.user.id)" -ForegroundColor White
    Write-Host "  - Email: $($response.user.email)" -ForegroundColor White
    
} catch {
    Write-Host "Erreur lors de l'appel API:" -ForegroundColor Red
    Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "  Réponse: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Test de l'API d'ajout après paiement" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Test de l'API d'ajout après paiement
$paymentApiUrl = "http://localhost:3000/api/add-user-tokens-after-payment"
$paymentTestData = @{
    userEmail = "test@example.com"
    paymentSuccess = $true
} | ConvertTo-Json

Write-Host "📡 Appel de l'API de paiement: $paymentApiUrl" -ForegroundColor Yellow
Write-Host "📋 Données envoyées: $paymentTestData" -ForegroundColor Yellow

try {
    $paymentResponse = Invoke-RestMethod -Uri $paymentApiUrl -Method POST -Body $paymentTestData -ContentType "application/json"
    
    Write-Host "✅ Réponse paiement reçue avec succès!" -ForegroundColor Green
    Write-Host "📊 Tokens ajoutés: $($paymentResponse.tokensAdded)" -ForegroundColor Green
    Write-Host "💬 Message: $($paymentResponse.message)" -ForegroundColor Green
    
} catch {
    Write-Host "Erreur lors de l'appel API de paiement:" -ForegroundColor Red
    Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test terminé!" -ForegroundColor Green
