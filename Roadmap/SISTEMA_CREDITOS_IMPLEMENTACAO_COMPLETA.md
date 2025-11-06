# 🎯 Sistema de Créditos - Implementação Completa

**Data:** 2025-01-03
**Status:** 🚨 Análise Crítica + Plano de Ação
**Prioridade:** ALTA

---

## 📋 ÍNDICE

1. [Estado Atual](#1-estado-atual)
2. [Problemas Identificados](#2-problemas-identificados-crítica)
3. [Arquitetura Proposta](#3-arquitetura-proposta)
4. [Mapeamento de Features](#4-mapeamento-de-features-que-consomem-créditos)
5. [UX/UI - Pontos de Contato](#5-uxui---pontos-de-contato)
6. [Plano de Implementação](#6-plano-de-implementação)
7. [Migrações SQL](#7-migrações-sql-necessárias)
8. [Testes](#8-testes-necessários)

---

## 1. ESTADO ATUAL

### ✅ O QUE JÁ FUNCIONA

#### **A. Infraestrutura Base**
- ✅ Tabela `user_credits` com constraints corretos
- ✅ Função SQL `consume_credit()` atômica (lock FOR UPDATE)
- ✅ Edge Function `share-reward` que adiciona créditos
- ✅ Hook `useCreditsStatus` completo e funcional
- ✅ Componente `CreditsDisplay` com 3 variantes
- ✅ Popover educativo `CreditsInfoPopover`

#### **B. Features Funcionais**
1. **Regeneração de Jogos** - ✅ FUNCIONA
   - Consome 1 crédito corretamente
   - Validação de cooldown (10s)
   - Validação de créditos disponíveis
   - Toast de sucesso/erro
   - Atualização automática da UI

2. **Compartilhamento** - ✅ FUNCIONA
   - Concede +1 a +3 créditos
   - Limite de 3 shares/dia
   - Edge Function integrada
   - Toast de sucesso

3. **Feedback Detalhado** - ✅ FUNCIONA
   - Concede +1 crédito se > 50 chars
   - Limite de 5 feedbacks/dia
   - Edge Function integrada

### ❌ O QUE NÃO FUNCIONA / ESTÁ INCOMPLETO

1. **Primeira Geração (Análise Inicial)**
   - ❌ Usuário não entende que é GRATUITA
   - ❌ Sem mensagem clara de "Análise Gratuita"
   - ❌ Confusão: popover diz "Gerar Análise (1 crédito)"

2. **Variações de Jogos Manuais**
   - ❌ Popover lista "Gerar Variações (1 crédito)"
   - ❌ Código NÃO consome créditos
   - ❌ **INCONSISTÊNCIA CRÍTICA**

3. **Sistema de Reset**
   - ❌ Função SQL `reset_monthly_credits()` existe
   - ❌ Nenhum cron job ou schedule rodando
   - ❌ Reset manual via SQL não é sustentável

4. **UX/UI de Aviso de Consumo**
   - ❌ Nenhum modal de confirmação ao gerar variações
   - ❌ Sem preview de custo antes de ações
   - ❌ Sem mensagem de "X créditos serão consumidos"

5. **Tratamento de Erros**
   - ❌ Edge Function `share-reward` pode falhar silenciosamente
   - ❌ Sem retry em caso de falha de rede
   - ❌ Usuário não sabe se ganhou crédito ou não

---

## 2. PROBLEMAS IDENTIFICADOS (CRÍTICA)

### 🚨 CRÍTICOS (Bloqueadores)

#### **Problema 1: Inconsistência - Variações de Jogos**

**Descrição:**
- `CreditsInfoPopover` lista: "Gerar Variações (1 crédito)"
- `gameVariationsService.ts` **NÃO** chama `consumeCredit()`
- Usuário acredita que vai gastar crédito, mas não gasta

**Impacto:**
- ❌ Perda de confiança do usuário
- ❌ Confusão sobre sistema de créditos
- ❌ Expectativa quebrada

**Solução:**
- Implementar consumo de 1 crédito em `gameVariationsService`
- Adicionar modal de confirmação antes de gerar
- Validar créditos antes de iniciar geração

---

#### **Problema 2: Primeira Análise Confusa**

**Descrição:**
- Primeira geração ao abrir concurso é GRATUITA
- Popover diz "Gerar Análise (1 crédito)"
- Usuário não entende a diferença

**Impacto:**
- ❌ Usuário tem medo de clicar (acha que vai gastar)
- ❌ Reduz taxa de ativação
- ❌ UX negativa

**Solução:**
- Renomear "Gerar Análise" → "Análise Inicial (Gratuita)"
- Toast ao gerar: "✨ Análise inicial gratuita gerada!"
- Badge "GRATUITO" visível na primeira vez

---

#### **Problema 3: Reset Mensal Não Automático**

**Descrição:**
- Função `reset_monthly_credits()` existe
- Nenhum cron job configurado
- Créditos NÃO resetam automaticamente

**Impacto:**
- ❌ Sistema de créditos quebrado
- ❌ Usuários podem ficar sem créditos para sempre
- ❌ Violação da promessa "50 créditos/mês"

**Solução:**
- Edge Function schedulada (Supabase Cron)
- Rodar dia 1º de cada mês às 00:01 UTC
- Webhook de backup (Vercel Cron)

---

### ⚠️ IMPORTANTES (Melhorias UX)

#### **Problema 4: Falta de Confirmação de Custo**

**Descrição:**
- Regeneração mostra modal de confirmação ✅
- Variações **NÃO** mostram modal ❌
- Sem preview de custo em ações que consomem crédito

**Impacto:**
- ⚠️ Usuário pode gastar créditos sem querer
- ⚠️ Frustração ao descobrir que gastou

**Solução:**
- Modal de confirmação padronizado para TODAS as ações
- Mensagem clara: "Esta ação consumirá 1 crédito. Continuar?"
- Mostrar saldo atual e saldo após ação

---

#### **Problema 5: Erro Silencioso em Edge Functions**

**Descrição:**
- `share-reward` pode falhar (timeout, erro SQL, etc)
- Frontend apenas loga erro
- Usuário compartilha mas não ganha crédito

**Impacto:**
- ⚠️ Perda de confiança
- ⚠️ Usuário reclama que "não ganhou crédito"

**Solução:**
- Toast de erro se Edge Function falhar
- Retry automático (máximo 2 tentativas)
- Fallback: salvar em queue local (processar depois)

---

#### **Problema 6: Cooldown UX Pobre**

**Descrição:**
- Cooldown de 10s existe ✅
- Botão apenas desabilita, sem explicação
- Sem timer visível

**Impacto:**
- ⚠️ Usuário não entende por que botão está desabilitado
- ⚠️ Clica várias vezes frustrado

**Solução:**
- Mostrar countdown: "Aguarde 5s..."
- Tooltip explicativo
- Progress bar de cooldown

---

### 💡 NICE-TO-HAVE (Futuro)

#### **Problema 7: Sem Analytics de Uso**

**Descrição:**
- Não sabemos quantos créditos são consumidos/dia
- Não sabemos qual feature mais popular
- Sem dados para otimizar sistema

**Solução:**
- Event tracking em cada `consumeCredit()`
- Dashboard admin de uso de créditos
- Alertas se uso anormal

---

#### **Problema 8: Sem Sistema de Pacotes**

**Descrição:**
- Apenas 50 créditos fixos/mês
- Sem opção de comprar créditos extras
- Sem tiers (free, pro, premium)

**Solução:**
- Sistema de compra de pacotes
- Integração com Stripe/Hotmart
- Créditos extras não expiram

---

## 3. ARQUITETURA PROPOSTA

### 🏗️ VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  User Action │→ │ Confirm Modal│→ │ consumeCredit│      │
│  │              │  │ (Preview)    │  │  Hook        │      │
│  └──────────────┘  └──────────────┘  └───────┬──────┘      │
│                                               │              │
└───────────────────────────────────────────────┼──────────────┘
                                                │
                                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                           │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  consume_credit(user_id) SQL Function                │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ 1. Lock row (FOR UPDATE)                     │    │   │
│  │  │ 2. Validate cooldown (10s)                   │    │   │
│  │  │ 3. Validate credits_remaining > 0            │    │   │
│  │  │ 4. Decrement credits_remaining               │    │   │
│  │  │ 5. Update last_generation_at                 │    │   │
│  │  │ 6. Return { success, credits_remaining }     │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  share-reward Edge Function                          │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ 1. Validate auth                             │    │   │
│  │  │ 2. Fetch/Create user_credits                 │    │   │
│  │  │ 3. Increment credits_remaining & total       │    │   │
│  │  │ 4. Return new totals                         │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  reset-monthly-credits Edge Function (NOVO)          │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │ 1. Find users where last_reset_at < 30 days │    │   │
│  │  │ 2. Reset credits_remaining = credits_total   │    │   │
│  │  │ 3. Update last_reset_at = NOW()              │    │   │
│  │  │ 4. Log results                               │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Supabase Cron (NOVO)                                │   │
│  │  Every 1st of month at 00:01 UTC                     │   │
│  │  → Call reset-monthly-credits                        │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

### 🔄 FLUXO COMPLETO - CONSUMO DE CRÉDITO

```
1. User Action (Regenerar / Gerar Variações)
   │
   ▼
2. Frontend Validation (useCanRegenerate)
   ├─ Tem créditos? credits_remaining > 0
   ├─ Passou cooldown? last_generation_at + 10s < NOW()
   │
   ▼
3. Confirmation Modal (NOVO para variações)
   ├─ "Esta ação consumirá 1 crédito"
   ├─ "Saldo atual: 25 → 24 créditos"
   ├─ [Cancelar] [Confirmar]
   │
   ▼
4. User Confirms
   │
   ▼
5. consumeCredit(userId) - Frontend Hook
   │
   ▼
6. RPC call → consume_credit(user_id) - SQL Function
   │
   ▼
7. SQL Transaction:
   ├─ BEGIN
   ├─ SELECT * FROM user_credits WHERE user_id = $1 FOR UPDATE
   ├─ Validate cooldown
   ├─ Validate credits_remaining > 0
   ├─ UPDATE user_credits SET
   │    credits_remaining = credits_remaining - 1,
   │    last_generation_at = NOW()
   ├─ COMMIT
   │
   ▼
8. Return { success: true, credits_remaining: 24 }
   │
   ▼
9. Frontend:
   ├─ Execute action (generate combinations/variations)
   ├─ Save to database (generation_history/manual_game_variations)
   ├─ Invalidate React Query cache
   ├─ Toast: "✅ Gerado! 24 créditos restantes"
   │
   ▼
10. UI Updates Automatically (React Query refetch)
```

---

### 🎁 FLUXO COMPLETO - CONCESSÃO DE CRÉDITO

```
1. User Action (Share / Feedback)
   │
   ▼
2. Frontend Validation
   ├─ Share: Limite 3/dia (localStorage)
   ├─ Feedback: Limite 5/dia (SQL trigger)
   │
   ▼
3. Calculate Credits
   ├─ Share: 1-3 créditos (context-based)
   ├─ Feedback: 1 crédito (if > 50 chars)
   │
   ▼
4. Call Edge Function: share-reward
   POST /functions/v1/share-reward
   Body: { credits: 2 }
   │
   ▼
5. Edge Function:
   ├─ Validate auth.user()
   ├─ Fetch/Create user_credits
   ├─ UPDATE user_credits SET
   │    credits_remaining = credits_remaining + 2,
   │    credits_total = credits_total + 2
   ├─ Return { credits_remaining, credits_total }
   │
   ▼
6. Frontend:
   ├─ Toast: "🎉 Você ganhou +2 créditos!"
   ├─ Confetti animation
   ├─ Invalidate React Query cache
   │
   ▼
7. UI Updates (React Query refetch)
```

---

## 4. MAPEAMENTO DE FEATURES QUE CONSOMEM CRÉDITOS

### 📊 TABELA COMPLETA

| Feature | Créditos | Status Atual | Precisa Implementar | Prioridade |
|---------|----------|--------------|---------------------|------------|
| **Primeira Análise** (ao abrir concurso) | **0 (GRATUITA)** | ✅ Funciona | ⚠️ UX confusa | ALTA |
| **Regeneração de Jogos** | **-1** | ✅ Funciona | - | - |
| **Gerar Variações** (jogo manual) | **-1** | ❌ Não consome | ✅ Implementar | CRÍTICA |
| **Compartilhamento** | **+1 a +3** | ✅ Funciona | - | - |
| **Feedback Detalhado** | **+1** | ✅ Funciona | - | - |
| **Salvar Jogo** | **0 (GRATUITA)** | ✅ Funciona | - | - |
| **Criar Jogo Manual** | **0 (GRATUITA)** | ✅ Funciona | - | - |
| **Exportar Jogo** | **0 (GRATUITA)** | ✅ Funciona | - | - |

---

### 🎯 FEATURES QUE DEVEM CONSUMIR CRÉDITOS

#### **1. Regeneração de Jogos** - ✅ JÁ IMPLEMENTADO

**Onde:** `Lottery.tsx` → `RegenerateButton.tsx`

**Fluxo atual:**
1. Usuário vê análise inicial (gratuita)
2. Clica "Gerar Novamente"
3. Modal de confirmação aparece
4. Confirma → Consome 1 crédito
5. Gera 10 novas combinações
6. Toast: "10 combinações geradas! X créditos restantes"

**UX/UI:**
- ✅ Modal de confirmação
- ✅ Preview de saldo
- ✅ Toast de sucesso
- ✅ Cooldown visível (10s)

**Nada a fazer aqui - PERFEITO!**

---

#### **2. Gerar Variações** (Jogo Manual) - ❌ NÃO IMPLEMENTADO

**Onde:** `ManualGameCreationPage.tsx` → `Step4_AnalysisResult.tsx`

**Fluxo atual (ERRADO):**
1. Usuário cria jogo manual (15 números)
2. Vê análise (score, hot/cold, etc)
3. Clica "Gerar 5 Variações"
4. **GERA IMEDIATAMENTE** (sem confirmação)
5. **NÃO CONSOME CRÉDITO** ❌
6. Toast: "5 variações geradas!"

**Fluxo proposto (CORRETO):**
1. Usuário cria jogo manual
2. Vê análise
3. Clica "Gerar 5 Variações"
4. **Modal de confirmação aparece:**
   ```
   ┌────────────────────────────────────────┐
   │ Gerar 5 Variações?                     │
   │                                        │
   │ Esta ação consumirá 1 crédito.         │
   │                                        │
   │ Saldo atual: 25 créditos               │
   │ Após ação: 24 créditos                 │
   │                                        │
   │ [Cancelar] [Gerar Variações]           │
   └────────────────────────────────────────┘
   ```
5. Confirma → `consumeCredit(userId)`
6. Se sucesso → Gera 5 variações
7. Toast: "✅ 5 variações geradas! 24 créditos restantes"

**Implementação necessária:**
- ✅ Adicionar `consumeCredit()` em `gameVariationsService`
- ✅ Modal de confirmação (criar componente reutilizável)
- ✅ Validação de créditos antes de gerar
- ✅ Toast de sucesso com saldo atualizado

---

### 🆓 FEATURES GRATUITAS (NÃO CONSOMEM)

#### **1. Primeira Análise** (ao abrir concurso)

**Onde:** `Lottery.tsx` → `useLotteryAnalysis`

**Funcionamento:**
- Ao abrir concurso pela primeira vez
- Gera 10 combinações automaticamente
- Salva em `lottery_analyses` (cache)
- **Gratuito** (não chama `consumeCredit`)

**Problema atual:**
- ❌ Popover diz "Gerar Análise (1 crédito)"
- ❌ Usuário confunde com regeneração

**Solução:**
- Renomear no popover: "Análise Inicial (Gratuita)"
- Toast ao gerar: "✨ Análise inicial gratuita gerada!"
- Badge "GRATUITO" visível

---

#### **2. Criar Jogo Manual**

**Onde:** `ManualGameCreationPage.tsx`

**Funcionamento:**
- Usuário seleciona números manualmente
- Clica "Analisar"
- Gera análise (score, hot/cold, etc)
- **Gratuito** (não consome crédito)

**OK - Nada a fazer**

---

#### **3. Salvar Jogo**

**Onde:** `SaveToggleButton.tsx`

**Funcionamento:**
- Usuário salva jogo em "Meus Jogos"
- Limite: 50 jogos
- **Gratuito** (não consome crédito)

**OK - Nada a fazer**

---

## 5. UX/UI - PONTOS DE CONTATO

### 📍 ONDE O USUÁRIO VÊ/USA CRÉDITOS

#### **1. Header (Badge Permanente)**

**Localização:** Sempre visível (todas as páginas)

**Estado atual:**
```tsx
<CreditsDisplay userId={userId} variant="badge" />
```

**Funcionalidade:**
- Badge verde com número de créditos
- Clica → Abre `CreditsInfoPopover`
- Popover mostra:
  - Créditos restantes
  - Progresso mensal
  - Data do próximo reset
  - Como ganhar/usar créditos

**Problemas:**
- ❌ Popover lista "Gerar Análise (1 crédito)" - INCORRETO
- ❌ Popover diz "Gerar Variações (1 crédito)" mas não consome

**Solução:**
1. Atualizar texto:
   - "Análise Inicial (Gratuita)"
   - "Regenerar Jogos (1 crédito)"
   - "Gerar Variações (1 crédito)" ← manter, mas implementar consumo

2. Adicionar seção "Gratuito":
   ```
   ✅ Criar jogos manualmente
   ✅ Salvar até 50 jogos
   ✅ Exportar jogos
   ✅ Primeira análise de cada concurso
   ```

---

#### **2. Lottery.tsx (Sidebar)**

**Localização:** Página principal de análise

**Estado atual:**
```tsx
<CreditsDisplay
  userId={userId}
  variant="default"
  showProgress={true}
  showResetInfo={true}
/>
```

**Funcionalidade:**
- Card completo com progresso
- Mostra dias até reset
- Tooltip com informações

**OK - Funciona perfeitamente**

---

#### **3. RegenerateButton (Modal de Confirmação)**

**Localização:** `Lottery.tsx` (botão "Gerar Novamente")

**Estado atual:**
```tsx
<AlertDialog>
  <AlertDialogTitle>Regenerar Combinações?</AlertDialogTitle>
  <AlertDialogDescription>
    Esta ação consumirá 1 crédito.
    Você possui {creditsRemaining} créditos disponíveis.
  </AlertDialogDescription>
</AlertDialog>
```

**Funcionalidade:**
- ✅ Modal de confirmação
- ✅ Mostra saldo atual
- ✅ Botão desabilitado se sem créditos
- ✅ Cooldown visível (10s)

**OK - REFERÊNCIA PERFEITA**

---

#### **4. Botão "Gerar Variações" - ❌ SEM CONFIRMAÇÃO**

**Localização:** `Step4_AnalysisResult.tsx` (análise de jogo manual)

**Estado atual:**
```tsx
<Button onClick={onGenerateVariations}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Gerar 5 Variações
</Button>
```

**Problema:**
- ❌ Clica e gera imediatamente
- ❌ Nenhum aviso de consumo de crédito
- ❌ Não consome crédito (mas deveria)

**Solução:**
1. Criar modal de confirmação (similar ao RegenerateButton)
2. Validar créditos antes de abrir modal
3. Consumir crédito ao confirmar
4. Toast de sucesso com saldo

**Componente proposto:**
```tsx
<ConsumeCreditsConfirmation
  title="Gerar 5 Variações?"
  description="Esta ação consumirá 1 crédito."
  creditsRemaining={creditsRemaining}
  onConfirm={handleGenerateVariations}
/>
```

---

#### **5. Toasts de Feedback**

**Situações:**

**A. Sucesso ao consumir:**
```
✅ 10 combinações geradas!
24 créditos restantes
```

**B. Erro - Sem créditos:**
```
❌ Créditos insuficientes
Você precisa de 1 crédito. Saldo: 0

[Compartilhar para ganhar créditos]
```

**C. Erro - Cooldown:**
```
⏳ Aguarde 5 segundos
Você pode regenerar novamente em breve.
```

**D. Sucesso ao ganhar:**
```
🎉 Você ganhou +2 créditos!
Novo saldo: 27 créditos
```

---

#### **6. Estados de Botão**

**Regenerar / Gerar Variações:**

**A. Normal (pode usar):**
```tsx
<Button variant="default">
  <RefreshCw className="h-4 w-4 mr-2" />
  Gerar Novamente
</Button>
```

**B. Sem créditos:**
```tsx
<Button variant="outline" disabled>
  <AlertCircle className="h-4 w-4 mr-2" />
  Sem créditos
</Button>
```

**C. Cooldown (X segundos):**
```tsx
<Button variant="outline" disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Aguarde {cooldownSeconds}s
</Button>
```

**D. Gerando (loading):**
```tsx
<Button variant="default" disabled>
  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
  Gerando...
</Button>
```

---

## 6. PLANO DE IMPLEMENTAÇÃO

### 🎯 FASE 1: CORREÇÕES CRÍTICAS (4-5h)

#### **Task 1.1: Criar Componente de Confirmação Reutilizável**
**Tempo:** 1h

**Arquivo:** `src/components/ConsumeCreditsConfirmation.tsx`

**Props:**
```typescript
interface ConsumeCreditsConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  creditsRequired: number;
  creditsRemaining: number;
  onConfirm: () => void;
  isLoading?: boolean;
}
```

**Funcionalidade:**
- AlertDialog com preview de saldo
- "Saldo atual: X → Y créditos"
- Botão desabilitado se sem créditos
- Loading state

**Uso:**
```tsx
<ConsumeCreditsConfirmation
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  title="Gerar 5 Variações?"
  description="Esta ação consumirá 1 crédito."
  creditsRequired={1}
  creditsRemaining={creditsRemaining}
  onConfirm={handleGenerateVariations}
  isLoading={isGenerating}
/>
```

---

#### **Task 1.2: Implementar Consumo em Variações**
**Tempo:** 2h

**Arquivos modificados:**
- `src/services/gameVariationsService.ts`
- `src/components/Step4_AnalysisResult.tsx`

**Mudanças em `gameVariationsService.ts`:**

**ANTES:**
```typescript
export async function generateVariations(params) {
  // Gera variações
  // Salva no banco
  // Retorna resultado
}
```

**DEPOIS:**
```typescript
import { consumeCredit } from './creditsService';

export async function generateVariations(params) {
  // 1. CONSUMIR CRÉDITO PRIMEIRO
  const creditResult = await consumeCredit(params.userId);

  if (!creditResult.success) {
    return {
      success: false,
      error: creditResult.message,
      creditsRemaining: creditResult.credits_remaining
    };
  }

  try {
    // 2. Gera variações
    const variations = await generateVariationsLogic(params);

    // 3. Salva no banco
    await saveVariations(variations);

    // 4. Retorna sucesso
    return {
      success: true,
      data: variations,
      creditsRemaining: creditResult.credits_remaining
    };
  } catch (error) {
    // Se falhar, REVERTER crédito?
    // (Decisão: NÃO - evitar race conditions)
    throw error;
  }
}
```

**Mudanças em `Step4_AnalysisResult.tsx`:**

**Adicionar:**
1. Estado de confirmação
2. Hook `useCreditsStatus`
3. Modal de confirmação
4. Validação antes de abrir modal
5. Toast com saldo atualizado

---

#### **Task 1.3: Atualizar CreditsInfoPopover**
**Tempo:** 30min

**Arquivo:** `src/components/CreditsInfoPopover.tsx`

**Mudanças:**

**ANTES:**
```typescript
Como usar seus créditos:
• Gerar Análise (1 crédito)
• Regenerar Jogos (1 crédito)
• Gerar Variações (1 crédito)
```

**DEPOIS:**
```typescript
Como usar seus créditos:
• Regenerar Jogos (1 crédito)
• Gerar Variações de jogo manual (1 crédito)

Funcionalidades gratuitas:
✅ Análise inicial de cada concurso
✅ Criar jogos manualmente
✅ Salvar até 50 jogos
✅ Exportar jogos em TXT
```

---

#### **Task 1.4: Reset Automático - Edge Function**
**Tempo:** 1h 30min

**Arquivo:** `supabase/functions/reset-monthly-credits/index.ts`

**Código:**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Chamar função SQL
    const { data, error } = await supabase.rpc('reset_monthly_credits');

    if (error) throw error;

    console.log('✅ Reset mensal concluído:', data);

    return new Response(
      JSON.stringify({ success: true, resetCount: data.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erro no reset:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Configurar Cron:**
- Supabase Dashboard → Edge Functions → Cron
- Schedule: `0 0 1 * *` (dia 1º de cada mês, 00:00 UTC)
- Endpoint: `reset-monthly-credits`

**Alternativa (Vercel Cron):**
```typescript
// pages/api/cron/reset-credits.ts
export default async function handler(req, res) {
  // Validar cron secret
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Chamar Edge Function
  const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/reset-monthly-credits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
    }
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

**Configurar Vercel Cron:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/reset-credits",
    "schedule": "0 0 1 * *"
  }]
}
```

---

### 🎯 FASE 2: MELHORIAS UX (2-3h)

#### **Task 2.1: Toast Personalizado ao Ganhar Créditos**
**Tempo:** 30min

**Arquivo:** `src/components/ShareButton.tsx`, `src/services/feedbackService.ts`

**Mudança:**

**ANTES:**
```typescript
toast({
  title: '🎉 Compartilhado com sucesso!',
  description: `Você ganhou +${credits} créditos!`
});
```

**DEPOIS:**
```typescript
toast({
  title: '🎉 Compartilhado com sucesso!',
  description: `Você ganhou +${credits} créditos! Novo saldo: ${newBalance}`,
  action: (
    <Button
      size="sm"
      variant="outline"
      onClick={() => navigate('/criar-jogo')}
    >
      Usar créditos
    </Button>
  )
});
```

---

#### **Task 2.2: Cooldown Countdown Visual**
**Tempo:** 1h

**Arquivo:** `src/components/RegenerateButton.tsx`

**Adicionar:**
```tsx
{cooldownSeconds > 0 && (
  <div className="flex items-center gap-2 mt-2">
    <Progress value={(10 - cooldownSeconds) / 10 * 100} className="w-full" />
    <span className="text-xs text-muted-foreground">{cooldownSeconds}s</span>
  </div>
)}
```

---

#### **Task 2.3: Badge "GRATUITO" na Primeira Análise**
**Tempo:** 30min

**Arquivo:** `src/pages/Lottery.tsx`

**Adicionar:**
```tsx
{isFirstLoad && (
  <Badge className="absolute top-2 right-2 bg-green-500">
    ANÁLISE GRATUITA
  </Badge>
)}
```

---

#### **Task 2.4: Retry em Edge Function**
**Tempo:** 1h

**Arquivo:** `src/services/creditsService.ts`

**Adicionar helper:**
```typescript
async function callEdgeFunctionWithRetry(
  functionName: string,
  body: any,
  maxRetries = 2
) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      lastError = error;
      console.warn(`Tentativa ${attempt + 1} falhou:`, error);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      }
    }
  }

  return { success: false, error: lastError };
}
```

**Usar em:**
- `ShareButton.tsx` ao chamar `share-reward`
- `feedbackService.ts` ao chamar `share-reward`

---

### 🎯 FASE 3: ANALYTICS & MONITORING (1-2h)

#### **Task 3.1: Event Tracking**
**Tempo:** 1h

**Adicionar em `creditsService.ts`:**
```typescript
// Após consumeCredit bem-sucedido
analytics.track('credit_consumed', {
  user_id: userId,
  credits_remaining: result.credits_remaining,
  action: 'regenerate' // ou 'generate_variations'
});

// Após ganhar créditos
analytics.track('credit_earned', {
  user_id: userId,
  credits_earned: credits,
  source: 'share', // ou 'feedback'
  new_balance: newBalance
});
```

---

#### **Task 3.2: Dashboard Admin (Opcional)**
**Tempo:** 2h+ (FUTURO)

**Queries úteis:**
```sql
-- Uso diário de créditos
SELECT
  DATE(last_generation_at) AS date,
  COUNT(*) AS generations,
  COUNT(DISTINCT user_id) AS unique_users
FROM user_credits
WHERE last_generation_at > NOW() - INTERVAL '30 days'
GROUP BY date
ORDER BY date DESC;

-- Distribuição de créditos
SELECT
  CASE
    WHEN credits_remaining = 0 THEN '0'
    WHEN credits_remaining <= 10 THEN '1-10'
    WHEN credits_remaining <= 25 THEN '11-25'
    WHEN credits_remaining <= 50 THEN '26-50'
    ELSE '50+'
  END AS bucket,
  COUNT(*) AS users
FROM user_credits
GROUP BY bucket;
```

---

## 7. MIGRAÇÕES SQL NECESSÁRIAS

### ✅ JÁ EXISTENTES (OK)

```sql
-- user_credits table
-- consume_credit function
-- reset_monthly_credits function
```

### 🆕 NOVAS (SE NECESSÁRIO)

#### **Adicionar índice para reset**
```sql
CREATE INDEX idx_user_credits_last_reset
ON user_credits(last_reset_at);
```

#### **Adicionar trigger de analytics (opcional)**
```sql
CREATE TABLE credit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT CHECK (event_type IN ('consume', 'earn', 'reset')),
  credits_delta INTEGER, -- Positivo para ganhar, negativo para consumir
  credits_remaining INTEGER,
  source TEXT, -- 'regenerate', 'variations', 'share', 'feedback', 'reset'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_credit_events_user_id ON credit_events(user_id);
CREATE INDEX idx_credit_events_created_at ON credit_events(created_at);
```

---

## 8. TESTES NECESSÁRIOS

### ✅ TESTES UNITÁRIOS

#### **creditsService.ts**
```typescript
describe('consumeCredit', () => {
  it('deve consumir 1 crédito com sucesso', async () => {
    const result = await consumeCredit(testUserId);
    expect(result.success).toBe(true);
    expect(result.credits_remaining).toBe(49);
  });

  it('deve falhar se sem créditos', async () => {
    // Zerar créditos do usuário
    const result = await consumeCredit(testUserId);
    expect(result.success).toBe(false);
    expect(result.message).toContain('insuficientes');
  });

  it('deve respeitar cooldown de 10s', async () => {
    await consumeCredit(testUserId);
    const result = await consumeCredit(testUserId);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Aguarde');
  });
});
```

---

### ✅ TESTES DE INTEGRAÇÃO

#### **Regeneração completa**
```typescript
describe('Regeneração de jogos', () => {
  it('deve consumir crédito e gerar combinações', async () => {
    const { result } = renderHook(() => useRegenerateCombinations());

    await act(async () => {
      await result.current.regenerateAsync({
        userId: testUserId,
        lotteryType: 'lotofacil',
        contestNumber: 3200
      });
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data.creditsRemaining).toBe(49);
  });
});
```

---

#### **Gerar variações (NOVO)**
```typescript
describe('Gerar variações', () => {
  it('deve consumir 1 crédito', async () => {
    const result = await generateVariations({
      userId: testUserId,
      originalNumbers: [1, 2, 3, 4, 5],
      lotteryType: 'lotofacil'
    });

    expect(result.success).toBe(true);
    expect(result.creditsRemaining).toBe(49);
  });

  it('deve falhar se sem créditos', async () => {
    // Zerar créditos
    const result = await generateVariations({...});
    expect(result.success).toBe(false);
  });
});
```

---

### ✅ TESTES E2E (Playwright)

```typescript
test('Fluxo completo de créditos', async ({ page }) => {
  // 1. Login
  await page.goto('/auth');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.click('button:has-text("Entrar")');

  // 2. Ver badge de créditos no header
  await expect(page.locator('[data-testid="credits-badge"]')).toContainText('50');

  // 3. Gerar análise (gratuita)
  await page.goto('/lottery/lotofacil/3200');
  await expect(page.locator('[data-testid="credits-badge"]')).toContainText('50');

  // 4. Regenerar (consome 1 crédito)
  await page.click('button:has-text("Gerar Novamente")');
  await page.click('button:has-text("Confirmar")');
  await expect(page.locator('[data-testid="credits-badge"]')).toContainText('49');

  // 5. Compartilhar (ganha 2 créditos)
  await page.click('button:has-text("Compartilhar")');
  // ... simular share
  await expect(page.locator('[data-testid="credits-badge"]')).toContainText('51');
});
```

---

## 9. CHECKLIST FINAL

### ✅ ANTES DO DEPLOY

- [ ] Componente `ConsumeCreditsConfirmation` criado
- [ ] Consumo de crédito em variações implementado
- [ ] `CreditsInfoPopover` atualizado (textos corrigidos)
- [ ] Edge Function `reset-monthly-credits` criada
- [ ] Cron job configurado (Supabase ou Vercel)
- [ ] Toasts personalizados implementados
- [ ] Cooldown countdown visual adicionado
- [ ] Badge "GRATUITO" na primeira análise
- [ ] Retry em Edge Functions implementado
- [ ] Event tracking adicionado
- [ ] Testes unitários passando
- [ ] Testes E2E passando
- [ ] Build sem erros
- [ ] Documentação atualizada

### ✅ PÓS-DEPLOY

- [ ] Monitorar logs de `consume_credit` (primeiras 24h)
- [ ] Verificar se reset automático rodou (dia 1º)
- [ ] Checar se Edge Function tem erros
- [ ] Monitorar analytics de uso de créditos
- [ ] Coletar feedback de usuários sobre UX
- [ ] A/B test: mensagens de toast diferentes

---

## 10. ESTIMATIVA DE TEMPO TOTAL

| Fase | Tarefas | Tempo |
|------|---------|-------|
| **Fase 1: Críticas** | Confirmação + Variações + Popover + Reset | 4-5h |
| **Fase 2: UX** | Toasts + Cooldown + Badge + Retry | 2-3h |
| **Fase 3: Analytics** | Tracking + Dashboard | 1-2h |
| **Testes** | Unit + E2E | 2h |
| **Total** | | **9-12h** |

---

## 11. PRIORIZAÇÃO RECOMENDADA

### 🔴 ALTA PRIORIDADE (FAZER AGORA)
1. Task 1.1: Componente de confirmação
2. Task 1.2: Consumo em variações
3. Task 1.3: Atualizar popover
4. Task 1.4: Reset automático

### 🟡 MÉDIA PRIORIDADE (FAZER EM SEGUIDA)
5. Task 2.1: Toast personalizado
6. Task 2.2: Cooldown visual
7. Task 2.3: Badge gratuito
8. Task 2.4: Retry

### 🟢 BAIXA PRIORIDADE (FUTURO)
9. Task 3.1: Event tracking
10. Task 3.2: Dashboard admin

---

## 12. RISCOS E MITIGAÇÕES

### ⚠️ RISCO 1: Reset Automático Falhar

**Cenário:** Cron job não roda ou Edge Function falha

**Impacto:** Usuários ficam sem créditos

**Mitigação:**
- Duplo cron (Supabase + Vercel)
- Alertas de monitoramento
- Reset manual via SQL como backup

---

### ⚠️ RISCO 2: Race Condition em Consumo

**Cenário:** Usuário clica 2x rapidamente em "Gerar Variações"

**Impacto:** Consome 2 créditos em vez de 1

**Mitigação:**
- Desabilitar botão ao clicar (loading state)
- Cooldown de 10s (já existe)
- Lock otimista no SQL (FOR UPDATE)

---

### ⚠️ RISCO 3: Edge Function Timeout

**Cenário:** `share-reward` demora >10s e dá timeout

**Impacto:** Usuário compartilha mas não ganha crédito

**Mitigação:**
- Retry automático (Task 2.4)
- Toast de erro claro
- Queue offline (futuro)

---

## 13. CONCLUSÃO

### 📊 SITUAÇÃO ATUAL

**O que funciona:**
- ✅ Regeneração de jogos (perfeito)
- ✅ Compartilhamento (perfeito)
- ✅ Feedback (perfeito)
- ✅ Display de créditos (perfeito)

**O que está quebrado/incompleto:**
- ❌ Variações não consomem crédito
- ❌ UX confusa (primeira análise)
- ❌ Reset automático não roda
- ❌ Falta confirmação em variações

**Impacto no usuário:**
- ⚠️ Confusão sobre o que consome crédito
- ⚠️ Perda de confiança (inconsistências)
- ⚠️ Sistema pode quebrar no reset

### 🎯 RECOMENDAÇÃO FINAL

**IMPLEMENTAR FASE 1 IMEDIATAMENTE** (4-5h):
1. Componente de confirmação reutilizável
2. Consumo em variações
3. Atualizar popover
4. Reset automático

**Depois, implementar Fase 2** (2-3h) para melhorar UX.

**Fase 3 pode esperar** (analytics não é crítico).

---

**Total de trabalho crítico:** ~7h
**ROI:** Sistema de créditos funcionando 100% + UX clara

---

**Próxima ação:** Aprovar plano e começar implementação?
