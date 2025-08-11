# Structure des Bannières - IAhome

## 🎨 **Nouvelle Architecture à Double Bannière**

### **Bannière Bleue (Haut) - Fonctions de Connexion**
- **Couleur** : `bg-blue-600` avec texte blanc
- **Hauteur** : `h-10` (40px)
- **Fonction** : Gestion de l'état de connexion et accès aux applications

#### **Mode Non Connecté :**
- Message de bienvenue
- Bouton "Se connecter" (lien vers `/login`)
- Bouton "Commencer" (lien vers `/register`)

#### **Mode Connecté :**
- Affichage de l'email de l'utilisateur
- Indicateur de statut (CONNECTÉ/ADMIN) avec animation
- Bouton "Mes applis" (lien vers `/encours`)
- Bouton "Se déconnecter"

### **Bannière Blanche (Bas) - Navigation du Site**
- **Couleur** : `bg-white` avec ombre légère
- **Hauteur** : `h-16` (64px)
- **Fonction** : Navigation principale et identité du site

#### **Éléments :**
- Logo IAhome avec icône
- Menu de navigation dynamique (Desktop)
- Bouton "Contact commercial"
- Menu hamburger (Mobile)

## 📱 **Responsive Design**

### **Desktop (md et plus) :**
- Bannière bleue : Affichage complet avec tous les éléments
- Bannière blanche : Navigation horizontale complète

### **Mobile (moins que md) :**
- Bannière bleue : Éléments condensés, texte masqué si nécessaire
- Bannière blanche : Menu hamburger avec déroulement vertical

## 🔧 **Classes CSS Utilisées**

### **Bannière Bleue :**
```css
bg-blue-600 text-white shadow-sm
h-10
px-4 sm:px-6 lg:px-8
```

### **Bannière Blanche :**
```css
bg-white shadow-sm border-b border-gray-100
h-16
px-4 sm:px-6 lg:px-8
```

### **Responsive :**
```css
hidden sm:inline  /* Masquer sur mobile */
hidden md:flex    /* Masquer sur mobile, flex sur desktop */
md:hidden         /* Afficher seulement sur mobile */
```

## 🎯 **Fonctionnalités**

### **États de Connexion :**
- **Non connecté** : Boutons de connexion/inscription
- **Connecté** : Informations utilisateur + accès aux applis
- **Admin** : Indicateur spécial + accès administrateur

### **Navigation :**
- **Desktop** : Menu horizontal complet
- **Mobile** : Menu hamburger avec déroulement
- **Dynamique** : Adaptation selon le rôle utilisateur

### **Accessibilité :**
- Contrastes appropriés
- Tailles de texte lisibles
- Interactions claires

## 📐 **Dimensions Totales**

- **Hauteur totale** : 104px (40px + 64px)
- **Padding main** : `pt-20` (80px) pour compenser
- **Z-index** : `z-50` pour rester au-dessus du contenu

## 🔄 **États et Transitions**

### **Animations :**
- Indicateur de statut : `animate-pulse`
- Boutons : `transition-colors`
- Menu mobile : Ouverture/fermeture fluide

### **Hover Effects :**
- Boutons : Changement de couleur de fond
- Logo : `hover:opacity-80`
- Liens : Transitions douces 