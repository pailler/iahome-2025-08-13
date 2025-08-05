# Système de Gestion des Tokens d'Accès

## Vue d'ensemble

Le système de gestion des tokens d'accès permet de créer et gérer des tokens personnalisables pour l'accès aux modules de la plateforme. Chaque token peut être configuré avec des paramètres spécifiques selon les besoins.

## Fonctionnalités

### 🔑 Paramètres personnalisables

- **Nom et description** : Identifiant clair du token
- **Module associé** : Module auquel le token donne accès
- **Niveau d'accès** : Basic, Premium, ou Admin
- **Permissions** : Liste des permissions accordées
- **Durée d'expiration** : De 1 heure à 1 an
- **Limite d'utilisation** : Nombre maximum d'utilisations
- **Statut actif/inactif** : Activation/désactivation du token

### 📊 Suivi et monitoring

- **Compteur d'utilisation** : Suivi du nombre d'utilisations
- **Journal d'utilisation** : Historique détaillé des accès
- **Dernière utilisation** : Timestamp de la dernière utilisation
- **Statut en temps réel** : Vérification de la validité

## Architecture

### Base de données

La table `access_tokens` stocke toutes les informations des tokens :

```sql
CREATE TABLE access_tokens (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    module_id TEXT NOT NULL REFERENCES modules(id),
    module_name TEXT NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'premium',
    permissions TEXT[] NOT NULL DEFAULT ARRAY['read', 'access'],
    max_usage INTEGER,
    current_usage INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    jwt_token TEXT NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_log JSONB DEFAULT '[]'::jsonb
);
```

### API Endpoints

#### `/api/admin/tokens`
- **GET** : Récupérer tous les tokens (admin uniquement)
- **POST** : Créer un nouveau token (admin uniquement)
- **PUT** : Mettre à jour un token existant (admin uniquement)
- **DELETE** : Supprimer un token (admin uniquement)

#### `/api/validate-access-token`
- **POST/GET** : Valider un token d'accès
- Vérifie l'expiration, les limites d'usage, et les permissions
- Incrémente automatiquement le compteur d'utilisation

### Interface d'administration

L'interface d'administration est accessible via `/admin/tokens` et permet :

- **Création de tokens** : Formulaire complet avec tous les paramètres
- **Modification** : Édition de tous les paramètres existants
- **Suppression** : Suppression sécurisée avec confirmation
- **Visualisation** : Tableau avec tous les tokens et leurs statistiques

## Utilisation

### Création d'un token

1. Accéder à `/admin/tokens`
2. Cliquer sur "Créer un nouveau token"
3. Remplir le formulaire avec les paramètres souhaités
4. Valider la création

### Validation d'un token

```javascript
// Validation côté client
const response = await fetch('/api/validate-access-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token: 'your-jwt-token' })
});

const result = await response.json();
if (result.valid) {
  // Token valide, accès autorisé
  console.log('Module:', result.token.moduleName);
  console.log('Permissions:', result.token.permissions);
} else {
  // Token invalide
  console.error('Erreur:', result.error);
}
```

### Permissions disponibles

- `read` : Lecture des données
- `write` : Écriture/modification
- `access` : Accès au module
- `admin` : Permissions administrateur
- `advanced_features` : Fonctionnalités avancées
- `download` : Téléchargement de fichiers
- `upload` : Upload de fichiers
- `delete` : Suppression de données
- `share` : Partage de contenu
- `export` : Export de données

## Sécurité

### Authentification
- Toutes les opérations d'administration nécessitent un rôle admin
- Vérification JWT pour la validation des tokens
- RLS (Row Level Security) activé sur la base de données

### Validation
- Vérification de l'expiration automatique
- Contrôle des limites d'usage
- Validation des permissions
- Journalisation des accès

### Révocation
- Désactivation immédiate via l'interface admin
- Suppression définitive possible
- Expiration automatique selon la configuration

## Migration depuis l'ancien système

Le nouveau système est compatible avec l'ancien système de magic links :

1. Les tokens existants continuent de fonctionner
2. Les nouveaux tokens utilisent le système JWT
3. Migration progressive possible

## Installation

### 1. Créer la table de base de données

```bash
# Exécuter le script SQL
run-create-tokens-table.bat
```

### 2. Vérifier les variables d'environnement

```env
JWT_SECRET=your-secret-key-here
```

### 3. Accéder à l'interface

- URL : `http://localhost:8021/admin/tokens`
- Rôle requis : Administrateur

## Exemples d'utilisation

### Token Premium pour Stable Diffusion
```json
{
  "name": "Token Stable Diffusion Premium",
  "description": "Accès complet à Stable Diffusion avec toutes les fonctionnalités",
  "moduleId": "stablediffusion-001",
  "accessLevel": "premium",
  "permissions": ["read", "write", "access", "advanced_features"],
  "expirationHours": 168,
  "maxUsage": 1000
}
```

### Token Basic pour MeTube
```json
{
  "name": "Token MeTube Basic",
  "description": "Accès de base à MeTube pour téléchargement",
  "moduleId": "metube-001",
  "accessLevel": "basic",
  "permissions": ["read", "access"],
  "expirationHours": 24,
  "maxUsage": 50
}
```

## Support

Pour toute question ou problème :
1. Vérifier les logs de l'application
2. Consulter la documentation de l'API
3. Contacter l'équipe de développement

---

**Version** : 1.0.0  
**Date** : 2025  
**Auteur** : Équipe IAHome 