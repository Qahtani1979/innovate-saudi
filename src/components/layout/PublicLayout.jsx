import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { useLanguage } from '@/components/LanguageContext';

/**
 * PublicLayout - Lightweight layout for public/unauthenticated pages
 * 
 * This layout does NOT use usePermissions or usePersonaRouting hooks,
 * keeping it completely decoupled from authenticated user state.
 * Only uses useAuth() for simple "is logged in" checks in the header.
 */
export default function PublicLayout({ children }) {
  const { isRTL } = useLanguage();

  return (
    <div 
      className="min-h-screen flex flex-col bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
