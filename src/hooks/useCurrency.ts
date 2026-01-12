import { useState, useCallback } from 'react';

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.85 },
  { code: 'GBP', symbol: '£', rate: 0.73 },
  { code: 'ZAR', symbol: 'R', rate: 18.50 },
  { code: 'JPY', symbol: '¥', rate: 110 },
  { code: 'CAD', symbol: 'C$', rate: 1.25 },
  { code: 'AUD', symbol: 'A$', rate: 1.35 },
];

export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[0]);

  const convertPrice = useCallback((price: number) => {
    return (price * selectedCurrency.rate).toFixed(2);
  }, [selectedCurrency]);

  const formatPrice = useCallback((price: number) => {
    const converted = convertPrice(price);
    return `${selectedCurrency.symbol}${converted}`;
  }, [selectedCurrency, convertPrice]);

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    convertPrice,
    formatPrice
  };
};