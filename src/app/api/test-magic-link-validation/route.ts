import { NextRequest, NextResponse } from 'next/server';
import { generateMagicLink, validateMagicLink, hasMagicLinkPermission } from '../../../utils/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { action, token, userId, moduleName } = await request.json();

    if (action === 'generate') {
      // Générer un magic link de test
      const testUserId = userId || 'test-user-id';
      const testModuleName = moduleName || 'IAmetube';
      
      const magicLinkToken = generateMagicLink(testUserId, testModuleName, ['access']);
      
      return NextResponse.json({
        success: true,
        generated: magicLinkToken,
        testData: {
          userId: testUserId,
          moduleName: testModuleName,
          permissions: ['access']
        }
      });
    }

    if (action === 'validate') {
      if (!token) {
        return NextResponse.json(
          { error: 'Token manquant' },
          { status: 400 }
        );
      }

      // Valider le magic link
      const magicLinkData = validateMagicLink(token);
      
      if (!magicLinkData) {
        return NextResponse.json(
          { error: 'Magic link invalide ou expiré' },
          { status: 403 }
        );
      }

      // Vérifier les permissions
      if (!hasMagicLinkPermission(magicLinkData, 'access')) {
        return NextResponse.json(
          { error: 'Permissions insuffisantes' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        validated: magicLinkData
      });
    }

    if (action === 'test-full-cycle') {
      // Test complet : générer puis valider
      const testUserId = 'test-user-id';
      const testModuleName = 'IAmetube';
      
      // 1. Générer
      const generated = generateMagicLink(testUserId, testModuleName, ['access']);
      
      // 2. Valider
      const validated = validateMagicLink(generated);
      
      return NextResponse.json({
        success: true,
        generated,
        validated,
        testData: {
          userId: testUserId,
          moduleName: testModuleName,
          permissions: ['access']
        }
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Erreur test magic link:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors du test' },
      { status: 500 }
    );
  }
} 