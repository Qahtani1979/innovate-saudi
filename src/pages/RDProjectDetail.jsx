import { useState } from 'react';
import { useRDProjectInvalidator } from '@/hooks/useRDProjectMutations';
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
  Beaker, Target, Calendar, DollarSign, FileText, Sparkles,
  TrendingUp, CheckCircle2, Users, BookOpen, Award, Send, MessageSquare,
  Clock, Building2, Image, Video, Database, AlertCircle,
  ExternalLink, TestTube, Rocket, Loader2, X, Shield, Lightbulb, Activity
} from 'lucide-react';
import RDProjectActivityLog from '../components/rd/RDProjectActivityLog';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import { usePermissions } from '@/hooks/usePermissions';
import { usePrompt } from '@/hooks/usePrompt';
import { RD_PROJECT_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/rd/rdProjectDetail';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import { useRDProject } from '@/hooks/useRDProjectsWithVisibility';
import { useRDProjectComments, useAddRDProjectComment } from '@/hooks/useRDProjectComments';
import { useExpertEvaluationsByEntity } from '@/hooks/useExpertData';

// Modular Layout Components
import RDProjectHero from '../components/rd/RDProjectHero';
import RDProjectMetrics from '../components/rd/RDProjectMetrics';
import RDProjectSidebar from '../components/rd/RDProjectSidebar';
import RDProjectModals from '../components/rd/RDProjectModals';
import TRLVisualization from '../components/rd/TRLVisualization';
import TRLAssessmentWorkflow from '../components/rd/TRLAssessmentWorkflow';

// Modular Tab Components
import OverviewTab from '../components/rd/tabs/OverviewTab';
import TeamTab from '../components/rd/tabs/TeamTab';
import MethodologyTab from '../components/rd/tabs/MethodologyTab';
import TimelineTab from '../components/rd/tabs/TimelineTab';
import BudgetTab from '../components/rd/tabs/BudgetTab';
import OutputsTab from '../components/rd/tabs/OutputsTab';
import PublicationsTab from '../components/rd/tabs/PublicationsTab';
import DatasetsTab from '../components/rd/tabs/DatasetsTab';
import ImpactTab from '../components/rd/tabs/ImpactTab';
import PilotTab from '../components/rd/tabs/PilotTab';
import MediaTab from '../components/rd/tabs/MediaTab';
import ExpertsTab from '../components/rd/tabs/ExpertsTab';
import DiscussionTab from '../components/rd/tabs/DiscussionTab';
import PolicyTab from '../components/rd/tabs/PolicyTab';
import IPTab from '../components/rd/tabs/IPTab';
import FinalEvalTab from '../components/rd/tabs/FinalEvalTab';

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
  const { invalidateRDProject } = useRDProjectInvalidator();
  const { invoke: invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = usePrompt(null);

  const { data: project, isLoading, error: projectError } = useRDProject(projectId);
  const { data: comments = [] } = useRDProjectComments(projectId);
  const { data: expertEvaluations = [] } = useExpertEvaluationsByEntity('rd_project', projectId);

  const addCommentMutation = useAddRDProjectComment();

  const handlePostComment = () => {
    addCommentMutation.mutate({ rd_project_id: projectId, comment_text: comment }, {
      onSuccess: () => setComment('')
    });
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="h-48 bg-muted animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </PageLayout>
    );
  }

  if (projectError || !project) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-destructive">{t({ en: 'Error loading project or project not found', ar: 'خطأ في تحميل المشروع' })}</p>
        </div>
      </PageLayout>
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
    // Use centralized prompt template
    const promptConfig = RD_PROJECT_DETAIL_PROMPT_TEMPLATE(project);

    const response = await invokeAI({
      prompt: promptConfig.prompt,
      system_prompt: promptConfig.system,
      response_json_schema: promptConfig.schema
    });
    if (response.success) {
      setAiInsights(response.data);
    }
  };

  return (
    <PageLayout>
      <RDProjectModals
        project={project}
        showKickoff={showKickoff}
        setShowKickoff={setShowKickoff}
        showCompletion={showCompletion}
        setShowCompletion={setShowCompletion}
        showPilotTransition={showPilotTransition}
        setShowPilotTransition={setShowPilotTransition}
        showMilestoneGate={showMilestoneGate}
        setShowMilestoneGate={setShowMilestoneGate}
        selectedMilestone={selectedMilestone}
        setSelectedMilestone={setSelectedMilestone}
        showOutputValidation={showOutputValidation}
        setShowOutputValidation={setShowOutputValidation}
        showTRLAdvancement={showTRLAdvancement}
        setShowTRLAdvancement={setShowTRLAdvancement}
        showSolutionConverter={showSolutionConverter}
        setShowSolutionConverter={setShowSolutionConverter}
        showPolicyConverter={showPolicyConverter}
        setShowPolicyConverter={setShowPolicyConverter}
        showTRLAssessment={showTRLAssessment}
        setShowTRLAssessment={setShowTRLAssessment}
        showFinalEvaluation={showFinalEvaluation}
        setShowFinalEvaluation={setShowFinalEvaluation}
        onUpdate={() => invalidateRDProject(projectId)}
      />

      <RDProjectHero
        project={project}
        language={language}
        t={t}
        statusInfo={statusInfo}
        StatusIcon={StatusIcon}
        user={user}
        hasPermission={hasPermission}
        onStartKickoff={() => setShowKickoff(true)}
        onTRLAdvancement={() => setShowTRLAdvancement(true)}
        onOutputValidation={() => setShowOutputValidation(true)}
        onCompletion={() => setShowCompletion(true)}
        onPilotTransition={() => setShowPilotTransition(true)}
        onFinalEvaluation={() => setShowFinalEvaluation(true)}
        onSolutionConverter={() => setShowSolutionConverter(true)}
        onPolicyConverter={() => setShowPolicyConverter(true)}
        onAIInsights={handleAIInsights}
      />

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
            <AIStatusIndicator status={aiStatus} error={null} rateLimitInfo={rateLimitInfo} className="mb-4" />
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

      <RDProjectMetrics project={project} t={t} />

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

            <TabsContent value="overview">
              <OverviewTab project={project} t={t} language={language} projectId={projectId} />
            </TabsContent>

            <TabsContent value="team">
              <TeamTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="methodology">
              <MethodologyTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="timeline">
              <TimelineTab
                project={project}
                t={t}
                language={language}
                onApproveMilestone={(milestone) => {
                  setSelectedMilestone(milestone);
                  setShowMilestoneGate(true);
                }}
              />
            </TabsContent>

            <TabsContent value="budget">
              <BudgetTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="outputs">
              <OutputsTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="publications">
              <PublicationsTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="datasets">
              <DatasetsTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="impact">
              <ImpactTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="pilot">
              <PilotTab project={project} t={t} language={language} />
            </TabsContent>

            <TabsContent value="media">
              <MediaTab project={project} t={t} />
            </TabsContent>

            <TabsContent value="experts">
              <ExpertsTab
                project={project}
                expertEvaluations={expertEvaluations}
                t={t}
                language={language}
                projectId={projectId}
              />
            </TabsContent>

            <TabsContent value="discussion">
              <DiscussionTab
                comments={comments}
                comment={comment}
                setComment={setComment}
                onPostComment={handlePostComment}
                t={t}
              />
            </TabsContent>

            <TabsContent value="workflow">
              <UnifiedWorkflowApprovalTab entityType="rd_project" entityId={projectId} entityData={project} />
            </TabsContent>

            <TabsContent value="activity">
              <RDProjectActivityLog rdProjectId={projectId} />
            </TabsContent>

            <TabsContent value="trl">
              <TRLVisualization trl_start={project.trl_start} trl_current={project.trl_current || project.trl_start} trl_target={project.trl_target} />
              <TRLAssessmentWorkflow rdProject={project} onUpdate={() => invalidateRDProject(projectId)} />
            </TabsContent>

            <TabsContent value="policy">
              <PolicyTab project={project} projectId={projectId} />
            </TabsContent>

            <TabsContent value="ip">
              <IPTab project={project} />
            </TabsContent>

            <TabsContent value="final-eval">
              <FinalEvalTab
                project={project}
                expertEvaluations={expertEvaluations}
                t={t}
                onShowFinalEvaluation={() => setShowFinalEvaluation(true)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <RDProjectSidebar project={project} t={t} language={language} />
        </div>
      </div>
    </PageLayout>
  );
}
