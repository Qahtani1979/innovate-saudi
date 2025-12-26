import { useLanguage } from '../LanguageContext';

/**
 * Display numbers in Arabic/English based on language
 */
export default function ArabicNumber({ value, format = 'number' }) {
  const { language } = useLanguage();

  const toArabicNumerals = (num) => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => 
      /\d/.test(digit) ? arabicNumerals[parseInt(digit)] : digit
    ).join('');
  };

  const formatNumber = (num) => {
    if (format === 'currency') {
      return language === 'ar' 
        ? `${toArabicNumerals(num.toLocaleString('ar-SA'))} ريال`
        : `SAR ${num.toLocaleString('en-US')}`;
    }
    
    if (format === 'percent') {
      return language === 'ar'
        ? `٪${toArabicNumerals(num)}`
        : `${num}%`;
    }

    return language === 'ar' 
      ? toArabicNumerals(num.toLocaleString('ar-SA'))
      : num.toLocaleString('en-US');
  };

  return <span>{formatNumber(value)}</span>;
}
