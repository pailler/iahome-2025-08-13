const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllTables() {
  const targetEmail = 'formateur_tic@hotmail.com';
  
  try {
    console.log(`🔍 Vérification complète de toutes les tables pour: ${targetEmail}`);
    
    // 1. Trouver l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', targetEmail)
      .single();
    
    if (userError || !user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur: ${user.email} (${user.role}) - ID: ${user.id}`);
    console.log('');
    
    // 2. Liste des tables à vérifier
    const tablesToCheck = [
      'user_applications',
      'access_tokens',
      'user_subscriptions',
      'subscriptions',
      'user_modules',
      'user_access',
      'applications',
      'user_subscriptions',
      'module_access',
      'user_module_access',
      'active_applications',
      'user_active_apps',
      'selections',
      'user_selections',
      'active_modules',
      'user_active_modules'
    ];
    
    console.log('📋 Vérification de toutes les tables...');
    console.log('');
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`🔍 Vérification de la table: ${tableName}`);
        
        // Essayer d'accéder à la table
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.log(`❌ Table ${tableName} n'existe pas ou erreur d'accès`);
          console.log('');
          continue;
        }
        
        console.log(`✅ Table ${tableName} existe`);
        
        // Vérifier la structure
        if (tableData && tableData.length > 0) {
          console.log(`📊 Colonnes: ${Object.keys(tableData[0]).join(', ')}`);
        }
        
        // Chercher des données pour cet utilisateur
        let userData = null;
        let userDataError = null;
        
        // Essayer différentes colonnes possibles pour l'utilisateur
        const possibleUserColumns = ['user_id', 'email', 'user_email', 'created_by', 'owner_id'];
        
        for (const column of possibleUserColumns) {
          try {
            const { data: data, error: error } = await supabase
              .from(tableName)
              .select('*')
              .eq(column, user.id);
            
            if (!error && data && data.length > 0) {
              userData = data;
              userDataError = error;
              console.log(`📊 ${data.length} entrées trouvées avec ${column} = ${user.id}`);
              break;
            }
          } catch (e) {
            // Colonne n'existe pas, continuer
          }
        }
        
        // Si pas trouvé avec user_id, essayer avec email
        if (!userData) {
          try {
            const { data: data, error: error } = await supabase
              .from(tableName)
              .select('*')
              .eq('email', targetEmail);
            
            if (!error && data && data.length > 0) {
              userData = data;
              userDataError = error;
              console.log(`📊 ${data.length} entrées trouvées avec email = ${targetEmail}`);
            }
          } catch (e) {
            // Colonne email n'existe pas
          }
        }
        
        if (userData && userData.length > 0) {
          console.log(`📋 Données trouvées dans ${tableName}:`);
          userData.forEach((item, index) => {
            console.log(`  ${index + 1}. ID: ${item.id || 'N/A'}`);
            if (item.module_id) console.log(`     Module ID: ${item.module_id}`);
            if (item.module_name) console.log(`     Module: ${item.module_name}`);
            if (item.status) console.log(`     Statut: ${item.status}`);
            if (item.is_active !== undefined) console.log(`     Actif: ${item.is_active}`);
            if (item.created_at) console.log(`     Créé: ${new Date(item.created_at).toLocaleDateString()}`);
            console.log('');
          });
        } else {
          console.log(`📊 Aucune donnée trouvée pour cet utilisateur dans ${tableName}`);
        }
        
        console.log('');
        
      } catch (error) {
        console.log(`❌ Erreur lors de la vérification de ${tableName}:`, error.message);
        console.log('');
      }
    }
    
    console.log('📋 Résumé:');
    console.log(`- Utilisateur: ${targetEmail}`);
    console.log(`- Rôle: ${user.role}`);
    console.log(`- Tables vérifiées: ${tablesToCheck.length}`);
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkAllTables(); 