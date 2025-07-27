import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API test-subscription-access appelée');
    
    const results: any[] = [];
    
    // Test 1: Vérifier la connexion Supabase
    results.push({ test: 'Connexion Supabase', status: 'running' });
    
    // Test 2: Vérifier l'accès à la table
    const { data: tableTest, error: tableError } = await supabase
      .from('user_subscriptions')
      .select('count')
      .limit(1);
    
    if (tableError) {
      results.push({ 
        test: 'Accès table user_subscriptions', 
        status: 'error',
        error: tableError.message,
        code: tableError.code,
        details: tableError.details
      });
    } else {
      results.push({ 
        test: 'Accès table user_subscriptions', 
        status: 'success',
        data: tableTest
      });
    }
    
    // Test 3: Vérifier les RLS policies
    const { data: rlsTest, error: rlsError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      results.push({ 
        test: 'Politiques RLS', 
        status: 'error',
        error: rlsError.message,
        code: rlsError.code,
        details: rlsError.details
      });
    } else {
      results.push({ 
        test: 'Politiques RLS', 
        status: 'success',
        count: rlsTest?.length || 0
      });
    }
    
    // Test 4: Vérifier la structure de la table
    const { data: structureTest, error: structureError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, module_name, status, start_date, end_date, created_at, updated_at')
      .limit(1);
    
    if (structureError) {
      results.push({ 
        test: 'Structure table', 
        status: 'error',
        error: structureError.message,
        code: structureError.code,
        details: structureError.details
      });
    } else {
      results.push({ 
        test: 'Structure table', 
        status: 'success',
        columns: structureTest ? Object.keys(structureTest[0] || {}) : []
      });
    }
    
    console.log('✅ Tests terminés:', results);
    
    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ Erreur test-subscription-access:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur interne lors du test',
        details: error
      },
      { status: 500 }
    );
  }
} 