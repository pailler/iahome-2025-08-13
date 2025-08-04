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

    // Vérifier si la table payments existe
    const { data: tableExists, error: tableError } = await supabase
      .from('payments')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Table payments non trouvée:', tableError);
      return NextResponse.json({ 
        payments: [],
        stats: {
          totalRevenue: 0,
          successfulPayments: 0,
          failedPayments: 0,
          pendingPayments: 0,
          totalPayments: 0
        }
      });
    }

    // Récupérer les paiements avec les données utilisateurs
    const { data: payments, error } = await supabase
      .from('payments')
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
      console.error('Erreur récupération paiements:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des paiements' }, { status: 500 });
    }

    // Calculer les statistiques
    const totalRevenue = payments?.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0) || 0;

    const successfulPayments = payments?.filter(p => p.status === 'succeeded').length || 0;
    const failedPayments = payments?.filter(p => p.status === 'failed').length || 0;
    const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;

    return NextResponse.json({ 
      payments: payments || [],
      stats: {
        totalRevenue,
        successfulPayments,
        failedPayments,
        pendingPayments,
        totalPayments: payments?.length || 0
      }
    });
  } catch (error) {
    console.error('Erreur API paiements:', error);
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
    const { action, paymentId, status, refundAmount, adminNotes } = body;

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
        if (!paymentId || !status) {
          return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);

        if (updateError) {
          console.error('Erreur mise à jour statut paiement:', updateError);
          return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
        }

        // Log de l'action admin (si la table existe)
        try {
          await supabase
            .from('admin_actions_log')
            .insert({
              admin_id: user.id,
              action: 'update_payment_status',
              target_id: paymentId,
              details: {
                new_status: status,
                notes: adminNotes
              }
            });
        } catch (logError) {
          console.warn('Impossible de logger l\'action admin:', logError);
        }

        break;

      case 'process_refund':
        if (!paymentId || !refundAmount) {
          return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        // Créer un remboursement (si la table existe)
        try {
          const { error: refundError } = await supabase
            .from('refunds')
            .insert({
              payment_id: paymentId,
              amount: refundAmount,
              reason: adminNotes || 'Remboursement administrateur',
              processed_by: user.id,
              status: 'processed'
            });

          if (refundError) {
            console.error('Erreur création remboursement:', refundError);
            return NextResponse.json({ error: 'Erreur lors du remboursement' }, { status: 500 });
          }
        } catch (refundTableError) {
          console.warn('Table refunds non disponible:', refundTableError);
        }

        // Mettre à jour le statut du paiement
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            admin_notes: `Remboursé: ${refundAmount} - ${adminNotes}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentId);

        // Log de l'action admin (si la table existe)
        try {
          await supabase
            .from('admin_actions_log')
            .insert({
              admin_id: user.id,
              action: 'process_refund',
              target_id: paymentId,
              details: {
                refund_amount: refundAmount,
                reason: adminNotes
              }
            });
        } catch (logError) {
          console.warn('Impossible de logger l\'action admin:', logError);
        }

        break;

      case 'export_payments':
        // Exporter les paiements dans un format spécifique
        const { data: exportPayments, error: exportError } = await supabase
          .from('payments')
          .select(`
            *,
            profiles:user_id (
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (exportError) {
          console.error('Erreur export paiements:', exportError);
          return NextResponse.json({ error: 'Erreur lors de l\'export' }, { status: 500 });
        }

        // Log de l'action admin (si la table existe)
        try {
          await supabase
            .from('admin_actions_log')
            .insert({
              admin_id: user.id,
              action: 'export_payments',
              details: {
                payments_count: exportPayments?.length || 0
              }
            });
        } catch (logError) {
          console.warn('Impossible de logger l\'action admin:', logError);
        }

        return NextResponse.json({ 
          success: true, 
          payments: exportPayments,
          export_date: new Date().toISOString()
        });

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur API paiements POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 