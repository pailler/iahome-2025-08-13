import { NextRequest, NextResponse } from 'next/server';

// Configuration du module Metube
const METUBE_CONFIG = {
  url: 'http://iahome-metube:8081',
};

function buildUpstreamUrl(pathSegments: string[], request: NextRequest): string {
  const path = pathSegments.join('/');
  const { searchParams } = new URL(request.url);
  const queryString = searchParams.toString();
  const base = METUBE_CONFIG.url.replace(/\/$/, '');
  const finalPath = path ? `/${path}` : '';
  return `${base}${finalPath}${queryString ? `?${queryString}` : ''}`;
}

function copyRequestHeaders(request: NextRequest): HeadersInit {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (['host', 'content-length'].includes(lower)) return;
    headers.set(key, value);
  });
  // Définir un User-Agent côté proxy
  headers.set('User-Agent', 'IAHome-Metube-Proxy/1.0');
  // Référent utile pour certaines apps
  headers.set('Referer', METUBE_CONFIG.url);
  // Pont de cookies depuis la page proxy principale
  const bridge = request.cookies.get('metube_bridge')?.value;
  if (bridge && !headers.has('Cookie')) {
    headers.set('Cookie', decodeURIComponent(bridge));
  }
  return headers;
}

async function forward(request: NextRequest, pathSegments: string[]) {
  try {
    const targetUrl = buildUpstreamUrl(pathSegments, request);
    const method = request.method.toUpperCase();

    const upstreamHeaders = copyRequestHeaders(request);

    const init: RequestInit & { duplex?: 'half' } = {
      method,
      headers: upstreamHeaders,
      redirect: 'manual',
    };

    if (!['GET', 'HEAD'].includes(method)) {
      const contentType = request.headers.get('content-type') || '';
      try {
        if (contentType.includes('application/json')) {
          const text = await request.text();
          init.body = text;
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const text = await request.text();
          init.body = text;
        } else if (contentType.includes('multipart/form-data')) {
          const ab = await request.arrayBuffer();
          init.body = Buffer.from(ab);
        } else {
          // Fallback: stream avec duplex si nécessaire
          init.body = request.body as any;
          (init as any).duplex = 'half';
        }
      } catch (e) {
        console.error('❌ Erreur lecture corps requête:', e);
        init.body = request.body as any;
        (init as any).duplex = 'half';
      }
    }

    console.log(`🔁 [Metube Proxy] ${method} ${targetUrl}`);
    const response = await fetch(targetUrl, init);
    console.log(`✅ [Metube Proxy] Upstream status=${response.status} for ${method} ${targetUrl}`);

    // Propager le corps tel quel si possible
    const proxiedBody = (response.body as any) ?? (await response.arrayBuffer());

    // Copier certains en-têtes importants en sortie
    const outHeaders = new Headers();
    const passthroughHeaders = [
      'content-type',
      'content-length',
      'set-cookie',
      'location',
      'cache-control',
      'etag',
    ];
    passthroughHeaders.forEach((h) => {
      const v = response.headers.get(h);
      if (v) outHeaders.set(h, v);
    });

    // Mettre à jour le cookie pont si upstream renvoie un Set-Cookie
    const upstreamSetCookie = response.headers.get('set-cookie');
    if (upstreamSetCookie) {
      outHeaders.append('Set-Cookie', `metube_bridge=${encodeURIComponent(upstreamSetCookie)}; Path=/api/proxy-metube; SameSite=None; Secure`);
    }

    // CORS basique pour éviter les 405/échecs de preflight dans l'iframe
    outHeaders.set('Access-Control-Allow-Origin', '*');
    outHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    outHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    outHeaders.set('X-Proxy-By', 'IAHome-Metube-Proxy');

    return new NextResponse(proxiedBody as any, {
      status: response.status,
      headers: outHeaders,
    });
  } catch (error) {
    console.error('❌ Erreur proxy Metube (catch-all):', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path || []);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path || []);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path || []);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return forward(request, path || []);
}

export async function OPTIONS(
  _request: NextRequest,
  _ctx: { params: Promise<{ path: string[] }> }
) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}


