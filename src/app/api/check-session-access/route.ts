import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userId, moduleName } = await request.json();

    if (!userId || !moduleName) {
      return NextResponse.json(
        { error: 'userId et moduleName requis' },
        { status: 400 }
      );
    }

    // Vérifier si c'est un module avec limitation de temps
    const isTimeLimitedModule = false; // Aucun module avec limitation de temps
    
    if (!isTimeLimitedModule) {
      // Pour les modules sans limitation, vérifier seulement l'abonnement
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('module_name', moduleName)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (subError || !subscriptions || subscriptions.length === 0) {
        return NextResponse.json(
          { 
            canAccess: false, 
            reason: 'Aucun abonnement actif',
            timeRemaining: 0 
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        canAccess: true,
        reason: 'Accès illimité',
        timeRemaining: null
      });
    }



  } catch (error) {
    console.error('❌ Erreur vérification session:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la vérification de l\'accès' },
      { status: 500 }
    );
  }
} 