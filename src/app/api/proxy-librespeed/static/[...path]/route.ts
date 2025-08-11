import { NextRequest, NextResponse } from 'next/server';

const LIBRESPEED_CONFIG = {
  url: process.env.LIBRESPEED_INTERNAL_URL || 'http://iahome-speedtest:80',
};

function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    htm: 'text/html',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    txt: 'text/plain',
  };
  return map[ext || ''] || 'application/octet-stream';
}

// Pas de réécriture JS: certaines applis détectent des modifications et cassent.
const passthroughText = (content: string) => content;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const upstreamUrl = `${LIBRESPEED_CONFIG.url}/${pathString}`;
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'IAHome-Librespeed-Proxy/1.0', Accept: '*/*' },
    });
    if (!response.ok) {
      return new NextResponse('Not found', { status: 404 });
    }
    const contentType = getMimeType(pathString);
    let body: ArrayBuffer | string;
    if (/(text\/html|text\/css)/i.test(contentType)) {
      const text = await response.text();
      body = passthroughText(text);
    } else {
      body = await response.arrayBuffer();
    }
    return new NextResponse(body as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (e) {
    console.error('❌ Librespeed static error:', e);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
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


