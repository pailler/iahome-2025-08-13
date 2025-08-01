# Guide - Résolution du problème des pages détaillées

## Problème identifié

La page d'administration des pages détaillées (`/admin/pages-detaillees`) ne montre aucun contenu car la table `detail_pages` n'existe pas dans votre base de données Supabase.

## Solution

Vous devez exécuter deux scripts SQL dans votre éditeur SQL Supabase pour créer la table et ajouter les colonnes manquantes.

### Étape 1 : Créer la table detail_pages

1. Connectez-vous à votre dashboard Supabase
2. Allez dans la section "SQL Editor"
3. Créez un nouveau script
4. Copiez et collez le contenu du fichier `create-detail-pages-table.sql`
5. Exécutez le script

Ce script va :
- Créer la table `detail_pages` avec toutes les colonnes nécessaires
- Ajouter des index pour optimiser les performances
- Créer un trigger pour mettre à jour automatiquement `updated_at`
- Insérer 5 pages détaillées d'exemple liées aux cartes existantes
- Configurer les politiques de sécurité (RLS)

### Étape 2 : Corriger la table cartes

1. Dans le même éditeur SQL ou un nouveau script
2. Copiez et collez le contenu du fichier `fix-cartes-table.sql`
3. Exécutez le script

Ce script va :
- Ajouter les colonnes `created_at`, `updated_at` et `created_by` si elles n'existent pas
- Mettre à jour les valeurs pour les cartes existantes
- Créer un trigger pour `updated_at` si nécessaire

### Étape 3 : Redémarrer l'application

Après avoir exécuté les scripts SQL :
1. Arrêtez votre application Next.js (Ctrl+C)
2. Redémarrez-la avec `npm run dev`
3. Testez la page `/admin/pages-detaillees`

## Vérification

Après avoir appliqué les scripts, vous devriez voir :

1. **Dans la page d'administration des pages détaillées** (`/admin/pages-detaillees`) :
   - 5 pages détaillées d'exemple affichées
   - Chaque page avec son titre, contenu, carte associée et statut de publication
   - Boutons pour modifier, supprimer et publier/dépublier

2. **Dans la page d'administration des cartes** (`/admin/cartes`) :
   - Toutes les cartes existantes affichées correctement
   - Pas d'erreurs de colonnes manquantes

## Pages détaillées créées

Les scripts créent automatiquement 5 pages détaillées d'exemple :

1. **Guide complet de l'Assistant IA** - Lié à la carte "AI Assistant"
2. **Tutoriel SDnext - Génération d'images IA** - Lié à la carte "SDnext"
3. **Stable Diffusion - Guide de démarrage** - Lié à la carte "Stable diffusion"
4. **IA Metube - Plateforme de vidéos intelligente** - Lié à la carte "IA metube"
5. **PDF+ - Outil de gestion de documents avancé** - Lié à la carte "PDF+"

## Fonctionnalités disponibles

Une fois les scripts appliqués, vous pourrez :

- ✅ Voir toutes les pages détaillées existantes
- ✅ Créer de nouvelles pages détaillées
- ✅ Modifier les pages existantes
- ✅ Supprimer des pages
- ✅ Publier/dépublier des pages
- ✅ Associer les pages aux cartes existantes
- ✅ Générer automatiquement des slugs SEO-friendly

## En cas de problème

Si vous rencontrez des erreurs :

1. **Vérifiez les logs** dans la console de votre navigateur
2. **Vérifiez les logs** de votre application Next.js
3. **Exécutez le script de diagnostic** : `node diagnostic-detail-pages.js`
4. **Vérifiez dans Supabase** que les tables ont bien été créées

## Structure de la table detail_pages

```sql
CREATE TABLE detail_pages (
    id UUID PRIMARY KEY,
    card_id UUID REFERENCES cartes(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Politiques de sécurité

Les scripts configurent automatiquement :

- **Lecture publique** : Tous les utilisateurs peuvent voir les pages publiées
- **Accès admin complet** : Les admins peuvent tout faire
- **Accès créateur** : Les créateurs de cartes peuvent gérer leurs pages détaillées 