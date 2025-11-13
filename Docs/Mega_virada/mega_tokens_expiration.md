# Expiração automática de tokens Mega

1. **Função SQL**  
   - A migração `20250210213000_add_mega_token_expiration_function.sql` cria `expire_mega_tokens_job()` (security definer).  
   - Ela percorre `mega_tokens` vencidos (`expires_at < now()`), zera o saldo e registra um lançamento `mega_token_transactions` com `feature = 'expiration'`.
   - Retorna o número de carteiras afetadas para facilitar logs/monitoramento.

2. **Agendamento recomendado**  
   - Crie uma Supabase Scheduled Function chamando RPC `expire_mega_tokens_job` diariamente, a partir de 01/01 até +7 dias após o sorteio (ou conforme regra de negócio).
   - Exemplo de comando `cron` (UTC): `0 3 * * *` para rodar às 00h de Brasília.

3. **Runbook rápido**  
   - Se precisar estornar manualmente, use `update public.mega_tokens set balance = balance + X` + `insert mega_token_transactions`.
   - Para auditoria, consulte `select * from mega_token_transactions where feature = 'expiration' order by created_at desc`.
