# Catégories Multiples - Documentation

## Vue d'ensemble

L'interface IAhome a été mise à jour pour supporter les **catégories multiples** pour chaque module. Cela permet d'attribuer plusieurs catégories à un même module, améliorant ainsi la classification et la recherche.

## Fonctionnalités

### 🎯 Catégories disponibles

- **IA ASSISTANT** - Assistants IA et chatbots
- **IA BUREAUTIQUE** - Outils de bureautique et documents
- **IA PHOTO** - Outils de traitement d'images
- **IA VIDEO** - Outils de traitement vidéo
- **IA MAO** - Outils audio et musique
- **IA PROMPTS** - Templates et prompts
- **IA MARKETING** - Outils marketing et SEO
- **IA DESIGN** - Outils de design et création
- **Web Tools** - Outils web et utilitaires
- **IA FORMATION** - Outils d'apprentissage et formation
- **IA DEVELOPPEMENT** - Outils de développement
- **BUILDING BLOCKS** - Composants réutilisables

### 🔧 Interface utilisateur

#### Page d'accueil (`/`)
- **Filtrage par catégorie** : Les modules apparaissent dans toutes leurs catégories
- **Recherche améliorée** : Recherche dans toutes les catégories d'un module
- **Affichage des badges** : Toutes les catégories sont affichées sur chaque carte

#### Interface d'administration (`/admin/modules`)
- **Gestion des catégories multiples** : Checkboxes pour sélectionner plusieurs catégories
- **Catégorie principale** : Une catégorie principale reste pour la compatibilité
- **Affichage des badges** : Toutes les catégories sont visibles dans la liste

## Migration

### 📋 Étapes de migration

1. **Créer la table `module_categories`**
   ```bash
   node migrate-to-multiple-categories.js
   ```

2. **Ajouter les catégories multiples**
   ```bash
   node add-multiple-categories.js
   ```

3. **Vérifier la migration**
   ```bash
   node verify-migration.js
   ```

### 🚀 Scripts disponibles

- `run-formation-dev-script.bat` - Migration complète (Windows)
- `run-migration-powershell.ps1` - Migration complète (PowerShell)
- `run-verify-migration.bat` - Vérification de la migration

## Structure de la base de données

### Table `module_categories`
```sql
CREATE TABLE module_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, category)
);
```

### Relations
- Un module peut avoir plusieurs catégories
- Une catégorie peut être attribuée à plusieurs modules
- La contrainte UNIQUE empêche les doublons

## Utilisation

### 👤 Pour les utilisateurs

1. **Recherche** : Tapez le nom d'une catégorie dans la barre de recherche
2. **Filtrage** : Utilisez le filtre "Catégorie" dans la sidebar
3. **Navigation** : Les modules apparaissent dans toutes leurs catégories

### 👨‍💼 Pour les administrateurs

1. **Ajouter un module** :
   - Sélectionnez une catégorie principale
   - Cochez toutes les catégories applicables
   - Sauvegardez

2. **Modifier un module** :
   - Les catégories existantes sont pré-cochées
   - Ajoutez/supprimez des catégories selon besoin
   - Sauvegardez

3. **Gestion des catégories** :
   - Toutes les catégories sont visibles dans la liste
   - Les badges montrent toutes les catégories d'un module

## Avantages

### 🎯 Amélioration de la classification
- Modules plus précisément classés
- Recherche plus efficace
- Découverte de modules facilitée

### 🔍 Recherche améliorée
- Recherche dans toutes les catégories
- Filtrage plus flexible
- Navigation intuitive

### 📊 Statistiques enrichies
- Analyse par catégorie
- Métriques d'utilisation
- Insights sur les préférences

## Maintenance

### 🔄 Mise à jour des catégories

Pour ajouter de nouvelles catégories :

1. Modifiez le script `add-multiple-categories.js`
2. Ajoutez les nouvelles règles de catégorisation
3. Exécutez le script de migration
4. Mettez à jour l'interface utilisateur

### 🧹 Nettoyage

Pour supprimer des catégories obsolètes :

1. Identifiez les catégories à supprimer
2. Supprimez les entrées de `module_categories`
3. Mettez à jour l'interface utilisateur

## Support

### 🐛 Dépannage

**Problème** : Les catégories ne s'affichent pas
- Vérifiez que la table `module_categories` existe
- Exécutez `verify-migration.js`

**Problème** : Erreur lors de la sauvegarde
- Vérifiez les contraintes UNIQUE
- Assurez-vous que les catégories sont valides

**Problème** : Performance lente
- Vérifiez les index sur `module_categories`
- Optimisez les requêtes si nécessaire

### 📞 Contact

Pour toute question ou problème :
- Consultez les logs de migration
- Vérifiez la structure de la base de données
- Testez avec `verify-migration.js`

---

**Version** : 1.0  
**Date** : Décembre 2024  
**Auteur** : Équipe IAhome 