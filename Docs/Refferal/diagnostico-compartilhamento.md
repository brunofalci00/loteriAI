# Diagnóstico – Fluxos de Compartilhamento / Referral

## 1. Pontos de contato mapeados
- O componente genérico `ShareButton` centraliza a experiência de incentivo + recompensa e hoje apenas gera textos fixos definidos em `getMessageForContext` (`app/src/components/ShareButton.tsx:101` e `app/src/utils/shareMessages.ts:13-154`). Nenhum desses textos inclui os números sorteados, apenas copy promocional + link.
- O tracking e os limites diários registram apenas metadados (`score`, `accuracyRate`, `milestone`) no `ShareEvent` (`app/src/services/shareTrackingService.ts:17-170`). Não há campo para os números ou para um texto customizado.

| Superfície | Arquivo (linha) | `context` | Conteúdo compartilhado hoje | Números disponíveis no componente? |
| --- | --- | --- | --- | --- |
| Resultado manual com score alto | `app/src/components/Step4_AnalysisResult.tsx:172-189` | `score` | Mensagem fixa com nota / link | ✅ (`selectedNumbers` está no escopo do componente) |
| Modal de Análise Detalhada | `app/src/components/DetailedAnalysisModal.tsx:431-451` | `detailed` | Mensagem fixa sobre análise | ✅ (`selectedNumbers` + análises completas) |
| Grid de variações da IA | `app/src/components/VariationsGrid.tsx:152-172` | `variations` | Mensagem dizendo que 5 variações foram geradas | ⚠️ O CTA fica fora do loop das variações; nenhuma combinação específica é passada hoje |
| Banner de taxa de acerto | `app/src/components/HighScoreBanner.tsx:99-115` | `high-rate` | Mensagem falando da % de acerto | ⚠️ Só recebe `accuracyRate`; não existe referência às combinações exibidas na tela |
| Modal Primeira Geração | `app/src/components/FirstGenerationModal.tsx:196-236` | `first-gen` | Mensagem comemorando a primeira geração | ⚠️ O modal recebe apenas `stats` (qtd de jogos/accuracy), não as combinações |
| Modal de Milestone | `app/src/components/MilestoneCelebrationModal.tsx:222-265` | `milestone` | Mensagem sobre jogos salvos | ❌ Não faz sentido incluir números aqui (só celebra volume) |
| Cartão de jogo salvo | `app/src/components/SavedGameCard.tsx:124-188` | — usa `shareViaWhatsApp` | Texto completo com números, análises e link (`app/src/services/exportService.ts:30-115`) | ✅ Já envia os números formatados via WhatsApp |

## 2. Onde os números já são enviados
- Ao compartilhar jogos salvos (botão do aviãozinho em `SavedGameCard`), usamos `exportService.formatGameForSharing` para montar um texto rico com números ordenados, contagem de quentes/frios, estratégia e link (`app/src/services/exportService.ts:30-80`). Este fluxo já prova que é possível compartilhar combinações pelo WhatsApp.
- Exportar `.txt` reaproveita o mesmo formatter, então não há impedimento técnico para reaproveitar essa função ou parte dela nos CTAs virais.

## 3. Oportunidades para incluir números nos CTAs virais

| Superfície | Como injetar os números | Ajustes necessários | Complexidade estimada |
| --- | --- | --- | --- |
| Resultado manual (score) | Passar `selectedNumbers` (ou uma string formatada) para o `ShareButton` quando `score >= 4.0`. | 1) Estender `ShareButtonProps`/`ShareEvent.data` para aceitar `numbers`, `lotteryType`, etc.; 2) Atualizar `shareMessages` para montar mensagem híbrida (copy + números formatados); 3) Garantir que o texto continue curto o bastante para WhatsApp. | **Baixa / 1 dev-dia** – dados já estão disponíveis no componente. |
| Modal de Análise Detalhada | Mesmo approach do item acima, mas enriquecendo com trechos da análise (quentes/frios). | Além dos passos do item anterior, decidir quais métricas complementares entram para evitar um texto muito longo. | **Baixa-média** – mesmos dados já renderizados na modal. |
| Variações da IA | Decidir qual variação será usada (ex.: melhor `score`, ou permitir o usuário escolher uma antes de apertar “Compartilhar variações”). | 1) Passar a combinação escolhida e o label da estratégia até o CTA; 2) Talvez refatorar o CTA para ficar dentro do card da variação ou abrir um mini modal de seleção; 3) Atualizar tracking (`data` hoje não guarda nada sobre variações). | **Média** – depende de decisão de produto + pequeno redesign. |
| Banner de taxa de acerto | Precisaria saber quais jogos ou quais “top 3” números suportam a taxa exibida. | 1) Expor via props um resumo (ex.: primeira combinação da lista exibida em `ResultsDisplay`); 2) Decidir copy (talvez “Esse foi o jogo que me deu X%”); 3) Sincronizar com possíveis múltiplos jogos mostrados na tela. | **Média** – demanda alinhar responsabilidade entre `ResultsDisplay` e `HighScoreBanner`. |
| Modal Primeira Geração | O `Lottery` page já tem `displayedCombinations`; bastaria incluir o array mais recente nas `stats` ou passar uma nova prop. | 1) Incluir `numbers?: number[][]` em `FirstGenerationModalProps`; 2) Atualizar o CTA para escolher/formatar pelo menos um jogo; 3) Garantir que salvar/compartilhar antes de fechar não quebre onboarding. | **Média** – alteração no contrato do modal + cuidado com o momento em que os dados chegam. |
| Modal de Milestone | Não recomendado incluir números (contexto é volume e não há jogo específico recente). | Mantém copy atual. | — |

