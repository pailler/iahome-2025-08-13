const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixChatDatabase() {
  console.log('🔧 Début de la correction de la base de données du chat...\n');

  try {
    // 1. Vérifier si la table existe
    console.log('📋 Vérification de l\'existence de la table...');
    const { data: tableExists, error: tableError } = await supabase
      .from('chat_conversations')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('❌ Table chat_conversations n\'existe pas');
      console.log('💡 Exécutez d\'abord le script create-chat-conversations-table.sql');
      return;
    }

    console.log('✅ Table chat_conversations existe\n');

    // 2. Tester l'insertion d'une conversation de test
    console.log('🧪 Test d\'insertion d\'une conversation...');
    const testConversation = {
      user_id: '00000000-0000-0000-0000-000000000000', // UUID de test
      user_message: 'Test message',
      ai_response: 'Test response',
      created_at: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('chat_conversations')
      .insert(testConversation)
      .select();

    if (insertError) {
      console.log('❌ Erreur d\'insertion:', insertError.message);
      
      if (insertError.code === '42501') {
        console.log('🔒 Problème de permissions RLS détecté');
        console.log('💡 Solutions possibles:');
        console.log('   1. Exécutez le script fix-chat-conversations-rls.sql');
        console.log('   2. Ou désactivez temporairement RLS:');
        console.log('      ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;');
      }
    } else {
      console.log('✅ Insertion réussie');
      
      // Nettoyer la conversation de test
      await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🧹 Conversation de test supprimée');
    }

    // 3. Vérifier la structure de la table
    console.log('\n📊 Structure de la table:');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'chat_conversations' });

    if (columnsError) {
      console.log('⚠️ Impossible de récupérer la structure (normal si la fonction n\'existe pas)');
    } else {
      console.log(columns);
    }

    // 4. Vérifier les politiques RLS
    console.log('\n🔐 Vérification des politiques RLS:');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'chat_conversations' });

    if (policiesError) {
      console.log('⚠️ Impossible de récupérer les politiques (normal si la fonction n\'existe pas)');
    } else {
      console.log(policies);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }

  console.log('\n✨ Diagnostic terminé');
  console.log('\n📝 Prochaines étapes:');
  console.log('1. Connectez-vous à votre dashboard Supabase');
  console.log('2. Allez dans l\'éditeur SQL');
  console.log('3. Exécutez le script fix-chat-conversations-rls.sql');
  console.log('4. Ou exécutez cette commande simple:');
  console.log('   ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;');
}

// Exécuter le script
fixChatDatabase().catch(console.error); 