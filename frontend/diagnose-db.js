import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zwfklojxdghhbeaqcyww.supabase.co'
const supabaseAnonKey = 'sb_publishable_j5pG83lhPvtFTPHTnhPBZA_v2InaKQn'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnose() {
  console.log('=== Диагностика базы данных Supabase ===\n')

  // 1. Проверка аутентификации
  console.log('1. Аутентификация:')
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    console.error('   Ошибка:', sessionError.message)
  } else if (session) {
    console.log('   Авторизован как:', session.user.email)
  } else {
    console.log('   Не авторизован (это нормально для проверки таблиц)')
  }

  // 2. Проверка таблиц
  console.log('\n2. Проверка доступа к таблицам:')
  const tables = ['wallets', 'categories', 'transactions', 'habits', 'habit_entries', 'mood_log', 'todos']
  let allAccessible = true

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1)
      if (error) {
        console.log(`   ${table}: ✗ ${error.message}`)
        allAccessible = false
      } else {
        console.log(`   ${table}: ✓ доступно`)
      }
    } catch (err) {
      console.log(`   ${table}: ✗ ${err.message}`)
      allAccessible = false
    }
  }

  // 3. Вывод рекомендаций
  console.log('\n=== АНАЛИЗ ===')
  if (allAccessible) {
    console.log('✓ Все таблицы доступны!')
    console.log('Если всё равно есть ошибки при сохранении:')
    console.log('1. Убедитесь, что вы вошли в систему в браузере')
    console.log('2. Проверьте, что в запросах передаётся user_id')
    console.log('3. Проверьте RLS политики - они должны разрешать операции для своего user_id')
  } else {
    console.log('✗ Нет доступа к таблицам')
    console.log('\n🔧 ВАЖНО: Это НЕ проблема с аутентификацией!')
    console.log('Ошибка "permission denied for schema public" означает:')
    console.log('   - Таблицы не созданы в базе данных, ИЛИ')
    console.log('   - RLS включён, но политики не настроены, ИЛИ')
    console.log('   - У анонимного пользователя нет прав на чтение/запись')
    console.log('\n📋 СЛЕДУЮЩИЕ ШАГИ:')
    console.log('1. Откройте Supabase Dashboard: https://app.supabase.com/')
    console.log('2. Перейдите в SQL Editor')
    console.log('3. Выполните миграцию из файла:')
    console.log('   frontend/supabase-migrations/002_clean_schema.sql')
    console.log('4. Убедитесь, что RLS включён для всех таблиц')
    console.log('5. Убедитесь, что созданы политики RLS')
    console.log('6. Создайте пользователя в Auth → Users')
    console.log('7. Войдите в приложение через браузер')
    console.log('\n📚 Подробное руководство: SUPABASE_SETUP_GUIDE.md')
  }

  console.log('\n=== Диагностика завершена ===')
}

diagnose().catch(console.error)
