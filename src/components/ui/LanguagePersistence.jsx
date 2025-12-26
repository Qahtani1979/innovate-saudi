import { useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

/**
 * Persist language preference to localStorage
 */
export default function LanguagePersistence() {
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('preferred_language');
    if (saved && saved !== language) {
      toggleLanguage();
    }
  }, []);

  useEffect(() => {
    // Save preference
    localStorage.setItem('preferred_language', language);
  }, [language]);

  return null;
}
