export type QuizTheme = {
  id: string;
  product: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
};

export const quizConfigs: Record<string, QuizTheme> = {
  classic: {
    id: 'classic',
    product: 'Loter.IA',
    headline: 'Teste gratuito da IA da Mega da Virada',
    subheadline: 'Fluxo original preservado como backup',
    ctaLabel: 'Começar agora',
  },
  mega: {
    id: 'mega',
    product: 'Loter.IA',
    headline: 'Nova copy Mega da Virada',
    subheadline: 'Versão atualizada focada no maior prêmio do ano',
    ctaLabel: 'Liberar acesso Mega',
  },
  lotozap: {
    id: 'lotozap',
    product: 'Lotozap',
    headline: 'Receba 5 jogos certeiros todos os dias',
    subheadline: 'Copy direcionada para Lotofácil e entrega no WhatsApp',
    ctaLabel: 'Quero meus jogos diários',
  },
};

export function getQuizConfig(id: keyof typeof quizConfigs): QuizTheme {
  return quizConfigs[id];
}
