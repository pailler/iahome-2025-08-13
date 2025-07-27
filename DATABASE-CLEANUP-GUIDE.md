# 🧹 Guide de Nettoyage et Organisation de la Base de Données

## 📋 Vue d'ensemble

Ce guide vous aide à nettoyer et réorganiser votre base de données pour améliorer les performances et maintenir l'intégrité des données.

## 📁 Scripts disponibles

### 1. `analyze-database.sql` - Analyse de l'état actuel
**Objectif** : Analyser l'état actuel de votre base de données
**Utilisation** : Exécuter en premier pour comprendre les problèmes

```sql
-- Dans votre client SQL (pgAdmin, DBeaver, etc.)
\i analyze-database.sql
```

**Ce que fait ce script** :
- ✅ Analyse des utilisateurs et profils
- ✅ Vérification des abonnements
- ✅ Analyse des magic links
- ✅ Détection des doublons
- ✅ Vérification de l'intégrité des données
- ✅ Rapport de santé de la base

### 2. `cleanup-database.sql` - Nettoyage simple
**Objectif** : Nettoyer les données sans restructurer
**Utilisation** : Exécuter après l'analyse pour corriger les problèmes

```sql
-- Dans votre client SQL
\i cleanup-database.sql
```

**Ce que fait ce script** :
- 🗑️ Supprime les abonnements en doublon
- 🗑️ Nettoie les magic links expirés
- 🗑️ Supprime les profils orphelins
- 🗑️ Nettoie les articles de blog vides
- ⚡ Optimise les index
- 📊 Met à jour les statistiques

### 3. `reorganize-database.sql` - Réorganisation complète
**Objectif** : Restructurer complètement la base de données
**⚠️ ATTENTION** : Ce script supprime et recrée les tables

```sql
-- Dans votre client SQL
\i reorganize-database.sql
```

**Ce que fait ce script** :
- 🔄 Sauvegarde les données importantes
- 🗑️ Supprime les tables existantes
- 🏗️ Recrée une structure optimisée
- 📥 Restaure les données nettoyées
- ⚡ Crée des index performants
- 🔧 Configure des triggers automatiques

## 🚀 Étapes recommandées

### Étape 1 : Analyse
```bash
# Connectez-vous à votre base de données
psql -h votre-host -U votre-user -d votre-database

# Exécutez l'analyse
\i analyze-database.sql
```

### Étape 2 : Sauvegarde (IMPORTANT)
```bash
# Créez une sauvegarde avant tout nettoyage
pg_dump -h votre-host -U votre-user -d votre-database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Étape 3 : Nettoyage simple
```sql
-- Si l'analyse montre des problèmes mineurs
\i cleanup-database.sql
```

### Étape 4 : Réorganisation (optionnel)
```sql
-- Si vous voulez une structure complètement nouvelle
\i reorganize-database.sql
```

## 📊 Interprétation des résultats

### Rapport d'analyse
- **Profiles consistency** : ✅ = OK, ❌ = Problème
- **Subscription integrity** : ✅ = OK, ❌ = Abonnements orphelins
- **Magic links health** : ✅ = OK, ❌ = Magic links expirés

### Recommandations
Le script vous donnera des recommandations spécifiques :
- "Créer les profils manquants pour les utilisateurs"
- "Nettoyer les abonnements orphelins"
- "Supprimer les magic links expirés"

## 🔧 Configuration requise

### Variables d'environnement
Assurez-vous que ces variables sont configurées :
```bash
# Dans votre .env.local
DATABASE_URL=postgresql://user:password@host:port/database
```

### Permissions requises
Votre utilisateur de base de données doit avoir :
- `CREATE` sur le schéma public
- `DROP` sur les tables existantes
- `INSERT`, `UPDATE`, `DELETE` sur toutes les tables

## ⚠️ Précautions importantes

### Avant d'exécuter les scripts
1. **Sauvegarde obligatoire** : Créez toujours une sauvegarde
2. **Test en environnement de développement** : Testez d'abord
3. **Vérifiez les permissions** : Assurez-vous d'avoir les droits
4. **Arrêtez l'application** : Évitez les conflits pendant le nettoyage

### Après le nettoyage
1. **Testez l'application** : Vérifiez que tout fonctionne
2. **Vérifiez les données** : Contrôlez que les données importantes sont préservées
3. **Redémarrez l'application** : Pour s'assurer que tout fonctionne

## 🐛 Dépannage

### Erreurs courantes

#### "Permission denied"
```sql
-- Vérifiez les permissions
SELECT current_user, current_database();
GRANT ALL PRIVILEGES ON DATABASE votre-database TO votre-user;
```

#### "Table does not exist"
```sql
-- Vérifiez les tables existantes
\dt
```

#### "Constraint violation"
```sql
-- Vérifiez les contraintes
SELECT * FROM information_schema.table_constraints 
WHERE table_schema = 'public';
```

### Logs utiles
```sql
-- Vérifiez les logs de PostgreSQL
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

## 📈 Améliorations apportées

### Performance
- ⚡ Index optimisés pour les requêtes fréquentes
- 📊 Statistiques mises à jour
- 🗑️ Données inutiles supprimées

### Intégrité
- 🔗 Contraintes de clés étrangères
- ✅ Validation des données
- 🛡️ Triggers automatiques

### Structure
- 📋 Tables bien organisées
- 🔄 Relations claires
- 📝 Documentation intégrée

## 🔄 Maintenance régulière

### Tâches à automatiser
```sql
-- Script de maintenance quotidienne
-- À exécuter via cron ou pgAgent

-- Nettoyer les magic links expirés
DELETE FROM magic_links WHERE expires_at < NOW() - INTERVAL '24 hours';

-- Mettre à jour les statistiques
ANALYZE;

-- Vérifier l'intégrité
SELECT COUNT(*) FROM user_subscriptions us 
LEFT JOIN users u ON us.user_id = u.id 
WHERE u.id IS NULL;
```

### Monitoring
```sql
-- Requête de monitoring
SELECT 
  'users' as table_name,
  COUNT(*) as record_count,
  pg_size_pretty(pg_total_relation_size('users')) as size
FROM users
UNION ALL
SELECT 
  'user_subscriptions' as table_name,
  COUNT(*) as record_count,
  pg_size_pretty(pg_total_relation_size('user_subscriptions')) as size
FROM user_subscriptions;
```

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de PostgreSQL
2. Consultez la documentation officielle
3. Testez sur un environnement de développement
4. Restaurez la sauvegarde si nécessaire

---

**⚠️ Rappel important** : Toujours faire une sauvegarde avant d'exécuter ces scripts ! 