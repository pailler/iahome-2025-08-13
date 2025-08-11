import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vérifier si les variables d'environnement Supabase sont disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Configuration des modules
const MODULE_CONFIGS = {
  '1': { name: 'IA Tube', url: '/api/proxy-metube' },
  '2': { name: 'IA Metube', url: '/api/proxy-metube' }
};

export async function GET(request: NextRequest) {
  try {
    // Vérifier si Supabase est configuré
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase non configuré' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('id');
    
    if (!moduleId || !MODULE_CONFIGS[moduleId as keyof typeof MODULE_CONFIGS]) {
      return NextResponse.json({ error: 'Module invalide' }, { status: 400 });
    }

    const moduleConfig = MODULE_CONFIGS[moduleId as keyof typeof MODULE_CONFIGS];
    
    // Vérifier l'authentification via les cookies de session
    const authCookie = request.cookies.get('sb-access-token')?.value;
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(authCookie);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Vérifier si l'utilisateur a un abonnement actif
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_name', moduleConfig.name.toLowerCase())
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({ 
        error: `Abonnement ${moduleConfig.name} requis`,
        redirect: '/selections'
      }, { status: 403 });
    }

    // Générer un token temporaire pour l'accès au module
    const accessToken = await generateModuleAccessToken(user.id, moduleConfig.name);
    
    // Rediriger vers le module avec le token
    const redirectUrl = `${moduleConfig.url}?access_token=${accessToken}&user_id=${user.id}`;
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Erreur secure-proxy:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

async function generateModuleAccessToken(userId: string, moduleName: string): Promise<string> {
  // Générer un token sécurisé
  const token = Buffer.from(`${userId}:${moduleName}:${Date.now()}:${Math.random()}`).toString('base64');
  
  // Stocker le token temporairement si Supabase est configuré
  if (supabase) {
    await supabase
      .from('module_access_tokens')
      .insert({
        user_id: userId,
        module_name: moduleName.toLowerCase(),
        token: token,
        expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 heure
        created_at: new Date().toISOString()
      });
  }
    
  return token;
} 