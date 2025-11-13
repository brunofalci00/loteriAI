// Cores oficiais das loterias da Caixa
// Todas as cores em formato HSL para manter consistência com o design system

export const lotteryColors: Record<string, string> = {
  "mega-sena": "hsl(157, 66%, 36%)",      // Verde oficial Mega-Sena
  "lotomania": "hsl(24, 100%, 50%)",      // Laranja Lotomania
  "quina": "hsl(260, 100%, 26%)",         // Roxo escuro Quina
  "lotofacil": "hsl(301, 100%, 29%)",     // Roxo/Magenta Lotofácil
  "dupla-sena": "hsl(352, 78%, 36%)",     // Vermelho Dupla Sena
  "timemania": "hsl(136, 100%, 50%)",     // Verde claro Timemania
  "mais-milionaria": "hsl(32, 100%, 50%)", // Dourado +Milionária
  "federal": "hsl(210, 100%, 20%)",       // Azul escuro Federal
  "dia-de-sorte": "hsl(36, 65%, 48%)",    // Laranja/Dourado Dia de Sorte
  "super-sete": "hsl(146, 100%, 33%)",    // Verde Super Sete
};

export const getLotteryColor = (lotteryId: string): string => {
  return lotteryColors[lotteryId] || "hsl(var(--primary))";
};
