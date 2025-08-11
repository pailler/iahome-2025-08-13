import { NextRequest, NextResponse } from 'next/server';

// Configuration du module Librespeed
const LIBRESPEED_CONFIG = {
  // URL interne du service (Docker) ou configurable par variable d'environnement
  url: process.env.LIBRESPEED_INTERNAL_URL || 'http://iahome-speedtest:80',
  externalUrl: process.env.LIBRESPEED_EXTERNAL_URL || 'http://localhost:6702',
};

function rewriteLibrespeedUrls(html: string): string {
  let modified = html;
  // Injecter/normaliser <base> pour les chemins relatifs (éviter duplication)
  if (/\<base\s+href=/i.test(modified)) {
    modified = modified.replace(/<base\s+href="[^"]*"\s*\/>|<base\s+href="[^"]*"\s*>/i, '<base href="/api/proxy-librespeed/">');
  } else if (modified.includes('<head>')) {
    modified = modified.replace('<head>', '<head><base href="/api/proxy-librespeed/">');
  }
  // Réécrire uniquement les attributs absolus sur tags cibles
  modified = modified.replace(/<(script|link|img|a)([^>]*?)\s(src|href)="\/([^"']+)"/gi, (m, tag, attrs, attr, path) => {
    if (path.startsWith('api/proxy-librespeed/')) return m;
    return `<${tag}${attrs} ${attr}="/api/proxy-librespeed/${path}"`;
  });
  return modified;
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(LIBRESPEED_CONFIG.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Librespeed-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow',
    });

    const status = response.status;
    const html = await response.text();
    const rewritten = rewriteLibrespeedUrls(html);

    return new NextResponse(rewritten, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Librespeed-Proxy',
        // Autoriser l'exécution des scripts (et inline handlers) côté iframe
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data:; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'",
      },
    });
  } catch (error) {
    console.error('❌ Erreur proxy Librespeed GET:', error);
    return NextResponse.json({ error: 'Erreur proxy Librespeed' }, { status: 500 });
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


