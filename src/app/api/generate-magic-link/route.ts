import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import { generateMagicLink } from '../../../utils/magicLink';

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleName, permissions, durationMinutes } = await request.json();

    if (!moduleName) {
      return NextResponse.json(
        { error: 'moduleName requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur depuis la session si userId n'est pas fourni
    let currentUserId = userId;
    if (!currentUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Utilisateur non authentifié' },
          { status: 401 }
        );
      }
      currentUserId = session.user.id;
    }

    // Déterminer la durée d'accès selon le module
    const isTimeLimitedModule = moduleName === 'IAmetube' || moduleName === 'IA metube';
    
    // Pour les modules sans limitation de temps, vérifier l'abonnement
    if (!isTimeLimitedModule) {
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUserId)
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
    }

    // Utiliser la durée spécifiée ou la durée par défaut
    const accessDurationMinutes = durationMinutes || (isTimeLimitedModule ? 720 : 1440); // 12 heures pour IA metube, 24h pour les autres
    
    // Générer le magic link avec la durée appropriée
    const magicLinkToken = generateMagicLink(currentUserId, moduleName, permissions || ['access'], accessDurationMinutes);



    // Configuration des URLs de base pour chaque module
    const moduleUrls: { [key: string]: string } = {
      'IAmetube': 'https://metube.regispailler.fr', // Utiliser l'adresse publique
      'IA metube': 'https://metube.regispailler.fr', // Utiliser l'adresse publique
      'IAphoto': 'https://iaphoto.regispailler.fr',
      'IAvideo': 'https://iavideo.regispailler.fr',
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
      accessUrl: finalUrl, // Ajout pour compatibilité avec le frontend
      moduleName,
      expiresIn: isTimeLimitedModule ? '12 heures' : '24 heures',
      tokenType: 'Magic Link',
      accessDuration: accessDurationMinutes
    });

  } catch (error) {
    console.error('❌ Erreur génération magic link:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la génération du magic link' },
      { status: 500 }
    );
  }
} 