# Guide pour ajouter les colonnes detail_* à la table cartes

## Problème identifié

Les champs de la deuxième partie du formulaire de modification des modules sont vides car les colonnes `detail_*` n'existent pas dans la table `cartes` de votre base de données Supabase.

## Solution

### Étape 1 : Accéder à l'éditeur SQL de Supabase

1. Allez sur : https://supabase.com/dashboard/project/xemtoyzcihmncbrlsmhr/sql
2. Connectez-vous à votre compte Supabase si nécessaire

### Étape 2 : Exécuter le script SQL

Copiez et collez le script suivant dans l'éditeur SQL :

```sql
-- Script pour ajouter les colonnes detail_* à la table cartes
-- Ces colonnes permettront de stocker les informations des pages détaillées

ALTER TABLE cartes 
ADD COLUMN IF NOT EXISTS detail_title TEXT,
ADD COLUMN IF NOT EXISTS detail_content TEXT,
ADD COLUMN IF NOT EXISTS detail_meta_description TEXT,
ADD COLUMN IF NOT EXISTS detail_slug TEXT,
ADD COLUMN IF NOT EXISTS detail_is_published BOOLEAN DEFAULT false;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cartes' 
AND column_name LIKE 'detail_%'
ORDER BY column_name;
```

### Étape 3 : Vérifier l'exécution

1. Cliquez sur "Run" pour exécuter le script
2. Vous devriez voir un message de succès
3. La requête SELECT devrait afficher les 5 nouvelles colonnes :
   - detail_title
   - detail_content
   - detail_meta_description
   - detail_slug
   - detail_is_published

### Étape 4 : Vérifier localement

Après avoir exécuté le script SQL, lancez cette commande pour vérifier :

```bash
node check-cartes-structure.js
```

Vous devriez voir que les colonnes `detail_*` ne sont plus marquées comme "MANQUANTE".

### Étape 5 : Tester le formulaire

1. Redémarrez votre serveur de développement si nécessaire
2. Allez sur http://localhost:3000/admin/cartes
3. Cliquez sur "Modifier" pour un module existant
4. Les champs de la deuxième partie du formulaire devraient maintenant être visibles et fonctionnels

## Colonnes ajoutées

- **detail_title** : Titre de la page détaillée
- **detail_content** : Contenu détaillé de la page (support Markdown)
- **detail_meta_description** : Description meta pour le SEO
- **detail_slug** : URL slug pour la page détaillée
- **detail_is_published** : Statut de publication (true/false)

## Fonctionnalités

Une fois les colonnes ajoutées, vous pourrez :

1. **Modifier les pages détaillées** directement depuis le formulaire d'administration
2. **Voir le contenu existant** dans les champs du formulaire
3. **Sauvegarder les modifications** des pages détaillées
4. **Gérer le statut de publication** des pages détaillées

## Dépannage

Si vous rencontrez des problèmes :

1. **Vérifiez que le script SQL s'est bien exécuté** en regardant les résultats
2. **Relancez le script de vérification** : `node check-cartes-structure.js`
3. **Redémarrez votre serveur** : `npm run dev`
4. **Videz le cache du navigateur** et rechargez la page

## Notes importantes

- Les colonnes existantes ne seront pas affectées
- Les nouvelles colonnes auront des valeurs NULL par défaut
- Le formulaire gère automatiquement les valeurs NULL en les affichant comme des champs vides
- Vous pouvez maintenant remplir les pages détaillées pour chaque module 