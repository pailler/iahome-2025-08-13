import crypto from 'crypto';

// Configuration pour les magic links
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'your-magic-link-secret-change-this';
const MAGIC_LINK_EXPIRY_HOURS = 24; // 24 heures par défaut

export interface MagicLinkPayload {
  userId: string;
  moduleName: string;
  expiresAt: number;
  permissions: string[];
}

export interface MagicLinkToken {
  payload: MagicLinkPayload;
  signature: string;
}

/**
 * Générer un magic link sécurisé
 */
export function generateMagicLink(userId: string, moduleName: string, permissions: string[] = ['access']): string {
  const payload: MagicLinkPayload = {
    userId,
    moduleName,
    expiresAt: Date.now() + (MAGIC_LINK_EXPIRY_HOURS * 60 * 60 * 1000),
    permissions
  };

  // Créer la signature HMAC
  const dataToSign = `${payload.userId}:${payload.moduleName}:${payload.expiresAt}:${payload.permissions.join(',')}`;
  const signature = crypto.createHmac('sha256', MAGIC_LINK_SECRET).update(dataToSign).digest('hex');

  const tokenPayload: MagicLinkToken = {
    payload,
    signature
  };

  // Encoder en base64 et ajouter un salt aléatoire
  const jsonString = JSON.stringify(tokenPayload);
  const salt = crypto.randomBytes(8).toString('hex');
  const encoded = Buffer.from(jsonString).toString('base64');

  // Combiner salt + encoded data
  const finalToken = `${salt}.${encoded}`;

  return finalToken;
}

/**
 * Valider un magic link
 */
export function validateMagicLink(token: string): MagicLinkPayload | null {
  try {
    // Séparer le salt et les données
    const [salt, encoded] = token.split('.');
    if (!salt || !encoded) {
      return null;
    }

    // Décoder les données
    const jsonString = Buffer.from(encoded, 'base64').toString();
    const tokenPayload: MagicLinkToken = JSON.parse(jsonString);

    // Vérifier la signature
    const dataToSign = `${tokenPayload.payload.userId}:${tokenPayload.payload.moduleName}:${tokenPayload.payload.expiresAt}:${tokenPayload.payload.permissions.join(',')}`;
    const expectedSignature = crypto.createHmac('sha256', MAGIC_LINK_SECRET).update(dataToSign).digest('hex');

    if (tokenPayload.signature !== expectedSignature) {
      return null;
    }

    // Vérifier l'expiration
    if (tokenPayload.payload.expiresAt < Date.now()) {
      return null;
    }

    return tokenPayload.payload;
  } catch (error) {
    return null;
  }
}

/**
 * Vérifier les permissions d'un magic link
 */
export function hasMagicLinkPermission(payload: MagicLinkPayload, permission: string): boolean {
  return payload.permissions.includes(permission);
} 