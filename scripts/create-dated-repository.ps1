# Script pour créer un repository Git daté de ce jour
# Usage: .\scripts\create-dated-repository.ps1

Write-Host "Creation d'un repository Git daté de ce jour" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

# Obtenir la date d'aujourd'hui au format YYYY-MM-DD
$today = Get-Date -Format "yyyy-MM-dd"
$repositoryName = "iahome-$today"
$parentDir = Split-Path -Parent (Get-Location)
$newProjectPath = Join-Path $parentDir $repositoryName

Write-Host "Date d'aujourd'hui: $today" -ForegroundColor Cyan
Write-Host "Nom du repository: $repositoryName" -ForegroundColor Cyan
Write-Host "Chemin du nouveau projet: $newProjectPath" -ForegroundColor Cyan

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "Git detecte: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git n'est pas installe ou n'est pas dans le PATH!" -ForegroundColor Red
    Write-Host "Veuillez installer Git depuis: https://git-scm.com/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le dossier de destination existe déjà
if (Test-Path $newProjectPath) {
    Write-Host "Le dossier $newProjectPath existe deja!" -ForegroundColor Red
    Write-Host "Voulez-vous le supprimer et recommencer? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item -Path $newProjectPath -Recurse -Force
        Write-Host "Dossier supprime" -ForegroundColor Green
    } else {
        Write-Host "Operation annulee" -ForegroundColor Red
        exit 0
    }
}

# Créer le nouveau dossier
Write-Host "Creation du dossier $newProjectPath..." -ForegroundColor Green
New-Item -ItemType Directory -Path $newProjectPath -Force | Out-Null

# Copier tous les fichiers du projet actuel vers le nouveau dossier
Write-Host "Copie des fichiers du projet..." -ForegroundColor Green
$excludeItems = @(
    ".git",
    "node_modules",
    ".next",
    "logs",
    "uploads",
    "downloads",
    "metube-downloads",
    "backups",
    "ssl",
    "*.log",
    "*.tmp",
    "*.temp"
)

# Créer une liste d'exclusions pour robocopy
$excludeParams = @()
foreach ($item in $excludeItems) {
    if (Test-Path (Join-Path (Get-Location) $item) -PathType Container) {
        $excludeParams += "/XD"
    } else {
        $excludeParams += "/XF"
    }
    $excludeParams += $item
}

# Utiliser robocopy pour copier les fichiers
robocopy (Get-Location) $newProjectPath /E /NFL /NDL /NJH /NJS /nc /ns /np $excludeParams

if ($LASTEXITCODE -le 7) {
    Write-Host "Copie des fichiers terminee avec succes" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de la copie des fichiers" -ForegroundColor Red
    exit 1
}

# Aller dans le nouveau dossier
Set-Location $newProjectPath
Write-Host "Changement vers le dossier: $newProjectPath" -ForegroundColor Green

# Initialiser un nouveau repository Git
Write-Host "Initialisation d'un nouveau repository Git..." -ForegroundColor Green
git init

# Créer un fichier .gitignore si il n'existe pas
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creation du fichier .gitignore..." -ForegroundColor Green
    @"
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
.next/
out/
dist/
build/

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Docker
docker-compose.override.yml

# SSL certificates
ssl/
*.pem
*.key
*.crt

# Uploads and downloads
uploads/
downloads/
metube-downloads/

# Backups
backups/

# Database
*.db
*.sqlite

# Temporary files
*.tmp
*.temp
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host "Fichier .gitignore cree" -ForegroundColor Green
}

# Créer un fichier README.md avec la date
if (-not (Test-Path "README.md")) {
    Write-Host "Creation du fichier README.md..." -ForegroundColor Green
    @"
# IAHome - Repository du $today

## Description
Repository principal du projet IAHome, version datée du $today.

## Structure du projet
- \`src/\` - Code source de l'application Next.js
- \`public/\` - Fichiers statiques
- \`scripts/\` - Scripts utilitaires
- \`nginx/\` - Configuration Nginx
- \`docker-compose.*.yml\` - Configurations Docker
- \`traefik/\` - Configuration Traefik

## Installation et démarrage

### Prérequis
- Docker et Docker Compose
- Node.js 18+
- Git

### Démarrage rapide
\`\`\`bash
# Cloner le repository
git clone <repository-url>
cd $repositoryName

# Installer les dépendances
npm install

# Démarrer avec Docker
docker-compose -f docker-compose.local.yml up -d
\`\`\`

## Configuration
1. Copier \`.env.example\` vers \`.env\`
2. Configurer les variables d'environnement
3. Démarrer les services

## Services inclus
- Application Next.js principale
- Base de données PostgreSQL
- Nginx (reverse proxy)
- Traefik (load balancer)
- Reactive Resume (CV builder)
- MeTube (téléchargement vidéo)

## Développement
\`\`\`bash
# Mode développement
npm run dev

# Build de production
npm run build

# Tests
npm run test
\`\`\`

## Licence
Propriétaire - Tous droits réservés

---
*Repository créé le $today*
"@ | Out-File -FilePath "README.md" -Encoding UTF8
    Write-Host "Fichier README.md cree" -ForegroundColor Green
}

# Ajouter tous les fichiers au staging
Write-Host "Ajout des fichiers au staging..." -ForegroundColor Green
git add .

# Faire le premier commit
Write-Host "Creation du premier commit..." -ForegroundColor Green
git commit -m "Initial commit - Repository IAHome du $today

- Structure de base du projet
- Configuration Docker et Nginx
- Application Next.js
- Scripts utilitaires
- Documentation initiale"

# Afficher le statut
Write-Host "`nStatut du repository:" -ForegroundColor Cyan
git status

Write-Host "`nRepository Git initialise avec succes!" -ForegroundColor Green
Write-Host "Date du repository: $today" -ForegroundColor Cyan
Write-Host "Nom du repository: $repositoryName" -ForegroundColor Cyan
Write-Host "Chemin du projet: $newProjectPath" -ForegroundColor Cyan

Write-Host "`nProchaines etapes:" -ForegroundColor Yellow
Write-Host "1. Creer un repository sur GitHub/GitLab avec le nom: $repositoryName" -ForegroundColor White
Write-Host "2. Ajouter le remote: git remote add origin <repository-url>" -ForegroundColor White
Write-Host "3. Pousser le code: git push -u origin main" -ForegroundColor White

Write-Host "`nPour ouvrir le projet dans VS Code:" -ForegroundColor Yellow
Write-Host "code $newProjectPath" -ForegroundColor White

Write-Host "=" * 60 -ForegroundColor Gray
