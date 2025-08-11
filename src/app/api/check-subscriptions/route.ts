import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-subscriptions appelée');
    
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');
    const userId = searchParams.get('userId');

    console.log('🔍 Paramètres reçus:', { moduleName, userId });

    // Validation des paramètres
    if (!userId) {
      console.error('❌ Paramètres manquants');
      return NextResponse.json(
        { error: 'Paramètres manquants: userId requis' },
        { status: 400 }
      );
    }

    // Vérifier les accès modules actifs
    let query = supabase
      .from('module_access')
      .select(`
        id,
        user_id,
        module_id,
        access_type,
        expires_at,
        is_active,
        created_at,
        metadata
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur vérification accès modules:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des accès modules' },
        { status: 500 }
      );
    }

    // Filtrer les accès non expirés
    const activeAccess = data ? data.filter(access => {
      if (!access.expires_at) return true; // Accès permanent
      const isNotExpired = new Date(access.expires_at) > new Date();
      return isNotExpired;
    }) : [];

    const hasActiveSubscription = activeAccess.length > 0;
    console.log('✅ Résultat vérification:', { 
      hasActiveSubscription, 
      activeAccessCount: activeAccess.length
    });

    return NextResponse.json({
      hasActiveSubscription,
      activeAccess: activeAccess,
      totalActiveModules: activeAccess.length
    });

  } catch (error) {
    console.error('❌ Erreur check-subscriptions:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la vérification' },
      { status: 500 }
    );
  }
} 