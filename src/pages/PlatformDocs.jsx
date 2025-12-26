import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Search, Sparkles, LayoutDashboard, Target, Network, 
  AlertCircle, Lightbulb, TestTube, Microscope, Calendar, TrendingUp,
  BarChart3, Users, Shield, Settings, CheckCircle, CheckCircle2, Rocket,
  Activity, FileText, Zap, RefreshCw, Beaker,
  Building2, Upload, Bell, Globe
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PlatformDocs() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: { en: 'Platform Overview', ar: 'نظرة عامة على المنصة' }, icon: BookOpen },
    { id: 'dashboard', label: { en: 'Dashboards', ar: 'لوحات التحكم' }, icon: LayoutDashboard },
    { id: 'mywork', label: { en: 'My Work', ar: 'عملي' }, icon: Users },
    { id: 'pipeline', label: { en: 'Innovation Pipeline', ar: 'خط الابتكار' }, icon: Zap },
    { id: 'programs', label: { en: 'Programs & R&D', ar: 'البرامج والبحث' }, icon: Calendar },
    { id: 'insights', label: { en: 'Insights & Resources', ar: 'الرؤى والموارد' }, icon: TrendingUp },
    { id: 'portals', label: { en: 'Portals', ar: 'البوابات' }, icon: Globe },
    { id: 'management', label: { en: 'Management', ar: 'الإدارة' }, icon: Settings },
    { id: 'advanced', label: { en: 'Advanced Tools', ar: 'الأدوات المتقدمة' }, icon: Sparkles },
    { id: 'pilot-journey', label: { en: 'Pilot Journey', ar: 'رحلة التجربة' }, icon: Rocket },
    { id: 'challenge-journey', label: { en: 'Challenge Journey', ar: 'رحلة التحدي' }, icon: AlertCircle }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="h-12 w-12" />
            <div>
              <h1 className="text-5xl font-bold">
                {t({ en: 'Platform Documentation', ar: 'توثيق المنصة' })}
              </h1>
              <p className="text-xl text-white/90 mt-2">
                {t({ en: 'Saudi Innovates - Complete User Guide', ar: 'الابتكار السعودي - دليل المستخدم الكامل' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search documentation...', ar: 'ابحث في التوثيق...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10' : 'pl-10'}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-lg'}`}
              onClick={() => setActiveSection(section.id)}
            >
              <CardContent className="pt-6 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${isActive ? 'text-blue-600' : 'text-slate-600'}`} />
                <p className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-slate-900'}`}>
                  {t(section.label)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content */}
      <Card>
        <CardContent className="pt-6">
          {/* PLATFORM OVERVIEW */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3">
                {t({ en: 'Platform Overview', ar: 'نظرة عامة على المنصة' })}
              </h2>
              
              <div className="prose max-w-none">
                <p className="text-lg text-slate-700 leading-relaxed">
                  {t({ 
                    en: 'Saudi Innovates is the National Municipal Innovation Platform, connecting challenges, solutions, pilots, R&D, and scaling across all Saudi municipalities.',
                    ar: 'الابتكار السعودي هي المنصة الوطنية للابتكار البلدي، تربط التحديات والحلول والتجارب والبحث والتوسع عبر جميع البلديات السعودية.'
                  })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-2">{t({ en: 'Core Mission', ar: 'المهمة الأساسية' })}</h3>
                  <p className="text-sm text-slate-700">
                    {t({ 
                      en: 'Accelerate municipal innovation through systematic challenge-solution-pilot-scale workflows with AI assistance.',
                      ar: 'تسريع الابتكار البلدي من خلال سير عمل منهجي للتحدي-الحل-التجربة-التوسع مع مساعدة الذكاء الاصطناعي.'
                    })}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-900 mb-2">{t({ en: 'Key Users', ar: 'المستخدمون الرئيسيون' })}</h3>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Municipalities & Agencies</li>
                    <li>• Solution Providers & Startups</li>
                    <li>• Academia & Researchers</li>
                    <li>• Platform Administrators</li>
                  </ul>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-bold text-purple-900 mb-2">{t({ en: 'AI Features', ar: 'ميزات الذكاء الاصطناعي' })}</h3>
                  <p className="text-sm text-slate-700">
                    {t({ 
                      en: '40+ AI features embedded across the platform for design, analysis, prediction, and optimization.',
                      ar: '40+ ميزة ذكاء اصطناعي مدمجة عبر المنصة للتصميم والتحليل والتنبؤ والتحسين.'
                    })}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">{t({ en: 'Platform Stats', ar: 'إحصائيات المنصة' })}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-4xl font-bold">11</p>
                    <p className="text-sm">{t({ en: 'Pilot Stages', ar: 'مراحل التجربة' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">40+</p>
                    <p className="text-sm">{t({ en: 'Pages', ar: 'صفحة' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">15+</p>
                    <p className="text-sm">{t({ en: 'AI Features', ar: 'ميزة ذكية' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">7</p>
                    <p className="text-sm">{t({ en: 'Portals', ar: 'بوابة' })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARDS */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                {t({ en: 'Dashboards', ar: 'لوحات التحكم' })}
              </h2>

              {[
                { 
                  name: { en: 'Home', ar: 'الرئيسية' }, 
                  icon: LayoutDashboard,
                  desc: { en: 'Main dashboard with KPIs, quick actions, and activity feed', ar: 'لوحة التحكم الرئيسية مع مؤشرات الأداء والإجراءات السريعة وتدفق النشاط' },
                  features: { en: ['KPI tiles', 'Activity feed', 'Quick actions', 'Notifications'], ar: ['بلاطات المؤشرات', 'تدفق النشاط', 'إجراءات سريعة', 'الإشعارات'] }
                },
                { 
                  name: { en: 'Executive Dashboard', ar: 'لوحة القيادة' }, 
                  icon: Target,
                  desc: { en: 'Leadership view with national KPIs and strategic insights', ar: 'عرض القيادة مع مؤشرات الأداء الوطنية والرؤى الاستراتيجية' },
                  features: { en: ['National KPIs', 'MII scores', 'Sector analytics', 'AI insights'], ar: ['مؤشرات وطنية', 'درجات المؤشر', 'تحليلات القطاع', 'رؤى ذكية'] }
                },
                { 
                  name: { en: 'Strategy Cockpit', ar: 'قمرة الاستراتيجية' }, 
                  icon: Target,
                  desc: { en: 'Strategic planning and portfolio management', ar: 'التخطيط الاستراتيجي وإدارة المحفظة' },
                  features: { en: ['Innovation roadmap', 'Portfolio heatmap', 'Capacity metrics', 'AI recommendations'], ar: ['خريطة الابتكار', 'خريطة المحفظة', 'مقاييس القدرة', 'توصيات ذكية'] }
                },
                { 
                  name: { en: 'Portfolio', ar: 'المحفظة' }, 
                  icon: Network,
                  desc: { en: 'Cross-entity portfolio view with relationships', ar: 'عرض المحفظة عبر الكيانات مع العلاقات' },
                  features: { en: ['Entity relationships', 'Portfolio analytics', 'Dependencies map', 'Health scores'], ar: ['علاقات الكيانات', 'تحليلات المحفظة', 'خريطة التبعيات', 'درجات الصحة'] }
                }
              ].map((dashboard, idx) => {
                const Icon = dashboard.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-50 rounded-lg border-l-4 border-l-blue-600">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t(dashboard.name)}</h3>
                        <p className="text-sm text-slate-700 mb-3">{t(dashboard.desc)}</p>
                        <div className="flex flex-wrap gap-2">
                          {dashboard.features[language].map((feature, i) => (
                            <Badge key={i} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MY WORK */}
          {activeSection === 'mywork' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Users className="h-8 w-8 text-purple-600" />
                {t({ en: 'My Work', ar: 'عملي' })}
              </h2>

              {[
                { 
                  name: { en: 'My Challenges', ar: 'تحدياتي' }, 
                  desc: { en: 'View and manage challenges you created or are assigned to', ar: 'عرض وإدارة التحديات التي أنشأتها أو تم تعيينك لها' },
                  ai: { en: ['Challenge refinement', 'Similar challenges finder', 'Track suggestion'], ar: ['تحسين التحدي', 'مكتشف التحديات المشابهة', 'اقتراح المسار'] },
                  actions: { en: ['Create', 'Edit', 'Track status', 'View activity'], ar: ['إنشاء', 'تعديل', 'تتبع الحالة', 'عرض النشاط'] }
                },
                { 
                  name: { en: 'My Pilots', ar: 'تجاربي' }, 
                  desc: { en: 'Track pilots you are managing or participating in', ar: 'تتبع التجارب التي تديرها أو تشارك فيها' },
                  ai: { en: ['Success predictor', 'KPI analyzer', 'Risk alerts'], ar: ['متنبئ النجاح', 'محلل المؤشرات', 'تنبيهات المخاطر'] },
                  actions: { en: ['Monitor KPIs', 'Update data', 'Report issues', 'Launch/pause'], ar: ['مراقبة المؤشرات', 'تحديث البيانات', 'الإبلاغ عن مشاكل', 'إطلاق/إيقاف'] }
                },
                { 
                  name: { en: 'Pilot Evaluations', ar: 'تقييمات التجارب' }, 
                  desc: { en: 'Evaluate completed pilots and generate recommendations', ar: 'تقييم التجارب المكتملة وإنشاء التوصيات' },
                  ai: { en: ['Comprehensive evaluation generator', 'Peer comparison', 'Recommendation AI'], ar: ['مولد تقييم شامل', 'مقارنة النظراء', 'ذكاء التوصيات'] },
                  actions: { en: ['Generate evaluation', 'Submit recommendation', 'Export report'], ar: ['إنشاء تقييم', 'تقديم توصية', 'تصدير تقرير'] }
                },
                { 
                  name: { en: 'Opportunity Feed', ar: 'تدفق الفرص' }, 
                  desc: { en: 'Personalized opportunities based on your profile and interests', ar: 'الفرص الشخصية بناءً على ملفك الشخصي واهتماماتك' },
                  ai: { en: ['Opportunity matching', 'Relevance scoring', 'Trend alerts'], ar: ['مطابقة الفرص', 'تسجيل الملاءمة', 'تنبيهات الاتجاه'] },
                  actions: { en: ['View opportunities', 'Apply', 'Save', 'Get notified'], ar: ['عرض الفرص', 'التقديم', 'حفظ', 'تلقي إشعارات'] }
                },
                { 
                  name: { en: 'My Tasks', ar: 'مهامي' }, 
                  desc: { en: 'Task management with assignments and deadlines', ar: 'إدارة المهام مع المهام والمواعيد النهائية' },
                  ai: { en: ['Task prioritization', 'Deadline alerts', 'Auto-assignment'], ar: ['تحديد أولوية المهام', 'تنبيهات المواعيد', 'التعيين التلقائي'] },
                  actions: { en: ['Create tasks', 'Assign', 'Track progress', 'Complete'], ar: ['إنشاء مهام', 'تعيين', 'تتبع التقدم', 'إكمال'] }
                },
                { 
                  name: { en: 'Messages', ar: 'الرسائل' }, 
                  desc: { en: 'Communication hub for collaboration', ar: 'مركز الاتصالات للتعاون' },
                  ai: { en: ['Smart compose', 'Auto-translate', 'Priority detection'], ar: ['الكتابة الذكية', 'الترجمة التلقائية', 'كشف الأولوية'] },
                  actions: { en: ['Send message', 'Create thread', 'Mention users', 'Attach files'], ar: ['إرسال رسالة', 'إنشاء محادثة', 'ذكر المستخدمين', 'إرفاق ملفات'] }
                }
              ].map((page, idx) => (
                <div key={idx} className="p-5 bg-white rounded-lg border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-2">{t(page.name)}</h3>
                <p className="text-sm text-slate-700 mb-3">{t(page.desc)}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">{t({ en: 'AI Features:', ar: 'ميزات الذكاء:' })}</p>
                    <ul className="space-y-1 text-slate-600">
                      {page.ai[language].map((ai, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-blue-600" />
                          {ai}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">{t({ en: 'Key Actions:', ar: 'الإجراءات الرئيسية:' })}</p>
                    <div className="flex flex-wrap gap-1">
                      {page.actions[language].map((action, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              ))}
            </div>
          )}

          {/* INNOVATION PIPELINE */}
          {activeSection === 'pipeline' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Zap className="h-8 w-8 text-blue-600" />
                {t({ en: 'Innovation Pipeline', ar: 'خط الابتكار' })}
              </h2>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-300">
                <h3 className="text-xl font-bold text-blue-900 mb-3">Pipeline Flow</h3>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 overflow-x-auto">
                  <Badge className="bg-blue-600">Challenges</Badge>
                  <span>→</span>
                  <Badge className="bg-purple-600">Solutions</Badge>
                  <span>→</span>
                  <Badge className="bg-green-600">Pilots</Badge>
                  <span>→</span>
                  <Badge className="bg-teal-600">Scaled</Badge>
                </div>
              </div>

              {[
                { 
                  name: { en: 'All Challenges', ar: 'جميع التحديات' }, 
                  icon: AlertCircle,
                  desc: { en: 'Master list of municipal challenges with filtering and AI matching', ar: 'القائمة الرئيسية للتحديات البلدية مع التصفية والمطابقة الذكية' },
                  ai: { en: ['Semantic search', 'Challenge clustering', 'Priority scoring', 'Solution matching'], ar: ['بحث دلالي', 'تجميع التحديات', 'تسجيل الأولوية', 'مطابقة الحلول'] },
                  features: { en: ['Advanced filters', 'Bulk import', 'Export', 'Track assignment'], ar: ['مرشحات متقدمة', 'استيراد جماعي', 'تصدير', 'تعيين المسار'] }
                },
                { 
                  name: { en: 'Solutions', ar: 'الحلول' }, 
                  icon: Lightbulb,
                  desc: { en: 'Solution registry with provider profiles and case studies', ar: 'سجل الحلول مع ملفات تعريف المزودين ودراسات الحالة' },
                  ai: { en: ['Solution recommender', 'Maturity assessment', 'Success predictor', 'Pricing optimizer'], ar: ['موصي الحلول', 'تقييم النضج', 'متنبئ النجاح', 'محسن الأسعار'] },
                  features: { en: ['Provider profiles', 'Case studies', 'Ratings', 'Verification'], ar: ['ملفات المزودين', 'دراسات الحالة', 'التقييمات', 'التحقق'] }
                },
                { 
                  name: { en: 'All Pilots', ar: 'جميع التجارب' }, 
                  icon: TestTube,
                  desc: { en: 'Complete pilot registry with multiple views (table/grid/kanban)', ar: 'سجل التجارب الكامل مع عروض متعددة' },
                  ai: { en: ['Success predictor', 'Risk analyzer', 'Peer comparison', 'Anomaly detection'], ar: ['متنبئ النجاح', 'محلل المخاطر', 'مقارنة النظراء', 'كشف الشذوذ'] },
                  features: { en: ['Multi-view', 'Timeline', 'KPI tracking', 'Export'], ar: ['عروض متعددة', 'الجدول الزمني', 'تتبع المؤشرات', 'تصدير'] }
                },
                { 
                  name: { en: 'Live Monitoring', ar: 'المراقبة المباشرة' }, 
                  icon: Activity,
                  desc: { en: 'Real-time monitoring dashboard for active pilots', ar: 'لوحة مراقبة فورية للتجارب النشطة' },
                  ai: { en: ['Real-time alerts', 'KPI forecasting', 'Performance insights'], ar: ['تنبيهات فورية', 'توقع المؤشرات', 'رؤى الأداء'] },
                  features: { en: ['KPI trends', 'Alerts', 'Milestone tracker', 'Live charts'], ar: ['اتجاهات المؤشرات', 'تنبيهات', 'متتبع المعالم', 'مخططات حية'] }
                },
                { 
                  name: { en: 'Launch Wizard', ar: 'معالج الإطلاق' }, 
                  icon: Rocket,
                  desc: { en: 'Guided launch preparation with readiness checklist', ar: 'إعداد الإطلاق الموجه مع قائمة الجاهزية' },
                  ai: { en: ['Readiness checklist generator', 'Risk assessment', 'Timeline optimizer'], ar: ['مولد قائمة الجاهزية', 'تقييم المخاطر', 'محسن الجدول الزمني'] },
                  features: { en: ['8-item checklist', 'AI suggestions', 'Launch date config'], ar: ['قائمة 8 عناصر', 'اقتراحات ذكية', 'تكوين تاريخ الإطلاق'] }
                },
                { 
                  name: { en: 'Iterations', ar: 'التحسينات' }, 
                  icon: RefreshCw,
                  desc: { en: 'Guided improvement workflow for pilots needing refinement', ar: 'سير عمل تحسين موجه للتجارب التي تحتاج إلى تحسين' },
                  ai: { en: ['Iteration planner', 'Issue analyzer', 'Improvement suggester'], ar: ['مخطط التحسين', 'محلل المشاكل', 'مقترح التحسينات'] },
                  features: { en: ['AI iteration plan', 'Redesign guide', 'KPI revision'], ar: ['خطة تحسين ذكية', 'دليل إعادة التصميم', 'مراجعة المؤشرات'] }
                },
                { 
                  name: { en: 'Sandboxes', ar: 'مناطق التجريب' }, 
                  icon: Shield,
                  desc: { en: 'Regulatory sandbox management for innovation testing', ar: 'إدارة منطقة التجريب التنظيمية لاختبار الابتكار' },
                  ai: { en: ['Exemption suggester', 'Risk assessment', 'Compliance checker'], ar: ['مقترح الاستثناءات', 'تقييم المخاطر', 'مدقق الامتثال'] },
                  features: { en: ['Zone mapping', 'Regulatory tracking', 'Applications', 'Incidents'], ar: ['رسم المناطق', 'تتبع التنظيمات', 'الطلبات', 'الحوادث'] }
                },
                { 
                  name: { en: 'Sandbox Reports', ar: 'تقارير المناطق' }, 
                  icon: BarChart3,
                  desc: { en: 'Analytics and reporting for sandbox programs', ar: 'التحليلات والتقارير لبرامج منطقة التجريب' },
                  ai: { en: ['Impact analyzer', 'Trend detection', 'Recommendation engine'], ar: ['محلل التأثير', 'كشف الاتجاهات', 'محرك التوصيات'] },
                  features: { en: ['Performance reports', 'Compliance status', 'Export'], ar: ['تقارير الأداء', 'حالة الامتثال', 'تصدير'] }
                },
                { 
                  name: { en: 'Living Labs', ar: 'المختبرات الحية' }, 
                  icon: Beaker,
                  desc: { en: 'Physical testbed facilities for pilot testing', ar: 'مرافق الاختبار الفعلية لاختبار التجارب' },
                  ai: { en: ['Resource optimizer', 'Capacity predictor', 'Booking suggester'], ar: ['محسن الموارد', 'متنبئ القدرة', 'مقترح الحجز'] },
                  features: { en: ['Resource booking', 'Equipment catalog', 'Availability', 'Usage stats'], ar: ['حجز الموارد', 'كتالوج المعدات', 'التوفر', 'إحصائيات الاستخدام'] }
                }
              ].map((page, idx) => {
                const Icon = page.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-50 rounded-lg border-l-4 border-l-blue-600">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t(page.name)}</h3>
                        <p className="text-sm text-slate-700 mb-3">{t(page.desc)}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-slate-900 mb-2">{t({ en: 'AI Features:', ar: 'ميزات الذكاء:' })}</p>
                            <ul className="space-y-1 text-slate-600">
                              {page.ai[language].map((ai, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <Sparkles className="h-3 w-3 text-blue-600" />
                                  {ai}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 mb-2">{t({ en: 'Features:', ar: 'الميزات:' })}</p>
                            <div className="flex flex-wrap gap-1">
                              {page.features[language].map((f, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PROGRAMS & R&D */}
          {activeSection === 'programs' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Calendar className="h-8 w-8 text-green-600" />
                {t({ en: 'Programs & R&D', ar: 'البرامج والبحث' })}
              </h2>

              {[
                { 
                  name: { en: 'Programs', ar: 'البرامج' }, 
                  desc: { en: 'Accelerators, incubators, hackathons, and training programs', ar: 'المسرعات والحاضنات والهاكاثونات وبرامج التدريب' },
                  types: { en: ['Accelerator', 'Incubator', 'Hackathon', 'Challenge', 'Fellowship', 'Training', 'Matchmaker'], ar: ['مسرع', 'حاضنة', 'هاكاثون', 'تحدي', 'زمالة', 'تدريب', 'مطابق'] },
                  ai: { en: ['Participant matching', 'Success predictor', 'Curriculum optimizer'], ar: ['مطابقة المشاركين', 'متنبئ النجاح', 'محسن المنهج'] }
                },
                { 
                  name: { en: 'R&D Projects', ar: 'مشاريع البحث' }, 
                  desc: { en: 'Research and development projects linked to challenges', ar: 'مشاريع البحث والتطوير المرتبطة بالتحديات' },
                  types: { en: ['Basic research', 'Applied research', 'Feasibility study', 'Prototype development'], ar: ['بحث أساسي', 'بحث تطبيقي', 'دراسة جدوى', 'تطوير نموذج'] },
                  ai: { en: ['R&D gap analyzer', 'TRL tracker', 'Output summarizer', 'Pilot connector'], ar: ['محلل فجوات البحث', 'متتبع الجاهزية', 'ملخص المخرجات', 'موصل التجارب'] }
                },
                { 
                  name: { en: 'R&D Calls', ar: 'دعوات البحث' }, 
                  desc: { en: 'Open calls for research proposals', ar: 'دعوات مفتوحة لمقترحات البحث' },
                  types: { en: ['Open call', 'Targeted call', 'Challenge-based call'], ar: ['دعوة مفتوحة', 'دعوة موجهة', 'دعوة قائمة على تحدي'] },
                  ai: { en: ['Call generator', 'Proposal evaluator', 'Budget optimizer'], ar: ['مولد الدعوات', 'مقيم المقترحات', 'محسن الميزانية'] }
                }
              ].map((page, idx) => (
                <div key={idx} className="p-5 bg-white rounded-lg border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-2">{t(page.name)}</h3>
                  <p className="text-sm text-slate-700 mb-3">{t(page.desc)}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900 mb-2">{t({ en: 'Types:', ar: 'الأنواع:' })}</p>
                      <div className="flex flex-wrap gap-1">
                        {page.types[language].map((type, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 mb-2">{t({ en: 'AI Features:', ar: 'ميزات الذكاء:' })}</p>
                      <ul className="space-y-1 text-slate-600">
                        {page.ai[language].map((ai, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Sparkles className="h-3 w-3 text-blue-600" />
                            {ai}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INSIGHTS & RESOURCES */}
          {activeSection === 'insights' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-amber-600" />
                {t({ en: 'Insights & Resources', ar: 'الرؤى والموارد' })}
              </h2>

              {[
                { 
                  name: { en: 'Sector Analytics', ar: 'تحليلات القطاع' }, 
                  icon: BarChart3,
                  desc: { en: 'Deep dive into sector-specific metrics and trends', ar: 'التعمق في المقاييس والاتجاهات الخاصة بالقطاع' },
                  ai: { en: ['Sector insights', 'Comparative analysis', 'Trend forecasting'], ar: ['رؤى القطاع', 'تحليل مقارن', 'توقع الاتجاهات'] }
                },
                { 
                  name: { en: 'Trends', ar: 'الاتجاهات' }, 
                  icon: TrendingUp,
                  desc: { en: 'Global and national innovation trends', ar: 'اتجاهات الابتكار العالمية والوطنية' },
                  ai: { en: ['Trend detection', 'Impact analysis', 'Relevance scoring'], ar: ['كشف الاتجاهات', 'تحليل التأثير', 'تسجيل الملاءمة'] }
                },
                { 
                  name: { en: 'Innovation Index (MII)', ar: 'مؤشر الابتكار' }, 
                  icon: BarChart3,
                  desc: { en: 'Municipal Innovation Index scoring and rankings', ar: 'تسجيل وترتيب مؤشر الابتكار البلدي' },
                  ai: { en: ['Score calculation', 'Peer comparison', 'Improvement suggestions'], ar: ['حساب النقاط', 'مقارنة النظراء', 'اقتراحات التحسين'] }
                },
                { 
                  name: { en: 'Network', ar: 'الشبكة' }, 
                  icon: Users,
                  desc: { en: 'Stakeholder network and collaboration tools', ar: 'شبكة أصحاب المصلحة وأدوات التعاون' },
                  ai: { en: ['Partner matching', 'Expertise finder', 'Collaboration suggester'], ar: ['مطابقة الشركاء', 'مكتشف الخبرات', 'مقترح التعاون'] }
                },
                { 
                  name: { en: 'Knowledge', ar: 'المعرفة' }, 
                  icon: BookOpen,
                  desc: { en: 'Repository of guides, case studies, and best practices', ar: 'مستودع الأدلة ودراسات الحالة وأفضل الممارسات' },
                  ai: { en: ['Smart search', 'Content recommender', 'Auto-tagging'], ar: ['بحث ذكي', 'موصي المحتوى', 'وسم تلقائي'] }
                },
                { 
                  name: { en: 'Knowledge Graph', ar: 'مخطط المعرفة' }, 
                  icon: Network,
                  desc: { en: 'Visual representation of entity relationships', ar: 'التمثيل المرئي لعلاقات الكيانات' },
                  ai: { en: ['Relationship discovery', 'Pattern detection', 'Gap identification'], ar: ['اكتشاف العلاقات', 'كشف الأنماط', 'تحديد الفجوات'] }
                },
                { 
                  name: { en: 'Reports', ar: 'التقارير' }, 
                  icon: FileText,
                  desc: { en: 'Report builder with templates and automation', ar: 'منشئ التقارير مع القوالب والأتمتة' },
                  ai: { en: ['Report generator', 'Insight extraction', 'Visualization suggester'], ar: ['مولد التقارير', 'استخراج الرؤى', 'مقترح التصور'] }
                },
                { 
                  name: { en: 'Progress', ar: 'التقدم' }, 
                  icon: CheckCircle,
                  desc: { en: 'Track progress across initiatives and strategic goals', ar: 'تتبع التقدم عبر المبادرات والأهداف الاستراتيجية' },
                  ai: { en: ['Progress analyzer', 'Bottleneck detector', 'Forecast generator'], ar: ['محلل التقدم', 'كاشف الاختناقات', 'مولد التوقعات'] }
                }
              ].map((page, idx) => {
                const Icon = page.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-50 rounded-lg border-l-4 border-l-amber-600">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t(page.name)}</h3>
                        <p className="text-sm text-slate-700 mb-3">{t(page.desc)}</p>
                        <div className="flex flex-wrap gap-2">
                          {page.ai[language].map((ai, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-white">
                              <Sparkles className="h-3 w-3 mr-1 text-blue-600" />
                              {ai}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PORTALS */}
          {activeSection === 'portals' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Globe className="h-8 w-8 text-teal-600" />
                {t({ en: 'Portals', ar: 'البوابات' })}
              </h2>

              {[
                { 
                  name: { en: 'Municipality Hub', ar: 'مركز البلدية' }, 
                  icon: Building2,
                  desc: { en: 'Dedicated portal for municipal users to manage challenges and pilots', ar: 'بوابة مخصصة لمستخدمي البلديات لإدارة التحديات والتجارب' },
                  features: { en: ['Local dashboard', 'Challenge CRUD', 'Pilot tracking', 'MII detail', 'Training'], ar: ['لوحة محلية', 'إدارة التحديات', 'تتبع التجارب', 'تفاصيل المؤشر', 'التدريب'] }
                },
                { 
                  name: { en: 'Startup Portal', ar: 'بوابة الشركات' }, 
                  icon: Lightbulb,
                  desc: { en: 'Solution provider portal to discover opportunities and submit proposals', ar: 'بوابة مزودي الحلول لاكتشاف الفرص وتقديم المقترحات' },
                  features: { en: ['Opportunity feed', 'Proposal wizard', 'Solution profile', 'Pilot involvement'], ar: ['تدفق الفرص', 'معالج المقترحات', 'ملف الحل', 'المشاركة في التجارب'] }
                },
                { 
                  name: { en: 'Academia Portal', ar: 'بوابة الجامعات' }, 
                  icon: Microscope,
                  desc: { en: 'Research institution portal for R&D projects and testbeds', ar: 'بوابة المؤسسات البحثية لمشاريع البحث والتطوير' },
                  features: { en: ['R&D calls', 'Project management', 'Publications', 'Testbed booking'], ar: ['دعوات البحث', 'إدارة المشاريع', 'المنشورات', 'حجز المختبرات'] }
                },
                { 
                  name: { en: 'Program Operator', ar: 'مشغل البرامج' }, 
                  icon: Calendar,
                  desc: { en: 'Portal for managing accelerators, incubators, and programs', ar: 'بوابة لإدارة المسرعات والحاضنات والبرامج' },
                  features: { en: ['Program management', 'Applications', 'Evaluations', 'Outcomes tracking'], ar: ['إدارة البرامج', 'الطلبات', 'التقييمات', 'تتبع النتائج'] }
                },
                { 
                  name: { en: 'Admin Portal', ar: 'بوابة الإدارة' }, 
                  icon: Shield,
                  desc: { en: 'Platform administration, user management, and system configuration', ar: 'إدارة المنصة وإدارة المستخدمين وتكوين النظام' },
                  features: { en: ['User management', 'Taxonomy config', 'AI model settings', 'Audit logs'], ar: ['إدارة المستخدمين', 'تكوين التصنيف', 'إعدادات الذكاء', 'سجلات التدقيق'] }
                },
                { 
                  name: { en: 'Public Portal', ar: 'البوابة العامة' }, 
                  icon: Globe,
                  desc: { en: 'Public-facing portal for transparency and community engagement', ar: 'بوابة عامة للشفافية ومشاركة المجتمع' },
                  features: { en: ['Success stories', 'Open data', 'Feedback', 'Newsletter'], ar: ['قصص النجاح', 'بيانات مفتوحة', 'التغذية الراجعة', 'النشرة الإخبارية'] }
                }
              ].map((portal, idx) => {
                const Icon = portal.icon;
                return (
                  <div key={idx} className="p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-300">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-teal-900 mb-2">{t(portal.name)}</h3>
                        <p className="text-sm text-slate-700 mb-3">{t(portal.desc)}</p>
                        <div className="flex flex-wrap gap-2">
                          {portal.features[language].map((f, i) => (
                            <Badge key={i} className="bg-white text-teal-700 border-teal-200">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MANAGEMENT */}
          {activeSection === 'management' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Settings className="h-8 w-8 text-slate-600" />
                {t({ en: 'Management', ar: 'الإدارة' })}
              </h2>

              {[
                { 
                  name: { en: 'Approvals', ar: 'الموافقات' }, 
                  icon: CheckCircle,
                  desc: { en: 'Review and approve challenges, pilots, and proposals', ar: 'مراجعة والموافقة على التحديات والتجارب والمقترحات' },
                  ai: { en: ['AI Decision Brief', 'Risk scoring', 'Readiness assessment'], ar: ['موجز القرار الذكي', 'تسجيل المخاطر', 'تقييم الجاهزية'] }
                },
                { 
                  name: { en: 'Evaluations', ar: 'التقييمات' }, 
                  icon: Award,
                  desc: { en: 'Evaluate pilots, programs, and R&D projects', ar: 'تقييم التجارب والبرامج ومشاريع البحث' },
                  ai: { en: ['Comprehensive evaluation generator', 'Recommendations', 'Lessons learned extractor'], ar: ['مولد تقييم شامل', 'التوصيات', 'مستخرج الدروس المستفادة'] }
                },
                { 
                  name: { en: 'Sandbox Approval', ar: 'موافقات المناطق' }, 
                  icon: Shield,
                  desc: { en: 'Review and approve sandbox applications', ar: 'مراجعة والموافقة على طلبات منطقة التجريب' },
                  ai: { en: ['Risk assessment', 'Exemption validator', 'Safety protocol checker'], ar: ['تقييم المخاطر', 'مدقق الاستثناءات', 'مدقق بروتوكولات السلامة'] }
                },
                { 
                  name: { en: 'Solution Verification', ar: 'التحقق من الحلول' }, 
                  icon: CheckCircle,
                  desc: { en: 'Verify solution providers and their offerings', ar: 'التحقق من مزودي الحلول وعروضهم' },
                  ai: { en: ['Credential validator', 'Reference checker', 'Maturity assessor'], ar: ['مدقق الاعتمادات', 'مدقق المراجع', 'مقيم النضج'] }
                },
                { 
                  name: { en: 'Scaling', ar: 'التوسع' }, 
                  icon: TrendingUp,
                  desc: { en: 'Manage scaling decisions and rollout execution', ar: 'إدارة قرارات التوسع وتنفيذ الانتشار' },
                  ai: { en: ['Impact forecaster', 'Rollout planner', 'Resource optimizer'], ar: ['متنبئ التأثير', 'مخطط الانتشار', 'محسن الموارد'] }
                },
                { 
                  name: { en: 'Calendar', ar: 'التقويم' }, 
                  icon: Calendar,
                  desc: { en: 'Platform-wide calendar for events, deadlines, and milestones', ar: 'تقويم على مستوى المنصة للأحداث والمواعيد النهائية' },
                  ai: { en: ['Smart scheduling', 'Conflict detection', 'Reminder optimization'], ar: ['جدولة ذكية', 'كشف التعارضات', 'تحسين التذكيرات'] }
                },
                { 
                  name: { en: 'Notifications', ar: 'الإشعارات' }, 
                  icon: Bell,
                  desc: { en: 'Notification center with filtering and preferences', ar: 'مركز الإشعارات مع التصفية والتفضيلات' },
                  ai: { en: ['Priority detection', 'Digest generation', 'Action extraction'], ar: ['كشف الأولوية', 'إنشاء الملخص', 'استخراج الإجراءات'] }
                },
                { 
                  name: { en: 'Settings', ar: 'الإعدادات' }, 
                  icon: Settings,
                  desc: { en: 'User preferences, profile, and system settings', ar: 'تفضيلات المستخدم والملف الشخصي وإعدادات النظام' },
                  ai: { en: ['Preference learning', 'Auto-configuration', 'Optimization suggestions'], ar: ['تعلم التفضيلات', 'التكوين التلقائي', 'اقتراحات التحسين'] }
                }
              ].map((page, idx) => {
                const Icon = page.icon;
                return (
                  <div key={idx} className="p-5 bg-slate-50 rounded-lg border-l-4 border-l-slate-600">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-slate-700" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{t(page.name)}</h3>
                        <p className="text-sm text-slate-700 mb-3">{t(page.desc)}</p>
                        <div className="flex flex-wrap gap-2">
                          {page.ai[language].map((ai, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Sparkles className="h-3 w-3 mr-1 text-blue-600" />
                              {ai}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ADVANCED TOOLS */}
          {activeSection === 'advanced' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-purple-600" />
                {t({ en: 'Advanced Tools', ar: 'الأدوات المتقدمة' })}
              </h2>

              {[
                { 
                  name: { en: 'Advanced Search', ar: 'البحث المتقدم' }, 
                  icon: Search,
                  desc: { en: 'Semantic search across all entities with filters', ar: 'بحث دلالي عبر جميع الكيانات مع المرشحات' },
                  features: { en: ['Semantic search', 'Multi-entity', 'Advanced filters', 'Saved searches'], ar: ['بحث دلالي', 'متعدد الكيانات', 'مرشحات متقدمة', 'عمليات بحث محفوظة'] }
                },
                { 
                  name: { en: 'AI Analytics', ar: 'التحليلات الذكية' }, 
                  icon: BarChart3,
                  desc: { en: 'AI-powered predictive analytics and forecasting', ar: 'التحليلات التنبؤية المدعومة بالذكاء الاصطناعي' },
                  features: { en: ['Trend forecasting', 'Impact prediction', 'Risk modeling', 'What-if scenarios'], ar: ['توقع الاتجاهات', 'توقع التأثير', 'نمذجة المخاطر', 'سيناريوهات ماذا لو'] }
                },
                { 
                  name: { en: 'AI Predictions', ar: 'التنبؤات الذكية' }, 
                  icon: Sparkles,
                  desc: { en: 'Success predictions and outcome forecasting', ar: 'تنبؤات النجاح والتنبؤ بالنتائج' },
                  features: { en: ['Success probability', 'Timeline prediction', 'Budget forecasting', 'KPI projection'], ar: ['احتمالية النجاح', 'توقع الجدول الزمني', 'توقع الميزانية', 'إسقاط المؤشرات'] }
                },
                { 
                  name: { en: 'AI Matching', ar: 'المطابقة الذكية' }, 
                  icon: Network,
                  desc: { en: 'AI-powered challenge-solution matching engine', ar: 'محرك مطابقة التحدي-الحل المدعوم بالذكاء الاصطناعي' },
                  features: { en: ['Semantic matching', 'Confidence scoring', 'Batch matching', 'Match explanation'], ar: ['مطابقة دلالية', 'تسجيل الثقة', 'مطابقة جماعية', 'شرح المطابقة'] }
                },
                { 
                  name: { en: 'Bulk Import', ar: 'الاستيراد الجماعي' }, 
                  icon: Upload,
                  desc: { en: 'Import large datasets with AI-powered data extraction', ar: 'استيراد مجموعات البيانات الكبيرة مع استخراج البيانات المدعوم بالذكاء الاصطناعي' },
                  features: { en: ['Excel/CSV import', 'PDF extraction', 'Data validation', 'Auto-mapping'], ar: ['استيراد إكسل/CSV', 'استخراج PDF', 'التحقق من البيانات', 'الربط التلقائي'] }
                }
              ].map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <div key={idx} className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-purple-900 mb-2">{t(tool.name)}</h3>
                        <p className="text-sm text-slate-700 mb-3">{t(tool.desc)}</p>
                        <div className="flex flex-wrap gap-2">
                          {tool.features[language].map((f, i) => (
                            <Badge key={i} className="bg-white text-purple-700 border-purple-200">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PILOT JOURNEY - Full Documentation */}
          {activeSection === 'pilot-journey' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <Rocket className="h-8 w-8 text-blue-600" />
                {t({ en: 'Complete Pilot Journey', ar: 'رحلة التجربة الكاملة' })}
              </h2>

              {/* Overview */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {t({ en: '🎯 Journey Overview', ar: '🎯 نظرة عامة على الرحلة' })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-4xl font-bold">11</p>
                    <p className="text-sm">{t({ en: 'Stages', ar: 'مراحل' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">8</p>
                    <p className="text-sm">{t({ en: 'Gates', ar: 'بوابات' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">15+</p>
                    <p className="text-sm">{t({ en: 'AI Features', ar: 'ميزة ذكية' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">9</p>
                    <p className="text-sm">{t({ en: 'Pages', ar: 'صفحة' })}</p>
                  </div>
                </div>
              </div>

              {/* Stages */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '📍 The 11 Stages', ar: '📍 المراحل الـ 11' })}
                </h3>
                <div className="space-y-4">
                  {[
                    { stage: { en: '1. Design', ar: '1. التصميم' }, color: 'blue', desc: { en: 'Initial pilot planning with 7 AI features', ar: 'التخطيط الأولي للتجربة مع 7 ميزات ذكية' }, pages: 'PilotCreate, PilotEdit' },
                    { stage: { en: '2. Approval Pending', ar: '2. في انتظار الموافقة' }, color: 'amber', desc: { en: 'Review by authorized personnel with AI Decision Brief', ar: 'المراجعة من قبل الموظفين المخولين مع موجز القرار الذكي' }, pages: 'Approvals' },
                    { stage: { en: '3. Approved', ar: '3. موافق عليه' }, color: 'green', desc: { en: 'Ready for launch preparation', ar: 'جاهز للإعداد للإطلاق' }, pages: 'PilotLaunchWizard' },
                    { stage: { en: '4. Preparation', ar: '4. الإعداد' }, color: 'purple', desc: { en: 'Setup activities with 8-item checklist', ar: 'أنشطة الإعداد مع قائمة 8 عناصر' }, pages: 'PilotLaunchWizard' },
                    { stage: { en: '5. Active', ar: '5. نشط' }, color: 'blue', desc: { en: 'Live pilot execution with real-time monitoring', ar: 'تنفيذ التجربة المباشر مع المراقبة الفورية' }, pages: 'PilotMonitoringDashboard' },
                    { stage: { en: '6. Monitoring', ar: '6. المراقبة' }, color: 'teal', desc: { en: 'Performance tracking with AI anomaly detection', ar: 'تتبع الأداء مع كشف الشذوذ الذكي' }, pages: 'PilotMonitoringDashboard' },
                    { stage: { en: '7. Evaluation', ar: '7. التقييم' }, color: 'indigo', desc: { en: 'AI-powered comprehensive evaluation', ar: 'تقييم شامل مدعوم بالذكاء الاصطناعي' }, pages: 'PilotEvaluations' },
                    { stage: { en: '8. Completed', ar: '8. مكتمل' }, color: 'green', desc: { en: 'Decision point for scale/iterate/terminate', ar: 'نقطة قرار للتوسع/التحسين/الإنهاء' }, pages: 'ScalingWorkflow, IterationWorkflow' },
                    { stage: { en: '9. Scaled', ar: '9. تم التوسع' }, color: 'teal', desc: { en: 'National rollout with execution tracking', ar: 'الانتشار الوطني مع تتبع التنفيذ' }, pages: 'ScalingWorkflow' },
                    { stage: { en: '10. Terminated', ar: '10. منتهي' }, color: 'red', desc: { en: 'Lessons preserved for future reference', ar: 'الدروس المحفوظة للمرجع المستقبلي' }, pages: 'PilotDetail' },
                    { stage: { en: '11. On Hold', ar: '11. متوقف مؤقتاً' }, color: 'slate', desc: { en: 'Pause/resume capability from any stage', ar: 'إمكانية الإيقاف/الاستئناف من أي مرحلة' }, pages: 'PilotDetail' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 bg-${item.color}-50 rounded-lg border-l-4 border-l-${item.color}-600`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-bold text-lg text-${item.color}-900`}>{t(item.stage)}</h4>
                        <Badge className={`bg-${item.color}-100 text-${item.color}-700`}>
                          {item.pages}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700">{t(item.desc)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gates */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '🚪 The 8 Decision Gates', ar: '🚪 بوابات القرار الـ 8' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { gate: { en: 'G1: Submission', ar: 'ب1: التقديم' }, flow: 'design → approval_pending', ai: { en: 'Validation checks', ar: 'فحوصات التحقق' } },
                    { gate: { en: 'G2: Approval', ar: 'ب2: الموافقة' }, flow: 'approval_pending → approved', ai: { en: 'AI Decision Brief', ar: 'موجز القرار الذكي' } },
                    { gate: { en: 'G3: Launch', ar: 'ب3: الإطلاق' }, flow: 'approved → active', ai: { en: 'Readiness Checklist', ar: 'قائمة الجاهزية' } },
                    { gate: { en: 'G4: Monitor', ar: 'ب4: المراقبة' }, flow: 'active → monitoring', ai: { en: 'Anomaly detection', ar: 'كشف الشذوذ' } },
                    { gate: { en: 'G5: Evaluate', ar: 'ب5: التقييم' }, flow: 'monitoring → evaluation', ai: { en: 'Eval generator', ar: 'مولد التقييم' } },
                    { gate: { en: 'G6: Recommend', ar: 'ب6: التوصية' }, flow: 'evaluation → completed', ai: { en: 'Decision AI', ar: 'ذكاء القرار' } },
                    { gate: { en: 'G7: Scale', ar: 'ب7: التوسع' }, flow: 'completed → scaled', ai: { en: 'Impact forecast', ar: 'توقع التأثير' } },
                    { gate: { en: 'G8: Hold/Resume', ar: 'ب8: الإيقاف/الاستئناف' }, flow: 'any ↔ on_hold', ai: { en: 'Risk alerts', ar: 'تنبيهات المخاطر' } }
                  ].map((gate, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                      <p className="font-bold text-purple-900 mb-2">{t(gate.gate)}</p>
                      <div className="space-y-1 text-xs text-slate-600">
                        <p><strong>{t({ en: 'Flow:', ar: 'التدفق:' })}</strong> {gate.flow}</p>
                        <p><strong>{t({ en: 'AI:', ar: 'الذكاء:' })}</strong> {t(gate.ai)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Features */}
              <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-blue-300">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                  {t({ en: '15 AI Features', ar: '15 ميزة ذكاء اصطناعي' })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'Auto-Design', 'Team Builder', 'Stakeholder Mapper',
                    'Tech Recommender', 'Budget Optimizer', 'KPI Suggester',
                    'Milestone Generator', 'Safety Checklist', 'Decision Brief',
                    'Readiness Checker', 'Success Predictor', 'Anomaly Detector',
                    'Evaluation Generator', 'Peer Comparison', 'Iteration Planner'
                  ].map((feature, idx) => (
                    <Badge key={idx} className="bg-white border-blue-200 text-slate-900 justify-center">
                      <Sparkles className="h-3 w-3 mr-1 text-blue-600" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CHALLENGE JOURNEY - Full Documentation */}
          {activeSection === 'challenge-journey' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-900 border-b-2 pb-3 flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-red-600" />
                {t({ en: 'Complete Challenge Journey', ar: 'رحلة التحدي الكاملة' })}
              </h2>

              {/* Overview */}
              <div className="p-6 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {t({ en: '🎯 Journey Overview', ar: '🎯 نظرة عامة على الرحلة' })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-4xl font-bold">10</p>
                    <p className="text-sm">{t({ en: 'Stages', ar: 'مراحل' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">6</p>
                    <p className="text-sm">{t({ en: 'Gates', ar: 'بوابات' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">10+</p>
                    <p className="text-sm">{t({ en: 'AI Features', ar: 'ميزة ذكية' })}</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold">8</p>
                    <p className="text-sm">{t({ en: 'Pages', ar: 'صفحة' })}</p>
                  </div>
                </div>
              </div>

              {/* Stages */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '📍 The 10 Stages', ar: '📍 المراحل الـ 10' })}
                </h3>
                <div className="space-y-4">
                  {[
                    { 
                      stage: { en: '1. Draft/Discovery', ar: '1. المسودة/الاكتشاف' }, 
                      color: 'slate', 
                      desc: { en: 'Create challenge with 7-step wizard + AI assistance', ar: 'إنشاء التحدي مع معالج 7 خطوات + مساعدة ذكية' }, 
                      pages: 'ChallengeCreate',
                      ai: ['Problem refinement', 'Root cause analysis', 'KPI suggester', 'Priority scorer']
                    },
                    { 
                      stage: { en: '2. Submitted', ar: '2. مُقدّم' }, 
                      color: 'blue', 
                      desc: { en: 'Submission wizard with readiness checklist & AI brief', ar: 'معالج التقديم مع قائمة الجاهزية والملخص الذكي' }, 
                      pages: 'ChallengeSubmissionWizard',
                      ai: ['Readiness check (8 items)', 'AI submission brief', 'Complexity assessment']
                    },
                    { 
                      stage: { en: '3. Under Review', ar: '3. قيد المراجعة' }, 
                      color: 'yellow', 
                      desc: { en: 'Quality review workflow with validation checklist', ar: 'سير عمل مراجعة الجودة مع قائمة التحقق' }, 
                      pages: 'ChallengeReviewQueue, ChallengeReviewWorkflow',
                      ai: ['Quality checklist (8 criteria)', 'Critical item detection', 'Auto-assign reviewer']
                    },
                    { 
                      stage: { en: '4. Approved', ar: '4. معتمد' }, 
                      color: 'green', 
                      desc: { en: 'Ready for track assignment and treatment planning', ar: 'جاهز لتعيين المسار وتخطيط المعالجة' }, 
                      pages: 'ChallengeDetail, TrackAssignment',
                      ai: ['AI track recommendation (pilot/R&D/program/etc)', 'Solution matching trigger']
                    },
                    { 
                      stage: { en: '5. In Treatment', ar: '5. قيد المعالجة' }, 
                      color: 'purple', 
                      desc: { en: 'Active treatment with milestones and progress tracking', ar: 'المعالجة النشطة مع المعالم وتتبع التقدم' }, 
                      pages: 'ChallengeTreatmentPlan',
                      ai: ['Milestone generator', 'Progress analyzer', 'Bottleneck detector']
                    },
                    { 
                      stage: { en: '6. Converting to Pilot', ar: '6. التحويل لتجربة' }, 
                      color: 'blue', 
                      desc: { en: 'Challenge-to-Pilot conversion via solution matching', ar: 'تحويل التحدي لتجربة عبر مطابقة الحلول' }, 
                      pages: 'ChallengeSolutionMatching, PilotCreate',
                      ai: ['AI solution matching (95%+ accuracy)', 'Auto-pilot design', 'KPI transfer']
                    },
                    { 
                      stage: { en: '7. Converting to R&D', ar: '7. التحويل لبحث' }, 
                      color: 'indigo', 
                      desc: { en: 'Challenge-to-R&D conversion with scope generator', ar: 'تحويل التحدي لبحث مع مولد النطاق' }, 
                      pages: 'ChallengeToRDWizard',
                      ai: ['R&D scope generator', 'Research question suggester', 'Methodology planner']
                    },
                    { 
                      stage: { en: '8. Resolved', ar: '8. محلول' }, 
                      color: 'teal', 
                      desc: { en: 'Resolution workflow with impact documentation', ar: 'سير عمل الحل مع توثيق التأثير' }, 
                      pages: 'ChallengeResolutionWorkflow',
                      ai: ['Impact analyzer', 'Lessons learned extractor', 'Outcome classifier']
                    },
                    { 
                      stage: { en: '9. Archived', ar: '9. مؤرشف' }, 
                      color: 'gray', 
                      desc: { en: 'Archive with reason tracking and restore capability', ar: 'الأرشفة مع تتبع السبب وإمكانية الاستعادة' }, 
                      pages: 'ChallengeArchiveWorkflow',
                      ai: ['Archive reason suggester', 'Duplicate detector', 'Retention policy']
                    },
                    { 
                      stage: { en: '10. Exception Flows', ar: '10. التدفقات الاستثنائية' }, 
                      color: 'amber', 
                      desc: { en: 'Draft edits, status rollbacks, bulk operations', ar: 'تعديلات المسودة، التراجع عن الحالة، العمليات الجماعية' }, 
                      pages: 'ChallengeEdit, Challenges (bulk)',
                      ai: ['Change impact analyzer', 'Workflow validator']
                    }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-4 bg-${item.color}-50 rounded-lg border-l-4 border-l-${item.color}-600`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-bold text-lg text-${item.color}-900`}>{t(item.stage)}</h4>
                        <Badge className={`bg-${item.color}-100 text-${item.color}-700 text-xs`}>
                          {item.pages}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{t(item.desc)}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.ai.map((ai, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1 text-blue-600" />
                            {ai}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gates */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '🚪 The 6 Decision Gates', ar: '🚪 بوابات القرار الـ 6' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      gate: { en: 'G1: Submission Gate', ar: 'ب1: بوابة التقديم' }, 
                      flow: 'draft → submitted', 
                      component: 'ChallengeSubmissionWizard',
                      ai: { en: ['8-item readiness checklist', 'AI submission brief', 'Complexity scorer'], ar: ['قائمة جاهزية 8 عناصر', 'ملخص التقديم الذكي', 'مسجل التعقيد'] }
                    },
                    { 
                      gate: { en: 'G2: Validation Gate', ar: 'ب2: بوابة التحقق' }, 
                      flow: 'submitted → approved/changes', 
                      component: 'ChallengeReviewWorkflow',
                      ai: { en: ['8-criteria review checklist', 'Critical vs optional flags', 'Review recommender'], ar: ['قائمة مراجعة 8 معايير', 'أعلام حرجة مقابل اختيارية', 'موصي المراجعة'] }
                    },
                    { 
                      gate: { en: 'G3: Track Assignment Gate', ar: 'ب3: بوابة تعيين المسار' }, 
                      flow: 'approved → track assigned', 
                      component: 'TrackAssignment',
                      ai: { en: ['AI track recommendation', 'Track explanation', 'Confidence scoring'], ar: ['توصية المسار الذكي', 'شرح المسار', 'تسجيل الثقة'] }
                    },
                    { 
                      gate: { en: 'G4: Treatment Planning Gate', ar: 'ب4: بوابة تخطيط المعالجة' }, 
                      flow: 'approved → in_treatment', 
                      component: 'ChallengeTreatmentPlan',
                      ai: { en: ['Milestone suggester', 'Resource estimator', 'Timeline optimizer'], ar: ['مقترح المعالم', 'مقدر الموارد', 'محسن الجدول الزمني'] }
                    },
                    { 
                      gate: { en: 'G5: Solution Match Gate', ar: 'ب5: بوابة مطابقة الحل' }, 
                      flow: 'in_treatment → pilot conversion', 
                      component: 'ChallengeSolutionMatching',
                      ai: { en: ['AI matching (95%+ accuracy)', 'Match scoring', 'Explanation generator'], ar: ['المطابقة الذكية (دقة 95%+)', 'تسجيل المطابقة', 'مولد الشرح'] }
                    },
                    { 
                      gate: { en: 'G6: Resolution Gate', ar: 'ب6: بوابة الحل' }, 
                      flow: 'in_treatment → resolved', 
                      component: 'ChallengeResolutionWorkflow',
                      ai: { en: ['Impact assessor', 'Lessons learned extractor', 'Outcome classifier'], ar: ['مقيم التأثير', 'مستخرج الدروس', 'مصنف النتائج'] }
                    }
                  ].map((gate, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border-2 border-red-200">
                      <div className="mb-3">
                        <p className="font-bold text-red-900 mb-1">{t(gate.gate)}</p>
                        <Badge variant="outline" className="text-xs font-mono">{gate.component}</Badge>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600">
                        <p><strong>{t({ en: 'Flow:', ar: 'التدفق:' })}</strong> {gate.flow}</p>
                        <div>
                          <p className="font-semibold mb-1">{t({ en: 'AI Features:', ar: 'ميزات الذكاء:' })}</p>
                          {gate.ai[language].map((ai, i) => (
                            <div key={i} className="flex items-center gap-1 text-blue-700">
                              <Sparkles className="h-3 w-3" />
                              <span>{ai}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflows */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '🔄 Complete Workflows (10)', ar: '🔄 سير العمل الكامل (10)' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: { en: 'Draft → Submission', ar: 'المسودة ← التقديم' }, pages: ['ChallengeCreate', 'ChallengeSubmissionWizard'], status: 'complete' },
                    { name: { en: 'Submission → Review', ar: 'التقديم ← المراجعة' }, pages: ['ChallengeReviewQueue', 'ChallengeReviewWorkflow'], status: 'complete' },
                    { name: { en: 'Review → Approved', ar: 'المراجعة ← الموافقة' }, pages: ['ChallengeReviewWorkflow'], status: 'complete' },
                    { name: { en: 'Approved → Track', ar: 'الموافقة ← المسار' }, pages: ['TrackAssignment', 'ChallengeDetail'], status: 'complete' },
                    { name: { en: 'Approved → Treatment', ar: 'الموافقة ← المعالجة' }, pages: ['ChallengeTreatmentPlan'], status: 'complete' },
                    { name: { en: 'Track → Solution Match', ar: 'المسار ← مطابقة الحل' }, pages: ['ChallengeSolutionMatching'], status: 'complete' },
                    { name: { en: 'Match → Pilot Launch', ar: 'المطابقة ← إطلاق التجربة' }, pages: ['ChallengeDetail', 'PilotCreate'], status: 'complete' },
                    { name: { en: 'Track → R&D Conversion', ar: 'المسار ← تحويل البحث' }, pages: ['ChallengeToRDWizard'], status: 'complete' },
                    { name: { en: 'Treatment → Resolution', ar: 'المعالجة ← الحل' }, pages: ['ChallengeResolutionWorkflow'], status: 'complete' },
                    { name: { en: 'Any → Archive', ar: 'أي ← الأرشفة' }, pages: ['ChallengeArchiveWorkflow'], status: 'complete' }
                  ].map((workflow, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-green-900">{t(workflow.name)}</p>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {workflow.pages.map((page, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{page}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Features */}
              <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-red-300">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-red-600" />
                  {t({ en: '10+ AI Features', ar: '10+ ميزة ذكاء اصطناعي' })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    'Problem Refiner', 'Root Cause Analyzer', 'KPI Suggester',
                    'Priority Scorer', 'Readiness Checker', 'Submission Brief Generator',
                    'Quality Validator', 'Track Recommender', 'Solution Matcher',
                    'Treatment Planner', 'Impact Assessor', 'Lessons Extractor'
                  ].map((feature, idx) => (
                    <Badge key={idx} className="bg-white border-red-200 text-slate-900 justify-center">
                      <Sparkles className="h-3 w-3 mr-1 text-red-600" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Key Pages */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '📄 Key Pages (8)', ar: '📄 الصفحات الرئيسية (8)' })}
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'ChallengeCreate', desc: { en: '7-step wizard with AI assistance for problem refinement', ar: 'معالج 7 خطوات مع مساعدة ذكية لتحسين المشكلة' } },
                    { name: 'ChallengeDetail', desc: { en: 'Comprehensive view with all workflows integrated (10+ tabs)', ar: 'عرض شامل مع كل سير العمل متكامل (10+ علامات تبويب)' } },
                    { name: 'ChallengeEdit', desc: { en: 'Edit challenge with AI enhancement button', ar: 'تعديل التحدي مع زر التحسين الذكي' } },
                    { name: 'Challenges', desc: { en: 'Master list with filters, bulk actions, AI insights', ar: 'القائمة الرئيسية مع المرشحات والإجراءات الجماعية والرؤى الذكية' } },
                    { name: 'MyChallenges', desc: { en: 'Personal dashboard with AI suggestions per challenge', ar: 'لوحة شخصية مع اقتراحات ذكية لكل تحدي' } },
                    { name: 'ChallengeReviewQueue', desc: { en: 'Reviewer queue with integrated review workflow', ar: 'قائمة المراجع مع سير عمل المراجعة المتكامل' } },
                    { name: 'ChallengeSolutionMatching', desc: { en: 'AI-powered matching with 95%+ accuracy', ar: 'مطابقة مدعومة بالذكاء بدقة 95%+' } },
                    { name: 'ChallengeImport', desc: { en: 'Bulk import with AI data extraction from Excel/PDF', ar: 'استيراد جماعي مع استخراج البيانات الذكي من إكسل/PDF' } }
                  ].map((page, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-1">{page.name}</p>
                          <p className="text-sm text-slate-700">{t(page.desc)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Components */}
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  {t({ en: '🧩 Workflow Components (6)', ar: '🧩 مكونات سير العمل (6)' })}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      name: 'ChallengeSubmissionWizard', 
                      purpose: { en: 'Guide users through submission with 3-step wizard', ar: 'إرشاد المستخدمين خلال التقديم مع معالج 3 خطوات' },
                      features: ['Readiness checklist (8 items)', 'AI brief generation', 'Submission notes']
                    },
                    { 
                      name: 'ChallengeReviewWorkflow', 
                      purpose: { en: 'Structured review with quality criteria and decision paths', ar: 'مراجعة منظمة مع معايير الجودة ومسارات القرار' },
                      features: ['8-criteria checklist', 'Critical item validation', 'Approve/Reject/Changes']
                    },
                    { 
                      name: 'ChallengeTreatmentPlan', 
                      purpose: { en: 'Define treatment approach with milestone tracking', ar: 'تحديد نهج المعالجة مع تتبع المعالم' },
                      features: ['Treatment approach', 'Milestone management', 'Progress tracking']
                    },
                    { 
                      name: 'ChallengeResolutionWorkflow', 
                      purpose: { en: 'Document resolution with impact and lessons', ar: 'توثيق الحل مع التأثير والدروس' },
                      features: ['Outcome selection', 'Impact assessment', 'Lessons learned']
                    },
                    { 
                      name: 'ChallengeToRDWizard', 
                      purpose: { en: 'Convert challenge to R&D project with AI scope', ar: 'تحويل التحدي لمشروع بحث مع النطاق الذكي' },
                      features: ['AI scope generator', 'R&D call linking', 'Research questions']
                    },
                    { 
                      name: 'ChallengeArchiveWorkflow', 
                      purpose: { en: 'Archive with reason tracking and activity logging', ar: 'الأرشفة مع تتبع السبب وتسجيل النشاط' },
                      features: ['Archive reasons', 'Activity logging', 'Restore capability']
                    }
                  ].map((comp, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border-2 border-orange-200">
                      <h4 className="font-bold text-orange-900 mb-2">{comp.name}</h4>
                      <p className="text-sm text-slate-700 mb-3">{t(comp.purpose)}</p>
                      <div className="flex flex-wrap gap-1">
                        {comp.features.map((f, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {t({ en: '✅ Challenge Journey: 100% Complete', ar: '✅ رحلة التحدي: مكتملة 100%' })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-5xl font-bold mb-2">10</p>
                    <p className="text-sm">{t({ en: 'Stages Covered', ar: 'مراحل مغطاة' })}</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold mb-2">6</p>
                    <p className="text-sm">{t({ en: 'Gates Implemented', ar: 'بوابات منفذة' })}</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold mb-2">10</p>
                    <p className="text-sm">{t({ en: 'Workflows', ar: 'سير عمل' })}</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold mb-2">10+</p>
                    <p className="text-sm">{t({ en: 'AI Features', ar: 'ميزة ذكية' })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PlatformDocs, { requiredPermissions: [] });
