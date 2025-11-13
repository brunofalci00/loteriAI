# Mega da Virada 2024/2025 – Plano de Produto, UX e Implementação

## 1. Contexto e Objetivos de Negócio
- **Meta principal:** elevar o _valor por usuário_ (ARP U) durante a temporada da Mega da Virada oferecendo um pacote premium baseado em moedas exclusivas.
- **Disponibilidade:** experiência ativa da publicação até o sorteio (31/12) e mantida por no máximo 7 dias pós-evento para consumo de conteúdo residual.
- **Público elegível:** somente usuários pagantes do lote atual do app (acesso vitalício existente). Leads não pagantes continuam direcionados para o funil tradicional.
- **Diferencial:** camada paralela de tokens (não substitui créditos mensais), com IA personalizada para a Mega da Virada, variações exclusivas e storytelling focado no prêmio de R$ 850 milhões.

KPIs a monitorar (via Link.com/kirvano dashboards):
1. Conversão em pacotes de moedas (limite e ilimitado).
2. Consumo médio de moedas por usuário (gerar/analisar/regenerar/variar).
3. Receita incremental vs. baseline anual.

## 2. Pacotes, Economia e Regras de Negócio
### 2.1 Produtos
| Plano | Conteúdo | Preço sugerido | Observações |
| --- | --- | --- | --- |
| **Plano Ilimitado** | 1.000 moedas (token Mega) | Ancoragem principal | Promessa de “jogue até ficar satisfeito” para heavy users |
| **Plano Limitado** | 100 moedas (~5 jogos completos) | Oferta de entrada | Exibido quando usuário não tem saldo suficiente (order bump) |

- Custos unitários: **20 moedas** por cada ação paga (gerar jogos IA, analisar manual, regenerar IA, gerar variações). Valores fixos durante o evento.
- Sem histórico separado/exportável; apenas resumo visual. Persistimos registros para auditoria e métricas.

### 2.2 Regras Operacionais
- Tokens só podem ser usados dentro da sessão Mega da Virada; APIs regulares continuam usando `user_credits` tradicionais.
- Saldo e consumo ficam vinculados a um novo recurso (ver Seção 5) e expiram automaticamente após fechamento do evento.
- Reembolsos/cancelamentos: **pendente de definição** (registrar como risco), mas preparar backend para estornar saldo via job manual.

