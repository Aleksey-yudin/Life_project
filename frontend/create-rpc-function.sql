-- Создание RPC функции для обновления баланса кошелька
-- Выполнить этот скрипт в Supabase SQL Editor

create or replace function update_wallet_balance(
  wallet_id uuid,
  amount decimal
)
returns void as $$
begin
  update wallets 
  set balance = balance + amount,
      updated_at = timezone('utc'::text, now())
  where id = wallet_id;
end;
$$ language plpgsql;

-- Предоставление прав выполнения аутентифицированным пользователям
grant execute on function update_wallet_balance to authenticated;

-- Проверка, что функция создана
select 'Function created successfully' as status;
