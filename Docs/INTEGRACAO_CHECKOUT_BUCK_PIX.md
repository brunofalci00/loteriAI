# Integração Checkout PIX com Buck API - Quiz Classic

## 📋 Resumo da Implementação

Checkout PIX totalmente integrado na landing page Quiz Classic, com fluxo de seleção de método de pagamento (PIX ou Cartão). PIX fica integrado na LP via Buck API, Cartão continua redirecionando para Kirvano.

**Data de Implementação:** 09/12/2025
**Valor do Produto:** R$ 37,00
**Webhook Backend:** `buck-webhook-token` (já existente e ativo)

---

## 🏗️ Arquitetura

### Frontend (Quiz Classic)
```
Landing Page (FinalOfferSlide)
    ↓ Click "Garantir acesso"
PaymentMethodDialog (Modal)
    ↓ Escolha
    ├─→ PIX → BuckPixCheckout (Modal integrado)
    └─→ Cartão → Redirect Kirvano
```

### Backend (Supabase Edge Functions)
```
Buck API (POST /v1/transactions)
    ↓ Retorna QR Code
Frontend (Polling GET /v1/transactions/external_id/:id)
    ↓ Detecta status "paid"
Buck Webhook → buck-webhook-token
    ↓
Supabase Auth + payments table
    ↓
Email de acesso enviado
```

---

## 📁 Arquivos Criados

### Tipos TypeScript (2 arquivos)
- `src/types/buck-api.types.ts` - Tipos da Buck API
- `src/types/checkout.types.ts` - Tipos do fluxo de checkout

### Validações e Utilidades (2 arquivos)
- `src/lib/validations/pix-form.validation.ts` - Schema Zod com validação de CPF
- `src/lib/utils/input-masks.ts` - Máscaras para CPF, telefone e formatação de moeda

### Hooks (2 arquivos)
- `src/hooks/useBuckPixPayment.ts` - Integração Buck API com polling e retry logic
- `src/hooks/usePixTimer.ts` - Countdown timer com estados (normal, urgente, crítico)

### Componentes (3 arquivos)
- `src/components/checkout/PaymentMethodDialog.tsx` - Modal de seleção PIX/Cartão
- `src/components/checkout/PixQRCodeDisplay.tsx` - Exibição QR Code + timer + instruções
- `src/components/checkout/BuckPixCheckout.tsx` - Componente principal do fluxo PIX

### Arquivos Modificados (2 arquivos)
- `src/components/slides/FinalOfferSlide.tsx` - Integração dos novos componentes
- `src/lib/analytics.ts` - Adicionados 8 novos eventos de tracking

### Configuração (2 arquivos)
- `.env` - Variáveis de ambiente (não commitar!)
- `.env.example` - Template de variáveis

---

## 🔑 Variáveis de Ambiente

### Frontend (.env)
```env
# Buck API Configuration
VITE_BUCK_API_URL=https://api.realtechdev.com.br
VITE_BUCK_API_KEY=your_buck_api_key_here
VITE_BUCK_USER_AGENT=Buckpay API

# Feature Flags (opcional)
VITE_ENABLE_PIX_CHECKOUT=true
```

### Backend (Supabase Secrets)
Já configuradas no projeto Loteri.ai:
```
BUCK_WEBHOOK_TOKEN=Trendly
SUPABASE_URL=https://aaqthgqsuhyagsrlnyqk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[secret]
SUPABASE_ANON_KEY=[secret]
N8N_WEBHOOK_URL=https://n8n-evo-n8n.harxon.easypanel.host/webhook/loter-ai-welcome
APP_URL=https://www.fqdigital.com.br/app
```

---

## 🚀 Deploy

### 1. Build da Aplicação
```bash
cd LP_loteri.AI/apps/quiz-classic
npm install
npm run build
```

**Saída esperada:**
- Pasta `dist/` com arquivos estáticos
- Nenhum erro de TypeScript
- Bundle otimizado

### 2. Verificar Webhook
```bash
cd App/app
supabase functions list
```

**Verificar:**
- ✅ `buck-webhook-token` está ACTIVE
- ✅ Versão 7 ou superior
- ✅ URL: `https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/buck-webhook-token`

**Se precisar redeploy:**
```bash
supabase functions deploy buck-webhook-token
```

### 3. Configurar Webhook na Buck

