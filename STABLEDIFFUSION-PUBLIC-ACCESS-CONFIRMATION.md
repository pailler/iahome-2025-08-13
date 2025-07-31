# 🎨 Confirmation - Accès au Site Public Stable Diffusion

## ✅ URL Publique Confirmée

Le système IAHome utilise **déjà** l'URL publique `https://stablediffusion.regispailler.fr` et non une adresse locale.

## 🔗 Configuration Actuelle

### 📍 URL Cible
```
https://stablediffusion.regispailler.fr
```

### 🔐 Credentials
- **Username** : `admin`
- **Password** : `Rasulova75`
- **Authentification** : HTTP Basic Auth

## 🛠️ Fichiers de Configuration

### 1. API Proxy Access (`src/app/api/proxy-access/route.ts`)
```typescript
const moduleUrls: { [key: string]: string } = {
  'IAmetube': 'https://metube.regispailler.fr',
  'stablediffusion': 'https://stablediffusion.regispailler.fr', // ✅ URL PUBLIQUE
  'IAphoto': 'https://iaphoto.regispailler.fr',
  'IAvideo': 'https://iavideo.regispailler.fr',
};
```

### 2. API Proxy Module (`src/app/api/proxy-module/[...path]/route.ts`)
```typescript
const MODULE_URLS: { [key: string]: string } = {
  'stablediffusion': 'https://stablediffusion.regispailler.fr', // ✅ URL PUBLIQUE
};
```

### 3. Page d'Accueil (`src/app/page.tsx`)
```typescript
const moduleUrls: { [key: string]: string } = {
  'IAmetube': 'https://metube.regispailler.fr',
  'iatube': 'https://metube.regispailler.fr',
  'stablediffusion': 'https://stablediffusion.regispailler.fr', // ✅ URL PUBLIQUE
};
```

## 🔄 Flux d'Accès Complet

1. **Clic sur le bouton** "Accéder à Stable Diffusion"
2. **Génération de l'URL** avec le magic link
3. **Validation du token** côté serveur
4. **Proxy vers** `https://stablediffusion.regispailler.fr` (URL PUBLIQUE)
5. **Injection automatique** des credentials `admin/Rasulova75`
6. **Affichage** de l'interface Stable Diffusion publique

## 🎯 Bouton "Accéder à Stable Diffusion"

### 📍 Emplacement
- **Page** : Accueil d'IAHome (`http://localhost:8021`)
- **Section** : Héros, sous la barre de recherche
- **Design** : Bouton dégradé violet/rose avec icône 🎨

### 🔗 URL Générée
```
http://localhost:8021/api/proxy-access?token=46e2c757429488251079882de116364f418a9ed0e318027720ae524569db63f4&module=stablediffusion
```

### 🎯 Destination Finale
```
https://stablediffusion.regispailler.fr
```

## 🚀 Comment Tester

1. **Démarrez le serveur** : `npm run dev`
2. **Accédez à** : `http://localhost:8021`
3. **Cliquez sur** le bouton "Accéder à Stable Diffusion"
4. **L'interface publique** `https://stablediffusion.regispailler.fr` s'ouvre avec authentification automatique

## ✅ Confirmation

- ✅ **URL publique** utilisée : `https://stablediffusion.regispailler.fr`
- ✅ **Pas d'adresse locale** dans la configuration
- ✅ **Credentials publics** : `admin/Rasulova75`
- ✅ **Authentification automatique** via HTTP Basic Auth
- ✅ **Proxy sécurisé** pour l'accès

Le système accède bien au **site public** `stablediffusion.regispailler.fr` et non à une adresse locale ! 