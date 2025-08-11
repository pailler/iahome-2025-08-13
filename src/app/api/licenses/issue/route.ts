import { NextRequest, NextResponse } from 'next/server';
import JWTService from '@iahome/utils/jwt';
import { supabase } from '@iahome/utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optionnel: vérifier le rôle admin via Supabase
    const accessToken = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, targetUserEmail, moduleName, plan = 'pro', validityDays = 30 } = body;
    if (!targetUserEmail || !moduleName) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    const licenseToken = JWTService.generateLicenseToken({
      userId: targetUserId || 'unknown',
      userEmail: targetUserEmail,
      moduleName,
      plan,
      validityDays,
    });

    // Persist minimal license record (optionnel)
    // Insérer la licence (user_id optionnel si non UUID)
    const isUuid = (v: string | undefined) => !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
    const record: any = {
      user_email: targetUserEmail,
      module_name: moduleName,
      plan,
      license_jwt: licenseToken,
      created_by: user.id,
    };
    if (isUuid(targetUserId)) {
      record.user_id = targetUserId;
    }

    const { error: insertError } = await supabase.from('licenses').insert([record]);
    if (insertError) {
      console.warn('Warn: license insert failed', insertError);
    }

    return NextResponse.json({ success: true, licenseToken });
  } catch (error) {
    console.error('Issue license error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


