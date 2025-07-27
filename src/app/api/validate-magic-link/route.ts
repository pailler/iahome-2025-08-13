import { NextRequest, NextResponse } from 'next/server';
import { validateMagicLink, hasMagicLinkPermission } from '../../../utils/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    console.log('🔍 Validation magic link - Token reçu:', token ? token.substring(0, 50) + '...' : 'null');
    
    if (!token) {
      console.log('❌ Token manquant');
      return NextResponse.json(
        { error: 'Token magic link manquant' },
        { status: 400 }
      );
    }

    console.log('🔍 Début validation token...');
    const magicLinkData = validateMagicLink(token);
    
    if (!magicLinkData) {
      console.log('❌ Token invalide ou expiré');
      return NextResponse.json(
        { error: 'Magic link invalide ou expiré' },
        { status: 403 }
      );
    }

    console.log('✅ Token valide, données:', {
      userId: magicLinkData.userId,
      moduleName: magicLinkData.moduleName,
      permissions: magicLinkData.permissions,
      expiresAt: new Date(magicLinkData.expiresAt).toISOString()
    });

    if (!hasMagicLinkPermission(magicLinkData, 'access')) {
      console.log('❌ Permissions insuffisantes');
      return NextResponse.json(
        { error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    console.log('✅ Validation réussie');
    return NextResponse.json({
      success: true,
      magicLinkData: {
        userId: magicLinkData.userId,
        moduleName: magicLinkData.moduleName,
        permissions: magicLinkData.permissions,
        expiresAt: magicLinkData.expiresAt
      }
    });
  } catch (error) {
    console.error('❌ Erreur validation magic link:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la validation' },
      { status: 500 }
    );
  }
} 