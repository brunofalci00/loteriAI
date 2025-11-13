# 📋 Sistema de Feedback e Sugestões - Plano Completo

**Objetivo:** Implementar sistema de coleta de sugestões, bugs e elogios dos usuários, incentivando participação ativa e melhorando o produto de forma data-driven.

**Estimativa:** 4-6 horas de implementação
**Prioridade:** Alta (engajamento + product insights)

---

## 🎯 ESTRATÉGIA UX/UI - ABORDAGEM HÍBRIDA

Após análise crítica de todos os pontos de contato no app, recomendo uma **abordagem híbrida multi-canal**:

### **Tier 1: Permanente (Sempre Disponível)**
✅ **Header Dropdown (Desktop)** + **MobileMenu (Mobile)**
- **Vantagem:** Sempre acessível, segue padrão de apps (feedback em configurações)
- **Conversão Estimada:** 3-5% dos usuários ativos
- **Implementação:** 15 minutos (1 linha de código cada)

### **Tier 2: Contextual (Momentos Positivos)**
✅ **Toast pós-compartilhamento**
- **Vantagem:** Usuário já está engajado, momento de alta emoção positiva
- **Conversão Estimada:** 8-12%
- **Implementação:** 30 minutos (integração em ShareButton)

✅ **Toast pós-primeira geração**
- **Vantagem:** WOW moment, usuário acabou de ter experiência positiva
- **Conversão Estimada:** 5-8%
- **Implementação:** 20 minutos (integração em FirstGenerationModal)

### **Tier 3: Descoberta Visual (Opcional)**
⚠️ **Floating Action Button (FAB)**
- **Vantagem:** Sempre visível, 1 clique, padrão mobile
- **Conversão Estimada:** 2-4%
- **Implementação:** 45 minutos (novo componente)
- **⚠️ Recomendação:** Testar A/B antes de implementar (pode ser intrusivo)

---

## 🗄️ ESTRUTURA DE DADOS - SUPABASE

### **Tabela: `user_feedback`**

```sql
-- Tabela principal de feedback
CREATE TABLE public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Metadados do feedback
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug', 'praise')),
  category TEXT CHECK (category IN ('ui', 'analysis', 'feature', 'performance', 'other')),
  title TEXT, -- Opcional: título curto
  content TEXT NOT NULL CHECK (char_length(content) >= 10),

  -- Contexto de origem
  context TEXT CHECK (context IN ('general', 'post-generation', 'post-share', 'post-save', 'header', 'mobile-menu', 'fab')),
  page_url TEXT, -- URL da página onde foi enviado

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
  upvotes INT DEFAULT 0, -- Para futuro sistema de votação

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices para performance
  CONSTRAINT feedback_content_min_length CHECK (char_length(content) >= 10)
);

-- Índices
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON public.user_feedback(type);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at DESC);

-- RLS Policies
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Usuários podem inserir seu próprio feedback
CREATE POLICY "Users can insert own feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver seu próprio feedback
CREATE POLICY "Users can view own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas admins podem atualizar status (criar policy separada)
CREATE POLICY "Admins can update feedback"
  ON public.user_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger para atualizar updated_at
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
```

---

### **Tabela: `feedback_stats` (Materialized View)**

```sql
-- View materializada para estatísticas agregadas
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

-- Refresh automático após inserts (trigger)
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
```

---

## 🎨 COMPONENTE PRINCIPAL - FeedbackModal

### **Arquivo:** `src/components/FeedbackModal.tsx`

