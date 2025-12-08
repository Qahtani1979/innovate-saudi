import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PersonalizedOnboardingWizard({ userRole, onComplete }) {
  const { language, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const roleSteps = {
    municipality_admin: [
      {
        title: { en: 'Complete Your Profile', ar: 'أكمل ملفك' },
        description: { en: 'Add your city details and contact info', ar: 'أضف تفاصيل مدينتك ومعلومات الاتصال' },
        action: { en: 'Go to Profile', ar: 'انتقل للملف' },
        link: 'UserProfile'
      },
      {
        title: { en: 'Submit Your First Challenge', ar: 'قدم تحديك الأول' },
        description: { en: 'Identify a municipal challenge to solve', ar: 'حدد تحدياً بلدياً للحل' },
        action: { en: 'Create Challenge', ar: 'إنشاء التحدي' },
        link: 'ChallengeCreate'
      },
      {
        title: { en: 'Explore Solutions', ar: 'استكشف الحلول' },
        description: { en: 'Browse validated solutions from providers', ar: 'تصفح الحلول المحققة من المزودين' },
        action: { en: 'View Solutions', ar: 'عرض الحلول' },
        link: 'Solutions'
      },
      {
        title: { en: 'Connect with Network', ar: 'اتصل بالشبكة' },
        description: { en: 'Join discussions and learn from peers', ar: 'انضم للنقاشات وتعلم من الأقران' },
        action: { en: 'Explore Network', ar: 'استكشف الشبكة' },
        link: 'Network'
      }
    ],
    startup_user: [
      {
        title: { en: 'Complete Company Profile', ar: 'أكمل ملف الشركة' },
        description: { en: 'Showcase your solution and capabilities', ar: 'اعرض حلك وقدراتك' },
        action: { en: 'Edit Profile', ar: 'تعديل الملف' },
        link: 'StartupProfile'
      },
      {
        title: { en: 'Add Your Solutions', ar: 'أضف حلولك' },
        description: { en: 'Register solutions in the marketplace', ar: 'سجل الحلول في السوق' },
        action: { en: 'Add Solution', ar: 'إضافة حل' },
        link: 'SolutionCreate'
      },
      {
        title: { en: 'Browse Challenges', ar: 'تصفح التحديات' },
        description: { en: 'Discover 5+ recommended challenges', ar: 'اكتشف 5+ تحديات موصى بها' },
        action: { en: 'View Opportunities', ar: 'عرض الفرص' },
        link: 'OpportunityFeed'
      },
      {
        title: { en: 'Apply to Programs', ar: 'قدم للبرامج' },
        description: { en: 'Join accelerators and matchmakers', ar: 'انضم للمسرعات والموفقين' },
        action: { en: 'Browse Programs', ar: 'تصفح البرامج' },
        link: 'Programs'
      }
    ],
    researcher: [
      {
        title: { en: 'Create Academic Profile', ar: 'أنشئ الملف الأكاديمي' },
        description: { en: 'Add publications, expertise, and affiliations', ar: 'أضف المنشورات، الخبرة، والانتماءات' },
        action: { en: 'Build Profile', ar: 'بناء الملف' },
        link: 'ResearcherProfile'
      },
      {
        title: { en: 'Explore R&D Calls', ar: 'استكشف دعوات البحث' },
        description: { en: 'Find funded research opportunities', ar: 'ابحث عن فرص بحثية ممولة' },
        action: { en: 'Browse Calls', ar: 'تصفح الدعوات' },
        link: 'RDCalls'
      },
      {
        title: { en: 'Visit Living Labs', ar: 'زُر المختبرات الحية' },
        description: { en: 'Access testbed facilities and equipment', ar: 'الوصول لمرافق ومعدات بيئة الاختبار' },
        action: { en: 'Explore Labs', ar: 'استكشف المختبرات' },
        link: 'LivingLabs'
      }
    ]
  };

  const steps = roleSteps[userRole] || roleSteps.startup_user;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <span>{t({ en: 'Your Onboarding Journey', ar: 'رحلة تأهيلك' })}</span>
          <Badge className="bg-indigo-600 text-white">
            {currentStep + 1} / {steps.length}
          </Badge>
        </CardTitle>
        <Progress value={progress} className="mt-3" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            
            return (
              <div key={idx} className={`p-4 rounded-lg border-2 transition-all ${
                isCompleted ? 'bg-green-50 border-green-300' :
                isCurrent ? 'bg-blue-50 border-blue-300' :
                'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-400 flex-shrink-0 mt-1" />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{step.title[language]}</h4>
                    <p className="text-sm text-slate-600 mb-3">{step.description[language]}</p>
                    
                    {isCurrent && (
                      <Link to={createPageUrl(step.link)}>
                        <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                          {step.action[language]}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                    
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-700">
                        {t({ en: 'Completed', ar: 'مكتمل' })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentStep === steps.length && (
          <div className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 mt-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-900 mb-2">
              {t({ en: '🎉 Onboarding Complete!', ar: '🎉 التأهيل مكتمل!' })}
            </h3>
            <p className="text-sm text-slate-700">
              {t({ en: "You're ready to innovate!", ar: 'أنت جاهز للابتكار!' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}