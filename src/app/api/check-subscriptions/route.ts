import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-subscriptions appelée');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Paramètre userId requis' },
        { status: 400 }
      );
    }

    // Vérifier tous les abonnements de l'utilisateur
    const { data: allSubscriptions, error: allError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erreur récupération abonnements:', allError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des abonnements' },
        { status: 500 }
      );
    }

    // Vérifier les abonnements actifs
    const { data: activeSubscriptions, error: activeError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('❌ Erreur récupération abonnements actifs:', activeError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des abonnements actifs' },
        { status: 500 }
      );
    }

    console.log('✅ Abonnements trouvés:', {
      total: allSubscriptions?.length || 0,
      active: activeSubscriptions?.length || 0,
      all: allSubscriptions,
      active: activeSubscriptions
    });

    return NextResponse.json({
      success: true,
      totalSubscriptions: allSubscriptions?.length || 0,
      activeSubscriptions: activeSubscriptions?.length || 0,
      allSubscriptions: allSubscriptions || [],
      activeSubscriptions: activeSubscriptions || []
    });

  } catch (error) {
    console.error('❌ Erreur check-subscriptions:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la vérification' },
      { status: 500 }
    );
  }
} 