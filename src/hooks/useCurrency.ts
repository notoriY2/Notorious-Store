// src/hooks/useCurrency.ts

import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import { supabase } from '../lib/supabase';

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
}

const CURRENCY_STORAGE_KEY = 'ny2-selected-currency';

export const useCurrency = () => {
  const [currencies, setCurrencies] =
    useState<Currency[]>([]);

  const [selectedCurrency, setSelectedCurrency] =
    useState<Currency>({
      code: 'ZAR',
      symbol: 'R',
      rate: 18.5,
    });

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================================
     LOAD CURRENCIES FROM SUPABASE
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadCurrencies = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('currencies')
        .select('code, symbol, rate')
        .order('code', {
          ascending: true,
        });

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          'Failed to load currencies:',
          error
        );

        setError(error.message);
        setIsLoading(false);

        return;
      }

      const loadedCurrencies: Currency[] =
        (data ?? []).map((currency) => ({
          code: currency.code,
          symbol: currency.symbol,
          rate: Number(currency.rate),
        }));

      setCurrencies(
        loadedCurrencies
      );

      /*
       * NOTORIOUS.Y2 default currency
       *
       * Check localStorage first, fallback to ZAR -> USD -> first database currency
       */
      let stored: string | null = null;
      try {
        stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      } catch {}

      const defaultCurrency =
        loadedCurrencies.find(c => c.code === stored) ??
        loadedCurrencies.find(c => c.code === 'ZAR') ??
        loadedCurrencies.find(c => c.code === 'USD') ??
        loadedCurrencies[0];

      if (defaultCurrency) {
        setSelectedCurrency(
          defaultCurrency
        );
      }

      setIsLoading(false);
    };

    loadCurrencies();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     PERSISTED SETTER
  ========================================================= */

  const setSelectedCurrencyPersisted = useCallback((currency: Currency) => {
    setSelectedCurrency(currency);
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency.code);
    } catch {}
  }, []);

  /* =========================================================
     CURRENCY CONVERSION
  ========================================================= */

  const convertPrice = useCallback(
    (price: number) => {
      return (
        price * selectedCurrency.rate
      ).toFixed(2);
    },
    [selectedCurrency]
  );

  /* =========================================================
     PRICE FORMATTING
  ========================================================= */

  const formatPrice = useCallback(
    (price: number) => {
      const converted =
        convertPrice(price);

      return `${selectedCurrency.symbol}${converted}`;
    },
    [
      selectedCurrency,
      convertPrice,
    ]
  );

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    currencies,
    selectedCurrency,
    setSelectedCurrency: setSelectedCurrencyPersisted,
    convertPrice,
    formatPrice,
    isLoading,
    error,
  };
};