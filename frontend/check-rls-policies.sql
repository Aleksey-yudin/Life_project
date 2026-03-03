-- Скрипт для проверки RLS политик
-- Выполните в Supabase SQL Editor

-- 1. Проверить, что таблицы существуют
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Проверить статус RLS
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('wallets', 'categories', 'transactions', 'habits', 'habit_entries', 'mood_log', 'todos')
ORDER BY tablename;

-- 3. Проверить существующие политики
SELECT
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('wallets', 'categories', 'transactions', 'habits', 'habit_entries', 'mood_log', 'todos')
ORDER BY tablename, policyname;

-- 4. Если политик нет, создайте их (выполните после миграции)
-- CREATE POLICY "Users can manage own wallets" on wallets
--   for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- (аналогично для остальных таблиц)
