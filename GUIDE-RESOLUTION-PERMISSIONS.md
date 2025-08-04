# Guide de Résolution des Problèmes de Permissions Supabase

## 🔍 Diagnostic du problème

Le problème principal est que la table `modules` n'a pas les bonnes politiques RLS (Row Level Security) configurées, ce qui empêche l'accès aux données depuis l'application.

## 🛠️ Solutions disponibles

### Solution 1 : Configurer les politiques RLS (Recommandée)

Exécutez le script `fix-modules-rls-policies.sql` dans votre base de données Supabase :

```sql
-- Ce script configure les politiques de sécurité appropriées
-- 1. Lecture publique pour tous les utilisateurs
-- 2. Écriture réservée aux administrateurs
```

**Avantages :**
- ✅ Sécurité appropriée
- ✅ Accès public en lecture
- ✅ Contrôle d'accès en écriture

### Solution 2 : Désactiver RLS temporairement (Pour les tests)

Exécutez le script `disable-modules-rls-temp.sql` :

```sql
-- Ce script désactive temporairement RLS pour permettre l'accès
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
```

**⚠️ Attention :** Cette solution désactive la sécurité - à utiliser uniquement pour les tests !

### Solution 3 : Vérifier les rôles utilisateurs

Exécutez le script `check-and-fix-user-roles.sql` pour vérifier que vous avez un utilisateur avec le rôle `admin`.

## 📋 Étapes de résolution

### Étape 1 : Diagnostiquer le problème

1. **Exécuter le test de permissions :**
   ```bash
   node test-supabase-permissions.js
   ```

2. **Vérifier les politiques actuelles :**
   ```sql
   -- Dans l'interface SQL de Supabase
   SELECT * FROM pg_policies WHERE tablename = 'modules';
   ```

### Étape 2 : Appliquer la solution

#### Option A : Configuration sécurisée (Recommandée)
```sql
-- Exécuter fix-modules-rls-policies.sql
-- Puis vérifier qu'un utilisateur a le rôle 'admin'
```

#### Option B : Solution temporaire pour les tests
```sql
-- Exécuter disable-modules-rls-temp.sql
-- ⚠️ Réactiver RLS après les tests !
```

### Étape 3 : Vérifier la résolution

1. **Tester l'accès depuis l'application :**
   - Aller sur http://localhost:8021/admin/modules
   - Vérifier que les modules se chargent

2. **Vérifier les logs dans la console :**
   - Ouvrir les outils de développement
   - Vérifier les messages de succès/erreur

## 🔧 Scripts disponibles

### Scripts SQL

| Script | Description | Usage |
|--------|-------------|-------|
| `fix-modules-rls-policies.sql` | Configure les politiques RLS | Solution permanente |
| `disable-modules-rls-temp.sql` | Désactive RLS temporairement | Tests uniquement |
| `check-and-fix-user-roles.sql` | Vérifie et corrige les rôles | Diagnostic |
| `check-modules-data.sql` | Vérifie les données existantes | Diagnostic |

### Scripts JavaScript

| Script | Description | Usage |
|--------|-------------|-------|
| `test-supabase-permissions.js` | Teste les permissions | Diagnostic |
| `test-modules-data.js` | Teste l'accès aux données | Diagnostic |

## 🚨 Problèmes courants

### Problème 1 : "new row violates row-level security policy"
**Cause :** RLS activé sans politique d'insertion appropriée
**Solution :** Exécuter `fix-modules-rls-policies.sql`

### Problème 2 : "permission denied for table modules"
**Cause :** Aucune politique de lecture configurée
**Solution :** Exécuter `fix-modules-rls-policies.sql`

### Problème 3 : "user is not admin"
**Cause :** Utilisateur sans rôle admin
**Solution :** Exécuter `check-and-fix-user-roles.sql`

## 🔒 Politiques RLS recommandées

### Pour la table `modules`

```sql
-- Lecture publique
CREATE POLICY "Enable read access for all users" ON modules
    FOR SELECT USING (true);

-- Écriture réservée aux admins
CREATE POLICY "Enable write access for admins" ON modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
```

### Pour la table `profiles`

```sql
-- Lecture de son propre profil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Mise à jour de son propre profil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

## 📞 Support

Si les problèmes persistent :

1. **Vérifier les logs Supabase :**
   - Aller dans l'interface Supabase
   - Section "Logs" > "Database"

2. **Vérifier les variables d'environnement :**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Tester la connexion :**
   ```bash
   node test-supabase-permissions.js
   ```

## ✅ Checklist de résolution

- [ ] Exécuter le diagnostic avec `test-supabase-permissions.js`
- [ ] Appliquer les politiques RLS appropriées
- [ ] Vérifier qu'un utilisateur a le rôle `admin`
- [ ] Tester l'accès depuis l'application
- [ ] Vérifier que les données se chargent correctement
- [ ] Réactiver RLS si désactivé temporairement 