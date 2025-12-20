import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Mail, Phone, MapPin, Globe, Sparkles } from 'lucide-react';

export default function PublicFooter() {
  const { language, isRTL, t } = useLanguage();

  const footerLinks = {
    platform: {
      title: t({ en: 'Platform', ar: 'المنصة' }),
      links: [
        { href: '/about', label: t({ en: 'About Us', ar: 'عن المنصة' }) },
        { href: '/public-challenges', label: t({ en: 'Challenges', ar: 'التحديات' }) },
        { href: '/public-solutions', label: t({ en: 'Solutions', ar: 'الحلول' }) },
      ]
    },
    forYou: {
      title: t({ en: 'For You', ar: 'لك' }),
      links: [
        { href: '/for-municipalities', label: t({ en: 'For Municipalities', ar: 'للبلديات' }) },
        { href: '/for-providers', label: t({ en: 'For Providers', ar: 'للمزودين' }) },
        { href: '/faq', label: t({ en: 'FAQ', ar: 'الأسئلة الشائعة' }) },
        { href: '/contact', label: t({ en: 'Contact', ar: 'تواصل معنا' }) },
      ]
    },
    legal: {
      title: t({ en: 'Legal', ar: 'قانوني' }),
      links: [
        { href: '/terms', label: t({ en: 'Terms of Service', ar: 'شروط الخدمة' }) },
        { href: '/privacy', label: t({ en: 'Privacy Policy', ar: 'سياسة الخصوصية' }) },
      ]
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column - Same logo as PublicPortal */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
              </span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">
              {t({ 
                en: 'Empowering municipalities to innovate and deliver better services through smart solutions.', 
                ar: 'تمكين البلديات من الابتكار وتقديم خدمات أفضل من خلال الحلول الذكية.' 
              })}
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@saudi-innovates.sa</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+966 11 XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{t({ en: 'Riyadh, Saudi Arabia', ar: 'الرياض، المملكة العربية السعودية' })}</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} {t({ en: 'Ministry of Municipalities and Housing. All rights reserved.', ar: 'وزارة البلديات والإسكان. جميع الحقوق محفوظة.' })}
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-slate-400 hover:text-white">
              <Globe className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
