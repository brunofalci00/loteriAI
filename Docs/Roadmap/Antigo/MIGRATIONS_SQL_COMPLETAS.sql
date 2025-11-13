-- =====================================================
-- MIGRATIONS CONSOLIDADAS - FASES 1, 2 e 3
-- Projeto: LOTER.IA - Sistema de Análise de Loterias
-- Data: 2025-01-03 | Atualizado: 2025-01-04
-- Responsável: Claude Code
--
-- IMPORTANTE: Executar estas migrations sequencialmente
-- em ambiente de desenvolvimento ANTES de produção
--
-- CHANGELOG:
-- 2025-01-04: Fix SQL ambiguous column em consume_credit()
--             Atualizado reset_monthly_credits() para retornar INTEGER
--             Adicionado IF NOT EXISTS em todos os CREATE INDEX
--             Adicionado DROP FUNCTION IF EXISTS CASCADE em todas as funções
-- =====================================================

-- =====================================================
-- FASE 1: SISTEMA DE REGENERAÇÃO
-- Estimativa: 42 horas
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 1.1 TABELA: generation_history
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Identificadores da geração
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,
  strategy_type TEXT NOT NULL DEFAULT 'balanced',

  -- Dados da geração
  generated_numbers JSONB NOT NULL,
  hot_numbers INTEGER[] NOT NULL,
  cold_numbers INTEGER[] NOT NULL,

  -- Metadados da análise
  accuracy_rate NUMERIC(5,2) NOT NULL,
  draws_analyzed INTEGER NOT NULL,

  -- Controle de estado
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT FALSE NOT NULL,

  -- Constraints
  CONSTRAINT check_valid_lottery_type CHECK (lottery_type IN ('lotofacil', 'lotomania')),
  CONSTRAINT check_valid_strategy CHECK (strategy_type IN ('balanced', 'hot_focused', 'cold_focused')),
  CONSTRAINT check_accuracy_rate CHECK (accuracy_rate >= 0 AND accuracy_rate <= 100),
  CONSTRAINT check_draws_analyzed CHECK (draws_analyzed > 0)
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_lottery_type ON generation_history(lottery_type);
CREATE INDEX IF NOT EXISTS idx_generation_history_contest_number ON generation_history(contest_number);
CREATE INDEX IF NOT EXISTS idx_generation_history_generated_at ON generation_history(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_is_active ON generation_history(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_generation_history_user_lottery_contest ON generation_history(user_id, lottery_type, contest_number);

-- Comentários para documentação
COMMENT ON TABLE generation_history IS 'Histórico completo de gerações de jogos (todas as regenerações)';
COMMENT ON COLUMN generation_history.is_active IS 'TRUE = geração ativa atual, FALSE = histórico';
COMMENT ON COLUMN generation_history.generated_numbers IS 'JSONB com arrays de combinações geradas';

-- ─────────────────────────────────────────────────────
-- 1.2 TABELA: user_credits
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Créditos
  credits_remaining INTEGER DEFAULT 50 NOT NULL,
  credits_total INTEGER DEFAULT 50 NOT NULL,

  -- Controle de reset e cooldown
  last_reset_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_generation_at TIMESTAMPTZ,

  -- Constraints
  CHECK (credits_remaining >= 0),
  CHECK (credits_remaining <= credits_total),
  CHECK (credits_total > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_credits_last_reset ON user_credits(last_reset_at);
CREATE INDEX IF NOT EXISTS idx_user_credits_last_generation ON user_credits(last_generation_at);

-- Comentários
COMMENT ON TABLE user_credits IS 'Controle de créditos mensais para gerações (50 créditos/mês)';
COMMENT ON COLUMN user_credits.last_generation_at IS 'Timestamp da última geração (para cooldown de 10s)';

-- ─────────────────────────────────────────────────────
-- 1.3 FUNÇÃO: consume_credit
-- ─────────────────────────────────────────────────────

-- Drop função antiga (se existir)
DROP FUNCTION IF EXISTS consume_credit(UUID);

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

  -- Buscar créditos e última geração
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
        FALSE,
        v_credits,
        FORMAT('Aguarde %s segundos para gerar novamente', CEIL(10 - v_seconds_since_last)::TEXT);
      RETURN;
    END IF;
  END IF;

  -- Verificar créditos disponíveis
  IF v_credits <= 0 THEN
    RETURN QUERY SELECT
      FALSE,
      0,
      'Você atingiu o limite de 50 gerações mensais. Seus créditos serão renovados no próximo ciclo.'::TEXT;
    RETURN;
  END IF;

  -- Consumir crédito (com qualificação de tabela para evitar ambiguidade)
  UPDATE user_credits uc
  SET
    credits_remaining = uc.credits_remaining - 1,
    last_generation_at = NOW()
  WHERE uc.user_id = p_user_id;

  -- Retornar sucesso (com type casting explícito)
  RETURN QUERY SELECT
    TRUE::BOOLEAN,
    (v_credits - 1)::INTEGER,
    'Crédito consumido com sucesso'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION consume_credit IS 'Consome 1 crédito do usuário após validar cooldown de 10s e disponibilidade';

-- ─────────────────────────────────────────────────────
-- 1.4 FUNÇÃO: reset_monthly_credits
-- ─────────────────────────────────────────────────────

-- Drop função antiga (mudança de retorno: void -> INTEGER)
DROP FUNCTION IF EXISTS public.reset_monthly_credits();

CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  v_reset_count INTEGER;
BEGIN
  -- Resetar créditos de TODOS os usuários (execução mensal)
  UPDATE public.user_credits
  SET
    credits_remaining = 50,
    credits_total = 50,
    last_reset_at = NOW();

  GET DIAGNOSTICS v_reset_count = ROW_COUNT;

  RAISE NOTICE 'Reset mensal executado: % usuários atualizados', v_reset_count;

  RETURN v_reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION reset_monthly_credits IS 'Reseta créditos mensais (executar via Supabase Edge Function ou cron)';

-- ─────────────────────────────────────────────────────
-- 1.5 TRIGGER: cleanup_old_generations
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS cleanup_old_generations() CASCADE;

CREATE OR REPLACE FUNCTION cleanup_old_generations()
RETURNS TRIGGER AS $$
BEGIN
  -- Deletar gerações inativas com mais de 3 meses
  DELETE FROM generation_history
  WHERE is_active = FALSE
    AND generated_at < NOW() - INTERVAL '3 months';

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_old_generations
AFTER INSERT ON generation_history
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_generations();

-- Comentário
COMMENT ON FUNCTION cleanup_old_generations IS 'Remove gerações inativas com mais de 3 meses automaticamente';

-- ─────────────────────────────────────────────────────
-- 1.6 ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────

-- Habilitar RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Políticas para generation_history
CREATE POLICY "Users can view own generation history"
  ON generation_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON generation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON generation_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON generation_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para user_credits
CREATE POLICY "Users can view own credits"
  ON user_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FASE 2: SISTEMA DE SALVAMENTO DE JOGOS
-- Estimativa: 44 horas
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 2.1 TABELA: saved_games
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saved_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generation_history(id) ON DELETE SET NULL,

  -- Dados obrigatórios do jogo
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,
  numbers INTEGER[] NOT NULL,

  -- Análise da IA (snapshot)
  analysis_result JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ai_generated', 'manual_created')),
  strategy_type TEXT,

  -- Metadados do salvamento
  name TEXT,
  play_count INTEGER DEFAULT 0 NOT NULL,
  last_played_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT unique_saved_game UNIQUE(user_id, lottery_type, contest_number, numbers),
  CONSTRAINT check_numbers_not_empty CHECK (array_length(numbers, 1) > 0),
  CONSTRAINT check_name_length CHECK (name IS NULL OR char_length(name) <= 50),
  CONSTRAINT check_valid_source CHECK (source IN ('ai_generated', 'manual_created')),
  CONSTRAINT check_valid_lottery_saved CHECK (lottery_type IN ('lotofacil', 'lotomania'))
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_saved_games_user_id ON saved_games(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_games_lottery_type ON saved_games(lottery_type);
CREATE INDEX IF NOT EXISTS idx_saved_games_contest_number ON saved_games(contest_number);
CREATE INDEX IF NOT EXISTS idx_saved_games_saved_at ON saved_games(saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_games_source ON saved_games(source);
CREATE INDEX IF NOT EXISTS idx_saved_games_generation_id ON saved_games(generation_id) WHERE generation_id IS NOT NULL;

-- Comentários
COMMENT ON TABLE saved_games IS 'Jogos salvos pelos usuários (gerados por IA ou criados manualmente)';
COMMENT ON COLUMN saved_games.generation_id IS 'FK para generation_history (NULL se criado manualmente na Fase 3)';
COMMENT ON COLUMN saved_games.contest_number IS 'Número do concurso (obrigatório para contexto - Q21)';
COMMENT ON COLUMN saved_games.analysis_result IS 'Snapshot da análise no momento do salvamento (hot/cold counts, score)';
COMMENT ON COLUMN saved_games.source IS 'Origem: ai_generated (Fase 1) ou manual_created (Fase 3)';
COMMENT ON COLUMN saved_games.name IS 'Nome customizado opcional (max 50 chars - Q7)';
COMMENT ON COLUMN saved_games.play_count IS 'Contador de vezes que o usuário marcou como jogado (Q8)';

-- ─────────────────────────────────────────────────────
-- 2.2 FUNÇÃO: check_saved_games_limit
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS check_saved_games_limit() CASCADE;

CREATE OR REPLACE FUNCTION check_saved_games_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM saved_games
  WHERE user_id = NEW.user_id;

  IF current_count >= 50 THEN
    RAISE EXCEPTION 'Limite de 50 jogos salvos atingido. Exclua alguns jogos para salvar novos.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para aplicar limite
CREATE TRIGGER enforce_saved_games_limit
BEFORE INSERT ON saved_games
FOR EACH ROW
EXECUTE FUNCTION check_saved_games_limit();

-- Comentário
COMMENT ON FUNCTION check_saved_games_limit IS 'Valida limite de 50 jogos salvos por usuário antes de INSERT';

-- ─────────────────────────────────────────────────────
-- 2.3 MATERIALIZED VIEW: saved_games_stats
-- ─────────────────────────────────────────────────────
-- CORRIGIDO: Usar CTE para evitar agregação aninhada

CREATE MATERIALIZED VIEW IF NOT EXISTS saved_games_stats AS
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

-- Índice único na view materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_games_stats_user_id ON saved_games_stats(user_id);

-- Comentário
COMMENT ON MATERIALIZED VIEW saved_games_stats IS 'Estatísticas agregadas de jogos salvos por usuário (atualizada via triggers)';

-- ─────────────────────────────────────────────────────
-- 2.4 FUNÇÃO: refresh_saved_games_stats
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS refresh_saved_games_stats() CASCADE;

CREATE OR REPLACE FUNCTION refresh_saved_games_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY saved_games_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers para refresh automático
CREATE TRIGGER refresh_stats_on_insert
AFTER INSERT ON saved_games
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_saved_games_stats();

CREATE TRIGGER refresh_stats_on_update
AFTER UPDATE ON saved_games
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_saved_games_stats();

CREATE TRIGGER refresh_stats_on_delete
AFTER DELETE ON saved_games
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_saved_games_stats();

-- Comentário
COMMENT ON FUNCTION refresh_saved_games_stats IS 'Atualiza materialized view de estatísticas automaticamente';

-- ─────────────────────────────────────────────────────
-- 2.5 ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────

-- Habilitar RLS
ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own saved games"
  ON saved_games
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved games"
  ON saved_games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved games"
  ON saved_games
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved games"
  ON saved_games
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FASE 3: SISTEMA DE CRIAÇÃO MANUAL
-- Estimativa: 50 horas
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 3.1 ALTERAR TABELA: profiles
-- ─────────────────────────────────────────────────────

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_seen_manual_creation_tour BOOLEAN DEFAULT FALSE;

-- Comentário
COMMENT ON COLUMN profiles.has_seen_manual_creation_tour IS 'Flag para tour guide da criação manual';

-- ─────────────────────────────────────────────────────
-- 3.2 TABELA: manual_creation_sessions
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS manual_creation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,

  -- Dados da sessão
  selected_numbers INTEGER[] NOT NULL,
  analysis_result JSONB NOT NULL,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  saved_to_saved_games BOOLEAN DEFAULT FALSE,
  generated_variations BOOLEAN DEFAULT FALSE,

  -- Analytics: Tempo gasto em cada etapa (segundos)
  time_spent_step1 INTEGER,
  time_spent_step2 INTEGER,
  time_spent_step3 INTEGER,
  time_spent_step4 INTEGER,

  -- Constraints
  CONSTRAINT check_valid_lottery_type_manual CHECK (lottery_type IN ('lotofacil', 'lotomania')),
  CONSTRAINT check_numbers_not_empty_manual CHECK (array_length(selected_numbers, 1) > 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_manual_sessions_user_id ON manual_creation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_sessions_created_at ON manual_creation_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_sessions_lottery_type ON manual_creation_sessions(lottery_type);
CREATE INDEX IF NOT EXISTS idx_manual_sessions_completed ON manual_creation_sessions(completed_at) WHERE completed_at IS NOT NULL;

-- Comentário
COMMENT ON TABLE manual_creation_sessions IS 'Sessões de criação manual de jogos (analytics)';

-- ─────────────────────────────────────────────────────
-- 3.3 TABELA: manual_game_variations
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS manual_game_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Jogo original
  original_numbers INTEGER[] NOT NULL,
  original_contest_number INTEGER NOT NULL,
  original_lottery_type TEXT NOT NULL,

  -- Variação gerada
  variation_numbers INTEGER[] NOT NULL,
  variation_strategy TEXT NOT NULL,
  variation_score NUMERIC(4,2) NOT NULL,
  analysis_result JSONB NOT NULL,

  -- Metadados
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  saved_to_saved_games BOOLEAN DEFAULT FALSE,

  -- Constraints
  CONSTRAINT unique_variation UNIQUE(user_id, original_numbers, variation_strategy),
  CONSTRAINT check_valid_lottery_type_var CHECK (original_lottery_type IN ('lotofacil', 'lotomania')),
  CONSTRAINT check_valid_strategy_var CHECK (variation_strategy IN (
    'balanced', 'hot_focused', 'cold_focused', 'even_odd_optimized', 'dezena_optimized'
  )),
  CONSTRAINT check_score_range CHECK (variation_score >= 0 AND variation_score <= 10)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_variations_user_id ON manual_game_variations(user_id);
CREATE INDEX IF NOT EXISTS idx_variations_generated_at ON manual_game_variations(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_variations_original_lottery ON manual_game_variations(original_lottery_type);
CREATE INDEX IF NOT EXISTS idx_variations_strategy ON manual_game_variations(variation_strategy);

-- Comentário
COMMENT ON TABLE manual_game_variations IS 'Variações otimizadas geradas a partir de jogos manuais (5 variações)';

-- ─────────────────────────────────────────────────────
-- 3.4 FUNÇÃO: cleanup_old_manual_sessions
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS cleanup_old_manual_sessions() CASCADE;

CREATE OR REPLACE FUNCTION cleanup_old_manual_sessions()
RETURNS void AS $$
BEGIN
  -- Deletar sessões incompletas com mais de 7 dias
  DELETE FROM manual_creation_sessions
  WHERE completed_at IS NULL
    AND created_at < NOW() - INTERVAL '7 days';

  RAISE NOTICE 'Sessões manuais antigas limpas';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION cleanup_old_manual_sessions IS 'Remove sessões incompletas com mais de 7 dias (executar via cron)';

-- ─────────────────────────────────────────────────────
-- 3.5 ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────

-- Habilitar RLS
ALTER TABLE manual_creation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_game_variations ENABLE ROW LEVEL SECURITY;

-- Políticas para manual_creation_sessions
CREATE POLICY "Users can view own manual sessions"
  ON manual_creation_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own manual sessions"
  ON manual_creation_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manual sessions"
  ON manual_creation_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own manual sessions"
  ON manual_creation_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para manual_game_variations
CREATE POLICY "Users can view own variations"
  ON manual_game_variations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own variations"
  ON manual_game_variations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own variations"
  ON manual_game_variations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own variations"
  ON manual_game_variations
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÕES UTILITÁRIAS E VIEWS ADICIONAIS
-- =====================================================

-- ─────────────────────────────────────────────────────
-- VIEW: user_dashboard_stats
-- ─────────────────────────────────────────────────────

CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
  p.id as user_id,

  -- Créditos
  COALESCE(uc.credits_remaining, 50) as credits_remaining,
  COALESCE(uc.credits_total, 50) as credits_total,

  -- Gerações
  (SELECT COUNT(*) FROM generation_history gh WHERE gh.user_id = p.id) as total_generations,
  (SELECT COUNT(*) FROM generation_history gh WHERE gh.user_id = p.id AND gh.is_active = TRUE) as active_generations,

  -- Jogos salvos
  (SELECT COUNT(*) FROM saved_games sg WHERE sg.user_id = p.id) as total_saved_games,
  (SELECT COUNT(*) FROM saved_games sg WHERE sg.user_id = p.id AND sg.source = 'ai_generated') as ai_generated_games,
  (SELECT COUNT(*) FROM saved_games sg WHERE sg.user_id = p.id AND sg.source = 'manual_created') as manual_created_games,

  -- Criação manual
  (SELECT COUNT(*) FROM manual_creation_sessions mcs WHERE mcs.user_id = p.id AND mcs.completed_at IS NOT NULL) as completed_manual_sessions,

  -- Tour guide
  COALESCE(p.has_seen_manual_creation_tour, FALSE) as has_seen_manual_creation_tour

FROM profiles p
LEFT JOIN user_credits uc ON uc.user_id = p.id;

-- Comentário
COMMENT ON VIEW user_dashboard_stats IS 'Estatísticas consolidadas do usuário para dashboard';

-- ─────────────────────────────────────────────────────
-- FUNÇÃO: get_user_activity_summary
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS get_user_activity_summary(UUID) CASCADE;

CREATE OR REPLACE FUNCTION get_user_activity_summary(p_user_id UUID)
RETURNS TABLE(
  total_generations BIGINT,
  total_saved_games BIGINT,
  total_manual_sessions BIGINT,
  credits_remaining INTEGER,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM generation_history WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM saved_games WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM manual_creation_sessions WHERE user_id = p_user_id AND completed_at IS NOT NULL),
    COALESCE((SELECT uc.credits_remaining FROM user_credits uc WHERE uc.user_id = p_user_id), 50),
    GREATEST(
      COALESCE((SELECT MAX(generated_at) FROM generation_history WHERE user_id = p_user_id), '1970-01-01'::TIMESTAMPTZ),
      COALESCE((SELECT MAX(saved_at) FROM saved_games WHERE user_id = p_user_id), '1970-01-01'::TIMESTAMPTZ),
      COALESCE((SELECT MAX(created_at) FROM manual_creation_sessions WHERE user_id = p_user_id), '1970-01-01'::TIMESTAMPTZ)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION get_user_activity_summary IS 'Retorna resumo de atividade do usuário para analytics';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Listar todas as tabelas criadas
DO $$
BEGIN
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'MIGRATIONS CONCLUÍDAS COM SUCESSO!';
  RAISE NOTICE '===============================================';
  RAISE NOTICE 'Tabelas criadas:';
  RAISE NOTICE '  - generation_history';
  RAISE NOTICE '  - user_credits';
  RAISE NOTICE '  - saved_games';
  RAISE NOTICE '  - manual_creation_sessions';
  RAISE NOTICE '  - manual_game_variations';
  RAISE NOTICE '';
  RAISE NOTICE 'Views criadas:';
  RAISE NOTICE '  - saved_games_stats (materialized)';
  RAISE NOTICE '  - user_dashboard_stats';
  RAISE NOTICE '';
  RAISE NOTICE 'Funções criadas:';
  RAISE NOTICE '  - consume_credit()';
  RAISE NOTICE '  - reset_monthly_credits()';
  RAISE NOTICE '  - check_saved_games_limit()';
  RAISE NOTICE '  - refresh_saved_games_stats()';
  RAISE NOTICE '  - cleanup_old_generations()';
  RAISE NOTICE '  - cleanup_old_manual_sessions()';
  RAISE NOTICE '  - get_user_activity_summary()';
  RAISE NOTICE '';
  RAISE NOTICE 'Políticas RLS aplicadas em todas as tabelas';
  RAISE NOTICE '===============================================';
END $$;

-- =====================================================
-- FASE 4: SISTEMA DE FEEDBACK E SUGESTÕES
-- Adicionado: 2025-01-04
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 4.1 TABELA: user_feedback
-- ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Metadados do feedback
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug', 'praise')),
  category TEXT CHECK (category IN ('ui', 'analysis', 'feature', 'performance', 'other')),
  title TEXT,
  content TEXT NOT NULL CHECK (char_length(content) >= 10),

  -- Contexto de origem
  context TEXT CHECK (context IN ('general', 'post-generation', 'post-share', 'post-save', 'header', 'mobile-menu', 'fab')),
  page_url TEXT,

  -- Dados técnicos (úteis para bugs)
  user_agent TEXT,
  screen_resolution TEXT,
  browser_info JSONB,

  -- Status e moderação
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'planned', 'implemented', 'rejected', 'duplicate')),
  admin_notes TEXT,
  implemented_at TIMESTAMPTZ,

  -- Gamificação
  credit_awarded BOOLEAN DEFAULT FALSE,
  upvotes INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON public.user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- RLS Policies
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;
CREATE POLICY "Users can insert own feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
CREATE POLICY "Users can view own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE user_feedback IS 'Sistema de feedback e sugestões dos usuários';
COMMENT ON COLUMN user_feedback.credit_awarded IS 'TRUE se o usuário recebeu +1 crédito por este feedback';

-- ─────────────────────────────────────────────────────
-- 4.2 TRIGGER: Atualizar updated_at
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS update_user_feedback_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_feedback_updated_at ON public.user_feedback;
CREATE TRIGGER user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_updated_at();

-- ─────────────────────────────────────────────────────
-- 4.3 MATERIALIZED VIEW: feedback_stats
-- ─────────────────────────────────────────────────────

DROP MATERIALIZED VIEW IF EXISTS public.feedback_stats CASCADE;
CREATE MATERIALIZED VIEW public.feedback_stats AS
SELECT
  user_id,
  COUNT(*) AS total_feedbacks,
  COUNT(*) FILTER (WHERE type = 'suggestion') AS suggestions_count,
  COUNT(*) FILTER (WHERE type = 'bug') AS bugs_count,
  COUNT(*) FILTER (WHERE type = 'praise') AS praise_count,
  COUNT(*) FILTER (WHERE credit_awarded = TRUE) AS credits_earned,
  COUNT(*) FILTER (WHERE status = 'implemented') AS implemented_count,
  MAX(created_at) AS last_feedback_at
FROM public.user_feedback
GROUP BY user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_stats_user_id ON public.feedback_stats(user_id);

COMMENT ON MATERIALIZED VIEW feedback_stats IS 'Estatísticas agregadas de feedback por usuário';

-- ─────────────────────────────────────────────────────
-- 4.4 FUNÇÃO: Refresh automático da view
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS refresh_feedback_stats() CASCADE;

CREATE OR REPLACE FUNCTION refresh_feedback_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.feedback_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_feedback_stats_trigger ON public.user_feedback;
CREATE TRIGGER refresh_feedback_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_feedback
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_feedback_stats();

-- ─────────────────────────────────────────────────────
-- 4.5 FUNÇÃO: Limitar feedbacks diários (Anti-Spam)
-- ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS check_feedback_daily_limit() CASCADE;

CREATE OR REPLACE FUNCTION check_feedback_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_count INT;
BEGIN
  SELECT COUNT(*) INTO daily_count
  FROM public.user_feedback
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF daily_count >= 5 THEN
    RAISE EXCEPTION 'Daily feedback limit reached (5 per day)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_feedback_daily_limit ON public.user_feedback;
CREATE TRIGGER enforce_feedback_daily_limit
  BEFORE INSERT ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION check_feedback_daily_limit();

COMMENT ON FUNCTION check_feedback_daily_limit IS 'Previne spam limitando a 5 feedbacks por dia por usuário';

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================

/*

CHECKLIST PÓS-MIGRATION:

1. [ ] Verificar que todas as tabelas foram criadas:
   SELECT tablename FROM pg_tables WHERE schemaname = 'public'
   AND tablename IN ('generation_history', 'user_credits', 'saved_games',
                     'manual_creation_sessions', 'manual_game_variations');

2. [ ] Verificar índices criados:
   SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

3. [ ] Verificar RLS habilitado:
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = TRUE;

4. [ ] Testar função consume_credit():
   SELECT * FROM consume_credit('user-uuid-aqui');

5. [ ] Testar limite de 50 jogos salvos:
   -- Inserir 50 jogos e tentar inserir o 51º

6. [ ] Verificar materialized view:
   SELECT * FROM saved_games_stats LIMIT 5;

7. [ ] Configurar Supabase Edge Function para reset_monthly_credits()
   (executar mensalmente)

8. [ ] Configurar limpeza automática (cron jobs):
   - cleanup_old_generations() (diário)
   - cleanup_old_manual_sessions() (diário)

9. [ ] Regenerar tipos TypeScript:
   supabase gen types typescript --local > types/supabase.ts

10. [ ] Backup do banco de dados antes de deploy em produção

*/

-- =====================================================
-- FIM DAS MIGRATIONS
-- Data: 2025-01-03 | Atualizado: 2025-01-04
-- Responsável: Claude Code
-- =====================================================
