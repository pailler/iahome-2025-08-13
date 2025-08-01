-- Création de la table detail_pages
CREATE TABLE IF NOT EXISTS public.detail_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID NOT NULL REFERENCES public.cartes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_description TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création d'un index sur card_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_detail_pages_card_id ON public.detail_pages(card_id);

-- Création d'un index sur slug pour les recherches
CREATE INDEX IF NOT EXISTS idx_detail_pages_slug ON public.detail_pages(slug);

-- Création d'un index sur is_published pour filtrer les pages publiées
CREATE INDEX IF NOT EXISTS idx_detail_pages_published ON public.detail_pages(is_published);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_detail_pages_updated_at 
    BEFORE UPDATE ON public.detail_pages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insertion de données d'exemple (seulement si la table est vide)
INSERT INTO public.detail_pages (card_id, title, content, meta_description, slug, is_published) 
SELECT 
    '6f5dcc6d-6522-4b6f-97ff-404a8b28234a',
    'Guide complet de l''Assistant IA',
    'L''Assistant IA est un outil puissant qui vous permet de créer des conversations intelligentes avec des modèles de langage avancés. Cet assistant peut vous aider dans de nombreuses tâches quotidiennes, de la rédaction de contenu à l''analyse de données.

## Fonctionnalités principales

- **Conversations naturelles** : Interagissez avec l''IA de manière fluide et naturelle
- **Support multilingue** : L''assistant comprend et répond dans de nombreuses langues
- **Personnalisation** : Adaptez l''assistant à vos besoins spécifiques
- **Intégration facile** : API simple pour intégrer l''assistant dans vos applications

## Cas d''usage

1. **Support client** : Répondez automatiquement aux questions fréquentes
2. **Rédaction de contenu** : Générez des articles, emails et rapports
3. **Analyse de données** : Obtenez des insights sur vos données
4. **Formation** : Créez des tuteurs virtuels pour vos équipes

## Configuration

L''assistant se configure facilement via une interface intuitive. Vous pouvez définir le contexte, le ton et les objectifs de votre assistant en quelques clics.',
    'Guide complet pour utiliser l''Assistant IA - fonctionnalités, cas d''usage et configuration',
    'guide-assistant-ia',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.detail_pages WHERE slug = 'guide-assistant-ia');

INSERT INTO public.detail_pages (card_id, title, content, meta_description, slug, is_published) 
SELECT 
    '877fda73-750c-4254-ac58-44c7f51a40d2',
    'Tutoriel SDnext - Génération d''images IA',
    'SDnext est une interface avancée pour la génération d''images par intelligence artificielle, basée sur Stable Diffusion. Cette plateforme vous permet de créer des images de haute qualité à partir de descriptions textuelles.

## Caractéristiques principales

- **Modèles multiples** : Accédez à une large gamme de modèles Stable Diffusion
- **Interface intuitive** : Interface web moderne et facile à utiliser
- **Paramètres avancés** : Contrôlez tous les aspects de la génération
- **Galerie intégrée** : Visualisez et gérez vos créations

## Guide d''utilisation

### 1. Création d''une image
1. Connectez-vous à l''interface SDnext
2. Entrez votre prompt de description
3. Ajustez les paramètres selon vos besoins
4. Lancez la génération

### 2. Paramètres importants
- **Steps** : Nombre d''itérations (20-50 recommandé)
- **CFG Scale** : Fidélité au prompt (7-11 recommandé)
- **Sampler** : Algorithme de génération
- **Size** : Résolution de l''image

### 3. Techniques avancées
- **Negative prompts** : Excluez des éléments indésirables
- **LoRA** : Modèles spécialisés pour des styles spécifiques
- **ControlNet** : Contrôle précis de la composition

## Exemples de prompts

- "A beautiful landscape with mountains and lake, digital art"
- "Portrait of a cyberpunk character, detailed, professional lighting"
- "Abstract geometric patterns, minimalist design, vector art"',
    'Tutoriel complet pour utiliser SDnext - génération d''images IA avec Stable Diffusion',
    'tutoriel-sdnext',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.detail_pages WHERE slug = 'tutoriel-sdnext');

INSERT INTO public.detail_pages (card_id, title, content, meta_description, slug, is_published) 
SELECT 
    '6ce48192-cec8-4972-bde9-7d1d7fe9c0cc',
    'Stable Diffusion - Guide de démarrage',
    'Stable Diffusion est un modèle de génération d''images par intelligence artificielle qui révolutionne la création d''images numériques. Ce guide vous accompagne dans vos premiers pas avec cette technologie.

## Qu''est-ce que Stable Diffusion ?

Stable Diffusion est un modèle de diffusion latente qui génère des images à partir de descriptions textuelles. Contrairement aux GANs traditionnels, il utilise un processus de "diffusion" qui améliore progressivement une image bruitée.

## Avantages de Stable Diffusion

- **Qualité élevée** : Images détaillées et réalistes
- **Contrôle précis** : Influencez le résultat avec des prompts détaillés
- **Open source** : Modèle libre et modifiable
- **Efficacité** : Génération rapide sur GPU standard

## Premiers pas

### Installation
1. Téléchargez le modèle Stable Diffusion
2. Installez les dépendances Python
3. Configurez votre environnement GPU
4. Lancez l''interface web

### Première génération
1. Ouvrez l''interface web
2. Entrez un prompt simple : "a cat sitting on a chair"
3. Ajustez les paramètres de base
4. Lancez la génération

## Conseils pour de meilleurs résultats