```typescript
/**
 * Component: FeedbackModal
 *
 * Modal para coleta de feedback dos usuários
 * Suporta 3 tipos: Sugestões, Bugs, Elogios
 *
 * Features:
 * - Tabs por tipo de feedback
 * - Categorização opcional
 * - Textarea com contador de caracteres
 * - Validação (mín 10 caracteres)
 * - Gamificação (+1 crédito se >50 chars)
 * - Toast de confirmação
 * - Tracking de contexto
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  AlertCircle,
  Heart,
  Send,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitFeedback } from '@/services/feedbackService';

export interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: 'general' | 'post-generation' | 'post-share' | 'post-save';
  defaultTab?: 'suggestion' | 'bug' | 'praise';
}

export function FeedbackModal({
  open,
  onOpenChange,
  context = 'general',
  defaultTab = 'suggestion',
}: FeedbackModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [category, setCategory] = useState<string>('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = content.length;
  const minChars = 10;
  const bonusThreshold = 50;
  const isValid = charCount >= minChars;
  const willGetBonus = charCount >= bonusThreshold;

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Feedback muito curto',
        description: `Por favor, escreva pelo menos ${minChars} caracteres.`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitFeedback({
        type: activeTab as 'suggestion' | 'bug' | 'praise',
        category: category || 'other',
        content,
        context,
        pageUrl: window.location.href,
      });

      if (result.success) {
        const creditsAwarded = result.creditAwarded ? 1 : 0;

        toast({
          title: '✅ Feedback enviado com sucesso!',
          description: willGetBonus
            ? `Obrigado pela contribuição detalhada! Você ganhou +${creditsAwarded} crédito.`
            : 'Obrigado por nos ajudar a melhorar!',
        });

        // Reset form
        setContent('');
        setCategory('');
        setActiveTab('suggestion');
        onOpenChange(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar feedback',
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabConfig = {
    suggestion: {
      icon: Lightbulb,
      label: 'Sugestão',
      placeholder: 'Descreva sua ideia em detalhes...\n\nExemplo: Seria legal ter um filtro para ver apenas números pares na análise.',
      categories: [
        { value: 'ui', label: 'Interface/Design' },
        { value: 'analysis', label: 'Análise da IA' },
        { value: 'feature', label: 'Nova Funcionalidade' },
        { value: 'performance', label: 'Performance' },
      ],
    },
    bug: {
      icon: AlertCircle,
      label: 'Reportar Bug',
      placeholder: 'Descreva o problema que encontrou...\n\n• O que você estava fazendo?\n• O que esperava que acontecesse?\n• O que aconteceu de fato?',
      categories: [
        { value: 'ui', label: 'Erro Visual' },
        { value: 'analysis', label: 'Análise Incorreta' },
        { value: 'performance', label: 'Lentidão/Travamento' },
        { value: 'other', label: 'Outro' },
      ],
    },
    praise: {
      icon: Heart,
      label: 'Elogio',
      placeholder: 'Conte o que você mais gostou! ❤️\n\nSeus elogios motivam a equipe a continuar melhorando.',
      categories: [
        { value: 'ui', label: 'Design/Interface' },
        { value: 'analysis', label: 'Qualidade da Análise' },
        { value: 'feature', label: 'Funcionalidade' },
        { value: 'other', label: 'Geral' },
      ],
    },
  };

  const currentConfig = tabConfig[activeTab as keyof typeof tabConfig];
  const Icon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Envie seu Feedback
          </DialogTitle>
          <DialogDescription>
            Sua opinião nos ajuda a melhorar constantemente
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestion">
              <Lightbulb className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sugestão</span>
            </TabsTrigger>
            <TabsTrigger value="bug">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Bug</span>
            </TabsTrigger>
            <TabsTrigger value="praise">
              <Heart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Elogio</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {/* Categoria */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Categoria (opcional)
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {currentConfig.categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conteúdo */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  {currentConfig.label}
                </label>
                <span
                  className={`text-xs ${
                    charCount < minChars
                      ? 'text-destructive'
                      : willGetBonus
                      ? 'text-green-600 font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {charCount} / {minChars} caracteres
                  {willGetBonus && ' ✨'}
                </span>
              </div>

              <Textarea
                placeholder={currentConfig.placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Incentivo de Créditos */}
            {activeTab !== 'praise' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-emerald-800">
                    <p className="font-medium mb-1">
                      Ganhe +1 crédito por feedback detalhado!
                    </p>
                    <p className="text-emerald-700">
                      Feedbacks com mais de {bonusThreshold} caracteres ganham
                      1 crédito de regeneração.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar {currentConfig.label}
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <p className="text-xs text-center text-muted-foreground mt-2">
          Todos os feedbacks são lidos e considerados pela equipe
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📡 SERVICE LAYER - feedbackService.ts

### **Arquivo:** `src/services/feedbackService.ts`

```typescript
/**
 * Feedback Service
 *
 * Serviço para gerenciar feedback de usuários:
 * - Submeter feedback
 * - Listar próprio feedback
 * - Buscar estatísticas
 *
 * @author Claude Code
 * @date 2025-01-03
 */

import { supabase } from '@/integrations/supabase/client';

export interface SubmitFeedbackParams {
  type: 'suggestion' | 'bug' | 'praise';
  category?: string;
  title?: string;
  content: string;
  context: 'general' | 'post-generation' | 'post-share' | 'post-save';
  pageUrl: string;
}

export interface Feedback {
  id: string;
  type: string;
  category: string | null;
  title: string | null;
  content: string;
  status: string;
  credit_awarded: boolean;
  upvotes: number;
  created_at: string;
  implemented_at: string | null;
}

/**
 * Submeter novo feedback
 * Concede +1 crédito se feedback > 50 caracteres
 */
export async function submitFeedback(
  params: SubmitFeedbackParams
): Promise<{
  success: boolean;
  creditAwarded?: boolean;
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Validação client-side
    if (params.content.length < 10) {
      return { success: false, error: 'Feedback muito curto (mínimo 10 caracteres)' };
    }

    // Detectar informações técnicas
    const userAgent = navigator.userAgent;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const browserInfo = {
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
    };

    // Decidir se concede crédito (>50 chars)
    const shouldAwardCredit = params.content.length >= 50 && params.type !== 'praise';

    // Inserir feedback
    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: user.id,
        type: params.type,
        category: params.category || 'other',
        title: params.title,
        content: params.content,
        context: params.context,
        page_url: params.pageUrl,
        user_agent: userAgent,
        screen_resolution: screenResolution,
        browser_info: browserInfo,
        credit_awarded: shouldAwardCredit,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao submeter feedback:', error);
      return { success: false, error: error.message };
    }

    // Se deve conceder crédito, chamar edge function
    if (shouldAwardCredit) {
      try {
        await supabase.functions.invoke('share-reward', {
          body: { credits: 1 },
        });
      } catch (creditError) {
        console.error('⚠️ Erro ao conceder crédito:', creditError);
        // Não bloqueia o feedback, mas loga o erro
      }
    }

    console.log('✅ Feedback enviado:', data.id, '| Crédito:', shouldAwardCredit);

    return {
      success: true,
      creditAwarded: shouldAwardCredit,
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao submeter feedback:', error);
    return {
      success: false,
      error: 'Erro inesperado ao enviar feedback',
    };
  }
}

/**
 * Listar próprio feedback
 */
export async function listMyFeedback(): Promise<{
  success: boolean;
  data?: Feedback[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao listar feedback:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ ${data.length} feedbacks carregados`);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Erro inesperado ao listar feedback:', error);
    return {
      success: false,
      error: 'Erro inesperado ao listar feedback',
    };
  }
}

