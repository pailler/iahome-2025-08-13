import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { moduleId, userEmail } = await request.json();

    console.log('🔍 Vérification paiement pour:', { moduleId, userEmail });

    if (!moduleId || !userEmail) {
      return NextResponse.json(
        { error: 'moduleId et userEmail requis' },
        { status: 400 }
      );
    }

    // Vérifier les paiements dans la table payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('customer_email', userEmail)
      .eq('status', 'succeeded')
      .eq('module_id', moduleId);

    if (paymentsError) {
      console.error('❌ Erreur lors de la vérification des paiements:', paymentsError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des paiements' },
        { status: 500 }
      );
    }

    // Vérifier les abonnements dans la table subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_email', userEmail)
      .eq('module_id', moduleId)
      .eq('status', 'active');

    if (subscriptionsError) {
      console.error('❌ Erreur lors de la vérification des abonnements:', subscriptionsError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des abonnements' },
        { status: 500 }
      );
    }

    // Vérifier si l'utilisateur a un accès spécial (pour les tests)
    const hasSpecialAccess = userEmail === 'regispailler@gmail.com';
    
    const hasPayment = payments && payments.length > 0;
    const hasSubscription = subscriptions && subscriptions.length > 0;
    const hasAccess = hasPayment || hasSubscription || hasSpecialAccess;

    console.log('✅ Résultat vérification paiement:', {
      hasPayment,
      hasSubscription,
      hasSpecialAccess,
      hasAccess,
      paymentsCount: payments?.length || 0,
      subscriptionsCount: subscriptions?.length || 0
    });

    return NextResponse.json({
      hasAccess,
      hasPayment,
      hasSubscription,
      hasSpecialAccess,
      payments: payments || [],
      subscriptions: subscriptions || []
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 