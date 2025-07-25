'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function TestCartes() {
  const [cartes, setCartes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<string>('');

  useEffect(() => {
    checkAuthStatus();
    fetchCartes();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setAuthStatus(`❌ Erreur session: ${error.message}`);
      } else if (session) {
        setAuthStatus(`✅ Connecté: ${session.user.email} (${session.user.id})`);
      } else {
        setAuthStatus('❌ Non connecté');
      }
    } catch (error) {
      setAuthStatus(`❌ Erreur auth: ${error}`);
    }
  };

  const fetchCartes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('cartes').select('*');
      
      if (error) {
        console.error('Erreur lors du chargement:', error);
        setTestResult(`Erreur: ${error.message}`);
      } else {
        console.log('Cartes chargées:', data);
        setCartes(data || []);
        setTestResult(`✅ ${data?.length || 0} cartes chargées`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setTestResult(`Erreur: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testUpdate = async () => {
    if (cartes.length === 0) {
      setTestResult('❌ Aucune carte à modifier');
      return;
    }

    const carteToUpdate = cartes[0];
    const newData = {
      title: `Test Modifié ${Date.now()}`,
      description: `Description modifiée à ${new Date().toLocaleString()}`,
      category: 'IA Photo',
      price: 99.99,
      youtube_url: 'https://www.youtube.com/embed/test'
    };

    try {
      console.log('=== TEST MODIFICATION ===');
      console.log('Carte à modifier:', carteToUpdate);
      console.log('Nouvelles données:', newData);

      const { data, error } = await supabase
        .from('cartes')
        .update(newData)
        .eq('id', carteToUpdate.id)
        .select();

      if (error) {
        console.error('Erreur modification:', error);
        setTestResult(`❌ Erreur modification: ${error.message}`);
      } else {
        console.log('Modification réussie:', data);
        setTestResult(`✅ Modification réussie: ${data?.[0]?.title}`);
        fetchCartes(); // Recharger
      }
    } catch (error) {
      console.error('Erreur:', error);
      setTestResult(`❌ Erreur: ${error}`);
    }
  };

  const testInsert = async () => {
    const newCarte = {
      title: `Nouvelle Carte Test ${Date.now()}`,
      description: 'Description de test',
      category: 'IA Video',
      price: 49.99,
      youtube_url: 'https://www.youtube.com/embed/newtest'
    };

    try {
      console.log('=== TEST AJOUT ===');
      console.log('Nouvelle carte:', newCarte);

      const { data, error } = await supabase
        .from('cartes')
        .insert([newCarte])
        .select();

             if (error) {
         console.error('Erreur ajout:', error);
         console.error('Détails erreur:', JSON.stringify(error, null, 2));
         setTestResult(`❌ Erreur ajout: ${error.message || 'Erreur inconnue'} (Code: ${error.code || 'N/A'})`);
       } else {
        console.log('Ajout réussi:', data);
        setTestResult(`✅ Ajout réussi: ${data?.[0]?.title}`);
        fetchCartes(); // Recharger
      }
    } catch (error) {
      console.error('Erreur:', error);
      setTestResult(`❌ Erreur: ${error}`);
    }
  };

  const testDelete = async () => {
    if (cartes.length === 0) {
      setTestResult('❌ Aucune carte à supprimer');
      return;
    }

    const carteToDelete = cartes[cartes.length - 1];

    try {
      console.log('=== TEST SUPPRESSION ===');
      console.log('Carte à supprimer:', carteToDelete);

      const { error } = await supabase
        .from('cartes')
        .delete()
        .eq('id', carteToDelete.id);

      if (error) {
        console.error('Erreur suppression:', error);
        setTestResult(`❌ Erreur suppression: ${error.message}`);
      } else {
        console.log('Suppression réussie');
        setTestResult(`✅ Suppression réussie: ${carteToDelete.title}`);
        fetchCartes(); // Recharger
      }
    } catch (error) {
      console.error('Erreur:', error);
      setTestResult(`❌ Erreur: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 pt-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Table Cartes</h1>
        
                 <div className="bg-white rounded-lg shadow-md p-6 mb-6">
           <h2 className="text-xl font-semibold mb-4">Actions de test</h2>
           
           <div className="bg-blue-50 p-4 rounded mb-4">
             <strong>État d'authentification:</strong> {authStatus}
           </div>
           
           <div className="flex gap-4 mb-4">
            <button
              onClick={fetchCartes}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recharger
            </button>
            <button
              onClick={testInsert}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Ajout
            </button>
            <button
              onClick={testUpdate}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Test Modification
            </button>
            <button
              onClick={testDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Test Suppression
            </button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded">
            <strong>Résultat:</strong> {testResult}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Cartes ({cartes.length})
            {loading && <span className="text-gray-500 ml-2">Chargement...</span>}
          </h2>
          
          {cartes.length === 0 ? (
            <p className="text-gray-500">Aucune carte trouvée</p>
          ) : (
            <div className="space-y-4">
              {cartes.map((carte) => (
                <div key={carte.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong> {carte.id}
                    </div>
                    <div>
                      <strong>Titre:</strong> {carte.title}
                    </div>
                    <div>
                      <strong>Catégorie:</strong> {carte.category || 'Non définie'}
                    </div>
                    <div>
                      <strong>Prix:</strong> {carte.price}€
                    </div>
                    <div className="col-span-2">
                      <strong>Description:</strong> {carte.description}
                    </div>
                    <div className="col-span-2">
                      <strong>YouTube:</strong> {carte.youtube_url || 'Non définie'}
                    </div>
                    <div>
                      <strong>Créé:</strong> {new Date(carte.created_at).toLocaleString()}
                    </div>
                    <div>
                      <strong>Modifié:</strong> {new Date(carte.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 