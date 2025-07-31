// Script pour configurer la base de données Supabase
// Usage: node setup-database.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🔧 Configuration de la base de données...');

  try {
    // 1. Créer la table profiles
    console.log('📋 Création de la table profiles...');
    
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (profilesError) {
      console.log('⚠️ Table profiles existe déjà ou erreur:', profilesError.message);
    } else {
      console.log('✅ Table profiles créée');
    }

    // 2. Activer RLS sur profiles
    console.log('🔒 Activation de RLS sur profiles...');
    
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('⚠️ RLS déjà activé ou erreur:', rlsError.message);
    } else {
      console.log('✅ RLS activé sur profiles');
    }

    // 3. Créer les politiques RLS
    console.log('📜 Création des politiques RLS...');
    
    const policies = [
      {
        name: 'Users can view own profile',
        sql: `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);`
      },
      {
        name: 'Users can update own profile',
        sql: `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`
      },
      {
        name: 'Users can insert own profile',
        sql: `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`
      }
    ];

    for (const policy of policies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.log(`⚠️ Politique ${policy.name} existe déjà ou erreur:`, error.message);
      } else {
        console.log(`✅ Politique ${policy.name} créée`);
      }
    }

    // 4. Créer la table module_access_logs
    console.log('📋 Création de la table module_access_logs...');
    
    const { error: logsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS module_access_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          module_name TEXT NOT NULL,
          access_token TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
          metadata JSONB DEFAULT '{}'::jsonb
        );
      `
    });

    if (logsError) {
      console.log('⚠️ Table module_access_logs existe déjà ou erreur:', logsError.message);
    } else {
      console.log('✅ Table module_access_logs créée');
    }

    // 5. Activer RLS sur module_access_logs
    console.log('🔒 Activation de RLS sur module_access_logs...');
    
    const { error: logsRlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE module_access_logs ENABLE ROW LEVEL SECURITY;
      `
    });

    if (logsRlsError) {
      console.log('⚠️ RLS déjà activé ou erreur:', logsRlsError.message);
    } else {
      console.log('✅ RLS activé sur module_access_logs');
    }

    console.log('🎉 Configuration de la base de données terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  }
}

// Exécuter le script
setupDatabase(); 