- **Prompts détaillés** : Plus votre description est précise, meilleur sera le résultat
- **Negative prompts** : Utilisez-les pour éviter les éléments indésirables
- **Paramètres optimaux** : Testez différentes valeurs pour trouver votre style
- **Itérations** : Plus d''étapes = plus de qualité (mais plus de temps)',
    'Guide de démarrage complet pour Stable Diffusion - installation, premiers pas et conseils',
    'guide-stable-diffusion',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.detail_pages WHERE slug = 'guide-stable-diffusion');

INSERT INTO public.detail_pages (card_id, title, content, meta_description, slug, is_published) 
SELECT 
    '0921b62c-fb7e-45e1-a918-94e14dccf4ca',
    'IA Metube - Plateforme de vidéos intelligente',
    'IA Metube est une plateforme de streaming vidéo innovante qui intègre des fonctionnalités d''intelligence artificielle pour améliorer l''expérience utilisateur.

## Fonctionnalités IA

### 1. Recommandations intelligentes
L''algorithme analyse vos habitudes de visionnage pour vous proposer du contenu personnalisé qui correspond à vos intérêts.

### 2. Sous-titres automatiques
Génération automatique de sous-titres en temps réel pour tous les contenus, facilitant l''accès aux personnes malentendantes.

### 3. Résumés automatiques
L''IA génère des résumés des vidéos longues, vous permettant de comprendre rapidement le contenu principal.

### 4. Détection de contenu
Identification automatique du type de contenu (tutoriel, divertissement, éducatif) pour un meilleur classement.

## Interface utilisateur

- **Design moderne** : Interface épurée et intuitive
- **Navigation fluide** : Recherche et filtres avancés
- **Lecture adaptative** : Qualité automatique selon votre connexion
- **Mode hors ligne** : Téléchargement pour visionnage ultérieur

## Pour les créateurs

- **Analytics avancés** : Statistiques détaillées sur vos vidéos
- **Outils d''édition** : Éditeur vidéo intégré avec IA
- **Monétisation** : Système de revenus intégré
- **Collaboration** : Outils pour travailler en équipe

## Sécurité et confidentialité

- **Chiffrement** : Toutes les données sont chiffrées
- **Contrôle parental** : Filtres automatiques pour les enfants
- **Respect RGPD** : Conformité totale avec les réglementations européennes',
    'Découvrez IA Metube - plateforme de streaming vidéo avec intelligence artificielle',
    'ia-metube-plateforme',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.detail_pages WHERE slug = 'ia-metube-plateforme');

INSERT INTO public.detail_pages (card_id, title, content, meta_description, slug, is_published) 
SELECT 
    '45f5f79f-7b5e-4053-adb1-a7f232b41003',
    'PDF+ - Outil de gestion de documents avancé',
    'PDF+ est une solution complète pour la gestion, l''édition et l''analyse de documents PDF avec des fonctionnalités d''intelligence artificielle intégrées.

## Fonctionnalités principales

### Édition intelligente
- **OCR avancé** : Reconnaissance de texte avec une précision de 99%
- **Édition de contenu** : Modifiez directement le texte et les images
- **Conversion automatique** : Transformez vos documents en différents formats
- **Compression intelligente** : Réduisez la taille sans perte de qualité

### Analyse IA
- **Extraction de données** : Identifiez et extrayez automatiquement les informations importantes
- **Classification automatique** : Organisez vos documents par type et contenu
- **Recherche sémantique** : Trouvez des documents même avec des mots-clés différents
- **Résumé automatique** : Générez des résumés de documents longs

### Collaboration
- **Partage sécurisé** : Partagez des documents avec des permissions granulaires
- **Commentaires collaboratifs** : Travaillez en équipe sur les mêmes documents
- **Versioning** : Gardez un historique de toutes les modifications
- **Workflow automatisé** : Créez des processus d''approbation personnalisés

## Cas d''usage

### Entreprises
- **Gestion de contrats** : Analyse et suivi automatique des clauses importantes
- **Archivage intelligent** : Organisation automatique des documents historiques
- **Conformité** : Vérification automatique de la conformité réglementaire

### Particuliers
- **Organisation personnelle** : Numérisez et organisez vos documents importants
- **Recherche rapide** : Trouvez instantanément n''importe quel document
- **Sauvegarde sécurisée** : Stockage cloud avec chiffrement

## Intégrations

PDF+ s''intègre avec vos outils existants :
- **Google Workspace** : Synchronisation avec Drive et Docs
- **Microsoft 365** : Intégration avec SharePoint et Teams
- **CRM/ERP** : Connexion avec vos systèmes de gestion
- **API REST** : Développez vos propres intégrations',
    'PDF+ - Solution complète de gestion de documents PDF avec IA',
    'pdf-plus-gestion-documents',
    true
WHERE NOT EXISTS (SELECT 1 FROM public.detail_pages WHERE slug = 'pdf-plus-gestion-documents');

-- Activation de RLS (Row Level Security) pour detail_pages
ALTER TABLE public.detail_pages ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture des pages publiées à tous les utilisateurs
CREATE POLICY "Allow public read access to published detail pages" ON public.detail_pages
    FOR SELECT USING (is_published = true);

-- Politique pour permettre aux admins de gérer toutes les pages
CREATE POLICY "Allow admin full access to detail pages" ON public.detail_pages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux créateurs de modifier leurs pages
CREATE POLICY "Allow creators to manage their detail pages" ON public.detail_pages
    FOR ALL USING (
        card_id IN (
            SELECT id FROM public.cartes 
            WHERE created_by = auth.uid()
        )
    ); 