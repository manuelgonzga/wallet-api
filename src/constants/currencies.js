export const VALID_CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
];

export const DEFAULT_CURRENCY = 'EUR';

export const getCurrencySymbol = (currencyCode) => {
  const currency = VALID_CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.symbol : '€';
};

export const getCurrencyName = (currencyCode) => {
  const currency = VALID_CURRENCIES.find(c => c.code === currencyCode);
  return currency ? currency.name : 'Euro';
};

export const isValidCurrency = (currencyCode) => {
  return VALID_CURRENCIES.some(c => c.code === currencyCode);
};