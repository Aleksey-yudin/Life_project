const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zwfklojxdghhbeaqcyww.supabase.co';
const supabaseAnonKey = 'sb_publishable_j5pG83lhPvtFTPHTnhPBZA_v2InaKQn';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking database schema...\n');

  // Get list of tables
  const { data: tables, error: tablesError } = await supabase
    .rpc('pg_catalog.pg_tables');

  if (tablesError) {
    console.log('Cannot query pg_tables directly. Trying alternative method...');
    // Try to query each table to see what exists
    const testTables = ['wallets', 'categories', 'transactions', 'habits', 'habit_entries', 'mood_log', 'todos'];

    for (const table of testTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': EXISTS`);
        }
      } catch (e) {
        console.log(`❌ Table '${table}': EXCEPTION - ${e.message}`);
      }
    }
    return;
  }

  console.log('Tables in database:', tables);
}

checkSchema().then(() => {
  console.log('\nCheck complete');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});