## 4. Impactos técnicos transversais
1. **Novo payload do ShareButton / tracking** – Estender `ShareButtonProps.data` e `ShareEvent` para aceitar algo como `{ numbers?: number[]; lotteryType?: string; contestNumber?: number }`. Isso exige migrar os valores já gravados no `localStorage` (ou aceitar `JSON.parse` com campos opcionais) e atualizar os eventos GA/Mixpanel (`app/src/services/shareTrackingService.ts:123-204`). Complexidade baixa, mas precisa de teste de regressão porque mexe no limite diário.
2. **Mensagens dinâmicas** – `shareMessages.ts` precisará aceitar dados variáveis e talvez reutilizar `formatGameForSharing` para evitar textos duplicados. Cuidado para não enviar mensagens com mais de ~1024 caracteres (WhatsApp corta prévias).
3. **Recompensa backend** – A função edge `share-reward` só recebe `credits` (não valida o texto), então não há mudança server-side.
4. **UX / compliance** – Avaliar se expor números em mensagens vira risco de spam (ex.: grupos públicos). Talvez incluir um prefixo “Esses foram meus números – gera os seus em …” para não parecer envio automático.

## 5. Próximos passos sugeridos
1. **Definir template padrão de mensagem com números curtos** (ex.: 6-15 números formatados em uma linha + resumo). Ideal reutilizar formatter existente em `exportService`.
2. **Estender `ShareButton`** para aceitar `messageOverride` ou `payload` com números + loteria. Isso permite ativar gradualmente por superfície.
3. **Piloto no contexto `score`** (maior valor percebido + dados já na mão). Depois replicar para `detailed`.
4. **Rever CTA de variações**: decidir UX (compartilhar “Melhor variação” ou permitir seleção).
5. **Documentar no time de produto** quais contextos continuarão com link simples (milestones / high-rate sem números) para alinhar expectativa de usuários.

---

# Plano de implementação

## Objetivos
1. Compartilhar combinações/números reais em todos os CTAs virais com mensagens curtas e rastreáveis.
2. Reduzir o tamanho dos modais/popups prioritários para garantir fechamento confortável em mobile.
3. Introduzir comunicação clara sobre **números frios** (definição, porquê usar) nos fluxos chave.

## Macro roadmap

| Fase | Entregas principais | Dependências |
| --- | --- | --- |
| 1. Fundamentos | Novo payload do `ShareButton`, template único de mensagem, ajustes de tracking | Nenhuma (refator local) |
| 2. Contextos “score” + “detailed” | Mensagens com números reais, popups responsivos | Fase 1 |
| 3. Variações / High-score / First-gen | Seleção de combinação, copy fria/quente, novos toasts | Fase 1 |
| 4. Checklist UX (milestones, onboarding, Saved games) | Revisão final, QA cross-device | Fases anteriores |

## Fase 1 – Fundamentos técnicos
1. **Extensão do payload de compartilhamento**
   - Atualizar `ShareButtonProps` e `ShareEvent.data` para aceitar `{ lotteryType, contestNumber, numbers, label }`.
   - Garantir compatibilidade com histórico no `localStorage` (parse com fallback).
   - Replicar campos extras nos eventos GA4/Mixpanel (`shareTrackingService.trackShareEvent`).
2. **Template único de mensagem**
   - Criar util `formatSharePayload` reutilizando `exportService.formatGameForSharing`, porém com modo “compacto” (uma linha de números + highlights curtos).
   - Atualizar `shareMessages.ts` para receber `payload` opcional e concatenar copy promocional + números formatados.
3. **Fallbacks e limites**
   - Validar tamanho: cortar mensagens > 900 caracteres.
   - Adicionar `messageOverride` para cenários especiais (ex.: variações com lista múltipla).
4. **Testes**
   - Unitar `shareMessages` + `shareTrackingService`.
   - Smoke manual no navegador (desktop + mobile emulação) para garantir que WhatsApp abre com novo texto.

