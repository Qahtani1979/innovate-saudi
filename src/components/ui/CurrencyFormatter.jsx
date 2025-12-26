import { useLanguage } from '../LanguageContext';

/**
 * Format currency in SAR with proper localization
 */
export default function CurrencyFormatter({ amount, showSymbol = true }) {
  const { language } = useLanguage();

  const toArabicNumerals = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => 
      /\d/.test(digit) ? arabicNumerals[parseInt(digit)] : digit
    ).join('');
  };

  const formatCurrency = (value) => {
    const formatted = value.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    if (language === 'ar') {
      const arabicNumber = toArabicNumerals(formatted);
      return showSymbol ? `${arabicNumber} ريال` : arabicNumber;
    }

    return showSymbol ? `SAR ${formatted}` : formatted;
  };

  return <span className="font-medium">{formatCurrency(amount)}</span>;
}

export function formatSAR(amount, language = 'en') {
  const toArabicNumerals = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => 
      /\d/.test(digit) ? arabicNumerals[parseInt(digit)] : digit
    ).join('');
  };

  const formatted = amount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');
  
  if (language === 'ar') {
    return `${toArabicNumerals(formatted)} ريال`;
  }
  
  return `SAR ${formatted}`;
}
