import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, UserCheck, Bell } from 'lucide-react';

export default function Privacy() {
  const { language, isRTL, t } = useLanguage();

  const sections = [
    {
      icon: Database,
      title: { en: 'Information We Collect', ar: 'المعلومات التي نجمعها' },
      content: {
        en: 'We collect information you provide directly, including name, email, organization details, and any content you submit. We also collect usage data to improve our services.',
        ar: 'نجمع المعلومات التي تقدمها مباشرة، بما في ذلك الاسم والبريد الإلكتروني وتفاصيل المنظمة وأي محتوى ترسله. نجمع أيضاً بيانات الاستخدام لتحسين خدماتنا.'
      }
    },
    {
      icon: Lock,
      title: { en: 'How We Use Your Information', ar: 'كيف نستخدم معلوماتك' },
      content: {
        en: 'Your information is used to provide and improve our services, communicate with you, process applications, match challenges with solutions, and ensure platform security.',
        ar: 'تُستخدم معلوماتك لتقديم وتحسين خدماتنا، والتواصل معك، ومعالجة الطلبات، ومطابقة التحديات مع الحلول، وضمان أمان المنصة.'
      }
    },
    {
      icon: UserCheck,
      title: { en: 'Information Sharing', ar: 'مشاركة المعلومات' },
      content: {
        en: 'We share information with municipalities and solution providers as necessary to facilitate the innovation process. We do not sell your personal information to third parties.',
        ar: 'نشارك المعلومات مع البلديات ومزودي الحلول حسب الضرورة لتسهيل عملية الابتكار. لا نبيع معلوماتك الشخصية لأطراف ثالثة.'
      }
    },
    {
      icon: Shield,
      title: { en: 'Data Security', ar: 'أمان البيانات' },
      content: {
        en: 'We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits.',
        ar: 'نطبق إجراءات أمان متوافقة مع المعايير الصناعية لحماية بياناتك، بما في ذلك التشفير والخوادم الآمنة والتدقيق الأمني المنتظم.'
      }
    },
    {
      icon: Eye,
      title: { en: 'Your Rights', ar: 'حقوقك' },
      content: {
        en: 'You have the right to access, correct, or delete your personal information. You can also request a copy of your data or withdraw consent for certain processing activities.',
        ar: 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تصحيحها أو حذفها. يمكنك أيضاً طلب نسخة من بياناتك أو سحب الموافقة على أنشطة معالجة معينة.'
      }
    },
    {
      icon: Bell,
      title: { en: 'Updates to This Policy', ar: 'تحديثات هذه السياسة' },
      content: {
        en: 'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page.',
        ar: 'قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية من خلال نشر السياسة الجديدة على هذه الصفحة.'
      }
    }
  ];

  return (
    <>
      
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t({ en: 'Privacy Policy', ar: 'سياسة الخصوصية' })}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t({ 
              en: 'Your privacy is important to us. This policy explains how we collect, use, and protect your information.',
              ar: 'خصوصيتك مهمة بالنسبة لنا. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك.'
            })}
          </p>
          <p className="text-sm text-slate-500 mt-4">
            {t({ en: 'Last updated: December 2024', ar: 'آخر تحديث: ديسمبر 2024' })}
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto space-y-6">
          {sections.map((section, idx) => (
            <Card key={idx} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    <section.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-3">
                      {t(section.title)}
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                      {t(section.content)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {t({ en: 'Questions About Privacy?', ar: 'أسئلة حول الخصوصية؟' })}
              </h3>
              <p className="text-slate-600 mb-4">
                {t({ 
                  en: 'If you have any questions about this privacy policy, please contact us.',
                  ar: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا.'
                })}
              </p>
              <a 
                href="mailto:privacy@saudi-innovates.sa" 
                className="text-blue-600 font-semibold hover:underline"
              >
                privacy@saudi-innovates.sa
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
