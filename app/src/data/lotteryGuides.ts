export interface LotteryPrize {
  hits: number;
  description: string;
  probability: string;
  prizePercentage: string;
}

export interface LotteryGuide {
  id: string;
  name: string;
  icon: string;
  description: string;
  howToPlay: string;
  totalNumbers: number;
  numbersToSelect: number;
  minBet: number;
  maxBet: number;
  betPrice: number;
  prizes: LotteryPrize[];
  drawDays: string[];
  drawTime: string;
  tips: string[];
  specialRules?: string;
}

export const lotteryGuides: Record<string, LotteryGuide> = {
  "mega-sena": {
    id: "mega-sena",
    name: "Mega-Sena",
    icon: "🎱",
    description: "A loteria que paga milhões para quem acertar os 6 números sorteados.",
    howToPlay: "Marque de 6 a 20 números dentre os 60 disponíveis no volante. Ganha quem acertar 4 (Quadra), 5 (Quina) ou 6 (Sena) números.",
    totalNumbers: 60,
    numbersToSelect: 6,
    minBet: 6,
    maxBet: 20,
    betPrice: 5.00,
    prizes: [
      {
        hits: 6,
        description: "Sena (6 acertos)",
        probability: "1 em 50.063.860",
        prizePercentage: "35% do prêmio"
      },
      {
        hits: 5,
        description: "Quina (5 acertos)",
        probability: "1 em 154.518",
        prizePercentage: "19% do prêmio"
      },
      {
        hits: 4,
        description: "Quadra (4 acertos)",
        probability: "1 em 2.332",
        prizePercentage: "19% do prêmio"
      }
    ],
    drawDays: ["Terça-feira", "Quinta-feira", "Sábado"],
    drawTime: "20h",
    tips: [
      "Misture números pares e ímpares para equilibrar seu jogo",
      "Evite jogar apenas números sequenciais",
      "Distribua os números por todas as dezenas (1-10, 11-20, etc)",
      "Bolões aumentam suas chances pagando menos individualmente"
    ]
  },
  
  "quina": {
    id: "quina",
    name: "Quina",
    icon: "⭐",
    description: "Sorteios diários com prêmios que podem ultrapassar milhões de reais.",
    howToPlay: "Marque de 5 a 15 números dentre os 80 disponíveis. Ganha quem acertar 2 (Duque), 3 (Terno), 4 (Quadra) ou 5 (Quina) números.",
    totalNumbers: 80,
    numbersToSelect: 5,
    minBet: 5,
    maxBet: 15,
    betPrice: 2.50,
    prizes: [
      {
        hits: 5,
        description: "Quina (5 acertos)",
        probability: "1 em 24.040.016",
        prizePercentage: "32% do prêmio"
      },
      {
        hits: 4,
        description: "Quadra (4 acertos)",
        probability: "1 em 64.106",
        prizePercentage: "19% do prêmio"
      },
      {
        hits: 3,
        description: "Terno (3 acertos)",
        probability: "1 em 866",
        prizePercentage: "19% do prêmio"
      },
      {
        hits: 2,
        description: "Duque (2 acertos)",
        probability: "1 em 36",
        prizePercentage: "12% do prêmio"
      }
    ],
    drawDays: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
    drawTime: "20h",
    tips: [
      "Com sorteios diários, você tem mais chances de ganhar",
      "Prêmios acumulados podem chegar a valores muito altos",
      "Aposte em números distribuídos por toda a cartela",
      "O Duque (2 acertos) já garante prêmio!"
    ]
  },
  
  "lotofacil": {
    id: "lotofacil",
    name: "Lotofácil",
    icon: "🎯",
    description: "A loteria mais fácil de ganhar! Prêmios garantidos em todas as faixas.",
    howToPlay: "Marque entre 15 e 20 números dentre os 25 disponíveis. Ganha quem acertar 11, 12, 13, 14 ou 15 números.",
    totalNumbers: 25,
    numbersToSelect: 15,
    minBet: 15,
    maxBet: 20,
    betPrice: 3.00,
    prizes: [
      {
        hits: 15,
        description: "15 acertos",
        probability: "1 em 3.268.760",
        prizePercentage: "25% do prêmio"
      },
      {
        hits: 14,
        description: "14 acertos",
        probability: "1 em 21.792",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 13,
        description: "13 acertos",
        probability: "1 em 692",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 12,
        description: "12 acertos",
        probability: "1 em 60",
        prizePercentage: "5% do prêmio"
      },
      {
        hits: 11,
        description: "11 acertos",
        probability: "1 em 11",
        prizePercentage: "10% do prêmio"
      }
    ],
    drawDays: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"],
    drawTime: "20h",
    tips: [
      "A loteria com maior probabilidade de premiação",
      "11 acertos já garantem prêmio - chance de 1 em 11!",
      "Ideal para quem quer ganhar com mais frequência",
      "Sorteios diários aumentam suas oportunidades"
    ]
  },
  
  "lotomania": {
    id: "lotomania",
    name: "Lotomania",
    icon: "🔮",
    description: "Escolha 50 números e concorra a prêmios milionários. Quanto mais acertar, mais ganha!",
    howToPlay: "Marque 50 números dentre os 100 disponíveis. Ganha quem acertar 15, 16, 17, 18, 19, 20 números ou nenhum número!",
    totalNumbers: 100,
    numbersToSelect: 50,
    minBet: 50,
    maxBet: 50,
    betPrice: 3.00,
    prizes: [
      {
        hits: 20,
        description: "20 acertos",
        probability: "1 em 11.372.635",
        prizePercentage: "36% do prêmio"
      },
      {
        hits: 19,
        description: "19 acertos",
        probability: "1 em 352.551",
        prizePercentage: "6% do prêmio"
      },
      {
        hits: 18,
        description: "18 acertos",
        probability: "1 em 24.334",
        prizePercentage: "4% do prêmio"
      },
      {
        hits: 17,
        description: "17 acertos",
        probability: "1 em 2.776",
        prizePercentage: "4% do prêmio"
      },
      {
        hits: 16,
        description: "16 acertos",
        probability: "1 em 472",
        prizePercentage: "4% do prêmio"
      },
      {
        hits: 15,
        description: "15 acertos",
        probability: "1 em 112",
        prizePercentage: "4% do prêmio"
      },
      {
        hits: 0,
        description: "0 acertos",
        probability: "1 em 11.372.635",
        prizePercentage: "4% do prêmio"
      }
    ],
    drawDays: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
    drawTime: "20h",
    specialRules: "Curiosidade: Não acertar nenhum número também premia! É tão difícil quanto acertar os 20.",
    tips: [
      "Marcar 50 números dá muitas combinações possíveis",
      "Tente não acertar nenhum também é premiado",
      "15 acertos já garantem prêmio (chance de 1 em 112)",
      "Distribua bem os números pela cartela"
    ]
  },
  
  "dupla-sena": {
    id: "dupla-sena",
    name: "Dupla Sena",
    icon: "🎲",
    description: "Duas chances de ganhar com um único jogo! Dois sorteios no mesmo concurso.",
    howToPlay: "Marque de 6 a 15 números dentre os 50 disponíveis. São dois sorteios por concurso, dobrando suas chances de ganhar!",
    totalNumbers: 50,
    numbersToSelect: 6,
    minBet: 6,
    maxBet: 15,
    betPrice: 2.50,
    prizes: [
      {
        hits: 6,
        description: "Sena (6 acertos) - 1º sorteio",
        probability: "1 em 15.890.700",
        prizePercentage: "20% do prêmio"
      },
      {
        hits: 6,
        description: "Sena (6 acertos) - 2º sorteio",
        probability: "1 em 15.890.700",
        prizePercentage: "20% do prêmio"
      },
      {
        hits: 5,
        description: "Quina (5 acertos) - 1º sorteio",
        probability: "1 em 60.192",
        prizePercentage: "8% do prêmio"
      },
      {
        hits: 5,
        description: "Quina (5 acertos) - 2º sorteio",
        probability: "1 em 60.192",
        prizePercentage: "8% do prêmio"
      },
      {
        hits: 4,
        description: "Quadra (4 acertos) - 1º sorteio",
        probability: "1 em 1.357",
        prizePercentage: "7% do prêmio"
      },
      {
        hits: 4,
        description: "Quadra (4 acertos) - 2º sorteio",
        probability: "1 em 1.357",
        prizePercentage: "7% do prêmio"
      }
    ],
    drawDays: ["Terça-feira", "Quinta-feira", "Sábado"],
    drawTime: "20h",
    specialRules: "São realizados dois sorteios separados no mesmo concurso, com os mesmos números apostados.",
    tips: [
      "Duas chances de ganhar com uma única aposta",
      "Mesmo jogo concorre nos dois sorteios",
      "Pode ganhar nos dois sorteios simultaneamente",
      "Prêmios independentes para cada sorteio"
    ]
  },
  
  "timemania": {
    id: "timemania",
    name: "Timemania",
    icon: "⚽",
    description: "A loteria do seu time do coração! Escolha 10 números e torça pelo seu clube.",
    howToPlay: "Marque 10 números dentre os 80 disponíveis e escolha seu Time do Coração. Quanto mais acertos, maior o prêmio!",
    totalNumbers: 80,
    numbersToSelect: 10,
    minBet: 10,
    maxBet: 10,
    betPrice: 3.50,
    prizes: [
      {
        hits: 10,
        description: "10 acertos",
        probability: "1 em 26.472.637",
        prizePercentage: "35% do prêmio"
      },
      {
        hits: 9,
        description: "9 acertos",
        probability: "1 em 216.103",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 8,
        description: "8 acertos",
        probability: "1 em 5.172",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 7,
        description: "7 acertos",
        probability: "1 em 250",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 0,
        description: "Time do Coração",
        probability: "1 em 80",
        prizePercentage: "10% do prêmio"
      }
    ],
    drawDays: ["Terça-feira", "Quinta-feira", "Sábado"],
    drawTime: "20h",
    specialRules: "Além dos números, você escolhe um Time do Coração entre os 80 clubes cadastrados. Se ele for sorteado, você também ganha!",
    tips: [
      "Escolha seu time favorito para ter mais uma chance",
      "7 acertos já garantem prêmio (1 em 250)",
      "O Time do Coração sozinho já premia",
      "Apoie seu clube e concorra a prêmios"
    ]
  },
  
  "mais-milionaria": {
    id: "mais-milionaria",
    name: "+Milionária",
    icon: "💰",
    description: "A loteria com os maiores prêmios! Escolha números e trevos da sorte.",
    howToPlay: "Marque de 6 a 12 números (de 01 a 50) e de 2 a 6 trevos (de 01 a 06). São 10 faixas de premiação!",
    totalNumbers: 50,
    numbersToSelect: 6,
    minBet: 6,
    maxBet: 12,
    betPrice: 6.00,
    prizes: [
      {
        hits: 6,
        description: "6 números + 2 trevos",
        probability: "1 em 238.360.500",
        prizePercentage: "31% do prêmio"
      },
      {
        hits: 6,
        description: "6 números + 1 trevo",
        probability: "1 em 79.453.500",
        prizePercentage: "7% do prêmio"
      },
      {
        hits: 6,
        description: "6 números + 0 trevos",
        probability: "1 em 47.672.100",
        prizePercentage: "3% do prêmio"
      },
      {
        hits: 5,
        description: "5 números + 2 trevos",
        probability: "1 em 1.937.816",
        prizePercentage: "5% do prêmio"
      },
      {
        hits: 4,
        description: "4 números + 2 trevos",
        probability: "1 em 37.015",
        prizePercentage: "3% do prêmio"
      }
    ],
    drawDays: ["Quarta-feira", "Sábado"],
    drawTime: "20h",
    specialRules: "Além dos números, você deve marcar os Trevos da Sorte. São necessários pelo menos 2 trevos na aposta mínima.",
    tips: [
      "A loteria mais premiada: 10 faixas diferentes",
      "Prêmio mínimo garantido de R$ 10 milhões",
      "Combine números e trevos estrategicamente",
      "Maior premiação entre todas as loterias"
    ]
  },
  
  "federal": {
    id: "federal",
    name: "Federal",
    icon: "🎟️",
    description: "A loteria dos bilhetes! Prêmios fixos e garantidos em cada sorteio.",
    howToPlay: "Compre um bilhete com número de 5 dígitos de 00.000 a 99.999. Seu número pode ser sorteado em qualquer uma das 5 faixas de premiação!",
    totalNumbers: 100000,
    numbersToSelect: 1,
    minBet: 1,
    maxBet: 1,
    betPrice: 9.00,
    prizes: [
      {
        hits: 1,
        description: "1º Prêmio",
        probability: "1 em 100.000",
        prizePercentage: "R$ 500.000"
      },
      {
        hits: 1,
        description: "2º Prêmio",
        probability: "1 em 100.000",
        prizePercentage: "R$ 27.000"
      },
      {
        hits: 1,
        description: "3º Prêmio",
        probability: "1 em 100.000",
        prizePercentage: "R$ 24.000"
      },
      {
        hits: 1,
        description: "4º Prêmio",
        probability: "1 em 100.000",
        prizePercentage: "R$ 19.000"
      },
      {
        hits: 1,
        description: "5º Prêmio",
        probability: "1 em 100.000",
        prizePercentage: "R$ 18.329"
      }
    ],
    drawDays: ["Quarta-feira", "Sábado"],
    drawTime: "19h",
    specialRules: "Diferente das outras loterias, você compra um bilhete com número já definido. São 5 prêmios principais por sorteio.",
    tips: [
      "Prêmios fixos e garantidos, não acumulam",
      "Você não escolhe números, recebe um bilhete",
      "5 chances de ganhar em cada sorteio",
      "Tradicional e confiável há décadas"
    ]
  },
  
  "dia-de-sorte": {
    id: "dia-de-sorte",
    name: "Dia de Sorte",
    icon: "🍀",
    description: "Escolha seus números e seu mês da sorte! Duas formas de ganhar.",
    howToPlay: "Marque de 7 a 15 números dentre os 31 disponíveis e escolha um mês da sorte. Ganha quem acertar 4, 5, 6 ou 7 números, ou o mês!",
    totalNumbers: 31,
    numbersToSelect: 7,
    minBet: 7,
    maxBet: 15,
    betPrice: 2.50,
    prizes: [
      {
        hits: 7,
        description: "7 acertos",
        probability: "1 em 2.629.575",
        prizePercentage: "30% do prêmio"
      },
      {
        hits: 6,
        description: "6 acertos",
        probability: "1 em 44.981",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 5,
        description: "5 acertos",
        probability: "1 em 1.906",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 4,
        description: "4 acertos",
        probability: "1 em 156",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 0,
        description: "Mês da Sorte",
        probability: "1 em 12",
        prizePercentage: "10% do prêmio"
      }
    ],
    drawDays: ["Terça-feira", "Quinta-feira", "Sábado"],
    drawTime: "20h",
    specialRules: "Além dos números, escolha um Mês da Sorte (de janeiro a dezembro). Se ele for sorteado, você ganha prêmio mesmo sem acertar números!",
    tips: [
      "Escolha o mês especial para você",
      "Mês da Sorte sozinho já premia (1 em 12)",
      "4 acertos já garantem premiação",
      "Números vão apenas de 1 a 31 (como dias do mês)"
    ]
  },
  
  "super-sete": {
    id: "super-sete",
    name: "Super Sete",
    icon: "🎰",
    description: "Escolha um número para cada coluna! Sistema único de apostas.",
    howToPlay: "Marque 7 colunas com números de 0 a 9 em cada uma. Ganha quem acertar 3, 4, 5, 6 ou 7 colunas!",
    totalNumbers: 10,
    numbersToSelect: 7,
    minBet: 7,
    maxBet: 21,
    betPrice: 2.50,
    prizes: [
      {
        hits: 7,
        description: "7 acertos",
        probability: "1 em 10.000.000",
        prizePercentage: "30% do prêmio"
      },
      {
        hits: 6,
        description: "6 acertos",
        probability: "1 em 158.730",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 5,
        description: "5 acertos",
        probability: "1 em 6.006",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 4,
        description: "4 acertos",
        probability: "1 em 476",
        prizePercentage: "10% do prêmio"
      },
      {
        hits: 3,
        description: "3 acertos",
        probability: "1 em 63",
        prizePercentage: "10% do prêmio"
      }
    ],
    drawDays: ["Segunda-feira", "Quarta-feira", "Sexta-feira"],
    drawTime: "15h",
    specialRules: "Diferente das outras loterias, você marca UMA coluna de números (0-9) para cada uma das 7 posições do sorteio.",
    tips: [
      "Sistema único: marque por colunas, não números aleatórios",
      "3 acertos já garantem prêmio (1 em 63)",
      "Cada coluna tem apenas 10 opções (0 a 9)",
      "Sorteios 3 vezes por semana"
    ]
  }
};
