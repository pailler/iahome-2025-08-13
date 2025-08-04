import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API clear-test-subscriptions appelée');
    
    // Vérifier que l'utilisateur est admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - rôle admin requis' },
        { status: 403 }
      );
    }

    // Vérifier si la table user_subscriptions existe
    const { data: tableExists, error: tableError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table user_subscriptions non trouvée:', tableError);
      return NextResponse.json({ 
        success: true,
        totalTestSubscriptions: 0,
        activeTestSubscriptions: 0,
        subscriptions: [],
        subscriptionsByUser: {},
        subscriptionsByModule: {}
      });
    }

    // Récupérer les paramètres de la requête
    const { action, userId, moduleName } = await request.json();

    let deleteQuery = supabase
      .from('user_subscriptions')
      .delete()
      .or('subscription_id.like.test-subscription-%');

    // Si un userId spécifique est fourni, filtrer par utilisateur
    if (userId) {
      deleteQuery = deleteQuery.eq('user_id', userId);
    }

    // Si un moduleName spécifique est fourni, filtrer par module
    if (moduleName) {
      deleteQuery = deleteQuery.eq('module_name', moduleName);
    }

    // Exécuter la suppression
    const { data: deletedData, error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error('❌ Erreur suppression abonnements test:', deleteError);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la suppression des abonnements test',
          details: deleteError.message
        },
        { status: 500 }
      );
    }

    // Récupérer le nombre d'abonnements supprimés
    const { count } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .or('subscription_id.like.test-subscription-%');

    console.log('✅ Abonnements test supprimés:', deletedData);

    // Enregistrer l'action dans les logs admin
    await supabase
      .from('admin_actions_log')
      .insert({
        admin_id: user.id,
        action: 'clear_test_subscriptions',
        target_table: 'user_subscriptions',
        details: {
          action,
          userId: userId || 'all',
          moduleName: moduleName || 'all',
          deletedCount: deletedData?.length || 0
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });

    return NextResponse.json({
      success: true,
      message: 'Abonnements test supprimés avec succès',
      deletedCount: deletedData?.length || 0,
      remainingTestSubscriptions: count || 0
    });

  } catch (error) {
    console.error('❌ Erreur clear-test-subscriptions:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la suppression' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API clear-test-subscriptions GET appelée');
    
    // Vérifier que l'utilisateur est admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification requis' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès refusé - rôle admin requis' },
        { status: 403 }
      );
    }

    // Vérifier si la table user_subscriptions existe
    const { data: tableExists, error: tableError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table user_subscriptions non trouvée:', tableError);
      return NextResponse.json({ 
        success: true,
        totalTestSubscriptions: 0,
        activeTestSubscriptions: 0,
        subscriptions: [],
        subscriptionsByUser: {},
        subscriptionsByModule: {}
      });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleName = searchParams.get('moduleName');

    // Construire la requête pour récupérer les abonnements test
    let query = supabase
      .from('user_subscriptions')
      .select(`
        *,
        profiles:user_id (email, full_name, role)
      `)
      .or('subscription_id.like.test-subscription-%')
      .order('created_at', { ascending: false });

    // Appliquer les filtres si fournis
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (moduleName) {
      query = query.eq('module_name', moduleName);
    }

    const { data: testSubscriptions, error } = await query;

    if (error) {
      console.error('❌ Erreur récupération abonnements test:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des abonnements test' },
        { status: 500 }
      );
    }

    // Calculer les statistiques
    const totalTestSubscriptions = testSubscriptions?.length || 0;
    const activeTestSubscriptions = testSubscriptions?.filter(sub => 
      sub.status === 'active' && new Date(sub.end_date) > new Date()
    ).length || 0;

    // Grouper par utilisateur
    const subscriptionsByUser = testSubscriptions?.reduce((acc, sub) => {
      const userEmail = sub.profiles?.email || 'Unknown';
      if (!acc[userEmail]) {
        acc[userEmail] = [];
      }
      acc[userEmail].push(sub);
      return acc;
    }, {} as Record<string, any[]>) || {};

    // Grouper par module
    const subscriptionsByModule = testSubscriptions?.reduce((acc, sub) => {
      const moduleName = sub.module_name || 'Unknown';
      if (!acc[moduleName]) {
        acc[moduleName] = [];
      }
      acc[moduleName].push(sub);
      return acc;
    }, {} as Record<string, any[]>) || {};

    console.log('✅ Abonnements test récupérés:', {
      total: totalTestSubscriptions,
      active: activeTestSubscriptions,
      byUser: Object.keys(subscriptionsByUser).length,
      byModule: Object.keys(subscriptionsByModule).length
    });

    return NextResponse.json({
      success: true,
      totalTestSubscriptions,
      activeTestSubscriptions,
      subscriptions: testSubscriptions || [],
      subscriptionsByUser,
      subscriptionsByModule
    });

  } catch (error) {
    console.error('❌ Erreur clear-test-subscriptions GET:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la récupération' },
      { status: 500 }
    );
  }
} 