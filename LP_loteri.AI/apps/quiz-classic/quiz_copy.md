# Copy do quiz por etapas do funil

## 1. Entrada inicial — despertar atenção

### src/components/slides/EntrySlide.tsx
- L12: Perguntas rápidas
- L13: Responda 5 perguntas simples e ganhe 10 moedas em cada uma.
- L16: Moedas viram mapa
- L17: As 50 moedas liberam o Mapa dos Números Quentes automático.
- L20: Teste sua aposta
- L21: Compare seus 15 números com a IA sem termos difíceis.
- L24: Giro bônus
- L25: As moedas pagam o primeiro giro da máquina e destravam descontos.
- L32: Texto direto
- L33: Frases curtas e letras grandes para quem tem 45+ enxergar tudo sem aperto.
- L37: Moedas com função
- L38: Elas não ficam sobrando: pagam o mapa e o primeiro bônus automaticamente.
- L95: QuizEntryStart
- L113: LOTER.IA
- L116: Passo a passo guiado
- L117: Chega de travar nos 11 pontos
- L119: Responda poucas perguntas, junte moedas e veja a IA montar um plano simples. Tudo explicado em tela grande para quem tem 45+ e quer entender cada movimento.
- L128: Como funciona
- L130: Cada resposta vale 10 moedas. Fechou 50, o sistema usa tudo automaticamente para abrir o primeiro bônus. Ninguém precisa fazer conta ou procurar “faltam X moedas”.
- L152: Preparando o painel
- L154: Deixamos tudo alinhado antes de liberar o botão de começar.
- L158: Linha do tempo
- L188: Começar agora
- L193: Ajustando painel...
- L197: Sem cadastro nesta etapa. Só responder e seguir.


## 2. Quiz e contagem de moedas

### src/components/slides/QuizSlide.tsx
- L15: Quando você joga na Lotofácil, o que mais te incomoda?
- L17: Jogar sem saber se estou no caminho certo
- L18: Apostar várias vezes e nunca passar dos mesmos 11 pontos
- L19: Ver os outros falando que usam sistema e eu aqui tentando na raça
- L23: Quantas vezes você achou que "faltou pouco"?
- L25: Sempre. 1 ou 2 números me perseguem
- L26: Em quase todo jogo fico por um triz
- L27: Nunca passei dos 11. Já tô desacreditado
- L31: Como escolhe seus jogos hoje?
- L33: Sigo minha intuição. Sinto quando vai dar certo
- L34: Vou por datas, palpites, sensação
- L35: Eu nem penso muito. Só jogo e espero
- L39: E se pudesse testar seu palpite contra uma IA treinada?
- L41: Toparia agora. Quero ver no que dá
- L42: Seria bom ver se tá tão errado assim
- L43: Talvez... mas acho que ela ganharia fácil
- L47: O que você mais quer resolver hoje?
- L49: Parar de jogar no escuro
- L50: Descobrir se meu jeito funciona ou não
- L51: Usar algo que dê vantagem real
- L62: Seu jeito conta
- L63: Responda do modo que fala com amigos. Quanto mais natural, melhor fica o plano final.
- L67: Golpe direto
- L68: Cada resposta vale 10 moedas. Não tem pegadinha ou cálculo escondido.
- L72: Pensado pro celular
- L73: Botões grandes, texto simples e nada de enrolação. É só tocar e seguir.
- L96: QuizStart
- L122: QuizAnswer
- L134: QuizBonusUnlocked
- L150: 🎯 Pergunta
- L153: Responda com calma
- L157: Moedas liberadas
- L159: ${coinsCollected}/${TOTAL_COINS}
- L159: 🏅 Mapa liberado
- L166: Total acumulado
- L173: Usamos essas moedas automaticamente para abrir o Mapa dos Números Quentes.
- L177: ${progressPercentage}%
- L184: Representação das perguntas rápidas
- L202: Responda como você fala no dia a dia.
- L224: Destravando o Bônus 1
- L225: Segure um pouco: estamos preparando os dados para liberar o mapa secreto.
- L229: Transferindo fichas e liberando o Mapa Secreto...

