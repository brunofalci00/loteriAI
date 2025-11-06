-- =====================================================
-- SCRIPT SIMPLIFICADO: Adicionar 50 Créditos (UPSERT)
-- Data: 2025-01-03
-- Usa ON CONFLICT para fazer INSERT ou UPDATE automaticamente
-- =====================================================

-- UPSERT: Insere novos ou atualiza existentes em uma única query
INSERT INTO user_credits (user_id, credits_remaining, credits_total, last_reset_at)
SELECT
  id,
  50,
  50,
  NOW()
FROM profiles
ON CONFLICT (user_id)
DO UPDATE SET
  credits_remaining = 50,
  credits_total = 50,
  last_reset_at = NOW();

-- Verificar resultado
SELECT
  COUNT(*) as total_usuarios_com_creditos,
  SUM(CASE WHEN credits_remaining = 50 THEN 1 ELSE 0 END) as usuarios_com_50_creditos
FROM user_credits;

-- =====================================================
-- RESULTADO ESPERADO:
-- total_usuarios_com_creditos = X (todos os usuários)
-- usuarios_com_50_creditos = X (todos com 50 créditos)
-- =====================================================
