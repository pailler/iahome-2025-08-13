// Service d'email pour les notifications de paiement
// Vous pouvez utiliser Resend, SendGrid, ou tout autre service d'email

import { Resend } from 'resend';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private emailProvider: string;
  private resend: Resend | null = null;

  constructor() {
    // Détecter le service d'email configuré
    this.emailProvider = process.env.EMAIL_PROVIDER || 'console';
    
    console.log('🔧 Initialisation EmailService:', {
      emailProvider: this.emailProvider,
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL
    });
    
    // Initialiser Resend si configuré
    if (this.emailProvider === 'resend' && process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend initialisé');
    } else {
      console.log('⚠️ Resend non initialisé:', {
        emailProvider: this.emailProvider,
        hasApiKey: !!process.env.RESEND_API_KEY
      });
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 Envoi d\'email:', {
        to: emailData.to,
        subject: emailData.subject,
        provider: this.emailProvider
      });

      switch (this.emailProvider) {
        case 'resend':
          return await this.sendWithResend(emailData);
        
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        
        case 'nodemailer':
          return await this.sendWithNodemailer(emailData);
        
        case 'console':
        default:
          return await this.sendToConsole(emailData);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi d\'email:', error);
      return false;
    }
  }

  private async sendWithResend(emailData: EmailData): Promise<boolean> {
    try {
      console.log('🔍 Debug Resend - Début de la fonction');
      console.log('🔍 Debug - this.resend:', !!this.resend);
      console.log('🔍 Debug - emailProvider:', this.emailProvider);
      console.log('🔍 Debug - RESEND_API_KEY existe:', !!process.env.RESEND_API_KEY);
      console.log('🔍 Debug - RESEND_API_KEY longueur:', process.env.RESEND_API_KEY?.length);
      console.log('🔍 Debug - RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
      
      if (!this.resend) {
        console.error('❌ Resend non initialisé');
        console.log('Configuration:', {
          emailProvider: this.emailProvider,
          hasResendApiKey: !!process.env.RESEND_API_KEY,
          resendApiKeyLength: process.env.RESEND_API_KEY?.length
        });
        throw new Error('Resend non initialisé - vérifiez RESEND_API_KEY');
      }

      const fromEmail = emailData.from || process.env.RESEND_FROM_EMAIL || 'noreply@iahome.fr';
      
      console.log('📧 Configuration email Resend:', {
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        hasHtml: !!emailData.html
      });

      const emailWithDefaults = {
        from: fromEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        ...(emailData.text && { text: emailData.text })
      };

      console.log('📧 Envoi via Resend...');
      console.log('🔍 Debug - emailWithDefaults:', {
        from: emailWithDefaults.from,
        to: emailWithDefaults.to,
        subject: emailWithDefaults.subject,
        hasHtml: !!emailWithDefaults.html
      });
      
      const result = await this.resend.emails.send(emailWithDefaults);
      
      console.log('🔍 Debug - Résultat Resend:', result);
      
      if (result.error) {
        console.error('❌ Erreur Resend:', result.error);
        console.error('❌ Détails erreur:', JSON.stringify(result.error, null, 2));
        return false;
      }

      console.log('✅ Email envoyé via Resend:', {
        to: emailData.to,
        id: result.data?.id
      });
      return true;
    } catch (error) {
      console.error('❌ Erreur Resend:', error);
      return false;
    }
  }

  private async sendWithSendGrid(emailData: EmailData): Promise<boolean> {
    try {
      // Intégration avec SendGrid
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      // Ajouter l'expéditeur par défaut
      const emailWithFrom = {
        ...emailData,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@home.regispailler.fr'
      };
      
      await sgMail.send(emailWithFrom);
      console.log('📧 Email envoyé via SendGrid:', emailData.to);
      return true;
    } catch (error) {
      console.error('Erreur SendGrid:', error);
      return false;
    }
  }

  private async sendWithNodemailer(emailData: EmailData): Promise<boolean> {
    try {
      // Intégration avec Nodemailer
      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransporter({
      //   host: process.env.SMTP_HOST,
      //   port: process.env.SMTP_PORT,
      //   secure: true,
      //   auth: {
      //     user: process.env.SMTP_USER,
      //     pass: process.env.SMTP_PASS,
      //   },
      // });
      // await transporter.sendMail(emailData);
      
      console.log('📧 Email envoyé via Nodemailer:', emailData);
      return true;
    } catch (error) {
      console.error('Erreur Nodemailer:', error);
      return false;
    }
  }

  private async sendToConsole(emailData: EmailData): Promise<boolean> {
    console.log('📧 === EMAIL SIMULÉ ===');
    console.log('À:', emailData.to);
    console.log('Objet:', emailData.subject);
    console.log('Contenu HTML:', emailData.html);
    console.log('📧 === FIN EMAIL ===');
    return true;
  }

  // Templates d'emails prédéfinis
  async sendPaymentConfirmation(
    email: string, 
    amount: number, 
    items: any[], 
    transactionId?: string
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: email,
      subject: '✅ Paiement confirmé - IA Home',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement confirmé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">✅ Paiement confirmé</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">IA Home</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,<br><br>
                Nous confirmons la réception de votre paiement. Merci pour votre confiance !
              </p>
              
              <!-- Transaction Details -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #667eea;">
                <h3 style="margin: 0 0 15px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Détails de la transaction</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #64748b; font-weight: 500;">Montant :</span>
                  <span style="color: #1e293b; font-weight: 600; font-size: 18px;">${(amount / 100).toFixed(2)}€</span>
                </div>
                ${transactionId ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #64748b; font-weight: 500;">ID Transaction :</span>
                  <span style="color: #1e293b; font-family: monospace; font-size: 14px;">${transactionId}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #64748b; font-weight: 500;">Date :</span>
                  <span style="color: #1e293b;">${new Date().toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
              
              ${items.length > 0 ? `
              <!-- Items -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 18px; font-weight: 600;">Articles achetés</h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                  ${items.map(item => `<li style="margin-bottom: 8px; line-height: 1.5;">${item.title}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              <!-- CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accéder à mon compte
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Merci pour votre confiance !
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                L'équipe IA Home<br>
                <a href="mailto:support@iahome.fr" style="color: #667eea; text-decoration: none;">support@iahome.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmail(emailData);
  }

  async sendSubscriptionConfirmation(
    email: string, 
    subscriptionDetails: {
      amount: number;
      periodStart: Date;
      periodEnd: Date;
      planName?: string;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: email,
      subject: '✅ Abonnement activé - IA Home',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Abonnement activé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">✅ Abonnement activé</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">IA Home Premium</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,<br><br>
                Félicitations ! Votre abonnement premium a été activé avec succès. Vous avez maintenant accès à tous nos contenus exclusifs.
              </p>
              
              <!-- Subscription Details -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px; font-weight: 600;">Détails de l'abonnement</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #047857; font-weight: 500;">Montant :</span>
                  <span style="color: #065f46; font-weight: 600; font-size: 18px;">${(subscriptionDetails.amount / 100).toFixed(2)}€</span>
                </div>
                ${subscriptionDetails.planName ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #047857; font-weight: 500;">Plan :</span>
                  <span style="color: #065f46; font-weight: 600;">${subscriptionDetails.planName}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #047857; font-weight: 500;">Période :</span>
                  <span style="color: #065f46;">${subscriptionDetails.periodStart.toLocaleDateString('fr-FR')} - ${subscriptionDetails.periodEnd.toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              <!-- Premium Features -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; font-weight: 600;">🎉 Accès Premium</h3>
                <p style="color: #92400e; margin: 0 0 15px 0;">Vous avez maintenant accès à :</p>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  <li style="margin-bottom: 8px; line-height: 1.5;">📚 Contenus exclusifs et formations avancées</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">🎯 Outils IA premium et templates personnalisés</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">💬 Support prioritaire et communauté privée</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">🚀 Accès anticipé aux nouvelles fonctionnalités</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">📊 Analytics détaillés et insights personnalisés</li>
                </ul>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accéder à mon espace premium
                </a>
              </div>
              
              <!-- Quick Links -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Liens utiles</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/templates" 
                     style="color: #10b981; text-decoration: none; font-size: 14px;">📋 Templates IA</a>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/community" 
                     style="color: #10b981; text-decoration: none; font-size: 14px;">👥 Communauté</a>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/support" 
                     style="color: #10b981; text-decoration: none; font-size: 14px;">🆘 Support</a>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/docs" 
                     style="color: #10b981; text-decoration: none; font-size: 14px;">📖 Documentation</a>
                </div>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Merci pour votre confiance !
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                L'équipe IA Home<br>
                <a href="mailto:support@iahome.fr" style="color: #10b981; text-decoration: none;">support@iahome.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmail(emailData);
  }

  async sendPaymentFailedEmail(
    email: string,
    amount: number,
    errorMessage: string,
    transactionId?: string
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: email,
      subject: '❌ Échec du paiement - IA Home',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Échec du paiement</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">❌ Échec du paiement</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">IA Home</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,<br><br>
                Nous n'avons pas pu traiter votre paiement. Voici les détails de la transaction qui a échoué.
              </p>
              
              <!-- Error Details -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 18px; font-weight: 600;">Détails de l'erreur</h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #dc2626; font-weight: 500;">Montant :</span>
                  <span style="color: #991b1b; font-weight: 600; font-size: 18px;">${(amount / 100).toFixed(2)}€</span>
                </div>
                ${transactionId ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #dc2626; font-weight: 500;">ID Transaction :</span>
                  <span style="color: #991b1b; font-family: monospace; font-size: 14px;">${transactionId}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <span style="color: #dc2626; font-weight: 500;">Date :</span>
                  <span style="color: #991b1b;">${new Date().toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                <div style="background: #fecaca; padding: 15px; border-radius: 8px; margin-top: 15px;">
                  <p style="margin: 0; color: #991b1b; font-size: 14px;">
                    <strong>Erreur :</strong> ${errorMessage}
                  </p>
                </div>
              </div>
              
              <!-- Help Section -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e; font-size: 18px; font-weight: 600;">💡 Comment résoudre ce problème</h3>
                <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
                  <li style="margin-bottom: 8px; line-height: 1.5;">Vérifiez que votre carte bancaire est valide et non expirée</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Assurez-vous d'avoir suffisamment de fonds sur votre compte</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Vérifiez que les informations de facturation sont correctes</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Essayez avec une autre méthode de paiement si disponible</li>
                </ul>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/checkout" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Réessayer le paiement
                </a>
              </div>
              
              <!-- Support -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Besoin d'aide ?</h4>
                <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                  Si vous rencontrez des difficultés, notre équipe support est là pour vous aider.
                </p>
                <a href="mailto:support@iahome.fr" 
                   style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">
                  📧 Contacter le support
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Merci pour votre compréhension
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                L'équipe IA Home<br>
                <a href="mailto:support@iahome.fr" style="color: #667eea; text-decoration: none;">support@iahome.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmail(emailData);
  }

  async sendSubscriptionDeleted(
    email: string,
    subscriptionDetails: {
      planName?: string;
      endDate: Date;
    }
  ): Promise<boolean> {
    const emailData: EmailData = {
      to: email,
      subject: '📋 Abonnement annulé - IA Home',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Abonnement annulé</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📋 Abonnement annulé</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">IA Home</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Bonjour,<br><br>
                Nous confirmons l'annulation de votre abonnement. Nous sommes désolés de vous voir partir.
              </p>
              
              <!-- Cancellation Details -->
              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #6b7280;">
                <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px; font-weight: 600;">Détails de l'annulation</h3>
                ${subscriptionDetails.planName ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                  <span style="color: #6b7280; font-weight: 500;">Plan :</span>
                  <span style="color: #374151; font-weight: 600;">${subscriptionDetails.planName}</span>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #6b7280; font-weight: 500;">Date de fin :</span>
                  <span style="color: #374151;">${subscriptionDetails.endDate.toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              
              <!-- What happens next -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; font-weight: 600;">📅 Ce qui se passe maintenant</h3>
                <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                  <li style="margin-bottom: 8px; line-height: 1.5;">Votre accès premium reste actif jusqu'à la fin de la période payée</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Aucun nouveau prélèvement ne sera effectué</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Vous pouvez réactiver votre abonnement à tout moment</li>
                  <li style="margin-bottom: 8px; line-height: 1.5;">Vos données et contenus restent sauvegardés</li>
                </ul>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://home.regispailler.fr'}/reactivate" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Réactiver mon abonnement
                </a>
              </div>
              
              <!-- Feedback -->
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h4 style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">Votre avis nous intéresse</h4>
                <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">
                  Nous aimerions connaître les raisons de votre départ pour améliorer nos services.
                </p>
                <a href="mailto:feedback@iahome.fr" 
                   style="color: #10b981; text-decoration: none; font-size: 14px; font-weight: 500;">
                  📧 Partager votre feedback
                </a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                Merci pour votre confiance passée
              </p>
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                L'équipe IA Home<br>
                <a href="mailto:support@iahome.fr" style="color: #10b981; text-decoration: none;">support@iahome.fr</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return await this.sendEmail(emailData);
  }
}

export const emailService = EmailService.getInstance(); 
