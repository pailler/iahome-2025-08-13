import { NextRequest, NextResponse } from 'next/server';

// Configuration du module Metube
const METUBE_CONFIG = {
  url: 'http://iahome-metube:8081',
};

function buildTargetUrl(request: NextRequest, path: string[]): string {
  const search = new URL(request.url).search;
  const joined = path.join('/');
  const qs = search ? search : '';
  return `${METUBE_CONFIG.url}/api/${joined}${qs}`;
}

async function proxyRequest(request: NextRequest, targetUrl: string): Promise<NextResponse> {
  const method = request.method.toUpperCase();
  const headers: Record<string, string> = {
    'User-Agent': 'IAHome-Metube-Proxy/1.0',
    'Accept': request.headers.get('accept') || '*/*',
    'Accept-Encoding': request.headers.get('accept-encoding') || 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': METUBE_CONFIG.url,
    'Referer': `${METUBE_CONFIG.url}/`,
  };

  // Inject upstream session cookies if present
  const upstreamCookie = request.cookies.get('metube_upstream')?.value;
  if (upstreamCookie) {
    try {
      headers['Cookie'] = decodeURIComponent(upstreamCookie);
    } catch {
      headers['Cookie'] = upstreamCookie;
    }
  }

  let body: BodyInit | undefined;
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type') || 'application/json';
    headers['Content-Type'] = contentType;
    // Pass-through body as text to be safe for urlencoded/json
    body = await request.text();
  }

  const upstream = await fetch(targetUrl, { method, headers, body });
  const status = upstream.status;
  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const responseBody = upstream.body ?? (await upstream.arrayBuffer());

  return new NextResponse(responseBody as any, {
    status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'X-Proxy-By': 'IAHome-Metube-Proxy',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = buildTargetUrl(request, path);
  return proxyRequest(request, target);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = buildTargetUrl(request, path);
  return proxyRequest(request, target);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = buildTargetUrl(request, path);
  return proxyRequest(request, target);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = buildTargetUrl(request, path);
  return proxyRequest(request, target);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}


