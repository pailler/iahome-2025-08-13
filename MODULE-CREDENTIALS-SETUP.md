# Configuration des Credentials des Modules

## Variables à ajouter dans `.env.local`

Ajoutez les lignes suivantes à votre fichier `.env.local` :

```bash
# Module Credentials (HTTP Basic Auth)
# Stable Diffusion
STABLEDIFFUSION_USERNAME=admin
STABLEDIFFUSION_PASSWORD=Rasulova75

# MeTube
METUBE_USERNAME=admin
METUBE_PASSWORD=password

# IA Photo
IAPHOTO_USERNAME=admin
IAPHOTO_PASSWORD=password

# IA Video
IAVIDEO_USERNAME=admin
IAVIDEO_PASSWORD=password
```

## Explication

Ces variables d'environnement permettent au proxy d'authentifier automatiquement les requêtes vers les modules sécurisés :

- **STABLEDIFFUSION_USERNAME** et **STABLEDIFFUSION_PASSWORD** : Credentials pour accéder à stablediffusion.regispailler.fr
- **METUBE_USERNAME** et **METUBE_PASSWORD** : Credentials pour accéder à metube.regispailler.fr
- **IAPHOTO_USERNAME** et **IAPHOTO_PASSWORD** : Credentials pour accéder à iaphoto.regispailler.fr
- **IAVIDEO_USERNAME** et **IAVIDEO_PASSWORD** : Credentials pour accéder à iavideo.regispailler.fr

## Sécurité

⚠️ **Important** : 
- Ne commitez jamais le fichier `.env.local` dans Git
- Changez les mots de passe par défaut en production
- Utilisez des mots de passe forts pour chaque module

## Test

Après avoir ajouté ces variables, redémarrez votre serveur de développement :

```bash
npm run dev
```

Le proxy devrait maintenant pouvoir authentifier automatiquement les requêtes vers stablediffusion. 