### src/components/CoinCounter.tsx
- L25: Moedas


## 3. Processamento do Bônus 1

### src/components/slides/BonusUnlockLoadingSlide.tsx
- L11: Conferindo suas respostas
- L12: Usando as moedas para abrir o mapa
- L13: Liberando a visualização segura
- L17: Painel estável
- L18: Dados protegidos
- L19: Liberado em segundos
- L37: IA preparando o Bônus 1
- L41: Estamos trocando suas moedas pelo mapa
- L42: Essa tela existe só para garantir que todo mundo veja o mesmo relatório sem travar o celular.
- L60: Cofre digital segurando suas moedas
- L73: É um respiro rápido para salvar seus dados no servidor.


## 4. Mapa dos Números Quentes

### src/components/slides/BonusMapSlide.tsx
- L44: 🎉 Bônus 1 liberado
- L46: Mapa dos números quentes na sua tela
- L47: Ele já vem pronto, sem termos difíceis e com letras grandes para você consultar antes de apostar.
- L51: Veja suas moedas pagando o bônus:
- L54: Moedas
- L68: Bônus liberado
- L71: As moedas não somem: elas viram acesso ao mapa sempre que você completar o quiz.
- L78: Mapa dos números quentes
- L86: Este mapa usa 500 sorteios auditados com IA. Não existe chute aqui: são probabilidades reais pensadas para quem trava nos 11.
- L89: Acesso exclusivo enquanto o painel estiver aberto. Se fechar ou atualizar a página, a IA bloqueia o mapa.
- L91: Depois desta etapa você vai direto para o duelo simples contra a IA.
- L99: Ir para o desafio: Você vs IA
- L107: Agora é você contra a IA
- L109: Ela abre um duelo valendo até R$500 em bônus. Seu papel é mostrar sua intuição antes de ver como a máquina joga.
- L113: Responda como jogador, compare com a inteligência artificial e libere o giro que pode pagar seu acesso à LOTER.IA.
- L117: Partiu enfrentar a IA


## 5. Desafio de intuição

### src/components/slides/IntuitionGameSlide.tsx
- L21: Nada de duplo clique. Cada número acende na hora.
- L21: Toque uma vez
- L22: Pode tocar de novo para apagar e trocar antes de enviar.
- L22: Revise com calma
- L23: Assim que os 15 números estiverem marcados, a IA entra em cena.
- L23: Envie quando estiver seguro
- L67: IntuitionSubmit
- L80: 🎲 Desafio liberado
- L82: Monte seu jogo com calma
- L84: Escolha 15 números do jeito que você costuma apostar. Depois mostramos o mesmo jogo com e sem IA, sem palavras difíceis.
- L89: Tela grande, sem pressa e com toque único. Dá tempo de revisar antes de enviar.
- L125: IA conferindo seu jogo...
- L127: Ver meu resultado
- L128: Calibrando comparação...
- L129: Selecione mais ${remaining} números
- L135: Seu palpite foi registrado. Preparando comparação...
- L136: Tudo pronto. A IA já está posicionada para analisar o seu jogo.


## 6. Resultado manual (sem IA)

### src/components/slides/UserResultSlide.tsx
- L34: ManualResult
- L43: 🧮 IA auditando seu jogo
- L45: Estamos conferindo sua aposta
- L45: Seu resultado saiu
- L47: Segure alguns segundos. Conferimos tudo antes de mostrar.
- L47: Veja quantos pontos faria sozinho antes de ligar a IA.
- L55: Comparando seus 15 números com 2.500 resultados anteriores.
- L60: Placar sem IA
- L62: É aqui que você ficaria se entrasse com este jogo agora.
- L66: Seus números
- L76: Seus números aparecerão aqui ao fim da rodada.
- L81: Toque no botão abaixo para ver a mesma aposta com a IA trabalhando a seu favor.
- L85: Ver a IA jogando agora


