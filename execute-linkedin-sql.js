const fs = require('fs');

console.log(' Contenu du fichier SQL à exécuter :\n');
console.log('=' .repeat(80));
const sqlContent = fs.readFileSync('create-linkedin-tables.sql', 'utf8');
console.log(sqlContent);
console.log('=' .repeat(80));
console.log('');

console.log(' Instructions d\'exécution :');
console.log('1. Allez dans votre dashboard Supabase');
console.log('2. Ouvrez l\'éditeur SQL (SQL Editor)');
console.log('3. Copiez-collez le contenu ci-dessus');
console.log('4. Cliquez sur "Run" pour exécuter le script');
console.log('5. Vérifiez que les tables sont créées dans la section "Table Editor"');
console.log('');
console.log(' Les tables suivantes seront créées :');
console.log('   - linkedin_config (configuration LinkedIn)');
console.log('   - linkedin_posts (posts LinkedIn)');
console.log('   - linkedin_analytics (statistiques)');
console.log('');
console.log(' Sécurité : Seuls les admins pourront accéder à ces tables');
