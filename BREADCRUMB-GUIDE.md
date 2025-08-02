# Guide d'utilisation du Fil d'Ariane (Breadcrumb)

## 📋 Vue d'ensemble

Le composant `Breadcrumb` a été ajouté au projet pour améliorer la navigation et l'expérience utilisateur. Il affiche automatiquement le chemin de navigation actuel et permet aux utilisateurs de naviguer facilement entre les pages.

## 🎯 Fonctionnalités

### Génération automatique
- **Détection automatique** : Le breadcrumb se génère automatiquement en fonction de l'URL actuelle
- **Mapping intelligent** : Les segments d'URL sont convertis en labels lisibles (ex: `admin` → `Administration`)
- **Navigation contextuelle** : Chaque segment (sauf le dernier) est cliquable

### Personnalisation
- **Items personnalisés** : Possibilité de passer des items personnalisés
- **Affichage conditionnel** : Option pour masquer le lien "Accueil"
- **Responsive** : S'adapte aux différentes tailles d'écran

## 🚀 Utilisation

### Import du composant
```tsx
import Breadcrumb from '../components/Breadcrumb';
```

### Utilisation basique (génération automatique)
```tsx
<Breadcrumb />
```

### Utilisation avec items personnalisés
```tsx
<Breadcrumb 
  items={[
    { label: 'Accueil', href: '/' },
    { label: 'Administration', href: '/admin' },
    { label: 'Modules' } // Pas de href = page courante
  ]} 
/>
```

### Masquer le lien "Accueil"
```tsx
<Breadcrumb showHome={false} />
```

## 📍 Pages où le breadcrumb est intégré

### ✅ Pages avec breadcrumb
1. **Page d'accueil** (`/`) - Breadcrumb simple
2. **Administration** (`/admin`) - Accueil > Administration
3. **Gestion des modules** (`/admin/cartes`) - Accueil > Administration > Modules
4. **Blog** (`/blog`) - Accueil > Blog
5. **Article de blog** (`/blog/[slug]`) - Accueil > Blog > [Titre de l'article]
6. **Page de module** (`/card/[id]`) - Accueil > Module > [Titre du module]

### 🔄 Mapping automatique des segments

| Segment URL | Label affiché |
|-------------|---------------|
| `admin` | Administration |
| `cartes` | Modules |
| `blog` | Blog |
| `users` | Utilisateurs |
| `card` | Module |
| `access` | Accès |
| `proxy` | Proxy |
| `modules` | Modules |
| `modules-access` | Accès aux modules |
| `secure-access` | Accès sécurisé |
| `login` | Connexion |
| `register` | Inscription |
| `success` | Succès |
| `cancel` | Annulation |
| `encours` | En cours |
| `selections` | Sélections |
| `test` | Test |
| `debug` | Debug |

## 🎨 Style et design

### Classes CSS utilisées
- **Container** : `bg-white border-b border-gray-200 px-4 py-3 mb-6`
- **Liste** : `flex items-center space-x-2 text-sm`
- **Liens** : `text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium`
- **Page courante** : `text-gray-900 font-semibold`
- **Séparateur** : `w-4 h-4 text-gray-400 mx-2`

### Responsive
- Le breadcrumb s'adapte automatiquement aux différentes tailles d'écran
- Les textes longs sont gérés avec des ellipses si nécessaire

## 🔧 Personnalisation avancée

### Ajouter de nouveaux mappings
Pour ajouter de nouveaux segments d'URL, modifiez le switch dans `src/components/Breadcrumb.tsx` :

```tsx
switch (segment) {
  case 'nouveau-segment':
    label = 'Nouveau Label';
    break;
  // ... autres cas
}
```

### Modifier le style
Le style peut être personnalisé en modifiant les classes Tailwind dans le composant.

## 📱 Accessibilité

- **ARIA label** : `aria-label="Fil d'Ariane"`
- **Navigation sémantique** : Utilise la balise `<nav>`
- **Liste ordonnée** : Utilise `<ol>` pour la structure
- **Liens clairs** : Chaque lien a un texte descriptif

## 🎯 Avantages

1. **Navigation intuitive** : Les utilisateurs savent toujours où ils se trouvent
2. **Retour facile** : Navigation rapide vers les pages parentes
3. **SEO friendly** : Améliore la structure de navigation pour les moteurs de recherche
4. **UX améliorée** : Réduit la confusion et améliore l'expérience utilisateur
5. **Maintenance facile** : Génération automatique, pas besoin de maintenance manuelle

## 🔄 Mise à jour

Le breadcrumb se met à jour automatiquement lors de la navigation. Aucune action manuelle n'est requise pour maintenir les liens.

---

*Dernière mise à jour : [Date]* 