# 🚀 Guide d'Intégration LinkedIn - IAhome

## 📋 Vue d'ensemble

Cette intégration permet de publier automatiquement du contenu sur LinkedIn depuis votre plateforme IAhome. Vous pouvez :
- Publier des articles de blog
- Partager des modules IA
- Programmer des publications
- Suivre les statistiques

## 🗄️ Tables créées

### 1. `linkedin_config`
Stockage de la configuration LinkedIn :
- `access_token` : Token d'accès LinkedIn
- `refresh_token` : Token de rafraîchissement
- `company_id` : ID de votre entreprise LinkedIn
- `company_name` : Nom de votre entreprise

### 2. `linkedin_posts`
Gestion des posts :
- `title` : Titre du post
- `content` : Contenu du post
- `status` : draft, scheduled, published, failed
- `source_type` : manual, blog, module
- `source_id` : ID de l'article ou module source
- `scheduled_at` : Date de programmation
- `linkedin_post_id` : ID du post sur LinkedIn

### 3. `linkedin_analytics`
Statistiques des posts :
- `impressions` : Nombre d'impressions
- `clicks` : Nombre de clics
- `likes` : Nombre de likes
- `comments` : Nombre de commentaires
- `shares` : Nombre de partages

## 🔧 Configuration LinkedIn

### Étape 1 : Créer une application LinkedIn

1. Allez sur [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Cliquez sur **"Create App"**
3. Remplissez les informations :
   - **App name** : IAhome LinkedIn Integration
   - **LinkedIn Page** : Votre page entreprise
   - **App Logo** : Logo de votre entreprise

### Étape 2 : Configurer les permissions

Dans votre application LinkedIn, ajoutez ces permissions :
- `r_liteprofile` : Accès au profil de base
- `w_member_social` : Publier du contenu
- `r_organization_social` : Accès aux posts de l'organisation

### Étape 3 : Obtenir les credentials

1. **Client ID** : Copié depuis la page de votre app
2. **Client Secret** : Copié depuis la page de votre app
3. **Company ID** : ID de votre page entreprise LinkedIn

## 🎯 Utilisation de l'Interface Admin

### Accès à l'interface
1. Connectez-vous à votre compte admin
2. Allez sur `/admin/linkedin`
3. Configurez vos credentials LinkedIn

### Fonctionnalités disponibles

#### 1. Configuration LinkedIn
- Entrez votre Client ID, Client Secret, Company ID
- Testez la connexion
- Sauvegardez la configuration

#### 2. Création de posts
- **Titre** : Titre du post
- **Contenu** : Contenu du post (supporte le formatage LinkedIn)
- **Source** : Manuel, Article de blog, ou Module IA
- **Programmation** : Date et heure de publication

#### 3. Gestion des posts
- Voir tous les posts créés
- Modifier le statut
- Supprimer des posts
- Voir les statistiques

#### 4. Import automatique
- Sélectionner un article de blog existant
- Sélectionner un module IA existant
- Le titre et contenu sont automatiquement remplis

## 📊 API Endpoints

### POST `/api/linkedin/publish`
Publie un post sur LinkedIn

**Paramètres :**
```json
{
  "title": "Titre du post",
  "content": "Contenu du post",
  "scheduledAt": "2024-01-15T10:00:00Z",
  "publishNow": true
}
```

**Réponse :**
```json
{
  "success": true,
  "linkedinPostId": "urn:li:activity:123456789",
  "linkedinUrl": "https://www.linkedin.com/posts/..."
}
```

## 🔒 Sécurité

### RLS (Row Level Security)
- Seuls les utilisateurs avec le rôle `admin` peuvent accéder aux tables
- Les tokens LinkedIn sont chiffrés
- Les permissions sont vérifiées à chaque requête

### Tokens LinkedIn
- Stockage sécurisé des access tokens
- Rafraîchissement automatique des tokens expirés
- Pas d'exposition des credentials dans le code

## 🚀 Déploiement

### Variables d'environnement
Ajoutez dans votre `.env.local` :
```env
LINKEDIN_CLIENT_ID=votre_client_id
LINKEDIN_CLIENT_SECRET=votre_client_secret
LINKEDIN_COMPANY_ID=votre_company_id
```

### Vérification du déploiement
1. Vérifiez que les tables sont créées dans Supabase
2. Testez l'interface admin `/admin/linkedin`
3. Créez un post de test
4. Vérifiez la publication sur LinkedIn

## 📈 Statistiques et Analytics

### Métriques disponibles
- **Impressions** : Nombre de fois que le post a été vu
- **Clics** : Nombre de clics sur le post
- **Engagement** : Likes + commentaires + partages
- **Taux d'engagement** : Engagement / impressions

### Suivi automatique
- Les statistiques sont mises à jour automatiquement
- Historique des performances
- Comparaison entre posts

## 🛠️ Dépannage

### Problèmes courants

#### 1. "Erreur d'authentification LinkedIn"
- Vérifiez vos Client ID et Client Secret
- Assurez-vous que l'application est approuvée
- Vérifiez les permissions de l'application

#### 2. "Post non publié"
- Vérifiez le contenu (pas de caractères spéciaux interdits)
- Assurez-vous que la page entreprise est active
- Vérifiez les limites de publication LinkedIn

#### 3. "Erreur RLS"
- Connectez-vous en tant qu'admin
- Vérifiez que votre utilisateur a le rôle `admin`
- Vérifiez les politiques RLS dans Supabase

### Logs et debugging
- Vérifiez les logs dans la console du navigateur
- Consultez les logs Supabase
- Testez avec l'outil de diagnostic

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce guide
2. Consultez la documentation LinkedIn API
3. Contactez l'équipe de développement

---

**Version** : 1.0  
**Dernière mise à jour** : Août 2024  
**Auteur** : Équipe IAhome 