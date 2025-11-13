# 🎯 PLANEJAMENTO DE FEATURES - LOTER.IA
**Data:** 2025-01-03
**Status:** Fase de Descoberta e Alinhamento
**Responsável:** Bruno + Claude Code

---

## 📋 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Descobertas da Investigação](#descobertas-da-investigação)
3. [Feature 1: Regeneração de Combinações](#feature-1-regeneração-de-combinações)
4. [Feature 2: Salvar Jogos](#feature-2-salvar-jogos)
5. [Feature 3: Criação Manual + Análise IA](#feature-3-criação-manual--análise-ia)
6. [Arquitetura de Dados](#arquitetura-de-dados)
7. [Fluxos de UX/UI](#fluxos-de-uxui)
8. [Impactos Técnicos](#impactos-técnicos)
9. [Questões Críticas para Decisão](#questões-críticas-para-decisão)
10. [Próximos Passos](#próximos-passos)

---

## 1. RESUMO EXECUTIVO

### 🎯 Objetivo Geral
Transformar o Loter.IA de um gerador estático de combinações em uma plataforma interativa e personalizável, onde usuários podem:
- Regenerar combinações quantas vezes quiserem
- Salvar e gerenciar seus jogos favoritos
- Criar jogos manualmente e pedir análise da IA

### 🔍 Descoberta Crítica

**PROBLEMA INICIAL DESCRITO:**
> "Se entrarmos em qualquer concurso, todas as edições vão entregar a mesma combinação naquele dia específico, independentemente do número do concurso."

**REALIDADE DESCOBERTA NA INVESTIGAÇÃO:**
Isso **NÃO está acontecendo**. Cada usuário recebe combinações DIFERENTES porque:
- `Math.random()` gera números aleatórios a cada execução
- Cache é único por `(user_id, lottery_type, contest_number)`
- Usuário A e Usuário B NUNCA compartilham combinações

- Resposta: Sim! Mas para um mesmo usuário, todos as edições de um determinado concurso, todas as edições tem sempre a mesma combinação. Esse é o problema.

**PROBLEMA REAL IDENTIFICADO:**
- **Usuários não conseguem REGENERAR** combinações para o mesmo concurso
- Uma vez gerado, o cache fica permanente
- Não há botão "Gerar novamente" ou "Tentar outra estratégia"

### ⚠️ Questão Fundamental para Esclarecer

**BRUNO, PRECISO QUE VOCÊ CONFIRME:**

Quando você diz "todas as edições vão entregar a mesma combinação", você está se referindo a:

**A)** O mesmo usuário, acessando o mesmo concurso múltiplas vezes, sempre vê os mesmos números? (ESTE É O COMPORTAMENTO ATUAL - É CORRETO) 

**B)** Usuários diferentes, acessando o mesmo concurso, veem os mesmos números entre si? (ISTO NÃO ESTÁ ACONTECENDO - CADA USUÁRIO TEM NÚMEROS ÚNICOS)

**C)** Concursos diferentes do MESMO DIA (ex: Mega-Sena 2750 vs Quina 6850 no mesmo dia) geram os mesmos números? (ISTO TAMBÉM NÃO ESTÁ ACONTECENDO - SÃO INDEPENDENTES)

👉 **Por favor, especifique qual é o comportamento que você observou e considerou problemático.**

para um mesmo usuário, todos as edições de um determinado concurso, todas as edições tem sempre a mesma combinação. Esse é o problema.

## 2. DESCOBERTAS DA INVESTIGAÇÃO

### 2.1 Arquitetura Atual

#### **Cache de Análises**
```sql
-- Tabela: lottery_analyses
-- Constraint: UNIQUE(user_id, lottery_type, contest_number)
```

**Comportamento:**
- ✅ Cada usuário tem seu próprio cache isolado
- ✅ Mesmos dados históricos, mas combinações diferentes (devido a Math.random())
- ❌ Uma vez gerado, não há como regenerar sem deletar manualmente
- ❌ Sem versionamento ou histórico de gerações

#### **Lógica de Geração**
**Arquivo:** `App/app/src/services/lotteryAnalysis.ts:132-148`

```typescript
// CRÍTICO: Math.random() é chamado 5+ vezes por combinação
const rand = Math.random();
if (rand < strategy.hotNumbersWeight) {
  num = hotNumbers[Math.floor(Math.random() * hotNumbers.length)];
}
```

**Resultado:** Impossível reproduzir a mesma sequência de números.

#### **Hook de Análise**
**Arquivo:** `App/app/src/hooks/useLotteryAnalysis.ts:36-48`

```typescript
// Se cache existe E tem jogos válidos → retorna cache
if (combinations.length > 0) {
  return { ...cachedAnalysis, fromCache: true };
}
```

**Problema:** Não há parâmetro para "forçar regeneração".

### 2.2 Tabelas Existentes

| Tabela | Campos Relevantes | Propósito |
|--------|-------------------|-----------|
| `profiles` | `id`, `email`, `full_name` | Dados do usuário |
| `payments` | `user_id`, `status`, `amount` | Verificação de pagamento |
| `lottery_analyses` | `user_id`, `lottery_type`, `contest_number`, `generated_numbers` | Cache de análises |

**⚠️ LACUNAS IDENTIFICADAS:**
- ❌ Sem tabela `saved_games` (jogos salvos pelo usuário)
- ❌ Sem tabela `user_preferences` (números favoritos/excluídos)
- ❌ Sem tabela `generation_history` (histórico de regenerações)
- ❌ Sem tabela `custom_analyses` (jogos manuais analisados)

### 2.3 Fluxo de Navegação Atual

```
Dashboard (escolher loteria)
    ↓
LotteryContests (listar 7 próximos concursos)
    ↓
Lottery (gerar 10 combinações para o concurso)
```

**Limitações:**
- Sem tela intermediária entre Dashboard e Contests
- Sem área dedicada para jogos salvos
- Sem opção para criar jogo manual

---

## 3. FEATURE 1: REGENERAÇÃO DE COMBINAÇÕES

### 3.1 Descrição da Necessidade

**Problema Atual:**
- Usuário gera combinações para Mega-Sena Concurso 2750
- Se não gostar, não tem como gerar novas combinações
- Cache fica permanente até ser deletado manualmente

**Solução Proposta (Inicial):**
> "tivesse a possibilidade de gerar uma nova combinação com a IA através de algum botão"

### 3.2 Questões Críticas 🔴

#### **3.2.1 Estratégia de Cache**

**OPÇÃO A: Invalidar e Substituir**
- Botão "Gerar Novamente" deleta cache e cria novo
- Usuário perde combinações anteriores permanentemente
- Mais simples de implementar

**OPÇÃO B: Histórico de Gerações**
- Cada regeneração cria nova entrada em `generation_history`
- Usuário pode navegar entre versões (Geração 1, 2, 3...)
- Mais complexo, mas preserva histórico

**OPÇÃO C: Estratégias Múltiplas**
- Cache permite múltiplas análises por concurso (uma por estratégia)
- Usuário escolhe: "Gerar com estratégia HOT", "Gerar com estratégia COLD", etc.
- Constraint muda para: `UNIQUE(user_id, lottery_type, contest_number, strategy_type)`

👉 **Qual opção você prefere? Por quê?**
Acredito que a opção B, porque ele consegue navegar entre as 3 opções geradas. Para não sobrecarregar a IA, podemos colocar um timer para gerar novamente ou limitar em novas 50 gerações/mensais no total (para qualquer concurso e qualuer edição.)

#### **3.2.2 Limite de Regenerações**

**Cenário:** Usuário clica "Gerar Novamente" 100 vezes seguidas.

**PROBLEMA:**
- Cada geração consome recursos (análise de 100+ sorteios)
- Pode abusar da API Caixa (rate limits)
- Aumenta tamanho do banco de dados

**OPÇÕES:**

**A) Sem Limites**
- Liberdade total
- Risco de abuso
- Custos de servidor podem aumentar

**B) Limite Diário (ex: 50 regenerações/dia)**
- Impede abuso
- Pode frustrar usuários legítimos

**C) Cooldown (ex: 1 regeneração a cada 30 segundos)**
- Evita spam de cliques
- Usuário pode regenerar ilimitadamente, mas devagar

**D) Custo em "Créditos" (gamificação)**
- Usuário recebe 100 créditos/mês
- Cada regeneração = 1 crédito
- Premium users = créditos ilimitados

👉 **Qual limite você considera justo? Ou prefere sem limites?**
Vamos deixar com 50 créditos para 50 gerações mensais. Vamos também colocar um cooldown de 30 segundos para gerar a combinação para evitar o Spam. Por enquanto, não temos o plano com gerações ilimitadas, mas trablahremos isso futuramente. Adicionando essa feature, teríamos que informar em termos de UX/UI a existência desses créditos. O que acha?

#### **3.2.3 Interface do Usuário**

**LOCALIZAÇÃO DO BOTÃO:**

**Opção A:** Botão no topo da página de resultados (Lottery.tsx)
```
[< Voltar] [🔄 Gerar Novamente] [💾 Salvar Jogos] [📤 Exportar]
```

**Opção B:** Botão dentro de cada card de combinação
```
Jogo 1: 05 12 23 34 45 58  [🔄 Regenerar este jogo]
Jogo 2: 03 18 27 39 41 52  [🔄 Regenerar este jogo]
```
(permite regenerar jogos individuais)

**Opção C:** Menu dropdown com opções
```
[⚙️ Opções ▼]
  ├─ 🔄 Gerar novas combinações
  ├─ 🎲 Gerar com estratégia HOT
  ├─ 🧊 Gerar com estratégia COLD
  └─ ⚖️ Gerar balanceado (atual)
```

👉 **Qual interface faz mais sentido para você?**

Acredito que o usuário deve conseguir salvar um jogo individual, e não uma combinação de 10 jogos tudo junto. Além disso, acredito que deveriamos seguir com a Opção A, de regenerar todos os jogos. E para salvar, ter a opção de qual jogo em específico salvar. Por enquanto, não teremos opção de regenerar os jogos com uma "estratégia" específica.

#### **3.2.4 Feedback Visual**

Quando usuário clica "Gerar Novamente", o que acontece na tela?

**Opção A:** Loading full-screen
- Tela fica bloqueada
- Spinner grande no centro
- "Gerando novas combinações..."

**Opção B:** Skeleton placeholders
- Cards de jogos ficam com efeito shimmer
- Usuário vê estrutura mas sem números
- Mais moderno

**Opção C:** Animação de transição
- Números atuais "desaparecem" com fade-out
- Novos números "aparecem" com fade-in
- Mais fluido

👉 **Qual experiência visual você imagina?**
Opção B ou C. o que for mais fácil de implementar. Talvez a opção C. seja visualmente e mais facil de implementar.

#### **3.2.5 Notificação ao Usuário**

Quando geração completa, mostrar:

**Opção A:** Toast notification simples
```
✅ "Novas combinações geradas!"
```

**Opção B:** Modal com comparação
```
┌───────────────────────────────────┐
│ Comparação de Gerações            │
├───────────────────────────────────┤
│ Geração Anterior:                 │
│ Acurácia: 89% | Hot: 8 | Cold: 2  │
│                                   │
│ Nova Geração:                     │
│ Acurácia: 92% | Hot: 9 | Cold: 1  │
│                                   │
│ [Ver Anterior] [Manter Nova]      │
└───────────────────────────────────┘
```

**Opção C:** Banner no topo com desfazer
```
✅ Novas combinações geradas! [← Desfazer]
```

👉 **Como você quer comunicar a mudança ao usuário?**

Opção A

#### **3.2.6 Persistência de Dados**

**PERGUNTA FUNDAMENTAL:**

Se usuário regenera combinações, o que acontece com:

**A) Histórico de gerações anteriores?**
- Salvar tudo → tabela `generation_history`
- Substituir → deletar e inserir novo
- Manter última + anterior → "Geração Atual" e "Geração Anterior"

