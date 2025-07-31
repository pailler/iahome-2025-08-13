# Guide de réparation - Problème d'inscription (Erreur 500)

## Problème identifié

L'erreur 500 lors de l'inscription est causée par un trigger manquant `handle_new_user` qui devrait créer automatiquement un profil utilisateur dans la table `profiles` lors de l'inscription.

## Solution

### Étape 1 : Exécuter le script de réparation complet

1. Allez dans votre dashboard Supabase
2. Ouvrez l'éditeur SQL
3. Copiez et exécutez le contenu du fichier `fix-inscription-complete.sql`

Ce script va :
- Créer la table `profiles` si elle n'existe pas
- Créer la fonction `handle_new_user`
- Créer le trigger `on_auth_user_created` sur la table `auth.users`
- Configurer correctement les politiques RLS
- Vérifier que tout fonctionne

### Étape 2 : Vérification

Après avoir exécuté le script, vous devriez voir :
- "Configuration terminée avec succès"
- Trois lignes avec "OK" pour chaque vérification

### Étape 3 : Test d'inscription

1. Essayez de créer un nouveau compte avec l'email `pailleradam@gmail.com`
2. L'inscription devrait maintenant fonctionner sans erreur 500
3. Un profil utilisateur sera automatiquement créé dans la table `profiles`

## Fichiers créés

- `fix-inscription-complete.sql` : Script principal de réparation
- `create-handle-new-user-trigger.sql` : Script spécifique pour le trigger
- `fix-profiles-rls-policies.sql` : Script pour les politiques RLS
- `diagnostic-inscription.sql` : Script de diagnostic

## Détails techniques

### Le trigger `handle_new_user`

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Ce trigger s'exécute automatiquement après chaque insertion dans `auth.users` et crée un profil correspondant dans la table `profiles`.

### Politiques RLS

Les politiques RLS permettent :
- Aux utilisateurs de voir et modifier leur propre profil
- Aux admins de voir et modifier tous les profils
- L'insertion automatique par le trigger

## En cas de problème persistant

Si l'erreur persiste après avoir exécuté le script :

1. Exécutez le script de diagnostic `diagnostic-inscription.sql`
2. Vérifiez les logs dans le dashboard Supabase
3. Contactez le support si nécessaire

## Notes importantes

- Le trigger utilise `SECURITY DEFINER` pour contourner les restrictions RLS lors de l'insertion automatique
- Les erreurs dans le trigger sont capturées et loggées sans faire échouer l'inscription
- La table `profiles` est liée à `auth.users` par une clé étrangère avec suppression en cascade 