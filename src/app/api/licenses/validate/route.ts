import { NextRequest, NextResponse } from 'next/server';
import JWTService from '@iahome/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const { licenseToken, moduleName } = await request.json();
    if (!licenseToken || !moduleName) {
      return NextResponse.json({ valid: false, reason: 'Paramètres manquants' }, { status: 400 });
    }

    const decoded = JWTService.verifyLicenseToken(licenseToken);
    if (decoded.moduleName !== moduleName) {
      return NextResponse.json({ valid: false, reason: 'Module mismatch' }, { status: 403 });
    }

    return NextResponse.json({ valid: true, info: decoded });
  } catch (error) {
    return NextResponse.json({ valid: false, reason: 'Invalid or expired license' }, { status: 403 });
  }
}


