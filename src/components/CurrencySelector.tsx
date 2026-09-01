import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Currency } from '../hooks/useCurrency';

interface CurrencySelectorProps {
  currencies: Currency[];
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedCurrency,
  onCurrencyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors duration-200"
        style={{ color: '#E0A643' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(224, 166, 67, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <span className="font-medium">{selectedCurrency.code}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => {
                onCurrencyChange(currency);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                selectedCurrency.code === currency.code ? '' : ''
              }`}
              style={{ 
                backgroundColor: selectedCurrency.code === currency.code ? 'rgba(196, 77, 43, 0.1)' : 'transparent',
                color: selectedCurrency.code === currency.code ? '#C44D2B' : '#666'
              }}
              onMouseEnter={(e) => {
                if (selectedCurrency.code !== currency.code) {
                  e.currentTarget.style.backgroundColor = 'rgba(224, 166, 67, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCurrency.code !== currency.code) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="font-medium">{currency.code}</span>
              <span className="ml-2" style={{ color: '#E0A643' }}>{currency.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;