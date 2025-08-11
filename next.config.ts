import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration pour la production avec Docker
  output: 'standalone', // Activé pour Docker
  experimental: {
    // outputFileTracingRoot: undefined, // Supprimé car obsolète
  },
  
  // Désactiver ESLint temporairement pour le déploiement
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  serverExternalPackages: ['@supabase/supabase-js'],
  
  // Configuration pour résoudre l'avertissement cross-origin
  allowedDevOrigins: [
    'iahome.fr',
    'www.iahome.fr',
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
  
  // Configuration des domaines autorisés avec remotePatterns
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iahome.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.iahome.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'home.regispailler.fr',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.150',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;