## 7. Sincronização com a IA

### src/components/slides/AISyncLoadingSlide.tsx
- L14: ${userScore} pontos conferidos
- L14: Seu jogo
- L15: IA ativa
- L15: Mesmos números rodando na máquina
- L16: Giro pronto
- L16: Roleta carregada para você
- L31: Conferindo resultado
- L35: Estamos comparando seus
- L35: pontos com a jogada da IA
- L36: É uma tela rápida para não travar e garantir que o placar saia certinho.
- L40: O que está acontecendo agora
- L42: Conferimos seus 15 números em 2.500 resultados.
- L43: Separarmos o mesmo jogo rodado pela IA.
- L44: Carregamos o giro bônus que ela deixou pra você.
- L60: Segure uns segundos e já mostramos o comparativo.


## 8. Simulação da IA

### src/components/slides/AISimulationSlide.tsx
- L19: Escaneando
- L19: Olha 2.500 resultados anteriores
- L20: Escolhe 15 números com maior chance
- L20: Montando jogo
- L21: Libera o giro pago pela IA
- L21: Mostrando placar
- L108: IA em ação
- L111: Conferindo seu jogo
- L113: Escolhendo os 15 números dela
- L114: Mostrando o placar final
- L118: Painel protegido em tempo real
- L138: IA conectando na sua aposta, auditando 2.500 sorteios anteriores e calculando probabilidades...
- L145: IA escolhendo 15 números com maior chance agora.
- L159: Comparativo final
- L160: A IA está jogando por você agora.
- L166: Você
- L171: IA
- L176: A IA fez
- L176: pontos com os mesmos números. Você ficou nos
- L177: Com isso ela liberou um giro pago por ela mesma para você resgatar o desconto.
- L181: Bônus reservado
- L182: Ela usou
- L182: giros e guardou 1 pra você.
- L183: Esse giro destrava até R$500 em desconto.
- L190: Seguir para o giro
- L197: IA consolidando os pontos e auditando o painel para liberar seu relatório final...


## 9. Prova social e validação

### src/components/slides/AiWinSlide.tsx
- L14: A IA venceu essa rodada…
- L16: Mas ela liberou 1 giro especial para você virar o jogo.
- L22: A IA cravou 14 pontos usando análise preditiva. Ela já desbloqueou os 3 giros dela… e separou 1 giro bônus para você.
- L26: Você ganhou 1 giro na Roleta de Prêmios — ele pode liberar o MAX WIN a qualquer momento.
- L29: Se sair agora, o giro desaparece.
- L33: Antes de usar o giro, veja em segundos como outros jogadores estão ativando a LOTER.IA.
- L42: Ver jogadores reais e liberar meu giro

### src/components/slides/TestimonialsSlide.tsx
- L11: Ana • SP
- L12: R$ 2.500
- L16: Lucas • MG
- L17: R$ 370
- L21: Marina • RJ
- L22: R$ 2.030
- L35: LOTER.IA
- L40: Antes de girar a roleta, veja o que os nossos usuários estão achando da LOTER.IA
- L43: São centenas jogando com a LOTER.IA neste momento — sinta a energia antes de liberar seu giro.
- L78: Liberar meu giro


## 10. Bônus 2 — Roleta da IA

