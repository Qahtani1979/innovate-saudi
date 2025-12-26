import { useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

/**
 * Optimize Arabic font rendering and typography
 */
export default function ArabicFontOptimizer() {
  const { language } = useLanguage();

  useEffect(() => {
    if (language === 'ar') {
      const style = document.createElement('style');
      style.id = 'arabic-font-optimizer';
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        
        [dir="rtl"], .rtl {
          font-family: 'Tajawal', 'Arial', sans-serif !important;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        [dir="rtl"] h1, [dir="rtl"] h2, [dir="rtl"] h3 {
          font-weight: 700;
          letter-spacing: 0;
        }
        
        [dir="rtl"] p, [dir="rtl"] span {
          font-weight: 400;
          line-height: 1.8;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existing = document.getElementById('arabic-font-optimizer');
        if (existing) existing.remove();
      };
    }
  }, [language]);

  return null;
}
