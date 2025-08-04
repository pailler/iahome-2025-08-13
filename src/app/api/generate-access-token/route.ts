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

    return NextResponse.json({
      success: true,
      accessToken,
      expiresIn: `${hours}h`,
      moduleName,
      permissions: payload.permissions,
      userEmail: user.email,
      issuedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur génération token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 