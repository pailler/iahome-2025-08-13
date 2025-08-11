# Guide de Dépannage - iahome.fr

## 🚨 Erreurs Courantes et Solutions

### 1. Erreur "Erreur lors de la modification: {}"

**Symptômes :**
- Erreur vide `{}` lors de la modification d'un module
- Console affiche "Erreur lors de la modification: {}"

**Causes possibles :**
1. **Structure de table incorrecte** dans Supabase
2. **Permissions RLS** mal configurées
3. **Données invalides** envoyées à la base de données
4. **Connexion Supabase** défaillante

**Solutions :**

#### A. Vérifier la structure de la table
```sql
-- Exécuter dans l'interface SQL de Supabase
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'modules'
ORDER BY ordinal_position;
```

#### B. Recréer la table si nécessaire
```sql
-- Supprimer et recréer la table modules
DROP TABLE IF EXISTS public.modules CASCADE;

CREATE TABLE public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subtitle VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    youtube_url TEXT,
    url TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### C. Vérifier les politiques RLS
```sql
-- Vérifier les politiques existantes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'modules';
```

#### D. Recréer les politiques RLS
```sql
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON public.modules;
DROP POLICY IF EXISTS "Modules are insertable by authenticated users" ON public.modules;
DROP POLICY IF EXISTS "Modules are updatable by authenticated users" ON public.modules;
DROP POLICY IF EXISTS "Modules are deletable by authenticated users" ON public.modules;

-- Créer les nouvelles politiques
CREATE POLICY "Modules are viewable by everyone" ON public.modules
    FOR SELECT USING (true);

CREATE POLICY "Modules are insertable by authenticated users" ON public.modules
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Modules are updatable by authenticated users" ON public.modules
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Modules are deletable by authenticated users" ON public.modules
    FOR DELETE USING (auth.role() = 'authenticated');
```

### 2. Erreur de connexion Supabase

**Symptômes :**
- Erreur "Failed to fetch" dans la console
- Impossible de charger les modules

**Solutions :**

#### A. Vérifier les variables d'environnement
```bash
# Vérifier que ces variables sont définies
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### B. Tester la connexion
```javascript
// Dans la console du navigateur
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://xemtoyzcihmncbrlsmhr.supabase.co',
  'votre-clé-anon'
);

// Test de connexion
supabase.from('modules').select('count').then(console.log);
```

### 3. Erreur de validation des données

**Symptômes :**
- Erreur lors de la sauvegarde avec message de validation
- Champs obligatoires manquants

**Solutions :**

#### A. Vérifier les données avant envoi
```javascript
// Dans la console du navigateur, avant de sauvegarder
console.log('Données à sauvegarder:', moduleData);
```

#### B. Validation manuelle
```javascript
// Tester la validation
const validation = validateModuleData(moduleData);
console.log('Validation:', validation);
```

### 4. Erreur JWT

**Symptômes :**
- Erreur "Token invalide"
- Impossible d'accéder aux pages protégées

**Solutions :**

#### A. Vérifier la configuration JWT
```bash
# Vérifier que JWT_SECRET est défini
echo $JWT_SECRET
```

#### B. Régénérer les secrets
```bash
# Générer un nouveau secret JWT
openssl rand -base64 32
```

### 5. Erreur Docker

**Symptômes :**
- Conteneurs qui ne démarrent pas
- Erreurs de build

**Solutions :**

#### A. Nettoyer Docker
```bash
# Nettoyer les conteneurs et images
docker system prune -a
docker volume prune
```

#### B. Reconstruire l'image
```bash
# Reconstruire sans cache
docker-compose build --no-cache
docker-compose up -d
```

#### C. Vérifier les logs
```bash
# Voir les logs des conteneurs
docker-compose logs -f iahome-app
docker-compose logs -f nginx
```

### 6. Erreur SSL/HTTPS

**Symptômes :**
- Erreur de certificat SSL
- Site non accessible en HTTPS

**Solutions :**

#### A. Vérifier les certificats
```bash
# Vérifier les certificats SSL
openssl x509 -in nginx/ssl/iahome.fr.crt -text -noout
```

#### B. Renouveler les certificats Let's Encrypt
```bash
# Renouveler les certificats
sudo certbot renew
```

### 7. Erreur de base de données

**Symptômes :**
- Erreur "relation does not exist"
- Tables manquantes

**Solutions :**

#### A. Exécuter le script de setup
```sql
-- Exécuter le script database-setup.sql dans Supabase
-- Voir le fichier database-setup.sql
```

#### B. Vérifier les tables
```sql
-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## 🔧 Commandes de Diagnostic

### Vérifier l'état du système
```bash
# État des conteneurs
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Utilisation des ressources
docker stats

# Test de connectivité
curl -f http://localhost:3000/api/health
```

### Vérifier la base de données
```sql
-- Vérifier la structure
\d modules

-- Vérifier les données
SELECT * FROM modules LIMIT 5;

-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'modules';
```

### Vérifier les variables d'environnement
```bash
# Dans le conteneur
docker-compose exec iahome-app env | grep -E "(SUPABASE|JWT|NODE_ENV)"
```

## 📞 Support

En cas de problème persistant :

1. **Collecter les logs** :
   ```bash
   docker-compose logs > logs.txt
   ```

2. **Vérifier la configuration** :
   - Variables d'environnement
   - Structure de la base de données
   - Certificats SSL

3. **Tester les endpoints** :
   ```bash
   curl -X GET http://localhost:3000/api/health
   curl -X GET https://iahome.fr/api/health
   ```

4. **Consulter la documentation** :
   - [Guide de Migration](MIGRATION-GUIDE.md)
   - [Documentation Supabase](https://supabase.com/docs)
   - [Documentation Next.js](https://nextjs.org/docs) 