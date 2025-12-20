import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Gavel } from 'lucide-react';

export default function Terms() {
  const { language, isRTL, t } = useLanguage();

  const sections = [
    {
      icon: CheckCircle,
      title: { en: 'Acceptance of Terms', ar: 'قبول الشروط' },
      content: {
        en: 'By accessing and using this platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.',
        ar: 'من خلال الوصول إلى هذه المنصة واستخدامها، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة.'
      }
    },
    {
      icon: Users,
      title: { en: 'User Responsibilities', ar: 'مسؤوليات المستخدم' },
      content: {
        en: 'Users must provide accurate information, maintain account security, respect intellectual property rights, and use the platform in compliance with applicable laws and regulations.',
        ar: 'يجب على المستخدمين تقديم معلومات دقيقة، والحفاظ على أمان الحساب، واحترام حقوق الملكية الفكرية، واستخدام المنصة بما يتوافق مع القوانين واللوائح المعمول بها.'
      }
    },
    {
      icon: Scale,
      title: { en: 'Intellectual Property', ar: 'الملكية الفكرية' },
      content: {
        en: 'Content submitted to the platform remains the property of the submitting party. The platform has a license to use, display, and distribute this content for platform purposes.',
        ar: 'يظل المحتوى المقدم إلى المنصة ملكاً للطرف المقدم. تمتلك المنصة ترخيصاً لاستخدام هذا المحتوى وعرضه وتوزيعه لأغراض المنصة.'
      }
    },
    {
      icon: AlertTriangle,
      title: { en: 'Limitation of Liability', ar: 'تحديد المسؤولية' },
      content: {
        en: 'The platform is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from the use of the platform.',
        ar: 'يتم توفير المنصة "كما هي" دون ضمانات. نحن غير مسؤولين عن أي أضرار غير مباشرة أو عرضية أو تبعية ناشئة عن استخدام المنصة.'
      }
    },
    {
      icon: Gavel,
      title: { en: 'Governing Law', ar: 'القانون المعمول به' },
      content: {
        en: 'These terms are governed by the laws of the Kingdom of Saudi Arabia. Any disputes will be resolved through the appropriate legal channels in the Kingdom.',
        ar: 'تخضع هذه الشروط لقوانين المملكة العربية السعودية. سيتم حل أي نزاعات من خلال القنوات القانونية المناسبة في المملكة.'
      }
    },
    {
      icon: FileText,
      title: { en: 'Changes to Terms', ar: 'التغييرات على الشروط' },
      content: {
        en: 'We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.',
        ar: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. يشكل استمرار استخدام المنصة بعد التغييرات قبولاً للشروط الجديدة.'
      }
    }
  ];

  return (
    <>
      
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            {t({ en: 'Terms of Service', ar: 'شروط الخدمة' })}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t({ 
              en: 'Please read these terms carefully before using the Saudi Innovates platform.',
              ar: 'يرجى قراءة هذه الشروط بعناية قبل استخدام منصة الابتكار السعودي.'
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
                {t({ en: 'Questions About Terms?', ar: 'أسئلة حول الشروط؟' })}
              </h3>
              <p className="text-slate-600 mb-4">
                {t({ 
                  en: 'If you have any questions about these terms, please contact our legal team.',
                  ar: 'إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل مع فريقنا القانوني.'
                })}
              </p>
              <a 
                href="mailto:legal@saudi-innovates.sa" 
                className="text-blue-600 font-semibold hover:underline"
              >
                legal@saudi-innovates.sa
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
