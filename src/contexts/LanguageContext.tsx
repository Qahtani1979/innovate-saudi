import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    'hero.title': 'Saudi Innovates',
    'hero.subtitle': 'National Municipal Innovation Platform',
    'hero.description': 'Empowering Saudi municipalities with innovative solutions for sustainable development and digital transformation.',
    'hero.cta': 'Get Started',
    'hero.learnMore': 'Learn More',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.projects': 'المشاريع',
    'nav.contact': 'اتصل بنا',
    'hero.title': 'السعودية تبتكر',
    'hero.subtitle': 'منصة الابتكار البلدي الوطنية',
    'hero.description': 'تمكين البلديات السعودية بحلول مبتكرة للتنمية المستدامة والتحول الرقمي.',
    'hero.cta': 'ابدأ الآن',
    'hero.learnMore': 'اعرف المزيد',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
