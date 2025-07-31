# 🔐 Guide de Configuration de l'Authentification des Modules

Ce guide explique comment configurer et utiliser le système d'authentification pour protéger vos modules comme Stable Diffusion.

## 📋 Vue d'ensemble

Le système d'authentification comprend :
- **Middleware Next.js** pour protéger les routes
- **Composant AuthGuard** pour la vérification côté client
- **Tokens d'accès sécurisés** avec expiration automatique
- **Vérification des abonnements** en temps réel
- **Logs d'audit** pour tracer les accès

## 🚀 Installation et Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env.local` :

```bash
# Secret pour les magic links (changez cette valeur !)
MAGIC_LINK_SECRET=votre-secret-tres-securise-changez-cela

# Configuration Supabase (déjà configuré)
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Base de données

Exécutez le script SQL pour créer la table de logs :

```sql
-- Exécutez le contenu de create-module-access-logs.sql
-- dans votre base de données Supabase
```

### 3. Structure des tables

Assurez-vous d'avoir ces tables dans votre base de données :

```sql
-- Table des profils utilisateurs
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Table des abonnements
user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Table des logs d'accès (créée par le script)
module_access_logs (...)
```

## 🔧 Utilisation

### 1. Protection d'une route

Pour protéger une page de module, utilisez le composant `AuthGuard` :

```tsx
import AuthGuard from '../../components/AuthGuard';

export default function MonModule() {
  return (
    <AuthGuard moduleName="stablediffusion" requireSubscription={true}>
      {/* Contenu de votre module */}
      <div>Votre module protégé</div>
    </AuthGuard>
  );
}
```

### 2. Protection d'une API

Le middleware protège automatiquement les routes API. Pour une API personnalisée :

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  // Récupérer l'utilisateur depuis les headers (ajoutés par le middleware)
  const userId = request.headers.get('x-user-id');
  const moduleName = request.headers.get('x-module-name');
  
  if (!userId) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }
  
  // Votre logique d'API...
}
```

### 3. Génération de tokens d'accès

Pour générer un token d'accès programmatiquement :

```typescript
const response = await fetch('/api/generate-module-access', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    moduleName: 'stablediffusion',
    userId: user.id,
    duration: 24 // heures
  })
});

const { accessToken } = await response.json();
```

## 🛡️ Sécurité

### 1. Middleware de protection

Le middleware `src/middleware.ts` :
- Vérifie l'authentification sur toutes les routes protégées
- Valide les tokens d'accès
- Vérifie les abonnements actifs
- Redirige vers la connexion si nécessaire

### 2. Tokens sécurisés

Les tokens d'accès :
- Sont chiffrés avec HMAC-SHA256
- Ont une expiration automatique (24h par défaut)
- Incluent un salt aléatoire
- Sont uniques par utilisateur et module

### 3. Audit et logs

Tous les accès sont enregistrés avec :
- ID utilisateur
- Nom du module
- Adresse IP
- User-Agent
- Timestamp
- Statut du token

## 📱 Pages d'accès

### 1. Page d'accès sécurisé général

`/secure-module-access?module=stablediffusion`

Permet de :
- Générer des tokens d'accès
- Copier les URLs d'accès
- Voir les informations d'abonnement

### 2. Page d'accès Stable Diffusion

`/stablediffusion-secure`

Interface spécialisée pour Stable Diffusion avec :
- Accès direct avec génération automatique de token
- Gestion des tokens
- Informations de sécurité

## 🔄 Flux d'authentification

### 1. Accès via session utilisateur

```
Utilisateur connecté → Middleware vérifie session → Vérification abonnement → Accès autorisé
```

### 2. Accès via token

```
URL avec token → Middleware valide token → Vérification abonnement → Accès autorisé
```

### 3. Accès non autorisé

```
Tentative d'accès → Middleware détecte absence d'auth → Redirection vers /login
```

## 🎯 Exemples d'utilisation

### 1. Lien direct vers Stable Diffusion

```html
<a href="/stablediffusion-secure">Accéder à Stable Diffusion</a>
```

### 2. URL avec token d'accès

```
https://votre-domaine.com/stablediffusion-proxy?token=abc123...
```

### 3. Intégration dans une carte de module

```tsx
<button 
  onClick={() => router.push('/secure-module-access?module=stablediffusion')}
  className="bg-blue-600 text-white px-4 py-2 rounded"
>
  Accéder au module
</button>
```

## 🔍 Monitoring et Debug

### 1. Logs de console

Le système génère des logs détaillés :
- `🔐 Middleware - Vérification de la route`
- `✅ Token d'accès valide`
- `❌ Aucun abonnement actif`

### 2. Vérification des abonnements

```sql
-- Vérifier les abonnements actifs
SELECT * FROM user_subscriptions 
WHERE status = 'active' 
AND end_date > NOW();
```

### 3. Logs d'accès

```sql
-- Voir les accès récents
SELECT * FROM module_access_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🚨 Dépannage

### Problème : "Authentification requise"

**Cause** : L'utilisateur n'est pas connecté
**Solution** : Rediriger vers `/login`

### Problème : "Abonnement requis"

**Cause** : L'utilisateur n'a pas d'abonnement actif
**Solution** : Rediriger vers `/abonnements?module=stablediffusion`

### Problème : "Token invalide"

**Cause** : Le token a expiré ou est corrompu
**Solution** : Générer un nouveau token

### Problème : Erreur de base de données

**Cause** : Tables manquantes ou permissions incorrectes
**Solution** : Exécuter les scripts SQL de création

## 🔧 Configuration avancée

### 1. Personnaliser la durée des tokens

```typescript
// Dans generate-module-access/route.ts
const duration = 48; // 48 heures au lieu de 24
```

### 2. Ajouter des modules personnalisés

```typescript
// Dans middleware.ts
const protectedRoutes = [
  '/stablediffusion-proxy',
  '/mon-nouveau-module', // Ajoutez ici
  // ...
];
```

### 3. Personnaliser les messages d'erreur

```typescript
// Dans AuthGuard.tsx
const customMessages = {
  noAuth: 'Vous devez être connecté pour accéder à ce module',
  noSubscription: 'Abonnement requis pour ce module'
};
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs de console
2. Consultez les logs de base de données
3. Testez avec un utilisateur admin
4. Vérifiez la configuration des variables d'environnement

---

**Note** : Ce système remplace l'accès direct non sécurisé à `stablediffusion.regispailler.fr` par un accès authentifié et contrôlé via votre plateforme. 