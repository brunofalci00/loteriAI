-- 🗄️ SETUP SQL PARA SCENARIO B
-- Execute estas queries no Supabase Dashboard → SQL Editor

-- ============================================================
-- 1. CRIAR TABELA: access_tokens
-- ============================================================
CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  purpose TEXT DEFAULT 'create_password',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_access_tokens_token ON access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_access_tokens_user_id ON access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires ON access_tokens(expires_at);

-- Adicionar comentários
COMMENT ON TABLE access_tokens IS 'Tokens de acesso para criação de senha pós-compra';
COMMENT ON COLUMN access_tokens.token IS 'Token único e aleatório (64 caracteres hex)';
COMMENT ON COLUMN access_tokens.expires_at IS 'Data/hora de expiração do token (24h após criação)';
COMMENT ON COLUMN access_tokens.used_at IS 'Data/hora quando o token foi utilizado';

-- ============================================================
-- 2. CRIAR TABELA: email_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'sent',
  recipient TEXT,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_date ON email_logs(created_at);

-- Adicionar comentários
COMMENT ON TABLE email_logs IS 'Log de todos os emails enviados no sistema';
COMMENT ON COLUMN email_logs.email_type IS 'Tipo de email: welcome, token_created, password_created, reminder, etc';
COMMENT ON COLUMN email_logs.status IS 'Status do envio: sent, bounced, opened, clicked';

-- ============================================================
-- ✅ SETUP CONCLUÍDO
-- ============================================================
-- As tabelas foram criadas com sucesso!
-- Próximo passo: Criar as Edge Functions
