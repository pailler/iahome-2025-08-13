import { NextRequest, NextResponse } from 'next/server';
import JWTService from '@iahome/utils/jwt';

// Génère des credentials temporaires pour un registre Docker privé
// Prérequis: variable d'env DOCKER_REGISTRY (ex: registry.iahome.fr)
// et DOCKER_REGISTRY_ROBOT_USER / DOCKER_REGISTRY_ROBOT_PASS

export async function POST(request: NextRequest) {
  try {
    const { licenseToken, moduleName } = await request.json();
    if (!licenseToken || !moduleName) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    // Vérifier la license
    const decoded = JWTService.verifyLicenseToken(licenseToken);
    if (decoded.moduleName !== moduleName) {
      return NextResponse.json({ error: 'Module mismatch' }, { status: 403 });
    }

    // Dans une implémentation avancée, on générerait un token JWT court (ex: 10 min) pour le registry (Harbor/Quay/GHCR)
    // Ici, on renvoie des credentials robot (lecture seule) issus des variables d'environnement
    const registry = process.env.DOCKER_REGISTRY || 'registry.iahome.fr';
    const username = process.env.DOCKER_REGISTRY_ROBOT_USER || 'robot-readonly';
    const password = process.env.DOCKER_REGISTRY_ROBOT_PASS || 'change-me';

    return NextResponse.json({
      success: true,
      registry,
      username,
      password,
      // Optionnel: expiration côté client
      expiresInSeconds: 600,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired license' }, { status: 403 });
  }
}


