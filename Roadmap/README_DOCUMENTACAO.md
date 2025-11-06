# 📚 Índice de Documentação - LOTER.IA

**Última atualização:** 2025-01-04

---

## 🗂️ Arquivos Principais

### **🔵 Schema do Banco de Dados**

#### **MIGRATIONS_SQL_COMPLETAS.sql** ⭐ PRINCIPAL
- **O quê:** Schema completo do Supabase (todas as tabelas, funções, triggers)
- **Conteúdo:**
  - Fase 1: Sistema de Regeneração (`generation_history`, `user_credits`)
  - Fase 2: Jogos Salvos (`saved_games`, `saved_games_stats`)
  - Fase 3: Criação Manual (`manual_creation_sessions`, `manual_game_variations`)
  - Fase 4: Sistema de Feedback (`user_feedback`, `feedback_stats`)
- **Funções SQL:**
  - `consume_credit()` - Consome 1 crédito (✅ corrigido em 2025-01-04)
  - `reset_monthly_credits()` - Reset automático mensal (✅ atualizado em 2025-01-04)
  - `refresh_saved_games_stats()` - Atualiza estatísticas de jogos salvos
  - `cleanup_old_generations()` - Limpa gerações antigas
  - `cleanup_old_manual_sessions()` - Limpa sessões antigas
  - `get_user_activity_summary()` - Resumo de atividade do usuário
- **Total:** 909 linhas
- **Status:** ✅ Atualizado e pronto para deploy

---

### **🟢 Migrations Específicas**

#### **20250103_fix_consume_credit_ambiguous_column.sql**
- **O quê:** Correção do bug "credits_remaining is ambiguous"
- **Quando usar:** Deploy imediato (CRÍTICO)
- **O que faz:**
  - Qualifica colunas com alias `uc` no UPDATE
  - Adiciona type casting explícito no RETURN QUERY
- **Status:** ⚠️ Aguardando deploy no Supabase

#### **20250103_user_feedback_schema.sql**
- **O quê:** Schema completo do sistema de feedback
- **Conteúdo:** Tabela `user_feedback` + triggers + RLS policies
- **Status:** ✅ Já incluído em MIGRATIONS_SQL_COMPLETAS.sql

#### **FIX_saved_games_stats.sql**
- **O quê:** Correção da coluna `stats` em `saved_games`
- **Quando usar:** Se houver erro ao salvar jogos

#### **ADD_CREDITS_TO_ALL_USERS.sql**
- **O quê:** Script para adicionar créditos manualmente a todos os usuários
- **Quando usar:** Promoções ou correções

#### **ADD_CREDITS_UPSERT.sql**
- **O quê:** Script para inserir/atualizar créditos via UPSERT
- **Quando usar:** Inicialização de créditos de novos usuários

#### **MIGRATION_FIX_LOTTERY_CONSTRAINT.sql**
- **O quê:** Correção de constraint de tipo de loteria
- **Quando usar:** Se houver erro ao salvar jogos de loterias diferentes

---

## 📖 Documentação Técnica

### **Sistema de Créditos**

#### **FEATURES_GRATUITAS_VS_CREDITOS.md** ⭐ DEFINIÇÃO OFICIAL
- **O quê:** Documento definitivo sobre o que é grátis vs pago
- **Conteúdo:**
  - Regra fundamental: features básicas são GRATUITAS
  - Lista completa de features gratuitas (6 itens)
  - Lista de features que consomem créditos (2 itens)
  - Como ganhar créditos (2 métodos)
  - Sistema de reset mensal
  - 3 cenários de uso real
- **Para quem:** Desenvolvedores, suporte, marketing
- **Status:** ✅ Aprovado pelo usuário

#### **SISTEMA_CREDITOS_IMPLEMENTACAO_COMPLETA.md**
- **O quê:** Plano detalhado de implementação do sistema de créditos
- **Conteúdo:**
  - Análise de estado atual
  - 3 problemas críticos identificados
  - Arquitetura completa
  - Code snippets para todas as implementações
  - Checklist de testes
- **Estimativa:** 9-12h
- **Status:** ✅ Fase 1 implementada

