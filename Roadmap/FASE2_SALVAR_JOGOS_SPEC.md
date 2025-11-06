# 📌 FASE 2: Sistema de Salvamento de Jogos

**Estimativa:** 44 horas
**Prioridade:** Alta
**Dependências:** Fase 1 (Sistema de Regeneração)
**Status:** Especificação Completa

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos Funcionais](#requisitos-funcionais)
3. [Arquitetura de Banco de Dados](#arquitetura-de-banco-de-dados)
4. [Migrations SQL](#migrations-sql)
5. [Services TypeScript](#services-typescript)
6. [React Hooks](#react-hooks)
7. [Componentes UI](#componentes-ui)
8. [Fluxos de Usuário](#fluxos-de-usuário)
9. [Pontos de Acesso](#pontos-de-acesso)
10. [Wireframes ASCII](#wireframes-ascii)
11. [Checklist de Implementação](#checklist-de-implementação)
12. [Testes](#testes)

---

## 🎯 Visão Geral

### Objetivo
Permitir que usuários salvem jogos gerados pela IA (ou criados manualmente na Fase 3) para consulta posterior, com ações de visualizar, editar nome, compartilhar, marcar como jogado e excluir.

### Decisões de Design Consolidadas

Com base nas respostas do Bruno (Q1-Q30):

| Decisão | Escolha Final |
|---------|---------------|
| **Fluxo de Salvamento** | Fluxo D: Toggle instantâneo + opção de nomear depois |
| **Nome do Jogo** | Opcional (pode ser null) |
| **Favoritos** | ❌ Não implementar (removido) |
| **Notas** | ❌ Não implementar |
| **Tags** | ❌ Não implementar (Q24) |
| **contest_number** | ✅ NOT NULL obrigatório (Q21) |
| **Exclusão** | Hard delete (não soft delete) |
| **Limite de Jogos** | 50 jogos salvos por usuário |
| **Ações Disponíveis** | Visualizar, Exportar, Excluir, Editar Nome, WhatsApp, Marcar como Jogado |
| **Pontos de Acesso** | 3-4 simplificados (detalhes na seção 9) |

### Escopo da Fase 2

**Incluído:**
- ✅ Tabela `saved_games` com schema final
- ✅ Toggle instantâneo para salvar/dessalvar
- ✅ Modal de edição de nome (opcional)
- ✅ Página dedicada "Meus Jogos Salvos"
- ✅ Ações: visualizar, exportar, excluir, editar, compartilhar, marcar como jogado
- ✅ Limite de 50 jogos com trigger
- ✅ Integração com generation_history (Fase 1)
- ✅ Suporte para jogos da Fase 3 (criação manual)

**Não Incluído (decisões de escopo):**
- ❌ Categorias ou tags
- ❌ Sistema de favoritos
- ❌ Campo de notas
- ❌ Sincronização entre dispositivos (já existe via Supabase)
- ❌ Notificações de resultados de concursos salvos

---

## 📦 Requisitos Funcionais

### RF-01: Salvar Jogo
- **Descrição:** Usuário clica no toggle para salvar um jogo gerado/criado
- **Trigger:** Toggle em `ResultsDisplay.tsx` ou `ManualAnalysisResult.tsx` (Fase 3)
- **Ação:** Insere registro em `saved_games` com `is_saved = true`
- **Feedback:** Toast "Jogo salvo com sucesso!" + ícone de coração preenchido
- **Regras:**
  - Verificar limite de 50 jogos antes de salvar
  - Se limite atingido, exibir toast de erro com link para "Meus Jogos"
  - Salvar apenas o jogo individual, não toda a generation_history

### RF-02: Dessalvar Jogo
- **Descrição:** Usuário clica no toggle para remover jogo dos salvos
- **Trigger:** Toggle em jogo já salvo
- **Ação:** Hard delete do registro em `saved_games`
- **Feedback:** Toast "Jogo removido dos salvos"
- **Confirmação:** Nenhuma (ação reversível através do botão regenerar)

### RF-03: Nomear Jogo (Opcional)
- **Descrição:** Usuário pode adicionar nome customizado ao jogo salvo
- **Trigger:** Botão "✏️ Nomear" ao lado do toggle ou no menu de ações
- **Ação:** Modal com input de texto (max 50 caracteres)
- **Default:** Se não nomeado, exibir "Jogo Lotofácil #3205" (padrão)
- **Validação:** Apenas caracteres alfanuméricos, espaços e emojis básicos

### RF-04: Visualizar Jogos Salvos
- **Descrição:** Página dedicada listando todos os jogos salvos do usuário
- **Rota:** `/meus-jogos` ou `/saved-games`
- **Layout:** Cards com prévia do jogo + metadados
- **Ordenação:** Mais recentes primeiro (saved_at DESC)
- **Filtros:** Por loteria (Lotofácil, Lotomania, etc.)

### RF-05: Marcar como Jogado
- **Descrição:** Usuário marca que já apostou aquele jogo
- **Trigger:** Checkbox "Já joguei" no card do jogo
- **Ação:** Incrementa `play_count` e atualiza `last_played_at`
- **Feedback:** Badge "Jogado X vezes"
- **Objetivo:** Controle pessoal, sem validação externa

### RF-06: Compartilhar via WhatsApp
- **Descrição:** Compartilha jogo formatado via WhatsApp Web
- **Trigger:** Botão "📱 Compartilhar" no menu de ações
- **Formato:**
```
🎰 *Jogo Lotofácil - Concurso #3205*

📊 Números gerados pela LOTER.IA:
02, 05, 08, 11, 14, 17, 19, 22, 25, 28, 31, 33, 36, 39, 42

🔥 Números quentes: 5
❄️ Números frios: 4
⚖️ Balanceados: 6

✅ Gerado em: 03/01/2025 às 14:32

💡 Use LOTER.IA e aumente suas chances:
https://loter.ia
```
- **Ação:** `window.open()` com link formatado `https://wa.me/?text=...`

### RF-07: Exportar Jogo
- **Descrição:** Baixa arquivo .txt com detalhes do jogo
- **Trigger:** Botão "⬇️ Exportar" no menu de ações
- **Formato:** Mesma formatação do WhatsApp, mas em arquivo local
- **Nome do arquivo:** `loteria-{lottery_type}-{contest_number}-{timestamp}.txt`

### RF-08: Excluir Jogo
- **Descrição:** Remove permanentemente jogo dos salvos
- **Trigger:** Botão "🗑️ Excluir" no menu de ações
- **Confirmação:** Modal "Tem certeza? Esta ação não pode ser desfeita."
- **Ação:** Hard delete em `saved_games`
- **Feedback:** Toast "Jogo excluído com sucesso"

### RF-09: Limite de 50 Jogos
- **Descrição:** Usuário não pode salvar mais de 50 jogos
- **Validação:** Trigger no banco de dados + verificação no frontend
- **Feedback:** Toast "Você atingiu o limite de 50 jogos salvos. Exclua alguns para salvar novos."
- **CTA:** Link direto para "Meus Jogos" no toast

### RF-10: Navegação Simplificada
- **Descrição:** 3-4 pontos de acesso aos jogos salvos
- **Locais:**
  1. Header global (ícone ❤️ com badge de contagem)
  2. Página "Meus Jogos" dedicada
  3. Link no menu lateral (se houver)
  4. Card de atalho na home (opcional)

---

## 🗄️ Arquitetura de Banco de Dados

### Tabela: `saved_games`

```sql
CREATE TABLE saved_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Vinculação com geração (pode ser NULL para jogos manuais da Fase 3)
  generation_id UUID REFERENCES generation_history(id) ON DELETE SET NULL,

  -- Dados obrigatórios do jogo
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL, -- Q21: Obrigatório para contexto
  numbers INTEGER[] NOT NULL, -- Array de números selecionados

  -- Análise da IA (snapshot no momento do salvamento)
  analysis_result JSONB NOT NULL, -- {hotCount, coldCount, balancedCount, score, etc}
  source TEXT NOT NULL CHECK (source IN ('ai_generated', 'manual_created')),
  strategy_type TEXT, -- 'balanced', 'hot_focused', 'cold_focused', NULL se manual

  -- Metadados do salvamento
  name TEXT, -- Opcional, max 50 chars
  play_count INTEGER DEFAULT 0 NOT NULL,
  last_played_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT unique_saved_game UNIQUE(user_id, lottery_type, contest_number, numbers),
  CHECK (array_length(numbers, 1) > 0)
);

-- Índices para performance
CREATE INDEX idx_saved_games_user_id ON saved_games(user_id);
CREATE INDEX idx_saved_games_lottery_type ON saved_games(lottery_type);
CREATE INDEX idx_saved_games_contest_number ON saved_games(contest_number);
CREATE INDEX idx_saved_games_saved_at ON saved_games(saved_at DESC);
CREATE INDEX idx_saved_games_source ON saved_games(source);
```

### Decisões de Schema

| Campo | Tipo | Decisão | Justificativa |
|-------|------|---------|---------------|
| `id` | UUID | PK | Identificador único |
| `user_id` | UUID | FK NOT NULL | Obrigatório, ON DELETE CASCADE |
| `generation_id` | UUID | FK NULL | NULL para jogos manuais (Fase 3), ON DELETE SET NULL |
| `lottery_type` | TEXT | NOT NULL | Lotofácil, Lotomania, etc |
| `contest_number` | INTEGER | NOT NULL | Q21: Obrigatório para contexto |
| `numbers` | INTEGER[] | NOT NULL | Array de números (15 para Lotofácil, 50 para Lotomania) |
| `analysis_result` | JSONB | NOT NULL | Snapshot da análise (hot/cold counts, score) |
| `source` | TEXT | NOT NULL | 'ai_generated' ou 'manual_created' |
| `strategy_type` | TEXT | NULL | NULL se manual, estratégia se gerado por IA |
| `name` | TEXT | NULL | Q7: Opcional, usuário pode nomear depois |
| `play_count` | INTEGER | DEFAULT 0 | Q8: Contador de vezes jogadas |
| `last_played_at` | TIMESTAMPTZ | NULL | Última vez marcado como jogado |
| `saved_at` | TIMESTAMPTZ | DEFAULT NOW | Data de salvamento |
| ❌ `is_favorite` | - | Removido | Q6: "sem favoritos" |
| ❌ `notes` | - | Removido | Q7: "Não" para notas |
| ❌ `tags` | - | Removido | Q24: "remover" |

### Constraint: Limite de 50 Jogos

```sql
-- Função para validar limite de jogos salvos
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

-- Trigger para aplicar limite antes de INSERT
CREATE TRIGGER enforce_saved_games_limit
BEFORE INSERT ON saved_games
FOR EACH ROW
EXECUTE FUNCTION check_saved_games_limit();
```

### Row Level Security (RLS)

```sql
-- Habilitar RLS na tabela
ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;

-- Política: Usuário só vê seus próprios jogos salvos
CREATE POLICY "Users can view own saved games"
  ON saved_games
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuário só pode inserir jogos para si mesmo
CREATE POLICY "Users can insert own saved games"
  ON saved_games
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário só pode atualizar seus próprios jogos salvos
CREATE POLICY "Users can update own saved games"
  ON saved_games
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuário só pode deletar seus próprios jogos salvos
CREATE POLICY "Users can delete own saved games"
  ON saved_games
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📝 Migrations SQL

### Migration: `20250103000001_create_saved_games.sql`

```sql
-- =====================================================
-- MIGRATION: Criar tabela saved_games (Fase 2)
-- Data: 2025-01-03
-- Descrição: Sistema de salvamento de jogos gerados/manuais
-- =====================================================

-- 1. Criar tabela saved_games
CREATE TABLE IF NOT EXISTS saved_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES generation_history(id) ON DELETE SET NULL,

  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,
  numbers INTEGER[] NOT NULL,

  analysis_result JSONB NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('ai_generated', 'manual_created')),
  strategy_type TEXT,

  name TEXT,
  play_count INTEGER DEFAULT 0 NOT NULL,
  last_played_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_saved_game UNIQUE(user_id, lottery_type, contest_number, numbers),
  CONSTRAINT check_numbers_not_empty CHECK (array_length(numbers, 1) > 0),
  CONSTRAINT check_name_length CHECK (name IS NULL OR char_length(name) <= 50)
);

-- 2. Criar índices
CREATE INDEX idx_saved_games_user_id ON saved_games(user_id);
CREATE INDEX idx_saved_games_lottery_type ON saved_games(lottery_type);
CREATE INDEX idx_saved_games_contest_number ON saved_games(contest_number);
CREATE INDEX idx_saved_games_saved_at ON saved_games(saved_at DESC);
CREATE INDEX idx_saved_games_source ON saved_games(source);
CREATE INDEX idx_saved_games_generation_id ON saved_games(generation_id) WHERE generation_id IS NOT NULL;

-- 3. Função para validar limite de 50 jogos
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

-- 4. Trigger para aplicar limite
CREATE TRIGGER enforce_saved_games_limit
BEFORE INSERT ON saved_games
FOR EACH ROW
EXECUTE FUNCTION check_saved_games_limit();

-- 5. Habilitar RLS
ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
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

-- 7. Comentários para documentação
COMMENT ON TABLE saved_games IS 'Jogos salvos pelos usuários (gerados por IA ou criados manualmente)';
COMMENT ON COLUMN saved_games.generation_id IS 'FK para generation_history (NULL se criado manualmente na Fase 3)';
COMMENT ON COLUMN saved_games.contest_number IS 'Número do concurso (obrigatório para contexto - Q21)';
COMMENT ON COLUMN saved_games.analysis_result IS 'Snapshot da análise no momento do salvamento (hot/cold counts, score)';
COMMENT ON COLUMN saved_games.source IS 'Origem: ai_generated (Fase 1) ou manual_created (Fase 3)';
COMMENT ON COLUMN saved_games.name IS 'Nome customizado opcional (max 50 chars - Q7)';
COMMENT ON COLUMN saved_games.play_count IS 'Contador de vezes que o usuário marcou como jogado (Q8)';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
```

### Migration: `20250103000002_add_saved_games_stats.sql`

```sql
-- =====================================================
-- MIGRATION: Adicionar estatísticas de jogos salvos
-- Data: 2025-01-03
-- Descrição: View materializada para estatísticas agregadas
-- =====================================================

-- 1. View materializada para estatísticas do usuário
CREATE MATERIALIZED VIEW IF NOT EXISTS saved_games_stats AS
SELECT
  user_id,
  COUNT(*) as total_saved,
  COUNT(*) FILTER (WHERE source = 'ai_generated') as ai_generated_count,
  COUNT(*) FILTER (WHERE source = 'manual_created') as manual_created_count,
  SUM(play_count) as total_plays,
  MAX(saved_at) as last_saved_at,
  jsonb_object_agg(
    lottery_type,
    COUNT(*)
  ) as games_by_lottery
FROM saved_games
GROUP BY user_id;

-- 2. Índice único na view materializada
CREATE UNIQUE INDEX idx_saved_games_stats_user_id ON saved_games_stats(user_id);

-- 3. Função para refresh automático da view
CREATE OR REPLACE FUNCTION refresh_saved_games_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY saved_games_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers para refresh automático
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

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
```

---

## 🔧 Services TypeScript

### Service: `savedGamesService.ts`

**Local:** `app/src/services/savedGamesService.ts`

```typescript
import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type SavedGame = Database['public']['Tables']['saved_games']['Row'];
type SavedGameInsert = Database['public']['Tables']['saved_games']['Insert'];
type SavedGameUpdate = Database['public']['Tables']['saved_games']['Update'];

export interface SaveGameParams {
  generationId?: string | null; // NULL para jogos manuais (Fase 3)
  lotteryType: string;
  contestNumber: number;
  numbers: number[];
  analysisResult: {
    hotCount: number;
    coldCount: number;
    balancedCount: number;
    score?: number;
    accuracy?: number;
    [key: string]: any;
  };
  source: 'ai_generated' | 'manual_created';
  strategyType?: string | null;
  name?: string | null;
}

export interface UpdateGameNameParams {
  gameId: string;
  name: string | null;
}

export interface MarkAsPlayedParams {
  gameId: string;
}

export class SavedGamesService {
  /**
   * Salva um jogo (gerado ou manual)
   * Valida limite de 50 jogos antes de salvar
   */
  static async saveGame(params: SaveGameParams): Promise<{
    success: boolean;
    data?: SavedGame;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Validar limite de 50 jogos
      const { count, error: countError } = await supabase
        .from('saved_games')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        console.error('Erro ao verificar limite:', countError);
        return { success: false, error: 'Erro ao verificar limite de jogos' };
      }

      if (count !== null && count >= 50) {
        return {
          success: false,
          error: 'Limite de 50 jogos salvos atingido. Exclua alguns para salvar novos.'
        };
      }

      // Validar nome (max 50 chars)
      if (params.name && params.name.length > 50) {
        return {
          success: false,
          error: 'Nome do jogo deve ter no máximo 50 caracteres'
        };
      }

      // Inserir jogo salvo
      const insertData: SavedGameInsert = {
        user_id: user.id,
        generation_id: params.generationId || null,
        lottery_type: params.lotteryType,
        contest_number: params.contestNumber,
        numbers: params.numbers,
        analysis_result: params.analysisResult as any,
        source: params.source,
        strategy_type: params.strategyType || null,
        name: params.name || null,
        play_count: 0,
        last_played_at: null,
      };

      const { data, error } = await supabase
        .from('saved_games')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar jogo:', error);

        // Tratamento especial para erro de constraint unique
        if (error.code === '23505') {
          return {
            success: false,
            error: 'Você já salvou este jogo para este concurso'
          };
        }

        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro inesperado ao salvar jogo:', error);
      return {
        success: false,
        error: 'Erro inesperado ao salvar jogo'
      };
    }
  }

  /**
   * Remove jogo dos salvos (hard delete)
   */
  static async unsaveGame(gameId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { error } = await supabase
        .from('saved_games')
        .delete()
        .eq('id', gameId)
        .eq('user_id', user.id); // RLS garante, mas boa prática validar

      if (error) {
        console.error('Erro ao remover jogo:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro inesperado ao remover jogo:', error);
      return {
        success: false,
        error: 'Erro inesperado ao remover jogo'
      };
    }
  }

  /**
   * Lista todos os jogos salvos do usuário
   * @param filters - Filtros opcionais (lotteryType, source)
   */
  static async listSavedGames(filters?: {
    lotteryType?: string;
    source?: 'ai_generated' | 'manual_created';
  }): Promise<{
    success: boolean;
    data?: SavedGame[];
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      let query = supabase
        .from('saved_games')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (filters?.lotteryType) {
        query = query.eq('lottery_type', filters.lotteryType);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao listar jogos:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro inesperado ao listar jogos:', error);
      return {
        success: false,
        error: 'Erro inesperado ao listar jogos'
      };
    }
  }

  /**
   * Busca um jogo salvo específico
   */
  static async getSavedGame(gameId: string): Promise<{
    success: boolean;
    data?: SavedGame;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('saved_games')
        .select('*')
        .eq('id', gameId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar jogo:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro inesperado ao buscar jogo:', error);
      return {
        success: false,
        error: 'Erro inesperado ao buscar jogo'
      };
    }
  }

  /**
   * Atualiza nome do jogo salvo
   */
  static async updateGameName(params: UpdateGameNameParams): Promise<{
    success: boolean;
    data?: SavedGame;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Validar nome (max 50 chars)
      if (params.name && params.name.length > 50) {
        return {
          success: false,
          error: 'Nome deve ter no máximo 50 caracteres'
        };
      }

      const updateData: SavedGameUpdate = {
        name: params.name || null,
      };

      const { data, error } = await supabase
        .from('saved_games')
        .update(updateData)
        .eq('id', params.gameId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar nome:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro inesperado ao atualizar nome:', error);
      return {
        success: false,
        error: 'Erro inesperado ao atualizar nome'
      };
    }
  }

  /**
   * Marca jogo como jogado
   * Incrementa play_count e atualiza last_played_at
   */
  static async markAsPlayed(params: MarkAsPlayedParams): Promise<{
    success: boolean;
    data?: SavedGame;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      // Buscar jogo atual para incrementar play_count
      const { data: currentGame, error: fetchError } = await supabase
        .from('saved_games')
        .select('play_count')
        .eq('id', params.gameId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar jogo:', fetchError);
        return { success: false, error: fetchError.message };
      }

      const newPlayCount = (currentGame.play_count || 0) + 1;

      const updateData: SavedGameUpdate = {
        play_count: newPlayCount,
        last_played_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('saved_games')
        .update(updateData)
        .eq('id', params.gameId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar como jogado:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erro inesperado ao marcar como jogado:', error);
      return {
        success: false,
        error: 'Erro inesperado ao marcar como jogado'
      };
    }
  }

  /**
   * Verifica se um jogo específico já está salvo
   * Útil para exibir estado correto do toggle
   */
  static async isGameSaved(
    lotteryType: string,
    contestNumber: number,
    numbers: number[]
  ): Promise<{
    success: boolean;
    isSaved: boolean;
    gameId?: string;
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, isSaved: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('saved_games')
        .select('id')
        .eq('user_id', user.id)
        .eq('lottery_type', lotteryType)
        .eq('contest_number', contestNumber)
        .eq('numbers', numbers)
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar jogo salvo:', error);
        return { success: false, isSaved: false, error: error.message };
      }

      return {
        success: true,
        isSaved: !!data,
        gameId: data?.id,
      };
    } catch (error) {
      console.error('Erro inesperado ao verificar jogo salvo:', error);
      return {
        success: false,
        isSaved: false,
        error: 'Erro inesperado'
      };
    }
  }

  /**
   * Obtém estatísticas de jogos salvos do usuário
   */
  static async getStats(): Promise<{
    success: boolean;
    data?: {
      totalSaved: number;
      aiGeneratedCount: number;
      manualCreatedCount: number;
      totalPlays: number;
      gamesByLottery: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const { data, error } = await supabase
        .from('saved_games_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return {
          success: true,
          data: {
            totalSaved: 0,
            aiGeneratedCount: 0,
            manualCreatedCount: 0,
            totalPlays: 0,
            gamesByLottery: {},
          }
        };
      }

      return {
        success: true,
        data: {
          totalSaved: data.total_saved,
          aiGeneratedCount: data.ai_generated_count,
          manualCreatedCount: data.manual_created_count,
          totalPlays: data.total_plays,
          gamesByLottery: data.games_by_lottery as Record<string, number>,
        }
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar estatísticas:', error);
      return {
        success: false,
        error: 'Erro inesperado'
      };
    }
  }
}

export default SavedGamesService;
```

### Service: `exportService.ts`

**Local:** `app/src/services/exportService.ts`

```typescript
import type { SavedGame } from './savedGamesService';

export class ExportService {
  /**
   * Formata jogo para compartilhamento (WhatsApp ou TXT)
   */
  static formatGameForSharing(game: any): string {
    const lotteryName = game.lottery_type === 'lotofacil'
      ? 'Lotofácil'
      : game.lottery_type === 'lotomania'
      ? 'Lotomania'
      : game.lottery_type;

    const numbers = game.numbers.sort((a: number, b: number) => a - b);
    const numbersFormatted = numbers.map((n: number) => n.toString().padStart(2, '0')).join(', ');

    const analysis = game.analysis_result;
    const hotCount = analysis.hotCount || 0;
    const coldCount = analysis.coldCount || 0;
    const balancedCount = analysis.balancedCount || 0;

    const date = new Date(game.saved_at);
    const dateFormatted = date.toLocaleDateString('pt-BR');
    const timeFormatted = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let text = `🎰 *Jogo ${lotteryName} - Concurso #${game.contest_number}*\n\n`;

    if (game.name) {
      text += `📝 *Nome:* ${game.name}\n\n`;
    }

    text += `📊 *Números ${game.source === 'ai_generated' ? 'gerados pela LOTER.IA' : 'selecionados'}:*\n`;
    text += `${numbersFormatted}\n\n`;

    text += `🔥 *Números quentes:* ${hotCount}\n`;
    text += `❄️ *Números frios:* ${coldCount}\n`;
    text += `⚖️ *Balanceados:* ${balancedCount}\n\n`;

    if (game.strategy_type) {
      const strategyNames: Record<string, string> = {
        'balanced': 'Balanceada',
        'hot_focused': 'Focada em Quentes',
        'cold_focused': 'Focada em Frios',
      };
      text += `🎯 *Estratégia:* ${strategyNames[game.strategy_type] || game.strategy_type}\n\n`;
    }

    text += `✅ *Salvo em:* ${dateFormatted} às ${timeFormatted}\n`;

    if (game.play_count > 0) {
      text += `🎲 *Jogado:* ${game.play_count}x\n`;
    }

    text += `\n💡 *Use LOTER.IA e aumente suas chances:*\n`;
    text += `https://loter.ia\n`;

    return text;
  }

  /**
   * Compartilha jogo via WhatsApp Web
   */
  static shareViaWhatsApp(game: any): void {
    const text = this.formatGameForSharing(game);
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * Exporta jogo como arquivo .txt
   */
  static exportAsTxt(game: any): void {
    const text = this.formatGameForSharing(game);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

    const filename = `loter-ia-${game.lottery_type}-${game.contest_number}-${Date.now()}.txt`;

    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar URL criada
    URL.revokeObjectURL(link.href);
  }
}

export default ExportService;
```

---

## 🪝 React Hooks

### Hook: `useSavedGames.ts`

**Local:** `app/src/hooks/useSavedGames.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SavedGamesService, type SaveGameParams, type UpdateGameNameParams, type MarkAsPlayedParams } from '@/services/savedGamesService';
import { useToast } from '@/hooks/useToast';

/**
 * Hook para listar jogos salvos com filtros opcionais
 */
export function useSavedGames(filters?: {
  lotteryType?: string;
  source?: 'ai_generated' | 'manual_created';
}) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['saved-games', filters],
    queryFn: async () => {
      const result = await SavedGamesService.listSavedGames(filters);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar jogos',
          description: result.error || 'Erro desconhecido',
        });
        throw new Error(result.error);
      }

      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um jogo salvo específico
 */
export function useSavedGame(gameId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['saved-game', gameId],
    queryFn: async () => {
      if (!gameId) return null;

      const result = await SavedGamesService.getSavedGame(gameId);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar jogo',
          description: result.error || 'Erro desconhecido',
        });
        throw new Error(result.error);
      }

      return result.data || null;
    },
    enabled: !!gameId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para salvar jogo
 */
export function useSaveGame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: SaveGameParams) => SavedGamesService.saveGame(params),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar queries para atualizar listagens
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-games-stats'] });
        queryClient.invalidateQueries({ queryKey: ['is-game-saved'] });

        toast({
          title: '❤️ Jogo salvo com sucesso!',
          description: 'Acesse "Meus Jogos" para visualizar.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Não foi possível salvar',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar jogo',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para remover jogo dos salvos
 */
export function useUnsaveGame() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (gameId: string) => SavedGamesService.unsaveGame(gameId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-games-stats'] });
        queryClient.invalidateQueries({ queryKey: ['is-game-saved'] });

        toast({
          title: 'Jogo removido dos salvos',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao remover jogo',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover jogo',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para atualizar nome do jogo
 */
export function useUpdateGameName() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: UpdateGameNameParams) => SavedGamesService.updateGameName(params),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-game', variables.gameId] });

        toast({
          title: '✏️ Nome atualizado!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao atualizar nome',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar nome',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para marcar jogo como jogado
 */
export function useMarkAsPlayed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: MarkAsPlayedParams) => SavedGamesService.markAsPlayed(params),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['saved-games'] });
        queryClient.invalidateQueries({ queryKey: ['saved-game', variables.gameId] });

        toast({
          title: '✅ Marcado como jogado!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao marcar como jogado',
          description: result.error || 'Erro desconhecido',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao marcar como jogado',
        description: error.message,
      });
    },
  });
}

