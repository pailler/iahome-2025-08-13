import { verify } from 'jsonwebtoken';

// Clé secrète pour les tokens (à stocker dans les variables d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// Interface pour le token Gradio
export interface GradioToken {
  userId: string;
  moduleId: string;
  moduleTitle: string;
  expiresAt: number;
  ip: string;
  issuedAt: number;
}

// Fonction utilitaire pour vérifier un token Gradio
export function verifyGradioToken(token: string): GradioToken | null {
  try {
    const decoded = verify(token, JWT_SECRET) as GradioToken;
    return decoded;
  } catch (error) {
    console.error('❌ Erreur vérification token Gradio:', error);
    return null;
  }
}
