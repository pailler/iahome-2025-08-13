import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { generateAccessToken } from '../../../utils/accessToken';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API generate-access-link appelée');
    
    // Vérifier la configuration
    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.error('❌ ACCESS_TOKEN_SECRET non configuré');
      return NextResponse.json(
        { error: 'Configuration manquante: ACCESS_TOKEN_SECRET' },
        { status: 500 }
      );
    }
    
    const { userId, moduleName, permissions } = await request.json();

    // Validation des paramètres
    if (!userId || !moduleName) {
      return NextResponse.json(
        { error: 'Paramètres manquants: userId et moduleName requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a un abonnement actif pour ce module
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('module_name', moduleName)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (subError || !subscriptions || subscriptions.length === 0) {
      console.log('❌ Aucun abonnement actif trouvé:', { userId, moduleName, error: subError });
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé pour ce module' },
        { status: 403 }
      );
    }

    const subscription = subscriptions[0];
    console.log('✅ Abonnement trouvé:', subscription);

    // Générer le token d'accès sécurisé
    const token = generateAccessToken(userId, moduleName, permissions);
    console.log('✅ Token généré:', token.substring(0, 20) + '...');
    
    // Utiliser la page d'iframe pour masquer l'URL réelle
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://home.regispailler.fr';
    const iframeUrl = `${baseUrl}/module/${token}`;
    
    console.log('✅ URL de base:', baseUrl);
    console.log('✅ Lien iframe généré:', iframeUrl);

    return NextResponse.json({
      success: true,
      accessLink: iframeUrl,
      moduleName,
      expiresIn: '24 heures'
    });

  } catch (error) {
    console.error('❌ Erreur generate-access-link:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du lien' },
      { status: 500 }
    );
  }
} 