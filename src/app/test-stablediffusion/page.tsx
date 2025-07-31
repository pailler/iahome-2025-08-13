'use client';
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestStableDiffusion() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkAndCreateUser = async () => {
    setLoading(true);
    setResult('Vérification de l\'utilisateur...');

    try {
      // Récupérer la session actuelle
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setResult('❌ Aucune session active. Veuillez vous connecter.');
        return;
      }

      const userId = session.user.id;
      setResult(`🔍 Vérification de l'utilisateur: ${userId}`);

             // Vérifier si l'utilisateur existe dans la table profiles
       const { data: existingProfile, error: fetchError } = await supabase
         .from('profiles')
         .select('*')
         .eq('id', userId)
         .single();

       if (fetchError && fetchError.code === 'PGRST116') {
         // L'utilisateur n'existe pas, le créer
         setResult('👤 Création du profil utilisateur...');
         
         const { data: newProfile, error: createError } = await supabase
           .from('profiles')
           .insert({
             id: userId,
             email: session.user.email,
             role: 'user'
           })
           .select()
           .single();

         if (createError) {
           setResult(`❌ Erreur lors de la création du profil: ${createError.message}`);
           console.error('Détails de l\'erreur:', createError);
           return;
         }

         setResult(`✅ Profil créé avec succès: ${newProfile.email}`);
       } else if (fetchError) {
         setResult(`❌ Erreur lors de la vérification: ${fetchError.message}`);
         console.error('Détails de l\'erreur:', fetchError);
         return;
       } else {
         setResult(`✅ Profil existant trouvé: ${existingProfile.email}`);
       }

      // Maintenant tester la génération de token
      setResult('🔐 Test de génération de token...');
      
      const tokenResponse = await fetch('/api/generate-module-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleName: 'stablediffusion',
          userId: userId
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenResponse.ok) {
        setResult(`✅ Succès! Token généré: ${tokenData.token.substring(0, 50)}...`);
      } else {
        setResult(`❌ Erreur génération token: ${tokenData.error}`);
      }

    } catch (error) {
      setResult(`❌ Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Stable Diffusion API</h1>
        
        <button
          onClick={checkAndCreateUser}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : 'Vérifier et créer l\'utilisateur'}
        </button>

        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h2 className="font-semibold mb-2">Résultat:</h2>
          <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
} 