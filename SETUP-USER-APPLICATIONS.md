# 🚀 Configuration des Applications Utilisateur

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer et faire remonter les données d'applications actives des utilisateurs dans l'interface d'administration.

## 🔧 Étapes de Configuration

### 1. **Créer la Table `user_applications`**

La table `user_applications` doit être créée dans votre base de données Supabase. Vous avez deux options :

#### Option A : Exécuter le Script SQL Directement
1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `create-user-applications-table.sql`

#### Option B : Utiliser le Script Batch (Windows)
```bash
run-create-user-applications-table.bat
```

### 2. **Insérer des Données de Test**

Une fois la table créée, vous pouvez insérer des données de test :

```bash
node insert-test-user-applications.js
```

Ou utiliser le script batch complet :
```bash
setup-user-applications.bat
```

## 📊 Vérification des Données

### **Dans l'Interface Admin**

1. Allez sur `/admin`
2. Cliquez sur l'onglet "Utilisateurs"
3. Vous devriez voir :
   - **Colonne Applications** : Nombre d'applications par utilisateur
   - **Colonne Tokens** : Nombre de tokens d'accès par utilisateur
   - **Boutons d'action** : "Gérer les applications" et "Voir les tokens"

### **Messages d'Information**

- ✅ **Avec données** : "3 total, 2 actives" + bouton "Gérer les applications"
- ⚠️ **Sans données** : "Aucune application" + "Table user_applications non configurée"

## 🔍 Diagnostic des Problèmes

### **Problème : "Aucune application" affiché**

**Causes possibles :**
1. La table `user_applications` n'existe pas
2. La table existe mais est vide
3. Erreur de permissions RLS

**Solutions :**
1. Vérifiez que la table existe : `node check-user-applications.js`
2. Créez la table si nécessaire : exécutez `create-user-applications-table.sql`
3. Insérez des données de test : `node insert-test-user-applications.js`

### **Problème : Erreur "Invalid API key"**

**Solution :**
- Vérifiez que votre clé API Supabase est correcte dans `src/utils/supabaseClient.ts`
- Assurez-vous d'utiliser la clé anonyme (pas la clé de service)

### **Problème : Erreur RLS (Row Level Security)**

**Solution :**
- Vérifiez que les politiques RLS sont correctement configurées
- Assurez-vous que l'utilisateur admin a les bonnes permissions

## 📈 Fonctionnalités Disponibles

### **Gestion des Applications**
- ✅ **Voir** toutes les applications d'un utilisateur
- ✅ **Activer/Désactiver** une application
- ✅ **Supprimer** une application
- ✅ **Modifier le niveau d'accès** (basic, premium, admin)

### **Gestion des Tokens**
- ✅ **Voir** tous les tokens d'un utilisateur
- ✅ **Supprimer** un token
- ✅ **Voir les statistiques** d'utilisation

### **Statistiques**
- 📊 **Applications totales** par utilisateur
- 📊 **Applications actives** par utilisateur
- 📊 **Tokens d'accès** par utilisateur
- 📊 **Tokens valides** par utilisateur

## 🎯 Exemples d'Utilisation

### **Scénario 1 : Nouvel Utilisateur**
1. Utilisateur s'inscrit
2. Admin va dans `/admin` → onglet "Utilisateurs"
3. Clique sur "Gérer les applications" pour l'utilisateur
4. Ajoute des applications (modules) à l'utilisateur
5. Configure le niveau d'accès (basic, premium, admin)

### **Scénario 2 : Paiement Automatique**
1. Utilisateur paie pour un module
2. Webhook Stripe déclenche la création automatique d'une application
3. Token d'accès généré automatiquement
4. Données visibles dans l'interface admin

### **Scénario 3 : Gestion des Accès**
1. Admin va dans `/admin` → onglet "Utilisateurs"
2. Clique sur "Gérer les applications" pour un utilisateur
3. Désactive une application temporairement
4. Modifie le niveau d'accès d'une application
5. Supprime un accès obsolète

## 🔧 Scripts Utiles

### **Vérification**
```bash
node check-user-applications.js
```

### **Insertion de Données de Test**
```bash
node insert-test-user-applications.js
```

### **Configuration Complète**
```bash
setup-user-applications.bat
```

## 📝 Notes Importantes

1. **Sécurité** : Les politiques RLS garantissent que seuls les admins peuvent gérer toutes les applications
2. **Performance** : Les index sont créés automatiquement pour optimiser les requêtes
3. **Traçabilité** : Toutes les modifications sont horodatées (created_at, updated_at)
4. **Flexibilité** : Le système supporte différents niveaux d'accès et permissions

## 🆘 Support

Si vous rencontrez des problèmes :

1. **Vérifiez les logs** dans la console du navigateur
2. **Exécutez les scripts de diagnostic** fournis
3. **Vérifiez la configuration** Supabase
4. **Consultez la documentation** dans `USER-APPLICATIONS-README.md`

---

## 🎉 Résultat Attendu

Une fois configuré, vous devriez voir dans `/admin` → onglet "Utilisateurs" :

```
| Email | Rôle | Applications | Tokens | Date d'inscription | Actions |
|-------|------|--------------|--------|-------------------|---------|
| user@example.com | Utilisateur | 3 total, 2 actives | 5 total, 3 actifs | 01/01/2024 | Gérer |
```

Avec des boutons fonctionnels pour gérer les applications et tokens de chaque utilisateur ! 🚀 