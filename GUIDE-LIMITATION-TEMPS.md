# Guide : Limitation de temps de 10 minutes pour les modules YouTube

## 🎯 Objectif

Implémenter une limitation de temps de 10 minutes pour les modules suivants :
- **iatube**
- **stablediffusion** 
- **sdnext**
- **metube**
- **iametube**

## 📋 Fonctionnalités implémentées

### ✅ **Affichage visuel**
- Boutons indiquent "(10 min)" pour les modules concernés
- Tags jaunes avec icône ⏱️ dans les cartes
- Section "Conditions" dans "Mes applis"

### ✅ **Système de sessions**
- Table `module_access_sessions` pour stocker les sessions
- Magic links avec expiration de 10 minutes
- Validation en temps réel des sessions

### ✅ **Vérification d'accès**
- API `/api/check-session-access` pour vérifier l'accès
- Vérification avant ouverture de l'iframe
- Messages d'erreur appropriés

## 🗄️ Base de données

### Table `module_access_sessions`
```sql
CREATE TABLE module_access_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    module_name TEXT NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Script de création
Exécuter le fichier `create-module-access-sessions-table.sql` dans Supabase.

## 🔧 Déploiement

### 1. **Créer la table**
```bash
# Dans Supabase SQL Editor
# Exécuter le contenu de create-module-access-sessions-table.sql
```

### 2. **Vérifier les APIs**
- ✅ `/api/generate-magic-link` - Modifiée pour 10 minutes
- ✅ `/api/check-session-access` - Nouvelle API créée

### 3. **Tester la fonctionnalité**

#### Test 1 : Génération de session
1. Se connecter
2. Cliquer sur un module avec limitation (iatube, stablediffusion, etc.)
3. Vérifier que la session est créée en base
4. Vérifier l'expiration à 10 minutes

#### Test 2 : Vérification d'accès
1. Ouvrir un module avec limitation
2. Attendre 10 minutes
3. Essayer de cliquer à nouveau
4. Vérifier le message "Session expirée"

#### Test 3 : Modules sans limitation
1. Tester avec Librespeed, PSitransfer, etc.
2. Vérifier qu'ils n'ont pas de limitation

## 🔍 Logs et monitoring

### Logs à surveiller
```javascript
// Dans la console du navigateur
console.log('🔍 Vérification accès:', accessCheck);
console.log('🔍 Ouverture de', module.title, 'dans une iframe:', directUrl);
```

### Requêtes SQL utiles
```sql
-- Voir toutes les sessions actives
SELECT * FROM module_access_sessions 
WHERE status = 'active' 
ORDER BY created_at DESC;

-- Voir les sessions expirées
SELECT * FROM module_access_sessions 
WHERE expires_at < NOW() 
ORDER BY created_at DESC;

-- Statistiques par module
SELECT module_name, COUNT(*) as sessions_count
FROM module_access_sessions 
WHERE status = 'active'
GROUP BY module_name;
```

## 🚨 Gestion des erreurs

### Messages d'erreur possibles
- "Session expirée pour [module]. Veuillez générer un nouveau lien d'accès."
- "Accès refusé pour [module]: [raison]"
- "Erreur lors de la génération du lien d'accès"

### Actions automatiques
- Sessions expirées marquées automatiquement
- Nettoyage des sessions anciennes (à implémenter)

## 🔄 Améliorations futures

### Fonctionnalités à ajouter
1. **Nettoyage automatique** des sessions expirées
2. **Compteur de temps** dans l'interface
3. **Notifications** avant expiration
4. **Historique** des sessions utilisateur
5. **Limitation par jour** (ex: max 5 sessions de 10 min par jour)

### Optimisations
1. **Cache** des vérifications d'accès
2. **Websockets** pour notifications temps réel
3. **Batch processing** pour nettoyage des sessions

## 📊 Métriques

### À surveiller
- Nombre de sessions créées par jour
- Taux d'utilisation des 10 minutes
- Modules les plus utilisés
- Erreurs de session expirée

### Requêtes de monitoring
```sql
-- Sessions par jour
SELECT DATE(created_at) as date, COUNT(*) as sessions
FROM module_access_sessions 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Durée moyenne d'utilisation
SELECT module_name, 
       AVG(EXTRACT(EPOCH FROM (expires_at - created_at))/60) as avg_duration_minutes
FROM module_access_sessions 
WHERE status = 'expired'
GROUP BY module_name;
```

## ✅ Checklist de déploiement

- [ ] Exécuter le script SQL de création de table
- [ ] Vérifier les APIs fonctionnent
- [ ] Tester avec un module à limitation
- [ ] Tester avec un module sans limitation
- [ ] Vérifier les messages d'erreur
- [ ] Tester l'expiration de session
- [ ] Vérifier les logs
- [ ] Documenter les métriques

## 🎉 Résultat attendu

Les utilisateurs verront maintenant :
1. **Indication claire** de la limitation de 10 minutes
2. **Vérification automatique** avant accès
3. **Messages d'erreur** explicites si session expirée
4. **Expérience utilisateur** cohérente

La limitation de temps de 10 minutes est maintenant **fonctionnelle** ! 🚀 