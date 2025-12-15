import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
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

// Import AI Components
import StrategicNarrativeGenerator from '@/components/strategy/StrategicNarrativeGenerator';
import StrategicGapProgramRecommender from '@/components/strategy/StrategicGapProgramRecommender';
import WhatIfSimulator from '@/components/strategy/WhatIfSimulator';
import BottleneckDetector from '@/components/strategy/BottleneckDetector';

// Cascade Generator Cards with permission requirements
const cascadeGenerators = [
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
const aiAssistants = [
  { key: 'narrative', icon: Brain, label: { en: 'Narrative Generator', ar: 'مولد السرد' }, desc: { en: 'Generate strategic narratives', ar: 'إنشاء سرديات استراتيجية' } },
  { key: 'gap', icon: Target, label: { en: 'Gap Recommender', ar: 'توصيات الفجوات' }, desc: { en: 'Find coverage gaps', ar: 'البحث عن فجوات التغطية' } },
  { key: 'whatif', icon: TrendingUp, label: { en: 'What-If Simulator', ar: 'محاكي السيناريوهات' }, desc: { en: 'Budget scenarios', ar: 'سيناريوهات الميزانية' } },
  { key: 'bottleneck', icon: Zap, label: { en: 'Bottleneck Detector', ar: 'كاشف الاختناقات' }, desc: { en: 'Find pipeline issues', ar: 'البحث عن مشاكل خط الأنابيب' } },
];

// Governance Tools with permission requirements
const governanceTools = [
  { icon: CheckCircle2, label: { en: 'Signoff Tracker', ar: 'متتبع الموافقات' }, path: '/strategy-governance-page', tab: 'signoff', permission: 'strategy_manage' },
  { icon: GitBranch, label: { en: 'Version Control', ar: 'التحكم بالإصدارات' }, path: '/strategy-governance-page', tab: 'versions', permission: 'strategy_manage' },
  { icon: Users, label: { en: 'Committee Review', ar: 'مراجعة اللجنة' }, path: '/strategy-governance-page', tab: 'committee', permission: 'strategy_manage' },
  { icon: Settings, label: { en: 'Ownership', ar: 'الملكية' }, path: '/strategy-ownership-page', permission: 'strategy_manage' },
  { icon: TrendingUp, label: { en: 'Budget Allocation', ar: 'تخصيص الميزانية' }, path: '/budget-allocation-tool', permission: 'strategy_manage' },
];

// Communication Tools with permission requirements
const communicationTools = [
  { icon: Megaphone, label: { en: 'Communication Planner', ar: 'مخطط التواصل' }, path: '/strategy-communication-page', desc: { en: 'Plan and schedule communications', ar: 'تخطيط وجدولة التواصل' }, permission: 'strategy_view' },
  { icon: BookOpen, label: { en: 'Impact Stories', ar: 'قصص الأثر' }, path: '/strategy-communication-page?tab=stories', desc: { en: 'Generate impact narratives', ar: 'إنشاء سرديات الأثر' }, permission: 'strategy_view' },
  { icon: Bell, label: { en: 'Notifications', ar: 'الإشعارات' }, path: '/strategy-communication-page?tab=notifications', desc: { en: 'Manage stakeholder alerts', ar: 'إدارة تنبيهات أصحاب المصلحة' }, permission: 'strategy_view' },
  { icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' }, path: '/strategy-communication-page?tab=analytics', desc: { en: 'Communication metrics', ar: 'مقاييس التواصل' }, permission: 'strategy_view' },
  { icon: Globe, label: { en: 'Public Dashboard', ar: 'اللوحة العامة' }, path: '/public-strategy-dashboard-page', desc: { en: 'Public-facing view', ar: 'العرض العام' }, permission: null },
  { icon: Eye, label: { en: 'Public View', ar: 'العرض العام' }, path: '/strategy-public-view-page', desc: { en: 'Share strategy externally', ar: 'مشاركة الاستراتيجية خارجياً' }, permission: null },
];

// Preplanning Tools with permission requirements
const preplanningTools = [
  { icon: Search, label: { en: 'Environmental Scan', ar: 'المسح البيئي' }, path: '/environmental-scan-page', desc: { en: 'PESTLE analysis', ar: 'تحليل PESTLE' }, permission: 'strategy_manage' },
  { icon: Layers, label: { en: 'SWOT Analysis', ar: 'تحليل SWOT' }, path: '/swot-analysis-page', desc: { en: 'Strengths, weaknesses, opportunities, threats', ar: 'نقاط القوة والضعف والفرص والتهديدات' }, permission: 'strategy_manage' },
  { icon: Users, label: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' }, path: '/stakeholder-analysis-page', desc: { en: 'Map key stakeholders', ar: 'رسم خريطة أصحاب المصلحة' }, permission: 'strategy_manage' },
  { icon: AlertTriangle, label: { en: 'Risk Assessment', ar: 'تقييم المخاطر' }, path: '/risk-assessment-page', desc: { en: 'Identify and assess risks', ar: 'تحديد وتقييم المخاطر' }, permission: 'strategy_manage' },
  { icon: FileBarChart, label: { en: 'Baseline Data', ar: 'البيانات الأساسية' }, path: '/baseline-data-page', desc: { en: 'Collect baseline metrics', ar: 'جمع المقاييس الأساسية' }, permission: 'strategy_manage' },
  { icon: ClipboardList, label: { en: 'Strategy Inputs', ar: 'مدخلات الاستراتيجية' }, path: '/strategy-input-page', desc: { en: 'Gather strategic inputs', ar: 'جمع المدخلات الاستراتيجية' }, permission: 'strategy_manage' },
];

// Template & Library Tools
const templateTools = [
  { icon: FileText, label: { en: 'Template Library', ar: 'مكتبة القوالب' }, path: '/strategy-templates-page', desc: { en: 'Browse and apply templates with coverage analysis', ar: 'تصفح وتطبيق القوالب مع تحليل التغطية' }, permission: null },
  { icon: BarChart3, label: { en: 'Coverage Analysis', ar: 'تحليل التغطية' }, path: '/strategy-templates-page', desc: { en: 'Analyze template coverage against MoMAH taxonomy', ar: 'تحليل تغطية القوالب مقابل تصنيف الوزارة' }, permission: null },
  { icon: Layers, label: { en: 'Sector Strategy Builder', ar: 'منشئ استراتيجية القطاع' }, path: '/sector-strategy-page', desc: { en: 'Create sector-specific sub-strategies', ar: 'إنشاء استراتيجيات فرعية خاصة بالقطاع' }, permission: 'strategy_manage' },
];

// Monitoring & Review Tools
const monitoringTools = [
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
const evaluationTools = [
  { icon: FileBarChart, label: { en: 'Evaluation Panel', ar: 'لوحة التقييم' }, path: '/strategy-review-page', desc: { en: 'Comprehensive strategy evaluation', ar: 'تقييم شامل للاستراتيجية' }, permission: 'strategy_view' },
  { icon: BookOpen, label: { en: 'Case Studies', ar: 'دراسات الحالة' }, path: '/knowledge?type=case-study', desc: { en: 'Generate case studies from successes', ar: 'إنشاء دراسات حالة من النجاحات' }, permission: 'strategy_view' },
  { icon: Lightbulb, label: { en: 'Lessons Learned', ar: 'الدروس المستفادة' }, path: '/knowledge?type=lessons-learned', desc: { en: 'Capture and share learnings', ar: 'جمع ومشاركة الدروس' }, permission: 'strategy_view' },
  { icon: TrendingUp, label: { en: 'Impact Assessment', ar: 'تقييم الأثر' }, path: '/strategy-review-page?tab=impact', desc: { en: 'Measure strategy impact', ar: 'قياس أثر الاستراتيجية' }, permission: 'strategy_view' },
];

// Recalibration Tools (Phase 8) - All link to unified recalibration page with tabs
const recalibrationTools = [
  { icon: Brain, label: { en: 'Feedback Analysis', ar: 'تحليل التعليقات' }, path: '/strategy-recalibration-page?tab=feedback', desc: { en: 'AI-powered feedback analysis', ar: 'تحليل التعليقات بالذكاء الاصطناعي' }, permission: 'strategy_manage' },
  { icon: Layers, label: { en: 'Adjustment Matrix', ar: 'مصفوفة التعديل' }, path: '/strategy-recalibration-page?tab=matrix', desc: { en: 'Decision support for adjustments', ar: 'دعم القرار للتعديلات' }, permission: 'strategy_manage' },
  { icon: Settings, label: { en: 'Mid-Cycle Pivot', ar: 'التحويل منتصف الدورة' }, path: '/strategy-recalibration-page?tab=pivot', desc: { en: 'Manage strategic pivots', ar: 'إدارة التحويلات الاستراتيجية' }, permission: 'strategy_manage' },
  { icon: Target, label: { en: 'Baseline Recalibrator', ar: 'إعادة معايرة الأساس' }, path: '/strategy-recalibration-page?tab=baseline', desc: { en: 'Recalibrate baselines', ar: 'إعادة معايرة خطوط الأساس' }, permission: 'strategy_manage' },
  { icon: Sparkles, label: { en: 'Next Cycle Initializer', ar: 'مُهيئ الدورة التالية' }, path: '/strategy-recalibration-page?tab=next', desc: { en: 'Initialize next planning cycle', ar: 'بدء دورة التخطيط التالية' }, permission: 'strategy_manage' },
];

// Demand & Resource Tools
const demandTools = [
  { icon: TrendingUp, label: { en: 'Demand Dashboard', ar: 'لوحة الطلب' }, path: '/strategy-demand-dashboard', desc: { en: 'Track strategy-driven demand', ar: 'تتبع الطلب المدفوع بالاستراتيجية' }, permission: 'strategy_view' },
  { icon: ClipboardList, label: { en: 'Action Plans', ar: 'خطط العمل' }, path: '/action-plan-page', desc: { en: 'Manage strategic action plans', ar: 'إدارة خطط العمل الاستراتيجية' }, permission: 'strategy_view' },
  { icon: Target, label: { en: 'National Alignment', ar: 'المواءمة الوطنية' }, path: '/national-strategy-linker-page', desc: { en: 'Link to Vision 2030 programs', ar: 'الربط ببرامج رؤية 2030' }, permission: 'strategy_view' },
];

// Phase workflow definition
const phases = [
  { key: 'preplanning', label: { en: 'Pre-Planning', ar: 'التخطيط المسبق' }, icon: Eye },
  { key: 'creation', label: { en: 'Creation', ar: 'الإنشاء' }, icon: FileText },
  { key: 'cascade', label: { en: 'Cascade', ar: 'التدرج' }, icon: Zap },
  { key: 'governance', label: { en: 'Governance', ar: 'الحوكمة' }, icon: Shield },
  { key: 'communication', label: { en: 'Communication', ar: 'التواصل' }, icon: MessageSquare },
  { key: 'monitoring', label: { en: 'Monitoring', ar: 'المراقبة' }, icon: BarChart3 },
  { key: 'evaluation', label: { en: 'Evaluation', ar: 'التقييم' }, icon: Target },
  { key: 'recalibration', label: { en: 'Recalibration', ar: 'إعادة المعايرة' }, icon: Settings },
];

function StrategyHub() {
  const { t, isRTL, language } = useLanguage();
  const { activePlanId, activePlan, strategicPlans: plans, isLoading: plansLoading } = useActivePlan();
  const { hasPermission, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState('workflow');
  const [activeAITool, setActiveAITool] = useState(null);
  
  // Use activePlanId from context
  const selectedPlanId = activePlanId || 'all';

  // Filter tools based on permissions
  const filterByPermission = (items) => {
    return items.filter(item => {
      if (!item.permission) return true; // No permission required
      if (isAdmin) return true; // Admin sees all
      return hasPermission(item.permission);
    });
  };

  const filteredCascadeGenerators = useMemo(() => filterByPermission(cascadeGenerators), [isAdmin, hasPermission]);
  const filteredGovernanceTools = useMemo(() => filterByPermission(governanceTools), [isAdmin, hasPermission]);
  const filteredCommunicationTools = useMemo(() => filterByPermission(communicationTools), [isAdmin, hasPermission]);
  const filteredPreplanningTools = useMemo(() => filterByPermission(preplanningTools), [isAdmin, hasPermission]);
  const filteredMonitoringTools = useMemo(() => filterByPermission(monitoringTools), [isAdmin, hasPermission]);
  const filteredDemandTools = useMemo(() => filterByPermission(demandTools), [isAdmin, hasPermission]);
  const filteredTemplateTools = useMemo(() => filterByPermission(templateTools), [isAdmin, hasPermission]);
  const filteredEvaluationTools = useMemo(() => filterByPermission(evaluationTools), [isAdmin, hasPermission]);
  const filteredRecalibrationTools = useMemo(() => filterByPermission(recalibrationTools), [isAdmin, hasPermission]);

  // Permission flags for showing/hiding entire sections
  const canManageStrategy = isAdmin || hasPermission('strategy_manage');
  const canCascadeStrategy = isAdmin || hasPermission('strategy_cascade');

  // plans are now provided by context via useActivePlan

  // Fetch approval requests for pending actions
  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ['pending-strategy-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('entity_type', 'strategic_plan')
        .eq('approval_status', 'pending')
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Filter plans based on selection
  const filteredPlans = selectedPlanId === 'all' 
    ? plans 
    : plans.filter(p => p.id === selectedPlanId);
  
  // Calculate metrics (based on all plans for overall stats)
  const activePlans = plans.filter(p => p.status === 'active').length;
  const draftPlans = plans.filter(p => p.status === 'draft').length;
  const avgProgress = filteredPlans.length > 0
    ? Math.round(filteredPlans.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / filteredPlans.length)
    : 0;

  // Determine current phase based on selected plan
  const getCurrentPhase = () => {
    if (filteredPlans.length === 0) return 0;
    const activePlan = selectedPlanId !== 'all' 
      ? filteredPlans[0] 
      : filteredPlans.find(p => p.status === 'active');
    if (!activePlan) return 1;
    // Simple heuristic based on progress
    if (activePlan.progress_percentage < 15) return 2;
    if (activePlan.progress_percentage < 40) return 3;
    if (activePlan.progress_percentage < 60) return 4;
    if (activePlan.progress_percentage < 75) return 5;
    if (activePlan.progress_percentage < 90) return 6;
    return 7;
  };

  const currentPhaseIndex = getCurrentPhase();

  // Render AI Tool Component
  const renderAITool = () => {
    switch (activeAITool) {
      case 'narrative':
        return <StrategicNarrativeGenerator />;
      case 'gap':
        return <StrategicGapProgramRecommender />;
      case 'whatif':
        return <WhatIfSimulator />;
      case 'bottleneck':
        return <BottleneckDetector />;
      default:
        return null;
    }
  };

  return (
    <div className={`container mx-auto py-6 px-4 space-y-6 ${isRTL ? 'rtl' : ''}`}>
      <ActivePlanBanner />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            {t({ en: 'Strategy Hub', ar: 'مركز الاستراتيجية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Central command for strategic planning and execution', ar: 'مركز القيادة للتخطيط والتنفيذ الاستراتيجي' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link to="/strategy-cockpit">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t({ en: 'Cockpit', ar: 'لوحة القيادة' })}
            </Link>
          </Button>
          <Button asChild>
            <Link to="/strategic-plan-builder">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'New Strategy', ar: 'استراتيجية جديدة' })}
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Active Plans', ar: 'الخطط النشطة' })}</p>
                <p className="text-2xl font-bold">{activePlans}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Drafts', ar: 'المسودات' })}</p>
                <p className="text-2xl font-bold">{draftPlans}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
                <p className="text-2xl font-bold">{avgProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Pending Actions', ar: 'الإجراءات المعلقة' })}</p>
                <p className="text-2xl font-bold">{pendingApprovals.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
          <TabsTrigger value="workflow" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Workflow className="h-4 w-4" />
            <span>{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            <span>{t({ en: 'Templates', ar: 'القوالب' })}</span>
          </TabsTrigger>
          <TabsTrigger value="cascade" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4" />
            <span>{t({ en: 'Cascade', ar: 'التدرج' })}</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            <span>{t({ en: 'Monitoring', ar: 'المراقبة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Shield className="h-4 w-4" />
            <span>{t({ en: 'Governance', ar: 'الحوكمة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Megaphone className="h-4 w-4" />
            <span>{t({ en: 'Comms', ar: 'التواصل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="preplanning" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Search className="h-4 w-4" />
            <span>{t({ en: 'Pre-Plan', ar: 'التخطيط' })}</span>
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Target className="h-4 w-4" />
            <span>{t({ en: 'Evaluation', ar: 'التقييم' })}</span>
          </TabsTrigger>
          <TabsTrigger value="recalibration" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4" />
            <span>{t({ en: 'Recalibrate', ar: 'إعادة المعايرة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Brain className="h-4 w-4" />
            <span>{t({ en: 'AI', ar: 'الذكاء' })}</span>
          </TabsTrigger>
        </TabsList>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          {/* Phase Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Strategic Lifecycle', ar: 'دورة حياة الاستراتيجية' })}</CardTitle>
              <CardDescription>
                {t({ en: 'Current phase and progress through the 8-phase methodology', ar: 'المرحلة الحالية والتقدم عبر منهجية المراحل الثمانية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                {phases.map((phase, index) => {
                  const Icon = phase.icon;
                  const isActive = index === currentPhaseIndex;
                  const isCompleted = index < currentPhaseIndex;
                  return (
                    <div key={phase.key} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 text-green-600' :
                        isActive ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>
                      <span className={`text-xs mt-1 text-center ${isActive ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                        {t(phase.label)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Progress value={(currentPhaseIndex / (phases.length - 1)) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Active Strategic Plans */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}</CardTitle>
                <CardDescription>{t({ en: 'Active and draft strategic plans', ar: 'الخطط الاستراتيجية النشطة والمسودات' })}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/strategy-drill-down">
                  {t({ en: 'View All', ar: 'عرض الكل' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {plansLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div>
              ) : plans.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">{t({ en: 'No strategic plans yet', ar: 'لا توجد خطط استراتيجية بعد' })}</p>
                  <Button className="mt-4" asChild>
                    <Link to="/strategic-plan-builder">{t({ en: 'Create First Plan', ar: 'إنشاء الخطة الأولى' })}</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {plans.slice(0, 5).map(plan => (
                    <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${plan.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`} />
                        <div>
                          <p className="font-medium">{isRTL ? plan.name_ar || plan.name_en : plan.name_en}</p>
                          <p className="text-sm text-muted-foreground">{plan.timeframe_start} - {plan.timeframe_end}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={plan.status === 'active' ? 'default' : 'secondary'}>
                          {plan.status}
                        </Badge>
                        <div className="w-24">
                          <Progress value={plan.progress_percentage || 0} className="h-1.5" />
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/strategy-drill-down?plan=${plan.id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monitoring Widgets */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Strategic Coverage', ar: 'التغطية الاستراتيجية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Challenges', 'Pilots', 'Programs', 'Partnerships'].map((entity, i) => (
                    <div key={entity} className="flex items-center justify-between">
                      <span className="text-sm">{entity}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={60 + i * 10} className="w-24 h-1.5" />
                        <span className="text-sm text-muted-foreground w-10">{60 + i * 10}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="link" className="mt-3 p-0" asChild>
                  <Link to="/strategy-alignment">{t({ en: 'View Details', ar: 'عرض التفاصيل' })}</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Pending Actions', ar: 'الإجراءات المعلقة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>{t({ en: 'No pending actions', ar: 'لا توجد إجراءات معلقة' })}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingApprovals.map(approval => (
                      <div key={approval.id} className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm">{approval.request_type}</span>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="link" className="mt-3 p-0" asChild>
                  <Link to="/strategy-governance-page">{t({ en: 'Manage Approvals', ar: 'إدارة الموافقات' })}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-600" />
                {t({ en: 'Strategy Template Library', ar: 'مكتبة قوالب الاستراتيجية' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'MoMAH Innovation & R&D strategy templates with coverage analysis and AI recommendations', ar: 'قوالب استراتيجيات الابتكار والبحث والتطوير لوزارة البلديات مع تحليل التغطية وتوصيات الذكاء الاصطناعي' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTemplateTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900">
                              <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-templates-page">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Template Library', ar: 'فتح مكتبة القوالب' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/strategic-plan-builder">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'Create from Scratch', ar: 'إنشاء من البداية' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Coverage Analysis', ar: 'تحليل التغطية' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Analyze templates against MoMAH service domains and innovation areas', ar: 'تحليل القوالب مقابل مجالات خدمات الوزارة ومجالات الابتكار' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'AI Recommendations', ar: 'توصيات الذكاء الاصطناعي' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Get AI-powered suggestions for new templates based on gaps', ar: 'احصل على اقتراحات مدعومة بالذكاء الاصطناعي لقوالب جديدة بناءً على الفجوات' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Vision 2030 Aligned', ar: 'متوافق مع رؤية 2030' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'All templates aligned with Saudi Vision 2030 programs', ar: 'جميع القوالب متوافقة مع برامج رؤية السعودية 2030' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monitoring Tab (Phase 6) */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                {t({ en: 'Strategy Monitoring & Review (Phase 6)', ar: 'مراقبة ومراجعة الاستراتيجية (المرحلة 6)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Real-time tracking of strategy execution, KPIs, alignment, and performance metrics', ar: 'تتبع تنفيذ الاستراتيجية ومؤشرات الأداء والمواءمة في الوقت الفعلي' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMonitoringTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-blue-400/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-cockpit">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Strategy Cockpit', ar: 'فتح لوحة القيادة' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/strategic-kpi-tracker">
                    <Target className="h-4 w-4 mr-2" />
                    {t({ en: 'KPI Tracker', ar: 'متتبع المؤشرات' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Real-time Dashboards', ar: 'لوحات الوقت الفعلي' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Live KPI tracking with automated alerts and progress updates', ar: 'تتبع المؤشرات مباشرة مع تنبيهات آلية وتحديثات التقدم' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Alignment Tracking', ar: 'تتبع المواءمة' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Monitor entity alignment with strategic objectives', ar: 'مراقبة مواءمة الكيانات مع الأهداف الاستراتيجية' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Gap Analysis', ar: 'تحليل الفجوات' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Identify coverage gaps and get AI recommendations', ar: 'تحديد فجوات التغطية والحصول على توصيات الذكاء الاصطناعي' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Demand & Resource Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                {t({ en: 'Demand & Resource Management', ar: 'إدارة الطلب والموارد' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Track strategy-driven demand, action plans, and national alignment', ar: 'تتبع الطلب المدفوع بالاستراتيجية وخطط العمل والمواءمة الوطنية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {filteredDemandTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Cascade Tab (Phase 3) */}
        <TabsContent value="cascade" className="space-y-6">
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                {t({ en: 'Strategy Cascade Generators (Phase 3)', ar: 'مولدات التدرج الاستراتيجي (المرحلة 3)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'AI-powered generation of entities aligned with strategic objectives across 8 entity types', ar: 'إنشاء كيانات بالذكاء الاصطناعي متوافقة مع الأهداف الاستراتيجية عبر 8 أنواع من الكيانات' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredCascadeGenerators.map(gen => {
                  const Icon = gen.icon;
                  return (
                    <Link
                      key={gen.path}
                      to={gen.path}
                      className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-orange-400/50 transition-all group"
                    >
                      <Icon className={`h-8 w-8 ${gen.color} group-hover:scale-110 transition-transform`} />
                      <span className="mt-2 text-sm font-medium text-center">{t(gen.label)}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-demand-dashboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Demand Dashboard', ar: 'فتح لوحة الطلب' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/action-plan-page">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    {t({ en: 'Action Plans', ar: 'خطط العمل' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cascade Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'AI-Powered Generation', ar: 'إنشاء بالذكاء الاصطناعي' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Automatically generate entities aligned with strategic objectives', ar: 'إنشاء كيانات تلقائياً متوافقة مع الأهداف الاستراتيجية' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Objective Linking', ar: 'ربط الأهداف' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'All generated entities linked to strategic objectives and KPIs', ar: 'جميع الكيانات المُنشأة مرتبطة بالأهداف الاستراتيجية ومؤشرات الأداء' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Quality Assurance', ar: 'ضمان الجودة' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'AI quality scoring and validation before entity creation', ar: 'تقييم جودة بالذكاء الاصطناعي والتحقق قبل إنشاء الكيانات' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Related Tools', ar: 'أدوات ذات صلة' })}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              <Button variant="outline" asChild>
                <Link to="/strategy-templates-page">
                  <FileText className="h-4 w-4 mr-2" />
                  {t({ en: 'Strategy Templates', ar: 'قوالب الاستراتيجية' })}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/national-strategy-linker-page">
                  <Target className="h-4 w-4 mr-2" />
                  {t({ en: 'National Alignment', ar: 'المواءمة الوطنية' })}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/baseline-data-page">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t({ en: 'Baseline Data', ar: 'البيانات الأساسية' })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance Tab (Phase 4) */}
        <TabsContent value="governance" className="space-y-6">
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                {t({ en: 'Strategy Governance & Approval (Phase 4)', ar: 'حوكمة الاستراتيجية والموافقات (المرحلة 4)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Manage approvals, version control, committee reviews, and strategic ownership', ar: 'إدارة الموافقات والتحكم بالإصدارات ومراجعات اللجان والملكية الاستراتيجية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGovernanceTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path + tool.tab} to={tool.path}>
                      <Card className="hover:border-purple-400/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                              <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t({ 
                                  en: tool.tab === 'signoff' ? 'Track stakeholder approvals and sign-offs' :
                                      tool.tab === 'versions' ? 'Manage strategy versions and history' :
                                      tool.tab === 'committee' ? 'Committee decision tracking and voting' :
                                      tool.path.includes('budget') ? 'Strategic budget allocation' :
                                      'Assign RACI ownership matrix',
                                  ar: tool.tab === 'signoff' ? 'تتبع موافقات وتوقيعات أصحاب المصلحة' :
                                      tool.tab === 'versions' ? 'إدارة إصدارات الاستراتيجية والتاريخ' :
                                      tool.tab === 'committee' ? 'تتبع قرارات اللجنة والتصويت' :
                                      tool.path.includes('budget') ? 'تخصيص الميزانية الاستراتيجية' :
                                      'تعيين مصفوفة ملكية RACI'
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-governance-page">
                    <Shield className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Governance Dashboard', ar: 'فتح لوحة الحوكمة' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/strategy-ownership-page">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Manage Ownership', ar: 'إدارة الملكية' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Governance Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Multi-Step Approvals', ar: 'موافقات متعددة الخطوات' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Configurable approval workflows with SLA tracking', ar: 'سير عمل موافقات قابلة للتكوين مع تتبع اتفاقية الخدمة' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Version History', ar: 'تاريخ الإصدارات' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Complete audit trail with change comparison', ar: 'مسار تدقيق كامل مع مقارنة التغييرات' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Committee Decisions', ar: 'قرارات اللجنة' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Track committee votes, decisions, and action items', ar: 'تتبع تصويتات اللجنة والقرارات وبنود العمل' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Communication Tab (Phase 5) */}
        <TabsContent value="communication" className="space-y-6">
          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-pink-600" />
                {t({ en: 'Strategy Communication & Publishing (Phase 5)', ar: 'التواصل والنشر الاستراتيجي (المرحلة 5)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Plan communications, generate impact stories, manage stakeholder notifications, and publish strategy publicly', ar: 'تخطيط الاتصالات وإنشاء قصص الأثر وإدارة إشعارات أصحاب المصلحة ونشر الاستراتيجية علنياً' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCommunicationTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-pink-400/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-pink-100 dark:bg-pink-900">
                              <Icon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-communication-page">
                    <Megaphone className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Communication Center', ar: 'فتح مركز التواصل' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/public-strategy-dashboard-page">
                    <Globe className="h-4 w-4 mr-2" />
                    {t({ en: 'Public Dashboard', ar: 'اللوحة العامة' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Communication Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Impact Stories', ar: 'قصص الأثر' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'AI-generated narratives from strategy outcomes', ar: 'سرديات مولدة بالذكاء الاصطناعي من نتائج الاستراتيجية' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Smart Notifications', ar: 'إشعارات ذكية' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Automated stakeholder notifications by role', ar: 'إشعارات آلية لأصحاب المصلحة حسب الدور' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Communication Analytics', ar: 'تحليلات التواصل' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Track engagement and reach metrics', ar: 'تتبع مقاييس المشاركة والوصول' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pre-Planning Tab (Phase 1) */}
        <TabsContent value="preplanning" className="space-y-6">
          <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white dark:from-teal-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" />
                {t({ en: 'Pre-Planning & Analysis (Phase 1)', ar: 'التخطيط المسبق والتحليل (المرحلة 1)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Environmental scanning, SWOT analysis, stakeholder mapping, risk assessment, and baseline data collection', ar: 'المسح البيئي وتحليل SWOT ورسم خرائط أصحاب المصلحة وتقييم المخاطر وجمع البيانات الأساسية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPreplanningTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-teal-400/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900">
                              <Icon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/environmental-scan-page">
                    <Search className="h-4 w-4 mr-2" />
                    {t({ en: 'Start Environmental Scan', ar: 'بدء المسح البيئي' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/swot-analysis-page">
                    <Layers className="h-4 w-4 mr-2" />
                    {t({ en: 'SWOT Analysis', ar: 'تحليل SWOT' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pre-Planning Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'PESTLE Analysis', ar: 'تحليل PESTLE' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Political, Economic, Social, Tech, Legal, Environmental factors', ar: 'العوامل السياسية والاقتصادية والاجتماعية والتقنية والقانونية والبيئية' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Risk Registry', ar: 'سجل المخاطر' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Identify, assess, and mitigate strategic risks', ar: 'تحديد وتقييم وتخفيف المخاطر الاستراتيجية' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <FileBarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Baseline Metrics', ar: 'مقاييس الأساس' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Establish baselines for measuring future progress', ar: 'وضع خطوط أساس لقياس التقدم المستقبلي' })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Related Planning Tools', ar: 'أدوات تخطيط ذات صلة' })}</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              <Button variant="outline" asChild>
                <Link to="/strategy-review-page">
                  <Settings className="h-4 w-4 mr-2" />
                  {t({ en: 'Adjustment Wizard', ar: 'معالج التعديل' })}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/strategy-timeline-page">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t({ en: 'Timeline Planning', ar: 'تخطيط الجدول الزمني' })}
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/strategy-feedback-dashboard">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t({ en: 'Feedback Dashboard', ar: 'لوحة التعليقات' })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluation Tab (Phase 7) */}
        <TabsContent value="evaluation" className="space-y-6">
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                {t({ en: 'Strategy Evaluation & Review (Phase 7)', ar: 'تقييم ومراجعة الاستراتيجية (المرحلة 7)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Expert evaluation panels, ROI analysis, case studies, lessons learned capture, and impact assessment', ar: 'لجان تقييم الخبراء وتحليل العائد على الاستثمار ودراسات الحالة وجمع الدروس المستفادة وتقييم الأثر' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {filteredEvaluationTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-green-400/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                              <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-review-page">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Evaluation Panel', ar: 'فتح لوحة التقييم' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/knowledge">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {t({ en: 'Knowledge Repository', ar: 'مستودع المعرفة' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Expert Panels', ar: 'لجان الخبراء' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Multi-stakeholder evaluation with scoring criteria', ar: 'تقييم متعدد أصحاب المصلحة مع معايير التسجيل' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'ROI Calculator', ar: 'حاسبة العائد' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Measure return on investment for strategic initiatives', ar: 'قياس العائد على الاستثمار للمبادرات الاستراتيجية' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                  <Lightbulb className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Capture and share organizational learnings', ar: 'جمع ومشاركة التعلم المؤسسي' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recalibration Tab (Phase 8) */}
        <TabsContent value="recalibration" className="space-y-6">
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                {t({ en: 'Strategy Recalibration (Phase 8)', ar: 'إعادة معايرة الاستراتيجية (المرحلة 8)' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'AI-powered feedback analysis, adjustment decision matrix, mid-cycle pivots, baseline recalibration, and next cycle initialization', ar: 'تحليل التعليقات بالذكاء الاصطناعي ومصفوفة قرار التعديل والتحويلات منتصف الدورة وإعادة معايرة الأساس وبدء الدورة التالية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecalibrationTools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.path} to={tool.path}>
                      <Card className="hover:border-indigo-400/50 transition-colors cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-indigo-100 dark:bg-indigo-900">
                              <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{t(tool.label)}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{t(tool.desc)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link to="/strategy-recalibration-page">
                    <Settings className="h-4 w-4 mr-2" />
                    {t({ en: 'Open Recalibration Center', ar: 'فتح مركز إعادة المعايرة' })}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/strategic-plan-builder">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'New Strategy Cycle', ar: 'دورة استراتيجية جديدة' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recalibration Features */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'AI Feedback Analysis', ar: 'تحليل التعليقات بالذكاء الاصطناعي' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Sentiment analysis and theme extraction from feedback', ar: 'تحليل المشاعر واستخراج المواضيع من التعليقات' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mb-3">
                  <Layers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Decision Matrix', ar: 'مصفوفة القرار' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Data-driven adjustment recommendations', ar: 'توصيات تعديل مبنية على البيانات' })}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{t({ en: 'Next Cycle Init', ar: 'بدء الدورة التالية' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Carry forward learnings to next planning cycle', ar: 'نقل التعلم إلى دورة التخطيط التالية' })}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="ai" className="space-y-6">
          {activeAITool ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t(aiAssistants.find(a => a.key === activeAITool)?.label || { en: 'AI Tool', ar: 'أداة الذكاء' })}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveAITool(null)}>
                  {t({ en: 'Back to Tools', ar: 'العودة للأدوات' })}
                </Button>
              </CardHeader>
              <CardContent>
                {renderAITool()}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                {aiAssistants.map(ai => {
                  const Icon = ai.icon;
                  return (
                    <Card key={ai.key} className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setActiveAITool(ai.key)}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{t(ai.label)}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{t(ai.desc)}</p>
                            <Button size="sm" className="mt-3">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {t({ en: 'Launch', ar: 'إطلاق' })}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'AI-Powered Analysis', ar: 'التحليل بالذكاء الاصطناعي' })}</CardTitle>
                  <CardDescription>
                    {t({ en: 'Advanced strategic analysis powered by AI', ar: 'تحليل استراتيجي متقدم مدعوم بالذكاء الاصطناعي' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-3 flex-wrap">
                  <Button variant="outline" asChild>
                    <Link to="/strategy-review-page">
                      {t({ en: 'Strategy Review', ar: 'مراجعة الاستراتيجية' })}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/strategy-alignment">
                      {t({ en: 'Alignment Analysis', ar: 'تحليل المواءمة' })}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/strategy-copilot-chat">
                      <Brain className="h-4 w-4 mr-2" />
                      {t({ en: 'Strategy Copilot', ar: 'مساعد الاستراتيجية' })}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(StrategyHub, { requiredPermissions: ['strategy_view'] });