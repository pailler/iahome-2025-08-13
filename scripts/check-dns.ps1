# Script de verification DNS pour iahome.fr
# Usage: .\scripts\check-dns.ps1

param(
    [string]$Domain = "iahome.fr"
)

Write-Host "Verification DNS pour $Domain" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

# Fonction pour afficher les resultats
function Write-Result {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "OK" { Write-Host "OK: $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "WARNING: $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "ERROR: $Message" -ForegroundColor Red }
    }
}

# 1. Verifier l'IP publique actuelle
Write-Host "`n1. IP publique actuelle:" -ForegroundColor Blue
try {
    $publicIP = (Invoke-WebRequest -Uri "https://ipinfo.io/ip" -UseBasicParsing).Content.Trim()
    Write-Result "OK" "IP publique: $publicIP"
} catch {
    Write-Result "ERROR" "Impossible de recuperer l'IP publique"
    exit 1
}

# 2. Verifier la resolution DNS du domaine principal
Write-Host "`n2. Resolution DNS du domaine principal:" -ForegroundColor Blue
try {
    $dnsResult = [System.Net.Dns]::GetHostAddresses($Domain)
    if ($dnsResult) {
        $resolvedIP = $dnsResult[0].IPAddressToString
        Write-Result "OK" "Domaine $Domain resolu vers: $resolvedIP"
        
        if ($resolvedIP -eq $publicIP) {
            Write-Result "OK" "DNS correctement configure"
        } else {
            Write-Result "WARNING" "IP resolue ($resolvedIP) differente de l'IP publique ($publicIP)"
        }
    } else {
        Write-Result "ERROR" "Impossible de resoudre $Domain"
    }
} catch {
    Write-Result "ERROR" "Erreur lors de la resolution DNS: $($_.Exception.Message)"
}

# 3. Verifier la resolution DNS du sous-domaine www
Write-Host "`n3. Resolution DNS du sous-domaine www:" -ForegroundColor Blue
try {
    $wwwDomain = "www.$Domain"
    $wwwDnsResult = [System.Net.Dns]::GetHostAddresses($wwwDomain)
    if ($wwwDnsResult) {
        $wwwResolvedIP = $wwwDnsResult[0].IPAddressToString
        Write-Result "OK" "Sous-domaine $wwwDomain resolu vers: $wwwResolvedIP"
        
        if ($wwwResolvedIP -eq $publicIP) {
            Write-Result "OK" "DNS www correctement configure"
        } else {
            Write-Result "WARNING" "IP resolue ($wwwResolvedIP) differente de l'IP publique ($publicIP)"
        }
    } else {
        Write-Result "ERROR" "Impossible de resoudre $wwwDomain"
    }
} catch {
    Write-Result "ERROR" "Erreur lors de la resolution DNS www: $($_.Exception.Message)"
}

# 4. Verifier la connectivite HTTP
Write-Host "`n4. Test de connectivite HTTP:" -ForegroundColor Blue
try {
    $httpResponse = Invoke-WebRequest -Uri "http://$Domain" -Method Head -UseBasicParsing -TimeoutSec 10
    Write-Result "OK" "HTTP accessible (Status: $($httpResponse.StatusCode))"
} catch {
    Write-Result "WARNING" "HTTP non accessible: $($_.Exception.Message)"
}

# 5. Verifier la connectivite HTTPS
Write-Host "`n5. Test de connectivite HTTPS:" -ForegroundColor Blue
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://$Domain" -Method Head -UseBasicParsing -TimeoutSec 10
    Write-Result "OK" "HTTPS accessible (Status: $($httpsResponse.StatusCode))"
} catch {
    Write-Result "WARNING" "HTTPS non accessible: $($_.Exception.Message)"
}

# 6. Verifier les enregistrements DNS avec nslookup
Write-Host "`n6. Enregistrements DNS detailles:" -ForegroundColor Blue
try {
    $nslookupResult = nslookup $Domain 2>&1
    Write-Host $nslookupResult -ForegroundColor Gray
} catch {
    Write-Result "WARNING" "Impossible d'executer nslookup"
}

Write-Host "`n=============================" -ForegroundColor Blue
Write-Host "Verification DNS terminee !" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue

# Instructions pour la configuration
Write-Host "`nInstructions de configuration DNS:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous a votre registrar (OVH, Namecheap, etc.)" -ForegroundColor White
Write-Host "2. Allez dans la gestion DNS du domaine $Domain" -ForegroundColor White
Write-Host "3. Ajoutez/modifiez les enregistrements suivants:" -ForegroundColor White
Write-Host "   - Type: A, Nom: @, Valeur: $publicIP" -ForegroundColor White
Write-Host "   - Type: A, Nom: www, Valeur: $publicIP" -ForegroundColor White
Write-Host "4. Attendez 5-15 minutes pour la propagation" -ForegroundColor White
Write-Host "5. Relancez ce script pour verifier" -ForegroundColor White

Write-Host "`nRegistrars populaires:" -ForegroundColor Blue
Write-Host "- OVH: https://www.ovh.com/manager/web/#/domain/zone/$Domain" -ForegroundColor White
Write-Host "- Namecheap: https://ap.www.namecheap.com/Domains/DomainControlPanel/$Domain/advancedns" -ForegroundColor White
Write-Host "- GoDaddy: https://dcc.godaddy.com/manage/$Domain/dns" -ForegroundColor White










