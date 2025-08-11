import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import jwt from 'jsonwebtoken';

interface TokenGenerationRequest {
  moduleId: string;
  userId: string;
  paymentId?: string;
  accessLevel?: 'basic' | 'premium' | 'admin';
  expirationHours?: number;
  maxUsage?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenGenerationRequest = await request.json();
    const { moduleId, userId, paymentId, accessLevel = 'premium', expirationHours = 72, maxUsage = 100 } = body;

    console.log('🔑 Génération token webhook pour:', { moduleId, userId, paymentId });

    // Vérifier que l'utilisateur existe
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userProfile) {
      console.error('❌ Utilisateur non trouvé:', userId);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Récupérer les informations du module
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      console.error('❌ Module non trouvé:', moduleId);
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
      jwt_token: jwtToken,
      metadata: {
        payment_id: paymentId,
        generated_by: 'webhook',
        generated_at: new Date().toISOString()
      }
    };

    const { data: newToken, error: tokenError } = await supabase
      .from('access_tokens')
      .insert([tokenData])
      .select()
      .single();

    if (tokenError) {
      console.error('❌ Erreur création token:', tokenError);
      return NextResponse.json({ error: 'Erreur lors de la création du token' }, { status: 500 });
    }

    console.log('✅ Token généré avec succès:', newToken.id);

    // Créer l'accès module dans module_access
    const { data: accessData, error: accessError } = await supabase
      .from('module_access')
      .insert({
        user_id: userId,
        module_id: parseInt(moduleId),
        access_type: 'purchase',
        token_id: newToken.id,
        expires_at: expiresAt.toISOString(),
        metadata: {
          payment_id: paymentId,
          token_id: newToken.id,
          purchased_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (accessError) {
      console.error('❌ Erreur création accès module:', accessError);
    } else {
      console.log('✅ Accès module créé:', accessData.id);
    }

    // Construire l'URL d'accès
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accessUrl = `${baseUrl}/module/${newToken.id}`;

    return NextResponse.json({
      success: true,
      token: {
        id: newToken.id,
        name: newToken.name,
        module_name: newToken.module_name,
        expires_at: newToken.expires_at,
        access_url: accessUrl,
        jwt_token: newToken.jwt_token
      },
      message: 'Token généré avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur génération token webhook:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du token' },
      { status: 500 }
    );
  }
}
