# 🔄 FASE 1: REGENERAÇÃO DE COMBINAÇÕES - ESPECIFICAÇÃO TÉCNICA
**Data:** 2025-01-03
**Prioridade:** Alta (Implementar primeiro)
**Estimativa:** 42 horas (~5-6 dias)
**Status:** Aprovado para Implementação

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Decisões Consolidadas](#decisões-consolidadas)
3. [Arquitetura de Dados](#arquitetura-de-dados)
4. [Backend Implementation](#backend-implementation)
5. [Services & Hooks](#services--hooks)
6. [UI Components](#ui-components)
7. [Fluxos de Usuário](#fluxos-de-usuário)
8. [Checklist de Implementação](#checklist-de-implementação)

---

## 1. RESUMO EXECUTIVO

### 🎯 Objetivo
Permitir que usuários regenerem combinações de jogos para o mesmo concurso, preservando histórico e implementando sistema de créditos para evitar abuso.

### ✅ Decisões Finais do Stakeholder

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| **Estratégia de Cache** | Opção B (Histórico) | Preserva gerações, usuário navega entre últimas 3 |
| **Sistema de Limites** | 50 créditos/mês + cooldown 10s | Previne abuso + spam técnico |
| **Interface** | Botão no topo | Regenera todos 10 jogos de uma vez |
| **Loading** | Fade-in/out (Opção C) | Mais fluido e fácil de implementar |
| **Notificação** | Toast simples | Menos intrusivo |
| **Histórico** | Salvar tudo + últimas 3 visíveis | Acesso rápido às gerações recentes |
| **Navegação** | Modal ou página separada | Últimas 3 diretas, histórico completo em modal |

### 📊 Impacto nos Dados

**Nova Tabela:**
- `generation_history` (histórico de todas regenerações)
- `user_credits` (sistema de créditos)

**Modificações:**
- `lottery_analyses` permanece INALTERADA (cache atual)

### 🔑 Features Principais

1. ✅ Botão "Gerar Novamente"
2. ✅ Modal de confirmação
3. ✅ Sistema de créditos (50/mês)
4. ✅ Cooldown de 10 segundos
5. ✅ Histórico preservado (todas gerações)
6. ✅ Navegação entre últimas 3 gerações
7. ✅ Badge/contador de créditos restantes
8. ✅ Fade-in/out ao regenerar
9. ✅ Toast notification

---

## 2. DECISÕES CONSOLIDADAS

### 2.1 Navegação Entre Gerações

**Problema Resolvido:** "3 opções geradas" significa **últimas 3 gerações ficam visíveis diretamente**.

**Implementação:**

```
┌────────────────────────────────────────────────┐
│ [< Voltar]  Mega-Sena - Concurso 2750          │
│                                                │
│ [🔄 Gerar Novamente (45 créditos)]             │ ← Badge com créditos
├────────────────────────────────────────────────┤
│ Gerações: [1 (Atual)] [2] [3] [📜 Ver Todas]  │ ← Últimas 3 + botão histórico
│                       ↑ Click troca geração    │
├────────────────────────────────────────────────┤
│ 📊 Estatísticas (Geração 1)                    │
│ Acurácia: 89% | Sorteios: 100                  │
│ Quentes: 05 12 18 23 34 45 51 58              │
│ Frios: 02 07 13 28 39 52 55 60                │
├────────────────────────────────────────────────┤
│ 🎲 Jogos Gerados (10)                          │
│                                                │
│ Jogo 1  [05][12][23][34][45][58]  [☆Salvar]   │
│ Jogo 2  [03][18][27][39][41][52]  [☆Salvar]   │
│ ...                                            │
└────────────────────────────────────────────────┘

[Click "Ver Todas"] →

┌────────────────────────────────────────────────┐
│ 📜 Histórico de Gerações - Mega-Sena 2750      │
│                                                │
│ [Fechar X]                                     │
├────────────────────────────────────────────────┤
│ ○ Geração 1  (há 2 horas)   Acurácia: 89%     │ ← Ativa
│ ○ Geração 2  (há 5 horas)   Acurácia: 92%     │
│ ○ Geração 3  (há 1 dia)     Acurácia: 87%     │
│ ○ Geração 4  (há 2 dias)    Acurácia: 91%     │
│ ...                                            │
│ ○ Geração 15 (há 1 semana)  Acurácia: 88%     │
│                                                │
│ [Selecionar] [Deletar]                         │
└────────────────────────────────────────────────┘
```

**Lógica:**
- Default: Mostra geração mais recente (is_active = true)
- Últimas 3 gerações sempre visíveis
- Click em [2] ou [3] → troca visualização
- Click em "Ver Todas" → modal com lista completa
- Click em geração no modal → define como ativa

### 2.2 Sistema Duplo de Limites

**Decisão Final: Opção 2 (Créditos + Cooldown)**

**Implementação:**

```typescript
// Validação ao clicar "Gerar Novamente"
async function validateRegenerationLimits(userId: string): Promise<{
  canRegenerate: boolean;
  reason?: string;
  creditsRemaining?: number;
  cooldownRemaining?: number;
}> {
  // 1. Verificar créditos
  const credits = await getUserCredits(userId);
  if (credits.credits_remaining <= 0) {
    return {
      canRegenerate: false,
      reason: 'Você atingiu o limite de 50 gerações mensais.',
      creditsRemaining: 0
    };
  }

  // 2. Verificar cooldown
  const lastGeneration = credits.last_generation_at;
  if (lastGeneration) {
    const secondsSinceLastGen = (Date.now() - lastGeneration.getTime()) / 1000;
    if (secondsSinceLastGen < 10) {
      return {
        canRegenerate: false,
        reason: `Aguarde ${Math.ceil(10 - secondsSinceLastGen)} segundos.`,
        cooldownRemaining: 10 - secondsSinceLastGen
      };
    }
  }

  // 3. OK para regenerar
  return {
    canRegenerate: true,
    creditsRemaining: credits.credits_remaining - 1
  };
}
```

**UI de Feedback:**

```
❌ Limite atingido
Você atingiu o limite de 50 gerações mensais.
Seus créditos serão renovados em 15 dias.

[OK]
```

```
⏳ Aguarde 7 segundos
Você pode gerar novamente em alguns segundos.

[Cancelar]
```

---

## 3. ARQUITETURA DE DADOS

### 3.1 Tabela: `generation_history`

```sql
-- ============================================
-- TABELA: generation_history
-- Armazena TODAS as regenerações do usuário
-- ============================================
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,

  -- Apenas 'balanced' (sem estratégias por enquanto)
  strategy_type TEXT NOT NULL DEFAULT 'balanced',

  -- Dados da geração (10 jogos)
  generated_numbers JSONB NOT NULL,  -- [[5,12,23,34,45,58], [3,18,27...], ...]
  hot_numbers INTEGER[] NOT NULL,
  cold_numbers INTEGER[] NOT NULL,
  accuracy_rate NUMERIC(5,2) NOT NULL,
  draws_analyzed INTEGER NOT NULL,

  -- Timestamps
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Controle de geração ativa
  is_active BOOLEAN DEFAULT FALSE,  -- Apenas 1 geração ativa por contest

  -- Indexes
  CONSTRAINT idx_history_user_lottery
    CREATE INDEX ON generation_history (user_id, lottery_type, contest_number, generated_at DESC),

  CONSTRAINT idx_history_active
    CREATE INDEX ON generation_history (user_id, lottery_type, contest_number)
    WHERE is_active = true
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON generation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"  -- Para marcar is_active
  ON generation_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Cleanup automático (3 meses)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_generations()
RETURNS TRIGGER AS $$
BEGIN
  -- Deletar gerações antigas (mantém ativa sempre)
  DELETE FROM generation_history
  WHERE user_id = NEW.user_id
    AND generated_at < NOW() - INTERVAL '3 months'
    AND is_active = false;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_generations
  AFTER INSERT ON generation_history
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_generations();

-- ============================================
-- FUNÇÃO: Marcar geração como ativa
-- ============================================
CREATE OR REPLACE FUNCTION set_active_generation(
  p_user_id UUID,
  p_lottery_type TEXT,
  p_contest_number INTEGER,
  p_generation_id UUID
)
RETURNS void AS $$
BEGIN
  -- Desmarcar todas as gerações do concurso
  UPDATE generation_history
  SET is_active = false
  WHERE user_id = p_user_id
    AND lottery_type = p_lottery_type
    AND contest_number = p_contest_number;

  -- Marcar a geração escolhida como ativa
  UPDATE generation_history
  SET is_active = true
  WHERE id = p_generation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3.2 Tabela: `user_credits`

```sql
-- ============================================
-- TABELA: user_credits
-- Sistema de créditos para regeneração
-- ============================================
CREATE TABLE user_credits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Créditos
  credits_remaining INTEGER DEFAULT 50 NOT NULL,
  credits_total INTEGER DEFAULT 50 NOT NULL,  -- Total do plano (future: premium)

  -- Controle temporal
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  last_generation_at TIMESTAMPTZ,  -- Para cooldown de 10s

  -- Constraints
  CHECK (credits_remaining >= 0),
  CHECK (credits_remaining <= credits_total)
);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"  -- Para decrementar
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNÇÃO: Decrementar crédito
-- ============================================
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
  -- Verificar créditos
  SELECT user_credits.credits_remaining, user_credits.last_generation_at
  INTO v_credits, v_last_gen
  FROM user_credits
  WHERE user_id = p_user_id;

  -- Se não existe, criar com valores padrão
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id)
    VALUES (p_user_id);
    v_credits := 50;
    v_last_gen := NULL;
  END IF;

  -- Verificar se tem créditos
  IF v_credits <= 0 THEN
    RETURN QUERY SELECT false, 0, 'Limite de gerações atingido';
    RETURN;
  END IF;

  -- Verificar cooldown (10 segundos)
  IF v_last_gen IS NOT NULL THEN
    v_seconds_since_last := EXTRACT(EPOCH FROM (NOW() - v_last_gen));
    IF v_seconds_since_last < 10 THEN
      RETURN QUERY SELECT
        false,
        v_credits,
        'Aguarde ' || CEIL(10 - v_seconds_since_last)::TEXT || ' segundos';
      RETURN;
    END IF;
  END IF;

  -- Consumir crédito
  UPDATE user_credits
  SET credits_remaining = credits_remaining - 1,
      last_generation_at = NOW()
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT true, v_credits - 1, 'Crédito consumido';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÃO: Reset mensal automático
-- ============================================
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS INTEGER AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE user_credits
  SET credits_remaining = credits_total,
      last_reset_at = NOW()
  WHERE last_reset_at < DATE_TRUNC('month', NOW());

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRON JOB (Executar via Supabase Edge Function)
-- ============================================
-- Chamar reset_monthly_credits() todo dia 1º às 00:00
-- Implementar via Supabase Edge Function scheduled
```

### 3.3 Relacionamento com `lottery_analyses`

**Decisão:** `lottery_analyses` **NÃO é modificada**.

**Comportamento:**
- `lottery_analyses` = cache da **última geração** (compatibilidade com código atual)
- `generation_history` = histórico de **todas gerações**

**Fluxo de Dados:**

```typescript
// Ao regenerar:
1. Consumir crédito (user_credits)
2. Gerar nova análise (lotteryAnalysis.ts)
3. Inserir em generation_history (com is_active = true)
4. Atualizar lottery_analyses (substituir cache)
5. Desmarcar gerações anteriores (is_active = false)
```

---

## 4. BACKEND IMPLEMENTATION

### 4.1 Migration: `20250103_generation_history.sql`

```sql
-- Migration: Criar tabela generation_history e user_credits
-- Data: 2025-01-03
-- Autor: Claude Code

BEGIN;

-- ============================================
-- 1. Criar generation_history
-- ============================================
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,
  strategy_type TEXT NOT NULL DEFAULT 'balanced',
  generated_numbers JSONB NOT NULL,
  hot_numbers INTEGER[] NOT NULL,
  cold_numbers INTEGER[] NOT NULL,
  accuracy_rate NUMERIC(5,2) NOT NULL,
  draws_analyzed INTEGER NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_history_user_lottery
  ON generation_history (user_id, lottery_type, contest_number, generated_at DESC);

CREATE INDEX idx_history_active
  ON generation_history (user_id, lottery_type, contest_number)
  WHERE is_active = true;

-- RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON generation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON generation_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. Criar user_credits
-- ============================================
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 50 NOT NULL,
  credits_total INTEGER DEFAULT 50 NOT NULL,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  last_generation_at TIMESTAMPTZ,
  CHECK (credits_remaining >= 0),
  CHECK (credits_remaining <= credits_total)
);

-- RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. Criar funções
-- ============================================
-- (Copiar funções acima: cleanup_old_generations, set_active_generation, consume_credit, reset_monthly_credits)

COMMIT;
```

### 4.2 Edge Function: `reset-monthly-credits`

```typescript
// supabase/functions/reset-monthly-credits/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Chamar função SQL
    const { data, error } = await supabaseClient.rpc('reset_monthly_credits');

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        updated: data,
        message: `Reset realizado para ${data} usuários`
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Agendar:** Supabase → Edge Functions → Schedule (cron: `0 0 1 * *`)

---

## 5. SERVICES & HOOKS

### 5.1 Service: `generationService.ts`

```typescript
// App/app/src/services/generationService.ts
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GenerationHistory = Database['public']['Tables']['generation_history']['Row'];
type GenerationInsert = Database['public']['Tables']['generation_history']['Insert'];

export interface GenerationHistoryItem {
  id: string;
  contest_number: number;
  accuracy_rate: number;
  generated_at: string;
  is_active: boolean;
  generated_numbers: number[][];
  hot_numbers: number[];
  cold_numbers: number[];
}

/**
 * Buscar histórico de gerações de um concurso
 */
export async function getGenerationHistory(
  userId: string,
  lotteryType: string,
  contestNumber: number
): Promise<GenerationHistoryItem[]> {
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('lottery_type', lotteryType)
    .eq('contest_number', contestNumber)
    .order('generated_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar histórico:', error);
    throw error;
  }

  return data.map(row => ({
    id: row.id,
    contest_number: row.contest_number,
    accuracy_rate: row.accuracy_rate,
    generated_at: row.generated_at,
    is_active: row.is_active,
    generated_numbers: row.generated_numbers as number[][],
    hot_numbers: row.hot_numbers,
    cold_numbers: row.cold_numbers
  }));
}

/**
 * Buscar geração ativa de um concurso
 */
export async function getActiveGeneration(
  userId: string,
  lotteryType: string,
  contestNumber: number
): Promise<GenerationHistoryItem | null> {
  const { data, error } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('lottery_type', lotteryType)
    .eq('contest_number', contestNumber)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar geração ativa:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    contest_number: data.contest_number,
    accuracy_rate: data.accuracy_rate,
    generated_at: data.generated_at,
    is_active: data.is_active,
    generated_numbers: data.generated_numbers as number[][],
    hot_numbers: data.hot_numbers,
    cold_numbers: data.cold_numbers
  };
}

/**
 * Salvar nova geração
 */
export async function saveGeneration(
  userId: string,
  lotteryType: string,
  contestNumber: number,
  data: {
    generated_numbers: number[][];
    hot_numbers: number[];
    cold_numbers: number[];
    accuracy_rate: number;
    draws_analyzed: number;
  }
): Promise<string> {
  // 1. Desmarcar todas as gerações do concurso
  await supabase
    .from('generation_history')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('lottery_type', lotteryType)
    .eq('contest_number', contestNumber);

  // 2. Inserir nova geração (ativa)
  const { data: newGen, error } = await supabase
    .from('generation_history')
    .insert({
      user_id: userId,
      lottery_type: lotteryType,
      contest_number: contestNumber,
      strategy_type: 'balanced',
      generated_numbers: data.generated_numbers,
      hot_numbers: data.hot_numbers,
      cold_numbers: data.cold_numbers,
      accuracy_rate: data.accuracy_rate,
      draws_analyzed: data.draws_analyzed,
      is_active: true
    } as GenerationInsert)
    .select('id')
    .single();

  if (error) {
    console.error('❌ Erro ao salvar geração:', error);
    throw error;
  }

  console.log('✅ Nova geração salva:', newGen.id);
  return newGen.id;
}

/**
 * Definir geração como ativa
 */
export async function setActiveGeneration(
  userId: string,
  lotteryType: string,
  contestNumber: number,
  generationId: string
): Promise<void> {
  const { error } = await supabase.rpc('set_active_generation', {
    p_user_id: userId,
    p_lottery_type: lotteryType,
    p_contest_number: contestNumber,
    p_generation_id: generationId
  });

  if (error) {
    console.error('❌ Erro ao definir geração ativa:', error);
    throw error;
  }

  console.log('✅ Geração ativa alterada:', generationId);
}

/**
 * Deletar geração
 */
export async function deleteGeneration(generationId: string): Promise<void> {
  const { error } = await supabase
    .from('generation_history')
    .delete()
    .eq('id', generationId);

  if (error) {
    console.error('❌ Erro ao deletar geração:', error);
    throw error;
  }

  console.log('✅ Geração deletada:', generationId);
}
```

### 5.2 Service: `creditsService.ts`

```typescript
// App/app/src/services/creditsService.ts
import { supabase } from '@/integrations/supabase/client';

export interface UserCredits {
  credits_remaining: number;
  credits_total: number;
  last_reset_at: string;
  last_generation_at: string | null;
}

export interface ConsumeResult {
  success: boolean;
  credits_remaining: number;
  message: string;
}

/**
 * Buscar créditos do usuário
 */
export async function getUserCredits(userId: string): Promise<UserCredits> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar créditos:', error);
    throw error;
  }

  // Se não existe, criar
  if (!data) {
    await supabase
      .from('user_credits')
      .insert({ user_id: userId });

    return {
      credits_remaining: 50,
      credits_total: 50,
      last_reset_at: new Date().toISOString(),
      last_generation_at: null
    };
  }

  return data;
}

/**
 * Consumir crédito (valida cooldown + limite)
 */
export async function consumeCredit(userId: string): Promise<ConsumeResult> {
  const { data, error } = await supabase.rpc('consume_credit', {
    p_user_id: userId
  });

  if (error) {
    console.error('❌ Erro ao consumir crédito:', error);
    throw error;
  }

  const result = data[0] as ConsumeResult;

  if (!result.success) {
    console.warn('⚠️ Crédito não consumido:', result.message);
  } else {
    console.log('✅ Crédito consumido. Restantes:', result.credits_remaining);
  }

  return result;
}

/**
 * Verificar se pode regenerar (sem consumir crédito)
 */
export async function canRegenerate(userId: string): Promise<{
  canRegenerate: boolean;
  reason?: string;
  creditsRemaining: number;
  cooldownSeconds?: number;
}> {
  const credits = await getUserCredits(userId);

  // Verificar créditos
  if (credits.credits_remaining <= 0) {
    return {
      canRegenerate: false,
      reason: 'Limite de 50 gerações mensais atingido.',
      creditsRemaining: 0
    };
  }

  // Verificar cooldown
  if (credits.last_generation_at) {
    const lastGen = new Date(credits.last_generation_at);
    const secondsSince = (Date.now() - lastGen.getTime()) / 1000;

    if (secondsSince < 10) {
      return {
        canRegenerate: false,
        reason: `Aguarde ${Math.ceil(10 - secondsSince)} segundos.`,
        creditsRemaining: credits.credits_remaining,
        cooldownSeconds: 10 - secondsSince
      };
    }
  }

  return {
    canRegenerate: true,
    creditsRemaining: credits.credits_remaining
  };
}
```

### 5.3 Hook: `useRegenerateCombinations.ts`

```typescript
// App/app/src/hooks/useRegenerateCombinations.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { consumeCredit } from '@/services/creditsService';
import { saveGeneration } from '@/services/generationService';
import { generateIntelligentCombinations } from '@/services/lotteryAnalysis';
import type { LotteryStatistics } from '@/types/analysis';

interface RegenerateParams {
  userId: string;
  lotteryType: string;
  contestNumber: number;
  statistics: LotteryStatistics;
  numbersPerGame: number;
  maxNumber: number;
}

export function useRegenerateCombinations() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const regenerateMutation = useMutation({
    mutationFn: async (params: RegenerateParams) => {
      setIsGenerating(true);

      // 1. Consumir crédito (valida cooldown + limite)
      const creditResult = await consumeCredit(params.userId);

      if (!creditResult.success) {
        throw new Error(creditResult.message);
      }

      // 2. Gerar novas combinações
      const newCombinations = generateIntelligentCombinations(
        params.statistics,
        params.numbersPerGame,
        params.maxNumber,
        10 // 10 jogos
      );

      // 3. Salvar no histórico
      const generationId = await saveGeneration(
        params.userId,
        params.lotteryType,
        params.contestNumber,
        {
          generated_numbers: newCombinations,
          hot_numbers: params.statistics.hotNumbers,
          cold_numbers: params.statistics.coldNumbers,
          accuracy_rate: params.statistics.accuracy || 0,
          draws_analyzed: params.statistics.totalDrawsAnalyzed
        }
      );

      // 4. Atualizar cache lottery_analyses (compatibilidade)
      // TODO: Implementar atualização de lottery_analyses

      setIsGenerating(false);

      return {
        generationId,
        combinations: newCombinations,
        creditsRemaining: creditResult.credits_remaining
      };
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['lotteryAnalysis', variables.lotteryType, variables.contestNumber]
      });
      queryClient.invalidateQueries({
        queryKey: ['generationHistory', variables.lotteryType, variables.contestNumber]
      });
      queryClient.invalidateQueries({
        queryKey: ['userCredits', variables.userId]
      });
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error('❌ Erro ao regenerar:', error);
    }
  });

  return {
    regenerate: regenerateMutation.mutate,
    isGenerating,
    error: regenerateMutation.error,
    data: regenerateMutation.data
  };
}
```

---

## 6. UI COMPONENTS

### 6.1 Component: `RegenerateButton.tsx`

```typescript
// App/app/src/components/RegenerateButton.tsx
import { useState } from 'react';
import { RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { canRegenerate } from '@/services/creditsService';
import { useRegenerateCombinations } from '@/hooks/useRegenerateCombinations';

interface RegenerateButtonProps {
  lotteryType: string;
  contestNumber: number;
  statistics: any;
  numbersPerGame: number;
  maxNumber: number;
  creditsRemaining: number;
  onSuccess?: () => void;
}

export function RegenerateButton({
  lotteryType,
  contestNumber,
  statistics,
  numbersPerGame,
  maxNumber,
  creditsRemaining,
  onSuccess
}: RegenerateButtonProps) {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { regenerate, isGenerating } = useRegenerateCombinations();

  const handleClick = async () => {
    if (!user) return;

    // Validar antes de abrir modal
    const validation = await canRegenerate(user.id);

    if (!validation.canRegenerate) {
      setValidationError(validation.reason || 'Não foi possível regenerar');
      return;
    }

    setShowDialog(true);
  };

  const handleConfirm = () => {
    if (!user) return;

    regenerate({
      userId: user.id,
      lotteryType,
      contestNumber,
      statistics,
      numbersPerGame,
      maxNumber
    }, {
      onSuccess: () => {
        setShowDialog(false);
        onSuccess?.();
      }
    });
  };

  return (
    <>
      {/* Botão */}
      <Button
        onClick={handleClick}
        disabled={isGenerating || creditsRemaining <= 0}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <RefreshCw className={isGenerating ? 'animate-spin' : ''} size={16} />
        Gerar Novamente ({creditsRemaining} créditos)
      </Button>

      {/* Erro de validação */}
      {validationError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle size={16} />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* Modal de confirmação */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Gerar Novas Combinações?</DialogTitle>
            <DialogDescription>
              Isso irá criar uma nova geração de jogos. A geração anterior será movida para o histórico.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              • Serão geradas 10 novas combinações
              <br />
              • Você poderá navegar entre gerações antigas
              <br />
              • 1 crédito será consumido ({creditsRemaining - 1} restantes)
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={16} />
                  Gerando...
                </>
              ) : (
                'Sim, Gerar Novas'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### 6.2 Component: `GenerationSelector.tsx`

```typescript
// App/app/src/components/GenerationSelector.tsx
import { useState } from 'react';
import { ChevronDown, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { GenerationHistoryItem } from '@/services/generationService';

interface GenerationSelectorProps {
  generations: GenerationHistoryItem[];
  activeGenerationId: string;
  onSelect: (generationId: string) => void;
  onViewAll: () => void;
}

export function GenerationSelector({
  generations,
  activeGenerationId,
  onSelect,
  onViewAll
}: GenerationSelectorProps) {
  // Mostrar apenas últimas 3
  const visibleGenerations = generations.slice(0, 3);
  const hasMore = generations.length > 3;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Gerações:</span>

      {visibleGenerations.map((gen, index) => (
        <Button
          key={gen.id}
          variant={gen.id === activeGenerationId ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSelect(gen.id)}
        >
          {index + 1} {gen.id === activeGenerationId && '(Atual)'}
        </Button>
      ))}

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="gap-2"
        >
          <History size={16} />
          Ver Todas ({generations.length})
        </Button>
      )}
    </div>
  );
}
```

### 6.3 Component: `GenerationHistoryModal.tsx`

```typescript
// App/app/src/components/GenerationHistoryModal.tsx
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { GenerationHistoryItem } from '@/services/generationService';

interface GenerationHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generations: GenerationHistoryItem[];
  activeGenerationId: string;
  onSelect: (generationId: string) => void;
  onDelete: (generationId: string) => void;
}

export function GenerationHistoryModal({
  open,
  onOpenChange,
  generations,
  activeGenerationId,
  onSelect,
  onDelete
}: GenerationHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📜 Histórico de Gerações</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {generations.map((gen, index) => (
              <div
                key={gen.id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border
                  ${gen.id === activeGenerationId ? 'border-primary bg-primary/5' : 'border-border'}
                `}
              >
                <div className="flex items-center gap-4">
                  {gen.id === activeGenerationId && (
                    <CheckCircle size={20} className="text-primary" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Geração {index + 1}</span>
                      {gen.id === activeGenerationId && (
                        <span className="text-xs text-primary">(Ativa)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(gen.generated_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                    <p className="text-sm">
                      Acurácia: {gen.accuracy_rate}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {gen.id !== activeGenerationId && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelect(gen.id);
                          onOpenChange(false);
                        }}
                      >
                        Selecionar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(gen.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {generations.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma geração encontrada.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. FLUXOS DE USUÁRIO

### 7.1 Fluxo Completo: Regenerar Combinações

```
1. Usuário acessa Lottery.tsx (Mega-Sena 2750)
   ↓
2. Sistema busca geração ativa (is_active = true)
   ↓
3. Exibe 10 combinações da geração ativa
   ↓
4. Usuário clica [🔄 Gerar Novamente (45 créditos)]
   ↓
5. Sistema valida:
   - Tem créditos? (45 > 0) ✅
   - Passou cooldown? (última geração há 2h) ✅
   ↓
6. Abre modal de confirmação
   ↓
7. Usuário clica [Sim, Gerar Novas]
   ↓
8. Sistema:
   a. Consome 1 crédito (45 → 44)
   b. Gera 10 novas combinações
   c. Salva em generation_history (is_active = true)
   d. Desmarca gerações antigas (is_active = false)
   e. Atualiza lottery_analyses
   ↓
9. UI aplica fade-out nos números antigos
   ↓
10. UI aplica fade-in nos números novos
   ↓
11. Toast: ✅ "Novas combinações geradas!"
   ↓
12. Atualiza badge: [🔄 Gerar Novamente (44 créditos)]
```

### 7.2 Fluxo: Navegar Entre Gerações

```
1. Usuário vê: [Geração 1 (Atual)] [2] [3] [📜 Ver Todas]
   ↓
2. Clica em [2]
   ↓
3. Sistema:
   a. Busca geração 2 do banco
   b. Marca geração 2 como ativa (set_active_generation)
   c. Invalida queries
   ↓
4. UI atualiza:
   - Fade-out combinações antigas
   - Fade-in combinações da geração 2
   - Badge: [Geração 2 (Atual)] [1] [3]
   ↓
5. Estatísticas mantêm mesmas (hot/cold não mudam)
```

### 7.3 Fluxo: Ver Histórico Completo

```
1. Usuário clica [📜 Ver Todas (15)]
   ↓
2. Abre modal com lista de 15 gerações
   ↓
3. Usuário clica [Selecionar] na Geração 7
   ↓
4. Sistema define Geração 7 como ativa
   ↓
5. Modal fecha
   ↓
6. UI atualiza com combinações da Geração 7
```

---

## 8. CHECKLIST DE IMPLEMENTAÇÃO

### 8.1 Backend (Estimativa: 12h)

- [ ] Criar migration `20250103_generation_history.sql`
- [ ] Criar tabela `generation_history`
- [ ] Criar tabela `user_credits`
- [ ] Criar função `cleanup_old_generations()`
- [ ] Criar função `set_active_generation()`
- [ ] Criar função `consume_credit()`
- [ ] Criar função `reset_monthly_credits()`
- [ ] Configurar RLS em `generation_history`
- [ ] Configurar RLS em `user_credits`
- [ ] Testar migration em ambiente local
- [ ] Criar Edge Function `reset-monthly-credits`
- [ ] Agendar Edge Function (cron: dia 1º às 00:00)
- [ ] Deploy migration para Supabase

### 8.2 Services (Estimativa: 10h)

- [ ] Criar `generationService.ts`
  - [ ] `getGenerationHistory()`
  - [ ] `getActiveGeneration()`
  - [ ] `saveGeneration()`
  - [ ] `setActiveGeneration()`
  - [ ] `deleteGeneration()`
- [ ] Criar `creditsService.ts`
  - [ ] `getUserCredits()`
  - [ ] `consumeCredit()`
  - [ ] `canRegenerate()`
- [ ] Criar hook `useRegenerateCombinations.ts`
- [ ] Atualizar `useLotteryAnalysis.ts` para integrar histórico
- [ ] Testes unitários dos services
- [ ] Documentar services no código

### 8.3 UI Components (Estimativa: 12h)

- [ ] Criar `RegenerateButton.tsx`
  - [ ] Botão com badge de créditos
  - [ ] Modal de confirmação
  - [ ] Validação de créditos
  - [ ] Loading state
  - [ ] Error handling
- [ ] Criar `GenerationSelector.tsx`
  - [ ] Últimas 3 gerações visíveis
  - [ ] Botão "Ver Todas"
  - [ ] Highlight geração ativa
- [ ] Criar `GenerationHistoryModal.tsx`
  - [ ] Lista todas gerações
  - [ ] Botão selecionar
  - [ ] Botão deletar
  - [ ] Timestamp relativo
- [ ] Atualizar `Lottery.tsx`
  - [ ] Integrar RegenerateButton
  - [ ] Integrar GenerationSelector
  - [ ] Fade-in/out animation
  - [ ] Toast notifications
- [ ] Atualizar `ResultsDisplay.tsx`
  - [ ] Suporte a fade animations

### 8.4 Testing (Estimativa: 8h)

- [ ] Teste: Regenerar com créditos suficientes
- [ ] Teste: Regenerar sem créditos (limite)
- [ ] Teste: Regenerar com cooldown ativo
- [ ] Teste: Navegar entre gerações
- [ ] Teste: Ver histórico completo
- [ ] Teste: Deletar geração
- [ ] Teste: Reset mensal de créditos
- [ ] Teste: Cleanup automático (3 meses)
- [ ] Teste: Múltiplos usuários simultâneos
- [ ] Teste E2E completo do fluxo

### 8.5 Documentação (Estimativa: 2h)

- [ ] Atualizar DEVELOPMENT.md
- [ ] Documentar novo schema do banco
- [ ] Guia de uso para usuários finais
- [ ] Screenshots/GIFs dos fluxos

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Criar branch de desenvolvimento**
   ```bash
   git checkout -b feature/phase1-regeneration
   ```

2. **Executar migration no Supabase local**
   ```bash
   supabase db push
   ```

3. **Implementar services primeiro** (TDD approach)

4. **Implementar UI components**

5. **Testar localmente**

6. **Code review + ajustes**

7. **Merge para main**

---

**Última atualização:** 2025-01-03
**Aprovado por:** Bruno
**Status:** Pronto para desenvolvimento
**Estimativa total:** 42 horas (~5-6 dias)