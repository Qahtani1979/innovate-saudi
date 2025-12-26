import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Target, Users, Lightbulb, Award, Rocket, Globe, Building2, Microscope } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function About() {
  const { language, isRTL, t } = useLanguage();

  const pillars = [
    {
      icon: Target,
      title: { en: 'Strategic Alignment', ar: 'المواءمة الاستراتيجية' },
      desc: { en: 'Aligning municipal innovation with national vision and global best practices', ar: 'مواءمة الابتكار البلدي مع الرؤية الوطنية وأفضل الممارسات العالمية' }
    },
    {
      icon: Lightbulb,
      title: { en: 'Innovation Pipeline', ar: 'خط الابتكار' },
      desc: { en: 'Structured pathway from challenge identification to scaled solutions', ar: 'مسار منظم من تحديد التحديات إلى الحلول الموسعة' }
    },
    {
      icon: Microscope,
      title: { en: 'R&D Excellence', ar: 'التميز البحثي' },
      desc: { en: 'Bridging academic research with practical municipal applications', ar: 'ربط البحث الأكاديمي بالتطبيقات البلدية العملية' }
    },
    {
      icon: Users,
      title: { en: 'Ecosystem Building', ar: 'بناء المنظومة' },
      desc: { en: 'Connecting municipalities, startups, academia, and global partners', ar: 'ربط البلديات والشركات والجامعات والشركاء العالميين' }
    }
  ];

  const partners = [
    { type: 'Municipalities', count: '190+', icon: Building2 },
    { type: 'Startups', count: '500+', icon: Rocket },
    { type: 'Universities', count: '50+', icon: Microscope },
    { type: 'Global Partners', count: '20+', icon: Globe }
  ];

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 p-12 text-white">
        <div className="relative z-10 max-w-4xl">
          <Badge className="bg-white/20 text-white border-white/40 mb-4">
            {t({ en: 'About the Platform', ar: 'عن المنصة' })}
          </Badge>
          <h1 className="text-5xl font-bold mb-4">
            {t({ 
              en: 'Saudi Innovates', 
              ar: 'الابتكار السعودي' 
            })}
          </h1>
          <p className="text-2xl opacity-90 mb-6">
            {t({ 
              en: 'National Municipal Innovation Platform', 
              ar: 'المنصة الوطنية للابتكار البلدي' 
            })}
          </p>
          <p className="text-lg leading-relaxed opacity-90">
            {t({ 
              en: 'Empowering Saudi municipalities to identify, validate, and scale innovative solutions that enhance quality of life, drive sustainability, and advance national development goals.', 
              ar: 'تمكين البلديات السعودية من تحديد وتجريب وتوسيع نطاق الحلول المبتكرة التي تعزز جودة الحياة وتدفع الاستدامة وتحقق أهداف التنمية الوطنية.' 
            })}
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Target className="h-6 w-6" />
              {t({ en: 'Our Mission', ar: 'مهمتنا' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              {t({ 
                en: 'To establish Saudi Arabia as a global leader in municipal innovation by building a comprehensive ecosystem that connects challenges with solutions, enables rapid experimentation, and scales proven innovations nationwide.', 
                ar: 'جعل المملكة العربية السعودية رائدة عالمياً في الابتكار البلدي من خلال بناء منظومة شاملة تربط التحديات بالحلول وتمكّن التجريب السريع وتوسع نطاق الابتكارات المثبتة على المستوى الوطني.' 
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Award className="h-6 w-6" />
              {t({ en: 'Our Vision', ar: 'رؤيتنا' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">
              {t({ 
                en: 'Smart, sustainable, and livable Saudi cities powered by a culture of continuous innovation, data-driven decisions, and collaborative problem-solving that serves as a model for the world.', 
                ar: 'مدن سعودية ذكية ومستدامة وقابلة للعيش مدفوعة بثقافة الابتكار المستمر والقرارات المبنية على البيانات وحل المشكلات التعاونية كنموذج للعالم.' 
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Pillars */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Pillars', ar: 'الركائز الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="p-6 border-2 rounded-xl hover:border-blue-300 transition-all">
                  <Icon className="h-10 w-10 text-blue-600 mb-3" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {pillar.title[language]}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {pillar.desc[language]}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ecosystem */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">
            {t({ en: 'Innovation Ecosystem', ar: 'منظومة الابتكار' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {partners.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="text-center p-6 bg-white rounded-xl">
                  <Icon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-purple-900 mb-1">{p.count}</div>
                  <div className="text-sm text-slate-600">{p.type}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Impact Statement */}
      <Card className="border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white">
        <CardHeader>
          <CardTitle className="text-teal-900">
            {t({ en: 'Our Impact', ar: 'تأثيرنا' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">1,200+</div>
              <div className="text-sm text-slate-600">{t({ en: 'Challenges Identified', ar: 'تحديات محددة' })}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">350+</div>
              <div className="text-sm text-slate-600">{t({ en: 'Pilots Launched', ar: 'تجارب مطلقة' })}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-2">85+</div>
              <div className="text-sm text-slate-600">{t({ en: 'Solutions Scaled', ar: 'حلول موسعة' })}</div>
            </div>
          </div>
          <p className="text-center text-slate-700 leading-relaxed">
            {t({ 
              en: 'Together, we are transforming municipal services, improving citizen experiences, and building the cities of tomorrow.', 
              ar: 'معاً، نحن نحول الخدمات البلدية ونحسن تجارب المواطنين ونبني مدن المستقبل.' 
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(About, { requiredPermissions: [] });
