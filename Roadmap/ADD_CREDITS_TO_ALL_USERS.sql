-- =====================================================
-- SCRIPT: Adicionar 50 Créditos para Todos os Usuários
-- Data: 2025-01-03
-- Descrição: Insere ou atualiza créditos para todos os usuários existentes
-- =====================================================

-- Passo 1: Inserir créditos para usuários que ainda não têm registro
-- (Usa INSERT ... ON CONFLICT DO NOTHING para evitar erros)
INSERT INTO user_credits (user_id, credits_remaining, credits_total, last_reset_at)
SELECT
  id as user_id,
  50 as credits_remaining,
  50 as credits_total,
  NOW() as last_reset_at
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM user_credits WHERE user_credits.user_id = profiles.id
);

-- Passo 2: Atualizar créditos para usuários que já têm registro
-- (Define credits_remaining = 50 e credits_total = 50)
UPDATE user_credits
SET
  credits_remaining = 50,
  credits_total = 50,
  last_reset_at = NOW()
WHERE user_id IN (SELECT id FROM profiles);

-- Passo 3: Verificar resultado (opcional - apenas para conferir)
SELECT
  COUNT(*) as total_usuarios,
  AVG(credits_remaining) as media_creditos,
  MIN(credits_remaining) as minimo_creditos,
  MAX(credits_remaining) as maximo_creditos
FROM user_credits;

-- Passo 4: Ver detalhes de todos os usuários (opcional)
SELECT
  uc.user_id,
  p.email,
  uc.credits_remaining,
  uc.credits_total,
  uc.last_reset_at
FROM user_credits uc
JOIN profiles p ON p.id = uc.user_id
ORDER BY p.email;

-- =====================================================
-- RESULTADO ESPERADO:
-- - Todos os usuários terão 50 créditos
-- - credits_remaining = 50
-- - credits_total = 50
-- - last_reset_at = NOW()
-- =====================================================
