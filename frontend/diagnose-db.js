const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwfklojxdghhbeaqcyww.supabase.co';
const supabaseAnonKey = 'sb_publishable_j5pG83lhPvtFTPHTnhPBZA_v2InaKQn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('Diagnosing database...\n');

  // Try to get table information via direct query
  const query = `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    ORDER BY table_name, ordinal_position;
  `;

  try {
    const { data, error } = await supabase.rpc('pg_catalog.pg_tables');
    console.log('Cannot access pg_catalog directly from client.');
  } catch (e) {
    console.log('Note: Need to use Supabase SQL Editor to check structure.');
  }

  // Try to query each table and see exact error
  const tables = ['wallets', 'categories', 'transactions', 'habits', 'habit_entries', 'mood_log', 'todos'];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`\nTable '${table}' error: ${error.message}`);
        console.log(`Details: ${JSON.stringify(error, null, 2)}`);
      }
    } catch (e) {
      console.log(`\nTable '${table}' exception: ${e.message}`);
    }
  }
}

diagnose().then(() => {
  console.log('\nDiagnosis complete');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});