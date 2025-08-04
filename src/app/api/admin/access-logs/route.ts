import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../utils/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'accès requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Vérifier que l'utilisateur est admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Vérifier si la table access_logs existe
    const { data: tableExists, error: tableError } = await supabase
      .from('access_logs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table access_logs non trouvée:', tableError);
      return NextResponse.json({ 
        logs: []
      });
    }

    // Récupérer les logs d'accès avec les données utilisateurs
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          role
        )
      `)
      .order('timestamp', { ascending: false })
      .limit(1000); // Limiter à 1000 logs les plus récents

    if (error) {
      console.error('Erreur récupération logs:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des logs' }, { status: 500 });
    }

    return NextResponse.json({ logs: logs || [] });
  } catch (error) {
    console.error('Erreur API logs d\'accès:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token d\'accès requis' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    const { action, logId, adminNotes } = body;

    // Vérifier que l'utilisateur est admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    switch (action) {
      case 'add_note':
        if (!logId || !adminNotes) {
          return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from('access_logs')
          .update({
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', logId);

        if (updateError) {
          console.error('Erreur ajout note:', updateError);
          return NextResponse.json({ error: 'Erreur lors de l\'ajout de la note' }, { status: 500 });
        }

        // Log de l'action admin
        await supabase
          .from('admin_actions_log')
          .insert({
            admin_id: user.id,
            action: 'add_log_note',
            target_id: logId,
            details: {
              notes: adminNotes
            }
          });

        break;

      case 'export_logs':
        // Exporter les logs dans un format spécifique
        const { data: exportLogs, error: exportError } = await supabase
          .from('access_logs')
          .select(`
            *,
            profiles:user_id (
              email,
              full_name
            )
          `)
          .order('timestamp', { ascending: false });

        if (exportError) {
          console.error('Erreur export logs:', exportError);
          return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 });
        }

        // Log de l'action admin
        await supabase
          .from('admin_actions_log')
          .insert({
            admin_id: user.id,
            action: 'export_access_logs',
            details: {
              logs_count: exportLogs?.length || 0
            }
          });

        return NextResponse.json({ 
          success: true, 
          logs: exportLogs,
          export_date: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API logs d\'accès POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 