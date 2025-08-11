import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import JWTService from '../../../utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const { targetUrl, moduleName, userId } = await request.json();

    // Vérifier que l'utilisateur est authentifié
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'authentification requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let userPayload;
    
    try {
      userPayload = JWTService.verifyToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier les permissions de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, module_access')
      .eq('id', userPayload.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier l'accès au module si spécifié
    if (moduleName) {
      const hasModuleAccess = user.module_access?.includes(moduleName) || user.role === 'admin';
      if (!hasModuleAccess) {
        return NextResponse.json({ error: 'Accès non autorisé à ce module' }, { status: 403 });
      }
    }

    // Générer un token d'accès sécurisé
    const accessToken = JWTService.generateDirectAccessToken(
      userPayload.userId,
      targetUrl,
      '1h'
    );

    // Enregistrer l'accès dans les logs
    await supabase
      .from('access_logs')
      .insert({
        user_id: userPayload.userId,
        target_url: targetUrl,
        module_name: moduleName,
        access_type: 'secure_direct',
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });

    return NextResponse.json({
      success: true,
      accessToken,
      targetUrl,
      expiresIn: '1h'
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'accès sécurisé:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 400 });
    }

    // Vérifier le token d'accès direct
    let accessData;
    try {
      accessData = JWTService.verifyDirectAccessToken(token);
    } catch (error) {
      return NextResponse.json({ error: 'Token d\'accès invalide ou expiré' }, { status: 401 });
    }

    // Vérifier que l'utilisateur existe toujours
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', accessData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      targetUrl: accessData.targetUrl,
      valid: true
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'accès:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 