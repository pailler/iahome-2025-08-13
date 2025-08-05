import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@iahome/utils/supabaseClient';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'iahome-super-secret-jwt-key-2025-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    console.log('🔍 Validation du token:', token);

    // Vérifier si c'est un token JWT valide
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ Token JWT décodé:', decoded);

      // Vérifier l'expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        );
      }

      // Récupérer les informations du token depuis la base de données
      const { data: tokenRecord, error: dbError } = await supabase
        .from('access_tokens')
        .select('*')
        .eq('jwt_token', token)
        .eq('is_active', true)
        .single();

      if (dbError || !tokenRecord) {
        console.log('❌ Token non trouvé dans la base de données');
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }

      // Vérifier l'expiration dans la base de données
      if (new Date(tokenRecord.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        );
      }

      // Vérifier la limite d'usage
      if (tokenRecord.max_usage && tokenRecord.current_usage >= tokenRecord.max_usage) {
        return NextResponse.json(
          { error: 'Limite d\'utilisation atteinte' },
          { status: 403 }
        );
      }

      // Incrémenter l'usage du token
      await supabase
        .from('access_tokens')
        .update({
          current_usage: tokenRecord.current_usage + 1,
          last_used_at: new Date().toISOString(),
          usage_log: tokenRecord.usage_log || []
        })
        .eq('id', tokenRecord.id);

      return NextResponse.json({
        valid: true,
        token: {
          id: tokenRecord.id,
          name: tokenRecord.name,
          description: tokenRecord.description,
          moduleId: tokenRecord.module_id,
          moduleName: tokenRecord.module_name,
          accessLevel: tokenRecord.access_level,
          permissions: tokenRecord.permissions,
          currentUsage: tokenRecord.current_usage + 1,
          maxUsage: tokenRecord.max_usage,
          expiresAt: tokenRecord.expires_at,
          issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null
        }
      });

    } catch (jwtError) {
      console.log('❌ Erreur JWT:', jwtError);
      
      // Si ce n'est pas un JWT valide, essayer avec l'ancien système de magic links
      const { data: magicLink, error: magicError } = await supabase
        .from('magic_links')
        .select('*')
        .eq('token', token)
        .single();

      if (magicError || !magicLink) {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 401 }
        );
      }

      // Vérifier l'expiration du magic link
      if (new Date(magicLink.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Token expiré' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        valid: true,
        token: {
          id: magicLink.id,
          moduleName: magicLink.module_name,
          userId: magicLink.user_id,
          expiresAt: magicLink.expires_at,
          accessLevel: 'basic',
          permissions: ['read', 'access']
        }
      });
    }

  } catch (error) {
    console.error('❌ Erreur validation token:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// GET - Vérifier un token via query parameter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token requis' },
        { status: 400 }
      );
    }

    // Utiliser la même logique que POST
    const response = await fetch(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    return response;

  } catch (error) {
    console.error('❌ Erreur validation token GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 