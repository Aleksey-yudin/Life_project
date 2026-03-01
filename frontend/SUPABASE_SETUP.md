# Настройка Supabase для проекта Integro

## 1. Создание проекта

1. Зайдите в [Supabase Dashboard](https://app.supabase.com/)
2. Создайте новый проект
3. Получите URL и anon/anon ключ
4. Добавьте в `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Включение Auth

1. В Supabase Dashboard перейдите в **Authentication** → **Providers**
2. Включите **Email** provider
3. Настройте настройки по желанию (подтверждение email и т.д.)

## 3. Создание таблиц

Выполните следующий SQL в Supabase SQL Editor:

```sql
-- Включение расширений
create extension if not exists "uuid-ossp";

-- Wallets (кошельки)
create table wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  balance decimal default 0,
  initial_balance decimal default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories (категории)
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  color text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Transactions (операции)
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  wallet_id uuid references wallets(id) not null,
  category_id uuid references categories(id) not null,
  amount decimal not null,
  type text check (type in ('income', 'expense')) not null,
  date date not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habits (привычки)
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habit entries (отметки по привычкам)
create table habit_entries (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  status text check (status in ('completed', 'partial', 'missed')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date)
);

-- Mood log (календарь настроения)
create table mood_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  mood text check (mood in ('great', 'good', 'stress', 'bad')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Todos (задачи)
create table todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  due_date date,
  start_date date,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text check (status in ('pending', 'in_progress', 'completed', 'archived')) default 'pending',
  parent_id uuid references todos(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 4. Настройка Row-Level Security (RLS)

Для каждой таблицы выполните:

```sql
-- Включить RLS
alter table wallets enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table habits enable row level security;
alter table habit_entries enable row level security;
alter table mood_log enable row level security;
alter table todos enable row level security;

-- Политики для wallets
create policy "Users can manage own wallets" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Политики для categories
create policy "Users can manage own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Политики для transactions
create policy "Users can manage own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Политики для habits
create policy "Users can manage own habits" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Политики для habit_entries
create policy "Users can manage own habit entries" on habit_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Политики для mood_log
create policy "Users can manage own mood logs" on mood_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Политики для todos
create policy "Users can manage own todos" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 5. Тестовый пользователь

1. В Supabase Dashboard перейдите в **Authentication** → **Users**
2. Создайте тестового пользователя вручную или через приложение
3. Используйте email/password для входа

## 6. Проверка

После настройки:
- Запустите приложение: `npm run dev`
- Перейдите на `http://localhost:3000/login`
- Войдите с тестовым пользователем
- Проверьте, что все страницы загружают данные

## 7. Возможные проблемы

### Ошибки RLS
- Проверьте, что RLS включен для всех таблиц
- Проверьте, что политики созданы правильно
- Убедитесь, что `user_id` в записях соответствует `auth.uid()`

### Ошибки подключения
- Проверьте переменные окружения в `.env.local`
- Убедитесь, что проект в Supabase активен
- Проверьте CORS настройки (должны разрешать localhost:3000)

### Ошибки типов
- Убедитесь, что все зависимости установлены
- Проверьте, что TypeScript конфигурация правильная