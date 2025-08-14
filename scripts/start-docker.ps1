# Script pour démarrer Docker Desktop et résoudre les problèmes de connexion
Write-Host "Démarrage de Docker Desktop" -ForegroundColor Green

# 1. Vérifier si Docker Desktop est installé
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
    Write-Host "Docker Desktop trouvé: $dockerPath" -ForegroundColor Green
} else {
    Write-Host "Docker Desktop non trouvé dans le chemin par défaut" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop manuellement" -ForegroundColor Yellow
    exit 1
}

# 2. Démarrer Docker Desktop
Write-Host "Démarrage de Docker Desktop..." -ForegroundColor Yellow
Start-Process -FilePath $dockerPath -WindowStyle Minimized

# 3. Attendre que Docker soit prêt
Write-Host "Attente du démarrage de Docker..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

do {
    Start-Sleep 2
    $attempt++
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Host "Docker est prêt!" -ForegroundColor Green
            break
        }
    } catch {
        # Continue d'attendre
    }
    
    Write-Host "Tentative $attempt/$maxAttempts..." -ForegroundColor Cyan
    
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "Timeout: Docker n'a pas démarré dans le délai imparti" -ForegroundColor Red
    Write-Host "Veuillez vérifier Docker Desktop manuellement" -ForegroundColor Yellow
    exit 1
}

# 4. Vérifier les services Docker
Write-Host "`nVérification des services Docker:" -ForegroundColor Yellow
Get-Service -Name "*docker*" | Select-Object Name, Status

# 5. Tester la connexion Docker
Write-Host "`nTest de la connexion Docker:" -ForegroundColor Yellow
try {
    docker ps
    Write-Host "Docker fonctionne correctement!" -ForegroundColor Green
} catch {
    Write-Host "Erreur de connexion Docker: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDocker Desktop est maintenant prêt à utiliser" -ForegroundColor Green
