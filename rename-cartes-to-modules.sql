-- Script pour renommer la table 'cartes' en 'modules'
-- ATTENTION: Ce script modifie la structure de la base de données

-- 1. Renommer la table principale
ALTER TABLE public.cartes RENAME TO modules;

-- 2. Mettre à jour la référence dans la table detail_pages
ALTER TABLE public.detail_pages 
DROP CONSTRAINT IF EXISTS detail_pages_card_id_fkey;

ALTER TABLE public.detail_pages 
ADD CONSTRAINT detail_pages_card_id_fkey 
FOREIGN KEY (card_id) REFERENCES public.modules(id) ON DELETE CASCADE;

-- 3. Renommer la colonne card_id en module_id pour plus de clarté
ALTER TABLE public.detail_pages RENAME COLUMN card_id TO module_id;

-- 4. Mettre à jour la contrainte de clé étrangère avec le nouveau nom de colonne
ALTER TABLE public.detail_pages 
DROP CONSTRAINT detail_pages_card_id_fkey;

ALTER TABLE public.detail_pages 
ADD CONSTRAINT detail_pages_module_id_fkey 
FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;

-- 5. Mettre à jour les index
DROP INDEX IF EXISTS idx_detail_pages_card_id;
CREATE INDEX idx_detail_pages_module_id ON public.detail_pages(module_id);

-- 6. Mettre à jour les politiques RLS pour detail_pages
DROP POLICY IF EXISTS "Allow creators to manage their detail pages" ON public.detail_pages;
CREATE POLICY "Allow creators to manage their detail pages" ON public.detail_pages
    FOR ALL USING (
        module_id IN (
            SELECT id FROM public.modules 
            WHERE created_by = auth.uid()
        )
    );

-- 7. Mettre à jour les données d'exemple dans detail_pages pour utiliser les nouveaux IDs
-- (Ces IDs doivent correspondre aux IDs existants dans la table modules)
UPDATE public.detail_pages SET module_id = '6f5dcc6d-6522-4b6f-97ff-404a8b28234a' WHERE slug = 'guide-assistant-ia';
UPDATE public.detail_pages SET module_id = '877fda73-750c-4254-ac58-44c7f51a40d2' WHERE slug = 'tutoriel-sdnext';
UPDATE public.detail_pages SET module_id = '6ce48192-cec8-4972-bde9-7d1d7fe9c0cc' WHERE slug = 'guide-stable-diffusion';
UPDATE public.detail_pages SET module_id = '0921b62c-fb7e-45e1-a918-94e14dccf4ca' WHERE slug = 'ia-metube-plateforme';
UPDATE public.detail_pages SET module_id = '45f5f79f-7b5e-4053-adb1-a7f232b41003' WHERE slug = 'pdf-plus-gestion-documents';

-- 8. Vérifier que tout fonctionne
SELECT 'Modules table:' as info, COUNT(*) as count FROM public.modules
UNION ALL
SELECT 'Detail pages table:', COUNT(*) FROM public.detail_pages;

-- 9. Afficher les relations
SELECT 
    m.title as module_title,
    dp.title as detail_page_title,
    dp.is_published
FROM public.modules m
LEFT JOIN public.detail_pages dp ON m.id = dp.module_id
ORDER BY m.title; 