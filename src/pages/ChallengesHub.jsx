import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useChallengesHubData } from '@/hooks/useChallengesHubData';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { usePermissions } from '@/components/permissions/usePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Target,
  Workflow,
  Sparkles,
  Shield,
  BarChart3,
  FileText,
  Users,
  FlaskConical,
  Building2,
  Microscope,
  GitBranch,
  CheckCircle2,
  Clock,
  ArrowRight,
  Brain,
  TrendingUp,
  Settings,
  Eye,
  Megaphone,
  BookOpen,
  Bell,
  ClipboardList,
  Layers,
  AlertTriangle,
  FileBarChart,
  Plus,
  Send,
  Archive,
  Network,
  Map,
  Activity,
  Award,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useChallengeListRealtime } from '@/hooks/useChallengeRealtime';

// Workflow phases for challenges
const workflowPhases = [
  { key: 'intake', label: { en: 'Intake', ar: 'الاستقبال' }, icon: FileText, description: { en: 'Create & Import', ar: 'إنشاء واستيراد' } },
  { key: 'review', label: { en: 'Review', ar: 'المراجعة' }, icon: CheckCircle2, description: { en: 'Triage & Validate', ar: 'الفرز والتحقق' } },
  { key: 'treatment', label: { en: 'Treatment', ar: 'المعالجة' }, icon: Activity, description: { en: 'Plan & Execute', ar: 'تخطيط وتنفيذ' } },
  { key: 'resolution', label: { en: 'Resolution', ar: 'الحل' }, icon: Target, description: { en: 'Close & Archive', ar: 'إغلاق وأرشفة' } },
];

// Intake Tools
const intakeTools = [
  { icon: Plus, label: { en: 'Create Challenge', ar: 'إنشاء تحدي' }, path: '/challenge-create', desc: { en: 'Manual entry wizard', ar: 'معالج الإدخال اليدوي' }, permission: 'challenge_create' },
  { icon: FileBarChart, label: { en: 'Bulk Import', ar: 'استيراد مجمع' }, path: '/challenge-import', desc: { en: 'CSV/Excel import', ar: 'استيراد CSV/Excel' }, permission: 'challenge_create' },
  { icon: Brain, label: { en: 'AI Intake Wizard', ar: 'معالج الاستقبال الذكي' }, path: '/challenges?tab=ai-intake', desc: { en: 'AI-assisted challenge capture', ar: 'التقاط التحديات بمساعدة الذكاء الاصطناعي' }, permission: 'challenge_create' },
  { icon: ThumbsUp, label: { en: 'Citizen Ideas', ar: 'أفكار المواطنين' }, path: '/ideas-management', desc: { en: 'Convert citizen ideas to challenges', ar: 'تحويل أفكار المواطنين إلى تحديات' }, permission: 'challenge_create' },
  { icon: GitBranch, label: { en: 'Strategy Derivation', ar: 'الاشتقاق الاستراتيجي' }, path: '/strategy-challenge-generator-page', desc: { en: 'Derive from strategic gaps', ar: 'اشتقاق من الفجوات الاستراتيجية' }, permission: 'strategy_cascade' },
];

// Review Tools
const reviewTools = [
  { icon: ClipboardList, label: { en: 'Review Queue', ar: 'قائمة المراجعة' }, path: '/challenge-review-queue', desc: { en: 'Pending challenges for review', ar: 'التحديات المعلقة للمراجعة' }, permission: 'challenge_review' },
  { icon: CheckCircle2, label: { en: 'Approval Center', ar: 'مركز الموافقات' }, path: '/approvals?entity=challenge', desc: { en: 'Approve/reject challenges', ar: 'الموافقة/الرفض على التحديات' }, permission: 'challenge_approve' },
  { icon: Users, label: { en: 'Expert Evaluation', ar: 'تقييم الخبراء' }, path: '/expert-evaluation-workflow?entity=challenge', desc: { en: 'Assign expert panels', ar: 'تعيين لجان الخبراء' }, permission: 'expert_manage' },
  { icon: Layers, label: { en: 'Clustering', ar: 'التجميع' }, path: '/challenges?tab=clustering', desc: { en: 'Group similar challenges', ar: 'تجميع التحديات المتشابهة' }, permission: 'challenge_manage' },
  { icon: Share2, label: { en: 'Merge Workflow', ar: 'سير دمج' }, path: '/challenges?tab=merge', desc: { en: 'Merge duplicate challenges', ar: 'دمج التحديات المتكررة' }, permission: 'challenge_manage' },
];

