import { NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Vérifier la connexion à Supabase (optionnel pour le healthcheck)
    let dbStatus = 'ok';
    let responseTime = 0;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      dbStatus = error ? 'error' : 'ok';
      responseTime = Date.now() - startTime;
    } catch (dbError) {
      console.warn('Database health check failed:', dbError);
      dbStatus = 'error';
      responseTime = Date.now() - startTime;
    }
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'not-configured'
        },
        stripe: {
          status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not-configured'
        },
        resend: {
          status: process.env.RESEND_API_KEY ? 'configured' : 'not-configured'
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    
    // Toujours retourner 200 même si la DB échoue
    return NextResponse.json(healthStatus, { status: 200 });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Internal server error',
      uptime: process.uptime()
    }, { status: 503 });
  }
} 