**B) Estatísticas (hot/cold numbers, accuracy)?**
- Recalcular sempre (baseado em novos dados da API)
- Manter fixo (usar mesmas stats, variar apenas combinações)

**C) Strategy type?**
- Manter mesma estratégia (balanced, hot, cold)
- Permitir trocar estratégia ao regenerar

👉 **O que deve ser preservado e o que deve mudar?**

A) Salvar tudo na tabela
B) Mesmo stats
C) mesma estratégia

---

## 4. FEATURE 2: SALVAR JOGOS

### 4.1 Descrição da Necessidade

**Problema Atual:**
> "foi questionado sobre a falta de os usuários não conseguirem salvar os jogos gerados"

**Comportamento Desejado:**
- Usuário vê 10 combinações geradas
- Escolhe suas favoritas (ex: Jogo 3, Jogo 7)
- Salva para consultar depois em qualquer momento

### 4.2 Questões Críticas 🔴

#### **4.2.1 Escopo de Salvamento**

**O QUE o usuário pode salvar?**

**Opção A:** Salvar jogos individuais
- Checkbox em cada combinação
- Usuário escolhe: "Salvar Jogo 3, Jogo 7"
- Mais flexível

**Opção B:** Salvar análise completa
- Botão "Salvar todas as 10 combinações"
- Usuário não escolhe jogos individuais
- Mais simples

**Opção C:** Ambos
- Salvar análise completa OU jogos individuais
- Máxima flexibilidade
- Mais complexo

👉 **O que faz mais sentido para o usuário final?**
Salvar apenas os jogos individuais

#### **4.2.2 Limite de Jogos Salvos**

**Cenário:** Usuário salva jogos de 50 concursos diferentes.

**PROBLEMA:**
- Banco de dados cresce indefinidamente
- UI de "Jogos Salvos" fica sobrecarregada

**OPÇÕES:**

**A) Limite por Usuário (ex: 100 jogos salvos)**
- Ao atingir limite, usuário deve deletar antigos para salvar novos
- Notificação: "Você atingiu o limite de 100 jogos. Delete jogos antigos."

**B) Limite por Concurso (ex: 3 jogos salvos por concurso)**
- Usuário pode salvar no máximo 3 combinações para Mega-Sena 2750
- Incentiva curadoria

**C) Sem Limite (Premium users ilimitado, Free users limitado)**
- Monetização
- Free: 20 jogos salvos
- Premium: ilimitado

**D) Sem Limite Algum**
- Confiança no uso razoável
- Risco de acumulação

👉 **Qual limite você considera apropriado?**

A melhor opção seria já jogarmos o limite do usuário com base no plano. Como falei, ainda não temos um plano de upsell. Mas é bom ter mapeado. Vamos colocar um limite de 50 jogos salvos. A partir daí, a pessoa pode gerenciar seus jogos, excluir e adicionar novos caso queira. Então seria uma mistura da solução A com C.

#### **4.2.3 Organização dos Jogos Salvos**

**ONDE os jogos salvos ficam acessíveis?**

**Opção A:** Nova página "/saved-games"
```
Dashboard
LotteryContests
Lottery
Saved Games  ← NOVA PÁGINA
```

