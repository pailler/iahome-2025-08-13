'use client';
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import { useParams } from "next/navigation";

// Configuration Supabase côté client
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AccessPageSimple() {
  const params = useParams();
  const token = params.token as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessData, setAccessData] = useState<any>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 [SIMPLE] Début validation token:', token);
        setLoading(true);
        
        if (!token) {
          console.log('❌ [SIMPLE] Token manquant');
          setError('Token d\'accès manquant');
          return;
        }

        console.log('🔍 [SIMPLE] Recherche dans Supabase...');
        
        // Recherche directe dans Supabase
        const { data, error: supabaseError } = await supabase
          .from('magic_links')
          .select('*')
          .eq('token', token)
          .eq('is_used', false)
          .single();

        console.log('🔍 [SIMPLE] Résultat Supabase:', { data, error: supabaseError });

        if (supabaseError) {
          console.log('❌ [SIMPLE] Erreur Supabase:', supabaseError);
          setError('Erreur lors de la validation du token');
          return;
        }

        if (!data) {
          console.log('❌ [SIMPLE] Magic link non trouvé ou déjà utilisé');
          setError('Token d\'accès invalide ou expiré');
          return;
        }

        console.log('✅ [SIMPLE] Magic link trouvé:', data);

        // Vérifier l'expiration
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        console.log('🔍 [SIMPLE] Vérification expiration:', {
          now: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          isExpired: expiresAt < now
        });

        if (expiresAt < now) {
          console.log('❌ [SIMPLE] Magic link expiré');
          setError('Token d\'accès expiré');
          return;
        }

        console.log('✅ [SIMPLE] Accès validé avec succès!');
        setAccessData({
          moduleName: data.module_name,
          userId: data.user_id,
          expiresAt: expiresAt,
          isValid: true
        });

        // Rediriger vers le module après un court délai
        setTimeout(() => {
          const moduleUrls: { [key: string]: string } = {
            'IAmetube': 'https://metube.regispailler.fr',
            'IAphoto': 'https://iaphoto.regispailler.fr',
            'IAvideo': 'https://iavideo.regispailler.fr',
            'test-module': 'https://test.example.com',
          };

          const targetUrl = moduleUrls[data.module_name];
          if (targetUrl) {
            console.log('🔍 [SIMPLE] Redirection vers:', targetUrl);
            window.open(`${targetUrl}?token=${token}`, '_blank');
          }
        }, 2000);

      } catch (error) {
        console.error('❌ [SIMPLE] Erreur validation token:', error);
        setError('Erreur lors de la validation du token');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validation de l'accès (version simple)...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès refusé (Simple)</h2>
          <p className="text-gray-600 mb-6">{error}</p>

        </div>
      </div>
    );
  }

  if (accessData) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Accès autorisé (Simple)</h2>
          <p className="text-gray-600 mb-4">
            Redirection vers {accessData.moduleName}...
          </p>
          <div className="animate-pulse">
            <div className="text-sm text-gray-500">
              Expire le: {accessData.expiresAt.toLocaleString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}