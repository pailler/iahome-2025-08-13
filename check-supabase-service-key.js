require('dotenv').config({ path: '.env.local' });

console.log('🔍 Vérification des variables d\'environnement Supabase...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Présent' : '❌ Manquant');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Présent' : '❌ Manquant');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Présent' : '❌ Manquant');

if (!supabaseServiceKey) {
  console.log('\n❌ PROBLÈME IDENTIFIÉ: La clé de service Supabase est manquante!');
  console.log('Cette clé est nécessaire pour utiliser supabase.auth.admin.getUserByEmail()');
  console.log('Le webhook Stripe ne peut pas récupérer les utilisateurs sans cette clé.');
  console.log('\n🔧 SOLUTION: Ajouter SUPABASE_SERVICE_ROLE_KEY dans .env.local');
} else {
  console.log('\n✅ La clé de service Supabase est configurée');
} 