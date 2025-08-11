import { NextRequest, NextResponse } from 'next/server';

const RF_CONFIG = {
  url: process.env.RUINEDFOOOCUS_INTERNAL_URL || 'http://localhost:7870',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolved = await params;
    const subPath = (resolved.path || []).join('/');
    const upstreamUrl = `${RF_CONFIG.url.replace(/\/$/, '')}/${subPath}`;

    const upstream = await fetch(upstreamUrl, { headers: { 'User-Agent': 'IAHome-Proxy' } });

    const headers = new Headers(upstream.headers);
    headers.set('Cache-Control', 'no-cache');
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