**Opção B:** Seção dentro do Dashboard
```
┌─────────────────────────┐
│ Dashboard               │
├─────────────────────────┤
│ [Minhas Loterias]       │
│ Mega-Sena               │
│ Quina                   │
│ Lotofácil               │
│                         │
│ [Meus Jogos Salvos]  ←  │
│ 5 jogos salvos          │
└─────────────────────────┘
```

**Opção C:** Sidebar/Drawer global
```
[☰] ← Abre sidebar
  ├─ Dashboard
  ├─ Meus Jogos Salvos (★15)
  └─ Configurações
```

**Opção D:** Aba dentro de Lottery.tsx
```
[Análise IA] [Jogos Salvos (3)] [Histórico]
      ↑             ↑               ↑
   Aba atual   Jogos salvos   Regenerações
```

👉 **Qual navegação é mais intuitiva?**
Aqui, precisamos adicionar em alguns caminhos para essa opção não ser acessada por apenas 1 caminho. Eu criaria uma página nova com os jogos salvos. E então, eu colocaria para essa página ser acessada pelos os seguintes paths: dentro da página do perfil; uma aba dentro de lottery, de forma que não polua visualmente o restante da página; talvez um sidebar/Drawer globla OU uma barra inferior de navegação fixa (para mobile)
O que você acha?
#### **4.2.4 Metadata dos Jogos Salvos**

**O QUE o usuário pode fazer com jogos salvos?**
Usar como histórico e jogar na loteria. Acho que funcionaria mais para registro e controle dos usuários.

**Campos Possíveis:**

**Essenciais:**
- `id`, `user_id`, `lottery_type`, `contest_number`, `numbers[]`

**Opcionais:**
- `name` (ex: "Meu jogo da sorte", "Números do aniversário")
- `notes` (ex: "Números baseados em datas importantes")
- `is_favorite` (estrela para destacar)
- `tags[]` (ex: ["quente", "aniversário", "teste"])
- `created_at`, `last_played_at`
- `play_count` (quantas vezes o usuário apostou esse jogo)

**QUESTÕES:**

1. **Usuário pode renomear jogos?**
   - Sim → Campo `name` obrigatório ou opcional?
   - Não → Identificação automática "Jogo salvo em 03/01/2025"

2. **Usuário pode adicionar notas?**
   - Sim → Textarea livre
   - Não → Menos complexidade

3. **Usuário pode marcar favoritos?**
   - Sim → Ícone de estrela, filtro "Apenas favoritos"
   - Não → Todos jogos têm mesmo peso

4. **Usuário pode tagear jogos?**
   - Sim → Sistema de tags customizáveis
   - Não → Sem categorização

👉 **Quais metadata são necessários na sua visão?**
1. Name é opcional
2. Não
3. Todos tem o mesmo peso

#### **4.2.5 Ações sobre Jogos Salvos**

**O QUE o usuário pode fazer na página de Jogos Salvos?**

**Ações Possíveis:**

- ✅ Visualizar números
- ✅ Exportar para .txt (individual ou em lote)
- ✅ Deletar jogo
- ❓ Editar números manualmente
- ❓ Duplicar jogo (criar cópia)
- ❓ Compartilhar jogo (gerar link)
- ❓ Marcar como "Jogado" (rastreamento de apostas)
- ❓ Ver histórico de resultados (comparar com sorteios passados)
- ❓ Re-analisar jogo (se concurso já ocorreu, mostrar acertos)

👉 **Quais ações fazem sentido para a Feature 2?**
- ✅ Visualizar números
- ✅ Exportar para .txt (individual ou em lote)
- ✅ Deletar jogo
- ✅ Editar números manualmente
- ✅ Compartilhar jogo (gerar de whatsapp com mensagem pré programada)
- ✅ Marcar como "Jogado"
- ✅ Re-analisar jogo (se concurso já ocorreu, mostrar acertos)


#### **4.2.6 Experiência de Salvamento**

**COMO o usuário salva um jogo?**

**Opção A:** Checkbox + Botão Global
```
[ ] Jogo 1: 05 12 23 34 45 58
[✓] Jogo 2: 03 18 27 39 41 52  ← Usuário marca
[✓] Jogo 3: 08 15 29 38 44 59  ← Usuário marca

[💾 Salvar Selecionados (2)]  ← Clica aqui
```

**Opção B:** Botão Individual em Cada Jogo
```
Jogo 1: 05 12 23 34 45 58  [💾 Salvar]
Jogo 2: 03 18 27 39 41 52  [💾 Salvar]
```

**Opção C:** Ícone de Estrela (Toggle Instantâneo)
```
Jogo 1: 05 12 23 34 45 58  [☆] ← Clica = salva instantaneamente
Jogo 2: 03 18 27 39 41 52  [★] ← Já salvo
```

**Opção D:** Arrastar para área "Salvos"
```
[Jogos Gerados]          [Meus Salvos]
Jogo 1 ───────────────▶  Jogo 2
Jogo 3                    Jogo 7
```
(Drag & drop)

👉 **Qual interação é mais natural?**
Opção C, com ícone

#### **4.2.7 Integração com Regeneração**

**CONFLITO POTENCIAL:**

1. Usuário gera combinações para Mega-Sena 2750
2. Usuário **salva** Jogo 3
3. Usuário clica "Gerar Novamente"
4. Novas combinações são geradas

**O QUE acontece com o Jogo 3 salvo?**

**Opção A:** Jogo salvo permanece intocado
- Jogos salvos são independentes do cache
- Regeneração não afeta jogos salvos
- Usuário pode ter jogos salvos + jogos atuais diferentes

**Opção B:** Jogo salvo é marcado como "antigo"
- Tag "Geração Anterior"
- Usuário vê que aquele jogo não faz parte da geração atual

**Opção C:** Jogo salvo é deletado automaticamente
- Regeneração limpa jogos salvos do concurso
- Usuário precisa salvar novamente
- ⚠️ Perigoso - perda de dados

👉 **Como você espera que isso funcione?**

Opção A com certeza. 

---

## 5. FEATURE 3: CRIAÇÃO MANUAL + ANÁLISE IA

### 5.1 Descrição da Necessidade

**Proposta Inicial:**
> "Dar a opção de o usuário criar o próprio jogo, e fazer a IA analisá-lo."

**Ideia:**
> "Nessa página, poderíamos ter a opção de ou gerar um jogo com a IA, ou criar o próprio jogo e pedir para ela analisar."

### 5.2 Questões Críticas 🔴

#### **5.2.1 Posicionamento na Navegação**

**VOCÊ SUGERIU:**
> "criaríamos uma página entre A home e a página onde tem a listagem de concursos"

**FLUXO PROPOSTO:**
```
Dashboard (escolher loteria)
    ↓
[NOVA PÁGINA] ← "Gerar IA ou Criar Manual?"
    ↓
LotteryContests (se escolheu "Gerar IA")
OU
ManualCreation (se escolheu "Criar Manual")
```

**PROBLEMA IDENTIFICADO:**

Isso **quebra o fluxo atual** de usuários existentes que estão acostumados com:
```
Dashboard → Contests → Lottery
```

**ALTERNATIVAS:**

**Opção A: Página Intermediária (Sua Proposta Inicial)**
```
Dashboard → ChoiceScreen → Contests OU Manual
```
- Pros: Clara separação de fluxos
- Cons: Adiciona clique extra para usuários que só querem IA

**Opção B: Botão no Dashboard**
```
Dashboard
  [Mega-Sena]  [➕ Criar Jogo Manual]
  [Quina]      [📊 Ver Jogos Salvos]
  [Lotofácil]
```
- Pros: Não interrompe fluxo atual
- Cons: Pode ficar visualmente carregado

