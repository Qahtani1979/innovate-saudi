import React, { useState } from 'react';
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
import { toast } from 'sonner';
import {
  Beaker, Mail, Target, Calendar, DollarSign, FileText, Sparkles,
  TrendingUp, CheckCircle2, Users, BookOpen, Award, Send, MessageSquare,
  Clock, Building2, Image, Video, Database, BarChart3, AlertCircle,
  ExternalLink, TestTube, Zap, Rocket, Play, Loader2, X, Shield, Lightbulb, Activity
} from 'lucide-react';
import RDProjectKickoffWorkflow from '../components/RDProjectKickoffWorkflow';
import RDProjectCompletionWorkflow from '../components/RDProjectCompletionWorkflow';
import RDToPilotTransition from '../components/rd/RDToPilotTransition';
import RDProjectMilestoneGate from '../components/RDProjectMilestoneGate';
import RDOutputValidation from '../components/RDOutputValidation';
import RDTRLAdvancement from '../components/RDTRLAdvancement';
import CrossEntityRecommender from '../components/CrossEntityRecommender';
import PolicyTabWidget from '../components/policy/PolicyTabWidget';
import RDProjectActivityLog from '../components/rd/RDProjectActivityLog';
import RDToSolutionConverter from '../components/rd/RDToSolutionConverter';
import RDToPolicyConverter from '../components/rd/RDToPolicyConverter';
import TRLAssessmentWorkflow from '../components/rd/TRLAssessmentWorkflow';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import { usePermissions } from '../components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';
import RDProjectFinalEvaluationPanel from '../components/rd/RDProjectFinalEvaluationPanel';
import IPManagementWidget from '../components/rd/IPManagementWidget';
import TRLVisualization from '../components/rd/TRLVisualization';
import PolicyImpactTracker from '../components/rd/PolicyImpactTracker';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout } from '@/components/layout/PersonaPageLayout';