/**
 * Buscar estatísticas de feedback do usuário
 */
export async function getFeedbackStats(): Promise<{
  success: boolean;
  data?: {
    totalFeedbacks: number;
    suggestionsCount: number;
    bugsCount: number;
    praiseCount: number;
    creditsEarned: number;
    implementedCount: number;
  };
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    const { data, error } = await supabase
      .from('feedback_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao buscar stats:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      // Usuário ainda não enviou feedback
      return {
        success: true,
        data: {
          totalFeedbacks: 0,
          suggestionsCount: 0,
          bugsCount: 0,
          praiseCount: 0,
          creditsEarned: 0,
          implementedCount: 0,
        },
      };
    }

    return {
      success: true,
      data: {
        totalFeedbacks: data.total_feedbacks || 0,
        suggestionsCount: data.suggestions_count || 0,
        bugsCount: data.bugs_count || 0,
        praiseCount: data.praise_count || 0,
        creditsEarned: data.credits_earned || 0,
        implementedCount: data.implemented_count || 0,
      },
    };
  } catch (error) {
    console.error('❌ Erro inesperado ao buscar stats:', error);
    return {
      success: false,
      error: 'Erro inesperado ao buscar estatísticas',
    };
  }
}
```

---

## 🔗 INTEGRAÇÕES PRIORITÁRIAS

### **1. Header.tsx (Desktop) - 1 linha**

```typescript
// Linha 115 (após "Meu Perfil")
<DropdownMenuSeparator />
<DropdownMenuItem onClick={() => setFeedbackModalOpen(true)}>
  <MessageSquare className="mr-2 h-4 w-4" />
  Enviar Feedback
