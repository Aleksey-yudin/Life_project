# Настройка Supabase для проекта Integro

## Проблема
Ошибка `permission denied for schema public` при попытке выполнить операции с таблицами.

## Причины
1. Таблицы не созданы в базе данных
2. RLS (Row Level Security) включен, но политики не созданы или неверны
3. Пользователь не авторизован (не выполнен вход)

## Пошаговая настройка

### Шаг 1: Создание проекта в Supabase

1. Зайдите в [Supabase Dashboard](https://app.supabase.com/)
2. Создайте новый проект (или используйте существующий)
3. Дождитесь завершения создания проекта

### Шаг 2: Получение ключей

1. В проекте перейдите в **Settings** → **API**
2. Скопируйте:
   - **Project URL** (например, `https://xxxxx.supabase.co`)
   - **anon/public key** (начинается с `eyJ...` или `sb_publishable_...`)

3. Добавьте в `frontend/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Шаг 3: Включение Auth

1. Перейдите в **Authentication** → **Providers**
2. Включите **Email** provider
3. Настройте (опционально):
   - Disable email confirmations (для разработки)
   - Set secure email auth (по желанию)

### Шаг 4: Создание таблиц и RLS политик

#### Способ A: Выполнить миграцию (рекомендуется)

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте ВЕСЬ код из файла `frontend/supabase-migrations/002_clean_schema.sql`
3. Вставьте в SQL Editor
4. Нажмите **Run** (или Ctrl+Enter)
5. Дождитесь завершения (должно быть "Query returned successfully: X rows affected")

#### Способ B: Выполнить по частям

Если Способ A не работает, выполните отдельно:

```sql
-- 1. Создание таблиц (в правильном порядке)
create table if not exists wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  balance decimal default 0,
  initial_balance decimal default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  color text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ... и так далее для всех таблиц (см. полный файл миграции)
```

```sql
-- 2. Включение RLS
alter table wallets enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table habits enable row level security;
alter table habit_entries enable row level security;
alter table mood_log enable row level security;
alter table todos enable row level security;
```

```sql
-- 3. Создание политик RLS
create policy "Users can manage own wallets" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own habits" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own habit entries" on habit_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own mood logs" on mood_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own todos" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

### Шаг 5: Создание тестового пользователя

1. Перейдите в **Authentication** → **Users**
2. Нажмите **Create user**
3. Заполните:
   - Email: `test@example.com`
   - Password: `password123`
4. Нажмите **Create user**

### Шаг 6: Проверка настройки

1. Запустите диагностический скрипт:
```bash
cd frontend
node diagnose-db.js
```

2. Ожидаемый вывод:
```
=== Диагностика базы данных Supabase ===
1. Проверка аутентификации:
   ✓ Пользователь авторизован
   User ID: xxxxx-xxxxx-xxxxx
   Email: test@example.com

2. Проверка таблиц:
   ✓ wallets: таблица существует
   ✓ categories: таблица существует
   ✓ transactions: таблица существует
   ✓ habits: таблица существует
   ✓ habit_entries: таблица существует
   ✓ mood_log: таблица существует
   ✓ todos: таблица существует
```

### Шаг 7: Тестирование приложения

1. Запустите dev сервер:
```bash
cd frontend
npm run dev
```

2. Откройте http://localhost:3000
3. Войдите в систему (email: `test@example.com`, password: `password123`)
4. Попробуйте создать кошелёк, категорию, операцию
5. Должны появляться уведомления об успехе

## Проверка RLS политик

Чтобы убедиться, что политики созданы, выполните в SQL Editor:

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN (
  'wallets', 'categories', 'transactions',
  'habits', 'habit_entries', 'mood_log', 'todos'
)
ORDER BY tablename, policyname;
```

Должны возвращаться строки для каждой таблицы с политиками:
- `Users can manage own wallets`
- `Users can manage own categories`
- и т.д.

## Частые ошибки и решения

### Ошибка: "permission denied for schema public"
**Причина**: Таблицы не созданы или RLS политики не настроены
**Решение**: Выполните Шаг 4 полностью

### Ошибка: "new row violates row-level security policy"
**Причина**: Политика RLS не разрешает операцию (например, user_id не совпадает)
**Решение**: Проверьте, что в insert/update передаётся корректный `user_id` от авторизованного пользователя

### Ошибка: "User not authenticated"
**Причина**: Пользователь не вошёл в систему
**Решение**: Войдите через страницу `/login`

### Ошибка: "relation \"wallets\" does not exist"
**Причина**: Таблица не создана
**Решение**: Выполните миграцию (Шаг 4)

## Дополнительные настройки (опционально)

### Storage (для файлов/аватарок)
1. Перейдите в **Storage**
2. Создайте bucket (например, `avatars`)
3. Настройте политики доступа

### Включение расширений
Если нужны дополнительные функции (например, `uuid-ossp`), выполните:
```sql
create extension if not exists "uuid-ossp";
```

## Миграции в будущем

Для добавления новых таблиц/изменений:
1. Создайте новый файл миграции в `supabase-migrations/` (например, `003_add_new_feature.sql`)
2. Добавьте комментарий с описанием
3. Выполните через SQL Editor
4. Зафиксируйте изменения в git

## Поддержка

Если проблемы остаются:
1. Проверьте **Logs** в Supabase Dashboard (Database → Logs)
2. Проверьте **Network** вкладку браузера (DevTools)
3. Убедитесь, что все миграции выполнены без ошибок
4. Проверьте, что пользователь авторизован (сессия активна)
