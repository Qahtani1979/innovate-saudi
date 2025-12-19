import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import {
  Sparkles, FileText, Lightbulb, Activity, MessageSquare, TrendingUp,
  Target, AlertCircle, TestTube, Microscope, BarChart3, Users, Database,
  Award, Image, Clock, Shield, Network, Globe, BookOpen, Calendar
} from 'lucide-react';
import { usePrompt } from '@/hooks/usePrompt';
import { CHALLENGE_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/challenges/challengeDetail';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';
import { useSolutionsWithVisibility, usePilotsWithVisibility, useContractsWithVisibility } from '@/hooks/visibility';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import { ChallengeHero, ChallengeStatsCards, ChallengeWorkflowModals } from '@/components/challenges/detail';

// Import all extracted tab components
import {
  ChallengeOverviewTab,
  ChallengeProblemTab,
  ChallengeKPIsTab,
  ChallengeDataTab,
  ChallengeAITab,
  ChallengeSolutionsTab,
  ChallengePilotsTab,
  ChallengeRDTab,
  ChallengeStakeholdersTab,
  ChallengeRelatedTab,
  ChallengeMediaTab,
  ChallengeActivityTab,
  ChallengeFinancialTab,
  ChallengeProgramsTab,
  ChallengeProposalsTab,
  ChallengeKnowledgeTab,
  ChallengeExpertsTab,
  ChallengeImpactTab
} from '@/components/challenges/detail/tabs';

// Custom hook for challenge data fetching
function useChallengeData(challengeId) {
  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle();
      return data;
    },
    enabled: !!challengeId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['challenge-comments', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('comments').select('*').eq('entity_type', 'challenge').eq('entity_id', challengeId);
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: expertEvaluations = [] } = useQuery({
    queryKey: ['challenge-expert-evaluations', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('expert_evaluations').select('*').eq('entity_type', 'challenge').eq('entity_id', challengeId);
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['challenge-proposals', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenge_proposals').select('*').eq('challenge_id', challengeId);
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: linkedPrograms = [] } = useQuery({
    queryKey: ['challenge-programs', challengeId],
    queryFn: async () => {
      if (!challenge?.linked_program_ids || challenge.linked_program_ids.length === 0) return [];
      const { data } = await supabase
        .from('programs')
        .select('*')
        .eq('is_deleted', false);
      return data?.filter(p => challenge.linked_program_ids.includes(p.id)) || [];
    },
    enabled: !!challenge
  });

  const { data: policyRecommendations = [] } = useQuery({
    queryKey: ['challenge-policies', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('policy_recommendations').select('*').eq('challenge_id', challengeId);
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['challenge-activities', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenge_activities').select('*').eq('challenge_id', challengeId).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: relatedRD = [] } = useQuery({
    queryKey: ['challenge-rd', challengeId],
    queryFn: async () => {
      if (!challenge?.linked_rd_ids || challenge.linked_rd_ids.length === 0) return [];
      const { data } = await supabase.from('rd_projects').select('*').eq('is_deleted', false);
      return data?.filter(rd => challenge.linked_rd_ids.includes(rd.id)) || [];
    },
    enabled: !!challenge
  });

  const { data: allSolutions = [] } = useSolutionsWithVisibility();
  const { data: allPilots = [] } = usePilotsWithVisibility();
  const pilots = allPilots.filter(p => p.challenge_id === challengeId);
  const { data: allContracts = [] } = useContractsWithVisibility();
  const contracts = allContracts.filter(c => c.challenge_id === challengeId);

  return {
    challenge,
    isLoading,
    comments,
    expertEvaluations,
    proposals,
    linkedPrograms,
    policyRecommendations,
    activities,
    relatedRD,
    solutions: allSolutions,
    pilots,
    contracts
  };
}

export default function ChallengeDetailRefactored() {
  const { hasPermission, isAdmin } = usePermissions();
  const [showSubmission, setShowSubmission] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showTreatment, setShowTreatment] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [showRDConversion, setShowRDConversion] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [freshAiInsights, setFreshAiInsights] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { invoke: invokeAI, status: aiStatus, isLoading: generatingInsights, isAvailable, rateLimitInfo } = usePrompt(null);
  
  // Use custom hook for all data fetching
  const {
    challenge,
    isLoading,
    comments,
    expertEvaluations,
    proposals,
    linkedPrograms,
    policyRecommendations,
    activities,
    relatedRD,
    solutions,
    pilots,
    contracts
  } = useChallengeData(challengeId);

  // Visibility access check
  const accessCheck = useEntityAccessCheck(challenge, {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id',
    ownerColumn: 'created_by',
    publishedColumn: 'is_published',
    statusColumn: 'status',
    publicStatuses: ['approved', 'published', 'active', 'completed']
  });

  const generateFreshInsights = async () => {
    if (!challenge) {
      toast.error(t({ en: 'Challenge not loaded', ar: 'لم يتم تحميل التحدي' }));
      return;
    }
    
    try {
      const promptConfig = CHALLENGE_DETAIL_PROMPT_TEMPLATE(challenge);
      const result = await invokeAI({
        prompt: promptConfig.prompt,
        system_prompt: promptConfig.system,
        response_json_schema: promptConfig.schema
      });

      if (result.success) {
        setFreshAiInsights(result.data);
        toast.success(t({ en: 'Fresh AI insights generated', ar: 'تم إنشاء رؤى ذكية جديدة' }));
      } else {
        toast.error(t({ en: 'Failed to generate insights', ar: 'فشل إنشاء الرؤى' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate insights', ar: 'فشل إنشاء الرؤى' }));
    }
  };

  if (isLoading || !challenge) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Tab configuration for cleaner rendering
  const tabConfig = [
    { value: 'workflow', icon: Shield, label: { en: 'Workflow', ar: 'سير العمل' } },
    { value: 'overview', icon: FileText, label: { en: 'Overview', ar: 'نظرة' } },
    { value: 'problem', icon: AlertCircle, label: { en: 'Problem', ar: 'مشكلة' } },
    { value: 'data', icon: Database, label: { en: 'Evidence', ar: 'أدلة' } },
    { value: 'kpis', icon: Target, label: { en: 'KPIs', ar: 'مؤشرات' } },
    { value: 'stakeholders', icon: Users, label: { en: 'Stake', ar: 'أطراف' } },
    { value: 'ai', icon: Sparkles, label: { en: 'AI', ar: 'ذكاء' } },
    { value: 'solutions', icon: Lightbulb, label: { en: 'Solutions', ar: 'حلول' } },
    { value: 'pilots', icon: TestTube, label: { en: 'Pilots', ar: 'تجارب' } },
    { value: 'rd', icon: Microscope, label: { en: 'R&D', ar: 'بحث' } },
    { value: 'related', icon: Activity, label: { en: 'Related', ar: 'ذات صلة' } },
    { value: 'impact', icon: TrendingUp, label: { en: 'Impact', ar: 'الأثر' } },
    { value: 'media', icon: Image, label: { en: 'Media', ar: 'وسائط' } },
    { value: 'activity', icon: MessageSquare, label: { en: 'Activity', ar: 'نشاط' } },
    { value: 'proposals', icon: FileText, label: { en: 'Proposals', ar: 'مقترحات' } },
    { value: 'experts', icon: Award, label: { en: 'Experts', ar: 'خبراء' } },
    { value: 'programs', icon: Calendar, label: { en: 'Programs', ar: 'برامج' } },
    { value: 'knowledge', icon: BookOpen, label: { en: 'Knowledge', ar: 'معرفة' } },
    { value: 'financial', icon: TrendingUp, label: { en: 'Financial', ar: 'مالي' } },
    { value: 'network', icon: Network, label: { en: 'Network', ar: 'شبكة' } }
  ];

  return (
    <PageLayout>
      {/* Workflow Modals */}
      <ChallengeWorkflowModals
        challenge={challenge}
        showSubmission={showSubmission}
        showReview={showReview}
        showTreatment={showTreatment}
        showResolution={showResolution}
        showRDConversion={showRDConversion}
        showArchive={showArchive}
        onCloseSubmission={() => setShowSubmission(false)}
        onCloseReview={() => setShowReview(false)}
        onCloseTreatment={() => setShowTreatment(false)}
        onCloseResolution={() => setShowResolution(false)}
        onCloseRDConversion={() => setShowRDConversion(false)}
        onCloseArchive={() => setShowArchive(false)}
      />

      {/* Hero Section */}
      <ChallengeHero
        challenge={challenge}
        onShowSubmission={() => setShowSubmission(true)}
        onShowReview={() => setShowReview(true)}
        onShowTreatment={() => setShowTreatment(true)}
        onShowRDConversion={() => setShowRDConversion(true)}
        onShowArchive={() => setShowArchive(true)}
        onShowResolution={() => setShowResolution(true)}
        challengeId={challengeId}
      />

      {/* Key Metrics - Using ChallengeStatsCards if available, else inline */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Severity', ar: 'الخطورة' })}</p>
                <p className="text-3xl font-bold text-red-600">{challenge.severity_score || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Impact', ar: 'التأثير' })}</p>
                <p className="text-3xl font-bold text-orange-600">{challenge.impact_score || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Overall', ar: 'الإجمالي' })}</p>
                <p className="text-3xl font-bold text-blue-600">{challenge.overall_score || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
                <p className="text-3xl font-bold text-purple-600">{solutions.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
                <p className="text-3xl font-bold text-teal-600">{pilots.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Votes', ar: 'الأصوات' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{challenge.citizen_votes_count || 0}</p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10 h-auto">
              {tabConfig.slice(0, 10).map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex flex-col gap-1 py-3">
                  <tab.icon className="h-4 w-4" />
                  <span className="text-xs">{t(tab.label)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Second row of tabs */}
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-10 h-auto">
              {tabConfig.slice(10).map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex flex-col gap-1 py-3">
                  <tab.icon className="h-4 w-4" />
                  <span className="text-xs">{t(tab.label)}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content - Using extracted components */}
            <TabsContent value="workflow">
              <UnifiedWorkflowApprovalTab
                entityType="challenge"
                entityId={challengeId}
                entityData={challenge}
                currentUser={user}
              />
            </TabsContent>

            <TabsContent value="overview">
              <ChallengeOverviewTab challenge={challenge} />
            </TabsContent>

            <TabsContent value="problem">
              <ChallengeProblemTab challenge={challenge} />
            </TabsContent>

            <TabsContent value="data">
              <ChallengeDataTab challenge={challenge} />
            </TabsContent>

            <TabsContent value="kpis">
              <ChallengeKPIsTab challenge={challenge} />
            </TabsContent>

            <TabsContent value="stakeholders">
              <ChallengeStakeholdersTab challenge={challenge} />
            </TabsContent>

            <TabsContent value="ai">
              <ChallengeAITab
                challenge={challenge}
                freshAiInsights={freshAiInsights}
                onGenerateInsights={generateFreshInsights}
                generatingInsights={generatingInsights}
                isAvailable={isAvailable}
                aiStatus={aiStatus}
              />
            </TabsContent>

            <TabsContent value="solutions">
              <ChallengeSolutionsTab challenge={challenge} solutions={solutions} />
            </TabsContent>

            <TabsContent value="pilots">
              <ChallengePilotsTab challenge={challenge} pilots={pilots} />
            </TabsContent>

            <TabsContent value="rd">
              <ChallengeRDTab challenge={challenge} relatedRD={relatedRD} />
            </TabsContent>

            <TabsContent value="related">
              <ChallengeRelatedTab challenge={challenge} challengeId={challengeId} />
            </TabsContent>

            <TabsContent value="impact">
              <ChallengeImpactTab challenge={challenge} challengeId={challengeId} />
            </TabsContent>

            <TabsContent value="media">
              <ChallengeMediaTab challenge={challenge} />
            </TabsContent>

            <TabsContent value="activity">
              <ChallengeActivityTab
                challenge={challenge}
                challengeId={challengeId}
                comments={comments}
                activities={activities}
              />
            </TabsContent>

            <TabsContent value="proposals">
              <ChallengeProposalsTab challenge={challenge} proposals={proposals} />
            </TabsContent>

            <TabsContent value="experts">
              <ChallengeExpertsTab challenge={challenge} expertEvaluations={expertEvaluations} />
            </TabsContent>

            <TabsContent value="programs">
              <ChallengeProgramsTab challenge={challenge} linkedPrograms={linkedPrograms} />
            </TabsContent>

            <TabsContent value="knowledge">
              <ChallengeKnowledgeTab challenge={challenge} policyRecommendations={policyRecommendations} />
            </TabsContent>

            <TabsContent value="financial">
              <ChallengeFinancialTab challenge={challenge} contracts={contracts} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Quick Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-slate-900">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t({ en: 'Code', ar: 'الرمز' })}</span>
                  <span className="font-mono">{challenge.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t({ en: 'Status', ar: 'الحالة' })}</span>
                  <span className="capitalize">{challenge.status?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t({ en: 'Priority', ar: 'الأولوية' })}</span>
                  <span>{challenge.priority?.replace('tier_', 'Tier ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{t({ en: 'Sector', ar: 'القطاع' })}</span>
                  <span className="capitalize">{challenge.sector?.replace(/_/g, ' ')}</span>
                </div>
                {challenge.budget_estimate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t({ en: 'Budget', ar: 'الميزانية' })}</span>
                    <span>{challenge.budget_estimate.toLocaleString()} SAR</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
