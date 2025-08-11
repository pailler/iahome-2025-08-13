import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@iahome/utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const accessToken = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');
    const userEmail = searchParams.get('email');

    let query = supabase.from('licenses').select('*').order('created_at', { ascending: false }) as any;
    if (moduleName) query = query.eq('module_name', moduleName);
    if (userEmail) query = query.eq('user_email', userEmail);
    const { data, error } = await query;
    if (error) {
      // Si la table n'existe pas ou RLS bloque, retourner une liste vide au lieu d'un 500 pour l'UX admin
      console.warn('licenses/list warning:', error);
      return NextResponse.json({ items: [] });
    }

    return NextResponse.json({ items: data || [] });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