## Fase 2 – Score alto + Análise detalhada
1. **`Step4_AnalysisResult`**
   - Passar `selectedNumbers`, `lotteryType`, `contestNumber` e resumo hot/cold para `ShareButton`.
   - Copy: “Esse foi o jogo que tirou X/5 ⭐ – números: … – confira seus próprios em …”.
2. **`DetailedAnalysisModal`**
   - Permitir escolha entre compartilhar jogo atual ou lista de recomendações (provavelmente o mesmo jogo).
   - Incluir menção explícita aos números frios no texto (ex.: “Incluí 3 números frios para buscar surpresas”).
3. **Modais responsivos (score/detailed)**
   - Revisar `DialogContent` para usar `max-h-[85vh]`, `overflow-y-auto` e `padding` reduzido em `<md`.
   - Garantir `Close` visível (ícone ou botão ghost) fixo no topo direito.
   - Testar em breakpoints 320-414px.

## Fase 3 – Variações, High-Score, First Gen
1. **`VariationsGrid`**
   - Decidir regra: compartilhar a variação com maior `score` ou permitir seleção rápida (ex.: dropdown/mini modal).
   - Passar `variation.numbers` + `strategyLabel` para `ShareButton`.
   - Copy destaca mistura de números quentes/frios (“Essa variação traz X quentes + Y frios”).
2. **`HighScoreBanner`**
   - Receber da página uma combinação representativa (ex.: primeiro jogo exibido).
   - Mensagem explicando que a taxa veio dessa combinação.
   - Inserir trecho explicando o papel dos números frios na taxa de acerto (novo parágrafo no card).
3. **`FirstGenerationModal`**
   - Adicionar prop `featuredCombination` (primeiro jogo gerado).
   - Atualizar CTA com números reais + recorte sobre frios (ex.: “O app equilibrou X quentes e Y frios”).
   - **Redesenho mobile**: reduzir ícones (de 64px→48px), diminuir padding e mover texto para colunas empilhadas. Garantir botão “Fechar” sempre visível.
4. **Comunicação sobre números frios**
   - Incluir seção curta no modal e no banner com bullet “❄️ Números frios ajudam a capturar padrões que estão voltando”.
   - Atualizar `shareMessages` para citar quando `coldCount > 0`.

## Fase 4 – Milestones, Saved Games e QA
1. **Milestone Modal**
   - Revisar layout para mobile (mesmos ajustes de altura e botões).
   - Adicionar microtexto sobre frios no bloco educacional (mesmo se não compartilhar números ali).
2. **SavedGameCard / exportService**
   - Garantir consistência do formatter “compacto vs completo”.
   - Se necessário, adicionar “modo resumido” para o botão principal e manter detalhado no export `.txt`.
3. **QA final**
   - Matrix dispositivos (iOS Safari, Android Chrome, Desktop Chrome/Firefox) focando nos modais.
   - Verificar limites de compartilhamento, tracking GA/Mixpanel e saldo de créditos após share.
   - Edge cases: usuário sem sessão (não chamar edge function), popups bloqueados.

## Considerações adicionais
- **Product Copy**: envolver marketing para revisar novas mensagens (menção a números frios precisa ser clara e não soar como promessa de resultado).
- **Analytics**: adicionar dimensões “has_numbers=true/false” para medir impacto das novas mensagens.
- **A/B futuro**: após estabilizar, podemos testar variantes com mais/menos detalhes dos números frios.

## QA manual (Fase 4)
1. **Mobile 360–414px (Chrome devtools/iOS Safari)**: abrir os modais de Primeira Geração e Milestones e validar que o botão de fechar está sempre visível, o conteúdo rola sem cortar CTA e o texto sobre números frios aparece completo.
2. **Desktop (Chrome/Firefox)**: acionar `VariationsGrid`, `HighScoreBanner` e `DetailedAnalysisModal`, clicando em “Compartilhar” para garantir que o texto enviado ao WhatsApp inclui a combinação real + bloco compacto com quentes/frios.
3. **Fluxo de jogos salvos**: compartilhar um `SavedGameCard` e verificar se o mesmo formatter compacto é exibido no topo seguido das informações detalhadas; exportar `.txt` e garantir consistência do conteúdo.
4. **Limites de share**: após 5 compartilhamentos simulados (contexts diferentes) confirmar que o `ShareButton` bloqueia novas tentativas e que o histórico no `localStorage` mantém os novos campos (`numbers`, `lotteryType`, `messageLength`).
5. **Analytics smoke**: com GA/Mixpanel habilitados em staging, apertar compartilhar e validar que os eventos carregam `messageLength`, `lottery_type`, contagem de frios/quentes e `strategyLabel` quando disponível.
