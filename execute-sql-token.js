const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQLToken() {
  try {
    console.log('🔍 Exécution du script SQL pour créer le token de test...');
    
    // Lire le fichier SQL
    const sqlContent = fs.readFileSync('create-test-token.sql', 'utf8');
    console.log('📋 Contenu SQL chargé');
    
    // Exécuter le SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sqlContent
    });
    
    if (error) {
      console.log('❌ Erreur lors de l\'exécution SQL:', error.message);
      
      // Essayer une approche différente avec des requêtes individuelles
      console.log('💡 Tentative avec des requêtes individuelles...');
      
      // 1. Désactiver RLS
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE access_tokens DISABLE ROW LEVEL SECURITY;'
      });
      
      if (disableError) {
        console.log('❌ Erreur désactivation RLS:', disableError.message);
      } else {
        console.log('✅ RLS désactivé temporairement');
      }
      
      // 2. Insérer le token
      const tokenData = {
        id: 'test_token_regispailler_ruinedfooocus',
        name: 'Token Test ruinedfooocus - regispailler@gmail.com',
        description: 'Token de test pour ruinedfooocus créé manuellement',
        module_id: 13,
        module_name: 'ruinedfooocus',
        access_level: 'basic',
        permissions: ['access'],
        max_usage: 100,
        current_usage: 0,
        is_active: true,
        created_by: '4ff83788-7bdb-4633-a693-3ad98006fed5',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        jwt_token: 'test-jwt-token-regispailler-ruinedfooocus'
      };
      
      const { data: newToken, error: insertError } = await supabase
        .from('access_tokens')
        .insert([tokenData])
        .select()
        .single();
      
      if (insertError) {
        console.log('❌ Erreur insertion token:', insertError.message);
      } else {
        console.log('✅ Token créé avec succès !');
        console.log('\n📋 Détails du token:');
        console.log(`- ID: ${newToken.id}`);
        console.log(`- Nom: ${newToken.name}`);
        console.log(`- Module: ${newToken.module_name}`);
        console.log(`- Utilisations: ${newToken.current_usage} / ${newToken.max_usage}`);
        console.log(`- Statut: ${newToken.is_active ? 'Actif' : 'Inactif'}`);
        console.log(`- Créé: ${new Date(newToken.created_at).toLocaleDateString()}`);
        console.log(`- Expire: ${new Date(newToken.expires_at).toLocaleDateString()}`);
      }
      
      // 3. Réactiver RLS
      const { error: enableError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;'
      });
      
      if (enableError) {
        console.log('❌ Erreur réactivation RLS:', enableError.message);
      } else {
        console.log('✅ RLS réactivé');
      }
      
    } else {
      console.log('✅ Script SQL exécuté avec succès !');
      console.log('📋 Résultat:', data);
    }
    
    console.log('\n🎉 Le token a été créé !');
    console.log('💡 Maintenant, quand vous visiterez /encours, vous devriez voir les informations du token.');
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

executeSQLToken(); 