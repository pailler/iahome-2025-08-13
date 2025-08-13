# IAHome - Plateforme d'Intelligence Artificielle

Une plateforme moderne pour accéder à des outils d'IA via une interface web élégante.

## 🚀 Fonctionnalités

- **Interface utilisateur moderne** et responsive
- **Gestion des modules d'IA** avec système de tokens
- **Système d'authentification** sécurisé
- **Interface d'administration** complète
- **Gestion des utilisateurs** et attribution de tokens
- **Déploiement Docker** optimisé

## 🛠️ Installation

### Prérequis
- Node.js 18+
- Docker et Docker Compose
- Base de données PostgreSQL (Supabase recommandé)

### Démarrage rapide
```bash
# Cloner le repository
git clone <repository-url>
cd iahome

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec vos configurations

# Lancer avec Docker
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📁 Structure du projet

```
iahome/
├── src/                    # Code source Next.js
│   ├── app/               # Pages et API routes
│   ├── components/        # Composants React
│   └── utils/            # Utilitaires
├── scripts/              # Scripts SQL essentiels
│   └── init-db.sql      # Initialisation de la base
├── docker-compose.prod.yml # Configuration Docker production
├── Dockerfile            # Image Docker
└── README.md            # Ce fichier
```

## 🔧 Configuration

### Variables d'environnement
- `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clé anonyme Supabase
- `JWT_SECRET` - Clé secrète JWT
- `NEXT_PUBLIC_APP_URL` - URL de l'application

### Base de données
Exécutez `scripts/init-db.sql` pour initialiser la base de données.

## 🐳 Déploiement

### Production avec Docker
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Accès
- **Application** : http://localhost:3000
- **Dashboard Traefik** : http://localhost:8080

## 📝 Scripts disponibles

- `npm run dev` - Développement local
- `npm run build` - Build de production
- `npm run start` - Démarrage production
- `npm run lint` - Vérification du code

## 🔒 Sécurité

- Authentification Supabase
- Gestion des tokens JWT
- Validation des permissions
- Interface admin sécurisée

## 🧹 Nettoyage effectué

- ✅ Suppression des fichiers de diagnostic et de test obsolètes
- ✅ Suppression des scripts SQL temporaires et de vérification
- ✅ Suppression des fichiers de configuration nginx obsolètes
- ✅ Suppression des fichiers de migration et de déploiement obsolètes
- ✅ Mise à jour du .gitignore pour exclure les fichiers temporaires
- ✅ Conservation uniquement des fichiers essentiels

## 📞 Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue.