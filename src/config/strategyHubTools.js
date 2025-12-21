
import {
    Target,
    Workflow,
    Sparkles,
    Shield,
    BarChart3,
    Zap,
    FileText,
    Lightbulb,
    Users,
    FlaskConical,
    Building2,
    Calendar,
    Microscope,
    GitBranch,
    CheckCircle2,
    Clock,
    AlertCircle,
    ArrowRight,
    Brain,
    TrendingUp,
    Settings,
    MessageSquare,
    Eye,
    Megaphone,
    BookOpen,
    Bell,
    Globe,
    ClipboardList,
    Layers,
    Search,
    AlertTriangle,
    FileBarChart
} from 'lucide-react';

// Cascade Generator Cards with permission requirements
export const cascadeGenerators = [
    { icon: Lightbulb, label: { en: 'Challenges', ar: 'التحديات' }, path: '/strategy-challenge-generator-page', color: 'text-orange-500', permission: 'strategy_cascade' },
    { icon: FlaskConical, label: { en: 'Pilots', ar: 'التجارب' }, path: '/strategy-pilot-generator-page', color: 'text-blue-500', permission: 'strategy_cascade' },
    { icon: FileText, label: { en: 'Policies', ar: 'السياسات' }, path: '/strategy-policy-generator-page', color: 'text-purple-500', permission: 'strategy_cascade' },
    { icon: Microscope, label: { en: 'R&D Calls', ar: 'طلبات البحث' }, path: '/strategy-rd-call-generator-page', color: 'text-green-500', permission: 'strategy_cascade' },
    { icon: Users, label: { en: 'Partnerships', ar: 'الشراكات' }, path: '/strategy-partnership-generator-page', color: 'text-pink-500', permission: 'strategy_cascade' },
    { icon: Calendar, label: { en: 'Events', ar: 'الفعاليات' }, path: '/strategy-event-generator-page', color: 'text-amber-500', permission: 'strategy_cascade' },
    { icon: Building2, label: { en: 'Living Labs', ar: 'المختبرات الحية' }, path: '/strategy-living-lab-generator-page', color: 'text-cyan-500', permission: 'strategy_cascade' },
    { icon: MessageSquare, label: { en: 'Campaigns', ar: 'الحملات' }, path: '/strategy-campaign-generator-page', color: 'text-rose-500', permission: 'strategy_cascade' },
];

// AI Assistants with component keys
export const aiAssistants = [
    { key: 'narrative', icon: Brain, label: { en: 'Narrative Generator', ar: 'مولد السرد' }, desc: { en: 'Generate strategic narratives', ar: 'إنشاء سرديات استراتيجية' } },
    { key: 'gap', icon: Target, label: { en: 'Gap Recommender', ar: 'توصيات الفجوات' }, desc: { en: 'Find coverage gaps', ar: 'البحث عن فجوات التغطية' } },
    { key: 'whatif', icon: TrendingUp, label: { en: 'What-If Simulator', ar: 'محاكي السيناريوهات' }, desc: { en: 'Budget scenarios', ar: 'سيناريوهات الميزانية' } },
    { key: 'bottleneck', icon: Zap, label: { en: 'Bottleneck Detector', ar: 'كاشف الاختناقات' }, desc: { en: 'Find pipeline issues', ar: 'البحث عن مشاكل خط الأنابيب' } },
];

// Governance Tools with permission requirements
export const governanceTools = [
    { icon: CheckCircle2, label: { en: 'Signoff Tracker', ar: 'متتبع الموافقات' }, path: '/strategy-governance-page', tab: 'signoff', permission: 'strategy_manage' },
    { icon: GitBranch, label: { en: 'Version Control', ar: 'التحكم بالإصدارات' }, path: '/strategy-governance-page', tab: 'versions', permission: 'strategy_manage' },
    { icon: Users, label: { en: 'Committee Review', ar: 'مراجعة اللجنة' }, path: '/strategy-governance-page', tab: 'committee', permission: 'strategy_manage' },
    { icon: Settings, label: { en: 'Ownership', ar: 'الملكية' }, path: '/strategy-ownership-page', permission: 'strategy_manage' },
    { icon: TrendingUp, label: { en: 'Budget Allocation', ar: 'تخصيص الميزانية' }, path: '/budget-allocation-tool', permission: 'strategy_manage' },
];

// Communication Tools with permission requirements
export const communicationTools = [
    { icon: Megaphone, label: { en: 'Communication Planner', ar: 'مخطط التواصل' }, path: '/strategy-communication-page', desc: { en: 'Plan and schedule communications', ar: 'تخطيط وجدولة التواصل' }, permission: 'strategy_view' },
    { icon: BookOpen, label: { en: 'Impact Stories', ar: 'قصص الأثر' }, path: '/strategy-communication-page?tab=stories', desc: { en: 'Generate impact narratives', ar: 'إنشاء سرديات الأثر' }, permission: 'strategy_view' },
    { icon: Bell, label: { en: 'Notifications', ar: 'الإشعارات' }, path: '/strategy-communication-page?tab=notifications', desc: { en: 'Manage stakeholder alerts', ar: 'إدارة تنبيهات أصحاب المصلحة' }, permission: 'strategy_view' },
    { icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' }, path: '/strategy-communication-page?tab=analytics', desc: { en: 'Communication metrics', ar: 'مقاييس التواصل' }, permission: 'strategy_view' },
    { icon: Globe, label: { en: 'Public Dashboard', ar: 'اللوحة العامة' }, path: '/public-strategy-dashboard-page', desc: { en: 'Public-facing view', ar: 'العرض العام' }, permission: null },
    { icon: Eye, label: { en: 'Public View', ar: 'العرض العام' }, path: '/strategy-public-view-page', desc: { en: 'Share strategy externally', ar: 'مشاركة الاستراتيجية خارجياً' }, permission: null },
];

// Preplanning Tools with permission requirements
export const preplanningTools = [
    { icon: Search, label: { en: 'Environmental Scan', ar: 'المسح البيئي' }, path: '/environmental-scan-page', desc: { en: 'PESTLE analysis', ar: 'تحليل PESTLE' }, permission: 'strategy_manage' },
    { icon: Layers, label: { en: 'SWOT Analysis', ar: 'تحليل SWOT' }, path: '/swot-analysis-page', desc: { en: 'Strengths, weaknesses, opportunities, threats', ar: 'نقاط القوة والضعف والفرص والتهديدات' }, permission: 'strategy_manage' },
    { icon: Users, label: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' }, path: '/stakeholder-analysis-page', desc: { en: 'Map key stakeholders', ar: 'رسم خريطة أصحاب المصلحة' }, permission: 'strategy_manage' },
    { icon: AlertTriangle, label: { en: 'Risk Assessment', ar: 'تقييم المخاطر' }, path: '/risk-assessment-page', desc: { en: 'Identify and assess risks', ar: 'تحديد وتقييم المخاطر' }, permission: 'strategy_manage' },
    { icon: FileBarChart, label: { en: 'Baseline Data', ar: 'البيانات الأساسية' }, path: '/baseline-data-page', desc: { en: 'Collect baseline metrics', ar: 'جمع المقاييس الأساسية' }, permission: 'strategy_manage' },
    { icon: ClipboardList, label: { en: 'Strategy Inputs', ar: 'مدخلات الاستراتيجية' }, path: '/strategy-input-page', desc: { en: 'Gather strategic inputs', ar: 'جمع المدخلات الاستراتيجية' }, permission: 'strategy_manage' },
];

// Template & Library Tools
export const templateTools = [
    { icon: FileText, label: { en: 'Template Library', ar: 'مكتبة القوالب' }, path: '/strategy-templates-page', desc: { en: 'Browse and apply templates with coverage analysis', ar: 'تصفح وتطبيق القوالب مع تحليل التغطية' }, permission: null },
    { icon: BarChart3, label: { en: 'Coverage Analysis', ar: 'تحليل التغطية' }, path: '/strategy-templates-page', desc: { en: 'Analyze template coverage against MoMAH taxonomy', ar: 'تحليل تغطية القوالب مقابل تصنيف الوزارة' }, permission: null },
    { icon: Layers, label: { en: 'Sector Strategy Builder', ar: 'منشئ استراتيجية القطاع' }, path: '/sector-strategy-page', desc: { en: 'Create sector-specific sub-strategies', ar: 'إنشاء استراتيجيات فرعية خاصة بالقطاع' }, permission: 'strategy_manage' },
];

// Monitoring & Review Tools
export const monitoringTools = [
    { icon: BarChart3, label: { en: 'Strategy Cockpit', ar: 'لوحة القيادة' }, path: '/strategy-cockpit', desc: { en: 'Real-time strategy monitoring', ar: 'مراقبة الاستراتيجية في الوقت الفعلي' }, permission: 'strategy_view' },
    { icon: Target, label: { en: 'Strategy Drill-down', ar: 'التفاصيل الاستراتيجية' }, path: '/strategy-drill-down', desc: { en: 'Detailed strategy analysis', ar: 'تحليل الاستراتيجية المفصل' }, permission: 'strategy_view' },
    { icon: Workflow, label: { en: 'Initiative Tracker', ar: 'متتبع المبادرات' }, path: '/strategic-initiative-tracker', desc: { en: 'Track initiatives with health scores', ar: 'تتبع المبادرات مع درجات الصحة' }, permission: 'strategy_view' },
    { icon: GitBranch, label: { en: 'Strategy Alignment', ar: 'المواءمة الاستراتيجية' }, path: '/strategy-alignment', desc: { en: 'Entity alignment tracking', ar: 'تتبع مواءمة الكيانات' }, permission: 'strategy_view' },
    { icon: Calendar, label: { en: 'Timeline View', ar: 'عرض الجدول الزمني' }, path: '/strategy-timeline-page', desc: { en: 'Strategic timeline planning', ar: 'تخطيط الجدول الزمني الاستراتيجي' }, permission: 'strategy_view' },
    { icon: MessageSquare, label: { en: 'Feedback Dashboard', ar: 'لوحة التعليقات' }, path: '/strategy-feedback-dashboard', desc: { en: 'Collect and analyze feedback', ar: 'جمع وتحليل التعليقات' }, permission: 'strategy_view' },
    { icon: Settings, label: { en: 'Adjustment Wizard', ar: 'معالج التعديل' }, path: '/strategy-review-page', desc: { en: 'Strategy adjustment and review', ar: 'تعديل ومراجعة الاستراتيجية' }, permission: 'strategy_manage' },
    { icon: TrendingUp, label: { en: 'Execution Dashboard', ar: 'لوحة التنفيذ' }, path: '/strategic-execution-dashboard', desc: { en: 'Track strategic execution', ar: 'تتبع التنفيذ الاستراتيجي' }, permission: 'strategy_view' },
    { icon: Workflow, label: { en: 'Planning Progress', ar: 'تقدم التخطيط' }, path: '/strategic-planning-progress', desc: { en: 'Monitor planning milestones', ar: 'مراقبة معالم التخطيط' }, permission: 'strategy_view' },
    { icon: Target, label: { en: 'KPI Tracker', ar: 'متتبع المؤشرات' }, path: '/strategic-kpi-tracker', desc: { en: 'Track strategic KPIs', ar: 'تتبع مؤشرات الأداء الاستراتيجية' }, permission: 'strategy_view' },
    { icon: AlertTriangle, label: { en: 'Gap Analysis', ar: 'تحليل الفجوات' }, path: '/gap-analysis-tool', desc: { en: 'Identify strategy gaps', ar: 'تحديد الفجوات الاستراتيجية' }, permission: 'strategy_view' },
];

// Evaluation Tools (Phase 7)
export const evaluationTools = [
    { icon: FileBarChart, label: { en: 'Evaluation Panel', ar: 'لوحة التقييم' }, path: '/strategy-review-page', desc: { en: 'Comprehensive strategy evaluation', ar: 'تقييم شامل للاستراتيجية' }, permission: 'strategy_view' },
    { icon: BookOpen, label: { en: 'Case Studies', ar: 'دراسات الحالة' }, path: '/knowledge?type=case-study', desc: { en: 'Generate case studies from successes', ar: 'إنشاء دراسات حالة من النجاحات' }, permission: 'strategy_view' },
    { icon: Lightbulb, label: { en: 'Lessons Learned', ar: 'الدروس المستفادة' }, path: '/knowledge?type=lessons-learned', desc: { en: 'Capture and share learnings', ar: 'جمع ومشاركة الدروس' }, permission: 'strategy_view' },
    { icon: TrendingUp, label: { en: 'Impact Assessment', ar: 'تقييم الأثر' }, path: '/strategy-review-page?tab=impact', desc: { en: 'Measure strategy impact', ar: 'قياس أثر الاستراتيجية' }, permission: 'strategy_view' },
];

// Recalibration Tools (Phase 8) - All link to unified recalibration page with tabs
export const recalibrationTools = [
    { icon: Brain, label: { en: 'Feedback Analysis', ar: 'تحليل التعليقات' }, path: '/strategy-recalibration-page?tab=feedback', desc: { en: 'AI-powered feedback analysis', ar: 'تحليل التعليقات بالذكاء الاصطناعي' }, permission: 'strategy_manage' },
    { icon: Layers, label: { en: 'Adjustment Matrix', ar: 'مصفوفة التعديل' }, path: '/strategy-recalibration-page?tab=matrix', desc: { en: 'Decision support for adjustments', ar: 'دعم القرار للتعديلات' }, permission: 'strategy_manage' },
    { icon: Settings, label: { en: 'Mid-Cycle Pivot', ar: 'التحويل منتصف الدورة' }, path: '/strategy-recalibration-page?tab=pivot', desc: { en: 'Manage strategic pivots', ar: 'إدارة التحويلات الاستراتيجية' }, permission: 'strategy_manage' },
    { icon: Target, label: { en: 'Baseline Recalibrator', ar: 'إعادة معايرة الأساس' }, path: '/strategy-recalibration-page?tab=baseline', desc: { en: 'Recalibrate baselines', ar: 'إعادة معايرة خطوط الأساس' }, permission: 'strategy_manage' },
    { icon: Sparkles, label: { en: 'Next Cycle Initializer', ar: 'مُهيئ الدورة التالية' }, path: '/strategy-recalibration-page?tab=next', desc: { en: 'Initialize next planning cycle', ar: 'بدء دورة التخطيط التالية' }, permission: 'strategy_manage' },
];

// Demand & Resource Tools
export const demandTools = [
    { icon: TrendingUp, label: { en: 'Demand Dashboard', ar: 'لوحة الطلب' }, path: '/strategy-demand-dashboard', desc: { en: 'Track strategy-driven demand', ar: 'تتبع الطلب المدفوع بالاستراتيجية' }, permission: 'strategy_view' },
    { icon: ClipboardList, label: { en: 'Action Plans', ar: 'خطط العمل' }, path: '/action-plan-page', desc: { en: 'Manage strategic action plans', ar: 'إدارة خطط العمل الاستراتيجية' }, permission: 'strategy_view' },
    { icon: Target, label: { en: 'National Alignment', ar: 'المواءمة الوطنية' }, path: '/national-strategy-linker-page', desc: { en: 'Link to Vision 2030 programs', ar: 'الربط ببرامج رؤية 2030' }, permission: 'strategy_view' },
];

// Phase workflow definition
export const phases = [
    { key: 'preplanning', label: { en: 'Pre-Planning', ar: 'التخطيط المسبق' }, icon: Eye },
    { key: 'creation', label: { en: 'Creation', ar: 'الإنشاء' }, icon: FileText },
    { key: 'cascade', label: { en: 'Cascade', ar: 'التدرج' }, icon: Zap },
    { key: 'governance', label: { en: 'Governance', ar: 'الحوكمة' }, icon: Shield },
    { key: 'communication', label: { en: 'Communication', ar: 'التواصل' }, icon: MessageSquare },
    { key: 'monitoring', label: { en: 'Monitoring', ar: 'المراقبة' }, icon: BarChart3 },
    { key: 'evaluation', label: { en: 'Evaluation', ar: 'التقييم' }, icon: Target },
    { key: 'recalibration', label: { en: 'Recalibration', ar: 'إعادة المعايرة' }, icon: Settings },
];