#### **FASE1_CREDITOS_COMPLETA.md** ⭐ RESUMO EXECUTIVO
- **O quê:** Resumo da Fase 1 implementada
- **Conteúdo:**
  - O que foi implementado (5 itens)
  - Arquivos criados (3 novos)
  - Arquivos modificados (4 files)
  - Checklist de deploy
  - Próximos passos
- **Status:** ✅ Implementado, aguardando deploy

#### **RESET_AUTOMATICO_CREDITOS.md**
- **O quê:** Documentação do reset automático mensal
- **Conteúdo:**
  - Arquitetura (Edge Function + Cron)
  - Deploy step-by-step
  - Como testar
  - Monitoramento e logs
  - Troubleshooting
- **Status:** ✅ Implementado, aguardando deploy

#### **COMO_ADICIONAR_CREDITOS.md**
- **O quê:** Guia para adicionar créditos manualmente
- **Quando usar:** Suporte, promoções, testes

---

### **Sistema de Feedback**

#### **SISTEMA_FEEDBACK_SUGESTOES.md**
- **O quê:** Plano completo do sistema de feedback
- **Conteúdo:**
  - Estratégia em 3 fases
  - Wireframes e UX
  - Gamificação (+1 crédito por feedback)

#### **SISTEMA_FEEDBACK_FASE1_CONCLUIDA.md**
- **O quê:** Resumo da Fase 1 (Modal e Backend)
- **Status:** ✅ Concluído

#### **SISTEMA_FEEDBACK_FASE2_CONCLUIDA.md** ⭐ ÚLTIMA IMPLEMENTAÇÃO
- **O quê:** Resumo da Fase 2 (Rate limiting, Global events, Toast, FAB)
- **Conteúdo:**
  - Rate limiting de feedbacks (5/dia)
  - Sistema global de eventos
  - Toast pós-compartilhamento
  - FAB (Floating Action Button)
- **Status:** ✅ Concluído

---

### **Sistema de Compartilhamento**

#### **ESTRATEGIA_VIRAL_COMPARTILHAMENTO.md**
- **O quê:** Estratégia completa de compartilhamento viral
- **Conteúdo:**
  - Sistema de recompensas (+1 a +3 créditos)
  - Gatilhos emocionais (Tier S, A, B)
  - Compartilhamento contextual
- **Status:** ✅ Implementado

#### **FASE_1_COMPARTILHAMENTO_CONCLUIDA.md**
- **O quê:** Resumo da Fase 1 (Botão de compartilhar)
- **Status:** ✅ Concluído

#### **FASE_2_TIER_A_MODALS_CONCLUIDA.md**
- **O quê:** Resumo da Fase 2 (Modals de compartilhamento em momentos-chave)
- **Status:** ✅ Concluído

---

### **Jogos Salvos**

#### **FASE2_SALVAR_JOGOS_SPEC.md**
- **O quê:** Especificação da Fase 2 (Sistema de jogos salvos)
- **Conteúdo:**
  - Tabela `saved_games`
  - Limite de 50 jogos
  - RLS policies

#### **FIXES_JOGOS_SALVOS.md**
- **O quê:** Correções aplicadas no sistema de jogos salvos
- **Status:** ✅ Concluído

#### **RESUMO_MELHORIAS_JOGOS_SALVOS.md**
- **O quê:** Resumo das melhorias feitas

#### **IMPLEMENTACAO_COMPLETA_JOGOS_SALVOS.md**
- **O quê:** Documentação completa da implementação
- **Status:** ✅ Concluído

---

### **Outras Features**

#### **FASE1_REGENERACAO_SPEC.md**
- **O quê:** Especificação da Fase 1 (Sistema de regeneração)
- **Conteúdo:**
  - Botão "Gerar Novamente"
  - Consumo de 1 crédito
  - Histórico de gerações

#### **FASE3_CRIACAO_MANUAL_SPEC.md**
- **O quê:** Especificação da Fase 3 (Criação manual de jogos)
- **Conteúdo:**
  - Interface de seleção de números
  - Análise com IA
  - Geração de 5 variações (1 crédito)