**Opção C: Aba dentro de Contests**
```
LotteryContests
  [Próximos Concursos] [➕ Criar Jogo Manual]
```
- Pros: Contextualiza criação manual dentro da loteria
- Cons: Criação manual depende de contest_number?

**Opção D: Menu Flutuante (FAB - Floating Action Button)**
```
[+] ← Sempre visível
  Clica:
    [🤖 Gerar com IA]
    [✏️ Criar Manualmente]
```
- Pros: Acessível de qualquer lugar
- Cons: Pode parecer "móvel demais" para web

**Opção E: Seção Dedicada no Dashboard**
```
┌─────────────────────────────────┐
│ [Análise Rápida]                │
│ Escolha uma loteria:            │
│ [Mega-Sena▼] [Gerar Agora]      │
│                                 │
│ [Criação Manual]                │
│ Escolha uma loteria:            │
│ [Quina▼] [Criar Jogo]           │
└─────────────────────────────────┘
```
- Pros: Ambos fluxos visíveis desde o início
- Cons: Dashboard fica maior

👉 **Qual arquitetura de navegação você prefere? Tem outra ideia?**

Aqui segue o mesmo raciocínio dos jogos salvos. Precisamos hospedar isso em algum lugar (recomendo em uma nova página, já que é uma feature mais complexa). Mas, para acessar essa feature ou página nova, não podemos nos limitar a apenas 1 caminho. Acredito que precisamos ter no dashboard alguma seção que mencione que essa opção existe. Além disso, se formos com o menu lateral ou inferior, creio que essa será uma opção que estará lá como uma página dedicada. Precisaríamos adicionar em mais algum outro lugar como na opção A ou C. Quero saber o que você acha em termos de experiência do usuário.

#### **5.2.2 Dependência de Concurso**

**PERGUNTA FUNDAMENTAL:**

Quando usuário cria jogo manual, ele precisa especificar para qual concurso?

**Cenário A: SIM - Vinculado a Concurso**
```
1. Usuário escolhe: Mega-Sena, Concurso 2750
2. Usuário cria: 05 12 23 34 45 58
3. IA analisa baseado nos 100 sorteios ANTERIORES a 2750
4. Jogo salvo fica vinculado ao concurso 2750
```

**Cenário B: NÃO - Análise Genérica**
```
1. Usuário escolhe: Mega-Sena (sem concurso específico)
2. Usuário cria: 05 12 23 34 45 58
3. IA analisa baseado nos últimos 100 sorteios gerais
4. Jogo salvo fica como "Jogo Customizado Mega-Sena"
```

**IMPLICAÇÕES:**

| Aspecto | Vinculado a Concurso | Análise Genérica |
|---------|----------------------|------------------|
| **Contexto** | Mais preciso (histórico até concurso X) | Menos preciso (histórico geral) |
| **Salvamento** | Organizado por concurso | Lista geral de jogos |
| **Re-análise** | Pode comparar com resultado real depois | Difícil rastrear |
| **Complexidade** | Usuário precisa escolher concurso | Mais simples |

👉 **Jogos manuais devem ser vinculados a concursos específicos?**
Sim, devem ser vinculados a concurso.

#### **5.2.3 Interface de Criação**

**COMO o usuário escolhe os números?**

**Opção A: Grid de Botões (Como na Landing Page)**
```
┌─────────────────────────────────────┐
│ Escolha 6 números (0/6 selecionados)│
├─────────────────────────────────────┤
│ [01] [02] [03] [04] [05] [06]       │
│ [07] [08] [09] [10] [11] [12]       │
│ [13] [14] [15] [16] [17] [18]       │
│ ...                                 │
│ [55] [56] [57] [58] [59] [60]       │
├─────────────────────────────────────┤
│ [Limpar] [Preencher Aleatório]      │
│ [Analisar com IA →]                 │
└─────────────────────────────────────┘
```
- Pros: Visual, fácil de usar
- Cons: Ocupa muito espaço

**Opção B: Input Manual com Validação**
```
┌──────────────────────────────────┐
│ Digite os números separados por │
│ vírgula ou espaço:               │
│                                  │
│ [5, 12, 23, 34, 45, 58____]      │
│                                  │
│ ✅ 6 números válidos             │
│ [Analisar com IA →]              │
└──────────────────────────────────┘
```
- Pros: Compacto, rápido para quem sabe os números
- Cons: Mais propenso a erros

**Opção C: Híbrido (Input + Grid)**
```
┌──────────────────────────────────┐
│ [5, 12, 23, 34, 45, __] (6/6)    │
│                                  │
│ OU clique nos números:           │
│ [01][02][03]...[60]              │
│                                  │
│ [Analisar com IA →]              │
└──────────────────────────────────┘
```
- Pros: Flexibilidade
- Cons: Mais complexo de implementar

**Opção D: Stepper Multi-etapa**
```
Passo 1: Escolha a loteria
Passo 2: Escolha os números
Passo 3: Veja a análise
```
- Pros: Guided, menos overwhelming
- Cons: Mais cliques

👉 **Qual UX de criação você imagina?**
Eu gosto da opção D. Só que nela, não mostra como selecionaria os números. Eu iria com a opção A para selecionar os números. Igual na LP

#### **5.2.4 Feedback da Análise IA**

**O QUE a IA mostra ao analisar jogo manual?**

**Opção A: Análise Comparativa**
```
┌─────────────────────────────────────┐
│ Seu Jogo: 05 12 23 34 45 58         │
├─────────────────────────────────────┤
│ 📊 Análise Estatística:             │
│ • Hot Numbers: 3/6 (05, 23, 45)     │
│ • Cold Numbers: 1/6 (58)            │
│ • Números Médios: 2/6 (12, 34)      │
│                                     │
│ ⚖️ Equilíbrio:                      │
│ • Pares/Ímpares: 3/3 ✅             │
│ • Soma: 197 (Média: 195) ✅         │
│ • Consecutivos: 0 ✅                │
│                                     │
│ 🎯 Probabilidade Estimada:          │
│ • Acerto 4 números: 12%             │
│ • Acerto 5 números: 3%              │
│ • Acerto 6 números: 0.0008%         │
│                                     │
│ 💡 Sugestões:                       │
│ • Trocar 58 por 42 (mais frequente)│
│ • Considerar adicionar 07           │
└─────────────────────────────────────┘
```

**Opção B: Score Simples**
```
┌─────────────────────────────────────┐
│ Seu Jogo: 05 12 23 34 45 58         │
│                                     │
│ Qualidade: ⭐⭐⭐⭐☆ (4/5)          │
│                                     │
│ Este jogo está ACIMA DA MÉDIA       │
│ em relação aos padrões históricos.  │
│                                     │
│ [Ver Detalhes] [Salvar Jogo]        │
└─────────────────────────────────────┘
```

**Opção C: Comparação com IA**
```
┌─────────────────────────────────────┐
│ Seu Jogo vs. Jogo da IA             │
├─────────────────────────────────────┤
│ SEU:  05 12 23 34 45 58             │
│ IA:   03 07 18 29 44 51             │
│                                     │
│ Números em comum: 0                 │
│ Seu score: 78%                      │
│ Score IA: 89%                       │
│                                     │
│ [Usar Jogo da IA] [Manter Meu]      │
└─────────────────────────────────────┘
```

👉 **Que tipo de feedback seria mais valioso?**
Eu gosto do feedback da opção A com os complementos da opção B. então, daria uma nota, um reusmo, e a opção de ver detalhes e salvar jogo. Os detlahes seria a opção A

#### **5.2.5 Ações Pós-Análise**

Após IA analisar jogo manual, o que usuário pode fazer?

**Ações Possíveis:**

