import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API check-table appelée');
    
    // Essayer de récupérer des données de la table
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur table:', error);
      return NextResponse.json({
        tableExists: false,
        error: error.message,
        code: error.code
      });
    }

    console.log('✅ Table existe, données:', data);
    return NextResponse.json({
      tableExists: true,
      data: data
    });

  } catch (error) {
    console.error('❌ Erreur check-table:', error);
    return NextResponse.json(
      { 
        tableExists: false,
        error: 'Erreur interne lors de la vérification'
      },
      { status: 500 }
    );
  }
} 