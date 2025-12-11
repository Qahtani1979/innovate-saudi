import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Menu, Sparkles, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { usePersonaRouting } from '@/hooks/usePersonaRouting';

export default function PublicHeader() {
  const { language, isRTL, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const { defaultDashboard, dashboardLabel } = usePersonaRouting();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - Same as PublicPortal */}
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

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.user_metadata?.full_name || t({ en: 'User', ar: 'مستخدم' })}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={defaultDashboard} className="cursor-pointer">
                      <LayoutDashboard className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {language === 'en' ? dashboardLabel.en : dashboardLabel.ar}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-profiles-hub" className="cursor-pointer">
                      <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'My Profile', ar: 'ملفي الشخصي' })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Sign Out', ar: 'تسجيل الخروج' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user?.user_metadata?.full_name || t({ en: 'User', ar: 'مستخدم' })}</p>
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
                    <Link to="/my-profiles-hub" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2">
                        <User className="h-4 w-4" />
                        {t({ en: 'My Profile', ar: 'ملفي الشخصي' })}
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full gap-2"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t({ en: 'Sign Out', ar: 'تسجيل الخروج' })}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t({ en: 'Sign In', ar: 'دخول' })}
                      </Button>
                    </Link>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">
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
