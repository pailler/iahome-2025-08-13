# Système de Gestion de Menus - IAHome

Ce système permet de gérer dynamiquement les menus de votre site web en les rattachant à des pages spécifiques. Il offre une interface d'administration complète pour créer, modifier et organiser les menus et leurs éléments.

## 🚀 Fonctionnalités

### ✅ Gestion des Menus
- **Création de menus multiples** : Menu principal, footer, mobile, etc.
- **Organisation hiérarchique** : Support des sous-menus (menus parents/enfants)
- **Positionnement flexible** : Contrôle de l'ordre d'affichage
- **Activation/désactivation** : Contrôle de la visibilité des menus

### ✅ Gestion des Éléments de Menu
- **Liens internes et externes** : Support des URLs personnalisées
- **Rattachement aux pages** : Liaison avec les pages du site
- **Icônes personnalisées** : Ajout d'icônes pour chaque élément
- **Contrôle d'accès** : Restriction par rôles utilisateur
- **Authentification requise** : Éléments réservés aux utilisateurs connectés

### ✅ Gestion des Pages
- **Pages dynamiques** : Création et gestion de pages personnalisées
- **SEO optimisé** : Métadonnées (title, description)
- **Statut de publication** : Contrôle de la visibilité
- **Page d'accueil** : Désignation d'une page d'accueil

### ✅ Interface d'Administration
- **Interface intuitive** : Gestion via l'admin panel
- **Formulaires modaux** : Création et modification en temps réel
- **Prévisualisation** : Voir les changements immédiatement
- **Gestion des rôles** : Contrôle d'accès administrateur

## 📋 Structure de la Base de Données

### Table `menus`
```sql
- id (UUID, Primary Key)
- name (VARCHAR, Unique) - Nom du menu (ex: 'main', 'footer')
- description (TEXT) - Description du menu
- is_active (BOOLEAN) - Statut d'activation
- position (INTEGER) - Ordre d'affichage
- created_at, updated_at (TIMESTAMP)
```

### Table `menu_items`
```sql
- id (UUID, Primary Key)
- menu_id (UUID, Foreign Key) - Référence vers le menu parent
- parent_id (UUID, Foreign Key) - Référence vers l'élément parent (sous-menus)
- title (VARCHAR) - Titre affiché
- url (VARCHAR) - URL de destination
- page_id (VARCHAR) - Référence vers une page
- icon (VARCHAR) - Icône optionnelle
- position (INTEGER) - Ordre dans le menu
- is_active (BOOLEAN) - Statut d'activation
- is_external (BOOLEAN) - Lien externe
- target (VARCHAR) - Cible du lien (_self, _blank)
- requires_auth (BOOLEAN) - Authentification requise
- roles_allowed (TEXT[]) - Rôles autorisés
- created_at, updated_at (TIMESTAMP)
```

### Table `pages`
```sql
- id (UUID, Primary Key)
- slug (VARCHAR, Unique) - URL de la page
- title (VARCHAR) - Titre de la page
- description (TEXT) - Description
- content (TEXT) - Contenu de la page
- is_published (BOOLEAN) - Statut de publication
- is_homepage (BOOLEAN) - Page d'accueil
- meta_title, meta_description (VARCHAR, TEXT) - SEO
- created_at, updated_at (TIMESTAMP)
```

## 🛠️ Installation

### 1. Exécuter le Script de Configuration
```bash
node setup-menu-system.js
```

### 2. Vérifier les Tables Créées
Le script crée automatiquement :
- ✅ Table `menus` avec les menus par défaut
- ✅ Table `menu_items` avec les éléments de menu
- ✅ Table `pages` avec les pages de base
- ✅ Index et contraintes de sécurité
- ✅ Politiques RLS (Row Level Security)

### 3. Accéder à l'Interface d'Administration
1. Connectez-vous en tant qu'administrateur
2. Allez dans `/admin`
3. Cliquez sur l'onglet "🍽️ Menus"
4. Cliquez sur "Gérer les menus"

## 📖 Utilisation

### Interface d'Administration

#### Gestion des Menus
1. **Créer un menu** : Cliquez sur "Ajouter un menu"
2. **Modifier un menu** : Cliquez sur "Modifier" à côté du menu
3. **Supprimer un menu** : Cliquez sur "Supprimer" (attention : supprime tous les éléments)

#### Gestion des Éléments de Menu
1. **Ajouter un élément** : Cliquez sur "Ajouter un élément" dans un menu
2. **Configurer l'élément** :
   - **Titre** : Texte affiché dans le menu
   - **URL** : Lien de destination (ex: `/about`, `https://example.com`)
   - **Icône** : Emoji ou nom d'icône (ex: `🏠`, `📧`)
   - **Position** : Ordre d'affichage (1, 2, 3...)
   - **Lien externe** : Cochez si c'est un lien externe
   - **Authentification requise** : Cochez si l'utilisateur doit être connecté

