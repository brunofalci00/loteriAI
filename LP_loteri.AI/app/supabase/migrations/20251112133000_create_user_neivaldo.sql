-- Criar usuário Neivalidação com compra manual
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  is_sso_user
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'neivaldoconceicao@bol.com.br',
  crypt('Nev123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Neivalidação","created_via":"manual_insertion"}',
  false,
  now(),
  now(),
  false
)
ON CONFLICT (email) DO NOTHING;

-- Registrar pagamento associado ao usuário
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'neivaldoconceicao@bol.com.br'
)
INSERT INTO public.payments (
  user_id,
  hubla_transaction_id,
  hubla_invoice_id,
  amount,
  status,
  product_name,
  payment_method,
  customer_name,
  customer_email,
  processed_at,
  created_at
)
SELECT
  user_data.id,
  'manual_insert_' || gen_random_uuid()::text,
  'manual_insert_' || gen_random_uuid()::text,
  3700,
  'active',
  'loter.AI - Acesso Vitalício',
  'unknown',
  'Neivalidação',
  'neivaldoconceicao@bol.com.br',
  now(),
  now()
FROM user_data
ON CONFLICT (hubla_transaction_id) DO NOTHING;
