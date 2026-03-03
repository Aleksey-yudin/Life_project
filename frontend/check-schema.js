import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zwfklojxdghhbeaqcyww.supabase.co'
const supabaseAnonKey = 'sb_publishable_j5pG83lhPvtFTPHTnhPBZA_v2InaKQn'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSchema() {
  console.log('=== Проверка схемы базы данных ===\n')

  // Проверка существования таблиц
  console.log('1. Существование таблиц:')
  console.log('   Проверьте вручную в Supabase Dashboard → Database → Tables')
  const expectedTables = ['wallets', 'categories', 'transactions', 'habits', 'habit_entries', 'mood_log', 'todos']
  expectedTables.forEach(table => {
    console.log(`   - ${table}: должна существовать`)
  })

  // Проверка RLS
  console.log('\n2. Статус RLS для таблиц:')
  console.log('   Проверьте вручную в Supabase Dashboard → Database → Tables → [table] → Row Level Security')
  expectedTables.forEach(table => {
    console.log(`   - ${table}: должен иметь RLS enabled`)
  })

  // Проверка политик
  console.log('\n3. Существующие политики RLS:')
  console.log('   Проверьте вручную в Supabase Dashboard → Authentication → Policies')
  const expectedPolicies = [
    { table: 'wallets', name: 'Users can manage own wallets' },
    { table: 'categories', name: 'Users can manage own categories' },
    { table: 'transactions', name: 'Users can manage own transactions' },
    { table: 'habits', name: 'Users can manage own habits' },
    { table: 'habit_entries', name: 'Users can manage own habit entries' },
    { table: 'mood_log', name: 'Users can manage own mood logs' },
    { table: 'todos', name: 'Users can manage own todos' }
  ]
  expectedPolicies.forEach(p => {
    console.log(`   - ${p.table}: "${p.name}"`)
  })

  console.log('\n=== Диагностика через diagnose-db.js ===')
  console.log('Запустите: node diagnose-db.js')
  console.log('Этот скрипт попытается проверить подключение и наличие таблиц.')

  console.log('\n=== Рекомендации ===')
  console.log('1. Если таблицы не созданы - выполните миграцию из supabase-migrations/002_clean_schema.sql')
  console.log('2. Если RLS выключен - выполните: ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;')
  console.log('3. Если нет политик - создайте их согласно миграции')
  console.log('4. Проверьте, что пользователь авторизован перед операциями')
}

checkSchema().catch(console.error)
