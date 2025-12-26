import { useLanguage } from '../LanguageContext';

/**
 * Render bilingual text based on current language
 * Usage: <BilingualText en="Hello" ar="مرحبا" />
 */
export default function BilingualText({ en, ar, className = '' }) {
  const { language } = useLanguage();
  return <span className={className}>{language === 'ar' ? ar : en}</span>;
}

/**
 * Format numbers in Arabic or English
 */
export function BilingualNumber({ value }) {
  const { language } = useLanguage();
  
  if (language === 'ar') {
    return value.toLocaleString('ar-SA');
  }
  return value.toLocaleString('en-US');
}

/**
 * Format currency in SAR
 */
export function BilingualCurrency({ value }) {
  const { language } = useLanguage();
  
  if (language === 'ar') {
    return `${value.toLocaleString('ar-SA')} ر.س`;
  }
  return `SAR ${value.toLocaleString('en-US')}`;
}

/**
 * Format dates with locale
 */
export function BilingualDate({ value, format = 'short' }) {
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  
  if (format === 'long') {
    return new Date(value).toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return new Date(value).toLocaleDateString(locale);
}
