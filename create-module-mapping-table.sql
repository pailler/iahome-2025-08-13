-- Script pour créer une table de correspondance module_id
-- Cette table permettra de faire le lien entre les IDs numériques et les UUIDs

-- 1. Créer la table de correspondance
CREATE TABLE IF NOT EXISTS module_id_mapping (
    id SERIAL PRIMARY KEY,
    numeric_id INTEGER NOT NULL UNIQUE,
    uuid_id UUID NOT NULL UNIQUE,
    module_title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insérer les correspondances pour tous les modules existants
INSERT INTO module_id_mapping (numeric_id, uuid_id, module_title) VALUES
    (3, gen_random_uuid(), 'Metube'),
    (4, gen_random_uuid(), 'Bannière HA'),
    (5, gen_random_uuid(), 'AI Assistant'),
    (6, gen_random_uuid(), 'Cogstudio'),
    (8, gen_random_uuid(), 'Invoke'),
    (9, gen_random_uuid(), 'Librespeed'),
    (10, gen_random_uuid(), 'PDF+'),
    (11, gen_random_uuid(), 'PSitransfer'),
    (12, gen_random_uuid(), 'QR codes dynamiques'),
    (13, gen_random_uuid(), 'ruinedfooocus'),
    (15, gen_random_uuid(), 'Stable diffusion'),
    (17, gen_random_uuid(), 'Video Editor'),
    (19, gen_random_uuid(), 'Module Gratuit Test')
ON CONFLICT (numeric_id) DO NOTHING;

-- 3. Vérifier les données insérées
SELECT * FROM module_id_mapping ORDER BY numeric_id;

-- 4. Afficher la correspondance pour Stable Diffusion
SELECT * FROM module_id_mapping WHERE module_title = 'Stable diffusion'; 