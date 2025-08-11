import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token, module_name } = await request.json();
    
    if (!token || !module_name) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token et nom du module requis' 
      }, { status: 400 });
    }

    // Vérifier le token dans la base de données
    const { data: tokenData, error } = await supabase
      .from('module_access_tokens')
      .select('*')
      .eq('token', token)
      .eq('module_name', module_name.toLowerCase())
      .eq('is_valid', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !tokenData) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Token invalide ou expiré' 
      }, { status: 401 });
    }

    // Vérifier si l'utilisateur a toujours un abonnement actif
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', tokenData.user_id)
      .eq('module_name', module_name.toLowerCase())
      .eq('status', 'active')
      .single();

    if (!subscription) {
      // Marquer le token comme invalide
      await supabase
        .from('module_access_tokens')
        .update({ is_valid: false })
        .eq('id', tokenData.id);

      return NextResponse.json({ 
        valid: false, 
        error: 'Abonnement expiré' 
      }, { status: 403 });
    }

    // Marquer le token comme utilisé (première utilisation)
    if (!tokenData.used_at) {
      await supabase
        .from('module_access_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id);
    }

    // Récupérer les informations de l'utilisateur
    const { data: userData } = await supabase.auth.admin.getUserById(tokenData.user_id);

    return NextResponse.json({
      valid: true,
      user: {
        id: tokenData.user_id,
        email: userData?.user?.email,
        module: module_name,
        expires_at: tokenData.expires_at
      }
    });

  } catch (error) {
    console.error('Erreur validation token:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'Erreur interne' 
    }, { status: 500 });
  }
} 