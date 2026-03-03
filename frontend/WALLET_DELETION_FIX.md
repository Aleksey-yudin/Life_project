# Исправление ошибки удаления кошелька

## Проблема

При попытке удалить кошелёк возникала ошибка:
```
update or delete on table "wallets" violates foreign key constraint "transactions_wallet_id_fkey" on table "transactions"
```

Это происходит потому, что внешний ключ `transactions.wallet_id` ссылается на `wallets.id` без опции `ON DELETE CASCADE`, что запрещает удаление кошелька, если существуют связанные операции.

## Решение

### 1. Миграция базы данных

Файл: `frontend/supabase-migrations/003_add_cascade_to_wallet_fk.sql`

Этот скрипт добавляет `ON DELETE CASCADE` к двум внешним ключам:
- `transactions.wallet_id` → `wallets.id`
- `transactions.category_id` → `categories.id`

После применения миграции:
- При удалении кошелька все связанные операции автоматически удалятся
- При удалении категории все связанные операции автоматически удалятся

### 2. Обновление интерфейса

Изменены компоненты:
- [`WalletList.tsx`](frontend/src/app/(dashboard)/budget/components/WalletList.tsx:54) - подтверждение при удалении теперь включает информацию о каскадном удалении операций
- [`CategoryList.tsx`](frontend/src/app/(dashboard)/budget/components/CategoryList.tsx:57) - аналогичное обновление

## Инструкция по применению

### Шаг 1: Примените миграцию в Supabase

1. Откройте [Supabase Dashboard](https://app.supabase.com/)
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (в левом меню)
4. Нажмите **New Query**
5. Скопируйте содержимое файла `frontend/supabase-migrations/003_add_cascade_to_wallet_fk.sql`
6. Вставьте в SQL Editor
7. Нажмите **Run** (или Ctrl+Enter)
8. Убедитесь, что в результате появилось сообщение: `Foreign keys updated successfully with ON DELETE CASCADE`

### Шаг 2: Проверка работы

1. Запустите приложение: `cd frontend && npm run dev`
2. Войдите в систему
3. Перейдите в раздел **Бюджет**
4. Создайте тестовый кошелёк (если нет)
5. Добавьте несколько операций (транзакций) в этот кошелёк
6. Попробуйте удалить кошелёк:
   - Должно появиться подтверждение: "Удалить кошелёк? Все связанные операции также будут удалены."
   - После подтверждения кошелёк и все его операции должны удалиться без ошибок
7. Аналогично проверьте удаление категории с операциями

### Шаг 3: Очистка локального состояния

После применения миграции рекомендуется:
- Обновить страницу (F5) чтобы перезагрузить данные
- Проверить, что списки кошельков и категорий отображаются корректно

## Что изменилось

### До миграции
- Удаление кошелька с операциями → Ошибка foreign key constraint
- Удаление категории с операциями → Ошибка foreign key constraint

### После миграции
- Удаление кошелька → Кошелёк и все его операции удаляются каскадно
- Удаление категории → Категория и все её операции удаляются каскадно

## Примечания

- Миграция безопасна: она использует `drop constraint if exists` и не сломает существующие связи
- Все существующие данные сохранятся
- После применения миграции старые ограничения будут заменены на новые с `ON DELETE CASCADE`
- Это изменение соответствует best practices для подобных сценариев

## Дополнительно

Если понадобится откатить изменения, выполните:

```sql
-- Восстановить ограничения без CASCADE
alter table transactions 
drop constraint if exists transactions_wallet_id_fkey;

alter table transactions 
add constraint transactions_wallet_id_fkey 
  foreign key (wallet_id) 
  references wallets(id);

alter table transactions 
drop constraint if exists transactions_category_id_fkey;

alter table transactions 
add constraint transactions_category_id_fkey 
  foreign key (category_id) 
  references categories(id);
```