// Treatment Tools
const treatmentTools = [
  { icon: Target, label: { en: 'Track Assignment', ar: 'تعيين المسار' }, path: '/challenges?tab=track-assignment', desc: { en: 'Assign treatment track', ar: 'تعيين مسار المعالجة' }, permission: 'challenge_manage' },
  { icon: FlaskConical, label: { en: 'Pilot Conversion', ar: 'التحويل لتجربة' }, path: '/pilot-create', desc: { en: 'Convert to pilot project', ar: 'تحويل إلى مشروع تجريبي' }, permission: 'pilot_create' },
  { icon: Microscope, label: { en: 'R&D Call Matcher', ar: 'مطابقة دعوات البحث' }, path: '/challenge-rd-call-matcher', desc: { en: 'Match challenges to R&D calls', ar: 'مطابقة التحديات مع دعوات البحث' }, permission: 'rd_manage' },
  { icon: Building2, label: { en: 'Solution Matching', ar: 'مطابقة الحلول' }, path: '/challenge-solution-matching', desc: { en: 'Match with existing solutions', ar: 'مطابقة مع الحلول الموجودة' }, permission: 'challenge_manage' },
  { icon: FileText, label: { en: 'Proposal Review', ar: 'مراجعة المقترحات' }, path: '/challenge-proposal-review', desc: { en: 'Review provider proposals', ar: 'مراجعة مقترحات مقدمي الحلول' }, permission: 'challenge_manage' },
  { icon: Megaphone, label: { en: 'RFP Generator', ar: 'مولد طلب العروض' }, path: '/challenges?tab=rfp', desc: { en: 'Generate RFP documents', ar: 'إنشاء مستندات طلب العروض' }, permission: 'challenge_manage' },
];

// Resolution Tools
const resolutionTools = [
  { icon: CheckCircle2, label: { en: 'Resolution Tracker', ar: 'متتبع الحل' }, path: '/challenge-resolution-tracker', desc: { en: 'Track resolution progress', ar: 'تتبع تقدم الحل' }, permission: 'challenge_manage' },
  { icon: BookOpen, label: { en: 'Lessons Learned', ar: 'الدروس المستفادة' }, path: '/knowledge?type=lessons-learned&entity=challenge', desc: { en: 'Capture learnings', ar: 'توثيق الدروس' }, permission: 'challenge_view' },
  { icon: FileBarChart, label: { en: 'Impact Report', ar: 'تقرير الأثر' }, path: '/challenges?tab=impact', desc: { en: 'Generate impact reports', ar: 'إنشاء تقارير الأثر' }, permission: 'challenge_view' },
  { icon: Archive, label: { en: 'Archive', ar: 'الأرشفة' }, path: '/challenges?status=archived', desc: { en: 'Archived challenges', ar: 'التحديات المؤرشفة' }, permission: 'challenge_view' },
  { icon: Award, label: { en: 'Case Studies', ar: 'دراسات الحالة' }, path: '/case-study-create', desc: { en: 'Create case studies', ar: 'إنشاء دراسات حالة' }, permission: 'knowledge_create' },
  { icon: Shield, label: { en: 'Full Audit', ar: 'التدقيق الكامل' }, path: '/challenge-detail-full-audit', desc: { en: 'Complete challenge audit', ar: 'تدقيق شامل للتحديات' }, permission: 'admin_access' },
  { icon: Network, label: { en: 'Cross-Reference', ar: 'المراجع المتقاطعة' }, path: '/challenge-system-cross-reference', desc: { en: 'System cross-reference', ar: 'المراجع المتقاطعة للنظام' }, permission: 'admin_access' },
];