- ✅ Salvar jogo (vai para "Jogos Salvos")
- ✅ Exportar para .txt
- ❓ Editar números e re-analisar
- ❓ Gerar variações (IA sugere 5 jogos similares)
- ❓ Comparar com jogos gerados automaticamente
- ❓ Enviar para grupo/compartilhar

👉 **Quais ações fazem sentido aqui?**

- ✅ Salvar jogo (vai para "Jogos Salvos")
- ✅ Exportar para .txt
- ✅ Editar números e re-analisar
- ✅ Gerar variações (IA sugere 5 jogos similares)
- ✅ Enviar para grupo/compartilhar

#### **5.2.6 Salvamento de Jogos Manuais**

**ONDE jogos manuais analisados vão?**

**Opção A: Mesma Tabela `saved_games`**
```sql
saved_games (
  ...
  source TEXT DEFAULT 'ai_generated',  -- 'ai_generated' ou 'user_created'
  analysis_result JSONB  -- Resultado da análise IA
)
```
- Pros: Tudo centralizado
- Cons: Mistura jogos IA e manuais

**Opção B: Tabela Separada `custom_analyses`**
```sql
custom_analyses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  lottery_type TEXT,
  numbers INTEGER[],
  analysis_result JSONB,
  created_at TIMESTAMPTZ
)
```
- Pros: Separação clara
- Cons: Mais tabelas para gerenciar

**Opção C: Não Salvar Automaticamente**
- Análise é volátil (só vê na hora)
- Usuário pode salvar manualmente se quiser
- Pros: Mais simples
- Cons: Perde análise ao sair da página

👉 **Como você quer persistir jogos manuais?**
Opção A, mesma tabela

#### **5.2.7 Educação do Usuário**

**DESAFIO DE UX:**

Usuários podem não entender:
- Por que criar jogo manual se IA já gera?
- O que significa "análise IA"?
- Como usar feedback da análise?

**SOLUÇÕES POSSÍVEIS:**

**A) Tooltip/Ajuda Contextual**
```
[?] ← Hover: "A IA vai analisar seu jogo e mostrar
     se ele segue padrões estatísticos vencedores"
```

**B) Tour Guiado (First-time Only)**
```
👋 Primeira vez aqui?
[Sim, me mostre como funciona]
[Não, eu sei o que fazer]
```

**C) Exemplos/Templates**
```
Não sabe por onde começar?
[Usar Números de Aniversário]
[Usar Números Aleatórios]
[Ver Exemplo]
```

👉 **Como garantir que usuários entendam essa feature?**
Vamos seguir com a opção A e B

---

## 6. ARQUITETURA DE DADOS

### 6.1 Tabelas Existentes (Não Modificar)

```sql
-- profiles: Dados do usuário (OK)
-- payments: Pagamentos (OK)
-- lottery_analyses: Cache de análises IA (PRECISA MODIFICAR?)
```

### 6.2 Novas Tabelas Propostas

#### **Proposta 1: `generation_history`** (Feature 1)

```sql
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER NOT NULL,
  strategy_type TEXT NOT NULL,  -- 'balanced', 'hot', 'cold', 'mixed'

  -- Dados da geração
  generated_numbers JSONB NOT NULL,  -- Array de 10 combinações
  hot_numbers INTEGER[] NOT NULL,
  cold_numbers INTEGER[] NOT NULL,
  accuracy_rate NUMERIC(5,2) NOT NULL,
  draws_analyzed INTEGER NOT NULL,

  generated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Index para listagem cronológica
  INDEX idx_history_user_lottery (user_id, lottery_type, contest_number, generated_at DESC)
);

-- RLS
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own history"
  ON generation_history FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history"
  ON generation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**QUESTÃO:**
- Esta tabela substitui `lottery_analyses` ou coexiste com ela?
- `lottery_analyses` vira "análise atual" e `generation_history` vira "histórico"?

#### **Proposta 2: `saved_games`** (Feature 2)

```sql
CREATE TABLE saved_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER,  -- NULL se não vinculado a concurso específico

  -- Jogo
  numbers INTEGER[] NOT NULL,

  -- Metadata
  name TEXT,  -- Nome customizado pelo usuário
  notes TEXT,  -- Notas do usuário
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],  -- Tags customizáveis

  -- Source
  source TEXT NOT NULL,  -- 'ai_generated', 'user_created', 'imported'
  generation_id UUID REFERENCES generation_history(id) ON DELETE SET NULL,  -- Se veio de geração IA

  -- Analytics
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,
  play_count INTEGER DEFAULT 0,  -- Quantas vezes usuário marcou como "jogado"

  -- Indexes
  INDEX idx_saved_games_user (user_id, created_at DESC),
  INDEX idx_saved_games_user_lottery (user_id, lottery_type),
  INDEX idx_saved_games_favorites (user_id, is_favorite) WHERE is_favorite = true
);

-- RLS
ALTER TABLE saved_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own saved games"
  ON saved_games FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**QUESTÕES:**
- `contest_number` deve ser obrigatório ou opcional? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.
- `tags` deve ser array livre ou enum pré-definido? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.
- Precisa de soft-delete (deleted_at) ou hard-delete? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.

#### **Proposta 3: `custom_analyses`** (Feature 3)

```sql
CREATE TABLE custom_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lottery_type TEXT NOT NULL,
  contest_number INTEGER,  -- Opcional: concurso de referência

  -- Jogo do usuário
  user_numbers INTEGER[] NOT NULL,

  -- Análise da IA
  analysis_result JSONB NOT NULL,  -- {hot_count, cold_count, score, suggestions, etc}

  -- Metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  saved_game_id UUID REFERENCES saved_games(id) ON DELETE SET NULL,  -- Se usuário salvou após análise

  INDEX idx_custom_analyses_user (user_id, analyzed_at DESC)
);

-- RLS
ALTER TABLE custom_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses"
  ON custom_analyses FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create analyses"
  ON custom_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**QUESTÃO:**
- Esta tabela é realmente necessária ou `saved_games` com campo `analysis_result` basta? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.

#### **Proposta 4: `user_preferences`** (Futuro)

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Números favoritos/excluídos por loteria
  favorite_numbers JSONB,  -- {"mega-sena": [7, 13, 21], "quina": [5, 15]}
  excluded_numbers JSONB,  -- {"mega-sena": [4, 8], "quina": []}

  -- Preferências de geração
  default_strategy TEXT DEFAULT 'balanced',  -- 'hot', 'cold', 'mixed', 'balanced'

  -- Notificações
  notifications_enabled BOOLEAN DEFAULT TRUE,
  notify_new_contest BOOLEAN DEFAULT FALSE,
  notify_results BOOLEAN DEFAULT FALSE,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**QUESTÃO:**
- Implementar agora ou deixar para fase 2? Vamos implementar tudo agora. Mas faseado, claro

### 6.3 Modificações em Tabelas Existentes

#### **Opção A: Modificar `lottery_analyses`**

**Adicionar coluna `strategy_type`:**
```sql
ALTER TABLE lottery_analyses
ADD COLUMN strategy_type TEXT DEFAULT 'balanced';

-- Modificar constraint para permitir múltiplas estratégias
ALTER TABLE lottery_analyses
DROP CONSTRAINT lottery_analyses_user_id_lottery_type_contest_number_key;

