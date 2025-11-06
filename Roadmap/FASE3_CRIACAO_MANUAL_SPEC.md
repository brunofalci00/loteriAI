# 🎨 FASE 3: Sistema de Criação Manual de Jogos

**Estimativa:** 50 horas
**Prioridade:** Alta
**Dependências:** Fase 1 (Regeneração), Fase 2 (Salvamento)
**Status:** Especificação Completa

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos Funcionais](#requisitos-funcionais)
3. [Fluxo Stepper (4 Etapas)](#fluxo-stepper-4-etapas)
4. [Arquitetura de Banco de Dados](#arquitetura-de-banco-de-dados)
5. [Services TypeScript](#services-typescript)
6. [React Hooks](#react-hooks)
7. [Componentes UI](#componentes-ui)
8. [Sistema de Análise Híbrida](#sistema-de-análise-híbrida)
9. [Gerar Variações (5 opções)](#gerar-variações-5-opções)
10. [Tour Guide & Tooltips](#tour-guide--tooltips)
11. [Wireframes ASCII](#wireframes-ascii)
12. [Checklist de Implementação](#checklist-de-implementação)
13. [Testes](#testes)

---

## 🎯 Visão Geral

### Objetivo
Permitir que usuários criem seus próprios jogos manualmente e recebam análise completa da IA sobre os números escolhidos, com sugestões de melhorias e capacidade de gerar variações otimizadas.

### Decisões de Design Consolidadas

Com base nas respostas do Bruno (Q1-Q30):

| Decisão | Escolha Final |
|---------|---------------|
| **Fluxo de Criação** | Stepper de 4 etapas (Q17) |
| **Etapa 1** | Escolher loteria (Lotofácil/Lotomania) |
| **Etapa 2** | Escolher concurso (atual ou passado) |
| **Etapa 3** | Selecionar números manualmente (grid interativo) |
| **Etapa 4** | Ver análise da IA + opções de ação |
| **Grid de Seleção** | Igual à landing page (número clicável) |
| **Análise da IA** | Híbrida: Score com estrelas + resumo + botão "Ver Detalhes" (Q15) |
| **Gerar Variações** | Opção C: Aplicar sugestões da IA sobre números escolhidos (Q16) |
| **Quantidade de Variações** | 5 variações otimizadas |
| **Educação do Usuário** | Tooltip + Tour Guide (Q18) |
| **Integração com Salvamento** | Toggle "Salvar" disponível após análise (Fase 2) |
| **Fonte de Dados** | `source = 'manual_created'` em saved_games |

### Escopo da Fase 3

**Incluído:**
- ✅ Stepper de 4 etapas com navegação fluida
- ✅ Grid interativo de seleção de números
- ✅ Validação de quantidade de números (15 para Lotofácil, 50 para Lotomania)
- ✅ Análise da IA com score visual (estrelas)
- ✅ Resumo textual com insights
- ✅ Modal "Ver Detalhes" com análise completa
- ✅ Sistema de sugestões da IA
- ✅ Gerar 5 variações otimizadas
- ✅ Tour guide para primeira visita
- ✅ Tooltips explicativos em cada etapa
- ✅ Integração com sistema de salvamento (Fase 2)
- ✅ Histórico de jogos manuais criados

**Não Incluído (decisões de escopo):**
- ❌ Importar jogos de arquivos externos
- ❌ OCR de bilhetes de loteria
- ❌ Integração com apostas online
- ❌ Comparação com resultados de concursos passados (será Fase 4)
- ❌ Alertas de resultados de concursos

---

## 📦 Requisitos Funcionais

### RF-01: Escolher Loteria (Etapa 1)
- **Descrição:** Usuário seleciona tipo de loteria (Lotofácil ou Lotomania)
- **UI:** Cards grandes e visuais com ilustrações
- **Validação:** Obrigatório selecionar uma opção
- **Próximo:** Avança para Etapa 2
- **Info Exibida:**
  - Nome da loteria
  - Quantidade de números a selecionar (15 para Lotofácil, 50 para Lotomania)
  - Range de números disponíveis (1-25 para Lotofácil, 1-100 para Lotomania)
  - Ícone representativo

### RF-02: Escolher Concurso (Etapa 2)
- **Descrição:** Usuário seleciona concurso para análise contextual
- **Opções:**
  - "Próximo Concurso" (padrão selecionado)
  - Dropdown com últimos 50 concursos
  - Input manual de número de concurso
- **Validação:** Concurso deve existir na base de histórico
- **Feedback:** Exibir data estimada do concurso (se disponível)
- **Próximo:** Avança para Etapa 3

### RF-03: Selecionar Números Manualmente (Etapa 3)
- **Descrição:** Usuário clica nos números para montar seu jogo
- **Grid:** Similar ao da landing page (números em botões clicáveis)
- **Validação:**
  - Lotofácil: exatamente 15 números
  - Lotomania: exatamente 50 números
- **Feedback Visual:**
  - Números selecionados: fundo verde + check ✓
  - Números não selecionados: fundo cinza
  - Contador: "12/15 números selecionados"
- **Botão "Limpar Seleção":** Reset completo
- **Botão "Seleção Aleatória":** Preenche automaticamente com números aleatórios
- **Próximo:** Só habilita "Analisar Jogo" quando quantidade correta selecionada

### RF-04: Analisar Jogo (Etapa 4)
- **Descrição:** IA analisa os números escolhidos e retorna score + insights
- **Cálculo:**
  - Números quentes vs frios vs balanceados
  - Score geral (0-10) baseado em probabilidades históricas
  - Padrões identificados (sequências, múltiplos, etc)
  - Distribuição par/ímpar
  - Distribuição por dezenas
- **Exibição:** Análise Híbrida (Q15)
  - ⭐ Score visual com estrelas (ex: 7.5/10 = ⭐⭐⭐⭐☆)
  - 📊 Resumo textual (3-4 linhas)
  - 🔍 Botão "Ver Detalhes" → Modal com análise completa
- **Ações Disponíveis:**
  - ❤️ Salvar Jogo (toggle da Fase 2)
  - 🔄 Gerar Variações (5 opções otimizadas)
  - ✏️ Editar Números (volta para Etapa 3)
  - 🆕 Criar Novo Jogo (reinicia stepper)

### RF-05: Gerar Variações (5 Jogos Otimizados)
- **Descrição:** IA gera 5 variações otimizadas aplicando sugestões sobre os números originais (Opção C - Q16)
- **Lógica:**
  - Mantém 60-70% dos números originais
  - Substitui 30-40% por números sugeridos pela IA
  - Cada variação usa estratégia diferente:
    1. Balanceada (mix de hot/cold/balanced)
    2. Focada em Quentes (mais números hot)
    3. Focada em Frios (mais números cold)
    4. Otimizada Par/Ímpar (melhor distribuição)
    5. Otimizada por Dezenas (melhor distribuição)
- **Exibição:**
  - Grid com 5 cards de variações
  - Cada card mostra: números + score + diferenças destacadas
  - Opção de salvar cada variação individualmente
- **Feedback:** Toast "5 variações geradas com sucesso!"

### RF-06: Ver Detalhes da Análise (Modal)
- **Descrição:** Modal com análise completa e visual
- **Conteúdo:**
  - Score detalhado com explicação
  - Gráfico de distribuição hot/cold/balanced
  - Gráfico par/ímpar
  - Gráfico por dezenas
  - Lista de padrões identificados
  - Sugestões de melhoria da IA
  - Comparação com média de acertos históricos
- **Ação:** Botão "Entendi" para fechar

### RF-07: Tour Guide (Primeira Visita)
- **Descrição:** Tutorial interativo para usuários de primeira viagem (Q18)
- **Triggers:** Primeira vez que acessa a página de criação manual
- **Etapas do Tour:**
  1. Bem-vindo → Explica objetivo da ferramenta
  2. Etapa 1 → Como escolher loteria
  3. Etapa 2 → Como escolher concurso
  4. Etapa 3 → Como selecionar números
  5. Etapa 4 → Como interpretar análise
  6. Gerar Variações → Como usar sugestões da IA
  7. Salvar → Como salvar jogos favoritos
- **Persistência:** Flag `has_seen_manual_creation_tour` em perfil do usuário
- **Opção:** "Pular Tutorial" visível em todas as etapas

### RF-08: Tooltips Explicativos
- **Descrição:** Tooltips contextuais em elementos-chave (Q18)
- **Locais:**
  - Etapa 1: Tooltip sobre "O que é Lotofácil/Lotomania"
  - Etapa 2: Tooltip "Por que escolher concurso específico?"
  - Etapa 3: Tooltip sobre "Números Quentes/Frios"
  - Etapa 4: Tooltip sobre "Como interpretar o score"
  - Gerar Variações: Tooltip "Como funcionam as variações?"
- **UI:** ícone ℹ️ com hover/click para exibir tooltip

### RF-09: Histórico de Jogos Manuais Criados
- **Descrição:** Seção na página "Meus Jogos" mostrando jogos manuais
- **Filtro:** Tab "Criados Manualmente" (já implementado na Fase 2)
- **Badge:** Jogos manuais têm badge "✍️ Criado Manualmente"
- **Integração:** Usa tabela `saved_games` com `source = 'manual_created'`

### RF-10: Validações e Constraints
- **Números Únicos:** Não permitir selecionar o mesmo número duas vezes
- **Quantidade Exata:** Só permite avançar com quantidade correta
- **Range Válido:** Lotofácil (1-25), Lotomania (1-100)
- **Concurso Válido:** Deve existir histórico para análise contextual
- **Rate Limiting:** Análises limitadas por créditos (integra com Fase 1)

---

## 🔄 Fluxo Stepper (4 Etapas)

### Visão Geral do Stepper

```
┌─────────────────────────────────────────────────────────────────┐
│                      STEPPER DE 4 ETAPAS                        │
└─────────────────────────────────────────────────────────────────┘

[1] Escolher Loteria  →  [2] Escolher Concurso  →  [3] Selecionar Números  →  [4] Ver Análise

Estados do Stepper:
- Etapa Atual: Azul sólido ●
- Etapas Completadas: Verde com check ✓
- Etapas Futuras: Cinza vazio ○

Navegação:
- "Próximo": Só habilitado se etapa atual válida
- "Voltar": Sempre disponível (exceto na Etapa 1)
- Pode clicar em etapas completadas para editar
```

### Etapa 1: Escolher Loteria

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 1 DE 4: ESCOLHER LOTERIA                                 │
└─────────────────────────────────────────────────────────────────┘

Selecione o tipo de loteria que deseja jogar:

┌──────────────────────────┐     ┌──────────────────────────┐
│    🎱 LOTOFÁCIL          │     │    🎰 LOTOMANIA         │
│                          │     │                          │
│  • 15 números            │     │  • 50 números            │
│  • Range: 1 a 25         │     │  • Range: 1 a 100        │
│  • Sorteio: Seg-Sex      │     │  • Sorteio: Ter-Qui-Sáb  │
│                          │     │                          │
│  [Selecionar] ●          │     │  [Selecionar] ○          │
└──────────────────────────┘     └──────────────────────────┘

                    [Próximo →]  (habilitado após seleção)
```

**Validação:**
- Deve selecionar exatamente 1 loteria
- Botão "Próximo" só habilita após seleção

**Dados Salvos:**
```typescript
{
  lotteryType: 'lotofacil' | 'lotomania',
  numbersRequired: 15 | 50,
  numberRange: { min: 1, max: 25 | 100 }
}
```

### Etapa 2: Escolher Concurso

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 2 DE 4: ESCOLHER CONCURSO                                │
└─────────────────────────────────────────────────────────────────┘

Escolha o concurso para análise contextual:
ℹ️ A IA usa o histórico do concurso para análise mais precisa

┌──────────────────────────────────────────────────────────────┐
│  ● Próximo Concurso  (Lotofácil #3206 - Estimado: 06/01/25) │
│                                                               │
│  ○ Concurso Passado:                                         │
│     [Dropdown: Últimos 50 concursos ▼]                       │
│                                                               │
│  ○ Número Específico:                                        │
│     [Input: Digite o número do concurso]                     │
└──────────────────────────────────────────────────────────────┘

                [← Voltar]  [Próximo →]
```

**Validação:**
- Concurso deve existir na base de dados (para análise contextual)
- Se número específico: verificar se existe histórico
- Feedback: Toast "Concurso não encontrado" se inválido

**Dados Salvos:**
```typescript
{
  contestNumber: number,
  contestDate?: string,
  contestStatus: 'upcoming' | 'past'
}
```

### Etapa 3: Selecionar Números

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 3 DE 4: SELECIONAR NÚMEROS                               │
└─────────────────────────────────────────────────────────────────┘

Clique nos números para montar seu jogo:

Selecionados: 12/15 números  [🗑️ Limpar]  [🎲 Aleatório]

┌────────────────────────────────────────────────────────────────┐
│  [01]✓ [02]  [03]✓ [04]✓ [05]  [06]✓ [07]  [08]✓ [09]  [10]✓ │
│  [11]✓ [12]✓ [13]  [14]  [15]✓ [16]  [17]✓ [18]  [19]✓ [20]  │
│  [21]  [22]  [23]  [24]  [25]                                  │
└────────────────────────────────────────────────────────────────┘

Estados visuais:
[XX]✓ → Selecionado (verde, check)
[XX]  → Não selecionado (cinza)

Legendas (exibir se usuário ativou "Mostrar dicas"):
🔥 Números Quentes (sorteados 15+ vezes nos últimos 50 concursos)
❄️ Números Frios (sorteados < 5 vezes nos últimos 50 concursos)

              [← Voltar]  [Analisar Jogo →]  (só habilita com 15/15)
```

**Validação:**
- Exatamente 15 números (Lotofácil) ou 50 (Lotomania)
- Números únicos (sem repetições)
- Range válido (1-25 ou 1-100)

**Dados Salvos:**
```typescript
{
  selectedNumbers: number[],
  selectionTimestamp: Date
}
```

**Funcionalidades Extras:**
- **Limpar:** Remove toda seleção
- **Aleatório:** Preenche automaticamente com números aleatórios válidos
- **Mostrar Dicas:** Toggle para exibir indicadores hot/cold nos números (opcional)

### Etapa 4: Ver Análise

**UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│  ETAPA 4 DE 4: ANÁLISE DA IA                                    │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  📊 ANÁLISE DO SEU JOGO                                        ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Números selecionados:                                         ║
║  [01] [03] [04] [06] [08] [10] [11] [12] [15] [17] [19]       ║
║  [21] [23] [24] [25]                                           ║
║                                                                 ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  ⭐ Score: 7.5/10  (⭐⭐⭐⭐☆)                           │  ║
║  │                                                          │  ║
║  │  📊 Resumo:                                              │  ║
║  │  Seu jogo tem uma distribuição balanceada com 5 números │  ║
║  │  quentes, 4 frios e 6 balanceados. A análise indica    │  ║
║  │  boa cobertura de dezenas, mas poderia melhorar a      │  ║
║  │  distribuição par/ímpar (atualmente 8 pares / 7 ímpares).│  ║
║  │                                                          │  ║
║  │  [🔍 Ver Detalhes da Análise]                           │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                 ║
║  🔥 Números quentes: 5  |  ❄️ Frios: 4  |  ⚖️ Balanceados: 6  ║
║  👥 Par/Ímpar: 8 / 7                                           ║
║  📍 Distribuição por Dezenas: 1ª: 8, 2ª: 7                   ║
║                                                                 ║
╚═══════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────┐
│  AÇÕES DISPONÍVEIS:                                            │
│                                                                 │
│  [❤️ Salvar Jogo]  [🔄 Gerar 5 Variações]  [✏️ Editar Números]│
│                                                                 │
│  [🆕 Criar Novo Jogo]  (reinicia o stepper)                   │
└───────────────────────────────────────────────────────────────┘
```

**Análise Híbrida (Q15):**
1. **Score Visual:** Estrelas de 0-10 (ex: 7.5 = ⭐⭐⭐⭐☆)
2. **Resumo Textual:** 3-4 linhas com insights principais
3. **Botão "Ver Detalhes":** Abre modal com análise completa (gráficos, padrões, sugestões)

**Dados Retornados:**
```typescript
{
  score: number, // 0-10
  summary: string, // Resumo textual
  hotCount: number,
  coldCount: number,
  balancedCount: number,
  evenOddDistribution: { even: number, odd: number },
  dezenaDistribution: Record<string, number>,
  patterns: string[], // Padrões identificados
  suggestions: string[], // Sugestões de melhoria
  comparisonWithAverage: string // "Acima/Abaixo/Na média"
}
```

---

## 🗄️ Arquitetura de Banco de Dados

### Integração com Tabela Existente: `saved_games`

A Fase 3 **não cria novas tabelas**, mas utiliza a tabela `saved_games` da Fase 2 com `source = 'manual_created'`.

**Diferenças entre jogos gerados por IA vs manuais:**

| Campo | IA Generated | Manual Created |
|-------|--------------|----------------|
| `generation_id` | UUID válido (FK) | NULL |
| `source` | 'ai_generated' | 'manual_created' |
| `strategy_type` | 'balanced', 'hot_focused', etc | NULL |
| `analysis_result` | Análise da geração | Análise do jogo manual |

### Nova Tabela: `manual_creation_sessions`

Para rastrear sessões de criação manual (opcional, útil para analytics):

```sql
CREATE TABLE manual_creation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,

  -- Etapa 3: Números selecionados
  selected_numbers INTEGER[] NOT NULL,

  -- Etapa 4: Análise recebida
  analysis_result JSONB NOT NULL,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ, -- NULL se não finalizou
  saved_to_saved_games BOOLEAN DEFAULT FALSE, -- TRUE se usuário salvou
  generated_variations BOOLEAN DEFAULT FALSE, -- TRUE se gerou variações

  -- Tempo gasto em cada etapa (analytics)
  time_spent_step1 INTEGER, -- segundos
  time_spent_step2 INTEGER,
  time_spent_step3 INTEGER,
  time_spent_step4 INTEGER
);

CREATE INDEX idx_manual_sessions_user_id ON manual_creation_sessions(user_id);
CREATE INDEX idx_manual_sessions_created_at ON manual_creation_sessions(created_at DESC);
```

**Decisão:** Esta tabela é **opcional** e principalmente para analytics. Pode ser implementada em fase posterior se não for prioridade.

### Tabela para Variações Geradas: `manual_game_variations`

Armazena as 5 variações geradas a partir de um jogo manual:

```sql
CREATE TABLE manual_game_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Vinculação com jogo original (pode ser manual_creation_session ou saved_game)
  original_numbers INTEGER[] NOT NULL,
  original_contest_number INTEGER NOT NULL,
  original_lottery_type TEXT NOT NULL,

  -- Variação gerada
  variation_numbers INTEGER[] NOT NULL,
  variation_strategy TEXT NOT NULL, -- 'balanced', 'hot_focused', etc
  variation_score NUMERIC(4,2) NOT NULL,
  analysis_result JSONB NOT NULL,

  -- Metadados
  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  saved_to_saved_games BOOLEAN DEFAULT FALSE,

  CONSTRAINT unique_variation UNIQUE(user_id, original_numbers, variation_strategy)
);

CREATE INDEX idx_variations_user_id ON manual_game_variations(user_id);
CREATE INDEX idx_variations_generated_at ON manual_game_variations(generated_at DESC);
```

### Nova Flag no Perfil: `has_seen_manual_creation_tour`

Adicionar coluna na tabela `profiles` para rastrear se usuário já viu o tour guide:

```sql
ALTER TABLE profiles
ADD COLUMN has_seen_manual_creation_tour BOOLEAN DEFAULT FALSE;
```

---

## 📝 Migrations SQL

### Migration: `20250103000003_create_manual_creation_tables.sql`

```sql
-- =====================================================
-- MIGRATION: Criar tabelas para criação manual (Fase 3)
-- Data: 2025-01-03
-- Descrição: Sistema de criação manual de jogos com análise IA
-- =====================================================

-- 1. Adicionar flag de tour guide ao perfil
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS has_seen_manual_creation_tour BOOLEAN DEFAULT FALSE;

-- 2. Criar tabela manual_creation_sessions (opcional - analytics)
CREATE TABLE IF NOT EXISTS manual_creation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,

  selected_numbers INTEGER[] NOT NULL,
  analysis_result JSONB NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  saved_to_saved_games BOOLEAN DEFAULT FALSE,
  generated_variations BOOLEAN DEFAULT FALSE,

  time_spent_step1 INTEGER,
  time_spent_step2 INTEGER,
  time_spent_step3 INTEGER,
  time_spent_step4 INTEGER,

  CONSTRAINT check_valid_lottery_type CHECK (lottery_type IN ('lotofacil', 'lotomania')),
  CONSTRAINT check_numbers_not_empty CHECK (array_length(selected_numbers, 1) > 0)
);

CREATE INDEX idx_manual_sessions_user_id ON manual_creation_sessions(user_id);
CREATE INDEX idx_manual_sessions_created_at ON manual_creation_sessions(created_at DESC);
CREATE INDEX idx_manual_sessions_lottery_type ON manual_creation_sessions(lottery_type);

-- 3. Criar tabela manual_game_variations
CREATE TABLE IF NOT EXISTS manual_game_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  original_numbers INTEGER[] NOT NULL,
  original_contest_number INTEGER NOT NULL,
  original_lottery_type TEXT NOT NULL,

  variation_numbers INTEGER[] NOT NULL,
  variation_strategy TEXT NOT NULL,
  variation_score NUMERIC(4,2) NOT NULL,
  analysis_result JSONB NOT NULL,

  generated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  saved_to_saved_games BOOLEAN DEFAULT FALSE,

  CONSTRAINT unique_variation UNIQUE(user_id, original_numbers, variation_strategy),
  CONSTRAINT check_valid_lottery_type_var CHECK (original_lottery_type IN ('lotofacil', 'lotomania')),
  CONSTRAINT check_valid_strategy CHECK (variation_strategy IN (
    'balanced', 'hot_focused', 'cold_focused', 'even_odd_optimized', 'dezena_optimized'
  )),
  CONSTRAINT check_score_range CHECK (variation_score >= 0 AND variation_score <= 10)
);

CREATE INDEX idx_variations_user_id ON manual_game_variations(user_id);
CREATE INDEX idx_variations_generated_at ON manual_game_variations(generated_at DESC);
CREATE INDEX idx_variations_original_lottery ON manual_game_variations(original_lottery_type);

-- 4. Habilitar RLS
ALTER TABLE manual_creation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_game_variations ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para manual_creation_sessions
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

-- 6. Políticas RLS para manual_game_variations
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

-- 7. Comentários para documentação
COMMENT ON TABLE manual_creation_sessions IS 'Sessões de criação manual de jogos (analytics)';
COMMENT ON TABLE manual_game_variations IS 'Variações otimizadas geradas a partir de jogos manuais';
COMMENT ON COLUMN profiles.has_seen_manual_creation_tour IS 'Flag para tour guide da criação manual';

-- 8. Função para limpar sessões antigas (> 7 dias incompletas)
CREATE OR REPLACE FUNCTION cleanup_old_manual_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM manual_creation_sessions
  WHERE completed_at IS NULL
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger agendado para cleanup (executar diariamente via cron job)
-- Configurar via Supabase Edge Functions ou pg_cron

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
```

---

## 🔧 Services TypeScript

### Service: `manualGameAnalysisService.ts`

**Local:** `app/src/services/manualGameAnalysisService.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

export interface ManualGameAnalysisParams {
  lotteryType: 'lotofacil' | 'lotomania';
  contestNumber: number;
  selectedNumbers: number[];
}

export interface AnalysisResult {
  score: number; // 0-10
  summary: string;
  hotCount: number;
  coldCount: number;
  balancedCount: number;
  evenOddDistribution: {
    even: number;
    odd: number;
  };
  dezenaDistribution: Record<string, number>;
  patterns: string[];
  suggestions: string[];
  comparisonWithAverage: string;
  detailedAnalysis: {
    hotNumbers: number[];
    coldNumbers: number[];
    balancedNumbers: number[];
    consecutiveSequences: number[][];
    multiplesOf5: number[];
    [key: string]: any;
  };
}

export class ManualGameAnalysisService {
  /**
   * Analisa jogo criado manualmente
   * Usa mesmo algoritmo da IA de geração, mas em modo reverso
   */
  static async analyzeManualGame(params: ManualGameAnalysisParams): Promise<{
    success: boolean;
    data?: AnalysisResult;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Validações básicas
      const expectedCount = params.lotteryType === 'lotofacil' ? 15 : 50;
      if (params.selectedNumbers.length !== expectedCount) {
        return {
          success: false,
          error: `Quantidade inválida. Esperado: ${expectedCount} números.`
        };
      }

      // Buscar histórico do concurso para análise contextual
      const { data: historicalData, error: histError } = await supabase
        .from('lottery_analyses')
        .select('hot_numbers, cold_numbers')
        .eq('lottery_type', params.lotteryType)
        .eq('contest_number', params.contestNumber)
        .maybeSingle();

      if (histError) {
        console.error('Erro ao buscar histórico:', histError);
      }

      // Classificar números como hot/cold/balanced
      const hotNumbers = historicalData?.hot_numbers || [];
      const coldNumbers = historicalData?.cold_numbers || [];

      let hotCount = 0;
      let coldCount = 0;
      let balancedCount = 0;

      const classifiedNumbers = {
        hot: [] as number[],
        cold: [] as number[],
        balanced: [] as number[]
      };

      params.selectedNumbers.forEach(num => {
        if (hotNumbers.includes(num)) {
          hotCount++;
          classifiedNumbers.hot.push(num);
        } else if (coldNumbers.includes(num)) {
          coldCount++;
          classifiedNumbers.cold.push(num);
        } else {
          balancedCount++;
          classifiedNumbers.balanced.push(num);
        }
      });

      // Análise par/ímpar
      const evenCount = params.selectedNumbers.filter(n => n % 2 === 0).length;
      const oddCount = params.selectedNumbers.length - evenCount;

      // Análise por dezenas
      const dezenaDistribution: Record<string, number> = {};
      params.selectedNumbers.forEach(num => {
        const dezena = Math.floor((num - 1) / 10) + 1;
        const key = `${dezena}ª dezena`;
        dezenaDistribution[key] = (dezenaDistribution[key] || 0) + 1;
      });

      // Identificar padrões
      const patterns: string[] = [];
      const sortedNumbers = [...params.selectedNumbers].sort((a, b) => a - b);

      // Sequências consecutivas
      const consecutiveSequences: number[][] = [];
      let currentSeq: number[] = [sortedNumbers[0]];
      for (let i = 1; i < sortedNumbers.length; i++) {
        if (sortedNumbers[i] === sortedNumbers[i - 1] + 1) {
          currentSeq.push(sortedNumbers[i]);
        } else {
          if (currentSeq.length >= 3) {
            consecutiveSequences.push([...currentSeq]);
            patterns.push(`Sequência consecutiva: ${currentSeq.join(', ')}`);
          }
          currentSeq = [sortedNumbers[i]];
        }
      }
      if (currentSeq.length >= 3) {
        consecutiveSequences.push([...currentSeq]);
        patterns.push(`Sequência consecutiva: ${currentSeq.join(', ')}`);
      }

      // Múltiplos de 5
      const multiplesOf5 = params.selectedNumbers.filter(n => n % 5 === 0);
      if (multiplesOf5.length > 0) {
        patterns.push(`${multiplesOf5.length} múltiplos de 5: ${multiplesOf5.join(', ')}`);
      }

      // Calcular score (0-10)
      let score = 5.0; // Base

      // +1 se distribuição hot/cold/balanced balanceada (ideal: 33%/33%/33%)
      const idealRatio = expectedCount / 3;
      const balanceScore = 1 - (
        Math.abs(hotCount - idealRatio) +
        Math.abs(coldCount - idealRatio) +
        Math.abs(balancedCount - idealRatio)
      ) / expectedCount;
      score += balanceScore;

      // +1 se distribuição par/ímpar próxima de 50/50
      const evenOddBalance = 1 - Math.abs(evenCount - oddCount) / expectedCount;
      score += evenOddBalance;

      // +1 se boa distribuição por dezenas
      const dezenaValues = Object.values(dezenaDistribution);
      const dezenaStdDev = this.calculateStdDev(dezenaValues);
      const dezenaScore = Math.max(0, 1 - dezenaStdDev / 5);
      score += dezenaScore;

      // -0.5 para cada sequência consecutiva longa (não é estatisticamente ideal)
      score -= Math.min(2, consecutiveSequences.length * 0.5);

      // Limitar score entre 0-10
      score = Math.max(0, Math.min(10, score));

      // Gerar resumo textual
      const summary = this.generateSummary({
        hotCount,
        coldCount,
        balancedCount,
        evenCount,
        oddCount,
        patterns,
        score
      });

      // Gerar sugestões de melhoria
      const suggestions = this.generateSuggestions({
        hotCount,
        coldCount,
        balancedCount,
        evenCount,
        oddCount,
        consecutiveSequences,
        multiplesOf5,
        expectedCount
      });

      // Comparar com média histórica (simulado)
      const comparisonWithAverage = score >= 7 ? 'Acima da média'
        : score >= 5 ? 'Na média'
        : 'Abaixo da média';

      const result: AnalysisResult = {
        score: Math.round(score * 10) / 10,
        summary,
        hotCount,
        coldCount,
        balancedCount,
        evenOddDistribution: { even: evenCount, odd: oddCount },
        dezenaDistribution,
        patterns,
        suggestions,
        comparisonWithAverage,
        detailedAnalysis: {
          hotNumbers: classifiedNumbers.hot,
          coldNumbers: classifiedNumbers.cold,
          balancedNumbers: classifiedNumbers.balanced,
          consecutiveSequences,
          multiplesOf5
        }
      };

      return { success: true, data: result };
    } catch (error) {
      console.error('Erro ao analisar jogo manual:', error);
      return {
        success: false,
        error: 'Erro inesperado ao analisar jogo'
      };
    }
  }

  /**
   * Gera resumo textual da análise
   */
  private static generateSummary(data: {
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    evenCount: number;
    oddCount: number;
    patterns: string[];
    score: number;
  }): string {
    const { hotCount, coldCount, balancedCount, evenCount, oddCount, patterns, score } = data;

    let summary = `Seu jogo tem uma distribuição `;

    // Análise hot/cold/balanced
    if (Math.abs(hotCount - coldCount) <= 2 && Math.abs(hotCount - balancedCount) <= 2) {
      summary += `balanceada com ${hotCount} números quentes, ${coldCount} frios e ${balancedCount} balanceados. `;
    } else if (hotCount > coldCount + 3) {
      summary += `focada em números quentes (${hotCount} quentes vs ${coldCount} frios). `;
    } else if (coldCount > hotCount + 3) {
      summary += `focada em números frios (${coldCount} frios vs ${hotCount} quentes). `;
    } else {
      summary += `com ${hotCount} números quentes, ${coldCount} frios e ${balancedCount} balanceados. `;
    }

    // Análise par/ímpar
    if (Math.abs(evenCount - oddCount) <= 2) {
      summary += `A distribuição par/ímpar está boa (${evenCount} pares / ${oddCount} ímpares). `;
    } else {
      summary += `A distribuição par/ímpar poderia melhorar (atualmente ${evenCount} pares / ${oddCount} ímpares). `;
    }

    // Padrões identificados
    if (patterns.length > 0) {
      summary += `Identificamos ${patterns.length} padrão(ões) no seu jogo. `;
    }

    // Score geral
    if (score >= 8) {
      summary += `Excelente escolha!`;
    } else if (score >= 6) {
      summary += `Boas chances!`;
    } else {
      summary += `Considere as sugestões de melhoria.`;
    }

    return summary;
  }

  /**
   * Gera sugestões de melhoria
   */
  private static generateSuggestions(data: {
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    evenCount: number;
    oddCount: number;
    consecutiveSequences: number[][];
    multiplesOf5: number[];
    expectedCount: number;
  }): string[] {
    const suggestions: string[] = [];
    const { hotCount, coldCount, balancedCount, evenCount, oddCount, consecutiveSequences, multiplesOf5, expectedCount } = data;

    // Sugestões hot/cold
    const idealRatio = expectedCount / 3;
    if (hotCount < idealRatio - 3) {
      suggestions.push(`Adicione mais números quentes para melhorar a probabilidade.`);
    }
    if (coldCount > idealRatio + 3) {
      suggestions.push(`Reduza a quantidade de números frios (${coldCount} é alto).`);
    }

    // Sugestões par/ímpar
    if (Math.abs(evenCount - oddCount) > 4) {
      const target = evenCount > oddCount ? 'ímpares' : 'pares';
      suggestions.push(`Balance melhor a distribuição: adicione mais números ${target}.`);
    }

    // Sugestões sobre padrões
    if (consecutiveSequences.length > 0) {
      suggestions.push(`Evite sequências consecutivas longas - elas raramente são sorteadas juntas.`);
    }

    if (multiplesOf5.length > expectedCount / 5) {
      suggestions.push(`Muitos múltiplos de 5 (${multiplesOf5.length}). Diversifique mais.`);
    }

    // Sugestão geral se score baixo
    if (suggestions.length === 0) {
      suggestions.push(`Seu jogo está bem equilibrado! Mantenha essa estratégia.`);
    }

    return suggestions;
  }

  /**
   * Calcula desvio padrão
   */
  private static calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Salva sessão de criação manual (analytics)
   */
  static async saveManualSession(params: {
    lotteryType: string;
    contestNumber: number;
    selectedNumbers: number[];
    analysisResult: AnalysisResult;
    timeSpent: {
      step1: number;
      step2: number;
      step3: number;
      step4: number;
    };
  }): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('manual_creation_sessions')
        .insert({
          user_id: user.id,
          lottery_type: params.lotteryType,
          contest_number: params.contestNumber,
          selected_numbers: params.selectedNumbers,
          analysis_result: params.analysisResult as any,
          completed_at: new Date().toISOString(),
          time_spent_step1: params.timeSpent.step1,
          time_spent_step2: params.timeSpent.step2,
          time_spent_step3: params.timeSpent.step3,
          time_spent_step4: params.timeSpent.step4,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao salvar sessão manual:', error);
        return { success: false, error: error.message };
      }

      return { success: true, sessionId: data.id };
    } catch (error) {
      console.error('Erro inesperado ao salvar sessão:', error);
      return { success: false, error: 'Erro inesperado' };
    }
  }
}

export default ManualGameAnalysisService;
```

### Service: `gameVariationsService.ts`

**Local:** `app/src/services/gameVariationsService.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { AnalysisResult } from './manualGameAnalysisService';

export interface GenerateVariationsParams {
  originalNumbers: number[];
  lotteryType: 'lotofacil' | 'lotomania';
  contestNumber: number;
}

export interface Variation {
  id: string;
  numbers: number[];
  strategy: string;
  score: number;
  analysisResult: AnalysisResult;
  changedNumbers: {
    removed: number[];
    added: number[];
  };
}

export class GameVariationsService {
  /**
   * Gera 5 variações otimizadas a partir dos números originais
   * Opção C (Q16): Aplica sugestões da IA mantendo 60-70% dos números originais
   */
  static async generateVariations(params: GenerateVariationsParams): Promise<{
    success: boolean;
    data?: Variation[];
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar hot/cold numbers do concurso
      const { data: historicalData, error: histError } = await supabase
        .from('lottery_analyses')
        .select('hot_numbers, cold_numbers')
        .eq('lottery_type', params.lotteryType)
        .eq('contest_number', params.contestNumber)
        .maybeSingle();

      if (histError) {
        console.error('Erro ao buscar histórico:', histError);
      }

      const hotNumbers = historicalData?.hot_numbers || [];
      const coldNumbers = historicalData?.cold_numbers || [];
      const allNumbers = params.lotteryType === 'lotofacil'
        ? Array.from({ length: 25 }, (_, i) => i + 1)
        : Array.from({ length: 100 }, (_, i) => i + 1);

      const expectedCount = params.lotteryType === 'lotofacil' ? 15 : 50;

      // 5 estratégias de variação
      const strategies = [
        'balanced',
        'hot_focused',
        'cold_focused',
        'even_odd_optimized',
        'dezena_optimized'
      ];

      const variations: Variation[] = [];

      for (const strategy of strategies) {
        const variation = this.generateSingleVariation({
          originalNumbers: params.originalNumbers,
          strategy,
          hotNumbers,
          coldNumbers,
          allNumbers,
          expectedCount
        });

        // Analisar variação (reutilizar ManualGameAnalysisService)
        const { ManualGameAnalysisService } = await import('./manualGameAnalysisService');
        const analysisResult = await ManualGameAnalysisService.analyzeManualGame({
          lotteryType: params.lotteryType,
          contestNumber: params.contestNumber,
          selectedNumbers: variation
        });

        if (analysisResult.success && analysisResult.data) {
          // Identificar números alterados
          const removed = params.originalNumbers.filter(n => !variation.includes(n));
          const added = variation.filter(n => !params.originalNumbers.includes(n));

          variations.push({
            id: crypto.randomUUID(),
            numbers: variation,
            strategy,
            score: analysisResult.data.score,
            analysisResult: analysisResult.data,
            changedNumbers: { removed, added }
          });
        }
      }

      // Salvar variações no banco (opcional)
      const variationsToInsert = variations.map(v => ({
        user_id: user.id,
        original_numbers: params.originalNumbers,
        original_contest_number: params.contestNumber,
        original_lottery_type: params.lotteryType,
        variation_numbers: v.numbers,
        variation_strategy: v.strategy,
        variation_score: v.score,
        analysis_result: v.analysisResult as any
      }));

      const { error: insertError } = await supabase
        .from('manual_game_variations')
        .insert(variationsToInsert);

      if (insertError) {
        console.error('Erro ao salvar variações:', insertError);
        // Não retornar erro, variações ainda são geradas
      }

      return { success: true, data: variations };
    } catch (error) {
      console.error('Erro ao gerar variações:', error);
      return {
        success: false,
        error: 'Erro inesperado ao gerar variações'
      };
    }
  }

  /**
   * Gera uma variação baseada em estratégia específica
   * Mantém 60-70% dos números originais
   */
  private static generateSingleVariation(config: {
    originalNumbers: number[];
    strategy: string;
    hotNumbers: number[];
    coldNumbers: number[];
    allNumbers: number[];
    expectedCount: number;
  }): number[] {
    const { originalNumbers, strategy, hotNumbers, coldNumbers, allNumbers, expectedCount } = config;

    // Definir quantos números manter (60-70%)
    const keepCount = Math.floor(expectedCount * (0.6 + Math.random() * 0.1));
    const changeCount = expectedCount - keepCount;

    // Selecionar números a manter aleatoriamente
    const shuffledOriginal = [...originalNumbers].sort(() => Math.random() - 0.5);
    const toKeep = shuffledOriginal.slice(0, keepCount);
    const availableNumbers = allNumbers.filter(n => !toKeep.includes(n));

    let numbersToAdd: number[] = [];

    switch (strategy) {
      case 'balanced':
        // Mix balanceado de hot/cold/balanced
        const hotToAdd = Math.floor(changeCount / 3);
        const coldToAdd = Math.floor(changeCount / 3);
        const balancedToAdd = changeCount - hotToAdd - coldToAdd;

        numbersToAdd = [
          ...this.selectRandom(availableNumbers.filter(n => hotNumbers.includes(n)), hotToAdd),
          ...this.selectRandom(availableNumbers.filter(n => coldNumbers.includes(n)), coldToAdd),
          ...this.selectRandom(availableNumbers.filter(n => !hotNumbers.includes(n) && !coldNumbers.includes(n)), balancedToAdd)
        ];
        break;

      case 'hot_focused':
        // Priorizar números quentes
        const hotAvailable = availableNumbers.filter(n => hotNumbers.includes(n));
        numbersToAdd = this.selectRandom(hotAvailable, Math.min(changeCount, hotAvailable.length));
        // Completar com balanceados se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      case 'cold_focused':
        // Priorizar números frios
        const coldAvailable = availableNumbers.filter(n => coldNumbers.includes(n));
        numbersToAdd = this.selectRandom(coldAvailable, Math.min(changeCount, coldAvailable.length));
        // Completar com balanceados se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      case 'even_odd_optimized':
        // Otimizar distribuição par/ímpar (50/50)
        const currentEven = toKeep.filter(n => n % 2 === 0).length;
        const currentOdd = keepCount - currentEven;
        const targetEven = Math.floor(expectedCount / 2);
        const targetOdd = expectedCount - targetEven;

        const needEven = Math.max(0, targetEven - currentEven);
        const needOdd = Math.max(0, targetOdd - currentOdd);

        numbersToAdd = [
          ...this.selectRandom(availableNumbers.filter(n => n % 2 === 0), needEven),
          ...this.selectRandom(availableNumbers.filter(n => n % 2 === 1), needOdd)
        ];

        // Completar se necessário
        if (numbersToAdd.length < changeCount) {
          const remaining = changeCount - numbersToAdd.length;
          numbersToAdd.push(...this.selectRandom(availableNumbers.filter(n => !numbersToAdd.includes(n)), remaining));
        }
        break;

      case 'dezena_optimized':
        // Otimizar distribuição por dezenas
        numbersToAdd = this.selectRandom(availableNumbers, changeCount);
        // TODO: Implementar lógica mais sofisticada de balanceamento por dezenas
        break;

      default:
        numbersToAdd = this.selectRandom(availableNumbers, changeCount);
    }

    return [...toKeep, ...numbersToAdd].sort((a, b) => a - b);
  }

  /**
   * Seleciona N números aleatórios de um array
   */
  private static selectRandom(array: number[], count: number): number[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
}

export default GameVariationsService;
```

---

## 🪝 React Hooks

### Hook: `useManualGameCreation.ts`

**Local:** `app/src/hooks/useManualGameCreation.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ManualGameAnalysisService, type ManualGameAnalysisParams, type AnalysisResult } from '@/services/manualGameAnalysisService';
import { GameVariationsService, type GenerateVariationsParams, type Variation } from '@/services/gameVariationsService';
import { useToast } from '@/hooks/useToast';

export type StepNumber = 1 | 2 | 3 | 4;

export interface ManualGameState {
  currentStep: StepNumber;
  lotteryType: 'lotofacil' | 'lotomania' | null;
  contestNumber: number | null;
  selectedNumbers: number[];
  analysisResult: AnalysisResult | null;
  variations: Variation[];
  timeSpent: {
    step1: number;
    step2: number;
    step3: number;
    step4: number;
  };
}

export function useManualGameCreation() {
  const { toast } = useToast();

  const [state, setState] = useState<ManualGameState>({
    currentStep: 1,
    lotteryType: null,
    contestNumber: null,
    selectedNumbers: [],
    analysisResult: null,
    variations: [],
    timeSpent: { step1: 0, step2: 0, step3: 0, step4: 0 }
  });

  // Rastrear tempo gasto em cada etapa
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  useEffect(() => {
    setStepStartTime(Date.now());
  }, [state.currentStep]);

  // Atualizar tempo gasto ao mudar de etapa
  const updateTimeSpent = useCallback((step: StepNumber) => {
    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    setState(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [`step${step}`]: prev.timeSpent[`step${step}` as keyof typeof prev.timeSpent] + timeSpent
      }
    }));
  }, [stepStartTime]);

  // Navegação entre etapas
  const goToStep = useCallback((step: StepNumber) => {
    updateTimeSpent(state.currentStep);
    setState(prev => ({ ...prev, currentStep: step }));
  }, [state.currentStep, updateTimeSpent]);

  const nextStep = useCallback(() => {
    if (state.currentStep < 4) {
      goToStep((state.currentStep + 1) as StepNumber);
    }
  }, [state.currentStep, goToStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      goToStep((state.currentStep - 1) as StepNumber);
    }
  }, [state.currentStep, goToStep]);

  // Etapa 1: Selecionar loteria
  const selectLottery = useCallback((lotteryType: 'lotofacil' | 'lotomania') => {
    setState(prev => ({ ...prev, lotteryType }));
  }, []);

  // Etapa 2: Selecionar concurso
  const selectContest = useCallback((contestNumber: number) => {
    setState(prev => ({ ...prev, contestNumber }));
  }, []);

  // Etapa 3: Adicionar/remover número
  const toggleNumber = useCallback((number: number) => {
    setState(prev => {
      const isSelected = prev.selectedNumbers.includes(number);
      const expectedCount = prev.lotteryType === 'lotofacil' ? 15 : 50;

      if (isSelected) {
        return {
          ...prev,
          selectedNumbers: prev.selectedNumbers.filter(n => n !== number)
        };
      } else {
        if (prev.selectedNumbers.length >= expectedCount) {
          toast({
            variant: 'destructive',
            title: 'Limite atingido',
            description: `Você já selecionou ${expectedCount} números.`
          });
          return prev;
        }
        return {
          ...prev,
          selectedNumbers: [...prev.selectedNumbers, number].sort((a, b) => a - b)
        };
      }
    });
  }, [toast]);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedNumbers: [] }));
  }, []);

  // Seleção aleatória
  const randomSelection = useCallback(() => {
    if (!state.lotteryType) return;

    const expectedCount = state.lotteryType === 'lotofacil' ? 15 : 50;
    const maxNumber = state.lotteryType === 'lotofacil' ? 25 : 100;

    const numbers: number[] = [];
    while (numbers.length < expectedCount) {
      const num = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    setState(prev => ({ ...prev, selectedNumbers: numbers.sort((a, b) => a - b) }));

    toast({
      title: '🎲 Seleção aleatória concluída!',
      description: `${expectedCount} números selecionados.`
    });
  }, [state.lotteryType, toast]);

  // Etapa 4: Analisar jogo
  const analyzeGame = useMutation({
    mutationFn: () => {
      if (!state.lotteryType || !state.contestNumber) {
        throw new Error('Dados incompletos');
      }

      const params: ManualGameAnalysisParams = {
        lotteryType: state.lotteryType,
        contestNumber: state.contestNumber,
        selectedNumbers: state.selectedNumbers
      };

      return ManualGameAnalysisService.analyzeManualGame(params);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setState(prev => ({ ...prev, analysisResult: result.data! }));
        toast({
          title: '✅ Análise concluída!',
          description: `Score: ${result.data.score}/10`
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro na análise',
          description: result.error || 'Erro desconhecido'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao analisar jogo',
        description: error.message
      });
    }
  });

  // Gerar variações
  const generateVariations = useMutation({
    mutationFn: () => {
      if (!state.lotteryType || !state.contestNumber) {
        throw new Error('Dados incompletos');
      }

      const params: GenerateVariationsParams = {
        originalNumbers: state.selectedNumbers,
        lotteryType: state.lotteryType,
        contestNumber: state.contestNumber
      };

      return GameVariationsService.generateVariations(params);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        setState(prev => ({ ...prev, variations: result.data! }));
        toast({
          title: '🔄 5 variações geradas!',
          description: 'Explore as opções otimizadas pela IA.'
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao gerar variações',
          description: result.error || 'Erro desconhecido'
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao gerar variações',
        description: error.message
      });
    }
  });

  // Reiniciar stepper
  const resetStepper = useCallback(() => {
    setState({
      currentStep: 1,
      lotteryType: null,
      contestNumber: null,
      selectedNumbers: [],
      analysisResult: null,
      variations: [],
      timeSpent: { step1: 0, step2: 0, step3: 0, step4: 0 }
    });
  }, []);

  // Validações por etapa
  const canProceedToStep2 = state.lotteryType !== null;
  const canProceedToStep3 = state.contestNumber !== null;
  const canProceedToStep4 = state.lotteryType &&
    state.selectedNumbers.length === (state.lotteryType === 'lotofacil' ? 15 : 50);

  return {
    // Estado
    state,

    // Navegação
    goToStep,
    nextStep,
    prevStep,
    resetStepper,

    // Etapa 1
    selectLottery,

    // Etapa 2
    selectContest,

    // Etapa 3
    toggleNumber,
    clearSelection,
    randomSelection,

    // Etapa 4
    analyzeGame,
    generateVariations,

    // Validações
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
  };
}
```

### Hook: `useTourGuide.ts`

**Local:** `app/src/hooks/useTourGuide.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface TourStep {
  id: string;
  target: string; // CSS selector do elemento
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export function useTourGuide(tourId: string, steps: TourStep[]) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default true para não mostrar até verificar

  // Verificar se usuário já viu o tour
  useEffect(() => {
    const checkTourStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_manual_creation_tour')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        const seen = data.has_seen_manual_creation_tour || false;
        setHasSeenTour(seen);
        if (!seen) {
          setIsActive(true); // Ativar tour automaticamente
        }
      }
    };

    checkTourStatus();
  }, [tourId]);

  // Marcar tour como visto
  const markTourAsSeen = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('profiles')
      .update({ has_seen_manual_creation_tour: true })
      .eq('id', user.id);

    setHasSeenTour(true);
    setIsActive(false);
  };

  // Navegar entre etapas
  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      markTourAsSeen();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipTour = () => {
    markTourAsSeen();
  };

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps: steps.length,
    isLastStep,
    hasSeenTour,
    nextStep,
    prevStep,
    skipTour,
    startTour: () => setIsActive(true),
  };
}
```

---

## 🎨 Componentes UI

Devido ao tamanho extenso, vou criar um resumo dos principais componentes. Os detalhes completos podem ser expandidos na implementação:

### Componentes Principais

1. **`ManualGameCreationPage.tsx`**
   - Container principal com stepper
   - Gerencia estado global do fluxo
   - Renderiza componentes por etapa

2. **`ManualGameStepper.tsx`**
   - Stepper visual (1 → 2 → 3 → 4)
   - Indicadores de progresso
   - Navegação clicável em etapas completadas

3. **`Step1_LotterySelector.tsx`**
   - Cards de seleção de loteria
   - Visual atraente com ícones

4. **`Step2_ContestSelector.tsx`**
   - Radio buttons para "Próximo" vs "Passado"
   - Dropdown dos últimos 50 concursos
   - Input de número específico

5. **`Step3_NumberGrid.tsx`**
   - Grid interativo de números (igual landing page)
   - Contador "X/15 selecionados"
   - Botões "Limpar" e "Aleatório"

6. **`Step4_AnalysisResult.tsx`**
   - Score visual com estrelas
   - Resumo textual
   - Botão "Ver Detalhes" → Modal
   - Ações: Salvar, Gerar Variações, Editar, Novo

7. **`AnalysisDetailsModal.tsx`**
   - Modal completo com gráficos
   - Análise detalhada
   - Sugestões da IA

8. **`VariationsGrid.tsx`**
   - Grid com 5 cards de variações
   - Destaque de números alterados
   - Botão "Salvar" em cada card

9. **`TourGuideOverlay.tsx`**
   - Overlay com spotlight no elemento atual
   - Popup com explicação
   - Botões "Anterior", "Próximo", "Pular"

10. **`TooltipInfo.tsx`**
    - Ícone ℹ️ com hover/click
    - Tooltip contextual

---

## 📊 Sistema de Análise Híbrida (Q15)

### Componente Visual do Score

```typescript
// AnalysisScoreDisplay.tsx
interface Props {
  score: number; // 0-10
  summary: string;
  onViewDetails: () => void;
}

export function AnalysisScoreDisplay({ score, summary, onViewDetails }: Props) {
  const stars = Math.round(score / 2); // Converter 0-10 para 0-5 estrelas

  return (
    <div className="analysis-score">
      <div className="score-header">
        <span className="score-label">Score:</span>
        <span className="score-value">{score}/10</span>
      </div>

      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <Star key={i} filled={i < stars} />
        ))}
      </div>

      <p className="summary">{summary}</p>

      <Button variant="outline" onClick={onViewDetails}>
        🔍 Ver Detalhes da Análise
      </Button>
    </div>
  );
}
```

### Modal de Detalhes Completos

- **Gráficos:**
  - Pizza: Distribuição hot/cold/balanced
  - Barras: Distribuição par/ímpar
  - Barras: Distribuição por dezenas

- **Tabelas:**
  - Padrões identificados
  - Sugestões de melhoria
  - Comparação com média histórica

---

## 🔄 Gerar Variações (5 Opções) - Opção C (Q16)

### Lógica de Geração

Cada variação mantém 60-70% dos números originais e substitui 30-40% conforme estratégia:

| Variação | Estratégia | Descrição |
|----------|-----------|-----------|
| 1 | Balanceada | Mix equilibrado de hot/cold/balanced |
| 2 | Focada em Quentes | Substitui por números hot |
| 3 | Focada em Frios | Substitui por números cold |
| 4 | Otimizada Par/Ímpar | Melhora distribuição 50/50 |
| 5 | Otimizada por Dezenas | Distribui melhor entre dezenas |

### UI de Variações

```
┌─────────────────────────────────────────────────────────────────┐
│                      5 VARIAÇÕES OTIMIZADAS                     │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  Variação 1: Balanceada                           Score: 8.2  ║
╠═══════════════════════════════════════════════════════════════╣
║  [01] [03] [04] 06  08  [10] [11] [12] 14  [17] [19]         ║
║  21  [23] [24] [25]                                           ║
║                                                               ║
║  ✅ Mantidos: 10  |  ➕ Adicionados: 5  |  ➖ Removidos: 5   ║
║  Alterações: 06, 08, 14, 21 substituídos por ...             ║
║                                                               ║
║  [❤️ Salvar]  [👁️ Ver Detalhes]                             ║
╚═══════════════════════════════════════════════════════════════╝

(Repetir para as 5 variações)
```

**Legenda:**
- `[XX]` = Número mantido do original
- `XX` = Número adicionado (novo)

---

## 🎓 Tour Guide & Tooltips (Q18)

### Tour Guide (7 Etapas)

```typescript
const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '👋 Bem-vindo à Criação Manual!',
    content: 'Aqui você cria seus próprios jogos e recebe análise completa da IA. Vamos fazer um tour rápido?',
    placement: 'center'
  },
  {
    id: 'step1',
    target: '[data-tour="lottery-selector"]',
    title: '1️⃣ Escolha a Loteria',
    content: 'Primeiro, selecione se quer jogar Lotofácil (15 números) ou Lotomania (50 números).',
    placement: 'bottom'
  },
  {
    id: 'step2',
    target: '[data-tour="contest-selector"]',
    title: '2️⃣ Escolha o Concurso',
    content: 'Selecione o concurso para a IA usar o histórico correto na análise.',
    placement: 'bottom'
  },
  {
    id: 'step3',
    target: '[data-tour="number-grid"]',
    title: '3️⃣ Selecione os Números',
    content: 'Clique nos números para montar seu jogo. Use "Aleatório" para preencher rapidamente!',
    placement: 'top'
  },
  {
    id: 'step4',
    target: '[data-tour="analysis-result"]',
    title: '4️⃣ Veja a Análise',
    content: 'A IA analisa seu jogo e dá um score de 0-10. Clique em "Ver Detalhes" para análise completa!',
    placement: 'top'
  },
  {
    id: 'variations',
    target: '[data-tour="generate-variations"]',
    title: '🔄 Gere Variações',
    content: 'A IA pode gerar 5 variações otimizadas mantendo parte dos seus números!',
    placement: 'top'
  },
  {
    id: 'save',
    target: '[data-tour="save-button"]',
    title: '❤️ Salve seus Jogos',
    content: 'Gostou? Salve o jogo para acessar depois em "Meus Jogos"!',
    placement: 'top'
  }
];
```

### Tooltips Contextuais

| Elemento | Tooltip |
|----------|---------|
| Lotofácil | "15 números entre 1-25. Sorteios Seg-Sex." |
| Lotomania | "50 números entre 1-100. Sorteios Ter-Qui-Sáb." |
| Concurso | "A IA usa o histórico do concurso para análise mais precisa" |
| Números Quentes | "Sorteados 15+ vezes nos últimos 50 concursos" |
| Números Frios | "Sorteados < 5 vezes nos últimos 50 concursos" |
| Score | "0-10: Quanto maior, melhor a distribuição estatística" |
| Gerar Variações | "Mantém 60-70% dos seus números e otimiza o restante" |

---

## 🖼️ Wireframes ASCII

### Wireframe Completo: Fluxo de 4 Etapas

```
┌─────────────────────────────────────────────────────────────────┐
│                   CRIAR JOGO MANUALMENTE                        │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  STEPPER: ● ─────── ○ ─────── ○ ─────── ○                    ║
║          [1]       [2]       [3]       [4]                     ║
║        Loteria  Concurso  Números   Análise                   ║
╚═══════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════
ETAPA 1: ESCOLHER LOTERIA
════════════════════════════════════════════════════════════════

Selecione o tipo de loteria:

┌──────────────────────────┐     ┌──────────────────────────┐
│    🎱 LOTOFÁCIL          │     │    🎰 LOTOMANIA         │
│                          │     │                          │
│  • 15 números            │     │  • 50 números            │
│  • Range: 1 a 25         │     │  • Range: 1 a 100        │
│  • Sorteio: Seg-Sex      │     │  • Sorteio: Ter-Qui-Sáb  │
│                          │     │                          │
│  [Selecionar] ●          │     │  [Selecionar] ○          │
└──────────────────────────┘     └──────────────────────────┘

                    [Próximo →]

════════════════════════════════════════════════════════════════
ETAPA 2: ESCOLHER CONCURSO
════════════════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════════╗
║  STEPPER: ✓ ───●─── ○ ─────── ○ ─────── ○                    ║
║          [1]       [2]       [3]       [4]                     ║
╚═══════════════════════════════════════════════════════════════╝

Escolha o concurso para análise:

┌──────────────────────────────────────────────────────────────┐
│  ● Próximo Concurso  (Lotofácil #3206 - Estimado: 06/01/25) │
│                                                               │
│  ○ Concurso Passado:                                         │
│     [Dropdown: Últimos 50 concursos ▼]                       │
│                                                               │
│  ○ Número Específico:                                        │
│     [Input: Digite o número do concurso]                     │
└──────────────────────────────────────────────────────────────┘

                [← Voltar]  [Próximo →]

════════════════════════════════════════════════════════════════
ETAPA 3: SELECIONAR NÚMEROS
════════════════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════════╗
║  STEPPER: ✓ ───✓─── ●  ─────── ○ ─────── ○                  ║
║          [1]       [2]       [3]       [4]                     ║
╚═══════════════════════════════════════════════════════════════╝

Clique nos números para montar seu jogo:

Selecionados: 12/15 números  [🗑️ Limpar]  [🎲 Aleatório]

┌────────────────────────────────────────────────────────────────┐
│  [01]✓ [02]  [03]✓ [04]✓ [05]  [06]✓ [07]  [08]✓ [09]  [10]✓ │
│  [11]✓ [12]✓ [13]  [14]  [15]✓ [16]  [17]✓ [18]  [19]✓ [20]  │
│  [21]  [22]  [23]  [24]  [25]                                  │
└────────────────────────────────────────────────────────────────┘

              [← Voltar]  [Analisar Jogo →]  (disabled)

════════════════════════════════════════════════════════════════
ETAPA 4: VER ANÁLISE
════════════════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════════╗
║  STEPPER: ✓ ───✓─── ✓  ───●─── ●                            ║
║          [1]       [2]       [3]       [4]                     ║
╚═══════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════╗
║  📊 ANÁLISE DO SEU JOGO                                        ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Números selecionados:                                         ║
║  [01] [03] [04] [06] [08] [10] [11] [12] [15] [17] [19]       ║
║  [21] [23] [24] [25]                                           ║
║                                                                 ║
║  ⭐ Score: 7.5/10  (⭐⭐⭐⭐☆)                                 ║
║                                                                 ║
║  📊 Resumo:                                                     ║
║  Seu jogo tem uma distribuição balanceada com 5 números        ║
║  quentes, 4 frios e 6 balanceados. Boa cobertura de dezenas!  ║
║                                                                 ║
║  [🔍 Ver Detalhes da Análise]                                  ║
║                                                                 ║
║  🔥 Quentes: 5  |  ❄️ Frios: 4  |  ⚖️ Balanceados: 6          ║
║  👥 Par/Ímpar: 8 / 7                                           ║
╚═══════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────┐
│  [❤️ Salvar]  [🔄 Gerar 5 Variações]  [✏️ Editar]  [🆕 Novo] │
└───────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════
MODAL: DETALHES DA ANÁLISE
════════════════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════════╗
║  🔍 ANÁLISE DETALHADA                                    [X]  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Score: 7.5/10  (⭐⭐⭐⭐☆)                                   ║
║  Classificação: Acima da média                                 ║
║                                                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  DISTRIBUIÇÃO HOT/COLD/BALANCED (Gráfico Pizza)         │ ║
║  │                                                           │ ║
║  │   🔥 Quentes: 33%                                        │ ║
║  │   ❄️ Frios: 27%                                          │ ║
║  │   ⚖️ Balanceados: 40%                                    │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                 ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  DISTRIBUIÇÃO PAR/ÍMPAR (Gráfico Barras)                │ ║
║  │                                                           │ ║
║  │   Pares:   ████████ 53%                                  │ ║
║  │   Ímpares: ███████  47%                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                 ║
║  📍 PADRÕES IDENTIFICADOS:                                     ║
║  • Sequência consecutiva: 10, 11, 12                          ║
║  • 3 múltiplos de 5: 05, 10, 15                               ║
║                                                                 ║
║  💡 SUGESTÕES DA IA:                                           ║
║  • Evite sequências consecutivas longas                       ║
║  • Balance melhor a distribuição par/ímpar                    ║
║                                                                 ║
║                                    [Entendi]                   ║
╚═══════════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════════════
5 VARIAÇÕES GERADAS
════════════════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════════╗
║  Variação 1: Balanceada                           Score: 8.2  ║
╠═══════════════════════════════════════════════════════════════╣
║  [01] [03] [04] 06  08  [10] [11] [12] 14  [17] [19]         ║
║  21  [23] [24] [25]                                           ║
║                                                               ║
║  ✅ Mantidos: 10  |  ➕ Adicionados: 5                        ║
║                                                               ║
║  [❤️ Salvar]  [👁️ Ver Detalhes]                             ║
╚═══════════════════════════════════════════════════════════════╝

(Repetir para variações 2-5)
```

---

## ✅ Checklist de Implementação

### Backend (Supabase) - 8 horas

- [ ] **[2h]** Criar migration `20250103000003_create_manual_creation_tables.sql`
  - [ ] Flag `has_seen_manual_creation_tour` em profiles
  - [ ] Tabela `manual_creation_sessions` (analytics)
  - [ ] Tabela `manual_game_variations`
  - [ ] RLS policies completas

- [ ] **[2h]** Testar migrations em ambiente local
  - [ ] Verificar tabelas criadas
  - [ ] Testar RLS com múltiplos usuários
  - [ ] Inserir dados de teste

- [ ] **[2h]** Aplicar migrations em produção
  - [ ] Backup do banco de dados
  - [ ] `supabase db push`
  - [ ] Verificar tabelas em produção

- [ ] **[2h]** Atualizar tipos TypeScript
  - [ ] Regenerar tipos: `supabase gen types typescript`
  - [ ] Verificar novos tipos disponíveis

### Services - 10 horas

- [ ] **[5h]** Implementar `manualGameAnalysisService.ts`
  - [ ] `analyzeManualGame()` com cálculo de score
  - [ ] Classificação hot/cold/balanced
  - [ ] Análise par/ímpar
  - [ ] Análise por dezenas
  - [ ] Identificação de padrões
  - [ ] Geração de resumo textual
  - [ ] Geração de sugestões
  - [ ] `saveManualSession()` (analytics)
  - [ ] Testes unitários

- [ ] **[5h]** Implementar `gameVariationsService.ts`
  - [ ] `generateVariations()` para 5 estratégias
  - [ ] Lógica de manter 60-70% dos números
  - [ ] Estratégia Balanceada
  - [ ] Estratégia Focada em Quentes
  - [ ] Estratégia Focada em Frios
  - [ ] Estratégia Otimizada Par/Ímpar
  - [ ] Estratégia Otimizada por Dezenas
  - [ ] Salvar variações no banco
  - [ ] Testes unitários

### Hooks - 6 horas

- [ ] **[4h]** Implementar `useManualGameCreation.ts`
  - [ ] Estado global do stepper
  - [ ] Navegação entre etapas
  - [ ] Rastreamento de tempo por etapa
  - [ ] `selectLottery()`
  - [ ] `selectContest()`
  - [ ] `toggleNumber()`, `clearSelection()`, `randomSelection()`
  - [ ] `analyzeGame` mutation
  - [ ] `generateVariations` mutation
  - [ ] `resetStepper()`
  - [ ] Validações por etapa

- [ ] **[2h]** Implementar `useTourGuide.ts`
  - [ ] Verificar flag `has_seen_manual_creation_tour`
  - [ ] Gerenciar etapas do tour
  - [ ] `nextStep()`, `prevStep()`, `skipTour()`
  - [ ] `markTourAsSeen()` (atualizar banco)

### Componentes UI - 16 horas

- [ ] **[2h]** `ManualGameCreationPage.tsx`
  - [ ] Container principal
  - [ ] Gerenciamento de estado global
  - [ ] Renderização condicional por etapa

- [ ] **[1h]** `ManualGameStepper.tsx`
  - [ ] Stepper visual (1 → 2 → 3 → 4)
  - [ ] Indicadores de progresso
  - [ ] Navegação clicável

- [ ] **[1h]** `Step1_LotterySelector.tsx`
  - [ ] Cards de Lotofácil e Lotomania
  - [ ] Visual atraente

- [ ] **[1h]** `Step2_ContestSelector.tsx`
  - [ ] Radio buttons + Dropdown + Input
  - [ ] Validação de concurso válido

- [ ] **[3h]** `Step3_NumberGrid.tsx`
  - [ ] Grid interativo (igual landing page)
  - [ ] Contador de seleção
  - [ ] Botões "Limpar" e "Aleatório"
  - [ ] Indicadores hot/cold (opcional)

- [ ] **[3h]** `Step4_AnalysisResult.tsx`
  - [ ] Score visual com estrelas
  - [ ] Resumo textual
  - [ ] Distribuições (hot/cold, par/ímpar)
  - [ ] Botões de ação

- [ ] **[2h]** `AnalysisDetailsModal.tsx`
  - [ ] Modal completo
  - [ ] Gráficos (pizza, barras)
  - [ ] Padrões identificados
  - [ ] Sugestões da IA

- [ ] **[2h]** `VariationsGrid.tsx`
  - [ ] Grid com 5 cards
  - [ ] Destaque de números alterados
  - [ ] Botão "Salvar" em cada card

- [ ] **[1h]** `TourGuideOverlay.tsx`
  - [ ] Overlay com spotlight
  - [ ] Popup com explicação
  - [ ] Navegação do tour

### Integração - 4 horas

- [ ] **[2h]** Configurar rota `/criar-jogo` ou `/manual-creation`
  - [ ] Adicionar no roteador
  - [ ] Layout com header/footer
  - [ ] Testar navegação

- [ ] **[1h]** Adicionar ponto de acesso na home
  - [ ] Card "Criar Jogo Manualmente"
  - [ ] Link no menu lateral

- [ ] **[1h]** Integrar com sistema de salvamento (Fase 2)
  - [ ] Toggle "Salvar" usa `SaveToggleButton` da Fase 2
  - [ ] Jogos manuais aparecem em "Meus Jogos" com badge

### Testes - 6 horas

- [ ] **[2h]** Testes unitários de services
  - [ ] Testar `analyzeManualGame()` com diferentes jogos
  - [ ] Testar `generateVariations()` com 5 estratégias
  - [ ] Validar scores calculados
  - [ ] Validar padrões identificados

- [ ] **[2h]** Testes de integração
  - [ ] Fluxo completo: selecionar loteria → concurso → números → análise
  - [ ] Gerar variações e verificar que mantém 60-70% dos números
  - [ ] Salvar jogo manual em `saved_games` com `source = 'manual_created'`

- [ ] **[2h]** Testes E2E (Playwright)
  - [ ] Cenário 1: Criar jogo manual Lotofácil do início ao fim
  - [ ] Cenário 2: Ver detalhes da análise
  - [ ] Cenário 3: Gerar 5 variações e salvar uma
  - [ ] Cenário 4: Tour guide na primeira visita
  - [ ] Cenário 5: Pular tour e criar jogo

### Documentação - 2 horas

- [ ] **[1h]** Atualizar README
  - [ ] Documentar feature "Criação Manual"
  - [ ] Explicar stepper de 4 etapas
  - [ ] Listar estratégias de variações

- [ ] **[1h]** Criar guia de usuário
  - [ ] Como criar jogos manualmente
  - [ ] Como interpretar análise
  - [ ] Como usar variações

### Deploy e Monitoramento - 2 horas

- [ ] **[1h]** Deploy em staging
  - [ ] Criar branch `feature/manual-creation`
  - [ ] Deploy em staging
  - [ ] Testes com usuários beta

- [ ] **[1h]** Deploy em produção
  - [ ] Merge para `main`
  - [ ] Deploy via CI/CD
  - [ ] Monitorar logs

---

## 🧪 Testes

### Testes Unitários

```typescript
describe('ManualGameAnalysisService', () => {
  it('should calculate score correctly for balanced game', async () => {
    const result = await ManualGameAnalysisService.analyzeManualGame({
      lotteryType: 'lotofacil',
      contestNumber: 3205,
      selectedNumbers: [1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 24, 25]
    });

    expect(result.success).toBe(true);
    expect(result.data?.score).toBeGreaterThan(5);
    expect(result.data?.hotCount).toBeGreaterThan(0);
  });

  it('should identify consecutive sequences', async () => {
    const result = await ManualGameAnalysisService.analyzeManualGame({
      lotteryType: 'lotofacil',
      contestNumber: 3205,
      selectedNumbers: [1, 2, 3, 4, 5, 10, 11, 12, 15, 16, 17, 20, 21, 22, 25]
    });

    expect(result.success).toBe(true);
    expect(result.data?.patterns.length).toBeGreaterThan(0);
    expect(result.data?.patterns.some(p => p.includes('consecutiva'))).toBe(true);
  });
});

describe('GameVariationsService', () => {
  it('should generate 5 variations with different strategies', async () => {
    const result = await GameVariationsService.generateVariations({
      originalNumbers: [1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 24, 25],
      lotteryType: 'lotofacil',
      contestNumber: 3205
    });

    expect(result.success).toBe(true);
    expect(result.data?.length).toBe(5);
    expect(result.data?.[0].strategy).toBe('balanced');
    expect(result.data?.[1].strategy).toBe('hot_focused');
  });

  it('should maintain 60-70% of original numbers', async () => {
    const originalNumbers = [1, 2, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 24, 25];
    const result = await GameVariationsService.generateVariations({
      originalNumbers,
      lotteryType: 'lotofacil',
      contestNumber: 3205
    });

    expect(result.success).toBe(true);

    result.data?.forEach(variation => {
      const keptNumbers = variation.numbers.filter(n => originalNumbers.includes(n));
      const keepPercentage = (keptNumbers.length / 15) * 100;

      expect(keepPercentage).toBeGreaterThanOrEqual(60);
      expect(keepPercentage).toBeLessThanOrEqual(70);
    });
  });
});
```

### Testes E2E

```typescript
test('should complete manual game creation flow', async ({ page }) => {
  await page.goto('/criar-jogo');

  // Etapa 1: Selecionar Lotofácil
  await page.click('button:has-text("Selecionar"):near(:text("LOTOFÁCIL"))');
  await page.click('button:has-text("Próximo")');

  // Etapa 2: Selecionar próximo concurso
  await expect(page.locator('input[type="radio"]:checked')).toBeVisible();
  await page.click('button:has-text("Próximo")');

  // Etapa 3: Selecionar 15 números
  for (let i = 1; i <= 15; i++) {
    await page.click(`button:has-text("${i.toString().padStart(2, '0')}")`).first();
  }

  // Verificar contador
  await expect(page.locator('text=15/15 números')).toBeVisible();

  // Analisar jogo
  await page.click('button:has-text("Analisar Jogo")');

  // Etapa 4: Verificar análise
  await expect(page.locator('text=/Score: \\d\\.\\d\\/10/')).toBeVisible();
  await expect(page.locator('text=/⭐/')).toBeVisible();

  // Gerar variações
  await page.click('button:has-text("Gerar 5 Variações")');

  await expect(page.locator('text=5 variações geradas')).toBeVisible();
});
```

---

## 📚 Resumo e Próximos Passos

### Resumo da Fase 3

A **Fase 3: Sistema de Criação Manual de Jogos** adiciona funcionalidade completa para usuários criarem e analisarem seus próprios jogos:

✅ **Funcionalidades Implementadas:**
- Stepper de 4 etapas (Loteria → Concurso → Números → Análise)
- Grid interativo de seleção de números
- Análise híbrida da IA (score + resumo + detalhes)
- Gerar 5 variações otimizadas (mantém 60-70% dos números)
- Tour guide educativo para primeira visita
- Tooltips contextuais em elementos-chave
- Integração com sistema de salvamento (Fase 2)
- Analytics de sessões de criação manual

✅ **Arquitetura:**
- Tabelas `manual_creation_sessions` e `manual_game_variations`
- Flag `has_seen_manual_creation_tour` em profiles
- Services robustos com análise estatística
- Hooks React com gerenciamento de estado complexo
- 9 componentes UI especializados

### Próximos Passos

1. **Revisar e Aprovar Especificação Fase 3**
   - Validar todas as decisões técnicas
   - Confirmar wireframes e fluxos

2. **Criar Migrations SQL Consolidadas**
   - Arquivo único com todas as migrations (Fases 1-3)
   - Ordem de execução correta

3. **Criar Wireframes Finais ASCII Consolidados**
   - Documento único com todos os fluxos visuais
   - Referência completa para implementação

4. **Iniciar Implementação**
   - Seguir checklists das 3 fases
   - Branches organizadas por fase
   - Code review após cada fase

---

**Última atualização:** 2025-01-03
**Responsável:** Claude Code
**Estimativa Total Fase 3:** 50 horas (~6.3 dias)
**Status:** ✅ Especificação Completa - Aguardando Revisão

**Estimativa Total (Fases 1-3):** 136 horas (~17 dias de trabalho)
