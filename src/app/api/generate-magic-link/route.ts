import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { generateMagicLink } from '../../../utils/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleName, permissions } = await request.json();

    if (!userId || !moduleName) {
      return NextResponse.json(
        { error: 'userId et moduleName requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur a un abonnement actif
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
      return NextResponse.json(
        { error: 'Aucun abonnement actif trouvé pour ce module' },
        { status: 403 }
      );
    }

    // Générer le magic link
    const magicLinkToken = generateMagicLink(userId, moduleName, permissions || ['access']);

    // Configuration des URLs de base pour chaque module
    const moduleUrls: { [key: string]: string } = {
      'IAmetube': 'https://metube.regispailler.fr', // Utiliser l'adresse publique
      'stablediffusion': 'https://stablediffusion.regispailler.fr', // Module StableDiffusion
      'IAphoto': 'https://iaphoto.regispailler.fr',
      'IAvideo': 'https://iavideo.regispailler.fr',
      'iatube': 'https://metube.regispailler.fr', // Module de test pour redirection vers Metube
    };

    const baseUrl = moduleUrls[moduleName];
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Module non reconnu' },
        { status: 400 }
      );
    }

    // Construire l'URL avec le magic link
    const finalUrl = `${baseUrl}?magic_link=${encodeURIComponent(magicLinkToken)}`;

    return NextResponse.json({
      success: true,
      magicLink: finalUrl,
      moduleName,
      expiresIn: '24 heures',
      tokenType: 'Magic Link'
    });

  } catch (error) {
    console.error('❌ Erreur génération magic link:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du magic link' },
      { status: 500 }
    );
  }
} 