#### Gestion des Pages
1. **Créer une page** : Cliquez sur "Ajouter une page"
2. **Configurer la page** :
   - **Slug** : URL de la page (ex: `about` → `/about`)
   - **Titre** : Titre de la page
   - **Description** : Description pour le SEO
   - **Contenu** : Contenu de la page (optionnel)
   - **Publiée** : Cochez pour rendre la page visible
   - **Page d'accueil** : Cochez si c'est la page d'accueil

### Intégration dans le Code

#### Utilisation du Composant DynamicNavigation
```tsx
import DynamicNavigation from '../components/DynamicNavigation';

// Dans votre composant
<DynamicNavigation 
  menuName="main" 
  userRole={userRole}
  className="flex items-center space-x-6"
/>
```

#### Utilisation du Service MenuService
```tsx
import { MenuService } from '../utils/menuService';

// Récupérer les éléments d'un menu
const menuItems = await MenuService.getMenuItems('main', userRole);

// Créer un nouvel élément de menu
await MenuService.createMenuItem({
  menu_id: menuId,
  title: 'Nouveau lien',
  url: '/nouvelle-page',
  position: 1,
  is_active: true
});
```

## 🎨 Personnalisation

### Styles CSS
Le composant `DynamicNavigation` utilise Tailwind CSS. Vous pouvez personnaliser les styles en modifiant les classes CSS dans le composant.

### Icônes
Les icônes peuvent être :
- **Emojis** : `🏠`, `📧`, `📱`
- **Noms d'icônes** : `home`, `email`, `phone`
- **SVG personnalisés** : Ajoutez vos propres icônes

### Sous-menus
Pour créer des sous-menus :
1. Créez d'abord l'élément parent
2. Créez l'élément enfant en sélectionnant le parent dans "Parent"

## 🔒 Sécurité

### Contrôle d'Accès
- **Lecture publique** : Tous les utilisateurs peuvent voir les menus
- **Écriture admin** : Seuls les administrateurs peuvent modifier
- **Politiques RLS** : Sécurité au niveau de la base de données

### Authentification
- **Éléments protégés** : Certains éléments peuvent nécessiter une connexion
- **Rôles utilisateur** : Contrôle d'accès par rôle (admin, user, etc.)

## 🚨 Dépannage

### Problèmes Courants

#### Les menus ne s'affichent pas
1. Vérifiez que les tables sont créées : `node setup-menu-system.js`
2. Vérifiez que les menus sont actifs dans l'admin
3. Vérifiez les permissions RLS

#### Erreur de connexion à la base de données
1. Vérifiez les variables d'environnement Supabase
2. Vérifiez que la clé de service est correcte
3. Vérifiez les politiques RLS

#### Les changements ne s'appliquent pas
1. Videz le cache du navigateur
2. Vérifiez que vous êtes connecté en tant qu'admin
3. Vérifiez les logs de la console

### Logs et Debug
```bash
# Vérifier les tables
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('menus').select('*').then(console.log);
"
```

## 📝 Exemples d'Utilisation

### Menu Principal Typique
```json
{
  "name": "main",
  "items": [
    {
      "title": "Accueil",
      "url": "/",
      "icon": "🏠",
      "position": 1
    },
    {
      "title": "Produits",
      "url": "/products",
      "icon": "📦",
      "position": 2,
      "children": [
        {
          "title": "Modules IA",
          "url": "/modules",
          "position": 1
        },
        {
          "title": "Sélections",
          "url": "/selections",
          "position": 2
        }
      ]
    },
    {
      "title": "Blog",
      "url": "/blog",
      "icon": "📝",
      "position": 3
    }
  ]
}
```

### Menu Footer Typique
```json
{
  "name": "footer",
  "items": [
    {
      "title": "À propos",
      "url": "/about",
      "position": 1
    },
    {
      "title": "Contact",
      "url": "/contact",
      "position": 2
    },
    {
      "title": "Confidentialité",
      "url": "/privacy",
      "position": 3
    },
    {
      "title": "Conditions",
      "url": "/terms",
      "position": 4
    }
  ]
}
```

## 🔄 Mise à Jour

Pour mettre à jour le système :
1. Sauvegardez vos données actuelles
2. Exécutez le script de migration si nécessaire
3. Testez les nouvelles fonctionnalités
4. Déployez en production

## 📞 Support

Pour toute question ou problème :
1. Consultez ce README
2. Vérifiez les logs de la console
3. Contactez l'équipe de développement

---

**Système de Gestion de Menus IAHome** - Version 1.0 