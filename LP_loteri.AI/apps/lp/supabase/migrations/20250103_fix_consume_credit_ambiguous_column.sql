-- =====================================================
-- Migration: Fix consume_credit ambiguous column error
-- Descrição: Corrige erro "credits_remaining is ambiguous"
-- Data: 2025-01-03
-- =====================================================

-- Drop função antiga
DROP FUNCTION IF EXISTS consume_credit(UUID);

-- Recriar função com fix
CREATE OR REPLACE FUNCTION consume_credit(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  credits_remaining INTEGER,
  message TEXT
) AS $$
DECLARE
  v_credits INTEGER;
  v_last_gen TIMESTAMPTZ;
  v_seconds_since_last NUMERIC;
BEGIN
  -- Verificar se usuário existe em user_credits, se não, criar
  IF NOT EXISTS (SELECT 1 FROM user_credits WHERE user_id = p_user_id) THEN
    INSERT INTO user_credits (user_id, credits_remaining, credits_total, last_reset_at)
    VALUES (p_user_id, 50, 50, NOW());
  END IF;

  -- Buscar créditos e última geração com alias explícito
  SELECT
    uc.credits_remaining,
    uc.last_generation_at
  INTO v_credits, v_last_gen
  FROM user_credits uc
  WHERE uc.user_id = p_user_id
  FOR UPDATE; -- Lock para evitar race condition

  -- Verificar cooldown (10 segundos)
  IF v_last_gen IS NOT NULL THEN
    v_seconds_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_gen));

    IF v_seconds_since_last < 10 THEN
      RETURN QUERY SELECT
        FALSE::BOOLEAN,
        v_credits::INTEGER,
        FORMAT('Aguarde %s segundos para gerar novamente', CEIL(10 - v_seconds_since_last)::TEXT)::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Verificar créditos disponíveis
  IF v_credits <= 0 THEN
    RETURN QUERY SELECT
      FALSE::BOOLEAN,
      0::INTEGER,
      'Você atingiu o limite de 50 gerações mensais. Seus créditos serão renovados no próximo ciclo.'::TEXT;
    RETURN;
  END IF;

  -- Consumir crédito (FIX: qualificar explicitamente a coluna)
  UPDATE user_credits uc
  SET
    credits_remaining = uc.credits_remaining - 1,
    last_generation_at = NOW()
  WHERE uc.user_id = p_user_id;

  -- Retornar sucesso
  RETURN QUERY SELECT
    TRUE::BOOLEAN,
    (v_credits - 1)::INTEGER,
    'Crédito consumido com sucesso'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
