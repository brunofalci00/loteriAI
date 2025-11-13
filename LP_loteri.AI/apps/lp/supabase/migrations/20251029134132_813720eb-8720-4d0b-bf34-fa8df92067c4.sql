-- Inserir pagamento de teste para desenvolvimento
INSERT INTO payments (
  user_id,
  hubla_transaction_id,
  amount,
  status,
  product_name,
  customer_email,
  customer_name
) VALUES (
  '9137fe26-5faa-4163-92fc-6d68de904b2a',
  'test_transaction_' || gen_random_uuid()::text,
  97.00,
  'active',
  'loter.AI - Acesso Vitalício (TESTE DE DESENVOLVIMENTO)',
  'brunofalci2000@gmail.com',
  'Bruno falci'
) ON CONFLICT (hubla_transaction_id) DO NOTHING;