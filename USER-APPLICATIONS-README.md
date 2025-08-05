# Gestion des Applications Utilisateur

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux administrateurs de gérer les applications (modules) activées par chaque utilisateur, ainsi que leurs tokens d'accès associés. Elle offre un contrôle granulaire sur les accès utilisateur avec possibilité de modification et suppression.

## 🚀 Fonctionnalités

### 1. **Tableau des Utilisateurs Amélioré**
- **Colonne Applications** : Affiche le nombre total d'applications et d'applications actives
- **Colonne Tokens** : Affiche le nombre total de tokens et de tokens actifs
- **Boutons d'action** : "Gérer les applications" et "Voir les tokens"

### 2. **Modal de Gestion des Applications**
- **Section Applications** : Liste détaillée des applications activées
- **Section Tokens** : Liste des tokens d'accès avec statistiques d'utilisation
- **Statistiques utilisateur** : Vue d'ensemble des accès

### 3. **Actions Disponibles**
- ✅ **Activer/Désactiver** une application
- ✅ **Supprimer** une application
- ✅ **Supprimer** un token d'accès
- ✅ **Modifier le rôle** utilisateur

## 🗄️ Structure de la Base de Données

### Table `user_applications`
```sql
CREATE TABLE user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    access_level TEXT NOT NULL DEFAULT 'basic' CHECK (access_level IN ('basic', 'premium', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### Sécurité (RLS)
- **Utilisateurs** : Peuvent voir et modifier leurs propres applications
- **Admins** : Peuvent voir, modifier, créer et supprimer toutes les applications

## 🎯 Utilisation

### 1. **Accéder à la Gestion**
1. Aller sur `/admin`
2. Cliquer sur l'onglet "Utilisateurs"
3. Cliquer sur "Gérer" ou "Gérer les applications" pour un utilisateur

### 2. **Gérer les Applications**
- **Voir les détails** : Module, niveau d'accès, statut, date d'activation
- **Activer/Désactiver** : Bouton pour basculer le statut
- **Supprimer** : Suppression définitive de l'accès

### 3. **Gérer les Tokens**
- **Voir les détails** : Nom, module, niveau, utilisation, statut
- **Barre de progression** : Visualisation de l'utilisation
- **Supprimer** : Suppression du token

### 4. **Statistiques**
- **Applications totales** : Nombre total d'applications
- **Applications actives** : Nombre d'applications actuellement actives
- **Tokens d'accès** : Nombre total de tokens
- **Tokens valides** : Nombre de tokens actifs et non expirés

## 🔧 Installation

### 1. **Créer la Table**
```bash
# Exécuter le script SQL
run-create-user-applications-table.bat
```

### 2. **Vérifier les Permissions**
- S'assurer que l'utilisateur admin a les droits nécessaires
- Vérifier que les politiques RLS sont correctement appliquées

### 3. **Tester les Fonctionnalités**
- Créer quelques applications de test
- Tester les actions de modification et suppression
- Vérifier les statistiques

## 📊 Interface Utilisateur

### Tableau des Utilisateurs
```
| Email | Rôle | Applications | Tokens | Date d'inscription | Actions |
|-------|------|--------------|--------|-------------------|---------|
| user@example.com | Utilisateur | 3 total, 2 actives | 5 total, 3 actifs | 01/01/2024 | Gérer |
```

### Modal de Gestion
```
┌─────────────────────────────────────────────────────────┐
│ Applications de user@example.com                    [×] │
├─────────────────────────────────────────────────────────┤
│ 📱 Applications activées                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Module | Niveau | Statut | Date | Actions          │ │
│ │ Stable Diffusion | Premium | Active | 01/01/2024   │ │
│ │ [Désactiver] [Supprimer]                            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 🔑 Tokens d'accès                                       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Nom | Module | Niveau | Utilisation | Statut      │ │
│ │ Token SD | Stable Diffusion | Premium | 5/10      │ │
│ │ [████████░░] Actif                    [Supprimer]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 📊 Statistiques utilisateur                            │
│ ┌─────┬─────┬─────┬─────┐                              │
│ │ 3   │ 2   │ 5   │ 3   │                              │
│ │Total│Actif│Token│Valid│                              │
│ └─────┴─────┴─────┴─────┘                              │
└─────────────────────────────────────────────────────────┘
```

## 🔒 Sécurité

### Contrôles d'Accès
- **RLS (Row Level Security)** activé sur toutes les tables
- **Politiques granulaires** pour les différents niveaux d'accès
- **Validation des permissions** côté serveur et client

### Audit Trail
- **Timestamps** automatiques (created_at, updated_at)
- **Historique des modifications** via les triggers
- **Traçabilité** des actions administrateur

## 🚨 Gestion des Erreurs

### Erreurs Courantes
1. **Permission Denied** : Vérifier le rôle utilisateur
2. **Foreign Key Constraint** : Vérifier l'existence des modules/utilisateurs
3. **RLS Policy Violation** : Vérifier les politiques de sécurité

### Logs et Monitoring
- **Console logs** pour le debugging
- **Alertes utilisateur** pour les actions importantes
- **Validation des données** avant sauvegarde

## 🔄 Maintenance

### Tâches Régulières
- **Nettoyage des tokens expirés** (optionnel)
- **Vérification des politiques RLS**
- **Mise à jour des statistiques**

### Optimisations
- **Index sur les colonnes fréquemment utilisées**
- **Requêtes optimisées** avec JOIN
- **Pagination** pour les grandes listes

## 📝 Notes de Développement

### Architecture
- **Frontend** : React avec TypeScript
- **Backend** : Supabase avec PostgreSQL
- **État** : Gestion locale avec useState/useEffect

### Extensibilité
- **Interface modulaire** pour ajouter de nouvelles fonctionnalités
- **API REST** pour les opérations CRUD
- **Système de permissions** extensible

---

## 🎉 Conclusion

Cette fonctionnalité offre un contrôle complet sur les accès utilisateur avec une interface intuitive et des fonctionnalités de sécurité robustes. Elle s'intègre parfaitement dans l'écosystème existant et permet une gestion efficace des applications et tokens. 