### src/components/slides/RouletteBonusSlide.tsx
- L12: MAX WIN
- L12: R$ 10 OFF
- L12: R$ 100 OFF
- L12: R$ 20 OFF
- L12: R$ 200 OFF
- L12: R$ 50 OFF
- L13: MAX WIN
- L17: Cashback imediato
- L18: Usado para reduzir o valor do acesso agora mesmo.
- L22: Consultoria express
- L23: Conversa rápida com o time para destravar estratégia.
- L27: Bônus MAX WIN
- L28: R$500 off quando os três rolos travam no dourado.
- L48: SlotMaxWin
- L121: SlotSpinStart
- L153: Bônus 2 • Roleta da IA
- L154: Giro pago pela IA
- L156: Ela deixou 1 rodada para você. Se os três rolos pararem em MAX WIN, o desconto de R$500 aparece na hora e já vamos para a oferta.
- L159: A IA deixou 1 chance ativa exclusivamente pra você.
- L160: Spins disponíveis:
- L180: Aperte uma vez. Mostramos cada rolo parando devagar.
- L184: Prêmios possíveis:
- L186: 🔹 R$10 OFF
- L187: 🔹 R$20 OFF
- L188: 🔹 R$50 OFF
- L189: 🔹 R$100 OFF
- L190: 🔹 R$200 OFF
- L191: 🔹 MAX WIN: R$500 OFF (desconto máximo)
- L210: Girando...
- L210: Girar agora
- L215: Resultado
- L216: MAX WIN desbloqueado!
- L218: Você ganhou R$500 de desconto para ativar a LOTER.IA agora.
- L220: Aproveite enquanto o painel está aberto. Levamos você automaticamente para a próxima tela.


## 11. Celebração Max Win

### src/components/slides/MaxWinCelebrationSlide.tsx
- L27: Prêmio máximo
- L32: Você recebeu R$500!
- L35: Essa sensação é de quem acabou de economizar alto: a oferta completa da LOTER.IA de R$500 saiu por apenas R$37.
- L45: Economia desbloqueada
- L48: R$ 500
- L50: R$ 37
- L53: Você travou o desconto máximo da IA. Prepare o checkout e finalize enquanto o painel ainda está aberto.
- L59: Suporte no WhatsApp
- L60: Equipe responde a cada passo da ativação.
- L63: Jogos diários
- L64: Receba combinações calibradas todos os dias.
- L67: Bolão Mega da Virada
- L68: Acesso antecipado ao bolão VIP antes de abrir ao público.
- L74: MaxWinCTA
- L83: Quero liberar meu acesso final


## 12. Oferta final e checkout

### src/components/slides/FinalOfferSlide.tsx
- L15: CheckoutClick
- L16: WhatsAppSupportClick
- L50: Recomendações personalizadas com IA em tempo real
- L51: Painel de combinações calibradas diárias
- L52: Atendimento 24/7 com 97% de satisfação
- L53: Suporte direto no WhatsApp
- L54: Acesso antecipado ao Bolão da Mega da Virada
- L64: LOTER.IA
- L68: 🎁 Parabéns! Desconto máximo ativado
- L71: Acesso completo à LOTER.IA por apenas R$37 — de R$500!
- L94: Oferta válida pelos próximos
- L100: Depois disso, volta para R$500.
- L106: ${(timeLeft / (3 * 60)) * 100}%
- L111: O que você recebe agora:
- L126: 💸 Desconto desbloqueado:
- L127: De R$500
- L128: R$37
- L129: Garantia total de 7 dias — testou, não gostou, cancela sem risco.
- L139: Liberar acesso por R$37
- L156: Falar com especialista no WhatsApp (24/7)
- L161: Compra segura
- L162: +84 pessoas ativaram só hoje • 97% de satisfação no suporte 24/7
- L167: Mesmo sistema usado por quem fez 13 ou 14 pontos nas últimas semanas.
- L180: Garantir meu acesso - R$37


## 13. Recuperação e saída

### src/components/ExitIntentOverlay.tsx
- L37: 🔐 Momento decisivo
- L39: Você chegou longe demais para sair agora.
- L48: Quem fica até o fim desbloqueia 7x mais chances.
- L51: Você já acumulou
- L51: moedas e só falta uma decisão para liberar o Bônus 1.
- L56: Se fechar agora, o sistema zera suas moedas e fecha o acesso a IA secreta.
- L65: Continuar e liberar meu bônus
- L68: Precisa sair mesmo? Fique só mais 1 minuto para ver como a IA libera até R$500 em bônus.
