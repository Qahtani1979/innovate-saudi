import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Globe, Menu, Sparkles } from 'lucide-react';

export default function PublicHeader() {
  const { language, isRTL, toggleLanguage, t } = useLanguage();
  const location = useLocation();
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

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'left' : 'right'} className="w-[300px] sm:w-[350px]">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
