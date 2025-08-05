-- Création des tables pour la gestion des menus du site web

-- Table des menus
CREATE TABLE IF NOT EXISTS menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des éléments de menu
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(500),
    page_id VARCHAR(100), -- Référence vers une page spécifique
    icon VARCHAR(50), -- Nom de l'icône (optionnel)
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false, -- Pour les liens externes
    target VARCHAR(20) DEFAULT '_self', -- _self, _blank, etc.
    requires_auth BOOLEAN DEFAULT false, -- Si l'élément nécessite une authentification
    roles_allowed TEXT[], -- Rôles autorisés (admin, user, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des pages du site
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT, -- Contenu de la page (optionnel)
    is_published BOOLEAN DEFAULT true,
    is_homepage BOOLEAN DEFAULT false,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des menus par défaut
INSERT INTO menus (name, description, position) VALUES
('main', 'Menu principal du site', 1),
('footer', 'Menu du pied de page', 2),
('mobile', 'Menu mobile', 3)
ON CONFLICT (name) DO NOTHING;

-- Insertion des pages par défaut
INSERT INTO pages (slug, title, description, is_published) VALUES
('home', 'Accueil', 'Page d''accueil du site', true),
('community', 'Communauté', 'Page de la communauté', true),
('blog', 'Blog', 'Page du blog', true),
('about', 'À propos', 'Page à propos', true),
('contact', 'Contact', 'Page de contact', true),
('pricing', 'Tarifs', 'Page des tarifs', true),
('privacy', 'Confidentialité', 'Politique de confidentialité', true),
('terms', 'Conditions', 'Conditions d''utilisation', true)
ON CONFLICT (slug) DO NOTHING;

-- Insertion des éléments de menu par défaut pour le menu principal
INSERT INTO menu_items (menu_id, title, url, page_id, position, is_active) 
SELECT 
    m.id,
    'Accueil',
    '/',
    p.id,
    1,
    true
FROM menus m, pages p 
WHERE m.name = 'main' AND p.slug = 'home'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (menu_id, title, url, page_id, position, is_active) 
SELECT 
    m.id,
    'Communauté',
    '/community',
    p.id,
    2,
    true
FROM menus m, pages p 
WHERE m.name = 'main' AND p.slug = 'community'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (menu_id, title, url, page_id, position, is_active) 
SELECT 
    m.id,
    'Blog',
    '/blog',
    p.id,
    3,
    true
FROM menus m, pages p 
WHERE m.name = 'main' AND p.slug = 'blog'
ON CONFLICT DO NOTHING;

-- Insertion des éléments de menu pour le footer
INSERT INTO menu_items (menu_id, title, url, page_id, position, is_active) 
SELECT 
    m.id,
    'À propos',
    '/about',
    p.id,
    1,
    true
FROM menus m, pages p 
WHERE m.name = 'footer' AND p.slug = 'about'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (menu_id, title, url, page_id, position, is_active) 
SELECT 
    m.id,
    'Contact',
    '/contact',
    p.id,
    2,
    true
FROM menus m, pages p 
WHERE m.name = 'footer' AND p.slug = 'contact'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (menu_id, title, url, page_id, position, is_active) 
SELECT 
    m.id,
    'Tarifs',
    '/pricing',
    p.id,
    3,
    true
FROM menus m, pages p 
WHERE m.name = 'footer' AND p.slug = 'pricing'
ON CONFLICT DO NOTHING;

-- Création des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);

-- Fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour les tables
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les menus (lecture publique, écriture admin)
CREATE POLICY "Menus are viewable by everyone" ON menus
    FOR SELECT USING (true);

CREATE POLICY "Menus are insertable by admin" ON menus
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Menus are updatable by admin" ON menus
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Menus are deletable by admin" ON menus
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques RLS pour les éléments de menu
CREATE POLICY "Menu items are viewable by everyone" ON menu_items
    FOR SELECT USING (true);

CREATE POLICY "Menu items are insertable by admin" ON menu_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Menu items are updatable by admin" ON menu_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Menu items are deletable by admin" ON menu_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques RLS pour les pages
CREATE POLICY "Pages are viewable by everyone" ON pages
    FOR SELECT USING (true);

CREATE POLICY "Pages are insertable by admin" ON pages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Pages are updatable by admin" ON pages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Pages are deletable by admin" ON pages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    ); 