ALTER TABLE lottery_analyses
ADD CONSTRAINT lottery_analyses_unique
UNIQUE (user_id, lottery_type, contest_number, strategy_type);
```

**IMPACTO:**
- Permite múltiplas análises por concurso (uma por estratégia)
- Não quebra dados existentes (default 'balanced')

👉 **Devemos modificar `lottery_analyses` ou criar nova tabela?**

#### **Opção B: Manter `lottery_analyses` Inalterado**

- `lottery_analyses` continua como "cache da última geração"
- `generation_history` armazena todas gerações
- Duplicação de dados, mas separação clara

👉 **Qual abordagem você prefere?**

### 6.4 Diagrama de Relacionamentos

```
profiles (usuário)
  ├──< payments (1:1, pagamentos)
  ├──< lottery_analyses (1:N, cache atual)
  ├──< generation_history (1:N, histórico de gerações)
  ├──< saved_games (1:N, jogos salvos)
  ├──< custom_analyses (1:N, jogos manuais analisados)
  └──< user_preferences (1:1, preferências)

generation_history
  └──< saved_games (1:N, jogo pode vir de geração específica)

custom_analyses
  └──< saved_games (1:1, análise pode virar jogo salvo)
```

### 6.5 Estimativa de Crescimento de Dados

**Cenário: 1000 usuários ativos**

| Tabela | Registros/User/Mês | Total/Mês | Tamanho Estimado |
|--------|-------------------|-----------|------------------|
| `lottery_analyses` | 50 (cache) | 50k | ~5 MB (100 bytes/row) |
| `generation_history` | 200 (regenerações) | 200k | ~20 MB |
| `saved_games` | 30 (jogos salvos) | 30k | ~3 MB |
| `custom_analyses` | 10 (análises manuais) | 10k | ~2 MB |

**Total:** ~30 MB/mês para 1000 usuários → **360 MB/ano**

**QUESTÃO:**
- Precisamos de política de limpeza (ex: deletar `generation_history` > 3 meses)? Sim, vamos fazer isso.

---

## 7. FLUXOS DE UX/UI

### 7.1 Fluxo de Regeneração (Feature 1)

#### **Wireframe Textual**

```
┌─────────────────────────────────────────────────┐
│ [< Voltar]  Mega-Sena - Concurso 2750           │
│                                                 │
│ [🔄 Gerar Novamente] [💾 Salvar] [📤 Exportar]  │ ← NOVO
├─────────────────────────────────────────────────┤
│ 📊 Estatísticas                                 │
│ Acurácia: 89% | Sorteios: 100 | Estratégia: ⚖️  │
│ Quentes: 05 12 18 23 34 45 51 58               │
│ Frios: 02 07 13 28 39 52 55 60                 │
├─────────────────────────────────────────────────┤
│ 🎲 Jogos Gerados (10)                           │
│                                                 │
│ Jogo 1  [05][12][23][34][45][58]  [☆Salvar]    │
│ Jogo 2  [03][18][27][39][41][52]  [☆Salvar]    │
│ ...                                             │
│ Jogo 10 [08][15][29][38][44][59]  [☆Salvar]    │
└─────────────────────────────────────────────────┘

[Usuário clica "Gerar Novamente"]

┌─────────────────────────────────────────────────┐
│ ⚠️ Gerar Novas Combinações?                     │
│                                                 │
│ Isso irá substituir as combinações atuais.      │
│ Deseja continuar?                               │
│                                                 │
│ [ ] Usar estratégia diferente:                  │
│     (•) Balanceado  ( ) Quente  ( ) Frio        │
│                                                 │
│ [Cancelar] [Sim, Gerar Novas]                   │
└─────────────────────────────────────────────────┘

[Usuário confirma]

┌─────────────────────────────────────────────────┐
│ [< Voltar]  Mega-Sena - Concurso 2750           │
│                                                 │
│ ⏳ Gerando novas combinações...                 │
│                                                 │
│ [Skeleton Loading Animation]                    │
│ ▓▓▓▓▓░░░░░░░░░░ 40%                            │
└─────────────────────────────────────────────────┘

[Geração completa]

┌─────────────────────────────────────────────────┐
│ ✅ Novas combinações geradas!         [Desfazer]│ ← Toast
├─────────────────────────────────────────────────┤
│ [Fade-in Animation] Novos jogos aparecem        │
│                                                 │
│ 📊 Estatísticas (NOVAS)                         │
│ Acurácia: 92% | Sorteios: 100 | Estratégia: ⚖️  │
└─────────────────────────────────────────────────┘
```

**QUESTÕES DESTE FLUXO:**

1. Modal de confirmação é necessário ou regenerar direto? Modeal de confirmação é necessário
2. Permitir escolher estratégia na hora ou só depois? Vamos sem as estratégias. O lead não entende porque escolher numero frio é relevante. Ele só escolheria quente a todo momento
3. Botão "Desfazer" deve existir? (Complexo de implementar) Não

### 7.2 Fluxo de Salvar Jogos (Feature 2)

#### **Wireframe Textual**

```
[Usuário clica no ícone ☆ no Jogo 3]

┌─────────────────────────────────────────────────┐
│ 💾 Salvar Jogo 3                                │
│                                                 │
│ Números: [05][12][23][34][45][58]               │
│                                                 │
│ Nome (opcional):                                │
│ [Jogo do meu aniversário___________________]    │
│                                                 │
│ Notas (opcional):                               │
│ [Números baseados em datas importantes_____]    │
│ [________________________________________]      │
│                                                 │
│ [☐] Marcar como favorito                        │
│                                                 │
│ [Cancelar] [Salvar]                             │
└─────────────────────────────────────────────────┘

[Usuário salva]

┌─────────────────────────────────────────────────┐
│ ✅ Jogo salvo com sucesso!                      │
│                                                 │
│ [Ver Jogos Salvos] [Continuar Aqui]             │
└─────────────────────────────────────────────────┘

[Usuário navega para "Jogos Salvos"]

┌─────────────────────────────────────────────────┐
│ 💾 Meus Jogos Salvos (15)                       │
│                                                 │
│ [Filtros: Todos▼ | Apenas Favoritos | Por Loteria▼]│
│ [Buscar_______________________] 🔍              │
├─────────────────────────────────────────────────┤
│ ⭐ Jogo do meu aniversário                      │
│    Mega-Sena | Concurso 2750                    │
│    [05][12][23][34][45][58]                     │
│    Salvo em: 03/01/2025                         │
│    [✏️Editar] [🗑️Deletar] [📤Exportar]           │
├─────────────────────────────────────────────────┤
│ Jogo Quente #1                                  │
│    Quina | Sem Concurso                         │
│    [12][23][34][56][78]                         │
│    Salvo em: 02/01/2025                         │
│    [✏️Editar] [🗑️Deletar] [📤Exportar]           │
├─────────────────────────────────────────────────┤
│ ...                                             │
└─────────────────────────────────────────────────┘
```

**QUESTÕES DESTE FLUXO:**

1. Modal é melhor que inline editing? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.
2. Nome/notas devem ser obrigatórios ou opcionais? Opcional
3. Página de "Jogos Salvos" deve ter busca/filtros? Sim

### 7.3 Fluxo de Criação Manual (Feature 3)

#### **Wireframe Textual - Opção A: Página Nova**

```
[Dashboard]

┌─────────────────────────────────────────────────┐
│ 🏠 Dashboard                                    │
│                                                 │
│ 🎲 Minhas Loterias:                             │
│ [Mega-Sena]  [Quina]  [Lotofácil]              │
│                                                 │
│ ➕ Criar Jogo Manual:                           │
│ [✏️ Criar Novo Jogo] ← NOVO BOTÃO               │
│                                                 │
│ 💾 Atalhos:                                     │
│ • Jogos Salvos (15)                             │
│ • Histórico de Gerações                         │
└─────────────────────────────────────────────────┘

[Usuário clica "Criar Novo Jogo"]

