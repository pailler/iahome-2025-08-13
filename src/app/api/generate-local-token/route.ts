import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'jsonwebtoken';

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Clé secrète pour les tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Adresses locales autorisées
const ALLOWED_LOCAL_ADDRESSES = [
  'http://192.168.1.150:7870',
  'http://192.168.1.100:8080',
  'http://192.168.1.200:3000',
  'http://localhost:7870',
  'http://127.0.0.1:7870'
];

// IPs autorisées pour l'accès
const ALLOWED_IPS = [
  '90.90.226.59', // Votre IP principale
  '127.0.0.1',    // Localhost
  '::1',          // IPv6 localhost
  'localhost'     // Localhost
];

export async function POST(request: NextRequest) {
  try {
        // Récupérer l'IP du client
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                    request.headers.get('x-real-ip') ||
                    'unknown';
    
    console.log(`🔑 Demande de token local depuis IP: ${clientIP}`);
    
    // Vérifier si l'IP est autorisée
    const isIPAllowed = ALLOWED_IPS.includes(clientIP);
    
    if (!isIPAllowed) {
      console.log(`❌ Demande de token local refusée - IP non autorisée: ${clientIP}`);
      
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }
    
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Demande de token local refusée - Pas de token d\'authentification');
      
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    
    // Vérifier le token avec Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Demande de token local refusée - Token invalide');
      
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    
    // Récupérer les données de la requête
    const { targetUrl, moduleTitle, moduleId } = await request.json();
    
    if (!targetUrl || !moduleTitle) {
      return NextResponse.json(
        { error: 'targetUrl et moduleTitle requis' },
        { status: 400 }
      );
    }
    
    // Vérifier que l'URL cible est autorisée
    const isUrlAllowed = ALLOWED_LOCAL_ADDRESSES.some(allowed => 
      targetUrl.startsWith(allowed)
    );
    
    if (!isUrlAllowed) {
      console.log(`❌ Demande de token local refusée - URL non autorisée: ${targetUrl}`);
      
      return NextResponse.json(
        { error: 'URL locale non autorisée' },
        { status: 403 }
      );
    }
    
    // Vérifier l'accès utilisateur au module (si moduleId fourni)
    if (moduleId) {
      const { data: accessData, error: accessError } = await supabase
        .from('module_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .single();
      
      if (accessError || !accessData) {
        console.log(`❌ Demande de token local refusée - Utilisateur ${user.id} n'a pas accès au module ${moduleTitle}`);
        
        return NextResponse.json(
          { error: 'Accès non autorisé à ce module' },
          { status: 403 }
        );
      }
      
      // Vérifier si l'accès n'a pas expiré
      if (accessData.expires_at) {
        const now = new Date();
        const expiresAt = new Date(accessData.expires_at);
        if (expiresAt <= now) {
          console.log(`❌ Demande de token local refusée - Accès expiré pour utilisateur ${user.id}`);
          
          return NextResponse.json(
            { error: 'Accès expiré' },
            { status: 403 }
          );
        }
      }
    }
    
    // Créer le token local (valide 2 heures)
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (2 * 60 * 60); // 2 heures
    
    const localTokenData = {
      userId: user.id,
      targetUrl: targetUrl,
      moduleTitle: moduleTitle,
      expiresAt: expiresAt,
      ip: clientIP,
      issuedAt: now
    };
    
    // Signer le token
    const localToken = sign(localTokenData, JWT_SECRET, { expiresIn: '2h' });
    
    console.log(`✅ Token local généré pour utilisateur ${user.id} - URL: ${targetUrl}`);
    
    // Enregistrer l'utilisation dans la base de données
    await supabase
      .from('local_access_logs')
      .insert({
        user_id: user.id,
        module_id: moduleId || null,
        module_title: moduleTitle,
        target_url: targetUrl,
        ip_address: clientIP,
        token_issued_at: new Date().toISOString(),
        expires_at: new Date(expiresAt * 1000).toISOString()
      });
    
    return NextResponse.json({
      success: true,
      token: localToken,
      expiresAt: expiresAt,
      targetUrl: targetUrl,
      moduleTitle: moduleTitle,
      message: 'Token local généré avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du token local:', error);
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

