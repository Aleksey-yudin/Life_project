# Архитектурный план MVP проекта Integro

## 1. Общая архитектура

### Технологический стек
- **Frontend**: Next.js 14 (App Router) + TypeScript + Material UI (MUI) + Recharts
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions при необходимости)
- **State Management**: Zustand (легковесный, подходит для MVP)
- **Forms**: React Hook Form + Yup валидация
- **Icons**: Material Icons

### Структура проекта
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Группа неавторизованных маршрутов
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/       # Группа защищённых маршрутов
│   │   │   ├── layout.tsx     # Основной layout с навигацией
│   │   │   ├── page.tsx       # Дашборд
│   │   │   ├── budget/
│   │   │   ├── habits/
│   │   │   └── todo/
│   │   └── layout.tsx         # Корневой layout
│   ├── components/            # Переиспользуемые UI компоненты
│   │   ├── common/           # Кнопки, карточки, формы
│   │   ├── layout/           # Sidebar, AppBar, Navigation
│   │   ├── charts/           # Графики на Recharts
│   │   └── calendar/         # Календарные компоненты
│   ├── modules/              # Бизнес-логика по доменам
│   │   ├── auth/             # Аутентификация, сессии
│   │   ├── budget/           # Финансы (кошельки, категории, операции)
│   │   ├── habits/           # Привычки, календарь привычек, настроение
│   │   ├── todo/             # Задачи, календарь задач
│   │   └── shared/           # Общие утилиты, типы
│   ├── hooks/                # Кастомные хуки
│   ├── utils/                # Вспомогательные функции
│   ├── types/                # TypeScript типы и интерфейсы
│   └── lib/                  # Конфигурации (supabase, mui theme)
├── .env.local                # Переменные окружения (Supabase keys)
├── next.config.js
├── tsconfig.json
└── package.json
```

## 2. Supabase схема данных

### Таблицы

#### `users`
```sql
id: uuid (primary key, references auth.users)
email: text
created_at: timestamp
updated_at: timestamp
```

#### `wallets` (кошельки)
```sql
id: uuid (primary key)
user_id: uuid (foreign key, RLS)
name: text
balance: decimal
initial_balance: decimal
created_at: timestamp
updated_at: timestamp
```

#### `categories` (категории)
```sql
id: uuid (primary key)
user_id: uuid (foreign key, RLS)
name: text
type: 'income' | 'expense'
color: text (hex)
icon: text
created_at: timestamp
```

#### `transactions` (операции)
```sql
id: uuid (primary key)
user_id: uuid (foreign key, RLS)
wallet_id: uuid (foreign key)
category_id: uuid (foreign key)
amount: decimal
type: 'income' | 'expense'
date: date
description: text (nullable)
created_at: timestamp
updated_at: timestamp
```

#### `habits` (привычки)
```sql
id: uuid (primary key)
user_id: uuid (foreign key, RLS)
name: text
color: text (hex)
icon: text
created_at: timestamp
```

#### `habit_entries` (отметки по привычкам)
```sql
id: uuid (primary key)
habit_id: uuid (foreign key)
date: date
status: 'completed' | 'partial' | 'missed'
notes: text (nullable)
created_at: timestamp
```

#### `mood_log` (календарь настроения)
```sql
id: uuid (primary key)
user_id: uuid (foreign key, RLS)
date: date
mood: 'great' | 'good' | 'stress' | 'bad'
notes: text (nullable)
created_at: timestamp
```

#### `todos` (задачи)
```sql
id: uuid (primary key)
user_id: uuid (foreign key, RLS)
title: text
description: text (nullable)
due_date: date (nullable)
start_date: date (nullable)
priority: 'low' | 'medium' | 'high' | 'urgent'
status: 'pending' | 'in_progress' | 'completed' | 'archived'
parent_id: uuid (self-reference, для подзадач)
created_at: timestamp
updated_at: timestamp
```

### Row-Level Security (RLS)
Для всех таблиц включить RLS и создать политики:
- `SELECT`: user_id = auth.uid()
- `INSERT`: user_id = auth.uid()
- `UPDATE`: user_id = auth.uid()
- `DELETE`: user_id = auth.uid()

## 3. Этапы реализации

### Этап 1: Базовая настройка (день 1)
1. Создать Next.js проект в `frontend/` с TypeScript
2. Установить зависимости: `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/icons-material`, `@supabase/supabase-js`, `zustand`, `react-hook-form`, `yup`, `recharts`, `date-fns`
3. Настроить базовую структуру папок (см. выше)
4. Создать конфигурацию Supabase клиента в `lib/supabase.ts`
5. Настроить MUI тему (светлая, шрифт Inter)
6. Создать базовый layout с навигацией (Sidebar)

### Этап 2: Supabase и аутентификация (день 1-2)
1. Создать проект в Supabase (если не создан)
2. Вручную создать таблицы через SQL Editor (или использовать миграции)
3. Включить RLS и настроить политики
4. Настроить Supabase Auth (email+password)
5. Реализовать страницу `/login` с формой входа
6. Создать Protected Route HOC/компонент
7. Реализовать logout и управление сессией

### Этап 3: Дашборд (день 2)
1. Создать страницу `/dashboard`
2. Подключить данные из Supabase:
   - График ежемесячных трат (transactions за текущий год)
   - Топ 3 категории по тратам за последний месяц
   - Сумма по всем кошелькам
   - Задачи на сегодня (todos с due_date = сегодня)
   - Напоминания о привычках (habit_entries за сегодня без отметки)
3. Использовать Recharts для визуализации
4. Стилизовать под MUI (Card, Grid, Typography)

### Этап 4: Модуль финансов (день 3-4)
1. Страница `/budget` с двумя подразделами:
   - **Аналитика**: сводка по месяцам, графики по категориям
   - **Управление**: CRUD для категорий, кошельков, операций
2. Форма добавления операции (выбор кошелька, категории, даты, суммы)
3. История операций с фильтрацией (по дате, категории, кошельку)
4. Редактирование остатков кошельков (ручной ввод)
5. Автоматическое обновление баланса кошелька при добавлении операции

### Этап 5: Модуль привычек (день 5-6)
1. Страница `/habits`:
   - Список привычек (CRUD)
   - Календарь текущего месяца для каждой привычки
   - Отметки: выполнено/частично/пропущено
2. Календарь настроения (mood_log) с выбором состояния и комментарием
3. Статистика: процент выполнения, streak (серия), графики прогресса
4. Архив прошлых месяцев (просмотр habit_entries по месяцам)
5. Напоминания на дашборде (привычки без отметки сегодня)

### Этап 6: Модуль задач (день 7-8)
1. Страница `/todo`:
   - Интерактивный календарь (день/неделя/месяц) с задачами
   - Список задач на сегодня
2. CRUD задач с полями: заголовок, описание, дата/диапазон, приоритет, статус
3. Подзадачи (рекурсивная структура, checklist)
4. Группировка и сортировка (по приоритету, дате, статусу)
5. Фильтрация и поиск

### Этап 7: Адаптивность и финальные штрихи (день 9)
1. Адаптивная верстка всех страниц (MUI Grid, Breakpoints)
2. Поддержка мобильных устройств (Sidebar → Drawer на мобильных)
3. Добавить loading/success/error состояния для всех сетевых запросов
4. Обработка ошибок Supabase (показать уведомления)
5. Оптимизация производительности (мемоизация, lazy loading)

### Этап 8: Тестирование (день 10)
1. Проверить все CRUD операции
2. Протестировать аутентификацию и RLS
3. Проверить синхронизацию данных в реальном времени
4. Убедиться, что все виджеты дашборда отображают актуальные данные
5. Тестирование на мобильных устройствах

## 4. Дополнительные рекомендации

### TypeScript типы
Создать централизованные типы в `src/types/`:
- `user.ts`, `wallet.ts`, `category.ts`, `transaction.ts`
- `habit.ts`, `habit-entry.ts`, `mood.ts`
- `todo.ts`

### Zustand stores
- `useAuthStore`: управление сессией, пользователем
- `useWalletStore`: кошельки, балансы
- `useCategoryStore`: категории
- `useTransactionStore`: операции, фильтры
- `useHabitStore`: привычки, отметки
- `useTodoStore`: задачи, календарь

### Supabase клиент
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://zwfklojxdghhbeaqcyww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_j5pG83lhPvtFTPHTnhPBZA_v2InaKQn
```

### ESLint + Prettier
Настроить конфиги для React + TypeScript + MUI.

## 5. Риски и mitigation

| Риск | Mitigation |
|------|------------|
| Сложности с RLS политиками | Тестировать каждую политику отдельно, использовать Supabase SQL Editor для отладки |
| Производительность графиков | Использовать мемоизацию (useMemo), пагинацию для больших списков |
| Синхронизация состояния | Централизованные stores + реактивные запросы Supabase (realtime опционально) |
| Адаптивность | Мобильный-first подход, тестирование на реальных устройствах |

## 6. Критерии успеха MVP

- [ ] Пользователь может войти по email+password
- [ ] Дашборд отображает актуальные данные из всех модулей
- [ ] Все CRUD операции работают (финансы, привычки, задачи)
- [ ] Данные сохраняются в Supabase и изолируются через RLS
- [ ] Интерфейс адаптивен и работает на мобильных
- [ ] Нет критических багов в основных сценариях

---

**Готов приступить к реализации. Ожидаю вашего одобрения плана.**