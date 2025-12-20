import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, Users, Globe, Award, Lightbulb, 
  Handshake, TrendingUp, ArrowRight 
} from 'lucide-react';

export default function About() {
  const { language, isRTL, t } = useLanguage();

  const values = [
    {
      icon: Lightbulb,
      title: t({ en: 'Innovation', ar: 'الابتكار' }),
      description: t({ en: 'Fostering creative solutions to municipal challenges', ar: 'تعزيز الحلول الإبداعية للتحديات البلدية' })
    },
    {
      icon: Handshake,
      title: t({ en: 'Collaboration', ar: 'التعاون' }),
      description: t({ en: 'Building partnerships across sectors', ar: 'بناء الشراكات عبر القطاعات' })
    },
    {
      icon: Award,
      title: t({ en: 'Excellence', ar: 'التميز' }),
      description: t({ en: 'Striving for the highest quality outcomes', ar: 'السعي لتحقيق نتائج بأعلى جودة' })
    },
    {
      icon: Globe,
      title: t({ en: 'Transparency', ar: 'الشفافية' }),
      description: t({ en: 'Open and accountable processes', ar: 'عمليات مفتوحة وخاضعة للمساءلة' })
    }
  ];

  const stats = [
    { value: '100+', label: t({ en: 'Partner Municipalities', ar: 'البلديات الشريكة' }) },
    { value: '500+', label: t({ en: 'Verified Solutions', ar: 'الحلول المعتمدة' }) },
    { value: '200+', label: t({ en: 'Successful Pilots', ar: 'التجارب الناجحة' }) },
    { value: '50+', label: t({ en: 'Solution Providers', ar: 'مزودي الحلول' }) }
  ];

  const team = [
    {
      name: t({ en: 'Dr. Ahmed Al-Rashid', ar: 'د. أحمد الراشد' }),
      role: t({ en: 'Executive Director', ar: 'المدير التنفيذي' }),
      description: t({ en: '20+ years in municipal innovation', ar: '20+ سنة في الابتكار البلدي' })
    },
    {
      name: t({ en: 'Sarah Al-Mansoori', ar: 'سارة المنصوري' }),
      role: t({ en: 'Head of Partnerships', ar: 'رئيسة الشراكات' }),
      description: t({ en: 'Expert in public-private partnerships', ar: 'خبيرة في الشراكات بين القطاعين' })
    },
    {
      name: t({ en: 'Mohammed Al-Hassan', ar: 'محمد الحسن' }),
      role: t({ en: 'Technology Director', ar: 'مدير التقنية' }),
      description: t({ en: 'Leading digital transformation', ar: 'قيادة التحول الرقمي' })
    }
  ];

  return (
    <>
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t({ en: 'About the Innovation Platform', ar: 'عن منصة الابتكار' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t({ 
              en: 'We are dedicated to transforming municipal services through innovation, connecting municipalities with cutting-edge solutions and enabling sustainable urban development.', 
              ar: 'نحن ملتزمون بتحويل الخدمات البلدية من خلال الابتكار، وربط البلديات بالحلول المتطورة وتمكين التنمية الحضرية المستدامة.' 
            })}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t({ en: 'Our Mission', ar: 'مهمتنا' })}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t({ 
                    en: 'To accelerate municipal innovation by creating a dynamic ecosystem that connects challenges with solutions, enabling cities to deliver better services to their citizens through tested and proven innovations.', 
                    ar: 'تسريع الابتكار البلدي من خلال إنشاء نظام بيئي ديناميكي يربط التحديات بالحلول، مما يمكّن المدن من تقديم خدمات أفضل لمواطنيها من خلال الابتكارات المختبرة والمثبتة.' 
                  })}
                </p>
              </CardContent>
            </Card>

            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t({ en: 'Our Vision', ar: 'رؤيتنا' })}
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t({ 
                    en: 'To be the leading platform for municipal innovation in the region, where every city has access to world-class solutions and every innovation can reach its full potential through systematic piloting and scaling.', 
                    ar: 'أن نكون المنصة الرائدة للابتكار البلدي في المنطقة، حيث تتمتع كل مدينة بإمكانية الوصول إلى حلول عالمية المستوى وكل ابتكار يمكن أن يصل إلى إمكاناته الكاملة.' 
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t({ en: 'Our Core Values', ar: 'قيمنا الأساسية' })}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t({ en: 'Leadership Team', ar: 'فريق القيادة' })}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t({ en: 'Ready to Join Our Network?', ar: 'مستعد للانضمام إلى شبكتنا؟' })}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t({ 
              en: 'Whether you are a municipality looking for solutions or a provider with innovative ideas, we would love to connect.', 
              ar: 'سواء كنت بلدية تبحث عن حلول أو مزوداً لديه أفكار مبتكرة، نحب أن نتواصل معك.' 
            })}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                {t({ en: 'Contact Us', ar: 'تواصل معنا' })}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
