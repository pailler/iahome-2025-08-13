# Guide de Migration : Users → Profiles

Ce guide vous accompagne dans la migration vers la table `profiles` dans votre base de données Supabase.

## 🚨 SOLUTION RAPIDE

**Pour résoudre immédiatement l'erreur "relation 'public.profiles' does not exist", exécutez le script complet :**

```sql
-- Copiez et exécutez le contenu du fichier complete_migration.sql
-- dans votre éditeur SQL Supabase
```

Ce script va :
- ✅ Créer la table `profiles` si elle n'existe pas
- ✅ Migrer les données depuis `users` ou `iahome_users` si elles existent
- ✅ Configurer tous les index, triggers et politiques RLS
- ✅ Créer un trigger pour les nouveaux utilisateurs
- ✅ Créer un admin par défaut si nécessaire

## 📋 Étapes de Migration

### Étape 1 : Migration Complète (RECOMMANDÉE)
1. Ouvrez votre projet Supabase
2. Allez dans l'éditeur SQL
3. **Exécutez le script `complete_migration.sql`**
4. Vérifiez les messages de confirmation

### Étape 2 : Test de l'Application
1. Redémarrez votre serveur de développement : `npm run dev`
2. Testez la connexion utilisateur
3. Testez les fonctionnalités admin
4. Vérifiez que les données sont correctement affichées

## 🔧 Scripts Disponibles

### `complete_migration.sql` ⭐ **RECOMMANDÉ**
- **Objectif** : Migration complète et automatique
- **Quand l'utiliser** : Pour résoudre immédiatement le problème
- **Sécurité** : Crée la table si elle n'existe pas, migre les données existantes

### `create_profiles_table.sql`
- **Objectif** : Créer seulement la table profiles
- **Quand l'utiliser** : Si vous voulez juste créer la table sans migrer

### `diagnostic_tables.sql`
- **Objectif** : Diagnostiquer l'état actuel de la base de données
- **Quand l'utiliser** : Pour comprendre la situation avant migration

### `test_profiles_migration.sql`
- **Objectif** : Vérifier que la migration s'est bien passée
- **Quand l'utiliser** : APRÈS la migration

## 🚨 Gestion des Erreurs

### Erreur : "relation 'public.profiles' does not exist"
**Solution immédiate** :
1. Exécutez `complete_migration.sql`
2. Redémarrez votre application
3. Testez la connexion

### Erreur : "relation 'public.users' does not exist"
**Solution** :
1. Vérifiez que tous les fichiers TypeScript utilisent `profiles`
2. Redémarrez le serveur de développement
3. Videz le cache du navigateur

## 📊 Vérification Post-Migration

Après la migration, vérifiez que :

1. ✅ La table `profiles` existe et contient vos données
2. ✅ Les politiques RLS sont correctement configurées
3. ✅ L'application se connecte sans erreur
4. ✅ Les fonctionnalités admin fonctionnent
5. ✅ Les utilisateurs peuvent se connecter normalement

## 🔄 Rollback (si nécessaire)

Si vous devez annuler la migration :

```sql
-- Supprimer la table profiles (ATTENTION : perte de données)
DROP TABLE IF EXISTS profiles CASCADE;

-- Recréer une table users si nécessaire
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Exécutez `complete_migration.sql`
2. Vérifiez les logs d'erreur
3. Consultez la documentation Supabase
4. Contactez le support si nécessaire

---

**Note** : Le script `complete_migration.sql` est conçu pour être sûr et gérer tous les cas de figure. Il créera la table `profiles` si elle n'existe pas et migrera automatiquement les données existantes. 