</DropdownMenuItem>

// Adicionar estado no início do componente
const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

// Adicionar modal antes do </div> final
<FeedbackModal
  open={feedbackModalOpen}
  onOpenChange={setFeedbackModalOpen}
  context="general"
/>
```

---

### **2. MobileMenu.tsx (Mobile) - 3 linhas**

```typescript
// Linha 130 (antes do "Sair")
<Button
  variant="ghost"
  className="justify-start gap-3 h-11 w-full"
  onClick={() => {
    setFeedbackModalOpen(true);
    setOpen(false); // Fecha o menu
  }}
>
  <MessageCircle className="h-4 w-4" />
  <span>Feedback e Sugestões</span>
  <Badge variant="secondary" className="ml-auto text-[10px]">
    Novo
  </Badge>
</Button>

// Estado e modal (mesmo padrão do Header)
```

---

### **3. ShareButton.tsx (Pós-Compartilhamento) - Ajustar Toast**

```typescript
// Linha 172 (toast de sucesso)
toast({
  title: `🎉 Compartilhado com sucesso!`,
  description: `Você ganhou +${credits} créditos! ${
    remaining > 0
      ? `Restam ${remaining} compartilhamentos hoje.`
      : 'Limite diário atingido.'
  }`,
  duration: 8000,
  action: (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        // Abrir modal de feedback com contexto
        const feedbackEvent = new CustomEvent('open-feedback', {
          detail: { context: 'post-share' },
        });
        window.dispatchEvent(feedbackEvent);
      }}
    >
      <MessageCircle className="h-4 w-4 mr-1" />
      Feedback
    </Button>
  ),
});
```

---

### **4. FirstGenerationModal.tsx (Link no Footer)**

```typescript
// Linha 232 (footer do modal)
<p className="text-xs text-center text-muted-foreground mt-2">
  Você pode gerar novos jogos a qualquer momento.{' '}
  <button
    className="underline hover:text-foreground transition-colors"
    onClick={() => {
      onOpenChange(false);
      setTimeout(() => {
        const feedbackEvent = new CustomEvent('open-feedback', {
          detail: { context: 'post-generation' },
        });
        window.dispatchEvent(feedbackEvent);
      }, 300);
    }}
  >
    Envie sugestões aqui
  </button>
</p>
```

---

## 🎮 GAMIFICAÇÃO & INCENTIVOS

### **Sistema de Recompensas**

| Ação | Créditos | Condição |
|------|----------|----------|
| Feedback detalhado | +1 | >50 caracteres |
| Bug crítico | +2 | Validado pela equipe |
| Sugestão implementada | +5 | Após implementação |
| 5 feedbacks enviados | +3 | Badge "Colaborador Ativo" |
| 10 feedbacks enviados | +10 | Badge "Colaborador Master" |

### **Badges (Futuro)**

```typescript
interface FeedbackBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number; // Número de feedbacks
  credits: number;
}

