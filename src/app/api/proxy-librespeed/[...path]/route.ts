import { NextRequest, NextResponse } from 'next/server';

const LIBRESPEED_CONFIG = {
  url: process.env.LIBRESPEED_INTERNAL_URL || 'http://iahome-speedtest:80',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const upstreamPath = (path || []).join('/');
    const targetUrl = `${LIBRESPEED_CONFIG.url}/${upstreamPath}`;

    const upstream = await fetch(targetUrl, { method: 'GET' });
    if (!upstream.ok) {
      return new NextResponse('Not found', { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const body = upstream.body ?? (await upstream.arrayBuffer());

    return new NextResponse(body as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': contentType.startsWith('text/') || contentType.includes('javascript') ? 'no-cache' : 'public, max-age=3600',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new NextResponse('Erreur interne du proxy', { status: 500 });
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