// Analytics Tools
const analyticsTools = [
  { icon: BarChart3, label: { en: 'Challenge Analytics', ar: 'تحليلات التحديات' }, path: '/challenge-analytics-dashboard', desc: { en: 'Portfolio analytics', ar: 'تحليلات المحفظة' }, permission: 'challenge_view' },
  { icon: Map, label: { en: 'Geographic Map', ar: 'الخريطة الجغرافية' }, path: '/national-map?entity=challenge', desc: { en: 'Challenge distribution map', ar: 'خريطة توزيع التحديات' }, permission: 'challenge_view' },
  { icon: TrendingUp, label: { en: 'Trends', ar: 'الاتجاهات' }, path: '/trends?entity=challenge', desc: { en: 'Challenge trends', ar: 'اتجاهات التحديات' }, permission: 'challenge_view' },
  { icon: Network, label: { en: 'Cross-City Learning', ar: 'التعلم عبر المدن' }, path: '/cross-city-learning-hub', desc: { en: 'Share learnings', ar: 'مشاركة التعلم' }, permission: 'challenge_view' },
  { icon: AlertTriangle, label: { en: 'SLA Monitor', ar: 'مراقب SLA' }, path: '/challenges?tab=sla', desc: { en: 'Track SLA compliance', ar: 'تتبع الامتثال لـ SLA' }, permission: 'challenge_manage' },
];

// AI Tools
const aiTools = [
  { icon: Brain, label: { en: 'AI Portfolio Analysis', ar: 'تحليل المحفظة الذكي' }, desc: { en: 'Analyze challenge patterns', ar: 'تحليل أنماط التحديات' } },
  { icon: Sparkles, label: { en: 'Innovation Framing', ar: 'تأطير الابتكار' }, desc: { en: 'AI-powered problem framing', ar: 'تأطير المشكلة بالذكاء الاصطناعي' } },
  { icon: Target, label: { en: 'Solution Recommender', ar: 'موصي الحلول' }, desc: { en: 'AI solution suggestions', ar: 'اقتراحات حلول ذكية' } },
  { icon: TrendingUp, label: { en: 'Impact Forecaster', ar: 'متنبئ الأثر' }, desc: { en: 'Predict challenge impact', ar: 'توقع أثر التحديات' } },
];