┌─────────────────────────────────────────────────┐
│ ✏️ Criar Jogo Manual                            │
│                                                 │
│ Passo 1: Escolha a loteria                      │
│ (•) Mega-Sena (6 números de 1-60)               │
│ ( ) Quina (5 números de 1-80)                   │
│ ( ) Lotofácil (15 números de 1-25)              │
│ ( ) Lotomania (50 números de 1-100)             │
│                                                 │
│ [Próximo →]                                     │
└─────────────────────────────────────────────────┘

[Usuário escolhe Mega-Sena e clica Próximo]

┌─────────────────────────────────────────────────┐
│ ✏️ Criar Jogo Manual - Mega-Sena                │
│                                                 │
│ Passo 2: Escolha 6 números (3/6 selecionados)   │
│                                                 │
│ [01] [02] [03] [04] [05] [06] [07] [08] [09]   │
│ [10] [11] [12] [13] [14] [15] [16] [17] [18]   │
│ [19] [20] [21] [22] [23] [24] [25] [26] [27]   │
│ ...                                             │
│ [55] [56] [57] [58] [59] [60]                   │
│                                  ↑ Selecionado  │
│ Selecionados: [05] [12] [23]                    │
│                                                 │
│ [Limpar] [Aleatório] [Usar Meus Favoritos]      │
│ [← Voltar] [Analisar com IA →]                  │
└─────────────────────────────────────────────────┘

[Usuário seleciona 6 números e clica "Analisar com IA"]

┌─────────────────────────────────────────────────┐
│ 🤖 Análise da IA                                │
│                                                 │
│ Seu Jogo: [05][12][23][34][45][58]              │
│                                                 │
│ ⏳ Analisando padrões estatísticos...           │
│ [Loading...]                                    │
└─────────────────────────────────────────────────┘

[Análise completa]

