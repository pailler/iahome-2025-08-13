import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userId, moduleTitle, moduleDescription, moduleCategory, moduleUrl } = await request.json();
    
    console.log('🔍 Activation module:', { moduleId, userId, moduleTitle });

    if (!moduleId || !userId || !moduleTitle) {
      return NextResponse.json({ 
        success: false, 
        error: 'moduleId, userId et moduleTitle requis' 
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ Utilisateur non trouvé:', userId);
      return NextResponse.json({ 
        success: false, 
        error: 'Utilisateur non trouvé' 
      }, { status: 404 });
    }

    // Vérifier si l'accès existe déjà
    const { data: existingAccess, error: checkError } = await supabase
      .from('user_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', parseInt(moduleId))
      .eq('is_active', true)
      .single();

    if (existingAccess) {
      console.log('✅ Accès déjà existant pour:', userId, moduleId);
      return NextResponse.json({ 
        success: true, 
        message: 'Module déjà activé',
        accessId: existingAccess.id
      });
    }

    // Créer l'accès module dans user_applications
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // Expire dans 1 an

    const { data: accessData, error: accessError } = await supabase
      .from('user_applications')
      .insert({
        user_id: userId,
        module_id: parseInt(moduleId),
        module_title: moduleTitle,
        access_level: 'basic',
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (accessError) {
      console.error('❌ Erreur création accès module:', accessError);
      return NextResponse.json({ 
        success: false, 
        error: 'Erreur lors de la création de l\'accès' 
      }, { status: 500 });
    }

    console.log('✅ Accès module créé avec succès:', accessData.id);

    // Créer aussi un token d'accès pour cet utilisateur
    const { data: tokenData, error: tokenError } = await supabase
      .from('access_tokens')
      .insert({
        name: `Token ${moduleTitle}`,
        description: `Accès automatique à ${moduleTitle}`,
        module_id: parseInt(moduleId),
        module_name: moduleTitle,
        created_by: userId,
        access_level: 'basic',
        permissions: ['access'],
        max_usage: 1000,
        current_usage: 0,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (tokenError) {
      console.error('❌ Erreur création token:', tokenError);
      // On continue même si le token n'est pas créé
    } else {
      console.log('✅ Token d\'accès créé:', tokenData.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Module activé avec succès',
      accessId: accessData.id,
      tokenId: tokenData?.id,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur activation module:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur interne du serveur' 
    }, { status: 500 });
  }
}
