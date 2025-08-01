-- Ajout des colonnes manquantes à la table cartes
-- Vérifier si les colonnes existent avant de les ajouter

-- Ajout de la colonne created_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cartes' AND column_name = 'created_at') THEN
        ALTER TABLE public.cartes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne created_at ajoutée à la table cartes';
    ELSE
        RAISE NOTICE 'Colonne created_at existe déjà dans la table cartes';
    END IF;
END $$;

-- Ajout de la colonne updated_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cartes' AND column_name = 'updated_at') THEN
        ALTER TABLE public.cartes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonne updated_at ajoutée à la table cartes';
    ELSE
        RAISE NOTICE 'Colonne updated_at existe déjà dans la table cartes';
    END IF;
END $$;

-- Ajout de la colonne created_by si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cartes' AND column_name = 'created_by') THEN
        ALTER TABLE public.cartes ADD COLUMN created_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Colonne created_by ajoutée à la table cartes';
    ELSE
        RAISE NOTICE 'Colonne created_by existe déjà dans la table cartes';
    END IF;
END $$;

-- Mise à jour des valeurs created_at pour les cartes existantes
UPDATE public.cartes 
SET created_at = NOW() 
WHERE created_at IS NULL;

-- Mise à jour des valeurs updated_at pour les cartes existantes
UPDATE public.cartes 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- Création du trigger pour updated_at si la fonction existe déjà
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Vérifier si le trigger existe déjà
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cartes_updated_at') THEN
            CREATE TRIGGER update_cartes_updated_at 
                BEFORE UPDATE ON public.cartes 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
            RAISE NOTICE 'Trigger update_cartes_updated_at créé';
        ELSE
            RAISE NOTICE 'Trigger update_cartes_updated_at existe déjà';
        END IF;
    ELSE
        RAISE NOTICE 'Fonction update_updated_at_column n''existe pas, trigger non créé';
    END IF;
END $$;

-- Vérification finale
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cartes' 
ORDER BY ordinal_position; 