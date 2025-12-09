import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { 
  Building2, Target, Lightbulb, TrendingUp, CheckCircle2, ArrowRight,
  Users, BarChart3, Shield, Zap, Award, Handshake
} from 'lucide-react';

export default function ForMunicipalities() {
  const { language, isRTL, t } = useLanguage();

  const benefits = [
    {
      icon: Target,
      title: t({ en: 'Challenge Management', ar: 'إدارة التحديات' }),
      description: t({ en: 'Systematically identify, document, and prioritize urban challenges with AI-powered insights.', ar: 'تحديد وتوثيق وترتيب التحديات الحضرية بشكل منهجي مع رؤى مدعومة بالذكاء الاصطناعي.' })
    },
    {
      icon: Lightbulb,
      title: t({ en: 'Solution Discovery', ar: 'اكتشاف الحلول' }),
      description: t({ en: 'Access a curated marketplace of verified solutions matched to your specific needs.', ar: 'الوصول إلى سوق منظم من الحلول المعتمدة المطابقة لاحتياجاتك الخاصة.' })
    },
    {
      icon: Zap,
      title: t({ en: 'Pilot Programs', ar: 'البرامج التجريبية' }),
      description: t({ en: 'Test innovations in controlled environments with structured evaluation frameworks.', ar: 'اختبار الابتكارات في بيئات محكومة مع أطر تقييم منظمة.' })
    },
    {
      icon: TrendingUp,
      title: t({ en: 'Scaling Support', ar: 'دعم التوسع' }),
      description: t({ en: 'Scale successful pilots to full implementation with comprehensive support.', ar: 'توسيع التجارب الناجحة إلى تنفيذ كامل مع دعم شامل.' })
    },
    {
      icon: BarChart3,
      title: t({ en: 'Analytics & Insights', ar: 'التحليلات والرؤى' }),
      description: t({ en: 'Track progress, measure impact, and make data-driven decisions.', ar: 'تتبع التقدم وقياس الأثر واتخاذ قرارات مبنية على البيانات.' })
    },
    {
      icon: Users,
      title: t({ en: 'Collaboration Network', ar: 'شبكة التعاون' }),
      description: t({ en: 'Connect with other municipalities to share experiences and best practices.', ar: 'التواصل مع البلديات الأخرى لتبادل الخبرات وأفضل الممارسات.' })
    }
  ];

  const process = [
    {
      step: '01',
      title: t({ en: 'Register & Setup', ar: 'التسجيل والإعداد' }),
      description: t({ en: 'Create your municipality profile and configure your innovation focus areas.', ar: 'إنشاء ملف بلديتك وتكوين مجالات تركيز الابتكار.' })
    },
    {
      step: '02',
      title: t({ en: 'Submit Challenges', ar: 'تقديم التحديات' }),
      description: t({ en: 'Document your challenges and let our AI suggest matching solutions.', ar: 'توثيق تحدياتك ودع الذكاء الاصطناعي يقترح حلولاً مطابقة.' })
    },
    {
      step: '03',
      title: t({ en: 'Evaluate Solutions', ar: 'تقييم الحلول' }),
      description: t({ en: 'Review proposals, request demos, and select the best fit for your needs.', ar: 'مراجعة العروض وطلب العروض التوضيحية واختيار الأنسب لاحتياجاتك.' })
    },
    {
      step: '04',
      title: t({ en: 'Run Pilots', ar: 'تنفيذ التجارب' }),
      description: t({ en: 'Execute controlled pilots with our structured methodology and support.', ar: 'تنفيذ تجارب محكومة مع منهجيتنا المنظمة ودعمنا.' })
    },
    {
      step: '05',
      title: t({ en: 'Scale & Integrate', ar: 'التوسع والتكامل' }),
      description: t({ en: 'Roll out successful innovations across your municipality.', ar: 'نشر الابتكارات الناجحة عبر بلديتك.' })
    }
  ];

  const testimonials = [
    {
      quote: t({ en: 'The platform transformed how we approach urban challenges. We reduced our solution discovery time by 60%.', ar: 'غيرت المنصة طريقة تعاملنا مع التحديات الحضرية. قللنا وقت اكتشاف الحلول بنسبة 60٪.' }),
      author: t({ en: 'Innovation Director', ar: 'مدير الابتكار' }),
      org: t({ en: 'Riyadh Municipality', ar: 'أمانة الرياض' })
    },
    {
      quote: t({ en: 'The structured pilot methodology gave us confidence to test bold solutions. Three of our pilots are now fully scaled.', ar: 'منحتنا منهجية التجربة المنظمة الثقة لاختبار حلول جريئة. ثلاث من تجاربنا موسعة بالكامل الآن.' }),
      author: t({ en: 'Smart City Manager', ar: 'مدير المدينة الذكية' }),
      org: t({ en: 'Jeddah Municipality', ar: 'أمانة جدة' })
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
                <Building2 className="h-4 w-4" />
                {t({ en: 'For Municipalities', ar: 'للبلديات' })}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {t({ en: 'Transform Your City Through Innovation', ar: 'حوّل مدينتك من خلال الابتكار' })}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t({ 
                  en: 'Join the network of forward-thinking municipalities using innovation to deliver better services and improve quality of life for citizens.', 
                  ar: 'انضم إلى شبكة البلديات المتطلعة التي تستخدم الابتكار لتقديم خدمات أفضل وتحسين جودة حياة المواطنين.' 
                })}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    {t({ en: 'Schedule a Demo', ar: 'جدولة عرض توضيحي' })}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <p className="text-4xl font-bold text-primary">100+</p>
                  <p className="text-muted-foreground">{t({ en: 'Partner Municipalities', ar: 'بلدية شريكة' })}</p>
                </Card>
                <Card className="p-6 bg-secondary/5 border-secondary/20">
                  <p className="text-4xl font-bold text-secondary-foreground">200+</p>
                  <p className="text-muted-foreground">{t({ en: 'Successful Pilots', ar: 'تجربة ناجحة' })}</p>
                </Card>
                <Card className="p-6 bg-muted">
                  <p className="text-4xl font-bold text-foreground">85%</p>
                  <p className="text-muted-foreground">{t({ en: 'Scaling Rate', ar: 'معدل التوسع' })}</p>
                </Card>
                <Card className="p-6 bg-muted">
                  <p className="text-4xl font-bold text-foreground">60%</p>
                  <p className="text-muted-foreground">{t({ en: 'Faster Discovery', ar: 'اكتشاف أسرع' })}</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t({ en: 'Why Choose Our Platform?', ar: 'لماذا تختار منصتنا؟' })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t({ en: 'Everything you need to drive innovation in your municipality.', ar: 'كل ما تحتاجه لدفع الابتكار في بلديتك.' })}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t({ en: 'How It Works', ar: 'كيف تعمل' })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t({ en: 'A simple, structured process to drive innovation.', ar: 'عملية بسيطة ومنظمة لدفع الابتكار.' })}
            </p>
          </div>
          <div className="space-y-6">
            {process.map((item, index) => (
              <div key={index} className="flex items-start gap-6 bg-background rounded-xl p-6 shadow-sm">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t({ en: 'What Municipalities Say', ar: 'ماذا تقول البلديات' })}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8">
                <blockquote className="text-lg text-foreground mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-muted-foreground">{testimonial.org}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            {t({ en: 'Ready to Transform Your Municipality?', ar: 'مستعد لتحويل بلديتك؟' })}
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            {t({ en: 'Join the innovation network today and start solving challenges smarter.', ar: 'انضم إلى شبكة الابتكار اليوم وابدأ في حل التحديات بذكاء.' })}
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="gap-2">
              {t({ en: 'Get Started Now', ar: 'ابدأ الآن' })}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
