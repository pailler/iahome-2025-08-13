-- Table optionnelle pour tracer l'association entre paiements et tokens
CREATE TABLE IF NOT EXISTS payment_tokens (
    id BIGSERIAL PRIMARY KEY,
    payment_id TEXT NOT NULL,
    token_id TEXT NOT NULL REFERENCES access_tokens(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id BIGINT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_payment_tokens_payment_id ON payment_tokens(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_token_id ON payment_tokens(token_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_user_id ON payment_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_module_id ON payment_tokens(module_id);

-- RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE payment_tokens ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir toutes les associations
CREATE POLICY "Admins can view payment tokens" ON payment_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Politique pour permettre aux utilisateurs de voir leurs propres associations
CREATE POLICY "Users can view their own payment tokens" ON payment_tokens
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Politique pour permettre aux admins de créer des associations
CREATE POLICY "Admins can create payment tokens" ON payment_tokens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Commentaires pour documenter la table
COMMENT ON TABLE payment_tokens IS 'Table pour tracer l''association entre paiements Stripe et tokens d''accès';
COMMENT ON COLUMN payment_tokens.payment_id IS 'ID du paiement Stripe';
COMMENT ON COLUMN payment_tokens.token_id IS 'ID du token d''accès généré';
COMMENT ON COLUMN payment_tokens.user_id IS 'ID de l''utilisateur qui a effectué le paiement';
COMMENT ON COLUMN payment_tokens.module_id IS 'ID du module acheté';
COMMENT ON COLUMN payment_tokens.created_at IS 'Date de création de l''association'; 