export const megaQuizConfig = {
  manualMaxNumbers: 6,
  totalNumbers: 60,
  manualPrize: 0,
  iaPrize: 18500000,
  slotMaxDiscount: 1000,
  aiNumbers: [5, 11, 23, 34, 47, 58],
};

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});
