export const isValidInvestmentCurrency =
  (baseCurrency, quoteCurrency) => (investCurrency) =>
    investCurrency === baseCurrency || investCurrency === quoteCurrency;
