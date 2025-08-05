import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, moduleId, moduleName } = body;

    console.log('🔍 Création de token de test pour:', { userId, moduleId, moduleName });

    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Vérifier que le module existe
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      return NextResponse.json({ error: 'Module non trouvé' }, { status: 404 });
    }

    // Générer un ID unique pour le token
    const tokenId = `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculer la date d'expiration (30 jours)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Créer le token avec des données minimales
    const tokenData = {
      id: tokenId,
      name: `Token Test ${module.title} - ${user.email}`,
      description: `Token de test pour ${module.title}`,
      module_id: moduleId,
      module_name: module.title,
      access_level: 'basic',
      permissions: ['access'],
      max_usage: 100,
      current_usage: 0,
      is_active: true,
      created_by: userId,
      expires_at: expiresAt.toISOString(),
      jwt_token: 'test-token-' + tokenId
    };

    console.log('📋 Données du token:', tokenData);

    // Insérer le token en utilisant une requête SQL directe pour contourner RLS
    const { data: newToken, error: tokenError } = await supabase
      .rpc('create_test_token', {
        token_data: tokenData
      });

    if (tokenError) {
      console.error('Erreur création token:', tokenError);
      
      // Fallback: essayer d'insérer directement
      const { data: directToken, error: directError } = await supabase
        .from('access_tokens')
        .insert([tokenData])
        .select()
        .single();

      if (directError) {
        console.error('Erreur insertion directe:', directError);
        return NextResponse.json({ 
          error: 'Erreur lors de la création du token',
          details: directError.message 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        token: directToken,
        message: 'Token créé avec insertion directe'
      });
    }

    return NextResponse.json({
      success: true,
      token: newToken,
      message: 'Token créé avec succès'
    });

  } catch (error) {
    console.error('Erreur création token de test:', error);
    return NextResponse.json({ 
      error: 'Erreur interne du serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
} 