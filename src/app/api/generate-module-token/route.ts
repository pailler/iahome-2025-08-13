import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import jwt from 'jsonwebtoken';

interface TokenGenerationRequest {
  moduleId: string;
  userId: string;
  paymentId: string;
  accessLevel?: 'basic' | 'premium' | 'admin';
  expirationHours?: number;
  maxUsage?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenGenerationRequest = await request.json();
    const { moduleId, userId, paymentId, accessLevel = 'premium', expirationHours = 72, maxUsage = 100 } = body;

    // Vérifier que l'utilisateur existe et a les permissions
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les informations du module
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }

    // Générer un ID unique pour le token
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    // Générer le JWT token
    const jwtSecret = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';
    const jwtPayload = {
      tokenId,
      moduleId,
      userId,
      accessLevel,
      permissions: ['read', 'access', 'write'],
      exp: Math.floor(expiresAt.getTime() / 1000)
    };

    const jwtToken = jwt.sign(jwtPayload, jwtSecret);

    // Créer le token dans la base de données
    const tokenData = {
      id: tokenId,
      name: `Token ${module.title} - ${user.email}`,
      description: `Token généré automatiquement après paiement pour ${module.title}`,
      module_id: moduleId,
      module_name: module.title,
      access_level: accessLevel,
      permissions: ['read', 'access', 'write'],
      max_usage: maxUsage,
      current_usage: 0,
      is_active: true,
      created_by: userId,
      expires_at: expiresAt.toISOString(),
      jwt_token: jwtToken
    };

    const { data: newToken, error: tokenError } = await supabase
      .from('access_tokens')
      .insert([tokenData])
      .select()
      .single();

    if (tokenError) {
      console.error('Erreur création token:', tokenError);
      return NextResponse.json({ error: 'Erreur lors de la création du token' }, { status: 500 });
    }

    // Optionnel : Enregistrer l'association paiement-token
    const { error: paymentTokenError } = await supabase
      .from('payment_tokens')
      .insert([{
        payment_id: paymentId,
        token_id: tokenId,
        user_id: userId,
        module_id: moduleId,
        created_at: new Date().toISOString()
      }]);

    if (paymentTokenError) {
      console.error('Erreur association paiement-token:', paymentTokenError);
      // Ne pas échouer si cette table n'existe pas encore
    }

    return NextResponse.json({
      success: true,
      token: {
        id: newToken.id,
        name: newToken.name,
        jwtToken: newToken.jwt_token,
        expiresAt: newToken.expires_at,
        accessUrl: `${getModuleUrl(module.title)}?token=${newToken.jwt_token}`
      }
    });

  } catch (error) {
    console.error('Erreur génération token:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

// Fonction pour obtenir l'URL du module
function getModuleUrl(moduleTitle: string): string {
  const moduleUrls: { [key: string]: string } = {
    'Stable Diffusion': 'https://stablediffusion.regispailler.fr',
    'IA Photo': 'https://iaphoto.regispailler.fr',
    'MeTube': 'https://metube.regispailler.fr',
    'ChatGPT': 'https://chatgpt.regispailler.fr',
    'LibreSpeed': 'https://librespeed.regispailler.fr',
    'PsiTransfer': 'https://psitransfer.regispailler.fr',
    'PDF+': 'https://pdfplus.regispailler.fr',
    'AI Assistant': 'https://aiassistant.regispailler.fr',
    'CogStudio': 'https://cogstudio.regispailler.fr',
    'RuinedFooocus': 'https://ruinedfooocus.regispailler.fr',
    'Invoke': 'https://invoke.regispailler.fr'
  };

  return moduleUrls[moduleTitle] || 'https://stablediffusion.regispailler.fr';
} 