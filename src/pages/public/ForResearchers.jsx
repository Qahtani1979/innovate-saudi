import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../../components/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  Microscope, BookOpen, FileText, CheckCircle2, Users, Building2,
  TrendingUp, Award, ArrowRight, Beaker, BarChart3, Database,
  GraduationCap, Globe, Lightbulb, Target, TestTube, Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForResearchers() {
  const { language, isRTL, t } = useLanguage();

  const researchAreas = [
    {
      icon: Building2,
      area: { en: 'Urban Development', ar: 'التطوير الحضري' },
      desc: { en: 'Smart cities, infrastructure, transportation, and urban planning research', ar: 'المدن الذكية والبنية التحتية والنقل وأبحاث التخطيط الحضري' },
      color: 'blue'
    },
    {
      icon: Globe,
      area: { en: 'Sustainability', ar: 'الاستدامة' },
      desc: { en: 'Environmental solutions, waste management, renewable energy, and green initiatives', ar: 'الحلول البيئية وإدارة النفايات والطاقة المتجددة والمبادرات الخضراء' },
      color: 'green'
    },
    {
      icon: Users,
      area: { en: 'Social Services', ar: 'الخدمات الاجتماعية' },
      desc: { en: 'Healthcare, education, community engagement, and public service delivery', ar: 'الرعاية الصحية والتعليم والمشاركة المجتمعية وتقديم الخدمات العامة' },
      color: 'purple'
    },
    {
      icon: Brain,
      area: { en: 'Digital Transformation', ar: 'التحول الرقمي' },
      desc: { en: 'AI/ML applications, data analytics, e-government, and digital services', ar: 'تطبيقات الذكاء الاصطناعي وتحليل البيانات والحكومة الإلكترونية والخدمات الرقمية' },
      color: 'indigo'
    }
  ];

  const collaborationTypes = [
    {
      icon: FileText,
      title: { en: 'Research Proposals', ar: 'المقترحات البحثية' },
      desc: { en: 'Submit formal research proposals to address identified municipal challenges', ar: 'تقديم مقترحات بحثية رسمية لمعالجة التحديات البلدية المحددة' }
    },
    {
      icon: Database,
      title: { en: 'Data Access', ar: 'الوصول للبيانات' },
      desc: { en: 'Request access to anonymized municipal data for academic research', ar: 'طلب الوصول إلى بيانات البلدية المجهولة للأبحاث الأكاديمية' }
    },
    {
      icon: TestTube,
      title: { en: 'Pilot Partnerships', ar: 'شراكات التجارب' },
      desc: { en: 'Partner with municipalities to test research outcomes in real-world settings', ar: 'الشراكة مع البلديات لاختبار نتائج البحث في بيئات واقعية' }
    },
    {
      icon: GraduationCap,
      title: { en: 'Student Projects', ar: 'مشاريع الطلاب' },
      desc: { en: 'Connect graduate students with municipal challenges for thesis research', ar: 'ربط طلاب الدراسات العليا بالتحديات البلدية لأبحاث الرسائل العلمية' }
    }
  ];

  const benefits = [
    {
      icon: Database,
      title: { en: 'Real-World Data', ar: 'بيانات واقعية' },
      desc: { en: 'Access to municipal datasets and real-world testing environments', ar: 'الوصول إلى مجموعات بيانات البلدية وبيئات الاختبار الواقعية' }
    },
    {
      icon: Building2,
      title: { en: 'Implementation Partners', ar: 'شركاء التنفيذ' },
      desc: { en: 'Direct partnerships with municipalities to implement research outcomes', ar: 'شراكات مباشرة مع البلديات لتنفيذ نتائج البحث' }
    },
    {
      icon: BarChart3,
      title: { en: 'Funding Opportunities', ar: 'فرص التمويل' },
      desc: { en: 'Access to research grants and R&D funding for relevant projects', ar: 'الوصول إلى منح البحث وتمويل البحث والتطوير للمشاريع ذات الصلة' }
    },
    {
      icon: Award,
      title: { en: 'Publication Support', ar: 'دعم النشر' },
      desc: { en: 'Co-authorship opportunities and access to unique case studies', ar: 'فرص التأليف المشترك والوصول إلى دراسات حالة فريدة' }
    },
    {
      icon: TrendingUp,
      title: { en: 'Societal Impact', ar: 'الأثر المجتمعي' },
      desc: { en: 'See your research translate into real improvements in citizens\' lives', ar: 'شاهد بحثك يتحول إلى تحسينات حقيقية في حياة المواطنين' }
    },
    {
      icon: Users,
      title: { en: 'Network Access', ar: 'الوصول للشبكة' },
      desc: { en: 'Connect with other researchers, practitioners, and policymakers', ar: 'التواصل مع باحثين وممارسين وصانعي سياسات آخرين' }
    }
  ];

  const journeySteps = [
    {
      step: 1,
      title: { en: 'Explore Challenges', ar: 'استكشف التحديات' },
      desc: { en: 'Browse our challenges database to identify research opportunities', ar: 'تصفح قاعدة بيانات التحديات لتحديد فرص البحث' },
      icon: Target
    },
    {
      step: 2,
      title: { en: 'Submit Proposal', ar: 'قدم المقترح' },
      desc: { en: 'Create a structured research proposal with methodology and timeline', ar: 'إنشاء مقترح بحثي منظم مع المنهجية والجدول الزمني' },
      icon: FileText
    },
    {
      step: 3,
      title: { en: 'Expert Review', ar: 'مراجعة الخبراء' },
      desc: { en: 'Your proposal is evaluated by domain experts and academic advisors', ar: 'يتم تقييم مقترحك من قبل خبراء المجال والمستشارين الأكاديميين' },
      icon: Users
    },
    {
      step: 4,
      title: { en: 'Municipality Match', ar: 'مطابقة البلدية' },
      desc: { en: 'Get matched with municipalities interested in your research area', ar: 'يتم مطابقتك مع البلديات المهتمة بمجال بحثك' },
      icon: Building2
    },
    {
      step: 5,
      title: { en: 'Conduct Research', ar: 'إجراء البحث' },
      desc: { en: 'Execute your research with access to data and resources', ar: 'نفذ بحثك مع الوصول إلى البيانات والموارد' },
      icon: Microscope
    },
    {
      step: 6,
      title: { en: 'Publish & Impact', ar: 'النشر والأثر' },
      desc: { en: 'Share findings and see them implemented in municipal services', ar: 'شارك النتائج وشاهدها تُنفذ في الخدمات البلدية' },
      icon: BookOpen
    }
  ];

  const eligibleInstitutions = [
    { en: 'Universities', ar: 'الجامعات' },
    { en: 'Research Centers', ar: 'مراكز البحث' },
    { en: 'Think Tanks', ar: 'مراكز الفكر' },
    { en: 'Academic Labs', ar: 'المختبرات الأكاديمية' },
    { en: 'PhD Researchers', ar: 'باحثو الدكتوراه' },
    { en: 'Post-doc Fellows', ar: 'زملاء ما بعد الدكتوراه' }
  ];

  return (
    <>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zNHY2aC02VjBoNnptLTYgMzR2Nmg2djZoLTZ2LTZoLTZ2LTZoNnptLTYgMHYtNmg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-white/20 text-white border-0 mb-6">
              <Microscope className="h-4 w-4 mr-2" />
              {t({ en: 'Research Collaboration Program', ar: 'برنامج التعاون البحثي' })}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t({ en: 'Research That', ar: 'بحث يُحدث' })}
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-amber-400 bg-clip-text text-transparent">
                {t({ en: 'Transforms Cities', ar: 'تحولاً في المدن' })}
              </span>
            </h1>
            
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-10">
              {t({ 
                en: 'Partner with Saudi municipalities to conduct impactful research. Access real-world data, funding opportunities, and see your findings implemented at scale.',
                ar: 'شارك البلديات السعودية في إجراء أبحاث مؤثرة. احصل على بيانات واقعية وفرص تمويل وشاهد نتائجك تُنفذ على نطاق واسع.'
              })}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 shadow-xl px-8">
                  <FileText className="h-5 w-5 mr-2" />
                  {t({ en: 'Submit Research Proposal', ar: 'تقديم مقترح بحثي' })}
                </Button>
              </Link>
              <Link to="/public-challenges">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8">
                  <Target className="h-5 w-5 mr-2" />
                  {t({ en: 'Explore Challenges', ar: 'استكشف التحديات' })}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Research Areas */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'Priority Research Areas', ar: 'مجالات البحث ذات الأولوية' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'Focus areas where research can drive municipal innovation', ar: 'مجالات التركيز حيث يمكن للبحث أن يدفع الابتكار البلدي' })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchAreas.map((item, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all border-t-4 border-teal-500 bg-gradient-to-br from-white to-slate-50">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center mb-4`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{t(item.area)}</h3>
                  <p className="text-sm text-slate-600">{t(item.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Collaboration Types */}
        <section className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'Ways to Collaborate', ar: 'طرق التعاون' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'Multiple pathways to engage with municipal innovation', ar: 'مسارات متعددة للمشاركة في الابتكار البلدي' })}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {collaborationTypes.map((item, idx) => (
              <Card key={idx} className="bg-white hover:shadow-lg transition-all">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{t(item.title)}</h3>
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
              {t({ en: 'Research Partnership Journey', ar: 'رحلة الشراكة البحثية' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'From proposal to real-world impact', ar: 'من المقترح إلى الأثر الواقعي' })}
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200 hidden lg:block" style={{ transform: 'translateY(-50%)' }} />
            
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {journeySteps.map((step, idx) => (
                <div key={idx} className="relative text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg relative z-10">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white shadow text-xs font-bold text-teal-600 flex items-center justify-center">
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
        <section className="bg-gradient-to-br from-slate-900 to-teal-900 rounded-3xl p-8 lg:p-12 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {t({ en: 'Benefits for Researchers', ar: 'المزايا للباحثين' })}
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {t({ en: 'Why researchers choose to partner with us', ar: 'لماذا يختار الباحثون الشراكة معنا' })}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6 hover:bg-white/15 transition-all">
                <item.icon className="h-10 w-10 text-teal-300 mb-4" />
                <h3 className="font-bold text-lg mb-2">{t(item.title)}</h3>
                <p className="text-white/70 text-sm">{t(item.desc)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who Can Apply */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'Eligible Institutions', ar: 'المؤسسات المؤهلة' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'Who can participate in our research programs', ar: 'من يمكنه المشاركة في برامجنا البحثية' })}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {eligibleInstitutions.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="px-6 py-3 text-base bg-teal-50 text-teal-700 hover:bg-teal-100">
                <GraduationCap className="h-4 w-4 mr-2" />
                {t(item)}
              </Badge>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t({ en: 'Ready to Make an Impact?', ar: 'جاهز لإحداث أثر؟' })}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t({ 
              en: 'Join our network of researchers working on real municipal challenges across Saudi Arabia.',
              ar: 'انضم إلى شبكتنا من الباحثين العاملين على تحديات بلدية حقيقية في جميع أنحاء المملكة العربية السعودية.'
            })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-teal-600 hover:bg-white/90 shadow-xl">
                <FileText className="h-5 w-5 mr-2" />
                {t({ en: 'Submit a Proposal', ar: 'تقديم مقترح' })}
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                {t({ en: 'Contact Research Team', ar: 'تواصل مع فريق البحث' })}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}