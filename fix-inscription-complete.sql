-- Script complet pour réparer les problèmes d'inscription
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table profiles si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Activer RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Table profiles créée avec succès';
    ELSE
        RAISE NOTICE 'Table profiles existe déjà';
    END IF;
END $$;

-- 2. Créer la fonction update_updated_at_column si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Créer le trigger update_profiles_updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Créer la fonction handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer un nouveau profil pour le nouvel utilisateur
    INSERT INTO profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', NEW.email, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Supprimer et recréer le trigger on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 6. Supprimer toutes les politiques RLS existantes
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable read access for admins" ON profiles;
DROP POLICY IF EXISTS "Enable update for admins" ON profiles;

-- 7. Créer les nouvelles politiques RLS
-- Politique pour permettre l'insertion de nouveaux profils (nécessaire pour le trigger)
CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Enable read access for users based on user_id" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Enable update for users based on user_id" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Enable read access for admins" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux admins de modifier tous les profils
CREATE POLICY "Enable update for admins" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- 8. Vérification finale
SELECT 'Configuration terminée avec succès' as status;

-- Vérifier que tout est en place
SELECT 
    'Table profiles' as check_item,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN 'OK' 
        ELSE 'ERREUR' 
    END as status
UNION ALL
SELECT 
    'Trigger handle_new_user' as check_item,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') 
        THEN 'OK' 
        ELSE 'ERREUR' 
    END as status
UNION ALL
SELECT 
    'Politiques RLS' as check_item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') >= 5 
        THEN 'OK' 
        ELSE 'ERREUR' 
    END as status; 