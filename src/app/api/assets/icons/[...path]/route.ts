import { NextRequest, NextResponse } from 'next/server';

// Configuration du module Metube
const METUBE_CONFIG = {
  url: 'http://iahome-metube:8081', // URL interne du module Metube
};

// Fonction pour déterminer le MIME type basé sur l'extension
function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'webp': 'image/webp'
  };
  return mimeTypes[ext || ''] || 'image/png';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const fullPath = `assets/icons/${pathString}`;
    
    console.log(`🖼️ Requête icône: ${fullPath}`);
    
    const response = await fetch(`${METUBE_CONFIG.url}/${fullPath}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'IAHome-Metube-Proxy/1.0',
        'Accept': 'image/*'
      }
    });

    if (!response.ok) {
      console.log(`❌ Icône non trouvée: ${fullPath} (${response.status})`);
      return new NextResponse('Icône non trouvée', { status: 404 });
    }

    const contentType = getMimeType(pathString);
    const content = await response.arrayBuffer();

    console.log(`✅ Icône servie: ${fullPath} (${content.byteLength} bytes) - MIME: ${contentType}`);

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache plus long pour les icônes
        'X-Proxy-By': 'IAHome-Metube-Proxy',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    });
  } catch (error) {
    console.error('❌ Erreur route icônes:', error);
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




