# Guide du Formulaire de Gestion des Modules

## Vue d'ensemble

Le formulaire de gestion des modules permet d'ajouter, modifier et gérer les modules disponibles dans l'application. Il est accessible depuis la page d'administration (`/admin/modules`).

## Fonctionnalités

### 1. Chargement des données existantes

✅ **Fonctionnalité implémentée** : Le formulaire charge automatiquement toutes les données existantes depuis la base de données Supabase.

- **Champs récupérés** :
  - `id` : Identifiant unique du module
  - `title` : Titre du module
  - `subtitle` : Sous-titre optionnel
  - `description` : Description détaillée
  - `category` : Catégorie du module
  - `price` : Prix en euros
  - `youtube_url` : URL YouTube optionnelle
  - `created_at` : Date de création
  - `updated_at` : Date de dernière modification

### 2. Interface utilisateur

#### Page principale (`/admin/modules`)
- **Liste des modules** : Affichage en grille avec cartes pour chaque module
- **Indicateurs visuels** :
  - Spinner de chargement pendant la récupération des données
  - Message de succès avec le nombre de modules chargés
  - Badges de catégorie colorés
  - Affichage du prix et du sous-titre

#### Modal d'édition/ajout
- **Champs du formulaire** :
  - Titre du module (obligatoire)
  - Sous-titre (optionnel)
  - Description (obligatoire)
  - Catégorie (sélection dans une liste)
  - Prix en euros (obligatoire)
  - URL YouTube (optionnelle)

- **Indicateurs de données** :
  - Affichage de l'ID du module en cours d'édition
  - Indicateur "Données chargées ✅"
  - Indicateur "Sous-titre existant chargé ✅" si applicable
  - Valeurs actuelles affichées sous chaque champ

### 3. Actions disponibles

#### Pour chaque module :
- **Gérer** : Ouvre le modal d'édition avec toutes les données pré-remplies
- **Modifier** : Ouvre le modal d'édition avec toutes les données pré-remplies
- **Supprimer** : Supprime le module après confirmation

#### Bouton "Ajouter un module" :
- Ouvre le modal avec un formulaire vide pour créer un nouveau module

## Utilisation

### 1. Accéder au formulaire
1. Connectez-vous en tant qu'administrateur
2. Allez sur `/admin/modules`
3. Attendez le chargement des données existantes

### 2. Modifier un module existant
1. Cliquez sur le bouton "Gérer" ou "Modifier" d'un module
2. Le modal s'ouvre avec toutes les données pré-remplies
3. Modifiez les champs souhaités
4. Cliquez sur "Sauvegarder la configuration" ou "Modifier le module"

### 3. Ajouter un nouveau module
1. Cliquez sur "Ajouter un module"
2. Remplissez tous les champs obligatoires
3. Cliquez sur "Créer le module"

### 4. Supprimer un module
1. Cliquez sur le bouton "Supprimer" d'un module
2. Confirmez la suppression dans la boîte de dialogue

## Dépannage

### Problèmes courants

#### 1. Les données ne se chargent pas
- Vérifiez la connexion à Supabase
- Consultez la console du navigateur pour les erreurs
- Vérifiez que vous avez les droits d'administrateur

#### 2. Le formulaire est vide lors de l'édition
- Les données sont automatiquement chargées
- Vérifiez que le module existe dans la base de données
- Consultez les logs dans la console

#### 3. Erreur lors de la sauvegarde
- Vérifiez que tous les champs obligatoires sont remplis
- Consultez les messages d'erreur dans la console
- Vérifiez les permissions de la base de données

### Scripts de test

#### Vérifier les données existantes
```sql
-- Exécuter check-modules-data.sql
```

#### Ajouter des données de test
```sql
-- Exécuter add-test-modules-data.sql
```

#### Tester la récupération des données
```bash
node test-modules-data.js
```

## Structure de la base de données

### Table `modules`
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  youtube_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Catégories disponibles
- `BUILDING BLOCKS`
- `IA ASSISTANT`
- `IA BUREAUTIQUE`
- `IA PHOTO`
- `IA VIDEO`
- `IA MAO`
- `IA PROMPTS`
- `IA MARKETING`
- `IA DESIGN`

## Améliorations futures

- [ ] Validation côté client des champs
- [ ] Prévisualisation des images/thumbnails
- [ ] Gestion des fichiers (upload d'images)
- [ ] Historique des modifications
- [ ] Recherche et filtrage des modules
- [ ] Export/import des données
- [ ] Gestion des versions de modules 