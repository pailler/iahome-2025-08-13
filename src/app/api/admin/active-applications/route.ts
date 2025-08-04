import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // Vérifier si la table active_applications existe
    const { data: tableExists, error: tableError } = await supabase
      .from('active_applications')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table active_applications non trouvée:', tableError);
      return NextResponse.json({ 
        applications: []
      });
    }

    // Récupérer les applications actives avec les données utilisateurs
    // Utiliser des jointures LEFT au lieu de INNER pour éviter les erreurs
    const { data: applications, error } = await supabase
      .from('active_applications')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération applications:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error('Erreur API applications actives:', error);
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
    const { action, applicationId, status, adminNotes, overrideReason, applicationIds } = body;

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
      case 'update_status':
        if (!applicationId || !status) {
          return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from('active_applications')
          .update({
            status,
            admin_notes: adminNotes,
            override_reason: overrideReason,
            updated_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (updateError) {
          console.error('Erreur mise à jour statut:', updateError);
          return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
        }

        // Log de l'action admin (si la table existe)
        try {
          await supabase
            .from('admin_actions_log')
            .insert({
              admin_id: user.id,
              action: 'update_application_status',
              target_id: applicationId,
              details: {
                new_status: status,
                notes: adminNotes,
                reason: overrideReason
              }
            });
        } catch (logError) {
          console.warn('Impossible de logger l\'action admin:', logError);
        }

        break;

      case 'bulk_update':
        if (!applicationIds || !status) {
          return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const { error: bulkError } = await supabase
          .from('active_applications')
          .update({
            status,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
          })
          .in('id', applicationIds);

        if (bulkError) {
          console.error('Erreur mise à jour en lot:', bulkError);
          return NextResponse.json({ error: 'Erreur lors de la mise à jour en lot' }, { status: 500 });
        }

        // Log de l'action admin en lot (si la table existe)
        try {
          await supabase
            .from('admin_actions_log')
            .insert({
              admin_id: user.id,
              action: 'bulk_update_applications',
              details: {
                application_ids: applicationIds,
                new_status: status,
                notes: adminNotes
              }
            });
        } catch (logError) {
          console.warn('Impossible de logger l\'action admin en lot:', logError);
        }

        break;

      case 'delete':
        if (!applicationId) {
          return NextResponse.json({ error: 'ID d\'application manquant' }, { status: 400 });
        }

        const { error: deleteError } = await supabase
          .from('active_applications')
          .delete()
          .eq('id', applicationId);

        if (deleteError) {
          console.error('Erreur suppression:', deleteError);
          return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
        }

        // Log de l'action admin (si la table existe)
        try {
          await supabase
            .from('admin_actions_log')
            .insert({
              admin_id: user.id,
              action: 'delete_application',
              target_id: applicationId
            });
        } catch (logError) {
          console.warn('Impossible de logger l\'action admin de suppression:', logError);
        }

        break;

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API applications actives POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 