┌─────────────────────────────────────────────────┐
│ 🤖 Análise da IA - Mega-Sena                    │
│                                                 │
│ Seu Jogo: [05][12][23][34][45][58]              │
│                                                 │
│ 🎯 Qualidade do Jogo: ⭐⭐⭐⭐☆ (4/5)            │
│                                                 │
│ ✅ Pontos Fortes:                               │
│ • Boa distribuição pares/ímpares (3/3)          │
│ • Soma alinhada com média histórica (197)       │
│ • 3 números quentes (05, 23, 45)                │
│                                                 │
│ ⚠️ Pontos de Atenção:                           │
│ • Apenas 1 número frio (58) - considere 2-3     │
│ • Falta números no range 10-20                  │
│                                                 │
│ 💡 Sugestões:                                   │
│ • Trocar 58 → 13 (melhora distribuição)         │
│ • Trocar 34 → 18 (adiciona número médio)        │
│                                                 │
│ [Editar Números] [Gerar Similar] [Salvar Jogo]  │
│ [Ver Comparação com IA] [Voltar]                │
└─────────────────────────────────────────────────┘
```

**QUESTÕES DESTE FLUXO:**

1. Stepper (multi-passo) ou single page? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.
2. Sugestões da IA devem ser aplicáveis com 1 clique? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.
3. "Gerar Similar" = IA gera 5 variações do jogo manual? Não sei. Analise com base nas minhas respostas. Se ainda tiver dúvida, pergunte.

---

## 8. IMPACTOS TÉCNICOS

### 8.1 Backend (Supabase)

| Mudança | Complexidade | Risco | Estimativa |
|---------|--------------|-------|------------|
| Criar `generation_history` | Baixa | Baixo | 1h |
| Criar `saved_games` | Baixa | Baixo | 1h |
| Criar `custom_analyses` | Baixa | Baixo | 1h |
| Modificar `lottery_analyses` constraint | Média | Médio (migration) | 2h |
| Implementar RLS policies | Baixa | Baixo | 1h |
| Indexação & performance | Baixa | Baixo | 1h |

**Total Backend:** ~7-8 horas

### 8.2 Services & Hooks

| Mudança | Complexidade | Risco | Estimativa |
|---------|--------------|-------|------------|
| Adicionar `forceRegenerate` em `useLotteryAnalysis` | Baixa | Baixo | 2h |
| Implementar estratégias (hot/cold/mixed) | Média | Médio (lógica de geração) | 4h |
| Service para salvar/listar/deletar saved_games | Baixa | Baixo | 3h |
| Service para análise de jogos manuais | Média | Médio (validação + análise) | 5h |
| Hook para generation_history | Baixa | Baixo | 2h |

**Total Services:** ~16 horas

### 8.3 UI Components

| Mudança | Complexidade | Risco | Estimativa |
|---------|--------------|-------|------------|
| Botão "Gerar Novamente" + modal | Baixa | Baixo | 2h |
| Loading states para regeneração | Baixa | Baixo | 1h |
| Ícones de "Salvar" em cada jogo | Baixa | Baixo | 2h |
| Modal de salvamento com nome/notas | Baixa | Baixo | 3h |
| Página "Jogos Salvos" com lista | Média | Baixo | 5h |
| Filtros e busca em Jogos Salvos | Média | Baixo | 4h |
| Página "Criar Jogo Manual" com grid | Média | Médio (UX) | 6h |
| Componente de Análise IA (feedback) | Média | Baixo | 4h |
| Navegação (botões, rotas) | Baixa | Baixo | 2h |

**Total UI:** ~29 horas

### 8.4 Testing & QA

| Atividade | Estimativa |
|-----------|------------|
| Testes unitários (services) | 8h |
| Testes de integração (hooks + Supabase) | 6h |
| Testes E2E (fluxos completos) | 10h |
| Testes manuais em dev branch | 6h |

**Total Testing:** ~30 horas

### 8.5 Documentação

| Documento | Estimativa |
|-----------|------------|
| Atualizar DEVELOPMENT.md | 1h |
| Documentar novos services/hooks | 2h |
| Guia de uso das novas features (para usuários) | 2h |

**Total Docs:** ~5 horas

### 8.6 ESTIMATIVA TOTAL

**Desenvolvimento:** 52 horas (~6.5 dias de trabalho full-time)
**Testing:** 30 horas (~4 dias)
**Documentação:** 5 horas (~1 dia)

**TOTAL:** ~87 horas = **~11 dias de trabalho**

**Com buffer de 20% para imprevistos:** ~**13 dias**

---

## 9. QUESTÕES CRÍTICAS PARA DECISÃO

### 9.1 ARQUITETURA GERAL

**Q1:** Devemos implementar as 3 features de uma vez ou por fases?
Por fases. Vamos documentando tudo. Mas a build precisa pensar que todas as fases vão existir e estar preparadas pra isso.

**Opção A: Tudo junto (Big Bang)**
- Pros: Features integradas desde o início
- Cons: Maior risco, mais complexo de testar

**Opção B: Fases (Iterativo)**
- Fase 1: Regeneração (1 semana)
- Fase 2: Salvar Jogos (1 semana)
- Fase 3: Criação Manual (1.5 semanas)
- Pros: Menor risco, feedback incremental
- Cons: Pode haver retrabalho de UI

👉 **Sua preferência?**

Por fases. Vamos documentando tudo. Mas a build precisa pensar que todas as fases vão existir e estar preparadas pra isso.

**Q2:** Implementar sistema de "créditos" ou limites agora, ou deixar aberto inicialmente?

- Sem limites: Mais simples, observar uso real
- Com limites: Previne abuso desde o início


👉 **Sua preferência?**

Com limites

**Q3:** Modificar `lottery_analyses` ou criar nova estrutura de cache?

**Opção A:** Modificar constraint → permite múltiplas estratégias
**Opção B:** Manter inalterado → usar `generation_history` como histórico

👉 **Sua preferência?**

Opção B

### 9.2 FEATURE 1: REGENERAÇÃO

**Q4:** Ao regenerar, devemos:
- A) Deletar geração anterior (irreversível)
- B) Mover para histórico (reversível)
- C) Manter ambas visíveis (usuário escolhe qual usar)

👉 **Sua preferência?**

C

**Q5:** Regeneração deve permitir escolher estratégia (hot/cold/mixed/balanced)?

- Sim → Implementar seletor de estratégia
- Não → Sempre usar "balanced"

👉 **Sua preferência?**

Não

**Q6:** Qual limite de regenerações?
- A) Sem limite
- B) 50/dia
- C) 1 a cada 30 segundos (cooldown)
- D) Sistema de créditos

👉 **Sua preferência?**

Já especificado anteriormente

### 9.3 FEATURE 2: SALVAR JOGOS

**Q7:** Jogos salvos devem ter nome/notas obrigatórios ou opcionais?

- Obrigatório → Força usuário a organizar
- Opcional → Mais rápido de salvar

👉 **Sua preferência?**

Já especificado anteriormente


**Q8:** Limite de jogos salvos?
- A) 100 jogos/usuário
- B) Ilimitado
- C) Diferente para free vs premium

👉 **Sua preferência?**

Já especificado anteriormente


**Q9:** Onde ficam os jogos salvos na navegação?
- A) Nova página `/saved-games`
- B) Seção no Dashboard
- C) Sidebar global
- D) Aba dentro de Lottery.tsx

👉 **Sua preferência?**

Já especificado anteriormente


**Q10:** Usuário pode salvar apenas jogos gerados pela IA, ou também jogos manuais?

- Apenas IA → Mais simples
- Ambos → Mais flexível

👉 **Sua preferência?**

Ambos

### 9.4 FEATURE 3: CRIAÇÃO MANUAL

**Q11:** Criação manual deve ser vinculada a concurso específico?

- Sim → Análise mais precisa (histórico até concurso X)
- Não → Análise genérica (últimos 100 sorteios)

👉 **Sua preferência?**

Sim

**Q12:** Interface de criação de números:
- A) Grid de botões (visual)
- B) Input de texto (rápido)
- C) Híbrido (ambos)

👉 **Sua preferência?**

Grid

**Q13:** Análise da IA deve mostrar:
- A) Score simples (1-5 estrelas)
- B) Detalhes completos (hot/cold/sugestões)
- C) Comparação com jogo gerado pela IA

👉 **Sua preferência?**

Já especificado anteriormente


**Q14:** Onde fica a opção "Criar Jogo Manual" na navegação?
- A) Página intermediária (Dashboard → Escolha → Contests/Manual)
- B) Botão no Dashboard
- C) Aba dentro de Contests
- D) FAB (floating button)

👉 **Sua preferência?**

Já especificado anteriormente


**Q15:** Análise de jogo manual deve ser salva automaticamente ou apenas sob demanda?

- Salvar sempre → Histórico completo
- Salvar sob demanda → Usuário controla

👉 **Sua preferência?**

Salvar sob demanda

### 9.5 INTEGRAÇÃO ENTRE FEATURES

**Q16:** Quando usuário regenera combinações, jogos salvos da geração anterior:
- A) Permanecem intocados
- B) São marcados como "Geração Antiga"
- C) São deletados automaticamente

👉 **Sua preferência?**

Já especificado anteriormente


**Q17:** Jogos manuais analisados vão para a mesma lista de "Jogos Salvos" ou lista separada?

- Mesma lista → Tudo centralizado
- Lista separada → "Jogos IA" vs "Jogos Manuais"

👉 **Sua preferência?**

Mesma lista

**Q18:** Devemos implementar comparação direta entre jogo manual e jogo IA?

Exemplo: "Seu jogo: Score 78% | Jogo IA: Score 89%"

- Sim → Ajuda usuário a decidir
- Não → Pode desmotivar criação manual

👉 **Sua preferência?**

Não

### 9.6 PRIORIZAÇÃO

**Q19:** Se tivéssemos que escolher apenas 1 feature para implementar primeiro, qual seria?

- A) Regeneração (mais simples, impacto imediato)
- B) Salvar Jogos (mais solicitado)
- C) Criação Manual (maior diferencial)

👉 **Sua prioridade?**

Seguir a ordem sugerida

**Q20:** Qual MVP (Minimum Viable Product) você aprovaria para ir ao ar?

**MVP Minimalista:**
- Botão "Gerar Novamente" (deleta e cria novo)
- Botão "Salvar Jogo" (salva em lista simples)
- Sem criação manual

**MVP Intermediário:**
- MVP Minimalista +
- Histórico de gerações (2 últimas)
- Jogos salvos com nome/notas

**MVP Completo:**
- Todas 3 features
- Estratégias múltiplas
- Análise avançada

👉 **Qual MVP você quer lançar?**

Completo

## 10. PRÓXIMOS PASSOS

### 10.1 Imediato (Agora)

1. **BRUNO RESPONDE TODAS AS QUESTÕES ACIMA** ✋
   - Especialmente Q1-Q6 (decisões críticas de arquitetura)

2. **Esclarecer o problema inicial observado**
   - Confirmar se é problema de cache ou expectativa de comportamento

3. **Definir MVP**
   - Qual scope vai para a primeira branch?

### 10.2 Fase de Design (1-2 dias)

1. **Criar wireframes detalhados** (Figma ou similar)
   - Telas completas com todas interações
   - Fluxos de usuário documentados

2. **Revisar e aprovar design**
   - Iterar com feedback

3. **Finalizar schema do banco de dados**
   - Definir todas tabelas/colunas/constraints
   - Escrever migrations

### 10.3 Fase de Desenvolvimento (10-13 dias)

1. **Criar branch de desenvolvimento**
   ```bash
   git checkout -b feature/game-regeneration-and-save
   ```

2. **Backend First**
   - Migrations
   - RLS policies
   - Testes de schema

3. **Services & Hooks**
   - Lógica de negócio
   - Testes unitários

4. **UI Components**
   - Implementar telas
   - Testes E2E

5. **Testing completo em dev**

### 10.4 Fase de Deploy (1-2 dias)

1. **Merge para main**
2. **Deploy para produção**
3. **Monitoramento de erros**
4. **Coleta de feedback

 de usuários

---

## 11. ANEXOS

### 11.1 Referências Técnicas

- **Exploração Completa:** Veja relatório detalhado da investigação do codebase
- **Arquivos Críticos:**
  - `App/app/src/services/lotteryAnalysis.ts:132-148` (Math.random())
  - `App/app/src/hooks/useLotteryAnalysis.ts:36-48` (Cache logic)
  - `App/app/supabase/migrations/20251028210115_*.sql` (Schema atual)

### 11.2 Benchmarks de Mercado

**Apps de Loteria Concorrentes:**
- **Lottolyzer:** Permite salvar jogos, sem regeneração
- **LotoFácil Pro:** Regeneração ilimitada, sem análise manual
- **SmartLotto:** Criação manual + análise, mas UI confusa

**Oportunidade:** Combinar melhor de todos em UX superior.

---

## 🎯 AÇÃO IMEDIATA REQUERIDA

**BRUNO, por favor:**

1. **Leia o documento completo** (especialmente Seção 9 - Questões Críticas)
2. **Responda TODAS as questões Q1-Q20**
3. **Esclareça a descoberta da Seção 1** (problema real vs esperado)
4. **Defina o MVP** que você quer lançar primeiro

Após suas respostas, criaremos:
- Documento de especificação técnica final
- Wireframes detalhados
- Schema de banco de dados definitivo
- Cronograma de implementação

---

**Última atualização:** 2025-01-03
**Documento mantido por:** Claude Code
**Status:** Aguardando decisões do stakeholder (Bruno)