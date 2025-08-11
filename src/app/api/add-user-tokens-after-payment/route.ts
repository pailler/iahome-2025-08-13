import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, paymentSuccess } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email utilisateur requis' },
        { status: 400 }
      );
    }

    if (!paymentSuccess) {
      return NextResponse.json(
        { error: 'Paiement non réussi' },
        { status: 400 }
      );
    }

    console.log('🔍 Ajout des tokens après paiement pour:', userEmail);

    // 1. Récupérer l'ID de l'utilisateur depuis la table profiles
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .single();

    if (profileError) {
      console.error('❌ Erreur récupération profil:', profileError);
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Profil utilisateur trouvé:', userProfile.id);

    // 2. Récupérer les tokens de formateur_tic@hotmail.com
    const { data: formateurProfile, error: formateurProfileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'formateur_tic@hotmail.com')
      .single();

    if (formateurProfileError) {
      console.error('❌ Erreur récupération profil formateur_tic:', formateurProfileError);
      return NextResponse.json(
        { error: 'Profil formateur_tic non trouvé' },
        { status: 404 }
      );
    }

    // 3. Récupérer tous les tokens actifs de formateur_tic
    const { data: formateurTokens, error: tokensError } = await supabase
      .from('access_tokens')
      .select(`
        *,
        modules:module_id (
          id,
          title,
          description,
          category,
          price,
          youtube_url,
          url,
          created_at,
          updated_at
        )
      `)
      .eq('created_by', formateurProfile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (tokensError) {
      console.error('❌ Erreur récupération tokens formateur_tic:', tokensError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tokens' },
        { status: 500 }
      );
    }

    console.log('✅ Tokens de formateur_tic récupérés:', formateurTokens?.length || 0);

    // 4. Créer des copies des tokens pour le nouvel utilisateur
    const newTokens = [];
    for (const token of formateurTokens || []) {
      // Vérifier si l'utilisateur a déjà ce token
      const { data: existingToken } = await supabase
        .from('access_tokens')
        .select('id')
        .eq('created_by', userProfile.id)
        .eq('module_id', token.module_id)
        .eq('is_active', true)
        .single();

      if (!existingToken) {
        // Créer une copie du token pour le nouvel utilisateur
        const newToken = {
          name: `${token.name} - Copie après paiement`,
          description: `Copie du token ${token.name} pour ${userEmail} après paiement réussi`,
          module_id: token.module_id,
          module_name: token.module_name,
          access_level: token.access_level,
          permissions: token.permissions,
          max_usage: token.max_usage,
          current_usage: 0, // Réinitialiser l'usage
          is_active: true,
          created_by: userProfile.id,
          created_at: new Date().toISOString(),
          expires_at: token.expires_at, // Garder la même expiration
          jwt_token: null, // Le JWT sera régénéré lors de la première utilisation
          last_used_at: null,
          usage_log: []
        };

        const { data: insertedToken, error: insertError } = await supabase
          .from('access_tokens')
          .insert([newToken])
          .select()
          .single();

        if (insertError) {
          console.error('❌ Erreur insertion token:', insertError);
        } else {
          console.log('✅ Token copié avec succès:', insertedToken.id);
          newTokens.push(insertedToken);
        }
      } else {
        console.log('⚠️ Token déjà existant pour ce module:', token.module_id);
      }
    }

    console.log('✅ Total des nouveaux tokens créés:', newTokens.length);

    return NextResponse.json({
      success: true,
      message: `${newTokens.length} tokens ajoutés avec succès`,
      tokensAdded: newTokens.length,
      user: {
        id: userProfile.id,
        email: userProfile.email
      }
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
