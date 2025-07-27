import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '../../../utils/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔍 Debug - API test-email reçu:', body);
    console.log('🔍 Debug - Email reçu:', body.email);
    console.log('🔍 Debug - Type reçu:', body.type);

    const { email, type } = body;

    if (!email) {
      console.error('❌ Erreur - Email manquant dans la requête');
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    console.log('🔍 Debug - Traitement pour email:', email);

    let success = false;
    let message = '';

    switch (type) {
      case 'payment':
        success = await emailService.sendPaymentConfirmation(email, 2999, [
          { title: 'Formation IA Avancée' },
          { title: 'Templates Premium' }
        ]);
        message = 'Email de confirmation de paiement envoyé';
        break;
      case 'subscription':
        success = await emailService.sendSubscriptionConfirmation(email, {
          amount: 2999,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          planName: 'Plan Premium IA Home'
        });
        message = 'Email de confirmation d\'abonnement envoyé';
        break;
      case 'failed':
        success = await emailService.sendPaymentFailedEmail(email, 2999, 'Carte refusée - fonds insuffisants');
        message = 'Email d\'échec de paiement envoyé';
        break;
      default:
        return NextResponse.json(
          { error: 'Type d\'email non supporté' },
          { status: 400 }
        );
    }

    console.log('🔍 Debug - Résultat envoi:', { success, message });

    if (success) {
      return NextResponse.json({ message });
    } else {
      return NextResponse.json(
        { error: 'Échec de l\'envoi de l\'email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Erreur API test-email:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 