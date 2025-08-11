import { NextRequest, NextResponse } from 'next/server';

const METUBE_CONFIG = {
  url: process.env.METUBE_INTERNAL_URL || 'http://iahome-metube:8081',
};

function rewriteMetubeHtml(html: string): string {
  let modified = html;
  // Normalize or inject <base> to resolve relative paths via the proxy root
  if (/<base\s+href=/i.test(modified)) {
    modified = modified.replace(/<base\s+href="[^"]*"\s*\/>|<base\s+href="[^"]*"\s*>/i, '<base href="/api/proxy-metube/">');
  } else if (modified.includes('<head>')) {
    modified = modified.replace('<head>', '<head><base href="/api/proxy-metube/">');
  }

  // Rewrite absolute src/href on key tags to go through the proxy root
  modified = modified.replace(/<(script|link|img|a)([^>]*?)\s(src|href)="\/([^"']+)"/gi, (m, tag, attrs, attr, path) => {
    if (path.startsWith('api/proxy-metube/')) return m;
    return `<${tag}${attrs} ${attr}="/api/proxy-metube/${path}"`;
  });

  return modified;
}

export async function GET(_request: NextRequest) {
  try {
    const upstream = await fetch(METUBE_CONFIG.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Metube-Proxy/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    const status = upstream.status;
    const html = await upstream.text();
    const rewritten = rewriteMetubeHtml(html);

    return new NextResponse(rewritten, {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        // Allow scripts and inline for full functionality
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src *; img-src 'self' data:; style-src 'self' 'unsafe-inline'",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur proxy Metube' }, { status: 500 });
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



