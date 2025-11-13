-- =====================================================
-- Migration: Sistema de Feedback e Sugestões
-- Descrição: Cria tabelas para coletar feedback dos usuários
-- Data: 2025-01-03
-- =====================================================

-- =====================================================
-- 1. TABELA PRINCIPAL: user_feedback
-- =====================================================

CREATE TABLE public.user_feedback (
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

-- =====================================================
-- 2. ÍNDICES
-- =====================================================

CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON public.user_feedback(type);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Usuários podem inserir seu próprio feedback
CREATE POLICY "Users can insert own feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver seu próprio feedback
CREATE POLICY "Users can view own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_feedback_updated_at
  BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_user_feedback_updated_at();

-- =====================================================
-- 5. MATERIALIZED VIEW: feedback_stats
-- =====================================================

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

-- Índice único
CREATE UNIQUE INDEX idx_feedback_stats_user_id ON public.feedback_stats(user_id);

-- =====================================================
-- 6. TRIGGER PARA REFRESH AUTOMÁTICO DA VIEW
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_feedback_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.feedback_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_feedback_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.user_feedback
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_feedback_stats();

-- =====================================================
-- 7. FUNÇÃO PARA LIMITAR FEEDBACKS DIÁRIOS (Anti-Spam)
-- =====================================================

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

CREATE TRIGGER enforce_feedback_daily_limit
  BEFORE INSERT ON public.user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION check_feedback_daily_limit();

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