const BADGES: FeedbackBadge[] = [
  {
    id: 'contributor',
    name: 'Colaborador',
    description: 'Enviou 3 feedbacks',
    icon: '🤝',
    requirement: 3,
    credits: 0,
  },
  {
    id: 'active_contributor',
    name: 'Colaborador Ativo',
    description: 'Enviou 5 feedbacks',
    icon: '⭐',
    requirement: 5,
    credits: 3,
  },
  {
    id: 'master_contributor',
    name: 'Colaborador Master',
    description: 'Enviou 10 feedbacks',
    icon: '👑',
    requirement: 10,
    credits: 10,
  },
];
```

---

## 📊 ADMIN DASHBOARD (Fase Futura)

### **Página:** `/admin/feedback`

**Features:**
- Listagem de todos os feedbacks
- Filtros por tipo, status, categoria
- Busca por conteúdo
- Ações em massa (marcar como "planejado", "implementado", etc.)
- Notas internas
- Sistema de votação (upvotes)

**Tabela Exemplo:**

| ID | Tipo | Categoria | Preview | Status | Upvotes | Ações |
|----|------|-----------|---------|--------|---------|-------|
| #123 | Sugestão | UI | "Adicionar filtro de..." | Planejado | 15 | Ver/Editar |
| #122 | Bug | Análise | "Números duplicados em..." | Corrigido | 3 | Ver/Arquivar |

---

## 📈 MÉTRICAS DE SUCESSO

### **KPIs Principais**

**Taxa de Abertura:**
- Meta: >5% dos usuários ativos/semana
- Medição: `(usuários que abriram modal) / (usuários ativos)`

**Taxa de Conclusão:**
- Meta: >30% dos que abrem
- Medição: `(feedbacks enviados) / (modais abertos)`

**Qualidade (Chars Médios):**
- Meta: >100 caracteres
- Medição: `AVG(char_length(content))`

**Retenção:**
- Meta: >20% enviam 2º feedback
- Medição: `(usuários com >=2 feedbacks) / (usuários com >=1 feedback)`

**Implementações:**
- Meta: >15% de sugestões implementadas em 3 meses
- Medição: `(status='implemented') / (type='suggestion')`

---

### **Queries de Analytics**

```sql
-- Taxa de abertura (precisa tracking de evento)
SELECT
  COUNT(DISTINCT user_id) AS users_who_submitted,
  (SELECT COUNT(DISTINCT user_id) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days') AS active_users,
  ROUND(
    (COUNT(DISTINCT user_id)::DECIMAL / (SELECT COUNT(DISTINCT user_id) FROM auth.users WHERE created_at > NOW() - INTERVAL '7 days')) * 100,
    2
  ) AS conversion_rate
FROM user_feedback
WHERE created_at > NOW() - INTERVAL '7 days';

-- Distribuição por tipo
SELECT
  type,
  COUNT(*) AS count,
  ROUND(AVG(char_length(content)), 0) AS avg_chars,
  COUNT(*) FILTER (WHERE credit_awarded = TRUE) AS with_bonus
FROM user_feedback
GROUP BY type
ORDER BY count DESC;

-- Top usuários colaboradores
SELECT
  u.email,
  fs.total_feedbacks,
  fs.credits_earned,
  fs.implemented_count
FROM feedback_stats fs
JOIN auth.users u ON u.id = fs.user_id
ORDER BY fs.total_feedbacks DESC
LIMIT 10;

-- Evolução temporal
SELECT
  DATE_TRUNC('week', created_at) AS week,
  COUNT(*) AS feedbacks,
  COUNT(DISTINCT user_id) AS unique_users
FROM user_feedback
GROUP BY week
ORDER BY week DESC;
```

---

## ⚠️ CONSIDERAÇÕES CRÍTICAS

### **Não Fazer:**

1. ❌ **Modal forçado bloqueante** - Nunca bloquear o fluxo do usuário
2. ❌ **Solicitar muito cedo** - Esperar pelo menos 3 interações/24h
3. ❌ **Frequência alta** - Máximo 1 toast por sessão
4. ❌ **Campos obrigatórios demais** - Apenas content é obrigatório
5. ❌ **Sem confirmação** - Sempre mostrar toast de sucesso

### **Rate Limiting:**

```typescript
// Limitar abertura de toast contextual
const LAST_TOAST_KEY = 'loter_ia_last_feedback_toast';

function shouldShowFeedbackToast(): boolean {
  const lastToast = localStorage.getItem(LAST_TOAST_KEY);
  if (!lastToast) return true;

  const hoursSince = (Date.now() - parseInt(lastToast)) / (1000 * 60 * 60);
  return hoursSince >= 24; // Apenas 1x/dia
}

function markFeedbackToastShown(): void {
  localStorage.setItem(LAST_TOAST_KEY, Date.now().toString());
}
```

### **Spam Prevention:**

```sql
-- Limitar a 5 feedbacks por usuário por dia
CREATE OR REPLACE FUNCTION check_feedback_daily_limit()
RETURNS TRIGGER AS $$
DECLARE
  daily_count INT;
BEGIN
  SELECT COUNT(*) INTO daily_count
  FROM user_feedback
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '24 hours';

  IF daily_count >= 5 THEN
    RAISE EXCEPTION 'Daily feedback limit reached (5 per day)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_feedback_daily_limit
  BEFORE INSERT ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION check_feedback_daily_limit();
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### **Fase 1: Core (4-6h) - PRIORIDADE ALTA**

- [ ] Criar tabela `user_feedback` no Supabase (30min)
- [ ] Criar `FeedbackModal.tsx` component (2h)
- [ ] Criar `feedbackService.ts` (1h)
- [ ] Integrar em Header (Desktop) (15min)
- [ ] Integrar em MobileMenu (Mobile) (15min)
- [ ] Testar fluxo completo (1h)

### **Fase 2: Contextos (2-3h) - MÉDIO PRAZO**

- [ ] Integrar toast em ShareButton (30min)
- [ ] Integrar link em FirstGenerationModal (20min)
- [ ] Criar FeedbackFAB (opcional, A/B test) (1h)
- [ ] Implementar rate limiting (30min)
- [ ] Analytics tracking (30min)

### **Fase 3: Dashboard Admin (8-10h) - LONGO PRAZO**

- [ ] Criar página `/admin/feedback` (4h)
- [ ] Sistema de filtros e busca (2h)
- [ ] Ações de moderação (2h)
- [ ] Sistema de votação (upvotes) (2h)

### **Fase 4: Gamificação Avançada (4-6h) - FUTURO**

- [ ] Sistema de badges (2h)
- [ ] Roadmap público de features (2h)
- [ ] Notificações de implementação (2h)

---

## ✅ CHECKLIST DE DEPLOY

### **Backend (Supabase):**
- [ ] Executar migration para criar `user_feedback`
- [ ] Executar migration para criar `feedback_stats`
- [ ] Verificar RLS policies
- [ ] Testar insert/select manual
- [ ] Refresh materialized view

### **Frontend:**
- [ ] Criar `FeedbackModal.tsx`
- [ ] Criar `feedbackService.ts`
- [ ] Integrar em Header
- [ ] Integrar em MobileMenu
- [ ] Build sem erros
- [ ] Testar em dev local

### **Testes:**
- [ ] Submit feedback (sugestão)
- [ ] Submit feedback (bug)
- [ ] Submit feedback (elogio)
- [ ] Validação de 10 chars mínimo
- [ ] Crédito +1 com >50 chars
- [ ] Toast de sucesso
- [ ] Listar próprio feedback

---

## 📝 CONCLUSÃO

**Estratégia Recomendada:**

1. **Implementar Fase 1 imediatamente** (4-6h)
   - Header + Mobile Menu (sempre disponível)
   - FeedbackModal completo
   - Backend com RLS

2. **Monitorar métricas primeiras 2 semanas**
   - Taxa de abertura
   - Taxa de conclusão
   - Qualidade do conteúdo

3. **Iterar baseado em dados**
   - Se conversão <3%: adicionar toast contextual
   - Se chars médios <50: melhorar incentivo
   - Se bugs duplicados: adicionar busca antes de submit

4. **Expandir para Fases 2-4 conforme necessidade**

**Estimativa Total:** 18-25h (todas as fases)
**ROI Esperado:** Alto (product insights + engajamento + créditos como incentivo)

---

**Próximos Passos:**
1. Aprovar estratégia
2. Executar migration do Supabase
3. Implementar Fase 1
4. Deploy e monitoramento
