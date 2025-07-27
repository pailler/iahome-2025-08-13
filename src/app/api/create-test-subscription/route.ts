import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API create-test-subscription appelée');
    
    const { userId, moduleName } = await request.json();

    console.log('🔍 Paramètres reçus:', { userId, moduleName });

    // Validation des paramètres
    if (!userId || !moduleName) {
      console.error('❌ Paramètres manquants');
      return NextResponse.json(
        { error: 'Paramètres manquants: userId et moduleName requis' },
        { status: 400 }
      );
    }

    // Calculer la date de fin (30 jours)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Créer l'abonnement de test
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        module_name: moduleName,
        subscription_id: `test-subscription-${Date.now()}`,
        status: 'active',
        end_date: endDate.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création abonnement:', error);
      return NextResponse.json(
        { 
          error: 'Erreur lors de la création de l\'abonnement', 
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    console.log('✅ Abonnement créé:', data);

    return NextResponse.json({
      success: true,
      message: 'Abonnement de test créé avec succès',
      subscription: data
    });

  } catch (error) {
    console.error('❌ Erreur create-test-subscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la création' },
      { status: 500 }
    );
  }
} 