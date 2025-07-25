import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configuration pour résoudre l'avertissement cross-origin
  allowedDevOrigins: [
    'home.regispailler.fr',
    '192.168.1.150',
    'localhost'
  ],
  
  // Configuration pour le domaine
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Autoriser CORS pour l'IP locale et le domaine custom
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          }
        ]
      }
    ];
  },
  
  // Configuration des domaines autorisés
  images: {
    domains: ['home.regispailler.fr', '192.168.1.150', 'localhost', 'images.unsplash.com']
  },
};

export default nextConfig;