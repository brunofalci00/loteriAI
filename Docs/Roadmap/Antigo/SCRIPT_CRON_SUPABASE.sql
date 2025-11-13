-- ============================================
-- SCRIPT: Configurar Cron Job para Reset de Créditos
-- Executar no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk/sql/new
-- ============================================

-- PASSO 1: Habilitar extensões necessárias
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- PASSO 2: Remover cron job anterior (se existir)
-- ============================================
SELECT cron.unschedule('reset-monthly-credits-job');

-- PASSO 3: Criar cron job para reset mensal
-- ============================================
-- Executa todo dia 1º do mês às 00:00 UTC
-- Chama diretamente a função SQL reset_monthly_credits()
SELECT cron.schedule(
  'reset-monthly-credits-job',           -- Nome do job
  '0 0 1 * *',                           -- Schedule: dia 1º às 00:00 UTC (cron syntax)
  $$
  SELECT reset_monthly_credits();
  $$
);

-- PASSO 4: Verificar se o cron job foi criado
-- ============================================
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'reset-monthly-credits-job';

-- ============================================
-- COMANDOS ÚTEIS PARA GERENCIAMENTO
-- ============================================

-- Ver todos os cron jobs
-- SELECT * FROM cron.job ORDER BY jobid DESC;

-- Ver histórico de execuções
-- SELECT * FROM cron.job_run_details
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'reset-monthly-credits-job')
-- ORDER BY start_time DESC LIMIT 10;

-- Testar manualmente (⚠️ CUIDADO: reseta créditos de TODOS os usuários AGORA)
-- SELECT reset_monthly_credits();

-- Remover cron job
-- SELECT cron.unschedule('reset-monthly-credits-job');

-- ============================================
-- EXPLICAÇÃO DO SCHEDULE
-- ============================================
-- Cron Expression: 0 0 1 * *
--                  │ │ │ │ │
--                  │ │ │ │ └─── Dia da semana (0-7, * = qualquer)
--                  │ │ │ └───── Mês (1-12, * = todos)
--                  │ │ └─────── Dia do mês (1-31, 1 = dia 1º)
--                  │ └───────── Hora (0-23, 0 = meia-noite)
--                  └─────────── Minuto (0-59, 0 = minuto zero)
--
-- Tradução: "Executar às 00:00 UTC do dia 1º de cada mês"
--
-- Próximas execuções:
-- - 01/02/2025 às 00:00 UTC
-- - 01/03/2025 às 00:00 UTC
-- - 01/04/2025 às 00:00 UTC
-- - ...

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Se der erro "extension pg_cron does not exist":
-- Verifique se seu plano do Supabase suporta pg_cron
-- (Disponível em todos os planos, incluindo Free)

-- Se der erro "permission denied for schema cron":
-- Você precisa ser um superuser ou ter permissões de cron
-- Tente executar como postgres user

-- Se o cron não executar:
-- 1. Verifique se active = true em cron.job
-- 2. Verifique logs em cron.job_run_details
-- 3. Teste a função manualmente: SELECT reset_monthly_credits();

-- ============================================
-- FIM DO SCRIPT
-- ============================================
