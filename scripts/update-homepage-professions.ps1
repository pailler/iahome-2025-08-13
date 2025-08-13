# Script pour modifier la page d'accueil et remplacer le filtre par niveau d'expérience par un filtre par métiers traditionnels
# Usage: .\scripts\update-homepage-professions.ps1

Write-Host "Modification de la page d'accueil pour les métiers traditionnels" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

$pageFile = "src/app/page.tsx"
$backupFile = "src/app/page.tsx.backup"

# Créer une sauvegarde
if (Test-Path $pageFile) {
    Copy-Item $pageFile $backupFile
    Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier $pageFile non trouvé!" -ForegroundColor Red
    exit 1
}

# Lire le contenu du fichier
$content = Get-Content $pageFile -Raw

# Remplacer experienceFilter par professionFilter
$content = $content -replace 'const \[experienceFilter, setExperienceFilter\] = useState\(''all''\);', 'const [professionFilter, setProfessionFilter] = useState(''all''); // CHANGÉ : experienceFilter -> professionFilter'

# Ajouter la fonction getModuleProfession après getRandomRole
$getModuleProfessionFunction = @'

  // Fonction pour attribuer une profession selon le nom du module
  const getModuleProfession = (moduleTitle: string, moduleCategory: string) => {
    const title = moduleTitle.toLowerCase();
    const category = moduleCategory.toLowerCase();

    // Photographes
    if (title.includes(''photo'') || title.includes(''image'') || title.includes(''camera'') || 
        title.includes(''photoshop'') || title.includes(''lightroom'') || title.includes(''canon'') ||
        title.includes(''nikon'') || title.includes(''sony'') || category.includes(''photo'')) {
      return ''Photographe'';
    }

    // Rédacteurs & Journalistes
    if (title.includes(''chatgpt'') || title.includes(''rédaction'') || title.includes(''texte'') ||
        title.includes(''word'') || title.includes(''notion'') || title.includes(''écriture'') ||
        title.includes(''article'') || title.includes(''blog'') || category.includes(''assistant'')) {
      return ''Rédacteur'';
    }

    // Architectes & Designers d''intérieur
    if (title.includes(''autocad'') || title.includes(''sketchup'') || title.includes(''revit'') ||
        title.includes(''3d'') || title.includes(''blender'') || title.includes(''design'') ||
        title.includes(''architecture'') || title.includes(''maquette'') || category.includes(''design'')) {
      return ''Architecte'';
    }

    // Avocats & Juristes
    if (title.includes(''droit'') || title.includes(''juridique'') || title.includes(''contrat'') ||
        title.includes(''legal'') || title.includes(''avocat'') || title.includes(''justice'') ||
        title.includes(''loi'') || title.includes(''procédure'')) {
      return ''Avocat'';
    }

    // Médecins & Professionnels de santé
    if (title.includes(''médical'') || title.includes(''santé'') || title.includes(''diagnostic'') ||
        title.includes(''radiologie'') || title.includes(''analyse'') || title.includes(''patient'') ||
        title.includes(''clinique'') || title.includes(''hôpital'')) {
      return ''Médecin'';
    }

    // Par défaut, attribuer selon la catégorie
    if (category.includes(''photo'') || category.includes(''image'')) return ''Photographe'';
    if (category.includes(''assistant'') || category.includes(''texte'')) return ''Rédacteur'';
    if (category.includes(''design'') || category.includes(''3d'')) return ''Architecte'';
    if (category.includes(''bureautique'') || category.includes(''document'')) return ''Rédacteur'';
    if (category.includes(''video'') || category.includes(''montage'')) return ''Photographe'';

    // Fallback aléatoire pour les modules non classés
    const professions = [''Photographe'', ''Rédacteur'', ''Architecte'', ''Avocat'', ''Médecin''];
    return professions[Math.floor(Math.random() * professions.length)];
  };

'@

# Remplacer getRandomExperienceLevel par getModuleProfession
$content = $content -replace 'experience_level: getRandomExperienceLevel\(\)', 'profession: getModuleProfession(module.title, primaryCategory) // CHANGÉ : attribution intelligente'

# Remplacer matchesExperience par matchesProfession
$content = $content -replace 'const matchesExperience = experienceFilter === ''all'' \|\| \s+module\.experience_level === experienceFilter;', 'const matchesProfession = professionFilter === ''all'' || module.profession === professionFilter;'

# Remplacer dans le return du filtre
$content = $content -replace 'return matchesSearch && matchesPrice && matchesExperience && matchesCategory;', 'return matchesSearch && matchesPrice && matchesProfession && matchesCategory;'

# Remplacer dans useEffect
$content = $content -replace '}, \[search, priceFilter, experienceFilter, sortBy, categoryFilter\];', '}, [search, priceFilter, professionFilter, sortBy, categoryFilter]; // CHANGÉ : experienceFilter -> professionFilter'

# Remplacer le select d'expérience par le select de profession
$oldSelect = @'
                    <select 
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={experienceFilter}
                      onChange={(e) => setExperienceFilter(e.target.value)}
                    >
                      <option value="all">Tous niveaux d'expérience</option>
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Expert">Expert</option>
                    </select>
'@

$newSelect = @'
                    <select 
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={professionFilter}
                      onChange={(e) => setProfessionFilter(e.target.value)}
                    >
                      <option value="all">Tous les métiers</option>
                      <option value="Photographe">📸 Photographes</option>
                      <option value="Rédacteur">✍️ Rédacteurs & Journalistes</option>
                      <option value="Architecte">🏗️ Architectes & Designers</option>
                      <option value="Avocat">⚖️ Avocats & Juristes</option>
                      <option value="Médecin">🩺 Médecins & Santé</option>
                    </select>
'@

$content = $content -replace [regex]::Escape($oldSelect), $newSelect

# Ajouter la fonction getModuleProfession après getRandomRole
$content = $content -replace 'const getRandomRole = \(\) => \{', "const getRandomRole = () => {`n$getModuleProfessionFunction"

# Écrire le contenu modifié
Set-Content -Path $pageFile -Value $content -Encoding UTF8

Write-Host "✅ Modifications appliquées avec succès!" -ForegroundColor Green
Write-Host "📝 Fichier modifié: $pageFile" -ForegroundColor Cyan
Write-Host "💾 Sauvegarde: $backupFile" -ForegroundColor Cyan

Write-Host "`nRésumé des modifications:" -ForegroundColor Yellow
Write-Host "• experienceFilter -> professionFilter" -ForegroundColor White
Write-Host "• Ajout de la fonction getModuleProfession()" -ForegroundColor White
Write-Host "• Attribution intelligente des métiers aux modules" -ForegroundColor White
Write-Host "• Interface avec emojis pour les métiers" -ForegroundColor White
Write-Host "• 5 métiers traditionnels : Photographes, Rédacteurs, Architectes, Avocats, Médecins" -ForegroundColor White

Write-Host "`nProchaines étapes:" -ForegroundColor Yellow
Write-Host "1. Redémarrer le serveur de développement" -ForegroundColor White
Write-Host "2. Tester les filtres par métier" -ForegroundColor White
Write-Host "3. Vérifier l'attribution automatique des métiers" -ForegroundColor White

Write-Host "=" * 60 -ForegroundColor Gray
