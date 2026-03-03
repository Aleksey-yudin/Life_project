# Исправление RLS политик - Пошаговая инструкция

## Проблема
После входа в систему все GET/POST запросы к таблицам возвращают:
```
403 (Forbidden)
permission denied for schema public
```

## Причина
RLS (Row Level Security) политики не настроены правильно или отсутствуют.

## Решение

### Шаг 1: Проверьте RLS статус для КАЖДОЙ таблицы

В Supabase Dashboard:
1. **Database → Tables**
2. Откройте каждую таблицу по порядку:
   - `wallets`
   - `categories`
   - `transactions`
   - `habits`
   - `habit_entries`
   - `mood_log`
   - `todos`

3. Для каждой таблицы проверьте:
   - ✅ **Row Level Security** должен быть **Enabled** (включён)
   - Если выключен - включите (переключатель)

### Шаг 2: Проверьте существование политик

Для каждой таблицы:
1. Откройте таблицу
2. Перейдите во вкладку **Policies**
3. Должна быть политика с именем:
   - `wallets`: "Users can manage own wallets"
   - `categories`: "Users can manage own categories"
   - `transactions`: "Users can manage own transactions"
   - `habits`: "Users can manage own habits"
   - `habit_entries`: "Users can manage own habit entries"
   - `mood_log`: "Users can manage own mood logs"
   - `todos`: "Users can manage own todos"

4. Если политики **нет** - создайте её (см. Шаг 3)

### Шаг 3: Создайте/Обновите политики

#### Вариант A: Выполнить всю миграцию заново (самый простой)

1. Откройте **SQL Editor**
2. Скопируйте ВЕСЬ код из `frontend/supabase-migrations/002_clean_schema.sql`
3. Вставьте в SQL Editor
4. Нажмите **Run** (Ctrl+Enter)

⚠️ **ВНИМАНИЕ**: Это удалит все данные! Если нужно сохранить данные, используйте Вариант B.

#### Вариант B: Только создать политики (без удаления данных)

Выполните в SQL Editor по одной для каждой таблицы:

```sql
-- Wallets
CREATE POLICY "Users can manage own wallets" ON wallets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habits
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit Entries (ИСПРАВЛЕННАЯ ВЕРСИЯ - через связанную habit)
CREATE POLICY "Users can manage own habit entries" ON habit_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_entries.habit_id
      AND habits.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_entries.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Mood Log
CREATE POLICY "Users can manage own mood logs" ON mood_log
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Todos
CREATE POLICY "Users can manage own todos" ON todos
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

### Шаг 4: Проверьте, что RLS включён

Если политики созданы, но RLS выключен, выполните:

```sql
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

### Шаг 5: Проверьте, что пользователь авторизован

1. В браузере откройте DevTools (F12)
2. Console:
```javascript
// Проверьте сессию
localStorage.getItem('sb-zwfklojxdghhbeaqcyww-auth-token')
```
Должна возвращаться строка (токен). Если `null` - вы не авторизованы.

3. Перезайдите в систему:
   - Выйдите (если вошли)
   - Войдите заново
   - Убедитесь, что видите дашборд

### Шаг 6: Протестируйте

1. Откройте приложение: http://localhost:3000
2. Войдите в систему
3. Перейдите в **Бюджет → Кошельки**
4. Нажмите "Добавить"
5. Заполните название и баланс
6. Нажмите "Сохранить"

**Ожидаемый результат**:
- ✅ Кошелёк добавляется
- ✅ Появляется зелёное уведомление "Кошелёк успешно добавлен"
- ✅ Диалог закрывается
- ✅ Кошелёк появляется в списке

Если всё ещё 403:
1. Откройте **Network** вкладку DevTools
2. Фильтруйте по "wallets"
3. Нажмите "Сохранить"
4. Посмотрите заголовки запроса:
   - `Authorization: Bearer <token>` - должен присутствовать
   - Статус: 200 (не 403)

### Шаг 7: Проверка через SQL

Выполните в SQL Editor, чтобы увидеть все политики:

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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Должны быть строки для всех 7 таблиц.

---

## Частые ошибки

### "permission denied for schema public" при GET
**Причина**: RLS включён, но политика не разрешает SELECT для анонимных/неавторизованных пользователей.
**Решение**: Политика `FOR ALL USING` должна разрешать чтение, если `auth.uid() = user_id`. Убедитесь, что `user_id` в записи совпадает с ID авторизованного пользователя.

### "permission denied for schema public" при POST/INSERT
**Причина**: Политика не разрешает INSERT, или `user_id` не передаётся в запросе.
**Решение**: Проверьте, что в коде при вставке передаётся `user_id` от авторизованного пользователя.

### "relation does not exist"
**Причина**: Таблица не создана.
**Решение**: Выполните миграцию полностью.

---

## Что проверить в коде

В файле `store.ts` (например, `budget/store.ts`) убедитесь, что:

```typescript
addWallet: async (user_id, data) => {
  const { error } = await supabase
    .from('wallets')
    .insert([{ ...data, user_id }])  // ← user_id ДОЛЖЕН передаваться
  // ...
}
```

`user_id` берётся из `useAuthStore()`:
```typescript
const { user } = useAuthStore()
await addWallet(user.id, { name, initial_balance: balance })
```

---

## Если ничего не помогает

1. **Удалите все таблицы** и начните с чистого листа:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

2. **Выполните миграцию заново** (Вариант A)

3. **Создайте пользователя** в Supabase Auth

4. **Войдите** и протестируйте

---

## Краткая диагностика

Запустите в SQL Editor:

```sql
-- Таблицы
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- RLS статус
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Политики
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

---

**После исправления RLS все операции должны работать!**
