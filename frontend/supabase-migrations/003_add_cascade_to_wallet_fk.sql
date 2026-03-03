-- =====================================================
-- ИНТЕГРО: Добавление ON DELETE CASCADE к foreign keys
-- Выполните этот скрипт ПОЛНОСТЬЮ в одном запросе в Supabase SQL Editor
-- =====================================================

-- 1. Для transactions.wallet_id
alter table transactions
drop constraint if exists transactions_wallet_id_fkey;

alter table transactions
add constraint transactions_wallet_id_fkey
  foreign key (wallet_id)
  references wallets(id)
  on delete cascade;

-- 2. Для transactions.category_id
alter table transactions
drop constraint if exists transactions_category_id_fkey;

alter table transactions
add constraint transactions_category_id_fkey
  foreign key (category_id)
  references categories(id)
  on delete cascade;

-- Проверка
select 'Foreign keys updated successfully with ON DELETE CASCADE' as status;