/**
 * Hook para verificar se jogo está salvo
 */
export function useIsGameSaved(
  lotteryType: string,
  contestNumber: number,
  numbers: number[]
) {
  return useQuery({
    queryKey: ['is-game-saved', lotteryType, contestNumber, numbers],
    queryFn: async () => {
      const result = await SavedGamesService.isGameSaved(
        lotteryType,
        contestNumber,
        numbers
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        isSaved: result.isSaved,
        gameId: result.gameId,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para estatísticas de jogos salvos
 */
export function useSavedGamesStats() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['saved-games-stats'],
    queryFn: async () => {
      const result = await SavedGamesService.getStats();

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar estatísticas',
          description: result.error || 'Erro desconhecido',
        });
        throw new Error(result.error);
      }

      return result.data || {
        totalSaved: 0,
        aiGeneratedCount: 0,
        manualCreatedCount: 0,
        totalPlays: 0,
        gamesByLottery: {},
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
```

---

## 🎨 Componentes UI

### Componente: `SaveToggleButton.tsx`

**Local:** `app/src/components/SaveToggleButton.tsx`

**Descrição:** Toggle instantâneo para salvar/dessalvar jogo (Fluxo D)

```typescript
import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSaveGame, useUnsaveGame, useIsGameSaved } from '@/hooks/useSavedGames';
import { cn } from '@/lib/utils';

interface SaveToggleButtonProps {
  lotteryType: string;
  contestNumber: number;
  numbers: number[];
  analysisResult: any;
  source: 'ai_generated' | 'manual_created';
  strategyType?: string | null;
  generationId?: string | null;
  className?: string;
  onSaveSuccess?: (gameId: string) => void;
  onUnsaveSuccess?: () => void;
}

export function SaveToggleButton({
  lotteryType,
  contestNumber,
  numbers,
  analysisResult,
  source,
  strategyType,
  generationId,
  className,
  onSaveSuccess,
  onUnsaveSuccess,
}: SaveToggleButtonProps) {
  const saveGame = useSaveGame();
  const unsaveGame = useUnsaveGame();
  const { data: savedStatus, isLoading } = useIsGameSaved(
    lotteryType,
    contestNumber,
    numbers
  );

  const isSaved = savedStatus?.isSaved || false;
  const savedGameId = savedStatus?.gameId;

  const handleToggle = async () => {
    if (isSaved && savedGameId) {
      // Dessalvar
      const result = await unsaveGame.mutateAsync(savedGameId);
      if (result.success && onUnsaveSuccess) {
        onUnsaveSuccess();
      }
    } else {
      // Salvar
      const result = await saveGame.mutateAsync({
        generationId: generationId || null,
        lotteryType,
        contestNumber,
        numbers,
        analysisResult,
        source,
        strategyType: strategyType || null,
        name: null, // Fluxo D: salva sem nome, usuário pode adicionar depois
      });
      if (result.success && result.data && onSaveSuccess) {
        onSaveSuccess(result.data.id);
      }
    }
  };

  return (
    <Button
      variant={isSaved ? 'default' : 'outline'}
      size="sm"
      className={cn(
        'transition-all duration-200',
        isSaved && 'bg-red-500 hover:bg-red-600 text-white',
        className
      )}
      onClick={handleToggle}
      disabled={isLoading || saveGame.isPending || unsaveGame.isPending}
    >
      <Heart
        className={cn(
          'w-4 h-4 mr-2 transition-all',
          isSaved && 'fill-current'
        )}
      />
      {isSaved ? 'Salvo' : 'Salvar'}
    </Button>
  );
}
```

### Componente: `EditGameNameModal.tsx`

**Local:** `app/src/components/EditGameNameModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateGameName } from '@/hooks/useSavedGames';

interface EditGameNameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gameId: string;
  currentName: string | null;
  lotteryType: string;
  contestNumber: number;
}

export function EditGameNameModal({
  open,
  onOpenChange,
  gameId,
  currentName,
  lotteryType,
  contestNumber,
}: EditGameNameModalProps) {
  const [name, setName] = useState(currentName || '');
  const updateGameName = useUpdateGameName();

  useEffect(() => {
    setName(currentName || '');
  }, [currentName, open]);

  const defaultName = `Jogo ${lotteryType === 'lotofacil' ? 'Lotofácil' : 'Lotomania'} #${contestNumber}`;

  const handleSave = async () => {
    const finalName = name.trim() || null;

    const result = await updateGameName.mutateAsync({
      gameId,
      name: finalName,
    });

    if (result.success) {
      onOpenChange(false);
    }
  };

  const handleClear = () => {
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>✏️ Editar Nome do Jogo</DialogTitle>
          <DialogDescription>
            Dê um nome personalizado para identificar este jogo facilmente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="game-name">Nome do Jogo (opcional)</Label>
            <Input
              id="game-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName}
              maxLength={50}
              disabled={updateGameName.isPending}
            />
            <p className="text-xs text-muted-foreground">
              {name.length}/50 caracteres
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={updateGameName.isPending || !name}
          >
            Limpar
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateGameName.isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateGameName.isPending}
          >
            {updateGameName.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Componente: `SavedGameCard.tsx`

**Local:** `app/src/components/SavedGameCard.tsx`

```typescript
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Share2, Download, Trash2, Eye, Calendar } from 'lucide-react';
import { useUnsaveGame, useMarkAsPlayed } from '@/hooks/useSavedGames';
import { ExportService } from '@/services/exportService';
import { EditGameNameModal } from './EditGameNameModal';
import type { SavedGame } from '@/services/savedGamesService';

interface SavedGameCardProps {
  game: any; // SavedGame type
  onView?: (game: any) => void;
}

export function SavedGameCard({ game, onView }: SavedGameCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const unsaveGame = useUnsaveGame();
  const markAsPlayed = useMarkAsPlayed();

  const lotteryName = game.lottery_type === 'lotofacil'
    ? 'Lotofácil'
    : game.lottery_type === 'lotomania'
    ? 'Lotomania'
    : game.lottery_type;

  const defaultName = `Jogo ${lotteryName} #${game.contest_number}`;
  const displayName = game.name || defaultName;

  const numbers = game.numbers.sort((a: number, b: number) => a - b);
  const numbersFormatted = numbers.map((n: number) => n.toString().padStart(2, '0'));

  const savedDate = new Date(game.saved_at);
  const savedDateFormatted = savedDate.toLocaleDateString('pt-BR');

  const analysis = game.analysis_result;
  const hotCount = analysis.hotCount || 0;
  const coldCount = analysis.coldCount || 0;
  const balancedCount = analysis.balancedCount || 0;

  const handleDelete = async () => {
    await unsaveGame.mutateAsync(game.id);
    setShowDeleteDialog(false);
  };

  const handleMarkAsPlayed = async (checked: boolean) => {
    if (checked) {
      await markAsPlayed.mutateAsync({ gameId: game.id });
    }
  };

  const handleShare = () => {
    ExportService.shareViaWhatsApp(game);
  };

  const handleExport = () => {
    ExportService.exportAsTxt(game);
  };

  const handleView = () => {
    if (onView) {
      onView(game);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{displayName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="w-3 h-3" />
                Concurso #{game.contest_number} • {savedDateFormatted}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Nome
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar TXT
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Números */}
            <div>
              <p className="text-sm font-medium mb-2">Números:</p>
              <div className="flex flex-wrap gap-2">
                {numbersFormatted.map((num, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="font-mono text-sm"
                  >
                    {num}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Análise */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-red-500">🔥</span>
                <span>{hotCount} quentes</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-500">❄️</span>
                <span>{coldCount} frios</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⚖️</span>
                <span>{balancedCount} balanceados</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {game.source === 'ai_generated' && (
                <Badge variant="outline" className="bg-purple-50">
                  🤖 Gerado por IA
                </Badge>
              )}
              {game.source === 'manual_created' && (
                <Badge variant="outline" className="bg-blue-50">
                  ✍️ Criado Manualmente
                </Badge>
              )}
              {game.play_count > 0 && (
                <Badge variant="outline" className="bg-green-50">
                  🎲 Jogado {game.play_count}x
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`played-${game.id}`}
              checked={game.play_count > 0}
              onCheckedChange={handleMarkAsPlayed}
            />
            <label
              htmlFor={`played-${game.id}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Já joguei
            </label>
          </div>
          <Button variant="outline" size="sm" onClick={handleView}>
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
        </CardFooter>
      </Card>

      <EditGameNameModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        gameId={game.id}
        currentName={game.name}
        lotteryType={game.lottery_type}
        contestNumber={game.contest_number}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir jogo salvo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O jogo "{displayName}" será permanentemente removido dos seus salvos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### Componente: `SavedGamesPage.tsx`

**Local:** `app/src/pages/SavedGamesPage.tsx` ou `app/src/app/meus-jogos/page.tsx`

```typescript
import React, { useState } from 'react';
import { useSavedGames, useSavedGamesStats } from '@/hooks/useSavedGames';
import { SavedGameCard } from '@/components/SavedGameCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Heart, TrendingUp, Gamepad2 } from 'lucide-react';

export function SavedGamesPage() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { data: games, isLoading, error } = useSavedGames({ lotteryType: filter });
  const { data: stats } = useSavedGamesStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Erro ao carregar jogos</CardTitle>
            <CardDescription>
              Não foi possível carregar seus jogos salvos. Tente novamente mais tarde.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isEmpty = !games || games.length === 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">❤️ Meus Jogos Salvos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os seus jogos salvos em um só lugar
        </p>
      </div>

      {/* Estatísticas */}
      {stats && stats.totalSaved > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Jogos
              </CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSaved}</div>
              <p className="text-xs text-muted-foreground">
                {50 - stats.totalSaved} vagas restantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gerados por IA
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.aiGeneratedCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.manualCreatedCount} criados manualmente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Apostas
              </CardTitle>
              <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlays}</div>
              <p className="text-xs text-muted-foreground">
                Jogos marcados como jogados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros por Loteria */}
      <Tabs value={filter || 'all'} onValueChange={(value) => setFilter(value === 'all' ? undefined : value)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="lotofacil">Lotofácil</TabsTrigger>
          <TabsTrigger value="lotomania">Lotomania</TabsTrigger>
        </TabsList>

        <TabsContent value={filter || 'all'} className="mt-6">
          {isEmpty ? (
            <Card className="border-dashed">
              <CardHeader className="text-center py-12">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </div>
                <CardTitle>Nenhum jogo salvo ainda</CardTitle>
                <CardDescription className="max-w-sm mx-auto">
                  Salve seus jogos favoritos para acessá-los rapidamente depois
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game: any) => (
                <SavedGameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🔄 Fluxos de Usuário

### Fluxo 1: Salvar Jogo (Fluxo D - Toggle Instantâneo)

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUXO D: SALVAMENTO INSTANTÂNEO               │
└─────────────────────────────────────────────────────────────────┘

[1] Usuário visualiza jogo gerado em ResultsDisplay
    ├─ Toggle "❤️ Salvar" visível ao lado do botão "Regenerar"
    └─ Estado inicial: ❤️ vazio (não salvo)

[2] Usuário clica no toggle "Salvar"
    ├─ Frontend: useSaveGame().mutateAsync()
    ├─ Backend: SavedGamesService.saveGame()
    │   ├─ Validar limite de 50 jogos
    │   ├─ Se OK: Inserir em saved_games com name = NULL
    │   └─ Se limite atingido: Retornar erro
    ├─ Feedback: Toast "❤️ Jogo salvo com sucesso!"
    └─ Toggle muda para ❤️ preenchido (salvo)

[3] Opção de nomear depois (opcional)
    ├─ Botão "✏️ Nomear" aparece ao lado do toggle
    ├─ Usuário clica em "Nomear"
    ├─ Modal EditGameNameModal abre
    ├─ Usuário digita nome (max 50 chars)
    ├─ Salva → useUpdateGameName().mutateAsync()
    └─ Modal fecha + Toast "✏️ Nome atualizado!"

[4] Dessalvar jogo
    ├─ Usuário clica novamente no toggle (agora preenchido)
    ├─ useUnsaveGame().mutateAsync(gameId)
    ├─ Hard delete em saved_games
    ├─ Toggle volta para ❤️ vazio
    └─ Toast "Jogo removido dos salvos"

```

### Fluxo 2: Visualizar e Gerenciar Jogos Salvos

```
┌─────────────────────────────────────────────────────────────────┐
│                    GERENCIAMENTO DE JOGOS SALVOS                │
└─────────────────────────────────────────────────────────────────┘

[1] Acessar página "Meus Jogos"
    ├─ Via header: Clica em ícone ❤️ com badge (ex: "3")
    ├─ Via menu lateral: Link "Meus Jogos"
    └─ Via home: Card de atalho "Ver Meus Jogos"

[2] Página SavedGamesPage carrega
    ├─ useSavedGames() busca jogos do usuário
    ├─ Exibe estatísticas: Total / IA / Manual / Apostas
    ├─ Tabs: "Todos" | "Lotofácil" | "Lotomania"
    └─ Grid de cards (SavedGameCard)

[3] Ações disponíveis em cada card:
    ├─ Checkbox "Já joguei":
    │   └─ useMarkAsPlayed() → incrementa play_count
    ├─ Menu de ações (⋮):
    │   ├─ 👁️ Visualizar: Abre modal com detalhes completos
    │   ├─ ✏️ Editar Nome: Modal EditGameNameModal
    │   ├─ 📱 Compartilhar WhatsApp: ExportService.shareViaWhatsApp()
    │   ├─ ⬇️ Exportar TXT: ExportService.exportAsTxt()
    │   └─ 🗑️ Excluir: AlertDialog confirmação → useUnsaveGame()
    └─ Botão "Ver Detalhes": Abre modal de visualização completa

[4] Filtros e ordenação
    ├─ Filtrar por loteria (tabs)
    ├─ Ordenação: Mais recentes primeiro (saved_at DESC)
    └─ Limite visual: Grid responsivo (3 colunas em desktop)

```

### Fluxo 3: Compartilhar via WhatsApp

```
┌─────────────────────────────────────────────────────────────────┐
│               COMPARTILHAMENTO VIA WHATSAPP                     │
└─────────────────────────────────────────────────────────────────┘

[1] Usuário clica em "📱 Compartilhar" no menu do card

[2] ExportService.shareViaWhatsApp(game)
    ├─ Formata texto com:
    │   ├─ Nome do jogo (se existir)
    │   ├─ Números ordenados e formatados (02, 05, 08...)
    │   ├─ Análise (quentes, frios, balanceados)
    │   ├─ Estratégia (se IA)
    │   ├─ Data de salvamento
    │   └─ Link loter.ia
    ├─ Exemplo:
    │   🎰 *Jogo Lotofácil - Concurso #3205*
    │   📝 *Nome:* Meu jogo da sorte
    │   📊 *Números gerados pela LOTER.IA:*
    │   02, 05, 08, 11, 14, 17, 19, 22, 25, 28, 31, 33, 36, 39, 42
    │   🔥 *Números quentes:* 5
    │   ❄️ *Números frios:* 4
    │   ⚖️ *Balanceados:* 6
    │   ✅ *Salvo em:* 03/01/2025 às 14:32
    │   💡 *Use LOTER.IA:* https://loter.ia
    └─ Abre WhatsApp Web: window.open(`https://wa.me/?text=${encodedText}`)

[3] Usuário escolhe contato e envia mensagem

```

---

## 📍 Pontos de Acesso (3-4 Simplificados)

Com base na resposta do Bruno (Q28: "3-4 simplificados"), os pontos de acesso aos jogos salvos serão:

### 1. Header Global (Principal)

**Local:** `app/src/components/Header.tsx`

```typescript
// Adicionar no header existente
<Button variant="ghost" size="icon" className="relative" asChild>
  <Link href="/meus-jogos">
    <Heart className="h-5 w-5" />
    {savedCount > 0 && (
      <Badge
        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        variant="destructive"
      >
        {savedCount}
      </Badge>
    )}
  </Link>
</Button>
```

### 2. Página Dedicada "Meus Jogos"

**Rota:** `/meus-jogos` ou `/saved-games`
**Componente:** `SavedGamesPage.tsx` (já especificado acima)

### 3. Menu Lateral/Navegação (Se houver)

**Local:** `app/src/components/Sidebar.tsx` ou equivalente

```typescript
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link href="/meus-jogos">
      <Heart className="mr-2 h-4 w-4" />
      Meus Jogos
      {savedCount > 0 && (
        <Badge variant="secondary" className="ml-auto">
          {savedCount}
        </Badge>
      )}
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

### 4. Card de Atalho na Home (Opcional)

**Local:** `app/src/pages/HomePage.tsx` ou dashboard

```typescript
<Card className="cursor-pointer hover:shadow-lg transition-shadow" asChild>
  <Link href="/meus-jogos">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500" />
        Meus Jogos Salvos
      </CardTitle>
      <CardDescription>
        {savedCount > 0
          ? `Você tem ${savedCount} jogos salvos`
          : 'Ainda não há jogos salvos'}
      </CardDescription>
    </CardHeader>
  </Link>
</Card>
```

---

## 🖼️ Wireframes ASCII

### Wireframe 1: ResultsDisplay com Toggle de Salvar

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESULTADOS DA ANÁLISE - LOTOFÁCIL            │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  🎯 Jogo 1 de 3   (navegação entre gerações da Fase 1)       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📊 Números gerados pela LOTER.IA                             ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │  [02] [05] [08] [11] [14] [17] [19] [22] [25] [28]     │ ║
║  │  [31] [33] [36] [39] [42]                               │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  🔥 Quentes: 5  |  ❄️ Frios: 4  |  ⚖️ Balanceados: 6        ║
║  🎯 Estratégia: Balanceada                                    ║
║  ⭐ Score: 8.7/10                                             ║
║                                                               ║
║  ┌───────────────────────┐  ┌──────────────────────┐         ║
║  │  🔄 Gerar Novamente   │  │  ❤️ Salvar Jogo     │         ║
║  └───────────────────────┘  └──────────────────────┘         ║
║         (Fase 1)                   (Fase 2 - Toggle)         ║
║                                                               ║
║  [✏️ Nomear]  ← Aparece depois de salvar (opcional)          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

Estados do Toggle:
┌──────────────────────┐       ┌──────────────────────┐
│  ❤️ Salvar Jogo     │  -->  │  ❤️ Salvo           │
│  (vazio, outline)   │       │  (preenchido, solid) │
└──────────────────────┘       └──────────────────────┘
     Não salvo                      Salvo
```

### Wireframe 2: Página "Meus Jogos Salvos"

```
┌─────────────────────────────────────────────────────────────────┐
│                       MEUS JOGOS SALVOS                         │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  ❤️ Meus Jogos Salvos                                    [❤️ 12] ║
║  Gerencie todos os seus jogos salvos em um só lugar            ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                 ║
║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            ║
║  │ Total: 12   │  │ IA: 8       │  │ Apostas: 24 │            ║
║  │ 🎮 jogos    │  │ Manual: 4   │  │ 🎲 vezes    │            ║
║  └─────────────┘  └─────────────┘  └─────────────┘            ║
║                                                                 ║
║  ┌─────────┬─────────────┬──────────────┐                     ║
║  │  Todos  │  Lotofácil  │  Lotomania   │  (Tabs)            ║
║  └─────────┴─────────────┴──────────────┘                     ║
║                                                                 ║
║  ╔═══════════════════════════════════════════════════╗         ║
║  ║  Meu jogo da sorte                          [⋮]  ║         ║
║  ║  Concurso #3205 • 03/01/2025                     ║         ║
║  ╠═══════════════════════════════════════════════════╣         ║
║  ║  Números:                                         ║         ║
║  ║  [02] [05] [08] [11] [14] [17] [19] [22] [25]    ║         ║
║  ║  [28] [31] [33] [36] [39] [42]                   ║         ║
║  ║                                                   ║         ║
║  ║  🔥 5 quentes  ❄️ 4 frios  ⚖️ 6 balanceados      ║         ║
║  ║                                                   ║         ║
║  ║  [🤖 Gerado por IA]  [🎲 Jogado 2x]             ║         ║
║  ╠═══════════════════════════════════════════════════╣         ║
║  ║  [ ] Já joguei         [👁️ Ver Detalhes]        ║         ║
║  ╚═══════════════════════════════════════════════════╝         ║
║                                                                 ║
║  ╔═══════════════════════════════════════════════════╗         ║
║  ║  Jogo Lotofácil #3206                       [⋮]  ║         ║
║  ║  Concurso #3206 • 02/01/2025                     ║         ║
║  ╠═══════════════════════════════════════════════════╣         ║
║  ║  ... (similar ao card acima)                      ║         ║
║  ╚═══════════════════════════════════════════════════╝         ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════

Menu de Ações (⋮):
┌─────────────────────────┐
│ 👁️ Visualizar           │
│ ✏️ Editar Nome          │
│ ───────────────────────  │
│ 📱 Compartilhar WhatsApp│
│ ⬇️ Exportar TXT         │
│ ───────────────────────  │
│ 🗑️ Excluir              │
└─────────────────────────┘
```

### Wireframe 3: Modal de Edição de Nome

```
┌─────────────────────────────────────────────────────────────────┐
│                  EDITAR NOME DO JOGO (Modal)                    │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  ✏️ Editar Nome do Jogo                                [X]    ║
║  Dê um nome personalizado para identificar este jogo          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Nome do Jogo (opcional)                                       ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │  Meu jogo da sorte                                      │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║  17/50 caracteres                                              ║
║                                                                 ║
║  Placeholder: "Jogo Lotofácil #3205"                           ║
║                                                                 ║
║                     [Limpar]  [Cancelar]  [Salvar]             ║
║                                                                 ║
╚═══════════════════════════════════════════════════════════════╝
```

### Wireframe 4: Header com Badge de Contagem

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER GLOBAL                           │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  [LOGO LOTER.IA]                                               ║
║                                                                 ║
║  [🏠 Home]  [🎯 Análises]  [⚙️ Config]        [❤️ (12)]  [👤]║
║                                                    └─┬──┘       ║
║                                        Badge vermelho de        ║
║                                        contagem de jogos        ║
║                                        salvos                   ║
╚═══════════════════════════════════════════════════════════════╝

Clique no ❤️ (12) → Redireciona para /meus-jogos
```

---

## ✅ Checklist de Implementação

### Backend (Supabase) - 12 horas

- [ ] **[2h]** Criar migration `20250103000001_create_saved_games.sql`
  - [ ] Tabela `saved_games` com schema completo
  - [ ] Índices de performance
  - [ ] Função `check_saved_games_limit()` (limite 50 jogos)
  - [ ] Trigger `enforce_saved_games_limit`
  - [ ] RLS policies (SELECT, INSERT, UPDATE, DELETE)
  - [ ] Comentários de documentação

- [ ] **[2h]** Criar migration `20250103000002_add_saved_games_stats.sql`
  - [ ] Materialized view `saved_games_stats`
  - [ ] Função `refresh_saved_games_stats()`
  - [ ] Triggers para refresh automático

- [ ] **[2h]** Testar migrations em ambiente local
  - [ ] `supabase db reset --local`
  - [ ] Verificar tabelas criadas
  - [ ] Testar limite de 50 jogos (inserir 51 e verificar erro)
  - [ ] Testar RLS com diferentes usuários
  - [ ] Verificar triggers de stats

- [ ] **[2h]** Aplicar migrations em produção
  - [ ] Backup do banco de dados
  - [ ] `supabase db push`
  - [ ] Verificar tabelas em produção
  - [ ] Smoke test com usuário real

- [ ] **[2h]** Atualizar tipos TypeScript
  - [ ] Regenerar tipos: `supabase gen types typescript --local > types/supabase.ts`
  - [ ] Verificar tipo `SavedGame` disponível
  - [ ] Verificar tipo `SavedGamesStats` disponível

- [ ] **[2h]** Revisar e otimizar performance
  - [ ] Analisar query plans (EXPLAIN ANALYZE)
  - [ ] Adicionar índices adicionais se necessário
  - [ ] Testar com 1000+ registros (carga simulada)

### Services - 8 horas

- [ ] **[4h]** Implementar `savedGamesService.ts`
  - [ ] `saveGame()` com validação de limite
  - [ ] `unsaveGame()` (hard delete)
  - [ ] `listSavedGames()` com filtros
  - [ ] `getSavedGame()`
  - [ ] `updateGameName()` com validação de 50 chars
  - [ ] `markAsPlayed()` (incremento + timestamp)
  - [ ] `isGameSaved()` para estado do toggle
  - [ ] `getStats()` da materialized view
  - [ ] Testes unitários de cada função

- [ ] **[2h]** Implementar `exportService.ts`
  - [ ] `formatGameForSharing()` com template completo
  - [ ] `shareViaWhatsApp()` com encoding correto
  - [ ] `exportAsTxt()` com download automático
  - [ ] Testar formatação em diferentes dispositivos

- [ ] **[2h]** Integração com serviços existentes
  - [ ] Atualizar `lotteryAnalysis.ts` se necessário
  - [ ] Verificar compatibilidade com Fase 1 (generation_id)
  - [ ] Preparar para Fase 3 (manual_created)

### Hooks - 6 horas

- [ ] **[4h]** Implementar `useSavedGames.ts`
  - [ ] `useSavedGames()` com React Query
  - [ ] `useSavedGame()` para um jogo específico
  - [ ] `useSaveGame()` mutation com invalidation
  - [ ] `useUnsaveGame()` mutation
  - [ ] `useUpdateGameName()` mutation
  - [ ] `useMarkAsPlayed()` mutation
  - [ ] `useIsGameSaved()` para toggle state
  - [ ] `useSavedGamesStats()` para estatísticas
  - [ ] Toast notifications em cada mutação

- [ ] **[2h]** Testar hooks isoladamente
  - [ ] Criar componente de teste em Storybook
  - [ ] Verificar cache do React Query
  - [ ] Testar invalidation de queries
  - [ ] Verificar loading/error states

### Componentes UI - 12 horas

- [ ] **[2h]** `SaveToggleButton.tsx`
  - [ ] Implementar toggle instantâneo (Fluxo D)
  - [ ] Estado salvo/não salvo visual (preenchido/vazio)
  - [ ] Loading state durante mutação
  - [ ] Callbacks `onSaveSuccess` e `onUnsaveSuccess`

- [ ] **[2h]** `EditGameNameModal.tsx`
  - [ ] Modal com input de texto
  - [ ] Validação de 50 caracteres
  - [ ] Placeholder com nome padrão
  - [ ] Botões Limpar/Cancelar/Salvar
  - [ ] Loading state

- [ ] **[4h]** `SavedGameCard.tsx`
  - [ ] Layout de card completo
  - [ ] Exibição de números formatados
  - [ ] Análise (hot/cold/balanced)
  - [ ] Badges (IA, Manual, Jogado Xx)
  - [ ] Checkbox "Já joguei"
  - [ ] Menu de ações (⋮) com 6 opções
  - [ ] AlertDialog de confirmação de exclusão
  - [ ] Integração com EditGameNameModal

- [ ] **[4h]** `SavedGamesPage.tsx`
  - [ ] Layout da página completa
  - [ ] Cards de estatísticas (3 cards)
  - [ ] Tabs de filtro por loteria
  - [ ] Grid responsivo de SavedGameCard
  - [ ] Estado vazio com mensagem amigável
  - [ ] Loading skeleton durante fetch
  - [ ] Error boundary para erros

### Integração - 4 horas

- [ ] **[2h]** Integrar toggle no `ResultsDisplay.tsx` (Fase 1)
  - [ ] Adicionar `<SaveToggleButton />` ao lado de "Regenerar"
  - [ ] Passar props corretas (generationId, analysisResult, etc)
  - [ ] Testar salvamento após regeneração

- [ ] **[1h]** Adicionar pontos de acesso (3-4 locais)
  - [ ] Header: ícone ❤️ com badge de contagem
  - [ ] Menu lateral: link "Meus Jogos"
  - [ ] Home: card de atalho (opcional)
  - [ ] Badge atualizado em tempo real via React Query

- [ ] **[1h]** Configurar rota `/meus-jogos`
  - [ ] Adicionar rota no Next.js/React Router
  - [ ] Configurar layout com header/footer
  - [ ] Testar navegação

### Testes - 6 horas

- [ ] **[2h]** Testes unitários de services
  - [ ] Testar `saveGame()` com e sem limite
  - [ ] Testar `unsaveGame()` hard delete
  - [ ] Testar `updateGameName()` validação
  - [ ] Testar `markAsPlayed()` incremento
  - [ ] Testar `isGameSaved()` lógica

- [ ] **[2h]** Testes de integração
  - [ ] Fluxo completo: salvar → nomear → marcar como jogado → excluir
  - [ ] Testar limite de 50 jogos (inserir 50 e tentar 51º)
  - [ ] Testar RLS com múltiplos usuários
  - [ ] Testar filtros por loteria

- [ ] **[2h]** Testes E2E (Playwright ou Cypress)
  - [ ] Cenário 1: Salvar jogo gerado pela IA
  - [ ] Cenário 2: Nomear jogo salvo
  - [ ] Cenário 3: Marcar como jogado
  - [ ] Cenário 4: Compartilhar via WhatsApp (mock)
  - [ ] Cenário 5: Exportar TXT e verificar conteúdo
  - [ ] Cenário 6: Excluir jogo salvo

### Documentação - 2 horas

- [ ] **[1h]** Atualizar README do projeto
  - [ ] Documentar feature "Jogos Salvos"
  - [ ] Adicionar exemplos de uso
  - [ ] Listar limitações (50 jogos)

- [ ] **[1h]** Criar guia de usuário
  - [ ] Como salvar jogos
  - [ ] Como gerenciar jogos salvos
  - [ ] Como compartilhar via WhatsApp
  - [ ] FAQ sobre limite de 50 jogos

### Deploy e Monitoramento - 4 horas

- [ ] **[2h]** Deploy em staging
  - [ ] Criar branch `feature/saved-games`
  - [ ] Deploy em ambiente de staging
  - [ ] Testes com dados de produção (anonymized)
  - [ ] Verificar performance sob carga

- [ ] **[1h]** Deploy em produção
  - [ ] Merge para `main` após aprovação
  - [ ] Deploy via CI/CD
  - [ ] Smoke tests em produção
  - [ ] Monitorar logs por 1 hora

- [ ] **[1h]** Monitoramento e observabilidade
  - [ ] Configurar alertas para erros em saved_games
  - [ ] Dashboard de uso (quantos jogos salvos/dia)
  - [ ] Monitorar limite de 50 jogos (quantos usuários atingiram)

---

## 🧪 Testes

### Testes Unitários (Jest + React Testing Library)

#### `savedGamesService.test.ts`

```typescript
import { SavedGamesService } from '@/services/savedGamesService';
import { supabase } from '@/lib/supabaseClient';

jest.mock('@/lib/supabaseClient');

describe('SavedGamesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGame', () => {
    it('should save game successfully', async () => {
      // Mock user authentication
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });

      // Mock count check (dentro do limite)
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 10, error: null })
      });

      // Mock insert
      const insertMock = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'game-123', name: null },
          error: null
        })
      };
      (supabase.from as jest.Mock).mockReturnValue(insertMock);

      const result = await SavedGamesService.saveGame({
        lotteryType: 'lotofacil',
        contestNumber: 3205,
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        analysisResult: { hotCount: 5, coldCount: 4, balancedCount: 6 },
        source: 'ai_generated',
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('game-123');
    });

    it('should fail when limit of 50 games is reached', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });

      // Mock count check (limite atingido)
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({ count: 50, error: null })
      });

      const result = await SavedGamesService.saveGame({
        lotteryType: 'lotofacil',
        contestNumber: 3205,
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        analysisResult: { hotCount: 5, coldCount: 4, balancedCount: 6 },
        source: 'ai_generated',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Limite de 50 jogos');
    });

    it('should validate name length (max 50 chars)', async () => {
      const longName = 'A'.repeat(51);

      const result = await SavedGamesService.saveGame({
        lotteryType: 'lotofacil',
        contestNumber: 3205,
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        analysisResult: { hotCount: 5, coldCount: 4, balancedCount: 6 },
        source: 'ai_generated',
        name: longName,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('50 caracteres');
    });
  });

  describe('markAsPlayed', () => {
    it('should increment play_count', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });

      // Mock fetch current game
      const selectMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { play_count: 2 },
          error: null
        })
      };
      (supabase.from as jest.Mock).mockReturnValueOnce(selectMock);

      // Mock update
      const updateMock = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'game-123', play_count: 3 },
          error: null
        })
      };
      (supabase.from as jest.Mock).mockReturnValueOnce(updateMock);

      const result = await SavedGamesService.markAsPlayed({ gameId: 'game-123' });

      expect(result.success).toBe(true);
      expect(result.data?.play_count).toBe(3);
    });
  });
});
```

### Testes de Integração

#### `savedGames.integration.test.ts`

```typescript
import { SavedGamesService } from '@/services/savedGamesService';
import { createClient } from '@supabase/supabase-js';

// Usar Supabase local para testes de integração
const supabase = createClient(
  process.env.SUPABASE_LOCAL_URL!,
  process.env.SUPABASE_LOCAL_ANON_KEY!
);

describe('Saved Games Integration Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Criar usuário de teste
    const { data } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'test123456'
    });
    testUserId = data.user!.id;
  });

  afterAll(async () => {
    // Limpar dados de teste
    await supabase.from('saved_games').delete().eq('user_id', testUserId);
  });

  it('should enforce limit of 50 games via trigger', async () => {
    // Inserir 50 jogos
    const games = Array.from({ length: 50 }, (_, i) => ({
      user_id: testUserId,
      lottery_type: 'lotofacil',
      contest_number: 3000 + i,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      analysis_result: { hotCount: 5, coldCount: 4, balancedCount: 6 },
      source: 'ai_generated'
    }));

    const { error: insertError } = await supabase
      .from('saved_games')
      .insert(games);

    expect(insertError).toBeNull();

    // Tentar inserir 51º jogo (deve falhar)
    const { error: limitError } = await supabase
      .from('saved_games')
      .insert({
        user_id: testUserId,
        lottery_type: 'lotofacil',
        contest_number: 3051,
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        analysis_result: { hotCount: 5, coldCount: 4, balancedCount: 6 },
        source: 'ai_generated'
      });

    expect(limitError).not.toBeNull();
    expect(limitError?.message).toContain('Limite de 50 jogos');
  });

  it('should test RLS policies (user can only see own games)', async () => {
    // Criar segundo usuário
    const { data: user2Data } = await supabase.auth.signUp({
      email: 'test2@example.com',
      password: 'test123456'
    });
    const user2Id = user2Data.user!.id;

    // User 1 insere jogo
    await supabase.from('saved_games').insert({
      user_id: testUserId,
      lottery_type: 'lotofacil',
      contest_number: 3100,
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      analysis_result: { hotCount: 5, coldCount: 4, balancedCount: 6 },
      source: 'ai_generated'
    });

    // User 2 tenta buscar jogos de User 1 (deve retornar vazio)
    const { data: gamesUser2 } = await supabase
      .from('saved_games')
      .select('*')
      .eq('user_id', testUserId); // Tentar acessar jogos de outro usuário

    expect(gamesUser2).toHaveLength(0); // RLS bloqueia
  });
});
```

### Testes E2E (Playwright)

#### `savedGames.e2e.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Saved Games E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should save game from results page', async ({ page }) => {
    // Navegar para análise
    await page.goto('/lottery/lotofacil/3205');

    // Aguardar resultado carregar
    await page.waitForSelector('[data-testid="results-display"]');

    // Clicar em "Salvar Jogo"
    const saveButton = page.locator('button:has-text("Salvar Jogo")');
    await saveButton.click();

    // Verificar toast de sucesso
    await expect(page.locator('text=Jogo salvo com sucesso')).toBeVisible();

    // Verificar toggle mudou para "Salvo"
    await expect(saveButton).toContainText('Salvo');
  });

  test('should navigate to saved games page', async ({ page }) => {
    // Clicar no ícone de coração no header
    await page.click('[data-testid="saved-games-header-link"]');

    // Verificar URL
    await page.waitForURL('/meus-jogos');

    // Verificar título da página
    await expect(page.locator('h1')).toContainText('Meus Jogos Salvos');
  });

  test('should edit game name', async ({ page }) => {
    await page.goto('/meus-jogos');

    // Clicar no menu de ações do primeiro card
    await page.click('[data-testid="game-card-menu"]').first();

    // Clicar em "Editar Nome"
    await page.click('text=Editar Nome');

    // Modal deve abrir
    await expect(page.locator('dialog')).toBeVisible();

    // Digitar novo nome
    await page.fill('input[name="game-name"]', 'Meu jogo da sorte');

    // Salvar
    await page.click('button:has-text("Salvar")');

    // Verificar toast
    await expect(page.locator('text=Nome atualizado')).toBeVisible();

    // Verificar nome atualizado no card
    await expect(page.locator('text=Meu jogo da sorte')).toBeVisible();
  });

  test('should mark game as played', async ({ page }) => {
    await page.goto('/meus-jogos');

    // Marcar checkbox "Já joguei"
    await page.check('[data-testid="already-played-checkbox"]').first();

    // Verificar toast
    await expect(page.locator('text=Marcado como jogado')).toBeVisible();

    // Verificar badge "Jogado 1x"
    await expect(page.locator('text=Jogado 1x')).toBeVisible();
  });

  test('should delete game', async ({ page }) => {
    await page.goto('/meus-jogos');

    // Clicar no menu de ações
    await page.click('[data-testid="game-card-menu"]').first();

    // Clicar em "Excluir"
    await page.click('text=Excluir');

    // Confirmar no alert dialog
    await page.click('button:has-text("Excluir")');

    // Verificar toast
    await expect(page.locator('text=Jogo excluído com sucesso')).toBeVisible();
  });

  test('should enforce limit of 50 games', async ({ page }) => {
    // (Assumindo que já existem 50 jogos salvos)
    await page.goto('/lottery/lotofacil/3205');

    // Tentar salvar 51º jogo
    await page.click('button:has-text("Salvar Jogo")');

    // Verificar toast de erro
    await expect(page.locator('text=Limite de 50 jogos salvos atingido')).toBeVisible();
  });
});
```

---

## 📚 Resumo e Próximos Passos

### Resumo da Fase 2

A **Fase 2: Sistema de Salvamento de Jogos** adiciona capacidade completa de gerenciamento de jogos salvos ao aplicativo LOTER.IA:

✅ **Funcionalidades Implementadas:**
- Toggle instantâneo para salvar/dessalvar jogos (Fluxo D)
- Nomeação opcional de jogos (max 50 caracteres)
- Página dedicada "Meus Jogos Salvos" com filtros
- Marcar jogos como jogados (contador play_count)
- Compartilhar via WhatsApp com formatação
- Exportar como arquivo TXT
- Limite de 50 jogos por usuário (trigger no banco)
- 3-4 pontos de acesso simplificados
- Estatísticas agregadas (total, IA, manual, apostas)

✅ **Arquitetura:**
- Tabela `saved_games` com RLS completo
- Materialized view `saved_games_stats` para performance
- Services com validações robustas
- Hooks React Query com invalidation inteligente
- Componentes reutilizáveis e testáveis

### Próximos Passos

1. **Revisar e Aprovar Especificação Fase 2**
   - Bruno deve revisar este documento
   - Identificar qualquer ajuste necessário

2. **Criar Especificação Fase 3**
   - Sistema de Criação Manual de Jogos
   - 4-step stepper (loteria → concurso → números → análise)
   - Análise híbrida (score + detalhes button)
   - Gerar 5 variações

3. **Consolidar Migrations SQL**
   - Criar arquivo único com todas as migrations (Fases 1-3)
   - Pronto para executar sequencialmente

4. **Criar Wireframes Finais ASCII**
   - Todos os fluxos visuais consolidados
   - Documento único de referência

5. **Implementação**
   - Após aprovação de todas as specs
   - Seguir checklists de cada fase
   - Branch `feature/all-phases` com subranches por fase

---

**Última atualização:** 2025-01-03
**Responsável:** Claude Code
**Estimativa Total Fase 2:** 44 horas (~5.5 dias)
**Status:** ✅ Especificação Completa - Aguardando Revisão
