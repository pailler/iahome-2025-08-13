import { supabase } from './supabaseClient';

export interface AccessTokenData {
  moduleName: string;
  userId: string;
  expiresAt: Date;
  isValid: boolean;
}

export async function validateAccessToken(token: string): Promise<AccessTokenData | null> {
  try {
    console.log('🔍 [DEBUG] Validation du token:', token);

    // Récupérer le magic link depuis Supabase
    console.log('🔍 [DEBUG] Recherche dans Supabase...');
    const { data, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('token', token)
      // .eq('is_used', false) // COMMENTÉ POUR PERMETTRE LA RÉUTILISATION
      .single();

    console.log('🔍 [DEBUG] Résultat Supabase:', { data, error });
    console.log('🔍 [DEBUG] Erreur complète:', JSON.stringify(error, null, 2));

    if (error) {
      console.log('❌ [DEBUG] Erreur Supabase:', error);
      console.log('❌ [DEBUG] Code erreur:', error.code);
      console.log('❌ [DEBUG] Message erreur:', error.message);
      return null;
    }

    if (!data) {
      console.log('❌ [DEBUG] Magic link non trouvé ou déjà utilisé');
      return null;
    }

    console.log('✅ [DEBUG] Magic link trouvé:', data);

    // Vérifier l'expiration
    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    console.log('🔍 [DEBUG] Vérification expiration:', {
      now: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isExpired: expiresAt < now
    });

    if (expiresAt < now) {
      console.log('❌ [DEBUG] Magic link expiré');
      return null;
    }

    // Marquer comme utilisé (COMMENTÉ POUR PERMETTRE LA RÉUTILISATION)
    // console.log('🔍 [DEBUG] Marquage comme utilisé...');
    // await supabase
    //   .from('magic_links')
    //   .update({ is_used: true })
    //   .eq('token', token);

    console.log('✅ [DEBUG] Magic link validé:', {
      moduleName: data.module_name,
      userId: data.user_id,
      expiresAt: expiresAt
    });

    return {
      moduleName: data.module_name,
      userId: data.user_id,
      expiresAt: expiresAt,
      isValid: true
    };

  } catch (error) {
    console.error('❌ [DEBUG] Erreur validation token:', error);
    return null;
  }
}

export function hasPermission(tokenData: AccessTokenData, permission: string): boolean {
  console.log('🔍 [DEBUG] Vérification permissions:', { tokenData, permission });
  // Pour l'instant, on considère que tous les tokens valides ont les permissions
  // Vous pouvez ajouter une logique plus complexe ici si nécessaire
  return tokenData.isValid;
}