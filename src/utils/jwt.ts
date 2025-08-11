import jwt from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET || JWT_SECRET === 'default-secret-change-me') {
  console.warn('⚠️  JWT_SECRET non configuré, utilisation d\'une clé par défaut (non sécurisée pour la production)');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  moduleAccess?: string[];
  exp?: number;
  iat?: number;
}

export class JWTService {
  /**
   * Génère un token JWT pour un utilisateur
   */
  static generateToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): string {
    // @ts-ignore
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'iahome.fr',
      audience: 'iahome-apps'
    });
  }

  /**
   * Vérifie et décode un token JWT
   */
  static verifyToken(token: string): JWTPayload {
    try {
      // @ts-ignore
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'iahome.fr',
        audience: 'iahome-apps'
      }) as JWTPayload;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Génère un token d'accès pour un module spécifique
   */
  static generateModuleToken(userId: string, moduleName: string, permissions: string[] = []): string {
    // @ts-ignore
    return jwt.sign({
      userId,
      moduleName,
      permissions,
      type: 'module-access'
    }, JWT_SECRET, {
      expiresIn: '24h',
      issuer: 'iahome.fr',
      audience: 'iahome-modules'
    });
  }

  /**
   * Vérifie un token d'accès module
   */
  static verifyModuleToken(token: string): { userId: string; moduleName: string; permissions: string[] } {
    try {
      // @ts-ignore
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'iahome.fr',
        audience: 'iahome-modules'
      }) as any;
      
      if (decoded.type !== 'module-access') {
        throw new Error('Type de token invalide');
      }
      
      return {
        userId: decoded.userId,
        moduleName: decoded.moduleName,
        permissions: decoded.permissions || []
      };
    } catch (error) {
      throw new Error('Token module invalide ou expiré');
    }
  }

  /**
   * Génère un token temporaire pour l'accès direct
   */
  static generateDirectAccessToken(userId: string, targetUrl: string, duration: string = '1h'): string {
    // @ts-ignore
    return jwt.sign({
      userId,
      targetUrl,
      type: 'direct-access'
    }, JWT_SECRET, {
      expiresIn: duration,
      issuer: 'iahome.fr',
      audience: 'iahome-direct'
    });
  }

  /**
   * Vérifie un token d'accès direct
   */
  static verifyDirectAccessToken(token: string): { userId: string; targetUrl: string } {
    try {
      // @ts-ignore
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'iahome.fr',
        audience: 'iahome-direct'
      }) as any;
      
      if (decoded.type !== 'direct-access') {
        throw new Error('Type de token invalide');
      }
      
      return {
        userId: decoded.userId,
        targetUrl: decoded.targetUrl
      };
    } catch (error) {
      throw new Error('Token d\'accès direct invalide ou expiré');
    }
  }

  /**
   * Génère un token de licence pour un module spécifique
   */
  static generateLicenseToken(params: {
    userId: string;
    userEmail: string;
    moduleName: string;
    plan: string;
    validityDays?: number;
  }): string {
    const { userId, userEmail, moduleName, plan, validityDays = 30 } = params;
    // @ts-ignore
    return jwt.sign(
      {
        type: 'license',
        userId,
        userEmail,
        moduleName,
        plan,
      },
      JWT_SECRET,
      {
        expiresIn: `${validityDays}d`,
        issuer: 'iahome.fr',
        audience: 'iahome-licenses',
      }
    );
  }

  /**
   * Vérifie un token de licence
   */
  static verifyLicenseToken(licenseToken: string): {
    userId: string;
    userEmail: string;
    moduleName: string;
    plan: string;
  } {
    try {
      // @ts-ignore
      const decoded = jwt.verify(licenseToken, JWT_SECRET, {
        issuer: 'iahome.fr',
        audience: 'iahome-licenses',
      }) as any;

      if (decoded.type !== 'license') {
        throw new Error('Type de token invalide');
      }

      return {
        userId: decoded.userId,
        userEmail: decoded.userEmail,
        moduleName: decoded.moduleName,
        plan: decoded.plan,
      };
    } catch (error) {
      throw new Error('Licence invalide ou expirée');
    }
  }
}

export default JWTService; 