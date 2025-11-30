import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          {language === 'ar' 
            ? `© ${currentYear} السعودية تبتكر - منصة الابتكار البلدي الوطنية. جميع الحقوق محفوظة.`
            : `© ${currentYear} Saudi Innovates - National Municipal Innovation Platform. All rights reserved.`
          }
        </div>
      </div>
    </footer>
  );
};

export default Footer;
