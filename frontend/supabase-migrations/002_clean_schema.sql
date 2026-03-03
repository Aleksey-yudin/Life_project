-- =====================================================
-- ИНТЕГРО: Полная пересоздание схемы
-- ВЫПОЛНИТЕ ВЕСЬ ЭТОТ СКРИПТ ОДНИМ ЗАПРОСОМ
-- =====================================================

-- 1. Полная очистка
drop table if exists todos cascade;
drop table if exists mood_log cascade;
drop table if exists habit_entries cascade;
drop table if exists habits cascade;
drop table if exists transactions cascade;
drop table if exists categories cascade;
drop table if exists wallets cascade;

-- 2. Создание таблиц в правильном порядке (сначала без зависимостей)

-- Wallets
create table wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  balance decimal default 0,
  initial_balance decimal default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text check (type in ('income', 'expense')) not null,
  color text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habits
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Todos (не зависит от других таблиц кроме auth.users)
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

-- Mood Log
create table mood_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  mood text check (mood in ('great', 'good', 'stress', 'bad')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

-- Habit Entries (зависит от habits)
create table habit_entries (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  status text check (status in ('completed', 'partial', 'missed')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(habit_id, date)
);

-- Transactions (зависит от wallets и categories)
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

-- 3. Индексы
create index idx_wallets_user_id on wallets(user_id);
create index idx_categories_user_id on categories(user_id);
create index idx_transactions_user_id on transactions(user_id);
create index idx_transactions_wallet_id on transactions(wallet_id);
create index idx_transactions_category_id on transactions(category_id);
create index idx_transactions_date on transactions(date);
create index idx_habits_user_id on habits(user_id);
create index idx_habit_entries_habit_id on habit_entries(habit_id);
create index idx_habit_entries_date on habit_entries(date);
create index idx_mood_log_user_id on mood_log(user_id);
create index idx_mood_log_date on mood_log(date);
create index idx_todos_user_id on todos(user_id);
create index idx_todos_due_date on todos(due_date);
create index idx_todos_status on todos(status);
create index idx_todos_parent_id on todos(parent_id);

-- 4. Включение RLS ТОЛЬКО после создания всех таблиц
alter table wallets enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table habits enable row level security;
alter table habit_entries enable row level security;
alter table mood_log enable row level security;
alter table todos enable row level security;

-- 5. Политики RLS
create policy "Users can manage own wallets" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own habits" on habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own habit entries" on habit_entries
  for all using (
    exists (
      select 1 from habits
      where habits.id = habit_entries.habit_id
      and habits.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from habits
      where habits.id = habit_entries.habit_id
      and habits.user_id = auth.uid()
    )
  );

create policy "Users can manage own mood logs" on mood_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own todos" on todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. Триггеры для updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_wallets_updated_at before update on wallets
  for each row execute function update_updated_at_column();

create trigger update_transactions_updated_at before update on transactions
  for each row execute function update_updated_at_column();

create trigger update_todos_updated_at before update on todos
  for each row execute function update_updated_at_column();

-- =====================================================
-- МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО
-- =====================================================