#### **WIREFRAMES_CONSOLIDADOS.md**
- **O quê:** Wireframes de todas as telas do app
- **Conteúdo:** ASCII art de todas as interfaces

---

## 🚀 Guia de Deploy

### **Ordem Recomendada:**

1. **Aplicar SQL Migration (CRÍTICO)**
   ```bash
   # Via Supabase Dashboard:
   # 1. SQL Editor
   # 2. Colar: supabase/migrations/20250103_fix_consume_credit_ambiguous_column.sql
   # 3. Executar

   # OU via CLI:
   cd C:\Users\bruno\Documents\Black\Loter.IA\Prod\App\app
   npx supabase db push
   ```

2. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy reset-monthly-credits
   ```

3. **Verificar Cron Job**
   - Dashboard → Edge Functions → Cron Jobs
   - Confirmar `reset-monthly-credits` está ativo

4. **Deploy da Aplicação**
   ```bash
   npm run build
   # Deploy via Vercel/Netlify/etc
   ```

---

## 🔍 Como Encontrar O Que Você Precisa

### **Quer entender o sistema de créditos?**
→ `FEATURES_GRATUITAS_VS_CREDITOS.md` (definição oficial)

### **Precisa aplicar migrations?**
→ `MIGRATIONS_SQL_COMPLETAS.sql` (schema completo)
→ `20250103_fix_consume_credit_ambiguous_column.sql` (correção crítica)

### **Quer ver o que foi implementado na Fase 1?**
→ `FASE1_CREDITOS_COMPLETA.md` (resumo executivo)

### **Como configurar reset automático?**
→ `RESET_AUTOMATICO_CREDITOS.md` (guia completo)

### **Precisa adicionar créditos manualmente?**
→ `COMO_ADICIONAR_CREDITOS.md` (scripts SQL)

### **Sistema de feedback não está funcionando?**
→ `SISTEMA_FEEDBACK_FASE2_CONCLUIDA.md` (última implementação)

### **Quer ver wireframes?**
→ `WIREFRAMES_CONSOLIDADOS.md` (todas as telas)

---

## 📊 Status Geral do Projeto

| Feature | Status | Deploy |
|---------|--------|--------|
| Sistema de Regeneração | ✅ Concluído | ✅ Em produção |
| Jogos Salvos | ✅ Concluído | ✅ Em produção |
| Criação Manual | ✅ Concluído | ✅ Em produção |
| Sistema de Créditos (Fase 1) | ✅ Concluído | ⚠️ Aguardando SQL migration |
| Reset Automático | ✅ Implementado | ⚠️ Aguardando deploy Edge Function |
| Sistema de Feedback | ✅ Concluído | ✅ Em produção |
| Compartilhamento Viral | ✅ Concluído | ✅ Em produção |

---

## 🐛 Problemas Conhecidos

### **⚠️ CRÍTICO: Erro "credits_remaining is ambiguous"**
- **Solução:** Aplicar `20250103_fix_consume_credit_ambiguous_column.sql`
- **Status:** Migration criada, aguardando deploy
- **Impacto:** Regeneração quebrada em produção

### **✅ RESOLVIDO: Variações não consumiam créditos**
- **Solução:** Implementado em `gameVariationsService.ts`
- **Status:** Build com sucesso, aguardando deploy

### **✅ RESOLVIDO: Popover confuso sobre o que é grátis**
- **Solução:** Atualizado `CreditsInfoPopover.tsx`
- **Status:** Build com sucesso, aguardando deploy

---

## 📞 Suporte

**Dúvidas sobre a documentação?**
- Verifique se está usando o arquivo correto para sua necessidade
- Todos os arquivos `.md` têm seção "O quê" e "Quando usar"

**Algo não está funcionando?**
- Verifique a seção "Problemas Conhecidos" acima
- Procure por `FIXES_*.md` ou `RESUMO_*.md` relacionados

**Precisa fazer deploy?**
- Siga a seção "Guia de Deploy" acima
- Priorize migrations críticas (marcadas com ⚠️)

---

**Documento criado por:** Claude Code
**Data:** 2025-01-04
**Versão:** 1.0
