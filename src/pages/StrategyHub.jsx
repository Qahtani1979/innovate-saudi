import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
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

// Cascade Generator Cards
const cascadeGenerators = [
  { icon: Lightbulb, label: { en: 'Challenges', ar: 'التحديات' }, path: '/strategy-challenge-generator-page', color: 'text-orange-500' },
  { icon: FlaskConical, label: { en: 'Pilots', ar: 'التجارب' }, path: '/strategy-pilot-generator-page', color: 'text-blue-500' },
  { icon: FileText, label: { en: 'Policies', ar: 'السياسات' }, path: '/strategy-policy-generator-page', color: 'text-purple-500' },
  { icon: Microscope, label: { en: 'R&D Calls', ar: 'طلبات البحث' }, path: '/strategy-rd-call-generator-page', color: 'text-green-500' },
  { icon: Users, label: { en: 'Partnerships', ar: 'الشراكات' }, path: '/strategy-partnership-generator-page', color: 'text-pink-500' },
  { icon: Calendar, label: { en: 'Events', ar: 'الفعاليات' }, path: '/strategy-event-generator-page', color: 'text-amber-500' },
  { icon: Building2, label: { en: 'Living Labs', ar: 'المختبرات الحية' }, path: '/strategy-living-lab-generator-page', color: 'text-cyan-500' },
  { icon: MessageSquare, label: { en: 'Campaigns', ar: 'الحملات' }, path: '/strategy-campaign-generator-page', color: 'text-rose-500' },
];

// AI Assistants with component keys
const aiAssistants = [
  { key: 'narrative', icon: Brain, label: { en: 'Narrative Generator', ar: 'مولد السرد' }, desc: { en: 'Generate strategic narratives', ar: 'إنشاء سرديات استراتيجية' } },
  { key: 'gap', icon: Target, label: { en: 'Gap Recommender', ar: 'توصيات الفجوات' }, desc: { en: 'Find coverage gaps', ar: 'البحث عن فجوات التغطية' } },
  { key: 'whatif', icon: TrendingUp, label: { en: 'What-If Simulator', ar: 'محاكي السيناريوهات' }, desc: { en: 'Budget scenarios', ar: 'سيناريوهات الميزانية' } },
  { key: 'bottleneck', icon: Zap, label: { en: 'Bottleneck Detector', ar: 'كاشف الاختناقات' }, desc: { en: 'Find pipeline issues', ar: 'البحث عن مشاكل خط الأنابيب' } },
];

// Governance Tools
const governanceTools = [
  { icon: CheckCircle2, label: { en: 'Signoff Tracker', ar: 'متتبع الموافقات' }, path: '/strategy-governance-page', tab: 'signoff' },
  { icon: GitBranch, label: { en: 'Version Control', ar: 'التحكم بالإصدارات' }, path: '/strategy-governance-page', tab: 'versions' },
  { icon: Users, label: { en: 'Committee Review', ar: 'مراجعة اللجنة' }, path: '/strategy-governance-page', tab: 'committee' },
  { icon: Settings, label: { en: 'Ownership', ar: 'الملكية' }, path: '/strategy-ownership-page' },
];

// Communication Tools
const communicationTools = [
  { icon: Megaphone, label: { en: 'Communication Planner', ar: 'مخطط التواصل' }, path: '/strategy-communication-page', desc: { en: 'Plan and schedule communications', ar: 'تخطيط وجدولة التواصل' } },
  { icon: BookOpen, label: { en: 'Impact Stories', ar: 'قصص الأثر' }, path: '/strategy-communication-page?tab=stories', desc: { en: 'Generate impact narratives', ar: 'إنشاء سرديات الأثر' } },
  { icon: Bell, label: { en: 'Notifications', ar: 'الإشعارات' }, path: '/strategy-communication-page?tab=notifications', desc: { en: 'Manage stakeholder alerts', ar: 'إدارة تنبيهات أصحاب المصلحة' } },
  { icon: BarChart3, label: { en: 'Analytics', ar: 'التحليلات' }, path: '/strategy-communication-page?tab=analytics', desc: { en: 'Communication metrics', ar: 'مقاييس التواصل' } },
  { icon: Globe, label: { en: 'Public Dashboard', ar: 'اللوحة العامة' }, path: '/public-strategy-dashboard-page', desc: { en: 'Public-facing view', ar: 'العرض العام' } },
  { icon: Eye, label: { en: 'Public View', ar: 'العرض العام' }, path: '/strategy-public-view-page', desc: { en: 'Share strategy externally', ar: 'مشاركة الاستراتيجية خارجياً' } },
];

