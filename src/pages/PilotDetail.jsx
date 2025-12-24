import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import WorkflowStatus from '../components/WorkflowStatus';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Target,
  Activity,
  Shield,
  MessageSquare,
  Send,
  Clock,
  Users,
  Zap,
  BookOpen,
  Video,
  Award,
  Database,
  BarChart3,
  TestTube,
  Image,
  Rocket,
  Pause,
  Play,
  XCircle,
  RotateCcw,
  Loader2,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Textarea } from "@/components/ui/textarea";

import { toast } from 'sonner';
import { usePrompt } from '@/hooks/usePrompt';
import { PILOT_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/pilots/pilotDetail';
import MultiStepApproval from '../components/MultiStepApproval';
import FinancialTracker from '../components/FinancialTracker';
import RegulatoryCompliance from '../components/RegulatoryCompliance';
import AnomalyDetector from '../components/AnomalyDetector';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import MilestoneTracker from '../components/MilestoneTracker';
import AISuccessPredictor from '../components/AISuccessPredictor';
import EnhancedKPITracker from '../components/EnhancedKPITracker';
import AIPeerComparison from '../components/AIPeerComparison';
import CrossEntityRecommender from '../components/CrossEntityRecommender';
import StakeholderEngagementTracker from '../components/StakeholderEngagementTracker';
import PilotSubmissionWizard from '../components/PilotSubmissionWizard';
import PilotTerminationWorkflow from '../components/PilotTerminationWorkflow';
import PilotPreparationChecklist from '../components/PilotPreparationChecklist';
import PilotEvaluationGate from '../components/PilotEvaluationGate';
import PilotPivotWorkflow from '../components/PilotPivotWorkflow';
import ComplianceGateChecklist from '../components/ComplianceGateChecklist';
import BudgetApprovalWorkflow from '../components/BudgetApprovalWorkflow';
import MilestoneApprovalGate from '../components/MilestoneApprovalGate';
import ProtectedPage from '../components/permissions/ProtectedPage';
import PolicyTabWidget from '../components/policy/PolicyTabWidget';
import SolutionFeedbackLoop from '../components/pilots/SolutionFeedbackLoop';

import { usePilot, usePilotApprovals, usePilotComments, usePilotExpertEvaluations } from '@/hooks/usePilots';
import { usePilotMutations } from '@/hooks/usePilotMutations';

function PilotDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const pilotId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const { invoke: invokeAI, status: aiStatus, isLoading: aiLoadingHook, isAvailable, rateLimitInfo } = usePrompt(null);

  const { data: pilot, isLoading } = usePilot(pilotId);
  const { data: approvals = [] } = usePilotApprovals(pilotId);
  const { comments = [], addComment } = usePilotComments(pilotId);
  const { data: expertEvaluations = [] } = usePilotExpertEvaluations(pilotId);
  const { updatePilot } = usePilotMutations();

  // Destructure related entities for easier access
  const challenge = pilot?.challenge;
  const solution = pilot?.solution;
  const municipality = pilot?.municipality;
  const region = pilot?.region;
  const city = pilot?.city;
  const livingLab = pilot?.living_lab;
  const sandbox = pilot?.sandbox;

  const [comment, setComment] = useState('');
  const [user, setUser] = useState(null);

  const [holdReason, setHoldReason] = useState('');
  const [showSubmissionWizard, setShowSubmissionWizard] = useState(false);
  const [showTermination, setShowTermination] = useState(false);
  const [showPreparation, setShowPreparation] = useState(false);
  const [showEvaluationGate, setShowEvaluationGate] = useState(false);
  const [showPivot, setShowPivot] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [showBudgetApproval, setShowBudgetApproval] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const { user: authUser } = useAuth();
  React.useEffect(() => {
    if (authUser) setUser({ id: authUser.id, email: authUser.email });
  }, [authUser]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment({
      pilot_id: pilotId,
      content: comment,
      user_email: user?.email || 'Unknown',
      created_at: new Date().toISOString()
    });
    setComment('');
  };

  const handleHoldPilot = async () => {
    if (!holdReason) return;
    await updatePilot.mutateAsync({
      id: pilotId,
      data: {
        stage: 'on_hold',
        hold_reason: holdReason,
        hold_date: new Date().toISOString()
      }
    });
    setHoldReason('');
    toast.success(t({ en: 'Pilot paused', ar: 'تم إيقاف التجربة' }));
  };

  const handleResumePilot = async () => {
    await updatePilot.mutateAsync({
      id: pilotId,
      data: {
        stage: 'active',
        resumed_date: new Date().toISOString()
      }
    });
    toast.success(t({ en: 'Pilot resumed', ar: 'تم استئناف التجربة' }));
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    setAiLoading(true);
    try {
      // Use centralized prompt template
      const promptConfig = PILOT_DETAIL_PROMPT_TEMPLATE({
        ...pilot,
        municipality_name: municipality?.name_en,
        challenge_title: challenge?.title_en,
        solution_name: solution?.name_en
      });

      const result = await invokeAI({
        prompt: promptConfig.prompt,
        system_prompt: promptConfig.system,
        response_json_schema: promptConfig.schema
      });
      if (result.success) {
        setAiInsights(result.data);
      } else {
        toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading || !pilot) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const stageColors = {
    pre_pilot: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    evaluation: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    scaled: 'bg-teal-100 text-teal-700',
    terminated: 'bg-red-100 text-red-700'
  };

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600'
  };

  // Mock KPI trend data
  const kpiTrendData = [
    { week: 'W1', value: 125 },
    { week: 'W2', value: 118 },
    { week: 'W3', value: 105 },
    { week: 'W4', value: 92 },
    { week: 'W5', value: 78 },
    { week: 'W6', value: 65 },
  ];

  const stageConfig = {
    design: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    approval_pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    preparation: { color: 'bg-purple-100 text-purple-700', icon: Activity },
    active: { color: 'bg-green-100 text-green-700', icon: Zap },
    monitoring: { color: 'bg-teal-100 text-teal-700', icon: Activity },
    evaluation: { color: 'bg-amber-100 text-amber-700', icon: BarChart3 },
    completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    scaled: { color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
    terminated: { color: 'bg-red-100 text-red-700', icon: AlertCircle },
    on_hold: { color: 'bg-gray-100 text-gray-700', icon: AlertTriangle }
  };

  const stageInfo = stageConfig[pilot.stage] || stageConfig.design;
  const StageIcon = stageInfo.icon;

  return (
    <PageLayout>
      {/* Workflow Modals */}
      {showSubmissionWizard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <PilotSubmissionWizard pilot={pilot} onClose={() => setShowSubmissionWizard(false)} />
          </div>
        </div>
      )}
      {showTermination && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <PilotTerminationWorkflow pilot={pilot} onClose={() => setShowTermination(false)} />
          </div>
        </div>
      )}
      {showPreparation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <PilotPreparationChecklist pilot={pilot} onClose={() => setShowPreparation(false)} />
          </div>
        </div>
      )}
      {showEvaluationGate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <PilotEvaluationGate pilot={pilot} onClose={() => setShowEvaluationGate(false)} />
          </div>
        </div>
      )}
      {showPivot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <PilotPivotWorkflow pilot={pilot} onClose={() => setShowPivot(false)} />
          </div>
        </div>
      )}
      {showCompliance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ComplianceGateChecklist pilot={pilot} onClose={() => setShowCompliance(false)} />
          </div>
        </div>
      )}
      {showBudgetApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <BudgetApprovalWorkflow pilot={pilot} phase="phase_1" onClose={() => setShowBudgetApproval(false)} />
          </div>
        </div>
      )}
      {selectedMilestone !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <MilestoneApprovalGate
              pilot={pilot}
              milestone={pilot.milestones[selectedMilestone]}
              milestoneIndex={selectedMilestone}
              onClose={() => setSelectedMilestone(null)}
            />
          </div>
        </div>
      )}


      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {pilot.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {pilot.code}
                  </Badge>
                )}
                <Badge className={`${stageInfo.color} flex items-center gap-1`}>
                  <StageIcon className="h-3 w-3" />
                  {pilot.stage?.replace(/_/g, ' ')}
                </Badge>
                {pilot.risk_level && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    {pilot.risk_level} {t({ en: 'risk', ar: 'مخاطر' })}
                  </Badge>
                )}
                {pilot.is_flagship && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t({ en: 'Flagship', ar: 'رائد' })}
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
              </h1>
              {(pilot.tagline_en || pilot.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && pilot.tagline_ar ? pilot.tagline_ar : pilot.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                {municipality && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en}</span>
                  </div>
                )}
                {pilot.sector && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{pilot.sector.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {pilot.tags && pilot.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="bg-white/20 border-white/40 text-white">
                      {pilot.tags[0]}
                    </Badge>
                  </div>
                )}
                {pilot.timeline?.pilot_start && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{pilot.timeline.pilot_start}</span>
                  </div>
                )}
                {pilot.duration_weeks && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{pilot.duration_weeks} {t({ en: 'weeks', ar: 'أسبوع' })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {pilot.stage === 'design' && (
                <Button onClick={() => setShowSubmissionWizard(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Submit', ar: 'تقديم' })}
                </Button>
              )}
              {pilot.stage === 'approved' && (
                <>
                  <Button onClick={() => setShowPreparation(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Prepare', ar: 'تحضير' })}
                  </Button>
                  <Link to={createPageUrl(`PilotLaunchWizard?id=${pilotId}`)}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Rocket className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Launch', ar: 'إطلاق' })}
                    </Button>
                  </Link>
                </>
              )}
              {pilot.stage === 'preparation' && !pilot.compliance_passed && (
                <Button onClick={() => setShowCompliance(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Shield className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Compliance', ar: 'الامتثال' })}
                </Button>
              )}
              {['active', 'monitoring'].includes(pilot.stage) && (
                <>
                  <Link to={createPageUrl('PilotMonitoringDashboard')}>
                    <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                      <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Monitor', ar: 'مراقبة' })}
                    </Button>
                  </Link>
                  <Button onClick={() => setShowEvaluationGate(true)} className="bg-amber-600 hover:bg-amber-700">
                    <Award className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Evaluate', ar: 'تقييم' })}
                  </Button>
                  <Button onClick={() => setShowPivot(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <RotateCcw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Pivot', ar: 'تغيير' })}
                  </Button>
                </>
              )}
              {!['terminated', 'completed', 'scaled'].includes(pilot.stage) && (
                <Button onClick={() => setShowTermination(true)} variant="outline" className="bg-white/20 border-red-400 text-white hover:bg-red-600/30">
                  <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Terminate', ar: 'إنهاء' })}
                </Button>
              )}
              <Link to={createPageUrl(`PilotEdit?id=${pilotId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
              <Button className="bg-white text-blue-600 hover:bg-white/90" onClick={handleAIInsights}>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing pilot...', ar: 'جاري تحليل التجربة...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.success_factors?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Success Factors', ar: 'عوامل النجاح' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.success_factors.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.risk_mitigation?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.risk_mitigation.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.kpi_suggestions?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'KPI Suggestions', ar: 'اقتراحات المؤشرات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.kpi_suggestions.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.scaling_potential?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Scaling Potential', ar: 'إمكانية التوسع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.scaling_potential.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.stakeholder_engagement?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Stakeholder Engagement', ar: 'إشراك أصحاب المصلحة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.stakeholder_engagement.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Success Probability', ar: 'احتمالية النجاح' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {pilot.success_probability || 70}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'TRL Level', ar: 'المستوى التقني' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {pilot.trl_current || pilot.trl_start || 'N/A'}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {pilot.budget ? `${(pilot.budget / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {pilot.duration_weeks || 8}w
                </p>
              </div>
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</p>
                <p className="text-3xl font-bold text-teal-600">{pilot.team?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Challenge', ar: 'التحدي' })}</p>
              {challenge ? (
                <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="text-sm text-blue-600 hover:underline">
                  {challenge.code}
                </Link>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Solution', ar: 'الحل' })}</p>
              {solution ? (
                <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="text-sm text-blue-600 hover:underline">
                  {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                </Link>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
            {municipality && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Municipality', ar: 'البلدية' })}</p>
                <p className="text-sm">{language === 'ar' && municipality.name_ar ? municipality.name_ar : municipality.name_en}</p>
              </div>
            )}
            {region && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Region', ar: 'المنطقة' })}</p>
                <p className="text-sm">{language === 'ar' && region.name_ar ? region.name_ar : region.name_en}</p>
              </div>
            )}
            {city && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'City', ar: 'المدينة' })}</p>
                <p className="text-sm">{language === 'ar' && city.name_ar ? city.name_ar : city.name_en}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sector', ar: 'القطاع' })}</p>
              <p className="text-sm capitalize">{pilot.sector?.replace(/_/g, ' ')}</p>
            </div>
            {pilot.sub_sector && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sub-Sector', ar: 'القطاع الفرعي' })}</p>
                <p className="text-sm">{pilot.sub_sector}</p>
              </div>
            )}
            {livingLab && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Living Lab', ar: 'المختبر' })}</p>
                <p className="text-sm">{livingLab.name}</p>
              </div>
            )}
            {sandbox && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sandbox', ar: 'منطقة الاختبار' })}</p>
                <p className="text-sm">{sandbox.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</p>
              <p className="text-sm">{pilot.timeline?.pilot_start || 'TBD'}</p>
            </div>
            {pilot.timeline?.pilot_end && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</p>
                <p className="text-sm">{pilot.timeline.pilot_end}</p>
              </div>
            )}
            {pilot.sandbox_zone && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sandbox Zone', ar: 'منطقة الاختبار' })}</p>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {pilot.sandbox_zone}
                </p>
              </div>
            )}
            {pilot.tags && pilot.tags.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Tags', ar: 'الوسوم' })}</p>
                <div className="flex flex-wrap gap-1">
                  {pilot.tags.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                  {pilot.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{pilot.tags.length - 3}</Badge>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Status Flags', ar: 'حالات النشر' })}</p>
              <div className="flex flex-wrap gap-1">
                {pilot.is_published && <Badge className="bg-green-100 text-green-700 text-xs">{t({ en: 'Published', ar: 'منشور' })}</Badge>}
                {pilot.is_flagship && <Badge className="bg-amber-100 text-amber-700 text-xs">{t({ en: 'Flagship', ar: 'رائد' })}</Badge>}
                {pilot.is_archived && <Badge className="bg-slate-100 text-slate-700 text-xs">{t({ en: 'Archived', ar: 'مؤرشف' })}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="workflow_approvals" className="space-y-6">
            <TabsList className="grid w-full grid-cols-12 h-auto">
              <TabsTrigger value="workflow_approvals" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="prediction" className="flex flex-col gap-1 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'AI', ar: 'ذكاء' })}</span>
              </TabsTrigger>
              <TabsTrigger value="kpis" className="flex flex-col gap-1 py-3">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'KPIs', ar: 'مؤشرات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex flex-col gap-1 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Budget', ar: 'ميزانية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Team', ar: 'فريق' })}</span>
              </TabsTrigger>
              <TabsTrigger value="risks" className="flex flex-col gap-1 py-3">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Risks', ar: 'مخاطر' })}</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Compliance', ar: 'امتثال' })}</span>
              </TabsTrigger>
              <TabsTrigger value="sandbox" className="flex flex-col gap-1 py-3">
                <TestTube className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Sandbox', ar: 'منطقة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex flex-col gap-1 py-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Timeline', ar: 'جدول' })}</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex flex-col gap-1 py-3">
                <Database className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Data', ar: 'بيانات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Results', ar: 'نتائج' })}</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
                <Image className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="experts" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Experts', ar: 'خبراء' })}</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex flex-col gap-1 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'AI Links', ar: 'روابط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="policy" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Policy', ar: 'سياسة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="conversions" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Next Steps', ar: 'الخطوات' })}</span>
              </TabsTrigger>
            </TabsList>

            {/* Workflow & Approvals Tab */}
            <TabsContent value="workflow_approvals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Workflow Status', ar: 'حالة سير العمل' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkflowStatus approvals={pilot?.approvals || []} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Prediction Tab */}
            <TabsContent value="prediction" className="space-y-6">
              <AISuccessPredictor pilot={pilot} />
              <AIPeerComparison pilot={pilot} />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <MultiStepApproval entity={pilot} entityType="Pilot" currentUser={user} />

                  <Card>
                    <CardHeader>
                      <CardTitle>{t({ en: 'Description', ar: 'الوصف' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && pilot.description_ar ? 'rtl' : 'ltr'}>
                        {language === 'ar' && pilot.description_ar ? pilot.description_ar : (pilot.description_en || t({ en: 'No description provided', ar: 'لا يوجد وصف' }))}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t({ en: 'Objectives', ar: 'الأهداف' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-700" dir={language === 'ar' && pilot.objective_ar ? 'rtl' : 'ltr'}>
                        {language === 'ar' && pilot.objective_ar ? pilot.objective_ar : (pilot.objective_en || t({ en: 'Test and validate solution effectiveness in real-world conditions', ar: 'اختبار وتقييم فعالية الحل في ظروف الواقع' }))}
                      </p>
                    </CardContent>
                  </Card>

                  {pilot.hypothesis && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t({ en: 'Hypothesis', ar: 'الفرضية' })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{pilot.hypothesis}</p>
                      </CardContent>
                    </Card>
                  )}

                  {pilot.methodology && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t({ en: 'Methodology', ar: 'المنهجية' })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{pilot.methodology}</p>
                      </CardContent>
                    </Card>
                  )}

                  {pilot.scope && (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t({ en: 'Scope', ar: 'النطاق' })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{pilot.scope}</p>
                      </CardContent>
                    </Card>
                  )}

                  {pilot.ai_insights && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                          <Sparkles className="h-5 w-5" />
                          {t({ en: 'AI Insights', ar: 'الرؤى الذكية' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-blue-900">{pilot.ai_insights}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  {challenge && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-blue-900 text-sm">
                          {t({ en: 'Challenge', ar: 'التحدي' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="text-blue-900 hover:text-blue-700">
                          <p className="font-medium">{challenge.code}</p>
                          <p className="text-sm">{language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}</p>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {solution && (
                    <Card className="border-purple-200 bg-purple-50">
                      <CardHeader>
                        <CardTitle className="text-purple-900 text-sm">
                          {t({ en: 'Solution', ar: 'الحل' })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="text-purple-900 hover:text-purple-700">
                          <p className="font-medium">{language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}</p>
                          <p className="text-sm">{solution.provider_name}</p>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {pilot.target_population && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t({ en: 'Target Population', ar: 'الفئة المستهدفة' })}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {pilot.target_population.size && (
                          <div>
                            <span className="text-slate-500">{t({ en: 'Size:', ar: 'الحجم:' })}</span> {pilot.target_population.size}
                          </div>
                        )}
                        {pilot.target_population.demographics && (
                          <p className="text-slate-700">{pilot.target_population.demographics}</p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <FinancialTracker entity={pilot} entityType="Pilot" />

              {pilot.budget_breakdown && pilot.budget_breakdown.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Budget Breakdown', ar: 'تفاصيل الميزانية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pilot.budget_breakdown.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{item.category}</p>
                            {item.description && <p className="text-xs text-slate-500">{item.description}</p>}
                          </div>
                          <p className="font-bold">{(item.amount || 0).toLocaleString()} {pilot.budget_currency || 'SAR'}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {pilot.funding_sources && pilot.funding_sources.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Funding Sources', ar: 'مصادر التمويل' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {pilot.funding_sources.map((fs, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{fs.source}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold">{(fs.amount || 0).toLocaleString()} {pilot.budget_currency || 'SAR'}</p>
                            <Badge className={fs.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                              {fs.confirmed ? t({ en: 'Confirmed', ar: 'مؤكد' }) : t({ en: 'Pending', ar: 'قيد الانتظار' })}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance">
              <RegulatoryCompliance pilot={pilot} />
            </TabsContent>

            {/* KPIs Tab */}
            <TabsContent value="kpis" className="space-y-6">
              <EnhancedKPITracker pilot={pilot} />
              <AnomalyDetector kpis={pilot.kpis || []} entityName="Pilot" />

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'KPI Dashboard', ar: 'لوحة مؤشرات الأداء' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {pilot.kpis && pilot.kpis.length > 0 ? (
                    pilot.kpis.map((kpi, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{kpi.name}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-slate-500">{t({ en: 'Baseline:', ar: 'الأساس:' })}</span>{' '}
                                <span className="font-medium">{kpi.baseline}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">{t({ en: 'Target:', ar: 'الهدف:' })}</span>{' '}
                                <span className="font-medium text-green-600">{kpi.target}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">{t({ en: 'Current:', ar: 'الحالي:' })}</span>{' '}
                                <span className="font-medium text-blue-600">{kpi.current || '78'}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={
                            kpi.status === 'on_track' ? 'bg-green-100 text-green-700' :
                              kpi.status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                          }>
                            {kpi.status || 'on_track'}
                          </Badge>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'No KPIs defined yet', ar: 'لم يتم تحديد مؤشرات أداء بعد' })}</p>
                    </div>
                  )}

                  <div className="pt-6 border-t">
                    <p className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Complaint Trend (Last 6 Weeks)', ar: 'اتجاه الشكاوى (آخر 6 أسابيع)' })}</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={kpiTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <StakeholderEngagementTracker pilot={pilot} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Team Members', ar: 'أعضاء الفريق' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pilot.team && pilot.team.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pilot.team.map((member, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.role}</p>
                          {member.organization && (
                            <p className="text-xs text-slate-500">{member.organization}</p>
                          )}
                          {member.email && (
                            <p className="text-xs text-blue-600 mt-1">{member.email}</p>
                          )}
                          {member.responsibility && (
                            <p className="text-xs text-slate-600 mt-2">{member.responsibility}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      {t({ en: 'No team members listed', ar: 'لا يوجد أعضاء فريق' })}
                    </p>
                  )}
                </CardContent>
              </Card>

              {pilot.stakeholders && pilot.stakeholders.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pilot.stakeholders.map((stakeholder, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-slate-900">{stakeholder.name}</p>
                            <Badge variant="outline">{stakeholder.type}</Badge>
                          </div>
                          {stakeholder.involvement && (
                            <p className="text-sm text-slate-600 mt-1">{stakeholder.involvement}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    {t({ en: 'Risk Register', ar: 'سجل المخاطر' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pilot.risks && pilot.risks.length > 0 ? (
                    <div className="space-y-4">
                      {pilot.risks.map((risk, idx) => (
                        <div key={idx} className={`p-4 border-l-4 rounded-r-lg ${risk.probability === 'high' || risk.impact === 'high' ? 'border-red-500 bg-red-50' :
                          risk.probability === 'medium' || risk.impact === 'medium' ? 'border-amber-500 bg-amber-50' :
                            'border-green-500 bg-green-50'
                          }`}>
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-slate-900">{risk.risk}</p>
                            <Badge className={
                              risk.status === 'mitigated' ? 'bg-green-100 text-green-700' :
                                risk.status === 'occurred' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                            }>
                              {risk.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div>
                              <span className="text-slate-500">{t({ en: 'Probability:', ar: 'الاحتمال:' })}</span> {risk.probability}
                            </div>
                            <div>
                              <span className="text-slate-500">{t({ en: 'Impact:', ar: 'التأثير:' })}</span> {risk.impact}
                            </div>
                          </div>
                          {risk.mitigation && (
                            <p className="text-sm text-slate-700 mt-2">
                              <span className="font-medium">{t({ en: 'Mitigation:', ar: 'التخفيف:' })}</span> {risk.mitigation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      {t({ en: 'No risks identified', ar: 'لا توجد مخاطر' })}
                    </p>
                  )}
                </CardContent>
              </Card>

              {pilot.issues && pilot.issues.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Issues Log', ar: 'سجل القضايا' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pilot.issues.map((issue, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-slate-900">{issue.issue}</p>
                            <Badge className={
                              issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                issue.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                            }>
                              {issue.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>{t({ en: 'Severity:', ar: 'الخطورة:' })} {issue.severity}</span>
                            {issue.raised_date && <span>{t({ en: 'Raised:', ar: 'تاريخ الإبلاغ:' })} {issue.raised_date}</span>}
                          </div>
                          {issue.resolution && (
                            <p className="text-sm text-slate-700 mt-2">{issue.resolution}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data" className="space-y-6">
              {pilot.target_population && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Target Population', ar: 'الفئة المستهدفة' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pilot.target_population.size && (
                      <div className="p-3 bg-slate-50 rounded">
                        <p className="text-xs text-slate-500">{t({ en: 'Population Size', ar: 'حجم السكان' })}</p>
                        <p className="text-lg font-bold">{pilot.target_population.size.toLocaleString()}</p>
                      </div>
                    )}
                    {pilot.target_population.demographics && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{t({ en: 'Demographics', ar: 'التركيبة السكانية' })}</p>
                        <p className="text-sm">{pilot.target_population.demographics}</p>
                      </div>
                    )}
                    {pilot.target_population.location && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{t({ en: 'Location', ar: 'الموقع' })}</p>
                        <p className="text-sm">{pilot.target_population.location}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {pilot.public_engagement && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Public Engagement', ar: 'المشاركة العامة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {pilot.public_engagement.community_sessions && (
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <p className="text-2xl font-bold text-blue-600">{pilot.public_engagement.community_sessions}</p>
                          <p className="text-xs text-slate-600">{t({ en: 'Sessions Held', ar: 'جلسات عُقدت' })}</p>
                        </div>
                      )}
                      {pilot.public_engagement.feedback_collected && (
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <p className="text-2xl font-bold text-purple-600">{pilot.public_engagement.feedback_collected}</p>
                          <p className="text-xs text-slate-600">{t({ en: 'Feedback Items', ar: 'بنود الملاحظات' })}</p>
                        </div>
                      )}
                      {pilot.public_engagement.satisfaction_score && (
                        <div className="text-center p-3 bg-green-50 rounded">
                          <p className="text-2xl font-bold text-green-600">{pilot.public_engagement.satisfaction_score}%</p>
                          <p className="text-xs text-slate-600">{t({ en: 'Satisfaction', ar: 'الرضا' })}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-6">
                {pilot.data_collection && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-teal-600" />
                        {t({ en: 'Data Collection', ar: 'جمع البيانات' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pilot.data_collection.methods && pilot.data_collection.methods.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Methods:', ar: 'الطرق:' })}</p>
                          <div className="flex flex-wrap gap-2">
                            {pilot.data_collection.methods.map((method, idx) => (
                              <Badge key={idx} variant="outline">{method}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {pilot.data_collection.frequency && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t({ en: 'Frequency:', ar: 'التكرار:' })}</p>
                          <p className="text-sm text-slate-600">{pilot.data_collection.frequency}</p>
                        </div>
                      )}
                      {pilot.data_collection.tools && pilot.data_collection.tools.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Tools:', ar: 'الأدوات:' })}</p>
                          <div className="flex flex-wrap gap-2">
                            {pilot.data_collection.tools.map((tool, idx) => (
                              <Badge key={idx} variant="outline">{tool}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {pilot.technology_stack && pilot.technology_stack.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        {t({ en: 'Technology Stack', ar: 'المكدس التقني' })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pilot.technology_stack.map((tech, idx) => (
                          <div key={idx} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{tech.technology}</p>
                                {tech.category && (
                                  <Badge variant="outline" className="text-xs mt-1">{tech.category}</Badge>
                                )}
                              </div>
                              {tech.version && (
                                <Badge variant="outline" className="text-xs">{tech.version}</Badge>
                              )}
                            </div>
                            {tech.purpose && (
                              <p className="text-sm text-slate-600 mt-2">{tech.purpose}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Sandbox Tab */}
            <TabsContent value="sandbox">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Sandbox Configuration', ar: 'تكوين منطقة الاختبار' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pilot.sandbox_zone && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Test Zone', ar: 'منطقة الاختبار' })}</p>
                      <div className="p-3 bg-slate-50 rounded-lg border flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{pilot.sandbox_zone}</span>
                      </div>
                    </div>
                  )}

                  {pilot.regulatory_exemptions && pilot.regulatory_exemptions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Regulatory Exemptions', ar: 'الإعفاءات التنظيمية' })}</p>
                      <div className="space-y-2">
                        {pilot.regulatory_exemptions.map((exemption, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>{exemption}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pilot.safety_protocols && pilot.safety_protocols.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Safety Protocols', ar: 'بروتوكولات السلامة' })}</p>
                      <div className="space-y-2">
                        {pilot.safety_protocols.map((protocol, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>{protocol}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              {pilot.timeline && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {t({ en: 'Key Dates', ar: 'التواريخ الرئيسية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pilot.timeline.design_start && (
                        <div className="p-3 bg-slate-50 rounded">
                          <p className="text-xs text-slate-500">{t({ en: 'Design Start', ar: 'بدء التصميم' })}</p>
                          <p className="text-sm font-medium">{pilot.timeline.design_start}</p>
                        </div>
                      )}
                      {pilot.timeline.approval_date && (
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="text-xs text-slate-500">{t({ en: 'Approval Date', ar: 'تاريخ الموافقة' })}</p>
                          <p className="text-sm font-medium">{pilot.timeline.approval_date}</p>
                        </div>
                      )}
                      {pilot.timeline.prep_start && (
                        <div className="p-3 bg-purple-50 rounded">
                          <p className="text-xs text-slate-500">{t({ en: 'Prep Start', ar: 'بدء التحضير' })}</p>
                          <p className="text-sm font-medium">{pilot.timeline.prep_start}</p>
                        </div>
                      )}
                      {pilot.timeline.pilot_start && (
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-xs text-slate-500">{t({ en: 'Pilot Start', ar: 'بدء التجربة' })}</p>
                          <p className="text-sm font-medium">{pilot.timeline.pilot_start}</p>
                        </div>
                      )}
                      {pilot.timeline.pilot_end && (
                        <div className="p-3 bg-amber-50 rounded">
                          <p className="text-xs text-slate-500">{t({ en: 'Pilot End', ar: 'نهاية التجربة' })}</p>
                          <p className="text-sm font-medium">{pilot.timeline.pilot_end}</p>
                        </div>
                      )}
                      {pilot.timeline.evaluation_end && (
                        <div className="p-3 bg-teal-50 rounded">
                          <p className="text-xs text-slate-500">{t({ en: 'Evaluation End', ar: 'نهاية التقييم' })}</p>
                          <p className="text-sm font-medium">{pilot.timeline.evaluation_end}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <MilestoneTracker pilot={pilot} />

              {pilot.pivot_history && pilot.pivot_history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-amber-600" />
                      {t({ en: 'Pivot History', ar: 'سجل التغييرات' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pilot.pivot_history.map((pivot, i) => (
                        <div key={i} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className="bg-amber-100 text-amber-700">{pivot.type?.replace(/_/g, ' ')}</Badge>
                            <span className="text-xs text-slate-500">{new Date(pivot.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-900 mb-2">{pivot.rationale}</p>
                          {pivot.proposed_changes && (
                            <p className="text-xs text-slate-600">{pivot.proposed_changes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              {pilot.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={pilot.image_url} alt={pilot.title_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}

              {pilot.gallery_urls && pilot.gallery_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {pilot.gallery_urls.map((url, idx) => (
                        <img key={idx} src={url} alt={`Gallery ${idx + 1}`} className="w-full rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {pilot.video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-red-600" />
                      {t({ en: 'Video', ar: 'فيديو' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <video src={pilot.video_url} controls className="w-full rounded-lg">
                      {t({ en: 'Your browser does not support video playback.', ar: 'متصفحك لا يدعم تشغيل الفيديو.' })}
                    </video>
                  </CardContent>
                </Card>
              )}

              {pilot.tags && pilot.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Tags', ar: 'الوسوم' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {pilot.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {pilot.media_coverage && pilot.media_coverage.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Media Coverage', ar: 'التغطية الإعلامية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pilot.media_coverage.map((media, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{media.outlet}</p>
                              <p className="text-sm text-slate-600">{media.date}</p>
                            </div>
                            <Badge className={
                              media.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                media.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                  'bg-slate-100 text-slate-700'
                            }>
                              {media.sentiment}
                            </Badge>
                          </div>
                          {media.url && (
                            <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                              {t({ en: 'View Article', ar: 'عرض المقال' })}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Evaluation Tab */}
            <TabsContent value="evaluation">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Pilot Evaluation', ar: 'تقييم التجربة' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {pilot.evaluation_summary_en || pilot.evaluation_summary_ar ? (
                    <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && pilot.evaluation_summary_ar ? 'rtl' : 'ltr'}>
                      {language === 'ar' && pilot.evaluation_summary_ar ? pilot.evaluation_summary_ar : pilot.evaluation_summary_en}
                    </p>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'Evaluation pending - pilot in progress', ar: 'التقييم قيد الانتظار - التجربة جارية' })}</p>
                    </div>
                  )}

                  {pilot.recommendation && (
                    <div className={`p-4 rounded-lg border-2 ${pilot.recommendation === 'scale' ? 'bg-green-50 border-green-300' :
                      pilot.recommendation === 'iterate' ? 'bg-yellow-50 border-yellow-300' :
                        pilot.recommendation === 'terminate' ? 'bg-red-50 border-red-300' :
                          'bg-slate-50 border-slate-300'
                      }`}>
                      <p className="font-semibold text-lg mb-1">
                        {t({ en: 'Recommendation:', ar: 'التوصية:' })} {pilot.recommendation.toUpperCase()}
                      </p>
                      <p className="text-sm text-slate-600">
                        {pilot.recommendation === 'scale' && t({ en: 'Pilot met success criteria. Ready for scaling.', ar: 'استوفت التجربة معايير النجاح. جاهزة للتوسع.' })}
                        {pilot.recommendation === 'iterate' && t({ en: 'Pilot shows promise but needs refinement.', ar: 'التجربة واعدة لكنها تحتاج إلى تحسين.' })}
                        {pilot.recommendation === 'terminate' && t({ en: 'Pilot did not meet success criteria.', ar: 'لم تستوف التجربة معايير النجاح.' })}
                        {pilot.recommendation === 'pending' && t({ en: 'Evaluation in progress.', ar: 'التقييم جارٍ.' })}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-1">{t({ en: 'AI Evaluation Summary', ar: 'ملخص التقييم الذكي' })}</p>
                        <p className="text-sm text-slate-600">
                          {t({
                            en: 'Based on KPI trends, budget utilization, and stakeholder feedback, this pilot demonstrates strong potential for success. Recommend proceeding to scale-up planning phase.',
                            ar: 'بناءً على اتجاهات مؤشرات الأداء واستخدام الميزانية وملاحظات الأطراف المعنية، تُظهر هذه التجربة إمكانات قوية للنجاح. يُوصى بالانتقال إلى مرحلة تخطيط التوسع.'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {pilot.lessons_learned && pilot.lessons_learned.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pilot.lessons_learned.map((lesson, idx) => (
                        <div key={idx} className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
                          {lesson.category && (
                            <Badge variant="outline" className="mb-2 text-xs">{lesson.category}</Badge>
                          )}
                          <p className="text-sm text-slate-900 font-medium mb-1">{lesson.lesson}</p>
                          {lesson.recommendation && (
                            <p className="text-sm text-slate-700">{lesson.recommendation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {pilot.scaling_plan && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      {t({ en: 'Scaling Plan', ar: 'خطة التوسع' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pilot.scaling_plan.strategy && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">{t({ en: 'Strategy:', ar: 'الاستراتيجية:' })}</p>
                        <p className="text-sm text-slate-600">{pilot.scaling_plan.strategy}</p>
                      </div>
                    )}
                    {pilot.scaling_plan.target_locations && pilot.scaling_plan.target_locations.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Target Locations:', ar: 'المواقع المستهدفة:' })}</p>
                        <div className="flex flex-wrap gap-2">
                          {pilot.scaling_plan.target_locations.map((loc, idx) => (
                            <Badge key={idx} variant="outline">{loc}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {pilot.scaling_plan.estimated_cost && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">{t({ en: 'Estimated Cost:', ar: 'التكلفة المقدرة:' })}</p>
                        <p className="text-sm text-slate-600">{pilot.scaling_plan.estimated_cost} SAR</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Experts Tab */}
            <TabsContent value="experts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      {t({ en: 'Expert Evaluations', ar: 'تقييمات الخبراء' })}
                    </CardTitle>
                    <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=pilot&entity_id=${pilotId}`)} target="_blank">
                      <Button size="sm" className="bg-purple-600">
                        <Users className="h-4 w-4 mr-2" />
                        {t({ en: 'Assign Experts', ar: 'تعيين خبراء' })}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {expertEvaluations.length > 0 ? (
                    <div className="space-y-4">
                      {expertEvaluations.map((evaluation) => (
                        <div key={evaluation.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-medium text-slate-900">{evaluation.expert_email}</p>
                              <p className="text-xs text-slate-500">
                                {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-purple-600">{evaluation.overall_score}</div>
                              <Badge className={
                                evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                                  evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                              }>
                                {evaluation.recommendation?.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-green-600">{evaluation.feasibility_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Feasibility', ar: 'الجدوى' })}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-blue-600">{evaluation.impact_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-purple-600">{evaluation.technical_quality_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Quality', ar: 'الجودة' })}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-red-600">{evaluation.risk_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Risk', ar: 'المخاطر' })}</div>
                            </div>
                          </div>

                          {evaluation.feedback_text && (
                            <div className="p-3 bg-white rounded border">
                              <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                            </div>
                          )}

                          {evaluation.strengths && evaluation.strengths.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-green-700 mb-1">{t({ en: 'Strengths:', ar: 'نقاط القوة:' })}</p>
                              <ul className="text-xs text-slate-700 space-y-1">
                                {evaluation.strengths.map((s, i) => (
                                  <li key={i}>• {s}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-red-700 mb-1">{t({ en: 'Weaknesses:', ar: 'نقاط الضعف:' })}</p>
                              <ul className="text-xs text-slate-700 space-y-1">
                                {evaluation.weaknesses.map((w, i) => (
                                  <li key={i}>• {w}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}

                      {expertEvaluations.length >= 2 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-2">
                            {t({ en: 'Multi-Expert Consensus', ar: 'إجماع متعدد الخبراء' })}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t({ en: 'Total Evaluators:', ar: 'إجمالي المقيّمين:' })}</span>
                              <span className="font-medium">{expertEvaluations.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t({ en: 'Approval Rate:', ar: 'معدل الموافقة:' })}</span>
                              <span className="font-medium text-green-600">
                                {(expertEvaluations.filter(e => e.recommendation === 'approve').length / expertEvaluations.length * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t({ en: 'Avg. Overall Score:', ar: 'متوسط النقاط:' })}</span>
                              <span className="font-medium text-purple-600">
                                {(expertEvaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / expertEvaluations.length).toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">{t({ en: 'No expert evaluations yet', ar: 'لا توجد تقييمات خبراء بعد' })}</p>
                      <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=pilot&entity_id=${pilotId}`)} target="_blank">
                        <Button className="bg-purple-600">
                          <Users className="h-4 w-4 mr-2" />
                          {t({ en: 'Assign Experts Now', ar: 'تعيين خبراء الآن' })}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Connections Tab */}
            <TabsContent value="connections">
              <CrossEntityRecommender
                sourceEntity={pilot}
                sourceType="Pilot"
                recommendations={['rdprojects', 'challenges']}
              />
            </TabsContent>

            {/* Policy Tab */}
            <TabsContent value="policy">
              <PolicyTabWidget entityType="pilot" entityId={pilotId} />
            </TabsContent>

            <TabsContent value="conversions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Next Steps & Conversions', ar: 'الخطوات التالية والتحويلات' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    {t({ en: 'Conversion workflows available in ConversionHub', ar: 'سير عمل التحويل متاح في مركز التحويل' })}
                  </p>
                </CardContent>
              </Card>

              {pilot.solution_id && (
                <SolutionFeedbackLoop pilot={pilot} />
              )}
            </TabsContent>
          </Tabs>

          {/* Workflow Actions */}
          {['active', 'monitoring'].includes(pilot.stage) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setShowBudgetApproval(true)} variant="outline" className="w-full">
                <DollarSign className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Request Budget Release', ar: 'طلب صرف ميزانية' })}
              </Button>
            </div>
          )}

          {/* Hold/Resume Management */}
          {['active', 'monitoring', 'preparation'].includes(pilot.stage) && (
            <Card className="mt-6 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Pause className="h-4 w-4 text-amber-600" />
                  {t({ en: 'Pause Pilot', ar: 'إيقاف التجربة مؤقتاً' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder={t({ en: 'Reason for pausing...', ar: 'سبب الإيقاف...' })}
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  rows={2}
                />
                <Button
                  onClick={handleHoldPilot}
                  disabled={!holdReason || updatePilot.isPending}
                  variant="outline"
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-100"
                >
                  <Pause className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Put On Hold', ar: 'إيقاف مؤقت' })}
                </Button>
              </CardContent>
            </Card>
          )}

          {pilot.stage === 'on_hold' && (
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  {t({ en: 'Pilot On Hold', ar: 'التجربة متوقفة مؤقتاً' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pilot.hold_reason && (
                  <p className="text-sm text-slate-700 p-3 bg-white rounded border">
                    <span className="font-medium">{t({ en: 'Reason:', ar: 'السبب:' })}</span> {pilot.hold_reason}
                  </p>
                )}
                {pilot.hold_date && (
                  <p className="text-xs text-slate-500">{t({ en: 'Paused on:', ar: 'تم الإيقاف في:' })} {new Date(pilot.hold_date).toLocaleDateString()}</p>
                )}
                <Button
                  onClick={handleResumePilot}
                  disabled={updatePilot.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
                >
                  <Play className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Resume Pilot', ar: 'استئناف التجربة' })}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-slate-600" />
                {t({ en: 'Comments & Discussion', ar: 'التعليقات والنقاش' })} ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((c) => {
                if (!c || !c.created_date) return null;
                return (
                  <div key={c.id} className={`p-3 rounded-lg border ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">{c.created_by}</span>
                          {c.is_internal && <Badge variant="outline" className="text-xs">{t({ en: 'Internal', ar: 'داخلي' })}</Badge>}
                        </div>
                        <p className="text-sm text-slate-700">{c.comment_text}</p>
                        <span className="text-xs text-slate-500 mt-1 block">
                          {new Date(c.created_date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="space-y-3 pt-4 border-t">
                <Textarea
                  placeholder={t({ en: 'Add a comment...', ar: 'إضافة تعليق...' })}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddComment}
                  className="bg-gradient-to-r from-blue-600 to-teal-600"
                  disabled={!comment.trim()}
                >
                  <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Post Comment', ar: 'نشر تعليق' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(PilotDetailPage, { requiredPermissions: [] });