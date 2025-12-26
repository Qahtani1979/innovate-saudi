import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Home, Search, Bell, User } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function MobileNav({ currentPage }) {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  const navItems = [
    { page: 'Home', icon: Home, label: t({ en: 'Home', ar: 'الرئيسية' }) },
    { page: 'AdvancedSearch', icon: Search, label: t({ en: 'Search', ar: 'بحث' }) },
    { page: 'NotificationCenter', icon: Bell, label: t({ en: 'Alerts', ar: 'تنبيهات' }) },
    { page: 'UserProfile', icon: User, label: t({ en: 'Profile', ar: 'الملف' }) }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ page, icon: Icon, label }) => (
          <Link
            key={page}
            to={createPageUrl(page)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
              currentPage === page ? 'text-blue-600' : 'text-slate-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
