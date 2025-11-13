-- =====================================================
-- FIX: Corrigir saved_games_stats view
-- Problema: COUNT(*) dentro de jsonb_object_agg (agregação aninhada)
-- Solução: Usar CTE (Common Table Expression)
-- =====================================================

-- 1. Dropar a view existente (se foi criada com erro)
DROP MATERIALIZED VIEW IF EXISTS saved_games_stats CASCADE;

-- 2. Criar view corrigida com CTE
CREATE MATERIALIZED VIEW saved_games_stats AS
WITH lottery_counts AS (
  -- Subconsulta: agregar contagem por user_id + lottery_type
  SELECT
    user_id,
    lottery_type,
    COUNT(*) as count
  FROM saved_games
  GROUP BY user_id, lottery_type
)
SELECT
  sg.user_id,
  COUNT(*) as total_saved,
  COUNT(*) FILTER (WHERE sg.source = 'ai_generated') as ai_generated_count,
  COUNT(*) FILTER (WHERE sg.source = 'manual_created') as manual_created_count,
  COALESCE(SUM(sg.play_count), 0) as total_plays,
  MAX(sg.saved_at) as last_saved_at,
  -- Subquery escalar: retorna o jsonb_object_agg já calculado
  (
    SELECT jsonb_object_agg(lc.lottery_type, lc.count)
    FROM lottery_counts lc
    WHERE lc.user_id = sg.user_id
  ) as games_by_lottery
FROM saved_games sg
GROUP BY sg.user_id;

-- 3. Criar índice único
CREATE UNIQUE INDEX idx_saved_games_stats_user_id ON saved_games_stats(user_id);

-- 4. Comentário
COMMENT ON MATERIALIZED VIEW saved_games_stats IS 'Estatísticas agregadas de jogos salvos por usuário (atualizada via triggers)';

-- =====================================================
-- FIM DO FIX
-- =====================================================
