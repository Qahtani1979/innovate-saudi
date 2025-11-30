import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">SI</span>
          </div>
          <span className="font-bold text-lg text-foreground">
            {language === 'ar' ? 'السعودية تبتكر' : 'Saudi Innovates'}
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">
            {t('nav.home')}
          </a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">
            {t('nav.about')}
          </a>
          <a href="#projects" className="text-foreground hover:text-primary transition-colors">
            {t('nav.projects')}
          </a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">
            {t('nav.contact')}
          </a>
        </nav>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-2"
        >
          <Globe className="w-4 h-4" />
          {language === 'en' ? 'العربية' : 'English'}
        </Button>
      </div>
    </header>
  );
};

export default Header;