No painel da Buck (https://dashboard.buck.com.br):

1. Acesse **Configurações → Webhooks**
2. Adicione novo webhook:
   - **URL**: `https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/buck-webhook-token`
   - **Evento**: `transaction.processed`
   - **Header Authorization**: `Trendly`
   - **Método**: POST
   - **Status**: Ativo

3. Testar webhook (enviar evento de teste)

### 4. Deploy Frontend

Conforme processo atual de deploy da landing page.

**Exemplo (se usar Vercel/Netlify):**
```bash
npm run build
# Upload da pasta dist/ para seu hosting
```

**Configurar variáveis de ambiente no hosting:**
- `VITE_BUCK_API_URL`
- `VITE_BUCK_API_KEY`
- `VITE_BUCK_USER_AGENT`

---

## 🧪 Testes

### Checklist de Testes Locais

1. **Modal de Pagamento**
   - [ ] Abre ao clicar em "Garantir acesso por R$37,00"
   - [ ] Exibe 2 opções: PIX e Cartão
   - [ ] Design responsivo mobile/desktop

2. **Fluxo PIX**
   - [ ] Seleção PIX abre formulário de dados
   - [ ] Validação de CPF rejeita CPFs inválidos
   - [ ] Validação de email funciona
   - [ ] Máscaras de CPF (000.000.000-00) aplicadas
   - [ ] Máscaras de telefone ((00) 00000-0000) aplicadas
   - [ ] Botão "Gerar PIX" habilitado apenas com dados válidos

3. **QR Code e Pagamento**
   - [ ] QR Code é exibido após submit do formulário
   - [ ] Código PIX pode ser copiado
   - [ ] Timer countdown inicia em 15:00
   - [ ] Timer muda para laranja < 5 min
   - [ ] Timer muda para vermelho < 1 min
   - [ ] Instruções claras de como pagar

4. **Fluxo Cartão** (Regressão)
   - [ ] Seleção Cartão redireciona para Kirvano
   - [ ] URL correta: `https://pay.kirvano.com/723e60dd-cf83-47c6-8084-f31f88475689`
   - [ ] Abre em nova aba

5. **Analytics**
   - [ ] Evento `CheckoutClick` disparado
   - [ ] Evento `PaymentMethodDialogOpened` disparado
   - [ ] Evento `PixMethodSelected` ou `CardMethodSelected` disparado
   - [ ] Evento `PixFormStarted` disparado (PIX)
   - [ ] Evento `PixQRCodeGenerated` disparado (PIX)
   - [ ] Evento `PixCodeCopied` disparado ao copiar

### Teste de Integração (Com PIX Real)

**⚠️ IMPORTANTE:** Fazer com valor de teste primeiro!

1. **Criar transação PIX de teste:**
   - Preencher formulário com dados reais
   - Gerar QR Code
   - Abrir app do banco
   - Escanear QR Code
   - **NÃO CONFIRMAR** pagamento ainda

2. **Verificar logs do webhook:**
```bash
# Ver logs em tempo real
supabase functions logs buck-webhook-token --follow
```

3. **Confirmar pagamento no app do banco**

4. **Verificar fluxo completo:**
   - [ ] Webhook recebe evento `transaction.processed`
   - [ ] Usuário criado no Supabase Auth
   - [ ] Registro criado na tabela `payments`
   - [ ] Email enviado para o usuário
   - [ ] N8N webhook executado
   - [ ] Polling detecta pagamento
   - [ ] Tela de sucesso exibida
   - [ ] Evento `PixPaymentCompleted` disparado

5. **Verificar recebimento:**
   - [ ] Email de acesso recebido
   - [ ] Link de definir senha funciona
   - [ ] Login com email + senha funciona
   - [ ] Dashboard acessível

---

## 📊 Monitoramento

### Logs do Webhook
```bash
# Ver logs em tempo real
supabase functions logs buck-webhook-token --follow

# Ver logs das últimas 100 linhas
supabase functions logs buck-webhook-token --tail 100
```

### Métricas Importantes

**Facebook Pixel / CAPI:**
- Taxa de abertura do modal (PaymentMethodDialogOpened)
- Taxa de seleção PIX vs Cartão
- Taxa de conclusão do formulário (PixFormStarted → PixQRCodeGenerated)
- Taxa de conversão PIX (PixQRCodeGenerated → PixPaymentCompleted)
- Taxa de expiração (PixPaymentExpired)

**Banco de Dados:**
```sql
-- Total de transações PIX hoje
SELECT COUNT(*)
FROM payments
WHERE payment_method = 'pix'
AND created_at::date = CURRENT_DATE;

-- Taxa de sucesso
SELECT
  status,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM payments
WHERE payment_method = 'pix'
GROUP BY status;

-- Tempo médio até pagamento
SELECT
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 60) as avg_minutes
FROM payments
WHERE payment_method = 'pix'
AND status = 'active';
```

---

## 🐛 Troubleshooting

### Problema: QR Code não é gerado

**Possíveis causas:**
1. API Key da Buck inválida
2. Webhook não configurado
3. Erro de validação no formulário

**Debug:**
```javascript
// Abrir DevTools Console
// Procurar por:
[BuckAPI] Criando transação PIX: {...}
[BuckAPI] Transação criada com sucesso: {...}
// Ou erros:
[BuckAPI] Erro ao criar transação: Error: ...
```

**Solução:**
- Verificar `.env` está configurado corretamente
- Verificar console do navegador para erros
- Testar Buck API diretamente com cURL

### Problema: Polling não detecta pagamento

**Possíveis causas:**
1. Webhook não está sendo chamado pela Buck
2. Token de autorização incorreto
3. Erro no processamento do webhook

**Debug:**
```bash
# Ver logs do webhook
supabase functions logs buck-webhook-token --follow

# Verificar se webhook está recebendo chamadas
# Procurar por: [buck-webhook] 🚀 === WEBHOOK RECEBIDO ===
```

**Solução:**
- Verificar configuração do webhook na Buck
- Testar webhook manualmente com cURL:
```bash
curl -X POST https://aaqthgqsuhyagsrlnyqk.supabase.co/functions/v1/buck-webhook-token \
  -H "Authorization: Trendly" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transaction.processed",
    "data": {
      "id": "test-123",
      "status": "paid",
      "payment_method": "pix",
      "total_amount": 3700,
      "buyer": {
        "name": "Teste",
        "email": "teste@example.com"
      }
    }
  }'
```

### Problema: Email não é enviado

**Possíveis causas:**
1. Supabase Auth não configurado
2. Email template não existe
3. Erro no webhook

**Debug:**
```bash
# Ver logs do webhook
supabase functions logs buck-webhook-token --follow

# Procurar por:
[buck-webhook] ✉️ Email de acesso enviado para: ...
# Ou erros:
[buck-webhook] ⚠️ Erro ao enviar email de acesso: ...
```

**Solução:**
- Verificar configuração de email no Supabase
- Testar envio de email manualmente
- Verificar se usuário foi criado no Supabase Auth

---

## 📈 Melhorias Futuras

### Curto Prazo
- [ ] A/B test: PIX integrado vs Redirect Kirvano
- [ ] Adicionar notificação push quando pagamento confirmado
- [ ] Implementar retry automático em caso de erro de rede
- [ ] Adicionar loading skeleton mais elaborado

### Médio Prazo
- [ ] Suporte a cartão de crédito integrado (Buck API)
- [ ] Histórico de transações no painel do usuário
- [ ] Comprovante de pagamento por email
- [ ] Integração com outros gateways (failover)

### Longo Prazo
- [ ] Checkout one-click (dados salvos)
- [ ] Múltiplos produtos/planos
- [ ] Assinatura recorrente
- [ ] Cupons de desconto

---

## 📞 Suporte

**Dúvidas sobre a implementação:**
- Consultar este documento
- Verificar plano original: `~/.claude/plans/bright-dancing-cascade.md`

**Problemas com Buck API:**
- Documentação: [Buck API Docs]
- Suporte: contato@buck.com.br

**Problemas com Supabase:**
- Dashboard: https://supabase.com/dashboard/project/aaqthgqsuhyagsrlnyqk
- Logs: `supabase functions logs`

---

## ✅ Checklist de Go-Live

Antes de colocar em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Webhook Buck configurado e testado
- [ ] Build da aplicação sem erros
- [ ] Testes de fluxo completo PIX passando
- [ ] Testes de regressão (Cartão) passando
- [ ] Analytics tracking funcionando
- [ ] Monitoramento configurado
- [ ] Documentação atualizada
- [ ] Equipe treinada sobre novo fluxo
- [ ] Plano de rollback definido

**Data de Go-Live:** _____________________

**Responsável:** _____________________

---

**Última atualização:** 09/12/2025
**Versão:** 1.0
