import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../../components/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  Lightbulb, Rocket, Target, TestTube, FileText, CheckCircle2,
  Users, Building2, Microscope, TrendingUp, Award,
  Beaker, BarChart3, DollarSign, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForInnovators() {
  const { language, isRTL, t } = useLanguage();

  const proposalTypes = [
    {
      icon: Target,
      type: { en: 'Problem Definition', ar: 'تعريف المشكلة' },
      desc: { en: 'Identify and document a municipal challenge with data-backed evidence', ar: 'تحديد وتوثيق تحدي بلدي مدعوم بالبيانات' },
      color: 'red'
    },
    {
      icon: Lightbulb,
      type: { en: 'Solution Proposal', ar: 'اقتراح حل' },
      desc: { en: 'Submit innovative solutions to existing challenges', ar: 'تقديم حلول مبتكرة للتحديات القائمة' },
      color: 'amber'
    },
    {
      icon: Microscope,
      type: { en: 'Research Question', ar: 'سؤال بحثي' },
      desc: { en: 'Propose research studies to address knowledge gaps', ar: 'اقتراح دراسات بحثية لسد الفجوات المعرفية' },
      color: 'purple'
    },
    {
      icon: FileText,
      type: { en: 'Implementation Plan', ar: 'خطة تنفيذ' },
      desc: { en: 'Detailed plans to deploy proven solutions at scale', ar: 'خطط تفصيلية لنشر الحلول المثبتة على نطاق واسع' },
      color: 'green'
    }
  ];

  const journeySteps = [
    {
      step: 1,
      title: { en: 'Submit Proposal', ar: 'تقديم المقترح' },
      desc: { en: 'Fill out our structured proposal form with your innovation details, team, and budget estimate', ar: 'أكمل نموذج المقترح المنظم بتفاصيل ابتكارك وفريقك وتقدير الميزانية' },
      icon: FileText
    },
    {
      step: 2,
      title: { en: 'AI Screening', ar: 'الفرز بالذكاء الاصطناعي' },
      desc: { en: 'Your proposal is analyzed for feasibility, market potential, and alignment with municipal needs', ar: 'يتم تحليل مقترحك من حيث الجدوى وإمكانات السوق والتوافق مع احتياجات البلدية' },
      icon: Beaker
    },
    {
      step: 3,
      title: { en: 'Expert Review', ar: 'مراجعة الخبراء' },
      desc: { en: 'Domain experts evaluate technical feasibility and innovation level', ar: 'يقوم خبراء المجال بتقييم الجدوى الفنية ومستوى الابتكار' },
      icon: Users
    },
    {
      step: 4,
      title: { en: 'Stakeholder Alignment', ar: 'توافق أصحاب المصلحة' },
      desc: { en: 'Match with interested municipalities and verify strategic alignment', ar: 'المطابقة مع البلديات المهتمة والتحقق من التوافق الاستراتيجي' },
      icon: Building2
    },
    {
      step: 5,
      title: { en: 'Pilot or R&D', ar: 'تجربة أو بحث وتطوير' },
      desc: { en: 'Approved proposals move to pilot testing or funded R&D projects', ar: 'المقترحات المعتمدة تنتقل إلى تجارب الاختبار أو مشاريع البحث والتطوير الممولة' },
      icon: TestTube
    },
    {
      step: 6,
      title: { en: 'Scale Success', ar: 'توسيع النجاح' },
      desc: { en: 'Successful pilots are scaled across multiple municipalities nationwide', ar: 'التجارب الناجحة يتم توسيعها عبر بلديات متعددة في جميع أنحاء المملكة' },
      icon: Rocket
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: { en: 'Access to Funding', ar: 'الوصول للتمويل' },
      desc: { en: 'Approved proposals may receive funding for pilots and R&D', ar: 'المقترحات المعتمدة قد تحصل على تمويل للتجارب والبحث والتطوير' }
    },
    {
      icon: Building2,
      title: { en: 'Municipality Partnerships', ar: 'شراكات البلديات' },
      desc: { en: 'Direct connections with municipalities seeking solutions', ar: 'اتصالات مباشرة مع البلديات الباحثة عن حلول' }
    },
    {
      icon: BarChart3,
      title: { en: 'Data & Insights', ar: 'البيانات والرؤى' },
      desc: { en: 'Access to municipal data and real-world testing environments', ar: 'الوصول إلى بيانات البلدية وبيئات الاختبار الواقعية' }
    },
    {
      icon: Award,
      title: { en: 'Recognition', ar: 'التقدير' },
      desc: { en: 'Featured in case studies and national innovation reports', ar: 'الظهور في دراسات الحالة وتقارير الابتكار الوطنية' }
    },
    {
      icon: TrendingUp,
      title: { en: 'Scale Nationally', ar: 'التوسع وطنياً' },
      desc: { en: 'Successful solutions deployed across Saudi Arabia', ar: 'نشر الحلول الناجحة في جميع أنحاء المملكة العربية السعودية' }
    },
    {
      icon: Users,
      title: { en: 'Expert Mentorship', ar: 'إرشاد الخبراء' },
      desc: { en: 'Guidance from domain experts and innovation specialists', ar: 'توجيه من خبراء المجال ومتخصصي الابتكار' }
    }
  ];

  const whoCanApply = [
    { en: 'Tech Startups', ar: 'الشركات الناشئة التقنية' },
    { en: 'Research Institutions', ar: 'المؤسسات البحثية' },
    { en: 'University Labs', ar: 'مختبرات الجامعات' },
    { en: 'Social Enterprises', ar: 'المؤسسات الاجتماعية' },
    { en: 'Independent Innovators', ar: 'المبتكرون المستقلون' },
    { en: 'Corporate R&D Teams', ar: 'فرق البحث والتطوير في الشركات' }
  ];

  return (
    <>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zNHY2aC02VjBoNnptLTYgMzR2Nmg2djZoLTZ2LTZoLTZ2LTZoNnptLTYgMHYtNmg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-white/20 text-white border-0 mb-6">
              <Rocket className="h-4 w-4 mr-2" />
              {t({ en: 'Innovation Proposals Program', ar: 'برنامج المقترحات الابتكارية' })}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t({ en: 'Turn Your Innovation', ar: 'حوّل ابتكارك' })}
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                {t({ en: 'Into Reality', ar: 'إلى واقع' })}
              </span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
              {t({ 
                en: 'Submit structured innovation proposals, access funding, and partner with municipalities to pilot and scale your solutions across Saudi Arabia.',
                ar: 'قدم مقترحات ابتكارية منظمة، واحصل على التمويل، وشارك البلديات لتجربة وتوسيع حلولك في جميع أنحاء المملكة العربية السعودية.'
              })}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 shadow-xl px-8">
                  <FileText className="h-5 w-5 mr-2" />
                  {t({ en: 'Submit a Proposal', ar: 'تقديم مقترح' })}
                </Button>
              </Link>
              <Link to="/public-challenges">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8">
                  <Target className="h-5 w-5 mr-2" />
                  {t({ en: 'View Open Challenges', ar: 'عرض التحديات المفتوحة' })}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Difference from Citizen Ideas */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {t({ en: 'More Than Just Ideas', ar: 'أكثر من مجرد أفكار' })}
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                {t({ 
                  en: 'While our Citizen Participation platform welcomes quick ideas from everyone, the Innovation Proposals program is designed for serious innovators with structured, actionable proposals.',
                  ar: 'بينما ترحب منصة المشاركة المجتمعية بالأفكار السريعة من الجميع، فإن برنامج المقترحات الابتكارية مصمم للمبتكرين الجادين بمقترحات منظمة وقابلة للتنفيذ.'
                })}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t({ en: 'Structured Format', ar: 'صيغة منظمة' })}</p>
                    <p className="text-sm text-slate-600">{t({ en: 'Detailed proposals with budget, timeline, and team info', ar: 'مقترحات مفصلة مع الميزانية والجدول الزمني ومعلومات الفريق' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t({ en: 'Expert Evaluation', ar: 'تقييم الخبراء' })}</p>
                    <p className="text-sm text-slate-600">{t({ en: 'Multi-gate review by domain experts and AI screening', ar: 'مراجعة متعددة البوابات من خبراء المجال والفرز بالذكاء الاصطناعي' })}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900">{t({ en: 'Path to Implementation', ar: 'مسار للتنفيذ' })}</p>
                    <p className="text-sm text-slate-600">{t({ en: 'Approved proposals convert to funded pilots or R&D projects', ar: 'المقترحات المعتمدة تتحول إلى تجارب أو مشاريع بحث وتطوير ممولة' })}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium text-slate-500">{t({ en: 'Feature', ar: 'الميزة' })}</th>
                    <th className="text-center py-3 font-medium text-slate-500">{t({ en: 'Citizen Ideas', ar: 'أفكار المواطنين' })}</th>
                    <th className="text-center py-3 font-medium text-purple-600">{t({ en: 'Innovation Proposals', ar: 'المقترحات الابتكارية' })}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  <tr className="border-b">
                    <td className="py-3">{t({ en: 'Audience', ar: 'الجمهور' })}</td>
                    <td className="text-center py-3">{t({ en: 'Anyone', ar: 'الجميع' })}</td>
                    <td className="text-center py-3 text-purple-600 font-medium">{t({ en: 'Startups/Researchers', ar: 'الشركات/الباحثون' })}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">{t({ en: 'Format', ar: 'الشكل' })}</td>
                    <td className="text-center py-3">{t({ en: 'Simple form', ar: 'نموذج بسيط' })}</td>
                    <td className="text-center py-3 text-purple-600 font-medium">{t({ en: 'Structured proposal', ar: 'مقترح منظم' })}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">{t({ en: 'Evaluation', ar: 'التقييم' })}</td>
                    <td className="text-center py-3">{t({ en: 'Voting', ar: 'التصويت' })}</td>
                    <td className="text-center py-3 text-purple-600 font-medium">{t({ en: 'Expert + AI review', ar: 'مراجعة خبراء + ذكاء اصطناعي' })}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">{t({ en: 'Funding', ar: 'التمويل' })}</td>
                    <td className="text-center py-3">—</td>
                    <td className="text-center py-3 text-purple-600 font-medium">✓</td>
                  </tr>
                  <tr>
                    <td className="py-3">{t({ en: 'Outcome', ar: 'النتيجة' })}</td>
                    <td className="text-center py-3">{t({ en: 'Convert to proposal', ar: 'تحويل لمقترح' })}</td>
                    <td className="text-center py-3 text-purple-600 font-medium">{t({ en: 'Pilot / R&D Project', ar: 'تجربة / مشروع بحثي' })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Proposal Types */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'Types of Proposals', ar: 'أنواع المقترحات' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'Submit proposals based on your innovation focus', ar: 'قدم مقترحات بناءً على تركيز ابتكارك' })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {proposalTypes.map((item, idx) => (
              <Card key={idx} className={`hover:shadow-lg transition-all border-t-4 border-${item.color}-500`}>
                <CardContent className="pt-6">
                  <item.icon className={`h-10 w-10 text-${item.color}-600 mb-4`} />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{t(item.type)}</h3>
                  <p className="text-sm text-slate-600">{t(item.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Journey */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'Your Innovation Journey', ar: 'رحلة ابتكارك' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'From idea to nationwide implementation', ar: 'من الفكرة إلى التنفيذ على مستوى المملكة' })}
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 hidden lg:block" style={{ transform: 'translateY(-50%)' }} />
            
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {journeySteps.map((step, idx) => (
                <div key={idx} className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow text-xs font-bold text-indigo-600 flex items-center justify-center">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{t(step.title)}</h3>
                  <p className="text-xs text-slate-600">{t(step.desc)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 lg:p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t({ en: 'Why Submit a Proposal?', ar: 'لماذا تقدم مقترحاً؟' })}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t({ en: 'Benefits for approved innovation proposals', ar: 'فوائد المقترحات الابتكارية المعتمدة' })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-colors">
                <benefit.icon className="h-10 w-10 text-yellow-400 mb-4" />
                <h3 className="font-bold text-lg mb-2">{t(benefit.title)}</h3>
                <p className="text-sm text-white/80">{t(benefit.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who Can Apply */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'Who Can Apply?', ar: 'من يمكنه التقديم؟' })}
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {whoCanApply.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-base px-6 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                {t(item)}
              </Badge>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {t({ en: 'Ready to Make an Impact?', ar: 'مستعد لإحداث تأثير؟' })}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {t({ 
              en: 'Join the platform and submit your innovation proposal today',
              ar: 'انضم للمنصة وقدم مقترحك الابتكاري اليوم'
            })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 shadow-xl px-8">
                <Rocket className="h-5 w-5 mr-2" />
                {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8">
                {t({ en: 'Contact Us', ar: 'تواصل معنا' })}
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