## 3. Experiência do Usuário
### 3.1 Home / Dashboard
- Adicionar **hero banner fixo** no topo do dashboard atual (não substitui cards). Conteúdo: headline “Mega da Virada • R$ 850 Milhões”, CTA “Entrar no Evento”. Background com gradiente dourado (#f7c948 a #ffb347) + motion sutil (particles/shine).
- Banner não é dismissible; após clique conduz para `/mega-da-virada` (nova rota protegida).

### 3.2 Sessão Exclusiva (replica navegação tradicional)
Estrutura recomendada (scroll vertical com seções modulares):
1. **Hero interno** com contador regressivo (opcional) e CTA “Comprar Moedas”.
2. **Painel de saldo** (novo `TokenWalletCard`) exibindo moedas restantes, botões “Adicionar moedas” e “Histórico rápido” (últimas 3 ações).
3. **Acesso rápido** às funções já existentes adaptadas para o evento:
   - Gerar 3 jogos IA por 20 moedas (UI destaca “lote exclusivo Mega da Virada”).
   - Analisar jogo manual com storytelling do prêmio.
   - Regenerar combinações e gerar variações (versão especial; ver 3.4).
4. **Storytelling**: bloco com copy sobre “maiores prêmios anteriores” (usar dados de API/pesquisa) + carrossel “números mais sorteados”.
5. **Suporte**: botão fixo “Falar no WhatsApp” (permanente no painel). 

### 3.3 Visual e Motion
- Basear paleta em tons escuros do app + dourados (#f7c948, #ffb347) para CTAs, badges e highlights.
- Inserir micro animações (shine em cartões, partículas ascendentes no hero, contagem regressiva animada). Permitir fallback leve se dispositivo for low-end (CSS prefers-reduced-motion).
- Landing externa (LP) recebe copy especial; app apenas reforça elementos críticos.

### 3.4 Features Paga + Adaptadas
| Feature | Alterações Evento | Consumo |
| --- | --- | --- |
| Gerar jogos IA | Texto enfatiza “3 jogos por consumo”, motion de bolas douradas | 20 moedas | 
| Regerar combinações | Mesmo fluxo, mas badge “Versão Mega” | 20 moedas |
| Análise manual IA | Mesma estrutura + insights extras sobre histórico Mega | 20 moedas |
| Variações IA | Estratégias exclusivas (ex: “Foco nas últimas dezenas vencedoras”) | 20 moedas |
| “Números históricos” | Novo card informativo (não consome saldo) com dados fornecidos por API ou dataset manual |

### 3.5 Paywall e Purchase Flow
- Mostrar CTA “Adicionar Moedas” fixo na sessão e em toasts quando saldo < 20.
- Ao tentar usar feature sem saldo: modal com resumo do pacote atual + botão de compra (não bloquear imediatamente; exibir link direto para checkout).

## 4. Fluxo de Compra e Gateway (Link.com)
1. Usuário clica em “Adicionar Moedas”.
2. Modal apresenta planos (100/1000). Se saldo atual < 20 e inviabiliza ação, já sugere pacote mínimo.
3. Clique → abre **checkout Link.com** embutido (iframe/modulo web) com pagamento cartão/pix. Sem parcelamento adicional.
4. Após confirmação, Link.com envia webhook -> Supabase Edge Function (nova) credita saldo e registra pedido.
5. Falhas: fallback offline silencioso (mostrar mensagem genérica, mas não travar UI).

## 5. Arquitetura Técnica
### 5.1 Backend (Supabase)
- **Nova tabela `mega_tokens`** (concept):
  - `user_id` (FK auth.users)
  - `balance` (integer)
  - `plan_type` (enum: limited, unlimited)
  - `expires_at` (timestamp)
  - `updated_at`
- **Tabela de ledger `mega_token_transactions`**:
  - `id`, `user_id`, `type` (purchase, consumption, adjustment)
  - `amount` (positivo créd/decr.)
  - `feature` (generate, manual_analysis, regenerate, variations)
  - `meta` JSON (contest, lotteryType, generationId...)
  - `created_at`
- Reaproveitar `generation_history`, `saved_games`, etc., apenas adicionando campo/flag `source_event = 'mega_virada'` quando necessário.
- Edge Function `link-purchase-webhook`:
  - Valida assinatura da Link.com
  - Identifica pacote (SKU 100 ou 1000 tokens)
  - Atualiza `mega_tokens` com upsert
  - Insere registro em ledger.

### 5.2 Frontend (Vite/React)
- Nova rota `src/pages/MegaEvent.tsx` reutilizando componentes (`Header`, `CreditsDisplay` adaptado para tokens).
- Hook `useMegaTokens` similar a `useUserCredits`, apontando para endpoints `/rest/v1/mega_tokens` e `/rpc/consume_mega_token`.
- Componentes novos:
  - `MegaHeroBanner`: hero do dashboard
  - `TokenWalletCard`: mostra saldo, CTA de compra
  - `MegaHistoryHighlights`: consome util `fetchMegaHistoricalStats()`
  - `MegaVariantCard`: variações exclusivas com copy do evento.
- Ajustar `RegenerateButton`, `Step4_AnalysisResult`, `ResultsDisplay` e `VariationsGrid` para aceitar `currency = 'megaToken'` (prop) e fazer fallback para créditos normais fora do evento.

### 5.3 APIs Externas
- Caixa Econômica (já usada) continua fonte oficial; se API falhar, usar mock/histórico sem alerta intrusivo.
- Link.com (checkout + webhook). Precisaremos de:
  - Endpoint front para iniciar checkout (obter `checkout_url`).
  - Endpoint backend para receber confirmação e atualizar saldo.

### 5.4 Jobs & Expiração
- Job (cron/edge) diário verifica `expires_at` e zera saldo após +7 dias do evento.
- Possível comando manual para estornar em caso de reembolso (pendente de definição). Registrar na documentação de suporte.

## 6. Dados e Telemetria
- Cada consumo (RPC `consume_mega_token`) grava log no ledger com metadata (timestamp, feature, contest, combos gerados). Serve para relatórios pós-evento.
- Sem integração BI neste ciclo; exportar via Supabase SQL se necessário.
- Métricas de sucesso monitoradas nos dashboards Link.com/Kirvano (venda, conversão, regeneração). Criar doc com queries recomendadas (futuro).

## 7. Conteúdo & Copywriting
- Apenas landing promocional recebe storytelling completo do prêmio. No app usamos microcopies: badges “R$ 850 milhões”, “Somente até 31/12”.
- Necessário produzir assets (motion hero, ícones dourados). Sem mascote oficial.
- Incluir seção “Histórico Mega da Virada” com dados levantados manualmente/CSV.

## 8. Suporte e Operação
- Botão “Suporte WhatsApp” visível na sessão Mega.
- Sem notificações push/email dedicadas neste ciclo.
- Sem feature flags complexas; liberar para todos os pagantes assim que homologado.
- Se sorteio adiar, bastará alterar copy manualmente (não há plano automático).

## 9. Backlog Técnico (alto nível)
### 9.1 Backend
1. Criar tabelas `mega_tokens`, `mega_token_transactions` + policies RLS.
2. RPC `consume_mega_token(user_id, feature)` que valida saldo, escala, grava ledger e retorna novo saldo.
3. Edge Function `link-webhook` para confirmar compras.
4. Scripts de expiração (cron) e estorno manual.

### 9.2 Frontend
1. Hero banner no dashboard (`MegaHeroBanner`).
2. Página `/mega-da-virada` com seções descritas (saldo, features, storytelling, suporte).
3. Adaptação dos fluxos de geração/análise para aceitar `currencyMode`. Ex.: `RegenerateButton` recebe `currency='mega'` e chama RPC correta.
4. Modal de compra com integração Link.com (abrir checkout + acompanhar status).
5. Componente `TokenWalletCard` e toasts específicos para saldo insuficiente.
6. Seção “Histórico Mega” (cards com dados). Fonte: API ou dataset manual.

### 9.3 Design & Conteúdo
- Criar kit visual dourado (botões, badges, backgrounds, motion). Sem guidelines adicionais.
- Copy hero/home, microtextos CTAs, e blocos informativos.
- Assets de motion (animação contagem regressiva, partículas) – sugerir Lottie ou CSS animado.

## 10. Riscos & Pendências
1. **Reembolsos/cancelamentos** sem definição – necessário alinhamento jurídico/financeiro.
2. **Dados históricos** dependem de API ou pesquisa manual – garantir fonte antes do design final.
3. **Integração Link.com**: confirmar documentação (webhook, checkout) e ambientes sandbox.
4. **Carga de IA**: nova oferta pode aumentar uso de geração/vib variações. Monitorar custos infra.
5. **Motion intenso** pode afetar performance mobile – considerar flag `prefers-reduced-motion`.

## 11. Próximos Passos Imediatos
1. Validar precificação final (100 x 1000 moedas) com time de negócios – definir valores em BRL.
2. Confirmar contrato e documentação técnica com Link.com (URLs, webhooks, autenticação).
3. Product/design sprint para telas hero + sessão exclusiva (com motion specs).
4. Backend: iniciar modelagem Supabase (tabelas + RPC + edge function).
5. Frontend: preparar feature flag simples (`isMegaEventEnabled`) para desenvolvimento isolado.
6. Planejar QA focado em fluxo de compra/saldo e consumo de tokens.

---
Documento gerado em `Docs/Mega_virada/mega_da_virada_event_plan.md`. Atualizar conforme decisões sobre reembolso e precificação final.

## 12. Plano de Implementação Passo a Passo

### Etapa 1 – Fundamentos de Produto e Design (Semana 1)
1. **Aprovar precificação final dos pacotes** (100/1000 moedas) e mensagens-chave com stakeholders.
2. **Briefing de design**: definir paleta dourada, motion guidelines e layout do hero banner.
3. **Wireframes + protótipo** da nova sessão `/mega-da-virada` (saldo, cards, storytelling, suporte).
4. **Inventário de conteúdo histórico** (números vencedores, curiosidades) e fonte de dados (API ou CSV).

### Etapa 2 – Infraestrutura Backend (Semanas 1-2)
1. Criar tabelas `mega_tokens` e `mega_token_transactions` com RLS e índices.
2. Implementar RPC `consume_mega_token(user_id, feature, meta)` retornando saldo atualizado.
3. Criar edge function `link-webhook` para processar notificações da Link.com e creditar saldo.
4. Adicionar job/cron de expiração (zera saldo +7 dias pós-evento) e endpoint manual para estornos.
5. Testar fluxo completo via Supabase Studio + mocks, garantindo registros no ledger.

### Etapa 3 – Integração Gateway Link.com (Semana 2)
1. Configurar credenciais sandbox, obter endpoints de checkout e webhook.
2. Desenvolver endpoint frontend para iniciar compra e receber `checkout_url`.
3. Registrar webhook no Link.com apontando para edge function, com validação de assinatura.
4. Executar testes ponta a ponta (compra → webhook → saldo → ledger) e documentar.

### Etapa 4 – Frontend: Sessão e Componentes (Semanas 2-3)
1. Implementar `MegaHeroBanner` no dashboard com CTA e contador.
2. Criar página `/mega-da-virada` com seções: saldo (`TokenWalletCard`), cards de features, storytelling histórico e botão suporte.
3. Desenvolver hooks `useMegaTokens`/`useConsumeMegaToken` e adaptar toasts para saldo insuficiente.
4. Implementar modal de compra integrado ao checkout Link.com (iframe ou nova aba) com feedback visual.

### Etapa 5 – Adaptação de Features Existentes (Semanas 3-4)
1. Atualizar `ResultsDisplay`, `RegenerateButton`, fluxos de análise manual e variações para aceitar prop `currencyMode`.
2. Ajustar backend das features para usar `consume_mega_token` quando `currencyMode = mega`.
3. Criar variantes de UI (badges Mega, textos exclusivos) e garantir fallback para créditos tradicionais fora do evento.
4. Incluir card “Histórico Mega da Virada” consumindo dados definidos na Etapa 1.

### Etapa 6 – QA, Observabilidade e Go-Live (Semana 4)
1. Bateria de testes manuais/automáticos: compra de tokens, consumo em cada feature, expiração simulada.
2. Configurar logs/alerts para edge function e RPC (falhas de webhook, saldo negativo, repetição de consumo).
3. Revisão final de copy e animações; validar performance mobile e fallback `prefers-reduced-motion`.
4. Atualizar documentação interna + runbook de suporte (contato WhatsApp, fluxos de estorno manual).
5. Liberar feature flag (se criada), monitorear KPIs nas primeiras 24h e registrar aprendizados.
