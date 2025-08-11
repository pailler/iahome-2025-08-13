# Script simple pour corriger l'automatisation des modules via API Supabase

Write-Host "🔧 Correction de l'automatisation des modules - IAHome" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Vérifier les variables d'environnement
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseKey = $env.SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Erreur: Variables d'environnement Supabase manquantes" -ForegroundColor Red
    Write-Host "Veuillez définir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Variables d'environnement Supabase trouvées" -ForegroundColor Green

# Configuration des headers
$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=minimal"
}

# Test 1: Vérifier que la table modules existe
Write-Host "`n🔍 Test 1: Vérification de la table modules..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/modules?select=count" -Headers $headers -Method GET
    Write-Host "✅ Table modules accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur table modules: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Vérifier si la table module_access existe
Write-Host "`n🔍 Test 2: Vérification de la table module_access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/module_access?select=count" -Headers $headers -Method GET
    Write-Host "✅ Table module_access existe déjà" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Table module_access n'existe pas - création nécessaire" -ForegroundColor Yellow
    Write-Host "⚠️ Veuillez créer la table manuellement dans l'interface Supabase" -ForegroundColor Yellow
    Write-Host "SQL à exécuter:" -ForegroundColor Cyan
    Write-Host "CREATE TABLE IF NOT EXISTS module_access (" -ForegroundColor Gray
    Write-Host "    id SERIAL PRIMARY KEY," -ForegroundColor Gray
    Write-Host "    user_id VARCHAR(255) NOT NULL," -ForegroundColor Gray
    Write-Host "    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE," -ForegroundColor Gray
    Write-Host "    access_type VARCHAR(50) DEFAULT 'purchase'," -ForegroundColor Gray
    Write-Host "    token_id VARCHAR(255)," -ForegroundColor Gray
    Write-Host "    expires_at TIMESTAMP," -ForegroundColor Gray
    Write-Host "    is_active BOOLEAN DEFAULT true," -ForegroundColor Gray
    Write-Host "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," -ForegroundColor Gray
    Write-Host "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," -ForegroundColor Gray
    Write-Host "    metadata JSONB DEFAULT '{}'::jsonb" -ForegroundColor Gray
    Write-Host ");" -ForegroundColor Gray
}

# Test 3: Vérifier la table access_tokens
Write-Host "`n🔍 Test 3: Vérification de la table access_tokens..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/access_tokens?select=count" -Headers $headers -Method GET
    Write-Host "✅ Table access_tokens accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur table access_tokens: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Créer des accès modules pour les tokens existants
Write-Host "`n🔍 Test 4: Création d'accès modules pour les tokens existants..." -ForegroundColor Yellow

# Récupérer les tokens existants
try {
    $tokens = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/access_tokens?select=id,module_id,created_by,expires_at,is_active&is_active=eq.true" -Headers $headers -Method GET
    
    if ($tokens.Count -gt 0) {
        Write-Host "📋 $($tokens.Count) tokens actifs trouvés" -ForegroundColor Yellow
        
        foreach ($token in $tokens) {
            # Vérifier si l'accès existe déjà
            try {
                $queryUrl = "$supabaseUrl/rest/v1/module_access?select=id&user_id=eq.$($token.created_by)&module_id=eq.$($token.module_id)&is_active=eq.true"
                $existingAccess = Invoke-RestMethod -Uri $queryUrl -Headers $headers -Method GET
                
                if ($existingAccess.Count -eq 0) {
                    # Créer l'accès module
                    $accessData = @{
                        user_id = $token.created_by
                        module_id = $token.module_id
                        access_type = "token"
                        token_id = $token.id
                        expires_at = $token.expires_at
                        is_active = $token.is_active
                        metadata = @{
                            token_id = $token.id
                            created_from_token = $true
                        } | ConvertTo-Json
                    }
                    
                    $accessBody = $accessData | ConvertTo-Json
                    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/module_access" -Headers $headers -Method POST -Body $accessBody
                    Write-Host "✅ Accès créé pour token $($token.id)" -ForegroundColor Green
                } else {
                    Write-Host "ℹ️ Accès déjà existant pour token $($token.id)" -ForegroundColor Gray
                }
            } catch {
                Write-Host "⚠️ Erreur lors de la création de l'accès pour token $($token.id): $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "ℹ️ Aucun token actif trouvé" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors de la récupération des tokens: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Vérifier les accès modules créés
Write-Host "`n🔍 Test 5: Vérification des accès modules..." -ForegroundColor Yellow
try {
    $accesses = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/module_access?select=count&is_active=eq.true" -Headers $headers -Method GET
    Write-Host "✅ $($accesses[0].count) accès modules actifs trouvés" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la vérification des accès: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Correction terminée!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant tester l'ajout automatique de modules après paiement." -ForegroundColor Cyan
Write-Host "Redémarrez votre application si nécessaire." -ForegroundColor Yellow
