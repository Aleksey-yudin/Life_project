# Integro - Personal Life Management

MVP веб-приложение для отслеживания финансов, привычек и задач.

## Технологический стек

- **Frontend**: Next.js 14 (App Router) + TypeScript + Material UI (MUI) + Recharts
- **State Management**: Zustand
- **Forms**: React Hook Form + Yup
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Icons**: Material Icons
- **Date utilities**: date-fns

## Структура проекта

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Неавторизованные маршруты
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/      # Защищённые маршруты
│   │   │   ├── layout.tsx    # Основной layout с навигацией
│   │   │   ├── page.tsx      # Дашборд
│   │   │   ├── dashboard/
│   │   │   ├── budget/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── WalletList.tsx
│   │   │   │       └── CategoryList.tsx
│   │   │   ├── habits/
│   │   │   │   └── page.tsx
│   │   │   ├── todo/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   └── supabase.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── types.ts
│   │   │   ├── store.ts
│   │   ├── budget/
│   │   │   ├── types.ts
│   │   │   └── store.ts
│   │   ├── habits/
│   │   │   ├── types.ts
│   │   │   └── store.ts
│   │   ├── todo/
│   │   │   ├── types.ts
│   │   │   └── store.ts
│   ├── types/
│   │   └── index.ts
│   └── hooks/
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Установка и запуск

### 1. Установка зависимостей

```bash
cd frontend
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в папке `frontend/`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com/)
2. Выполните SQL-скрипт для создания таблиц (см. раздел "База данных")
3. Включите Row-Level Security (RLS) для всех таблиц
4. Настройте политики RLS (см. раздел "RLS политики")
5. Включите Email Auth в Supabase Dashboard

### 4. Запуск разработки

```bash
cd frontend
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## База данных (Supabase)

### SQL для создания таблиц

```sql
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

### RLS политики

Для каждой таблицы включите RLS и создайте политики:

```sql
-- Включить RLS
alter table wallets enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table habits enable row level security;
alter table habit_entries enable row level security;
alter table mood_log enable row level security;
alter table todos enable row level security;

-- Политики (пример для wallets)
create policy "Users can manage own wallets" on wallets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Аналогичные политики для всех остальных таблиц
```

## Функциональность MVP

### ✅ Реализовано

- [x] Авторизация через Supabase Auth (email+password)
- [x] Защищённые маршруты
- [x] Дашборд с графиками и виджетами
- [x] Модуль финансов (кошельки, категории, операции)
- [x] Модуль привычек (календарь, отметки)
- [x] Модуль задач (календарь, приоритеты)
- [x] Адаптивный интерфейс (MUI)

### 🔄 В разработке

- [ ] Подзадачи (checklist)
- [ ] Календарь настроения
- [ ] Расширенные фильтры
- [ ] Экспорт/импорт данных
- [ ] Тёмная тема

## Лицензия

MIT