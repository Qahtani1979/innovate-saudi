import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Rocket, Target, Users, TrendingUp, CheckCircle2, ArrowRight,
  Building2, Award, Globe, Zap, BarChart3, Shield
} from 'lucide-react';

export default function ForProviders() {
  const { language, isRTL, t } = useLanguage();

  const benefits = [
    {
      icon: Building2,
      title: t({ en: 'Access 100+ Municipalities', ar: 'الوصول لأكثر من 100 بلدية' }),
      description: t({ en: 'Connect directly with municipalities actively seeking innovative solutions.', ar: 'التواصل مباشرة مع البلديات التي تبحث عن حلول مبتكرة.' })
    },
    {
      icon: Target,
      title: t({ en: 'Challenge-Based Matching', ar: 'المطابقة القائمة على التحديات' }),
      description: t({ en: 'Our AI matches your solutions to real municipal challenges.', ar: 'الذكاء الاصطناعي لدينا يطابق حلولك مع التحديات البلدية الحقيقية.' })
    },
    {
      icon: Zap,
      title: t({ en: 'Pilot Opportunities', ar: 'فرص التجريب' }),
      description: t({ en: 'Test your solutions in real-world municipal environments.', ar: 'اختبر حلولك في بيئات بلدية حقيقية.' })
    },
    {
      icon: TrendingUp,
      title: t({ en: 'Scale Across Cities', ar: 'التوسع عبر المدن' }),
      description: t({ en: 'Successful pilots open doors to scaling across multiple municipalities.', ar: 'التجارب الناجحة تفتح أبواب التوسع عبر بلديات متعددة.' })
    },
    {
      icon: Award,
      title: t({ en: 'Verification Badge', ar: 'شارة التحقق' }),
      description: t({ en: 'Get verified and stand out in the solution marketplace.', ar: 'احصل على التحقق وتميز في سوق الحلول.' })
    },
    {
      icon: BarChart3,
      title: t({ en: 'Performance Analytics', ar: 'تحليلات الأداء' }),
      description: t({ en: 'Track your solution performance and gather valuable feedback.', ar: 'تتبع أداء حلك واجمع ملاحظات قيمة.' })
    }
  ];

  const howItWorks = [
    {
      step: '01',
      title: t({ en: 'Create Your Profile', ar: 'أنشئ ملفك' }),
      description: t({ en: 'Register and complete your company profile with all relevant information.', ar: 'سجل وأكمل ملف شركتك بجميع المعلومات ذات الصلة.' })
    },
    {
      step: '02',
      title: t({ en: 'Add Your Solutions', ar: 'أضف حلولك' }),
      description: t({ en: 'List your solutions with detailed descriptions, features, and case studies.', ar: 'أدرج حلولك مع أوصاف تفصيلية وميزات ودراسات حالة.' })
    },
    {
      step: '03',
      title: t({ en: 'Get Verified', ar: 'احصل على التحقق' }),
      description: t({ en: 'Complete our verification process to earn a trusted provider badge.', ar: 'أكمل عملية التحقق لدينا للحصول على شارة مزود موثوق.' })
    },
    {
      step: '04',
      title: t({ en: 'Receive Matches', ar: 'استقبل المطابقات' }),
      description: t({ en: 'Get matched with relevant municipal challenges automatically.', ar: 'احصل على مطابقة مع التحديات البلدية ذات الصلة تلقائياً.' })
    },
    {
      step: '05',
      title: t({ en: 'Pilot & Scale', ar: 'جرب ووسع' }),
      description: t({ en: 'Run pilots and scale successful implementations across cities.', ar: 'نفذ التجارب ووسع التطبيقات الناجحة عبر المدن.' })
    }
  ];

  const solutionCategories = [
    t({ en: 'Smart City Technologies', ar: 'تقنيات المدن الذكية' }),
    t({ en: 'Environmental Solutions', ar: 'الحلول البيئية' }),
    t({ en: 'Mobility & Transportation', ar: 'التنقل والنقل' }),
    t({ en: 'E-Government Services', ar: 'خدمات الحكومة الإلكترونية' }),
    t({ en: 'Public Safety', ar: 'السلامة العامة' }),
    t({ en: 'Infrastructure Management', ar: 'إدارة البنية التحتية' }),
    t({ en: 'Citizen Engagement', ar: 'إشراك المواطنين' }),
    t({ en: 'Energy & Utilities', ar: 'الطاقة والمرافق' })
  ];

  return (
    <>
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/10 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary-foreground font-medium text-sm mb-6">
                <Rocket className="h-4 w-4" />
                {t({ en: 'For Solution Providers', ar: 'لمزودي الحلول' })}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                {t({ en: 'Bring Your Solutions to Cities That Need Them', ar: 'اجلب حلولك للمدن التي تحتاجها' })}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {t({ 
                  en: 'Connect with municipalities actively seeking innovative solutions. Pilot your technology, prove impact, and scale across the region.', 
                  ar: 'تواصل مع البلديات التي تبحث عن حلول مبتكرة. جرب تقنيتك وأثبت الأثر ووسع نطاقها عبر المنطقة.' 
                })}
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    {t({ en: 'Register as Provider', ar: 'سجل كمزود' })}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/public-solutions">
                  <Button variant="outline" size="lg">
                    {t({ en: 'View Solutions Catalog', ar: 'عرض كتالوج الحلول' })}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-secondary/5 border-secondary/20">
                  <p className="text-4xl font-bold text-secondary-foreground">500+</p>
                  <p className="text-muted-foreground">{t({ en: 'Active Solutions', ar: 'حل نشط' })}</p>
                </Card>
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <p className="text-4xl font-bold text-primary">50+</p>
                  <p className="text-muted-foreground">{t({ en: 'Verified Providers', ar: 'مزود معتمد' })}</p>
                </Card>
                <Card className="p-6 bg-muted">
                  <p className="text-4xl font-bold text-foreground">200+</p>
                  <p className="text-muted-foreground">{t({ en: 'Pilots Completed', ar: 'تجربة مكتملة' })}</p>
                </Card>
                <Card className="p-6 bg-muted">
                  <p className="text-4xl font-bold text-foreground">75%</p>
                  <p className="text-muted-foreground">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
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
              {t({ en: 'Why Join Our Platform?', ar: 'لماذا تنضم لمنصتنا؟' })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t({ en: 'The fastest path from solution to impact.', ar: 'أسرع طريق من الحل إلى الأثر.' })}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Categories */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t({ en: 'Solutions We Are Looking For', ar: 'الحلول التي نبحث عنها' })}
            </h2>
            <p className="text-muted-foreground">
              {t({ en: 'Municipalities are actively seeking solutions in these categories.', ar: 'البلديات تبحث بنشاط عن حلول في هذه الفئات.' })}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {solutionCategories.map((category, index) => (
              <span 
                key={index} 
                className="px-4 py-2 bg-background border rounded-full text-foreground font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t({ en: 'How to Get Started', ar: 'كيف تبدأ' })}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t({ en: 'Simple steps to start connecting with municipalities.', ar: 'خطوات بسيطة للبدء في التواصل مع البلديات.' })}
            </p>
          </div>
          <div className="space-y-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="flex items-start gap-6 bg-muted/30 rounded-xl p-6">
                <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold text-secondary-foreground">{item.step}</span>
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

      {/* CTA */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
            {t({ en: 'Ready to Reach New Markets?', ar: 'مستعد للوصول لأسواق جديدة؟' })}
          </h2>
          <p className="text-secondary-foreground/80 mb-8 text-lg">
            {t({ en: 'Join our network and start connecting with municipalities today.', ar: 'انضم إلى شبكتنا وابدأ التواصل مع البلديات اليوم.' })}
          </p>
          <Link to="/auth">
            <Button size="lg" variant="default" className="gap-2 bg-background text-foreground hover:bg-background/90">
              {t({ en: 'Register Now', ar: 'سجل الآن' })}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
