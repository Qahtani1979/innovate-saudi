import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Globe, Menu, Sparkles, LayoutDashboard } from 'lucide-react';
import UserAvatarMenu from '@/components/shared/UserAvatarMenu';

export default function PublicHeader() {
  const { language, isRTL, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get role-based dashboard from persona routing
  const { defaultDashboard, dashboardLabel } = usePersonaRouting();

  const navLinks = [
    { href: '/', label: t({ en: 'Home', ar: 'الرئيسية' }) },
    { href: '/about', label: t({ en: 'About', ar: 'عن المنصة' }) },
    { href: '/public-challenges', label: t({ en: 'Challenges', ar: 'التحديات' }) },
    { href: '/public-solutions', label: t({ en: 'Solutions', ar: 'الحلول' }) },
    { href: '/for-municipalities', label: t({ en: 'For Municipalities', ar: 'للبلديات' }) },
    { href: '/for-providers', label: t({ en: 'For Providers', ar: 'للمزودين' }) },
    { href: '/for-innovators', label: t({ en: 'For Innovators', ar: 'للمبتكرين' }) },
    { href: '/for-researchers', label: t({ en: 'For Researchers', ar: 'للباحثين' }) },
  ];

  const isActive = (href) => location.pathname === href;

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.full_name;
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 hidden sm:inline">
            {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">{language === 'en' ? 'العربية' : 'English'}</span>
          </Button>

          {isAuthenticated ? (
            <>
              {/* Go to Dashboard button */}
              <Link to={defaultDashboard} className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  {language === 'en' ? dashboardLabel.en : dashboardLabel.ar}
                </Button>
              </Link>

              {/* Shared User Avatar Menu */}
              <UserAvatarMenu showDashboardLink={false} showName={false} />
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  {t({ en: 'Sign In', ar: 'دخول' })}
                </Button>
              </Link>

              <Link to="/auth" className="hidden sm:block">
                <Button size="sm">
                  {t({ en: 'Get Started', ar: 'ابدأ' })}
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-[300px] sm:w-[350px]">
              {isAuthenticated && (
                <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-teal-500 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user?.user_metadata?.full_name || user?.full_name || t({ en: 'User', ar: 'مستخدم' })}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              )}
              
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t my-4" />
                
                {isAuthenticated ? (
                  <>
                    <Link to={defaultDashboard} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {language === 'en' ? dashboardLabel.en : dashboardLabel.ar}
                      </Button>
                    </Link>
                    <Link to="/user-profile" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 mt-2">
                        {t({ en: 'My Profile', ar: 'ملفي الشخصي' })}
                      </Button>
                    </Link>
                    <Link to="/settings" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2 mt-2">
                        {t({ en: 'Settings', ar: 'الإعدادات' })}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t({ en: 'Sign In', ar: 'دخول' })}
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full mt-2">
                        {t({ en: 'Get Started', ar: 'ابدأ' })}
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
