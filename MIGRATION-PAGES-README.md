# Migration des Pages Statiques - IAhome

Ce document explique comment migrer les pages statiques existantes du site dans le système de gestion de menus.

## 📋 Vue d'ensemble

Le script `migrate-static-pages.js` permet de :
- Migrer les pages statiques existantes dans la table `pages`
- Mettre à jour les pages existantes avec de nouvelles informations
- Afficher les statistiques des pages

## 🚀 Installation et Configuration

### Prérequis
- Node.js installé
- Fichier `.env` configuré avec les variables Supabase
- Tables `menus`, `menu_items`, et `pages` créées (via `setup-menu-system.js`)

### Variables d'environnement requises
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

## 📝 Pages Statiques Migrées

Le script migre automatiquement les pages suivantes :

### Pages Principales
- **home** - Page d'accueil principale
- **community** - Page communauté IA
- **blog** - Blog de la plateforme
- **modules** - Page des applications utilisateur

### Pages d'Authentification
- **login** - Page de connexion
- **register** - Page d'inscription

### Pages Administratives
- **admin** - Interface d'administration

### Pages de Paiement
- **success** - Confirmation de paiement réussi
- **cancel** - Annulation de paiement

### Pages Légales et Informatives
- **about** - À propos de IAhome
- **contact** - Page de contact
- **pricing** - Tarifs et offres
- **privacy** - Politique de confidentialité
- **terms** - Conditions d'utilisation

## 🛠️ Utilisation

### Méthode 1 : Script Batch (Windows)
```bash
# Double-cliquer sur le fichier
run-migrate-pages.bat
```

### Méthode 2 : Ligne de commande
```bash
# Migrer les nouvelles pages
node migrate-static-pages.js migrate

# Mettre à jour les pages existantes
node migrate-static-pages.js update

# Afficher les statistiques
node migrate-static-pages.js stats
```

## 📊 Commandes Disponibles

### `migrate`
Migre uniquement les nouvelles pages qui n'existent pas encore dans la base de données.

**Exemple de sortie :**
```
🚀 Début de la migration des pages statiques...

✅ Table pages trouvée

📊 Pages existantes: 3
  - home: Accueil - IAhome
  - blog: Blog IAHome
  - community: Construire une communauté IA engagée

📝 Pages à migrer: 10
  - login: Connexion - IAhome
  - register: Inscription - IAhome
  - admin: Administration - IAhome
  ...

✅ Migration réussie !
📊 10 pages migrées:
  - login: Connexion - IAhome
  - register: Inscription - IAhome
  ...
```

### `update`
Met à jour toutes les pages existantes avec les nouvelles informations (titre, description, meta tags).

### `stats`
Affiche les statistiques complètes des pages.

**Exemple de sortie :**
```
📊 Statistiques des pages...

📈 Total des pages: 13
✅ Pages publiées: 13
🏠 Pages d'accueil: 1
⏸️ Pages en brouillon: 0

📋 Liste complète:
  🏠 home: Accueil - IAhome
  ✅ about: À propos - IAhome
  ✅ admin: Administration - IAhome
  ✅ blog: Blog IAHome
  ...
```

## 🔧 Personnalisation

### Ajouter de nouvelles pages
Modifiez le tableau `staticPages` dans `migrate-static-pages.js` :

```javascript
const staticPages = [
  // ... pages existantes ...
  {
    slug: 'nouvelle-page',
    title: 'Nouvelle Page - IAhome',
    description: 'Description de la nouvelle page',
    content: 'Contenu de la page',
    is_published: true,
    is_homepage: false,
    meta_title: 'Nouvelle Page - IAhome',
    meta_description: 'Description SEO de la nouvelle page'
  }
];
```

### Modifier les pages existantes
Les modifications dans le tableau `staticPages` seront appliquées lors de l'exécution de la commande `update`.

## 🔗 Intégration avec l'Interface d'Administration

Une fois les pages migrées, elles sont automatiquement disponibles dans l'interface d'administration :

1. **Accéder à l'admin** : `/admin/menus`
2. **Onglet "Pages"** : Gérer les pages migrées
3. **Modifications** : Éditer le contenu, les meta tags, etc.
4. **Publication** : Activer/désactiver les pages

## 📱 Utilisation dans les Menus

Les pages migrées peuvent être référencées dans les éléments de menu :

1. **Créer un élément de menu** dans l'admin
2. **Sélectionner une page** dans le champ "Page associée"
3. **L'URL sera automatiquement** générée à partir du slug de la page

## 🚨 Dépannage

### Erreur : "Table pages not found"
```bash
# Exécuter d'abord le script de setup
node setup-menu-system.js
```

### Erreur : "Variables d'environnement manquantes"
Vérifiez que votre fichier `.env` contient :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Erreur : "Permission denied"
Assurez-vous que votre clé service role a les permissions d'écriture sur la table `pages`.

## 📈 Statistiques et Monitoring

### Vérifier l'état des pages
```bash
node migrate-static-pages.js stats
```

### Vérifier dans l'interface admin
- Aller sur `/admin/menus`
- Onglet "Pages"
- Voir la liste complète des pages

## 🔄 Workflow Recommandé

1. **Première installation** :
   ```bash
   node setup-menu-system.js
   node migrate-static-pages.js migrate
   ```

2. **Ajout de nouvelles pages** :
   - Modifier `migrate-static-pages.js`
   - Exécuter `node migrate-static-pages.js migrate`

3. **Mise à jour de pages existantes** :
   - Modifier `migrate-static-pages.js`
   - Exécuter `node migrate-static-pages.js update`

4. **Vérification** :
   ```bash
   node migrate-static-pages.js stats
   ```

## 📞 Support

En cas de problème :
1. Vérifiez les logs d'erreur
2. Consultez la documentation Supabase
3. Vérifiez les permissions de la clé service role
4. Testez la connexion à la base de données

---

**Note** : Ce script est conçu pour être exécuté en toute sécurité et ne supprime jamais de données existantes. Il ajoute uniquement les nouvelles pages ou met à jour les informations des pages existantes. 