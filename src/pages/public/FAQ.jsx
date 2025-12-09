import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import { HelpCircle, ArrowRight } from 'lucide-react';

export default function FAQ() {
  const { language, isRTL, t } = useLanguage();

  const faqCategories = [
    {
      title: t({ en: 'General Questions', ar: 'أسئلة عامة' }),
      questions: [
        {
          q: t({ en: 'What is the Municipal Innovation Platform?', ar: 'ما هي منصة الابتكار البلدي؟' }),
          a: t({ 
            en: 'The Municipal Innovation Platform is a comprehensive system that connects municipalities with innovative solution providers to address urban challenges through a structured process of challenge identification, solution matching, piloting, and scaling.', 
            ar: 'منصة الابتكار البلدي هي نظام شامل يربط البلديات بمزودي الحلول المبتكرة لمواجهة التحديات الحضرية من خلال عملية منظمة لتحديد التحديات ومطابقة الحلول والتجربة والتوسع.' 
          })
        },
        {
          q: t({ en: 'Who can use this platform?', ar: 'من يمكنه استخدام هذه المنصة؟' }),
          a: t({ 
            en: 'The platform is designed for municipalities, solution providers, innovators, researchers, and citizens who want to participate in improving municipal services through innovation.', 
            ar: 'تم تصميم المنصة للبلديات ومزودي الحلول والمبتكرين والباحثين والمواطنين الذين يرغبون في المشاركة في تحسين الخدمات البلدية من خلال الابتكار.' 
          })
        },
        {
          q: t({ en: 'Is the platform free to use?', ar: 'هل المنصة مجانية للاستخدام؟' }),
          a: t({ 
            en: 'Basic access to the platform is free. However, certain premium features and services may require subscription or partnership agreements.', 
            ar: 'الوصول الأساسي للمنصة مجاني. ومع ذلك، قد تتطلب بعض الميزات والخدمات المميزة اشتراكاً أو اتفاقيات شراكة.' 
          })
        }
      ]
    },
    {
      title: t({ en: 'For Municipalities', ar: 'للبلديات' }),
      questions: [
        {
          q: t({ en: 'How do I register my municipality?', ar: 'كيف أسجل بلديتي؟' }),
          a: t({ 
            en: 'Click on "Get Started" and select "Municipality" as your organization type. Complete the registration form and our team will verify your credentials within 2-3 business days.', 
            ar: 'انقر على "ابدأ الآن" واختر "بلدية" كنوع منظمتك. أكمل نموذج التسجيل وسيتحقق فريقنا من بيانات اعتمادك خلال 2-3 أيام عمل.' 
          })
        },
        {
          q: t({ en: 'How do I submit a challenge?', ar: 'كيف أقدم تحدياً؟' }),
          a: t({ 
            en: 'After logging in, navigate to "Challenges" and click "Create Challenge". Fill in the required details including the problem description, desired outcomes, and any constraints. Our team will review and publish approved challenges.', 
            ar: 'بعد تسجيل الدخول، انتقل إلى "التحديات" وانقر على "إنشاء تحدي". املأ التفاصيل المطلوبة بما في ذلك وصف المشكلة والنتائج المرغوبة وأي قيود. سيقوم فريقنا بمراجعة ونشر التحديات المعتمدة.' 
          })
        },
        {
          q: t({ en: 'What support do you provide during pilots?', ar: 'ما الدعم الذي تقدمونه خلال التجارب؟' }),
          a: t({ 
            en: 'We provide comprehensive support including pilot design assistance, progress monitoring tools, evaluation frameworks, and dedicated account managers to ensure successful implementation.', 
            ar: 'نقدم دعماً شاملاً يشمل المساعدة في تصميم التجربة وأدوات مراقبة التقدم وأطر التقييم ومديري حسابات مخصصين لضمان التنفيذ الناجح.' 
          })
        }
      ]
    },
    {
      title: t({ en: 'For Solution Providers', ar: 'لمزودي الحلول' }),
      questions: [
        {
          q: t({ en: 'How do I register as a solution provider?', ar: 'كيف أسجل كمزود حلول؟' }),
          a: t({ 
            en: 'Click "Get Started" and select "Solution Provider". Complete your company profile, add your solutions with detailed descriptions, and submit for verification. Verified providers receive a badge and priority visibility.', 
            ar: 'انقر على "ابدأ الآن" واختر "مزود حلول". أكمل ملف شركتك وأضف حلولك مع أوصاف تفصيلية وقدم للتحقق. يحصل المزودون المعتمدون على شارة وأولوية في الظهور.' 
          })
        },
        {
          q: t({ en: 'How does the matching process work?', ar: 'كيف تعمل عملية المطابقة؟' }),
          a: t({ 
            en: 'Our AI-powered matching system analyzes challenge requirements and solution capabilities to suggest relevant matches. Municipalities can also browse solutions directly and request proposals.', 
            ar: 'يحلل نظام المطابقة المدعوم بالذكاء الاصطناعي متطلبات التحدي وقدرات الحل لاقتراح المطابقات ذات الصلة. يمكن للبلديات أيضاً تصفح الحلول مباشرة وطلب العروض.' 
          })
        },
        {
          q: t({ en: 'What is the verification process?', ar: 'ما هي عملية التحقق؟' }),
          a: t({ 
            en: 'Verification includes reviewing your company credentials, solution documentation, past implementations, and references. The process typically takes 5-7 business days.', 
            ar: 'يشمل التحقق مراجعة بيانات اعتماد شركتك ووثائق الحل والتنفيذات السابقة والمراجع. تستغرق العملية عادة 5-7 أيام عمل.' 
          })
        }
      ]
    },
    {
      title: t({ en: 'Pilots & Scaling', ar: 'التجارب والتوسع' }),
      questions: [
        {
          q: t({ en: 'How long do pilot programs typically last?', ar: 'كم تستغرق البرامج التجريبية عادة؟' }),
          a: t({ 
            en: 'Pilot durations vary based on solution complexity, typically ranging from 3 to 12 months. The platform supports customizable timelines based on mutual agreement between municipalities and providers.', 
            ar: 'تختلف مدة التجارب بناءً على تعقيد الحل، وتتراوح عادة من 3 إلى 12 شهراً. تدعم المنصة جداول زمنية قابلة للتخصيص بناءً على الاتفاق المتبادل بين البلديات والمزودين.' 
          })
        },
        {
          q: t({ en: 'How are pilots evaluated?', ar: 'كيف يتم تقييم التجارب؟' }),
          a: t({ 
            en: 'Pilots are evaluated using predefined KPIs, stakeholder feedback, cost-benefit analysis, and technical assessments. The platform provides structured evaluation templates and reporting tools.', 
            ar: 'يتم تقييم التجارب باستخدام مؤشرات أداء محددة مسبقاً وتعليقات أصحاب المصلحة وتحليل التكلفة والعائد والتقييمات الفنية. توفر المنصة قوالب تقييم منظمة وأدوات إعداد التقارير.' 
          })
        },
        {
          q: t({ en: 'What happens after a successful pilot?', ar: 'ماذا يحدث بعد تجربة ناجحة؟' }),
          a: t({ 
            en: 'Successful pilots can be scaled to full implementation within the municipality or expanded to other municipalities. The platform facilitates scaling through program creation, knowledge sharing, and network effects.', 
            ar: 'يمكن توسيع التجارب الناجحة إلى تنفيذ كامل داخل البلدية أو توسيعها إلى بلديات أخرى. تسهل المنصة التوسع من خلال إنشاء البرامج ومشاركة المعرفة وتأثيرات الشبكة.' 
          })
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t({ en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' })}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t({ 
              en: 'Find answers to common questions about the platform.', 
              ar: 'اعثر على إجابات للأسئلة الشائعة حول المنصة.' 
            })}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold text-foreground mb-6">{category.title}</h2>
                <Accordion type="single" collapsible className="space-y-3">
                  {category.questions.map((item, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`${categoryIndex}-${index}`}
                      className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{item.q}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t({ en: 'Still Have Questions?', ar: 'لا تزال لديك أسئلة؟' })}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t({ 
              en: 'Our team is here to help. Reach out and we will get back to you as soon as possible.', 
              ar: 'فريقنا هنا للمساعدة. تواصل معنا وسنعود إليك في أقرب وقت ممكن.' 
            })}
          </p>
          <Link to="/contact">
            <Button size="lg" className="gap-2">
              {t({ en: 'Contact Support', ar: 'تواصل مع الدعم' })}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
