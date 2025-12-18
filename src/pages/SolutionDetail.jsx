import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Building2, Globe, Mail, Award, TrendingUp, CheckCircle2, Star,
  Target, FileText, ExternalLink, Lightbulb, MessageSquare, Send,
  Sparkles, DollarSign, TestTube, Image, Video, Users, Code,
  Clock, Shield, Package, Loader2, X, Upload, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import SolutionVerificationWizard from '../components/SolutionVerificationWizard';
import SolutionDeploymentTracker from '../components/SolutionDeploymentTracker';
import SolutionReviewCollector from '../components/SolutionReviewCollector';
import SolutionCaseStudyWizard from '../components/SolutionCaseStudyWizard';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import SolutionActivityLog from '../components/solutions/SolutionActivityLog';
import RequestDemoButton from '../components/solutions/RequestDemoButton';
import ExpressInterestButton from '../components/solutions/ExpressInterestButton';
import SolutionReviewsTab from '../components/solutions/SolutionReviewsTab';
import CompetitiveAnalysisTab from '../components/solutions/CompetitiveAnalysisTab';
import SolutionVersionHistory from '../components/solutions/SolutionVersionHistory';
import SolutionDeprecationWizard from '../components/solutions/SolutionDeprecationWizard';
import DeploymentBadges from '../components/solutions/DeploymentBadges';
import ProviderScalingCommercial from '../components/scaling/ProviderScalingCommercial';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';
import AIProfileEnhancer from '../components/solutions/AIProfileEnhancer';
import CompetitiveAnalysisAI from '../components/solutions/CompetitiveAnalysisAI';
import PriceComparisonTool from '../components/solutions/PriceComparisonTool';
import PilotReadinessChecker from '../components/solutions/PilotReadinessChecker';
import SolutionEvolutionTracker from '../components/solutions/SolutionEvolutionTracker';
import DynamicPricingIntelligence from '../components/solutions/DynamicPricingIntelligence';
import DeploymentSuccessTracker from '../components/solutions/DeploymentSuccessTracker';
import ClientTestimonialsShowcase from '../components/solutions/ClientTestimonialsShowcase';
import SolutionSuccessPredictor from '../components/solutions/SolutionSuccessPredictor';
import SmartRecommendationEngine from '../components/solutions/SmartRecommendationEngine';
import ComplianceValidationAI from '../components/solutions/ComplianceValidationAI';
import RealTimeMarketIntelligence from '../components/solutions/RealTimeMarketIntelligence';
import TRLAssessmentTool from '../components/solutions/TRLAssessmentTool';
import SolutionRDCollaborationProposal from '../components/solutions/SolutionRDCollaborationProposal';
import { usePrompt } from '@/hooks/usePrompt';
import { SOLUTION_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/solutions/solutionDetail';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function SolutionDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const solutionId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const { user, hasPermission } = usePermissions();
  const [comment, setComment] = React.useState('');
  const [showAIInsights, setShowAIInsights] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState(null);
  const { invoke: invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = usePrompt(null);
  const [showVerification, setShowVerification] = React.useState(false);
  const [showDeployment, setShowDeployment] = React.useState(false);
  const [showReview, setShowReview] = React.useState(false);
  const [showCaseStudy, setShowCaseStudy] = React.useState(false);
  const [showRDCollaboration, setShowRDCollaboration] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: solution, isLoading } = useQuery({
    queryKey: ['solution', solutionId],
    queryFn: async () => {
      const solutions = await base44.entities.Solution.list();
      return solutions.find(s => s.id === solutionId);
    },
    enabled: !!solutionId
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-for-solution', solutionId],
    queryFn: async () => {
      const allPilots = await base44.entities.Pilot.list();
      return allPilots.filter(p => p.solution_id === solutionId);
    },
    enabled: !!solutionId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['solution-comments', solutionId],
    queryFn: async () => {
      const all = await base44.entities.SolutionComment.list();
      return all.filter(c => c.solution_id === solutionId);
    },
    enabled: !!solutionId
  });

  const { data: expertEvaluations = [] } = useQuery({
    queryKey: ['solution-expert-evaluations', solutionId],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => e.entity_type === 'solution' && e.entity_id === solutionId);
    },
    enabled: !!solutionId
  });

  const { data: allSolutions = [] } = useQuery({
    queryKey: ['all-solutions-for-comparison'],
    queryFn: () => base44.entities.Solution.list(),
    enabled: !!solutionId
  });

  const commentMutation = useMutation({
    mutationFn: (data) => base44.entities.SolutionComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution-comments']);
      setComment('');
      toast.success('Comment added');
    }
  });

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    // Use centralized prompt template
    const promptConfig = SOLUTION_DETAIL_PROMPT_TEMPLATE(solution);
    
    const result = await invokeAI({
      prompt: promptConfig.prompt,
      system_prompt: promptConfig.system,
      response_json_schema: promptConfig.schema
    });
    if (result.success) {
      setAiInsights(result.data);
    }
  };

  if (isLoading || !solution) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const maturityColors = {
    concept: 'bg-slate-100 text-slate-700',
    prototype: 'bg-blue-100 text-blue-700',
    pilot_ready: 'bg-purple-100 text-purple-700',
    market_ready: 'bg-green-100 text-green-700',
    proven: 'bg-teal-100 text-teal-700'
  };

  const providerTypeColors = {
    startup: 'bg-orange-100 text-orange-700',
    sme: 'bg-blue-100 text-blue-700',
    corporate: 'bg-purple-100 text-purple-700',
    university: 'bg-green-100 text-green-700',
    research_center: 'bg-teal-100 text-teal-700'
  };

  const maturityConfig = {
    concept: { color: 'bg-slate-100 text-slate-700', icon: Lightbulb },
    prototype: { color: 'bg-blue-100 text-blue-700', icon: Code },
    pilot_ready: { color: 'bg-purple-100 text-purple-700', icon: TestTube },
    market_ready: { color: 'bg-green-100 text-green-700', icon: Package },
    proven: { color: 'bg-teal-100 text-teal-700', icon: Award }
  };

  const maturityInfo = maturityConfig[solution.maturity_level] || maturityConfig.concept;
  const MaturityIcon = maturityInfo.icon;

  return (
    <PageLayout>
      {/* Workflow Modals */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <SolutionVerificationWizard solution={solution} onClose={() => setShowVerification(false)} />
          </div>
        </div>
      )}
      {showDeployment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <SolutionDeploymentTracker solution={solution} onClose={() => setShowDeployment(false)} />
          </div>
        </div>
      )}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <SolutionReviewCollector solution={solution} onClose={() => setShowReview(false)} />
          </div>
        </div>
      )}
      {showCaseStudy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <SolutionCaseStudyWizard solution={solution} onClose={() => setShowCaseStudy(false)} />
          </div>
        </div>
      )}
      {showRDCollaboration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <SolutionRDCollaborationProposal solution={solution} onClose={() => setShowRDCollaboration(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {solution.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {solution.code}
                  </Badge>
                )}
                <Badge className={`${maturityInfo.color} flex items-center gap-1`}>
                  <MaturityIcon className="h-3 w-3" />
                  {solution.maturity_level?.replace(/_/g, ' ')}
                </Badge>
                <Badge className={providerTypeColors[solution.provider_type]}>
                  {solution.provider_type?.replace(/_/g, ' ')}
                </Badge>
                {solution.trl && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    TRL {solution.trl}
                  </Badge>
                )}
                {solution.is_verified && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {solution.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                </div>
                <DeploymentBadges solution={solution} pilots={pilots} />
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
              </h1>
              {(solution.tagline_en || solution.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && solution.tagline_ar ? solution.tagline_ar : solution.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{solution.provider_name}</span>
                </div>
                {solution.deployment_count > 0 && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{solution.deployment_count} deployments</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <RequestDemoButton solution={solution} />
              <ExpressInterestButton solution={solution} variant="default" />
              {!solution.is_verified && hasPermission('solution_verify') && (
                <Button onClick={() => setShowVerification(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Shield className="h-4 w-4 mr-2" />
                  {t({ en: 'Verify', ar: 'تحقق' })}
                </Button>
              )}
              <Button onClick={() => setShowCaseStudy(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                <FileText className="h-4 w-4 mr-2" />
                {t({ en: 'Add Case', ar: 'إضافة حالة' })}
              </Button>
              {(hasPermission('solution_edit') || solution.created_by === user?.email) && (
                <Link to={createPageUrl(`SolutionEdit?id=${solutionId}`)}>
                  <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    {t({ en: 'Edit', ar: 'تعديل' })}
                  </Button>
                </Link>
              )}
              {solution.website && (
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30" asChild>
                  <a href={solution.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
              )}
              <Button className="bg-white text-indigo-600 hover:bg-white/90" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
                {aiLoading ? <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} /> : <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-indigo-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing solution...', ar: 'جاري تحليل الحل...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.market_fit?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Market Fit', ar: 'ملاءمة السوق' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.market_fit.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.competitive_advantages?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Competitive Advantages', ar: 'المزايا التنافسية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.competitive_advantages.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.implementation_recommendations?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Implementation', ar: 'التنفيذ' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.implementation_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.potential_municipalities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Target Municipalities', ar: 'البلديات المستهدفة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.potential_municipalities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.scaling_opportunities?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Scaling Opportunities', ar: 'فرص التوسع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.scaling_opportunities.map((item, i) => (
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
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Deployments', ar: 'عمليات النشر' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {solution.deployment_count || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {solution.success_rate || 0}%
                </p>
              </div>
              <Star className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'TRL Level', ar: 'المستوى التقني' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {solution.trl || 'N/A'}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {pilots.filter(p => p.stage === 'active').length}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Rating', ar: 'التقييم' })}</p>
                <p className="text-3xl font-bold text-rose-600">
                  {solution.ratings?.average?.toFixed(1) || 'N/A'}
                </p>
              </div>
              <Star className="h-8 w-8 text-rose-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-12 h-auto">
              <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex flex-col gap-1 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Features', ar: 'مميزات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="flex flex-col gap-1 py-3">
                <Code className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Technical', ar: 'تقني' })}</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex flex-col gap-1 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Pricing', ar: 'سعر' })}</span>
              </TabsTrigger>
              <TabsTrigger value="competitive" className="flex flex-col gap-1 py-3">
                <Target className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Compete', ar: 'منافسة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="deployments" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Deploy', ar: 'نشر' })}</span>
              </TabsTrigger>
              <TabsTrigger value="cases" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Cases', ar: 'حالات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="pilots" className="flex flex-col gap-1 py-3">
                <TestTube className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Pilots', ar: 'تجارب' })}</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex flex-col gap-1 py-3">
                <Star className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Reviews', ar: 'مراجعات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="experts" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Experts', ar: 'خبراء' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex flex-col gap-1 py-3">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Activity', ar: 'نشاط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="scaling" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Scaling', ar: 'توسع' })}</span>
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="flex flex-col gap-1 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'AI Tools', ar: 'أدوات ذكية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="rd-collaboration" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'R&D', ar: 'بحث' })}</span>
              </TabsTrigger>
              </TabsList>

            {/* Workflow & Approvals Tab */}
            <TabsContent value="workflow" className="space-y-6">
              <UnifiedWorkflowApprovalTab
                entityType="Solution"
                entity={solution}
                onUpdate={() => queryClient.invalidateQueries(['solution', solutionId])}
              />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description | الوصف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {solution.description_en || 'No description provided'}
                    </p>
                  </div>
                  {solution.description_ar && (
                    <div className="pt-4 border-t" dir="rtl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {solution.description_ar}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {solution.sectors && solution.sectors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Applicable Sectors | القطاعات المطبقة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {solution.sectors.map((sector, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {sector.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Key Features', ar: 'المميزات الرئيسية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {solution.features && solution.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {solution.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No features listed</p>
                  )}
                </CardContent>
              </Card>

              {solution.use_cases && solution.use_cases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Use Cases', ar: 'حالات الاستخدام' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {solution.use_cases.map((useCase, i) => (
                        <div key={i} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                          <h4 className="font-semibold text-slate-900 mb-1">{useCase.title}</h4>
                          <p className="text-sm text-slate-700">{useCase.description}</p>
                          {useCase.sector && (
                            <Badge variant="outline" className="mt-2 text-xs">{useCase.sector}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {solution.value_proposition && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Value Proposition', ar: 'القيمة المقترحة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{solution.value_proposition}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Technical Tab */}
            <TabsContent value="technical" className="space-y-6">
              {solution.technical_specifications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-blue-600" />
                      {t({ en: 'Technical Specifications', ar: 'المواصفات التقنية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {solution.technical_specifications.technology_stack?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Technology Stack:</p>
                        <div className="flex flex-wrap gap-2">
                          {solution.technical_specifications.technology_stack.map((tech, i) => (
                            <Badge key={i} variant="outline">{tech}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {solution.technical_specifications.integration_requirements && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Integration:</p>
                        <p className="text-sm text-slate-600">{solution.technical_specifications.integration_requirements}</p>
                      </div>
                    )}
                    {solution.technical_specifications.scalability && (
                      <div>
                        <p className="text-sm font-medium text-slate-700">Scalability:</p>
                        <p className="text-sm text-slate-600">{solution.technical_specifications.scalability}</p>
                      </div>
                    )}
                    {solution.technical_specifications.security_features?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Security Features:</p>
                        <div className="space-y-2">
                          {solution.technical_specifications.security_features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-slate-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {solution.deployment_options?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Deployment Options', ar: 'خيارات النشر' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {solution.deployment_options.map((option, i) => (
                        <Badge key={i} variant="outline" className="capitalize">{option}</Badge>
                      ))}
                    </div>
                    {solution.implementation_timeline && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700">Implementation Timeline:</p>
                        <p className="text-sm text-slate-600">{solution.implementation_timeline}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t({ en: 'Pricing Details', ar: 'تفاصيل التسعير' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {solution.pricing_model && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-900">Model: {solution.pricing_model}</p>
                    </div>
                  )}
                  {solution.pricing_details && (
                    <div className="space-y-3">
                      {solution.pricing_details.setup_cost && (
                        <div className="flex justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">Setup Cost:</span>
                          <span className="text-sm font-medium">{solution.pricing_details.setup_cost} SAR</span>
                        </div>
                      )}
                      {solution.pricing_details.monthly_cost && (
                        <div className="flex justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">Monthly Cost:</span>
                          <span className="text-sm font-medium">{solution.pricing_details.monthly_cost} SAR</span>
                        </div>
                      )}
                      {solution.pricing_details.per_user_cost && (
                        <div className="flex justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">Per User:</span>
                          <span className="text-sm font-medium">{solution.pricing_details.per_user_cost} SAR</span>
                        </div>
                      )}
                      {solution.pricing_details.custom_pricing && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">Custom pricing available for enterprise deployments</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deployments Tab */}
            <TabsContent value="deployments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {t({ en: 'Deployment History', ar: 'سجل النشر' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {solution.deployments && solution.deployments.length > 0 ? (
                    <div className="space-y-3">
                      {solution.deployments.map((deployment, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{deployment.organization}</p>
                              <p className="text-sm text-slate-600">{deployment.location}</p>
                            </div>
                            <Badge variant="outline">{deployment.status}</Badge>
                          </div>
                          {deployment.start_date && (
                            <p className="text-xs text-slate-500">Since {deployment.start_date}</p>
                          )}
                          {deployment.results && (
                            <p className="text-sm text-slate-700 mt-2">{deployment.results}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No deployments recorded yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Case Studies Tab */}
            <TabsContent value="cases" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Case Studies', ar: 'دراسات الحالة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {solution.case_studies && solution.case_studies.length > 0 ? (
                    <div className="space-y-4">
                      {solution.case_studies.map((caseStudy, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-slate-900 mb-2">{caseStudy.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-slate-500">Client:</span> {caseStudy.client}
                            </div>
                            <div>
                              <span className="text-slate-500">Challenge:</span>
                              <p className="text-slate-700 mt-1">{caseStudy.challenge}</p>
                            </div>
                            <div>
                              <span className="text-slate-500">Results:</span>
                              <p className="text-slate-700 mt-1">{caseStudy.results}</p>
                            </div>
                            {caseStudy.document_url && (
                              <Button variant="outline" size="sm" asChild className="mt-2">
                                <a href={caseStudy.document_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  View Full Case Study
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No case studies available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pilots Tab */}
            <TabsContent value="pilots">
              <Card>
                <CardHeader>
                  <CardTitle>Related Pilots | التجارب المرتبطة</CardTitle>
                </CardHeader>
                <CardContent>
                  {pilots.length > 0 ? (
                    <div className="space-y-3">
                      {pilots.map((pilot) => (
                        <Link
                          key={pilot.id}
                          to={createPageUrl(`PilotDetail?id=${pilot.id}`)}
                          className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{pilot.title_en}</p>
                              <p className="text-sm text-slate-600 mt-1">{pilot.municipality_id}</p>
                            </div>
                            <Badge>
                              {pilot.stage?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No pilots using this solution yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-6">
              {solution.certifications && solution.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      {t({ en: 'Certifications', ar: 'الشهادات' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {solution.certifications.map((cert, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm text-slate-900">{cert.name}</p>
                          <p className="text-xs text-slate-600">{cert.issuer}</p>
                          {cert.date && (
                            <p className="text-xs text-slate-500 mt-1">{cert.date}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {solution.awards && solution.awards.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      {t({ en: 'Awards & Recognition', ar: 'الجوائز والتقدير' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {solution.awards.map((award, i) => (
                        <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="font-medium text-amber-900">{award.award}</p>
                          <p className="text-sm text-slate-600">{award.organization} • {award.year}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Partnerships Tab */}
            <TabsContent value="partnerships">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Partnerships & Collaborations', ar: 'الشراكات والتعاون' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {solution.partnerships && solution.partnerships.length > 0 ? (
                    <div className="space-y-3">
                      {solution.partnerships.map((partnership, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{partnership.partner}</p>
                              <Badge variant="outline" className="text-xs mt-1">{partnership.type}</Badge>
                            </div>
                          </div>
                          {partnership.description && (
                            <p className="text-sm text-slate-600 mt-2">{partnership.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No partnerships listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Support Services', ar: 'خدمات الدعم' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {solution.support_services && solution.support_services.length > 0 ? (
                    <div className="space-y-3">
                      {solution.support_services.map((service, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-900">{service.service}</p>
                              {service.description && (
                                <p className="text-sm text-slate-600 mt-1">{service.description}</p>
                              )}
                            </div>
                            {service.included && (
                              <Badge className="bg-green-100 text-green-700 text-xs">Included</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No support services listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              {solution.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={solution.image_url} alt={solution.name_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}

              {solution.gallery_urls && solution.gallery_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {solution.gallery_urls.map((url, i) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {solution.video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-red-600" />
                      {t({ en: 'Demo Video', ar: 'فيديو تجريبي' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                      <p className="text-slate-500">Video Player</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {(solution.demo_url || solution.documentation_url || solution.api_documentation_url) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Resources', ar: 'الموارد' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {solution.demo_url && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={solution.demo_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                    {solution.documentation_url && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={solution.documentation_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          Documentation
                        </a>
                      </Button>
                    )}
                    {solution.api_documentation_url && (
                      <Button variant="outline" asChild className="w-full justify-start">
                        <a href={solution.api_documentation_url} target="_blank" rel="noopener noreferrer">
                          <Code className="h-4 w-4 mr-2" />
                          API Docs
                        </a>
                      </Button>
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
                      {t({ en: 'Technical Verification', ar: 'التحقق التقني' })}
                    </CardTitle>
                    <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=solution&entity_id=${solutionId}`)} target="_blank">
                      <Button size="sm" className="bg-purple-600">
                        <Users className="h-4 w-4 mr-2" />
                        {t({ en: 'Assign Technical Experts', ar: 'تعيين خبراء تقنيين' })}
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
                              <div className="text-sm font-bold text-blue-600">{evaluation.technical_quality_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Quality', ar: 'الجودة' })}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-purple-600">{evaluation.scalability_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Scalability', ar: 'قابلية التوسع' })}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-green-600">{evaluation.innovation_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Innovation', ar: 'الابتكار' })}</div>
                            </div>
                            <div className="text-center p-2 bg-white rounded">
                              <div className="text-sm font-bold text-amber-600">{evaluation.cost_effectiveness_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Cost Eff.', ar: 'الفعالية' })}</div>
                            </div>
                          </div>

                          {evaluation.feedback_text && (
                            <div className="p-3 bg-white rounded border">
                              <p className="text-sm text-slate-700">{evaluation.feedback_text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">{t({ en: 'No technical expert verification yet', ar: 'لا يوجد تحقق من الخبراء التقنيين بعد' })}</p>
                      <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=solution&entity_id=${solutionId}`)} target="_blank">
                        <Button className="bg-purple-600">
                          <Users className="h-4 w-4 mr-2" />
                          {t({ en: 'Request Technical Review', ar: 'طلب مراجعة تقنية' })}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competitive Analysis Tab */}
            <TabsContent value="competitive">
              <CompetitiveAnalysisTab solution={solution} />
            </TabsContent>

            {/* Reviews & Ratings Tab */}
            <TabsContent value="reviews" className="space-y-6">
              <SolutionReviewsTab solution={solution} />
              <ClientTestimonialsShowcase solutionId={solution.id} />
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity">
              <SolutionActivityLog solution={solution} />
            </TabsContent>

            {/* Scaling Commercial Tab */}
            <TabsContent value="scaling">
              <ProviderScalingCommercial solutionId={solution.id} />
            </TabsContent>

            {/* AI Tools Tab - Integrated Components */}
            <TabsContent value="ai-tools" className="space-y-4">
              <SolutionSuccessPredictor solution={solution} challenge={null} />
              <AIProfileEnhancer solution={solution} onUpdate={() => queryClient.invalidateQueries(['solution', solutionId])} />
              <CompetitiveAnalysisAI solution={solution} allSolutions={allSolutions} />
              <PriceComparisonTool solutions={allSolutions} selectedSolution={solution} />
              <PilotReadinessChecker solution={solution} />
              <DynamicPricingIntelligence solution={solution} />
              <DeploymentSuccessTracker solution={solution} onClose={() => {}} />
              <ComplianceValidationAI solution={solution} onValidationComplete={() => queryClient.invalidateQueries(['solution', solutionId])} />
              <RealTimeMarketIntelligence solution={solution} />
            </TabsContent>

            {/* R&D Collaboration Tab */}
            <TabsContent value="rd-collaboration" className="space-y-4">
              <TRLAssessmentTool solution={solution} onAssessmentComplete={() => queryClient.invalidateQueries(['solution', solutionId])} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {t({ en: 'R&D Collaboration Opportunities', ar: 'فرص التعاون البحثي' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">
                    {t({ 
                      en: 'Collaborate with researchers and academic institutions to advance this solution\'s technology readiness.', 
                      ar: 'تعاون مع الباحثين والمؤسسات الأكاديمية لتطوير جاهزية هذا الحل التقني.' 
                    })}
                  </p>
                  <Button onClick={() => setShowRDCollaboration(true)} className="w-full bg-purple-600">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'Propose R&D Collaboration', ar: 'اقترح تعاون بحثي' })}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Provider', ar: 'المزود' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Company</p>
                <p className="font-medium text-sm">{solution.provider_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <Badge className={providerTypeColors[solution.provider_type]}>
                  {solution.provider_type?.replace(/_/g, ' ')}
                </Badge>
              </div>
              {solution.contact_name && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contact</p>
                  <p className="text-sm">{solution.contact_name}</p>
                </div>
              )}
              {solution.contact_email && (
                <a href={`mailto:${solution.contact_email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </a>
              )}
              {solution.contact_phone && (
                <p className="text-sm text-slate-600">{solution.contact_phone}</p>
              )}
            </CardContent>
          </Card>

          {solution.pricing_details && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  {t({ en: 'Quick Pricing', ar: 'التسعير السريع' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {solution.pricing_details.monthly_cost && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly:</span>
                    <span className="font-medium">{solution.pricing_details.monthly_cost} SAR</span>
                  </div>
                )}
                {solution.pricing_details.setup_cost && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Setup:</span>
                    <span className="font-medium">{solution.pricing_details.setup_cost} SAR</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {solution.ratings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  {t({ en: 'Ratings', ar: 'التقييمات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{solution.ratings.average?.toFixed(1) || 'N/A'}</p>
                  <p className="text-xs text-slate-500">{solution.ratings.count || 0} reviews</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(SolutionDetailPage, { requiredPermissions: [] });