function ChallengesHub() {
  const { t, isRTL, language } = useLanguage();
  const { hasPermission, isAdmin, isDeputyship, isMunicipality } = usePermissions();
  const [activeTab, setActiveTab] = useState('workflow');
  const [activeAITool, setActiveAITool] = useState(null);

  // Filter tools based on permissions
  const filterByPermission = (items) => {
    return items.filter(item => {
      if (!item.permission) return true;
      if (isAdmin) return true;
      return hasPermission(item.permission);
    });
  };

  const filteredIntakeTools = useMemo(() => filterByPermission(intakeTools), [isAdmin, hasPermission]);
  const filteredReviewTools = useMemo(() => filterByPermission(reviewTools), [isAdmin, hasPermission]);
  const filteredTreatmentTools = useMemo(() => filterByPermission(treatmentTools), [isAdmin, hasPermission]);
  const filteredResolutionTools = useMemo(() => filterByPermission(resolutionTools), [isAdmin, hasPermission]);
  const filteredAnalyticsTools = useMemo(() => filterByPermission(analyticsTools), [isAdmin, hasPermission]);

  // Fetch challenge metrics
  const { data: challenges = [], isLoading: challengesLoading } = useChallengesWithVisibility({ limit: 1000 });

  // Enable realtime updates for challenge list (rt-1, live-1)
  const { isConnected: realtimeConnected } = useChallengeListRealtime();

  // Fetch pending approvals and recent proposals via hook
  const { pendingApprovals, recentProposals } = useChallengesHubData();

  // Calculate metrics
  const metrics = useMemo(() => {
    const byStatus = {
      draft: challenges.filter(c => c.status === 'draft').length,
      submitted: challenges.filter(c => c.status === 'submitted').length,
      under_review: challenges.filter(c => c.status === 'under_review').length,
      approved: challenges.filter(c => c.status === 'approved').length,
      in_treatment: challenges.filter(c => c.status === 'in_treatment').length,
      resolved: challenges.filter(c => c.status === 'resolved').length,
      archived: challenges.filter(c => c.status === 'archived').length,
    };

    const byPriority = {
      tier_1: challenges.filter(c => c.priority === 'tier_1').length,
      tier_2: challenges.filter(c => c.priority === 'tier_2').length,
      tier_3: challenges.filter(c => c.priority === 'tier_3').length,
      tier_4: challenges.filter(c => c.priority === 'tier_4').length,
    };

    const withPilots = challenges.filter(c => c.linked_pilot_ids?.length > 0).length;
    const withRD = challenges.filter(c => c.linked_rd_ids?.length > 0).length;
    const published = challenges.filter(c => c.is_published).length;
    const featured = challenges.filter(c => c.is_featured).length;

    return {
      total: challenges.length,
      byStatus,
      byPriority,
      withPilots,
      withRD,
      published,
      featured,
      pendingReview: byStatus.submitted + byStatus.under_review,
      active: byStatus.approved + byStatus.in_treatment,
      resolutionRate: challenges.length > 0 ? Math.round((byStatus.resolved / challenges.length) * 100) : 0
    };
  }, [challenges]);

  const renderToolGrid = (tools) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tools.map((tool, idx) => (
        <Link key={idx} to={createPageUrl(tool.path?.replace('/', '') || 'challenges')}>
          <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {t(tool.label)}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {t(tool.desc)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Target}
        title={{ en: 'Challenges Hub', ar: 'مركز التحديات' }}
        description={{ en: 'Centralized challenge management and lifecycle tracking', ar: 'إدارة مركزية للتحديات وتتبع دورة الحياة' }}
        actions={
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Challenges')}>
              <Button variant="outline" size="sm">
                <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'View All', ar: 'عرض الكل' })}
              </Button>
            </Link>
            {hasPermission('challenge_create') && (
              <Link to={createPageUrl('ChallengeCreate')}>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'New Challenge', ar: 'تحدي جديد' })}
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Total Challenges', ar: 'إجمالي التحديات' })}</p>
                </div>
                <Target className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{metrics.pendingReview}</p>
                  <p className="text-xs text-blue-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-900">{metrics.active}</p>
                  <p className="text-xs text-purple-600">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-900">{metrics.byStatus.resolved}</p>
                  <p className="text-xs text-green-600">{t({ en: 'Resolved', ar: 'تم الحل' })}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-900">{metrics.byPriority.tier_1}</p>
                  <p className="text-xs text-red-600">{t({ en: 'Tier 1 Priority', ar: 'أولوية المستوى 1' })}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-900">{metrics.resolutionRate}%</p>
                  <p className="text-xs text-amber-600">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Phases Visual */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              {t({ en: 'Challenge Lifecycle', ar: 'دورة حياة التحدي' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {workflowPhases.map((phase, idx) => (
                <div key={phase.key} className="flex items-center flex-1 min-w-[140px]">
                  <div className="flex-1 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${idx === 0 ? 'bg-blue-100 text-blue-600' :
                      idx === 1 ? 'bg-yellow-100 text-yellow-600' :
                        idx === 2 ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                      }`}>
                      <phase.icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{t(phase.label)}</p>
                    <p className="text-xs text-muted-foreground">{t(phase.description)}</p>
                    <Badge variant="outline" className="mt-1">
                      {idx === 0 ? metrics.byStatus.draft :
                        idx === 1 ? metrics.pendingReview :
                          idx === 2 ? metrics.active :
                            metrics.byStatus.resolved}
                    </Badge>
                  </div>
                  {idx < workflowPhases.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="workflow" className="gap-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t({ en: 'Analytics', ar: 'التحليلات' })}</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{t({ en: 'AI Tools', ar: 'أدوات الذكاء' })}</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">{t({ en: 'Activity', ar: 'النشاط' })}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t({ en: 'Settings', ar: 'الإعدادات' })}</span>
            </TabsTrigger>
          </TabsList>

          {/* Workflow Tab */}
          <TabsContent value="workflow" className="mt-6 space-y-6">
            {/* Intake Phase */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t({ en: 'Intake', ar: 'الاستقبال' })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Create and import challenges', ar: 'إنشاء واستيراد التحديات' })}</p>
                </div>
              </div>
              {renderToolGrid(filteredIntakeTools)}
            </div>

            {/* Review Phase */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t({ en: 'Review & Validation', ar: 'المراجعة والتحقق' })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Triage, validate, and approve challenges', ar: 'فرز والتحقق والموافقة على التحديات' })}</p>
                </div>
              </div>
              {renderToolGrid(filteredReviewTools)}
            </div>

            {/* Treatment Phase */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t({ en: 'Treatment', ar: 'المعالجة' })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Plan and execute challenge resolution', ar: 'تخطيط وتنفيذ حل التحديات' })}</p>
                </div>
              </div>
              {renderToolGrid(filteredTreatmentTools)}
            </div>

            {/* Resolution Phase */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{t({ en: 'Resolution & Archive', ar: 'الحل والأرشفة' })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ en: 'Close challenges and capture learnings', ar: 'إغلاق التحديات وتوثيق الدروس' })}</p>
                </div>
              </div>
              {renderToolGrid(filteredResolutionTools)}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t({ en: 'Status Distribution', ar: 'توزيع الحالات' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(metrics.byStatus).map(([status, count]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress value={metrics.total > 0 ? (count / metrics.total) * 100 : 0} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t({ en: 'Priority Distribution', ar: 'توزيع الأولويات' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(metrics.byPriority).map(([priority, count]) => (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{priority.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <Progress
                        value={metrics.total > 0 ? (count / metrics.total) * 100 : 0}
                        className={`h-2 ${priority === 'tier_1' ? '[&>div]:bg-red-500' :
                          priority === 'tier_2' ? '[&>div]:bg-orange-500' :
                            priority === 'tier_3' ? '[&>div]:bg-yellow-500' :
                              '[&>div]:bg-green-500'
                          }`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tools */}
            <div>
              <h3 className="font-semibold mb-4">{t({ en: 'Analytics Tools', ar: 'أدوات التحليلات' })}</h3>
              {renderToolGrid(filteredAnalyticsTools)}
            </div>
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai" className="mt-6">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {t({ en: 'AI-Powered Tools', ar: 'أدوات الذكاء الاصطناعي' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Leverage AI to analyze challenges, recommend solutions, and predict outcomes', ar: 'استفد من الذكاء الاصطناعي لتحليل التحديات والتوصية بالحلول والتنبؤ بالنتائج' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiTools.map((tool, idx) => (
                    <Card key={idx} className="cursor-pointer hover:border-purple-400 transition-all" onClick={() => setActiveAITool(tool.key)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <tool.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{t(tool.label)}</h4>
                            <p className="text-sm text-muted-foreground">{t(tool.desc)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    {t({ en: 'Pending Approvals', ar: 'الموافقات المعلقة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingApprovals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t({ en: 'No pending approvals', ar: 'لا توجد موافقات معلقة' })}</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingApprovals.map((approval) => (
                        <div key={approval.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{approval.request_type}</p>
                            <p className="text-xs text-muted-foreground">{approval.requester_email}</p>
                          </div>
                          <Link to={createPageUrl(`Approvals?id=${approval.id}`)}>
                            <Button size="sm" variant="outline">
                              {t({ en: 'Review', ar: 'مراجعة' })}
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Proposals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Send className="h-4 w-4 text-blue-600" />
                    {t({ en: 'Recent Proposals', ar: 'المقترحات الأخيرة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentProposals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t({ en: 'No recent proposals', ar: 'لا توجد مقترحات حديثة' })}</p>
                  ) : (
                    <div className="space-y-3">
                      {recentProposals.map((proposal) => (
                        <div key={proposal.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{proposal.title}</p>
                            <p className="text-xs text-muted-foreground">{proposal.challenges?.code || 'Unknown'}</p>
                          </div>
                          <Badge variant={proposal.status === 'submitted' ? 'default' : 'secondary'}>
                            {proposal.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Challenge Settings', ar: 'إعدادات التحديات' })}</CardTitle>
                <CardDescription>
                  {t({ en: 'Configure challenge management settings', ar: 'تكوين إعدادات إدارة التحديات' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to={createPageUrl('SettingsWorkflow?entity=challenge')}>
                    <Card className="hover:border-primary/50 cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Workflow className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t({ en: 'Workflow Configuration', ar: 'تكوين سير العمل' })}</p>
                          <p className="text-sm text-muted-foreground">{t({ en: 'Status transitions, SLAs', ar: 'انتقالات الحالة، SLAs' })}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to={createPageUrl('EmailTemplateManager?entity=challenge')}>
                    <Card className="hover:border-primary/50 cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Bell className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{t({ en: 'Notification Templates', ar: 'قوالب الإشعارات' })}</p>
                          <p className="text-sm text-muted-foreground">{t({ en: 'Email and in-app notifications', ar: 'الإشعارات بالبريد وداخل التطبيق' })}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(ChallengesHub, { requiredPermissions: ['challenge_view'] });
