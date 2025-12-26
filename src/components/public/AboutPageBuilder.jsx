import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Info, Users, Target, Award } from 'lucide-react';

export default function AboutPageBuilder() {
  const { t } = useLanguage();

  const sections = [
    {
      title: { en: 'Vision & Mission', ar: 'الرؤية والرسالة' },
      icon: Target,
      content: {
        en: 'Transform Saudi municipalities into innovation hubs through collaboration, experimentation, and knowledge sharing.',
        ar: 'تحويل البلديات السعودية إلى مراكز ابتكار من خلال التعاون والتجريب ومشاركة المعرفة.'
      }
    },
    {
      title: { en: 'Our Team', ar: 'فريقنا' },
      icon: Users,
      content: {
        en: 'Led by GDISB with support from municipalities, academia, and innovation ecosystem partners.',
        ar: 'بقيادة GDISB بدعم من البلديات والأكاديميين وشركاء منظومة الابتكار.'
      }
    },
    {
      title: { en: 'Platform Impact', ar: 'تأثير المنصة' },
      icon: Award,
      content: {
        en: '50+ municipalities, 200+ challenges, 100+ pilots, 30+ scaled solutions.',
        ar: '50+ بلدية، 200+ تحدي، 100+ تجربة، 30+ حل موسع.'
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-indigo-600" />
          {t({ en: 'About Page Content', ar: 'محتوى صفحة حول' })}
          <Badge className="ml-auto bg-amber-600">
            {t({ en: 'Content Needed', ar: 'محتوى مطلوب' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <p className="text-amber-900 font-medium mb-2">
            {t({ en: 'About Page Enhancement Needed', ar: 'تحسين صفحة حول مطلوب' })}
          </p>
          <p className="text-amber-800 text-xs">
            {t({ en: 'Comprehensive About page needed with vision, mission, team, impact stats, partners, and contact info', ar: 'صفحة شاملة مطلوبة' })}
          </p>
        </div>

        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-slate-600" />
                <p className="font-medium text-sm">{section.title.en}</p>
              </div>
              <p className="text-xs text-slate-600">{section.content.en}</p>
            </div>
          );
        })}

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Required sections:</p>
          <ul className="space-y-1 ml-4">
            <li>• Vision & Mission statement</li>
            <li>• Leadership team profiles</li>
            <li>• Platform impact statistics</li>
            <li>• Strategic partners showcase</li>
            <li>• Success stories highlights</li>
            <li>• Contact information</li>
            <li>• FAQ section</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