export default function RDProjectDetail() {
  const { hasPermission, user } = usePermissions();
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [comment, setComment] = useState('');
  const [showKickoff, setShowKickoff] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showPilotTransition, setShowPilotTransition] = useState(false);
  const [showMilestoneGate, setShowMilestoneGate] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showOutputValidation, setShowOutputValidation] = useState(false);
  const [showTRLAdvancement, setShowTRLAdvancement] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [showSolutionConverter, setShowSolutionConverter] = useState(false);
  const [showPolicyConverter, setShowPolicyConverter] = useState(false);
  const [showTRLAssessment, setShowTRLAssessment] = useState(false);
  const [showFinalEvaluation, setShowFinalEvaluation] = useState(false);
  const queryClient = useQueryClient();
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: project, isLoading } = useQuery({
    queryKey: ['rd-project', projectId],
    queryFn: async () => {
      const projects = await base44.entities.RDProject.list();
      return projects.find(p => p.id === projectId);
    },
    enabled: !!projectId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['rd-project-comments', projectId],
    queryFn: async () => {
      const all = await base44.entities.RDProjectComment.list();
      return all.filter(c => c.rd_project_id === projectId);
    },
    enabled: !!projectId
  });

  const { data: expertEvaluations = [] } = useQuery({
    queryKey: ['rd-project-expert-evaluations', projectId],
    queryFn: async () => {
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => e.entity_type === 'rd_project' && e.entity_id === projectId);
    },
    enabled: !!projectId
  });

  const commentMutation = useMutation({
    mutationFn: (data) => base44.entities.RDProjectComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-project-comments']);
      setComment('');
      toast.success('Comment added');
    }
  });

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusConfig = {
    proposal: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    approved: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
    active: { color: 'bg-green-100 text-green-700', icon: Beaker },
    on_hold: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    completed: { color: 'bg-teal-100 text-teal-700', icon: Award },
    terminated: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
  };

  const statusInfo = statusConfig[project.status] || statusConfig.proposal;
  const StatusIcon = statusInfo.icon;

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const response = await invokeAI({
      prompt: `Analyze this R&D project for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Project: ${project.title_en}
Institution: ${project.institution_en || project.institution}
Research Area: ${project.research_area_en || project.research_area}
Status: ${project.status}
TRL Current: ${project.trl_current || project.trl_start || 'N/A'}
TRL Target: ${project.trl_target || 'N/A'}
Budget: ${project.budget || 'N/A'} SAR
Duration: ${project.duration_months || 'N/A'} months
Research Themes: ${project.research_themes?.join(', ') || 'N/A'}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Strategic alignment with Vision 2030 and municipal innovation goals
2. TRL advancement recommendations
3. Potential pilot applications in Saudi municipalities
4. Collaboration opportunities with other entities
5. Risk factors and mitigation suggestions`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategic_alignment: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          trl_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          pilot_applications: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          collaboration_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          risk_mitigation: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });
    if (response.success) {
      setAiInsights(response.data);
    }
  };

  return (
    <PageLayout>
      {/* Workflow Modals */}
      {showKickoff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDProjectKickoffWorkflow project={project} onClose={() => setShowKickoff(false)} />
          </div>
        </div>
      )}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDProjectCompletionWorkflow project={project} onClose={() => setShowCompletion(false)} />
          </div>
        </div>
      )}
      {showPilotTransition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDToPilotTransition project={project} onClose={() => setShowPilotTransition(false)} />
          </div>
        </div>
      )}
      {showMilestoneGate && selectedMilestone && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDProjectMilestoneGate project={project} milestone={selectedMilestone} onClose={() => {
              setShowMilestoneGate(false);
              setSelectedMilestone(null);
            }} />
          </div>
        </div>
      )}
      {showOutputValidation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <RDOutputValidation project={project} onClose={() => setShowOutputValidation(false)} />
          </div>
        </div>
      )}
      {showTRLAdvancement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDTRLAdvancement project={project} onClose={() => setShowTRLAdvancement(false)} />
          </div>
        </div>
      )}
      {showSolutionConverter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <RDToSolutionConverter rdProject={project} onClose={() => setShowSolutionConverter(false)} />
          </div>
        </div>
      )}
      {showPolicyConverter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <RDToPolicyConverter rdProject={project} onClose={() => setShowPolicyConverter(false)} />
          </div>
        </div>
      )}
      {showTRLAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <TRLAssessmentWorkflow rdProject={project} onUpdate={() => queryClient.invalidateQueries(['rd-project'])} />
          </div>
        </div>
      )}
      {showFinalEvaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <RDProjectFinalEvaluationPanel project={project} onClose={() => setShowFinalEvaluation(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {project.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {project.code}
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {project.status?.replace(/_/g, ' ')}
                </Badge>
                {project.trl_current && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    TRL {project.trl_current}
                  </Badge>
                )}
                {project.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
              </h1>
              {(project.tagline_en || project.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && project.tagline_ar ? project.tagline_ar : project.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{language === 'ar' && project.institution_ar ? project.institution_ar : (project.institution_en || project.institution)}</span>
                </div>
                {(project.research_area_en || project.research_area) && (
                  <div className="flex items-center gap-1">
                    <Beaker className="h-4 w-4" />
                    <span>{language === 'ar' && project.research_area_ar ? project.research_area_ar : (project.research_area_en || project.research_area)}</span>
                  </div>
                )}
                {project.duration_months && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{project.duration_months} {t({ en: 'months', ar: 'شهر' })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {project.status === 'approved' && (
                <Button onClick={() => setShowKickoff(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Rocket className="h-4 w-4 mr-2" />
                  {t({ en: 'Start Project', ar: 'بدء المشروع' })}
                </Button>
              )}
              {project.status === 'active' && (
                <>
                  <Button onClick={() => setShowTRLAdvancement(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t({ en: 'Advance TRL', ar: 'تقدم المستوى' })}
                  </Button>
                  <Button onClick={() => setShowOutputValidation(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Award className="h-4 w-4 mr-2" />
                    {t({ en: 'Validate Outputs', ar: 'التحقق من المخرجات' })}
                  </Button>
                  <Button onClick={() => setShowCompletion(true)} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Complete', ar: 'إنهاء' })}
                  </Button>
                  <Button onClick={() => setShowPilotTransition(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <TestTube className="h-4 w-4 mr-2" />
                    {t({ en: 'Pilot', ar: 'تجريب' })}
                  </Button>
                </>
              )}
              {project.status === 'completed' && (
                <>
                  <Button onClick={() => setShowFinalEvaluation(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Award className="h-4 w-4 mr-2" />
                    {t({ en: 'Final Eval', ar: 'تقييم نهائي' })}
                  </Button>
                  <Button onClick={() => setShowPilotTransition(true)} className="bg-blue-600 hover:bg-blue-700">
                    <TestTube className="h-4 w-4 mr-2" />
                    {t({ en: 'Create Pilot', ar: 'إنشاء تجربة' })}
                  </Button>
                  {project.trl_current >= 7 && (
                    <Button onClick={() => setShowSolutionConverter(true)} className="bg-green-600 hover:bg-green-700">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      {t({ en: 'Commercialize', ar: 'تسويق' })}
                    </Button>
                  )}
                  <Button onClick={() => setShowPolicyConverter(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Shield className="h-4 w-4 mr-2" />
                    {t({ en: 'Policy', ar: 'سياسة' })}
                  </Button>
                </>
              )}
              {(hasPermission('rd_project_edit') || project.created_by === user?.email) && (
                <Link to={createPageUrl(`RDProjectEdit?id=${projectId}`)}>
                  <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    {t({ en: 'Edit', ar: 'تعديل' })}
                  </Button>
                </Link>
              )}
              <Button className="bg-white text-emerald-600 hover:bg-white/90" onClick={handleAIInsights}>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} className="mb-4" />
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="ml-3 text-slate-600">{t({ en: 'Analyzing R&D project...', ar: 'جاري تحليل مشروع البحث...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.strategic_alignment?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Vision 2030 Alignment', ar: 'التوافق مع رؤية 2030' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.strategic_alignment.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.trl_recommendations?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'TRL Advancement', ar: 'تقدم المستوى التقني' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.trl_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.pilot_applications?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Pilot Applications', ar: 'تطبيقات التجريب' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.pilot_applications.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.collaboration_opportunities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Collaboration Opportunities', ar: 'فرص التعاون' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.collaboration_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.risk_mitigation?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg md:col-span-2">
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
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'TRL Start', ar: 'مستوى ابتدائي' })}</p>
                <p className="text-3xl font-bold text-blue-600">{project.trl_start || 'N/A'}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'TRL Current', ar: 'مستوى حالي' })}</p>
                <p className="text-3xl font-bold text-purple-600">{project.trl_current || project.trl_start || 'N/A'}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'TRL Target', ar: 'مستوى مستهدف' })}</p>
                <p className="text-3xl font-bold text-green-600">{project.trl_target || 'N/A'}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {project.budget ? `${(project.budget / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Publications', ar: 'منشورات' })}</p>
                <p className="text-3xl font-bold text-teal-600">{project.publications?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-teal-600" />
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
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex flex-col gap-1 py-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Activity', ar: 'نشاط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="trl" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'TRL', ar: 'نضج' })}</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Team', ar: 'فريق' })}</span>
              </TabsTrigger>
              <TabsTrigger value="methodology" className="flex flex-col gap-1 py-3">
                <Beaker className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Method', ar: 'منهج' })}</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex flex-col gap-1 py-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Timeline', ar: 'جدول' })}</span>
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex flex-col gap-1 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Budget', ar: 'ميزانية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="outputs" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Outputs', ar: 'مخرجات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="publications" className="flex flex-col gap-1 py-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Pubs', ar: 'منشورات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="datasets" className="flex flex-col gap-1 py-3">
                <Database className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Data', ar: 'بيانات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Impact', ar: 'تأثير' })}</span>
              </TabsTrigger>
              <TabsTrigger value="pilot" className="flex flex-col gap-1 py-3">
                <TestTube className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Pilot', ar: 'تجربة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
                <Image className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Discussion', ar: 'نقاش' })}</span>
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
              <TabsTrigger value="ip" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'IP', ar: 'ملكية فكرية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="final-eval" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Final Eval', ar: 'تقييم نهائي' })}</span>
              </TabsTrigger>
              </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Abstract', ar: 'الملخص' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && (project.abstract_ar || project.description_ar) ? 'rtl' : 'ltr'}>
                    {language === 'ar' && (project.abstract_ar || project.description_ar) 
                      ? (project.abstract_ar || project.description_ar) 
                      : (project.abstract_en || project.description_en || t({ en: 'No abstract provided', ar: 'لا يوجد ملخص' }))}
                  </p>
                </CardContent>
              </Card>

              {project.research_themes && project.research_themes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Research Themes', ar: 'المواضيع البحثية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.research_themes.map((theme, i) => (
                        <Badge key={i} variant="outline">{theme}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.keywords && project.keywords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Keywords', ar: 'الكلمات المفتاحية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.keywords.map((keyword, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{keyword}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Research Team', ar: 'فريق البحث' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.principal_investigator && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-900 font-medium mb-1">{t({ en: 'Principal Investigator', ar: 'الباحث الرئيسي' })}</p>
                      <p className="font-semibold text-slate-900">
                        {language === 'ar' && project.principal_investigator.name_ar 
                          ? project.principal_investigator.name_ar 
                          : (project.principal_investigator.name_en || project.principal_investigator.name)}
                      </p>
                      {(project.principal_investigator.title_en || project.principal_investigator.title) && (
                        <p className="text-sm text-slate-600">
                          {language === 'ar' && project.principal_investigator.title_ar 
                            ? project.principal_investigator.title_ar 
                            : (project.principal_investigator.title_en || project.principal_investigator.title)}
                        </p>
                      )}
                      {project.principal_investigator.email && (
                        <p className="text-sm text-blue-600 mt-1">{project.principal_investigator.email}</p>
                      )}
                      {project.principal_investigator.expertise && project.principal_investigator.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.principal_investigator.expertise.map((exp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {project.team_members && project.team_members.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {project.team_members.map((member, i) => (
                          <div key={i} className="p-3 border rounded-lg">
                            <p className="font-medium text-sm text-slate-900">
                              {language === 'ar' && member.name_ar ? member.name_ar : (member.name_en || member.name)}
                            </p>
                            <p className="text-xs text-slate-600">
                              {language === 'ar' && member.role_ar ? member.role_ar : (member.role_en || member.role)}
                            </p>
                            {(member.institution_en || member.institution) && (
                              <p className="text-xs text-slate-500">
                                {language === 'ar' && member.institution_ar ? member.institution_ar : (member.institution_en || member.institution)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.partner_institutions && project.partner_institutions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">{t({ en: 'Partner Institutions', ar: 'المؤسسات الشريكة' })}:</p>
                      <div className="space-y-2">
                        {project.partner_institutions.map((partner, i) => (
                          <div key={i} className="p-3 border rounded-lg">
                            <p className="font-medium text-sm text-slate-900">
                              {language === 'ar' && partner.name_ar ? partner.name_ar : (partner.name_en || partner.name)}
                            </p>
                            <p className="text-xs text-slate-600">
                              {language === 'ar' && partner.role_ar ? partner.role_ar : (partner.role_en || partner.role)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methodology">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Research Methodology', ar: 'المنهجية البحثية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && project.methodology_ar ? 'rtl' : 'ltr'}>
                    {language === 'ar' && project.methodology_ar 
                      ? project.methodology_ar 
                      : (project.methodology_en || project.methodology || t({ en: 'No methodology specified', ar: 'لم يتم تحديد المنهجية' }))}
                  </p>
                </CardContent>
              </Card>

              {project.expected_outputs && project.expected_outputs.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Expected Outputs', ar: 'المخرجات المتوقعة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.expected_outputs.map((output, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm text-slate-900">{output.output}</p>
                              {output.type && (
                                <Badge variant="outline" className="text-xs mt-1">{output.type}</Badge>
                              )}
                            </div>
                            {output.target_date && (
                              <span className="text-xs text-slate-500">{output.target_date}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Project Timeline', ar: 'الجدول الزمني' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.timeline ? (
                    <div className="space-y-3">
                      {project.timeline.start_date && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}:</span>
                          <span className="text-sm font-medium">{project.timeline.start_date}</span>
                        </div>
                      )}
                      {project.timeline.end_date && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}:</span>
                          <span className="text-sm font-medium">{project.timeline.end_date}</span>
                        </div>
                      )}
                      {project.timeline.milestones && project.timeline.milestones.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Milestones', ar: 'المراحل' })}:</p>
                          <div className="space-y-2">
                            {project.timeline.milestones.map((milestone, i) => (
                              <div key={i} className="p-3 border rounded-lg hover:bg-slate-50 group">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-slate-900">{milestone.name}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">{milestone.status}</Badge>
                                    {project.status === 'active' && milestone.status === 'in_progress' && milestone.requires_approval && (
                                      <Button
                                        size="sm"
                                        onClick={() => {
                                          setSelectedMilestone(milestone);
                                          setShowMilestoneGate(true);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        {t({ en: 'Approve', ar: 'موافقة' })}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {milestone.date && (
                                  <p className="text-xs text-slate-500 mt-1">{milestone.date}</p>
                                )}
                                {milestone.deliverables && milestone.deliverables.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {milestone.deliverables.map((d, j) => (
                                      <Badge key={j} variant="outline" className="text-xs">{d}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No timeline specified', ar: 'لم يتم تحديد الجدول الزمني' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t({ en: 'Budget Breakdown', ar: 'تفصيل الميزانية' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.budget_breakdown && project.budget_breakdown.length > 0 ? (
                    <div className="space-y-2">
                      {project.budget_breakdown.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-700">
                            {language === 'ar' && item.category_ar ? item.category_ar : (item.category_en || item.category)}
                          </span>
                          <span className="text-sm font-medium">{(item.amount / 1000).toFixed(0)}K SAR</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-900">
                        {t({ en: 'Total Budget', ar: 'إجمالي الميزانية' })}: {project.budget ? `${(project.budget / 1000).toFixed(0)}K SAR` : t({ en: 'N/A', ar: 'غير متاح' })}
                      </p>
                      {(project.funding_source_en || project.funding_source) && (
                        <p className="text-xs text-slate-600 mt-1">
                          {t({ en: 'Source', ar: 'المصدر' })}: {language === 'ar' && project.funding_source_ar ? project.funding_source_ar : (project.funding_source_en || project.funding_source)}
                        </p>
                      )}
                      {project.funding_status && (
                        <Badge variant="outline" className="mt-2 text-xs">{project.funding_status}</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outputs">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Expected Outputs', ar: 'المخرجات المتوقعة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.expected_outputs && project.expected_outputs.length > 0 ? (
                    <div className="space-y-3">
                      {project.expected_outputs.map((output, i) => (
                        <div key={i} className="p-4 border-l-4 border-teal-500 bg-teal-50 rounded-r-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm text-slate-900">
                                {language === 'ar' && output.output_ar ? output.output_ar : (output.output_en || output.output)}
                              </p>
                              {output.type && (
                                <Badge variant="outline" className="text-xs mt-1">{output.type}</Badge>
                              )}
                            </div>
                            {output.target_date && (
                              <span className="text-xs text-slate-500">{output.target_date}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No outputs specified', ar: 'لم يتم تحديد المخرجات' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Publications', ar: 'المنشورات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.publications && project.publications.length > 0 ? (
                    <div className="space-y-3">
                      {project.publications.map((pub, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <p className="font-medium text-sm text-slate-900">{pub.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-600">{pub.publication}</span>
                            <span className="text-xs text-slate-500">• {pub.year}</span>
                          </div>
                          {pub.authors && pub.authors.length > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                              {pub.authors.join(', ')}
                            </p>
                          )}
                          {pub.url && (
                            <Button variant="outline" size="sm" asChild className="mt-2">
                              <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                {t({ en: 'View Publication', ar: 'عرض المنشور' })}
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'No publications yet', ar: 'لا توجد منشورات بعد' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {project.patents && project.patents.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-600" />
                      {t({ en: 'Patents', ar: 'براءات الاختراع' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.patents.map((patent, i) => (
                        <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="font-medium text-sm text-amber-900">{patent.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-600">{patent.number}</span>
                            <Badge variant="outline" className="text-xs">{patent.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="datasets">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-teal-600" />
                    {t({ en: 'Datasets Generated', ar: 'مجموعات البيانات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.datasets_generated && project.datasets_generated.length > 0 ? (
                    <div className="space-y-3">
                      {project.datasets_generated.map((dataset, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm text-slate-900">{dataset.name}</p>
                          {dataset.description && (
                            <p className="text-sm text-slate-600 mt-1">{dataset.description}</p>
                          )}
                          {dataset.url && (
                            <Button variant="outline" size="sm" asChild className="mt-2">
                              <a href={dataset.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3 mr-2" />
                                {t({ en: 'Access Dataset', ar: 'الوصول للبيانات' })}
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'No datasets generated yet', ar: 'لا توجد بيانات بعد' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    {t({ en: 'Impact Assessment', ar: 'تقييم التأثير' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.impact_assessment ? (
                    <div className="space-y-4">
                      {(project.impact_assessment.academic_impact_en || project.impact_assessment.academic_impact) && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t({ en: 'Academic Impact', ar: 'التأثير الأكاديمي' })}:</p>
                          <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' && project.impact_assessment.academic_impact_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && project.impact_assessment.academic_impact_ar 
                              ? project.impact_assessment.academic_impact_ar 
                              : (project.impact_assessment.academic_impact_en || project.impact_assessment.academic_impact)}
                          </p>
                        </div>
                      )}
                      {(project.impact_assessment.practical_impact_en || project.impact_assessment.practical_impact) && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t({ en: 'Practical Impact', ar: 'التأثير العملي' })}:</p>
                          <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' && project.impact_assessment.practical_impact_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && project.impact_assessment.practical_impact_ar 
                              ? project.impact_assessment.practical_impact_ar 
                              : (project.impact_assessment.practical_impact_en || project.impact_assessment.practical_impact)}
                          </p>
                        </div>
                      )}
                      {(project.impact_assessment.policy_impact_en || project.impact_assessment.policy_impact) && (
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t({ en: 'Policy Impact', ar: 'التأثير على السياسات' })}:</p>
                          <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' && project.impact_assessment.policy_impact_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && project.impact_assessment.policy_impact_ar 
                              ? project.impact_assessment.policy_impact_ar 
                              : (project.impact_assessment.policy_impact_en || project.impact_assessment.policy_impact)}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'Impact assessment pending', ar: 'تقييم التأثير قيد الانتظار' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pilot">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Pilot Opportunities', ar: 'فرص التجريب' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.pilot_opportunities && project.pilot_opportunities.length > 0 ? (
                    <div className="space-y-3">
                      {project.pilot_opportunities.map((opp, i) => (
                        <div key={i} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                          <p className="text-sm text-slate-700" dir={language === 'ar' && opp.description_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && opp.description_ar ? opp.description_ar : (opp.description_en || opp.description)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-600">{opp.municipality}</span>
                            <Badge variant="outline" className="text-xs">{opp.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'No pilot opportunities identified yet', ar: 'لم يتم تحديد فرص التجريب بعد' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {project.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={project.image_url} alt={project.title_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}

              {project.gallery_urls && project.gallery_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {project.gallery_urls.map((url, i) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {project.video_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-red-600" />
                      {t({ en: 'Video', ar: 'فيديو' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
                      <p className="text-slate-500">Video Player</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="experts" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      {t({ en: 'Peer Review Panel', ar: 'لجنة المراجعة' })}
                    </CardTitle>
                    <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=rd_project&entity_id=${projectId}`)} target="_blank">
                      <Button size="sm" className="bg-purple-600">
                        <Users className="h-4 w-4 mr-2" />
                        {t({ en: 'Assign Peer Reviewers', ar: 'تعيين محكمين' })}
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
                              <div className="text-sm font-bold text-green-600">{evaluation.innovation_score}</div>
                              <div className="text-xs text-slate-600">{t({ en: 'Innovation', ar: 'الابتكار' })}</div>
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
                        </div>
                      ))}

                      {expertEvaluations.length >= 2 && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-2">
                            {t({ en: 'Peer Review Consensus', ar: 'إجماع المحكمين' })}
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t({ en: 'Peer Reviewers:', ar: 'المحكمون:' })}</span>
                              <span className="font-medium">{expertEvaluations.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t({ en: 'Recommendation:', ar: 'التوصية:' })}</span>
                              <span className="font-medium text-green-600">
                                {(expertEvaluations.filter(e => e.recommendation === 'approve').length / expertEvaluations.length * 100).toFixed(0)}% Approve
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t({ en: 'Avg. Score:', ar: 'متوسط النقاط:' })}</span>
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
                      <p className="text-slate-500 mb-4">{t({ en: 'No peer reviews yet', ar: 'لا توجد مراجعات بعد' })}</p>
                      <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=rd_project&entity_id=${projectId}`)} target="_blank">
                        <Button className="bg-purple-600">
                          <Users className="h-4 w-4 mr-2" />
                          {t({ en: 'Request Peer Review', ar: 'طلب مراجعة الأقران' })}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    {t({ en: 'Research Discussion', ar: 'نقاش البحث' })} ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comments.filter(c => c && c.created_date).map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg border ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">{c.created_by}</span>
                            {c.is_internal && <Badge variant="outline" className="text-xs">{t({ en: 'Internal', ar: 'داخلي' })}</Badge>}
                          </div>
                          <p className="text-sm text-slate-700">{c.comment_text}</p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {c.created_date ? new Date(c.created_date).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder={t({ en: "Add a research comment...", ar: "أضف تعليقاً بحثياً..." })}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={() => commentMutation.mutate({ rd_project_id: projectId, comment_text: comment })}
                      className="bg-gradient-to-r from-blue-600 to-teal-600"
                      disabled={!comment}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {t({ en: 'Post Comment', ar: 'نشر التعليق' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="workflow">
              <UnifiedWorkflowApprovalTab entityType="rd_project" entityId={projectId} />
            </TabsContent>

            <TabsContent value="activity">
              <RDProjectActivityLog rdProjectId={projectId} />
            </TabsContent>

            <TabsContent value="trl" className="space-y-6">
              <TRLVisualization trl_start={project.trl_start} trl_current={project.trl_current || project.trl_start} trl_target={project.trl_target} />
              <TRLAssessmentWorkflow rdProject={project} onUpdate={() => queryClient.invalidateQueries(['rd-project'])} />
            </TabsContent>

            <TabsContent value="policy" className="space-y-6">
              <PolicyImpactTracker rdProject={project} />
              <PolicyTabWidget entityType="rd_project" entityId={projectId} />
            </TabsContent>

            <TabsContent value="ip">
              <IPManagementWidget project={project} />
            </TabsContent>

            <TabsContent value="final-eval">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Final Project Evaluation', ar: 'التقييم النهائي للمشروع' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.status === 'completed' ? (
                    <>
                      {expertEvaluations.length === 0 ? (
                        <div className="text-center py-12">
                          <Award className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 mb-4">{t({ en: 'No final evaluations yet', ar: 'لا توجد تقييمات نهائية بعد' })}</p>
                          <Button onClick={() => setShowFinalEvaluation(true)} className="bg-purple-600">
                            <Award className="h-4 w-4 mr-2" />
                            {t({ en: 'Submit Final Evaluation', ar: 'تقديم التقييم النهائي' })}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <RDProjectFinalEvaluationPanel project={project} onClose={() => {}} />
                          <Button onClick={() => setShowFinalEvaluation(true)} className="w-full mt-4 bg-purple-600">
                            <Award className="h-4 w-4 mr-2" />
                            {t({ en: 'Add Another Evaluation', ar: 'إضافة تقييم آخر' })}
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500">{t({ en: 'Final evaluation available when project is completed', ar: 'التقييم النهائي متاح عند اكتمال المشروع' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
            </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Project Info', ar: 'معلومات المشروع' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Lead Institution', ar: 'المؤسسة الرائدة' })}</p>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium">
                    {language === 'ar' && project.institution_ar ? project.institution_ar : (project.institution_en || project.institution)}
                  </p>
                </div>
              </div>
              {project.institution_type && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Type', ar: 'النوع' })}</p>
                  <Badge variant="outline" className="text-xs capitalize">{project.institution_type.replace(/_/g, ' ')}</Badge>
                </div>
              )}
              {(project.research_area_en || project.research_area) && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Research Area', ar: 'مجال البحث' })}</p>
                  <p className="text-sm">{language === 'ar' && project.research_area_ar ? project.research_area_ar : (project.research_area_en || project.research_area)}</p>
                </div>
              )}
              {project.living_lab_id && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Living Lab', ar: 'المختبر الحي' })}</p>
                  <Link to={createPageUrl(`LivingLabDetail?id=${project.living_lab_id}`)} className="text-sm text-blue-600 hover:underline">
                    {t({ en: 'View Lab', ar: 'عرض المختبر' })}
                  </Link>
                </div>
              )}
              {project.rd_call_id && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'R&D Call', ar: 'دعوة البحث' })}</p>
                  <Link to={createPageUrl(`RDCallDetail?id=${project.rd_call_id}`)} className="text-sm text-blue-600 hover:underline">
                    {t({ en: 'View Call', ar: 'عرض الدعوة' })}
                  </Link>
                </div>
              )}
              {project.duration_months && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Duration', ar: 'المدة' })}</p>
                  <p className="text-sm">{project.duration_months} {t({ en: 'months', ar: 'شهر' })}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {project.challenge_ids && project.challenge_ids.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-sm text-red-900">
                  {t({ en: 'Linked Challenges', ar: 'التحديات المرتبطة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{project.challenge_ids.length} challenges</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}