// Preplanning Tools
const preplanningTools = [
  { icon: Search, label: { en: 'Environmental Scan', ar: 'المسح البيئي' }, path: '/environmental-scan-page', desc: { en: 'PESTLE analysis', ar: 'تحليل PESTLE' } },
  { icon: Layers, label: { en: 'SWOT Analysis', ar: 'تحليل SWOT' }, path: '/swot-analysis-page', desc: { en: 'Strengths, weaknesses, opportunities, threats', ar: 'نقاط القوة والضعف والفرص والتهديدات' } },
  { icon: Users, label: { en: 'Stakeholder Analysis', ar: 'تحليل أصحاب المصلحة' }, path: '/stakeholder-analysis-page', desc: { en: 'Map key stakeholders', ar: 'رسم خريطة أصحاب المصلحة' } },
  { icon: AlertTriangle, label: { en: 'Risk Assessment', ar: 'تقييم المخاطر' }, path: '/risk-assessment-page', desc: { en: 'Identify and assess risks', ar: 'تحديد وتقييم المخاطر' } },
  { icon: FileBarChart, label: { en: 'Baseline Data', ar: 'البيانات الأساسية' }, path: '/baseline-data-page', desc: { en: 'Collect baseline metrics', ar: 'جمع المقاييس الأساسية' } },
  { icon: ClipboardList, label: { en: 'Strategy Inputs', ar: 'مدخلات الاستراتيجية' }, path: '/strategy-input-page', desc: { en: 'Gather strategic inputs', ar: 'جمع المدخلات الاستراتيجية' } },
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
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('workflow');
  const [activeAITool, setActiveAITool] = useState(null);

  // Fetch strategic plans
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['strategic-plans-hub'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

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

  // Calculate metrics
  const activePlans = plans.filter(p => p.status === 'active').length;
  const draftPlans = plans.filter(p => p.status === 'draft').length;
  const avgProgress = plans.length > 0
    ? Math.round(plans.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / plans.length)
    : 0;

  // Determine current phase based on active plans
  const getCurrentPhase = () => {
    if (plans.length === 0) return 0;
    const activePlan = plans.find(p => p.status === 'active');
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
    <div className={`container mx-auto py-6 px-4 ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            {t({ en: 'Strategy Hub', ar: 'مركز الاستراتيجية' })}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t({ en: 'Central command for strategic planning and execution', ar: 'مركز القيادة للتخطيط والتنفيذ الاستراتيجي' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/strategy-cockpit">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t({ en: 'Cockpit', ar: 'لوحة القيادة' })}
            </Link>
          </Button>
          <Button asChild>
            <Link to="/strategic-planning">
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            <span className="hidden md:inline">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="cascade" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden md:inline">{t({ en: 'Cascade', ar: 'التدرج' })}</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">{t({ en: 'Governance', ar: 'الحوكمة' })}</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            <span className="hidden md:inline">{t({ en: 'Communication', ar: 'التواصل' })}</span>
          </TabsTrigger>
          <TabsTrigger value="preplanning" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">{t({ en: 'Pre-Planning', ar: 'التخطيط المسبق' })}</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">{t({ en: 'AI Tools', ar: 'أدوات الذكاء' })}</span>
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
                    <Link to="/strategic-planning">{t({ en: 'Create First Plan', ar: 'إنشاء الخطة الأولى' })}</Link>
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

        {/* Cascade Tab */}
        <TabsContent value="cascade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Strategy Cascade Generators', ar: 'مولدات التدرج الاستراتيجي' })}</CardTitle>
              <CardDescription>
                {t({ en: 'Generate entities aligned with strategic objectives', ar: 'إنشاء كيانات متوافقة مع الأهداف الاستراتيجية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cascadeGenerators.map(gen => {
                  const Icon = gen.icon;
                  return (
                    <Link
                      key={gen.path}
                      to={gen.path}
                      className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all group"
                    >
                      <Icon className={`h-8 w-8 ${gen.color} group-hover:scale-110 transition-transform`} />
                      <span className="mt-2 text-sm font-medium text-center">{t(gen.label)}</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Quick Links', ar: 'روابط سريعة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/strategy-templates-page">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'Strategy Templates', ar: 'قوالب الاستراتيجية' })}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/national-strategy-linker-page">
                    <Target className="h-4 w-4 mr-2" />
                    {t({ en: 'National Alignment', ar: 'المواءمة الوطنية' })}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/baseline-data-page">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t({ en: 'Baseline Data', ar: 'البيانات الأساسية' })}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/action-plan-page">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    {t({ en: 'Action Plans', ar: 'خطط العمل' })}
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t({ en: 'Recent Generations', ar: 'الإنشاءات الأخيرة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t({ en: 'Generated entities will appear here', ar: 'ستظهر الكيانات المُنشأة هنا' })}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Governance Tab */}
        <TabsContent value="governance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {governanceTools.map(tool => {
              const Icon = tool.icon;
              return (
                <Link key={tool.path + tool.tab} to={tool.path}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{t(tool.label)}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t({ 
                              en: tool.tab === 'signoff' ? 'Track stakeholder approvals' :
                                  tool.tab === 'versions' ? 'Manage strategy versions' :
                                  tool.tab === 'committee' ? 'Committee decision tracking' :
                                  'Assign strategic ownership',
                              ar: tool.tab === 'signoff' ? 'تتبع موافقات أصحاب المصلحة' :
                                  tool.tab === 'versions' ? 'إدارة إصدارات الاستراتيجية' :
                                  tool.tab === 'committee' ? 'تتبع قرارات اللجنة' :
                                  'تعيين الملكية الاستراتيجية'
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

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Governance Dashboard', ar: 'لوحة الحوكمة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/strategy-governance-page">
                  <Shield className="h-4 w-4 mr-2" />
                  {t({ en: 'Open Full Dashboard', ar: 'فتح اللوحة الكاملة' })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            {communicationTools.map(tool => {
              const Icon = tool.icon;
              return (
                <Link key={tool.path} to={tool.path}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-3">
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

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Communication Hub', ar: 'مركز التواصل' })}</CardTitle>
              <CardDescription>{t({ en: 'Manage all strategy communication from one place', ar: 'إدارة جميع اتصالات الاستراتيجية من مكان واحد' })}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/strategy-communication-page">
                  <Megaphone className="h-4 w-4 mr-2" />
                  {t({ en: 'Open Communication Center', ar: 'فتح مركز التواصل' })}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pre-Planning Tab */}
        <TabsContent value="preplanning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Pre-Planning Tools', ar: 'أدوات التخطيط المسبق' })}</CardTitle>
              <CardDescription>
                {t({ en: 'Gather inputs and analyze the environment before strategy creation', ar: 'جمع المدخلات وتحليل البيئة قبل إنشاء الاستراتيجية' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {preplanningTools.map(tool => {
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

          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Strategy Review & Adjustment', ar: 'مراجعة وتعديل الاستراتيجية' })}</CardTitle>
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