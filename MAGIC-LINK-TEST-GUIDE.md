# Guide de Test des Magic Links

Ce guide explique comment créer et tester des magic links dans votre application.

## 📋 Prérequis

1. **Base de données Supabase configurée** avec la table `magic_links`
2. **Variables d'environnement Supabase** configurées
3. **Serveur Next.js** démarré (pour l'API)

## 🗂️ Structure de la Table `magic_links`

La table `magic_links` doit contenir les colonnes suivantes :

```sql
CREATE TABLE magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  module_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  redirect_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Scripts Disponibles

### 1. Script Interactif (`test-magic-link-creation.js`)

Ce script demande interactivement les valeurs Supabase si elles ne sont pas dans le fichier `.env`.

```bash
node test-magic-link-creation.js
```

**Avantages :**
- Interactif, demande les valeurs manquantes
- Vérification complète
- Messages d'erreur détaillés

### 2. Script API (`test-api-magic-link.js`)

Ce script utilise l'API existante de votre application Next.js.

```bash
# D'abord, démarrer le serveur Next.js
npm run dev

# Puis dans un autre terminal
node test-api-magic-link.js
```

**Avantages :**
- Utilise votre API existante
- Respecte votre logique métier
- Envoi d'email automatique (si configuré)

### 3. Script Simple (`create-magic-link-simple.js`)

Ce script insère directement dans Supabase avec des valeurs codées en dur.

```bash
# Modifier le script avec vos vraies valeurs Supabase
# Puis exécuter :
node create-magic-link-simple.js
```

**Avantages :**
- Simple et direct
- Pas de dépendance au serveur Next.js
- Contrôle total sur les données

## ⚙️ Configuration

### Variables d'Environnement Requises

Créez un fichier `.env` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:8021

# Magic Link Configuration
MAGIC_LINK_SECRET=your-magic-link-secret
```

### Où Trouver vos Valeurs Supabase

1. **URL Supabase** : Dans votre dashboard Supabase → Settings → API
2. **Clé Anonyme** : Dans votre dashboard Supabase → Settings → API → Project API keys → anon public
3. **Clé Service Role** : Dans votre dashboard Supabase → Settings → API → Project API keys → service_role

## 🧪 Test des Magic Links

### 1. Créer un Magic Link

Choisissez l'un des scripts ci-dessus et exécutez-le. Vous obtiendrez :

```
✅ Magic link créé avec succès !
📋 Détails du magic link:
   - ID: 12345678-1234-1234-1234-123456789abc
   - Token: a1b2c3d4e5f6...
   - User ID: test-user-123
   - Module: test-module
   - Email: test@example.com
   - Expiration: 2024-01-15T10:30:00.000Z
   - Utilisé: false

🔗 URL du magic link: https://home.regispailler.fr/access/test-module?token=a1b2c3d4e5f6...&user=test-user-123
```

### 2. Tester le Magic Link

1. **Copiez l'URL** générée
2. **Ouvrez-la dans un navigateur**
3. **Vérifiez que l'accès fonctionne**
4. **Le magic link sera marqué comme "utilisé"** après validation

### 3. Vérifier dans la Base de Données

```sql
-- Voir tous les magic links
SELECT * FROM magic_links ORDER BY created_at DESC;

-- Voir un magic link spécifique
SELECT * FROM magic_links WHERE token = 'your-token-here';

-- Voir les magic links non utilisés
SELECT * FROM magic_links WHERE is_used = FALSE;

-- Voir les magic links expirés
SELECT * FROM magic_links WHERE expires_at < NOW();
```

## 🔧 Dépannage

### Erreur "Variables d'environnement Supabase manquantes"

**Solution :** Configurez votre fichier `.env` ou utilisez le script interactif.

### Erreur "Table magic_links n'existe pas"

**Solution :** Créez la table dans Supabase :

```sql
CREATE TABLE magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  module_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  redirect_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Erreur "Permissions d'insertion"

**Solution :** Vérifiez les politiques RLS (Row Level Security) dans Supabase :

```sql
-- Permettre l'insertion pour tous les utilisateurs authentifiés
CREATE POLICY "Enable insert for authenticated users" ON magic_links
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permettre la lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Enable read for authenticated users" ON magic_links
FOR SELECT USING (auth.role() = 'authenticated');
```

### Erreur "API non accessible"

**Solution :** 
1. Vérifiez que le serveur Next.js est démarré : `npm run dev`
2. Vérifiez que l'API est accessible sur `http://localhost:8021`
3. Vérifiez les logs du serveur pour les erreurs

## 📊 Monitoring

### Nettoyage Automatique

Pour nettoyer les magic links expirés, exécutez régulièrement :

```sql
DELETE FROM magic_links WHERE expires_at < NOW() - INTERVAL '24 hours';
```

### Statistiques

```sql
-- Nombre total de magic links
SELECT COUNT(*) FROM magic_links;

-- Magic links utilisés vs non utilisés
SELECT 
  is_used,
  COUNT(*) as count
FROM magic_links 
GROUP BY is_used;

-- Magic links par module
SELECT 
  module_name,
  COUNT(*) as count
FROM magic_links 
GROUP BY module_name
ORDER BY count DESC;
```

## 🔒 Sécurité

- Les tokens sont générés avec `crypto.randomBytes(32)` pour une sécurité maximale
- Les magic links expirent automatiquement après 24 heures
- Les magic links sont marqués comme "utilisés" après validation
- Utilisez HTTPS en production pour les URLs de magic links

## 📝 Notes

- Les magic links de test utilisent des données fictives
- En production, utilisez de vraies données utilisateur
- Les emails ne sont envoyés que si le service d'email est configuré
- Les magic links peuvent être réutilisés pour les tests (modifiez `is_used` à `false`)