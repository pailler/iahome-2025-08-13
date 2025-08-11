import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import jwt from 'jsonwebtoken';

interface TokenGenerationRequest {
  moduleId: string;
  moduleTitle?: string;
  targetUrl?: string;
  userId?: string;
  paymentId?: string;
  accessLevel?: 'basic' | 'premium' | 'admin';
  expirationHours?: number;
  maxUsage?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenGenerationRequest = await request.json();
    const { moduleId, moduleTitle, targetUrl, userId: bodyUserId, paymentId, accessLevel = 'premium', expirationHours = 72, maxUsage = 100 } = body;

    // Récupérer l'utilisateur depuis le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Token d\'authentification invalide' }, { status: 401 });
    }

    const userId = user.id;

    // Vérifier que l'utilisateur existe et a les permissions
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
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

    // Vérifier s'il existe déjà un token valide pour ce module et cet utilisateur
    const { data: existingToken, error: existingTokenError } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('module_id', moduleId)
      .eq('created_by', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingToken && !existingTokenError) {
      console.log('✅ Token existant trouvé, réutilisation');
      
      // Incrémenter le compteur d'utilisation
      const newUsage = (existingToken.current_usage || 0) + 1;
      const { error: updateError } = await supabase
        .from('access_tokens')
        .update({ 
          current_usage: newUsage,
          last_used_at: new Date().toISOString()
        })
        .eq('id', existingToken.id);

      if (updateError) {
        console.error('❌ Erreur mise à jour usage token:', updateError);
      } else {
        console.log(`✅ Usage token mis à jour: ${newUsage}/${existingToken.max_usage}`);
      }
      
      // Utiliser l'URL personnalisée si fournie, sinon utiliser l'URL par défaut
      const finalUrl = targetUrl || getModuleUrl(moduleTitle || module.title);
      
      return NextResponse.json({
        success: true,
        token: existingToken.jwt_token,
        expiresAt: existingToken.expires_at,
        accessUrl: `${finalUrl}?token=${existingToken.jwt_token}`,
        reused: true,
        currentUsage: newUsage,
        maxUsage: existingToken.max_usage
      });
    }

    // Générer un ID unique pour le nouveau token
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
      name: `Token ${module.title} - ${userProfile.email}`,
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

    // Créer l'accès module dans module_access (structure minimale)
    try {
      const { data: moduleAccess, error: moduleAccessError } = await supabase
        .from('module_access')
        .insert([{
          user_id: userId,
          module_id: moduleId,
          access_type: paymentId ? 'purchase' : 'manual',
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true
        }]);

      if (moduleAccessError) {
        console.error('Erreur création accès module:', moduleAccessError);
      } else {
        console.log('✅ Accès module créé avec succès');
      }
    } catch (error) {
      console.error('Erreur création accès module:', error);
    }

    // Utiliser l'URL personnalisée si fournie, sinon utiliser l'URL par défaut
    const finalUrl = targetUrl || getModuleUrl(moduleTitle || module.title);
    
    return NextResponse.json({
      success: true,
      token: newToken.jwt_token,
      expiresAt: newToken.expires_at,
      accessUrl: `${finalUrl}?token=${newToken.jwt_token}`
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
    'MeTube': '/api/proxy-metube',
    'ChatGPT': 'https://chatgpt.regispailler.fr',
    'LibreSpeed': '/api/proxy-librespeed',
    'PsiTransfer': 'https://psitransfer.regispailler.fr',
    'PDF+': 'https://pdfplus.regispailler.fr',
    'AI Assistant': 'https://aiassistant.regispailler.fr',
    'CogStudio': 'https://cogstudio.regispailler.fr',
    'ruinedfooocus': '/api/gradio-secure',
    'RuinedFooocus': '/api/gradio-secure',
    'Invoke': 'https://invoke.regispailler.fr'
  };

  return moduleUrls[moduleTitle] || 'https://stablediffusion.regispailler.fr';
} 