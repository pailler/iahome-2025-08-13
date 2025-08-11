import { NextRequest, NextResponse } from 'next/server';

// Configuration du module Metube
const METUBE_CONFIG = {
  url: 'http://iahome-metube:8081', // URL interne du module Metube (nom du service Docker)
};

// Fonction pour déterminer le MIME type basé sur l'extension
function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'htm': 'text/html',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',
    'xml': 'application/xml',
    'txt': 'text/plain'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Réécriture des URLs à l'intérieur de fichiers texte (JS/CSS/HTML)
function rewriteContent(content: string): string {
  let modified = content;
  // fetch('/api/...') → fetch('/api/proxy-metube/api/...')
  modified = modified.replace(/fetch\(\s*['\"](\/api\/[^'\"]+)['\"]/g, (m, p) => `fetch('/api/proxy-metube${p}'`);
  // fetch('api/...'), './api/...', '../api/...'
  modified = modified.replace(/fetch\(\s*['\"]((?:\.{0,2}\/)?api\/[^'\"]+)['\"]/g, (m, p) => {
    const normalized = p.replace(/^\.\/?/, '').replace(/^\.\.\//, '');
    return `fetch('/api/proxy-metube/${normalized}'`;
  });
  // url: '/api/...'
  modified = modified.replace(/url:\s*['\"](\/api\/[^'\"]+)['\"]/g, (m, p) => `url: '/api/proxy-metube${p}'`);
  modified = modified.replace(/url:\s*['\"]((?:\.{0,2}\/)?api\/[^'\"]+)['\"]/g, (m, p) => {
    const normalized = p.replace(/^\.\/?/, '').replace(/^\.\.\//, '');
    return `url: '/api/proxy-metube/${normalized}'`;
  });
  // action="/api/..."
  modified = modified.replace(/action="(\/api\/[^"']+)"/g, (m, p) => `action="/api/proxy-metube${p}"`);
  modified = modified.replace(/action="((?:\.{0,2}\/)?api\/[^"']+)"/g, (m, p) => {
    const normalized = p.replace(/^\.\/?/, '').replace(/^\.\.\//, '');
    return `action="/api/proxy-metube/${normalized}"`;
  });
  // Socket.IO
  modified = modified.replace(/['\"]\/socket\.io\//g, `'\/api\/proxy-metubesocket.io\/`);
  return modified;
}

// Fonction pour servir les fichiers statiques via le proxy
async function serveStaticFile(path: string): Promise<Response> {
  try {
    console.log(`📁 Servir fichier statique: ${path}`);
    
    const response = await fetch(`${METUBE_CONFIG.url}/${path}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Metube-Proxy/1.0',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      console.log(`❌ Fichier non trouvé: ${path} (${response.status})`);
      return new NextResponse('Fichier non trouvé', { status: 404 });
    }

    // Utiliser le MIME type correct basé sur l'extension
    const contentType = getMimeType(path);

    let body: ArrayBuffer | string;
    if (/(javascript|text\/html|text\/css)/i.test(contentType)) {
      const text = await response.text();
      body = rewriteContent(text);
    } else {
      const buf = await response.arrayBuffer();
      body = buf;
    }

    const size = typeof body === 'string' ? body.length : (body as ArrayBuffer).byteLength;
    console.log(`✅ Fichier servi: ${path} (${size} bytes) - MIME: ${contentType}`);

    return new NextResponse(body as any, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    });
  } catch (error) {
    console.error(`❌ Erreur serveur fichier statique ${path}:`, error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    console.log(`📁 Requête fichier statique: ${pathString}`);
    return await serveStaticFile(pathString);
  } catch (error) {
    console.error('❌ Erreur route statique:', error);
    return new NextResponse('Erreur interne du serveur', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
  });
}
