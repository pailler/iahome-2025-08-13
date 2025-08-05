import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@iahome/utils/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Génération de token d\'accès JWT...');
    
    const { moduleId, moduleName, expirationHours } = await request.json();
    
    if (!moduleId || !moduleName) {
      return NextResponse.json(
        { error: 'moduleId et moduleName requis' },
        { status: 400 }
      );
    }

    // Définir la durée d'expiration (par défaut 72h, ou la valeur spécifiée)
    const defaultExpirationHours = 72;
    const hours = expirationHours || defaultExpirationHours;

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('❌ Erreur authentification:', error);
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    console.log('✅ Utilisateur authentifié:', user.email);
    console.log('🔍 Test mode - Génération directe du token JWT');

    // Générer le token JWT directement (sans vérifier l'abonnement)
    const payload = {
      userId: user.id,
      userEmail: user.email,
      moduleId: moduleId,
      moduleName: moduleName,
      accessLevel: 'premium',
      expiresAt: Date.now() + (hours * 60 * 60 * 1000), // Heures spécifiées
      permissions: ['read', 'access', 'write', 'advanced_features'],
      issuedAt: Date.now()
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: `${hours}h` });
    
    console.log('✅ Token JWT généré avec succès pour:', moduleName);
    console.log('🔍 Payload du token:', payload);

    // Récupérer les informations du module
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('title, category, price')
      .eq('id', moduleId)
      .single();

    if (moduleError) {
      console.error('❌ Erreur récupération module:', moduleError);
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    // Stocker le token dans la base de données
    const tokenId = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tokenData = {
      id: tokenId,
      name: `Token ${moduleData.title} - ${user.email}`,
      description: `Token d'accès pour ${moduleData.title} généré automatiquement`,
      module_id: moduleId,
      module_name: moduleData.title,
      access_level: 'premium',
      permissions: payload.permissions,
      max_usage: 100,
      current_usage: 0,
      is_active: true,
      created_by: user.id,
      expires_at: new Date(Date.now() + (hours * 60 * 60 * 1000)).toISOString(),
      jwt_token: accessToken
    };

    console.log('💾 Stockage du token dans la base de données...');
    console.log('📋 Données du token:', tokenData);
    
    const { data: storedToken, error: storeError } = await supabase
      .from('access_tokens')
      .insert([tokenData])
      .select()
      .single();

    if (storeError) {
      console.error('❌ Erreur stockage token:', storeError);
      console.error('📋 Détails de l\'erreur:', {
        message: storeError.message,
        details: storeError.details,
        hint: storeError.hint,
        code: storeError.code
      });
      return NextResponse.json(
        { error: `Erreur lors du stockage du token: ${storeError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Token stocké avec succès dans la base de données');

    return NextResponse.json({
      success: true,
      accessToken,
      expiresIn: `${hours}h`,
      moduleName,
      permissions: payload.permissions,
      userEmail: user.email,
      issuedAt: new Date().toISOString(),
      token: storedToken
    });

  } catch (error) {
    console.error('❌ Erreur génération token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 