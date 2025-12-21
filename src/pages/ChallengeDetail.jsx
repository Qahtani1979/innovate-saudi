import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { toast } from 'sonner';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import {
  Sparkles, FileText, Lightbulb, Activity, MessageSquare, TrendingUp,
  MapPin, Calendar, Target, AlertCircle, TestTube, Microscope, Send,
  BarChart3, Users, Database, Award, Image, Clock, CheckCircle2, Loader2,
  Zap, Shield, Network, Archive, AlertTriangle, User, Globe, BookOpen
} from 'lucide-react';
import RelationManager from '../components/RelationManager';
import ChallengeActivityLog from '../components/challenges/ChallengeActivityLog';
import { usePrompt } from '@/hooks/usePrompt';
import { CHALLENGE_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/challenges/challengeDetail';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';
import { useSolutionsWithVisibility, usePilotsWithVisibility, useContractsWithVisibility } from '@/hooks/visibility';
import { PageLayout } from '@/components/layout/PersonaPageLayout';
import { useChallengeDetailRealtime } from '@/hooks/useChallengeRealtime';
import { ProtectedPage } from '@/components/permissions/ProtectedPage';

// Layout Components
import {
  ChallengeHero,
  ChallengeWorkflowModals,
  ChallengeMetrics,
  ChallengeSidebar
} from '@/components/challenges/detail';

// Tab Components
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
} from '@/components/challenges/detail';

function ChallengeDetail() {
  const { hasPermission, isAdmin, userEmail } = usePermissions();
  const [comment, setComment] = useState('');
  const [freshAiInsights, setFreshAiInsights] = useState(null);
  const [showSubmission, setShowSubmission] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showTreatment, setShowTreatment] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [showRDConversion, setShowRDConversion] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [externalIntelligence, setExternalIntelligence] = useState(null);
  const [relationManagerOpen, setRelationManagerOpen] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const { invoke: invokeAI, status: aiStatus, isLoading: generatingInsights, isAvailable, rateLimitInfo } = usePrompt(null);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('id', challengeId).eq('is_deleted', false).maybeSingle();
      return data;
    },
    enabled: !!challengeId
  });

  // Enable realtime updates for this challenge (rt-1, live-2)
  const { isConnected: realtimeConnected } = useChallengeDetailRealtime(challengeId);

  // Visibility access check for the challenge
  const accessCheck = useEntityAccessCheck(challenge, {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id',
    ownerColumn: 'created_by',
    publishedColumn: 'is_published',
    statusColumn: 'status',
    publicStatuses: ['approved', 'published', 'active', 'completed']
  });

  // Use visibility-aware hooks for related entities
  // Use visibility-aware hooks for related entities
  const { data: allSolutions = [] } = useSolutionsWithVisibility();
  const solutions = allSolutions.filter(s => s.challenges_discovered?.includes(challengeId));

  // Pilots related to this challenge (filtered from visibility-aware data)
  const { data: allPilots = [] } = usePilotsWithVisibility();
  const pilots = allPilots.filter(p => p.challenge_id === challengeId);

  // Contracts with visibility
  const { data: allContracts = [] } = useContractsWithVisibility();

  // Contracts filtered by association with this challenge's pilots or solutions
  const contracts = allContracts.filter(c =>
    (c.pilot_id && pilots.some(p => p.id === c.pilot_id)) ||
    (c.solution_id && solutions.some(s => s.id === c.solution_id))
  );

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

  const { user } = useAuth();

  const { data: proposals = [] } = useQuery({
    queryKey: ['challenge-proposals', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenge_proposals').select('*').eq('challenge_id', challengeId).eq('is_deleted', false);
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: linkedPrograms = [] } = useQuery({
    queryKey: ['challenge-programs', challengeId],
    queryFn: async () => {
      if (!challenge?.linked_program_ids || challenge.linked_program_ids.length === 0) return [];
      const { data } = await supabase.from('programs').select('*').eq('is_deleted', false);
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

  const { data: citizenIdea } = useQuery({
    queryKey: ['citizen-idea', challenge?.citizen_origin_idea_id],
    queryFn: async () => {
      if (!challenge?.citizen_origin_idea_id) return null;
      const { data } = await supabase.from('citizen_ideas').select('*').eq('id', challenge.citizen_origin_idea_id).maybeSingle();
      return data;
    },
    enabled: !!challenge?.citizen_origin_idea_id
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['challenge-activities', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenge_activities').select('*').eq('challenge_id', challengeId).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!challengeId
  });

  // Events linked to the challenge's programs
  const { data: events = [] } = useQuery({
    queryKey: ['challenge-events', challengeId],
    queryFn: async () => {
      if (!challenge?.linked_program_ids?.length) return [];
      const { data } = await supabase
        .from('events')
        .select('*')
        .in('program_id', challenge.linked_program_ids)
        .eq('is_deleted', false);
      return data || [];
    },
    enabled: !!challenge?.linked_program_ids?.length
  });



  const { data: relations = [] } = useQuery({
    queryKey: ['challenge-relations', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenge_interests').select('*').eq('challenge_id', challengeId);
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

  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (/** @type {{entity_id: string, entity_type: string, comment_text: string}} */ data) => {
      const { entity_id, entity_type, comment_text } = data || {};
      if (!entity_id || !entity_type || !comment_text) throw new Error('Missing required fields');
      return supabase.from('comments').insert({
        entity_id,
        entity_type,
        comment_text,
        user_email: userEmail
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-comments'] });
      setComment('');
      toast.success('Comment added');
    }
  });

  const { data: allChallenges = [] } = useQuery({
    queryKey: ['all-challenges'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  const generateFreshInsights = async () => {
    if (!challenge) {
      toast.error(t({ en: 'Challenge not loaded', ar: 'لم يتم تحميل التحدي' }));
      return;
    }

    try {
      // Use centralized prompt template
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

  // Typed helpers for JSON fields to satisfy TypeScript
  /** @type {import('@/types').RelatedInitiative[]} */
  const relatedInitiatives = challenge.related_initiatives || [];

  /** @type {import('@/types').LessonLearned[]} */
  const lessonsLearned = challenge.lessons_learned || [];

  /** @type {import('@/types').AffectedPopulation} */
  const affectedPopulation = challenge.affected_population || {};

  /** @type {number | null} */
  const affectedPopulation_size = challenge.affected_population_size;

  /** @type {import('@/types').KPI[]} */
  const kpis = challenge.kpis || [];

  /** @type {import('@/types').ChallengeProposal[]} */
  const typedProposals = /** @type {any} */ (proposals) || [];

  /** @type {import('@/types').Stakeholder[]} */
  const stakeholders = challenge.stakeholders || [];

  /** @type {import('@/types').DataEvidence[]} */
  const dataEvidence = challenge.data_evidence || [];

  /** @type {import('@/types').Constraint[]} */
  const constraints = challenge.constraints || [];

  /** @type {string[]} */
  const galleryUrls = challenge.gallery_urls || [];

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    in_treatment: 'bg-purple-100 text-purple-700',
    resolved: 'bg-teal-100 text-teal-700'
  };

  const priorityColors = {
    tier_1: 'bg-red-100 text-red-700',
    tier_2: 'bg-orange-100 text-orange-700',
    tier_3: 'bg-yellow-100 text-yellow-700',
    tier_4: 'bg-green-100 text-green-700'
  };

  const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    submitted: { color: 'bg-blue-100 text-blue-700', icon: Send },
    under_review: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    in_treatment: { color: 'bg-purple-100 text-purple-700', icon: Activity },
    resolved: { color: 'bg-teal-100 text-teal-700', icon: CheckCircle2 },
    archived: { color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
  };

  const statusInfo = statusConfig[challenge.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  return (
    <PageLayout>
      {/* Workflow Modals - Using refactored component */}
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

      {/* Hero Section - Using refactored component */}
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

      {/* Key Metrics */}
      <ChallengeMetrics challenge={challenge} solutions={solutions} pilots={pilots} t={t} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 h-auto">
              <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="problem" className="flex flex-col gap-1 py-3">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Problem', ar: 'مشكلة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex flex-col gap-1 py-3">
                <Database className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Evidence', ar: 'أدلة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="kpis" className="flex flex-col gap-1 py-3">
                <Target className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'KPIs', ar: 'مؤشرات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="stakeholders" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Stake', ar: 'أطراف' })}</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex flex-col gap-1 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'AI', ar: 'ذكاء' })}</span>
              </TabsTrigger>
              <TabsTrigger value="solutions" className="flex flex-col gap-1 py-3">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Solutions', ar: 'حلول' })}</span>
              </TabsTrigger>
              <TabsTrigger value="pilots" className="flex flex-col gap-1 py-3">
                <TestTube className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Pilots', ar: 'تجارب' })}</span>
              </TabsTrigger>
              <TabsTrigger value="rd" className="flex flex-col gap-1 py-3">
                <Microscope className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'R&D', ar: 'بحث' })}</span>
              </TabsTrigger>
              <TabsTrigger value="related" className="flex flex-col gap-1 py-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Related', ar: 'ذات صلة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="impact" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Impact', ar: 'الأثر' })}</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
                <Image className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Activity', ar: 'نشاط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="innovation" className="flex flex-col gap-1 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Innovate', ar: 'ابتكار' })}</span>
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex flex-col gap-1 py-3">
                <Target className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Strategy', ar: 'استراتيجية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="proposals" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Proposals', ar: 'مقترحات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="experts" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Experts', ar: 'خبراء' })}</span>
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex flex-col gap-1 py-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Programs', ar: 'برامج' })}</span>
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex flex-col gap-1 py-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Knowledge', ar: 'معرفة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="policy" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Policy', ar: 'سياسة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Financial', ar: 'مالي' })}</span>
              </TabsTrigger>
              <TabsTrigger value="workflow-history" className="flex flex-col gap-1 py-3">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'History', ar: 'سجل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex flex-col gap-1 py-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Events', ar: 'فعاليات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Team', ar: 'فريق' })}</span>
              </TabsTrigger>
              <TabsTrigger value="dependencies" className="flex flex-col gap-1 py-3">
                <Network className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Network', ar: 'شبكة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="scaling" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Scaling', ar: 'توسع' })}</span>
              </TabsTrigger>
              <TabsTrigger value="external" className="flex flex-col gap-1 py-3">
                <Globe className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'External', ar: 'خارجي' })}</span>
              </TabsTrigger>
            </TabsList>

            {/* Workflow & Approvals Tab */}
            <TabsContent value="workflow" className="space-y-6">
              <UnifiedWorkflowApprovalTab
                entityType="challenge"
                entityId={challengeId}
                entityData={challenge}
                currentUser={user}
              />
            </TabsContent>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <ChallengeOverviewTab challenge={challenge} />
            </TabsContent>

            {/* Problem Tab */}
            <TabsContent value="problem">
              <ChallengeProblemTab challenge={challenge} />
            </TabsContent>


            {(challenge.problem_statement_en || challenge.problem_statement_ar) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Problem Statement', ar: 'بيان المشكلة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && challenge.problem_statement_ar ? 'rtl' : 'ltr'}>
                    {language === 'ar' && challenge.problem_statement_ar ? challenge.problem_statement_ar : challenge.problem_statement_en}
                  </p>
                </CardContent>
              </Card>
            )}

            {(challenge.root_cause_ar || challenge.root_cause_en) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    {t({ en: 'Root Cause', ar: 'السبب الجذري' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && challenge.root_cause_ar ? 'rtl' : 'ltr'}>
                    {language === 'ar' && challenge.root_cause_ar ? challenge.root_cause_ar : challenge.root_cause_en}
                  </p>
                </CardContent>
              </Card>
            )}

            {challenge.root_causes?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    {t({ en: 'Root Causes (Multiple)', ar: 'الأسباب الجذرية (متعددة)' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {challenge.root_causes.map((cause, i) => (
                      <div key={i} className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                        <p className="text-sm text-slate-700">{cause}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {affectedPopulation && (
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Affected Population', ar: 'السكان المتأثرون' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {affectedPopulation.size && (
                    <div>
                      <span className="text-slate-500">{t({ en: 'Size:', ar: 'الحجم:' })}</span> {affectedPopulation.size}
                    </div>
                  )}
                  {affectedPopulation.demographics && (
                    <div>
                      <span className="text-slate-500">{t({ en: 'Demographics:', ar: 'الخصائص الديمغرافية:' })}</span> {affectedPopulation.demographics}
                    </div>
                  )}
                  {affectedPopulation.location && (
                    <div>
                      <span className="text-slate-500">{t({ en: 'Location:', ar: 'الموقع:' })}</span> {affectedPopulation.location}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {constraints?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Constraints', ar: 'القيود' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {constraints.map((constraint, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <Badge variant="outline" className="text-xs mb-1">{constraint.type}</Badge>
                        <p className="text-sm text-slate-700">{constraint.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <ChallengeDataTab challenge={challenge} dataEvidence={dataEvidence} />
          </TabsContent>
          {dataEvidence && dataEvidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  {t({ en: 'Data & Evidence', ar: 'البيانات والأدلة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataEvidence.map((evidence, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="text-xs mb-2">{evidence.type}</Badge>
                          <p className="text-sm text-slate-700">{evidence.value}</p>
                          <p className="text-xs text-slate-500 mt-1">{t({ en: 'Source:', ar: 'المصدر:' })} {evidence.source}</p>
                          {evidence.date && (
                            <p className="text-xs text-slate-500">{t({ en: 'Date:', ar: 'التاريخ:' })} {evidence.date}</p>
                          )}
                        </div>
                      </div>
                      {evidence.url && (
                        <Button variant="outline" size="sm" asChild className="mt-2">
                          <a href={evidence.url} target="_blank" rel="noopener noreferrer">{t({ en: 'View Data', ar: 'عرض البيانات' })}</a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {challenge.attachments && challenge.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Attachments', ar: 'المرفقات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {challenge.attachments.map((attachment, i) => (
                    <a
                      key={i}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50"
                    >
                      <FileText className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{attachment.name}</p>
                        <p className="text-xs text-slate-500">{attachment.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis">
          <ChallengeKPIsTab challenge={challenge} kpis={kpis} />
        </TabsContent>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              {t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpis && kpis.length > 0 ? (
              <div className="space-y-3">
                {kpis.map((kpi, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-lg border">
                    <p className="font-medium text-slate-900">{kpi.name}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-slate-500">Baseline:</span>{' '}
                        <span className="font-medium">{kpi.baseline}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Target:</span>{' '}
                        <span className="font-medium text-green-600">{kpi.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No KPIs defined', ar: 'لم يتم تحديد مؤشرات أداء' })}</p>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t({ en: 'Score Breakdown', ar: 'تفصيل النقاط' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{challenge.severity_score || 0}</div>
                <div className="text-xs text-slate-600 mt-1">{t({ en: 'Severity', ar: 'الخطورة' })}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{challenge.impact_score || 0}</div>
                <div className="text-xs text-slate-600 mt-1">{t({ en: 'Impact', ar: 'التأثير' })}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{challenge.overall_score || 0}</div>
                <div className="text-xs text-slate-600 mt-1">{t({ en: 'Overall', ar: 'الإجمالي' })}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Stakeholders Tab */}
      <TabsContent value="stakeholders">
        <ChallengeStakeholdersTab challenge={challenge} />
      </TabsContent>

      {/* AI Insights Tab */}
      <TabsContent value="ai">
        <ChallengeAITab
          challenge={challenge}
          freshAiInsights={freshAiInsights}
          generatingInsights={generatingInsights}
          onGenerateInsights={generateFreshInsights}
        />
      </TabsContent>

      {/* Solutions Tab */}
      <TabsContent value="solutions">
        <ChallengeSolutionsTab solutions={solutions} />
      </TabsContent>

      {/* Pilots Tab */}
      <TabsContent value="pilots">
        <ChallengePilotsTab pilots={pilots} />
      </TabsContent>


      {/* R&D Tab */}
      <TabsContent value="rd">
        <ChallengeRDTab relatedRD={relatedRD} />
      </TabsContent>

      {/* Related Tab */}
      <TabsContent value="related">
        <ChallengeRelatedTab
          relations={relations}
          allChallenges={allChallenges}
          relatedInitiatives={relatedInitiatives}
        />
      </TabsContent>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-600" />
              {t({ en: 'Similar Challenges Network', ar: 'شبكة التحديات المشابهة' })}
            </div>
            <Link to={createPageUrl('RelationManagementHub')}>
              <Button className="bg-gradient-to-r from-teal-600 to-blue-600">
                <Network className="h-4 w-4 mr-2" />
                {t({ en: 'AI Matching Hub', ar: 'مركز المطابقة الذكية' })}
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relations.filter(r => r.relation_role === 'similar_to').length > 0 ? (
            <div className="space-y-3">
              {relations
                .filter(r => r.relation_role === 'similar_to')
                .map((rel) => {
                  const similar = allChallenges.find(c => c.id === rel.related_entity_id);
                  if (!similar) return null;

                  return (
                    <a
                      key={rel.id}
                      href={createPageUrl(`ChallengeDetail?id=${similar.id}`)}
                      className="block p-4 border rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">{similar.code}</Badge>
                            <Badge variant="outline" className="text-xs">{similar.sector?.replace(/_/g, ' ')}</Badge>
                            {rel.created_via === 'ai' && (
                              <Badge className="text-xs bg-purple-100 text-purple-700">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-slate-900">{similar.title_en}</p>
                          <p className="text-xs text-slate-600 mt-1">{similar.municipality_id}</p>
                          {rel.notes && (
                            <p className="text-xs text-slate-500 mt-2">{rel.notes}</p>
                          )}
                        </div>
                        {rel.strength && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-teal-600">{Math.round(rel.strength)}%</div>
                            <div className="text-xs text-slate-500">{t({ en: 'Match', ar: 'تطابق' })}</div>
                          </div>
                        )}
                      </div>
                    </a>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">
                {t({ en: 'No similar challenges mapped yet', ar: 'لم يتم رسم تحديات مشابهة بعد' })}
              </p>
              <Link to={createPageUrl('RelationManagementHub')}>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Run AI Matching', ar: 'تشغيل المطابقة الذكية' })}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {relatedInitiatives && relatedInitiatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Related Initiatives', ar: 'المبادرات ذات الصلة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {relatedInitiatives.map((init, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <p className="font-medium text-sm text-slate-900">{init.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{init.status}</Badge>
                    {init.outcome && (
                      <span className="text-xs text-slate-600">{init.outcome}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>

          {/* Impact Report Tab */ }
  <TabsContent value="impact">
    <ChallengeImpactTab challenge={challenge} pilots={pilots} contracts={contracts} />
  </TabsContent>


  {/* Media Tab */ }
  <TabsContent value="media">
    <ChallengeMediaTab challenge={challenge} galleryUrls={galleryUrls} />
  </TabsContent>

  {/* Innovation Framing Tab */ }
  <TabsContent value="innovation">
    <InnovationFramingGenerator
      challenge={challenge}
      onFramingGenerated={async (framing) => {
        const { error } = await supabase
          .from('challenges')
          .update({ innovation_framing: framing })
          .eq('id', challengeId);

        if (error) {
          toast.error(t({ en: 'Failed to save framing', ar: 'فشل حفظ التأطير' }));
          throw error;
        }

        queryClient.invalidateQueries(['challenge', challengeId]);
        toast.success(t({ en: 'Innovation framing saved', ar: 'تم حفظ تأطير الابتكار' }));
      }}
    />
  </TabsContent>

  {/* Strategic Alignment Tab */ }
  <TabsContent value="strategy">
    <StrategicAlignmentSelector
      challenge={challenge}
      onUpdate={() => queryClient.invalidateQueries(['challenge', challengeId])}
    />
  </TabsContent>

  {/* Proposals Tab */ }
  <TabsContent value="proposals">
    <ChallengeProposalsTab
      proposals={typedProposals}
      challenge={challenge}
      onRefresh={() => queryClient.invalidateQueries(['challenge-proposals'])}
    />
  </TabsContent>


  {/* Experts Tab */ }
  <TabsContent value="experts">
    <ChallengeExpertsTab expertEvaluations={expertEvaluations} />
  </TabsContent>

  {/* Programs Tab */ }
  <TabsContent value="programs">
    <ChallengeProgramsTab linkedPrograms={linkedPrograms} />
  </TabsContent>


  {/* Knowledge Tab */ }
  <TabsContent value="knowledge">
    <ChallengeKnowledgeTab lessonsLearned={lessonsLearned} relations={relations} allChallenges={allChallenges} />
  </TabsContent>


  {/* Financial Tab */ }
          <TabsContent value="financial">
            <ChallengeFinancialTab challenge={challenge} pilots={pilots} contracts={contracts} />
          </TabsContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Budget Estimate', ar: 'تقدير الميزانية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                {challenge.budget_estimate ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600">
                      {(challenge.budget_estimate / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-xs text-slate-500">SAR</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">{t({ en: 'Not estimated', ar: 'غير مقدر' })}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Actual Spent', ar: 'المصروف الفعلي' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {((pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0)) / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-slate-500">{t({ en: 'SAR (from pilots)', ar: 'ريال (من التجارب)' })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Contracts', ar: 'العقود' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{contracts.length}</p>
                <p className="text-xs text-slate-500">{t({ en: 'Linked', ar: 'مرتبط' })}</p>
              </CardContent>
            </Card>
          </div>

  {
    contracts.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {t({ en: 'Linked Contracts', ar: 'العقود المرتبطة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{contract.title || contract.contract_number}</p>
                    <p className="text-sm text-slate-600 mt-1">{contract.vendor_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      {contract.contract_value && <span>💰 {(contract.contract_value / 1000).toFixed(0)}K SAR</span>}
                      {contract.start_date && <span>📅 {new Date(contract.start_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Badge className={
                    contract.status === 'active' ? 'bg-green-100 text-green-700' :
                      contract.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                  }>
                    {contract.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-orange-600" />
        {t({ en: 'Budget Breakdown', ar: 'تفصيل الميزانية' })}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
          <span className="text-sm text-slate-600">{t({ en: 'Estimated Budget', ar: 'الميزانية المقدرة' })}</span>
          <span className="font-bold text-slate-900">
            {challenge.budget_estimate ? `${(challenge.budget_estimate / 1000).toFixed(0)}K SAR` : t({ en: 'N/A', ar: 'غير متاح' })}
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
          <span className="text-sm text-slate-600">{t({ en: 'Pilot Spending', ar: 'إنفاق التجارب' })}</span>
          <span className="font-bold text-blue-600">
            {(pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0) / 1000).toFixed(0)}K SAR
          </span>
        </div>
        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
          <span className="text-sm text-slate-600">{t({ en: 'Contract Value', ar: 'قيمة العقود' })}</span>
          <span className="font-bold text-purple-600">
            {(contracts.reduce((sum, c) => sum + (c.contract_value || 0), 0) / 1000).toFixed(0)}K SAR
          </span>
        </div>
      </div>
    </CardContent>
  </Card>

  {/* ROI Calculator */ }
  {
    challenge.budget_estimate && pilots.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'ROI Analysis', ar: 'تحليل العائد على الاستثمار' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Total Investment', ar: 'الاستثمار الكلي' })}</p>
                <p className="text-xl font-bold text-green-600">
                  {((challenge.budget_estimate + pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0)) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Affected Citizens', ar: 'المواطنون المتأثرون' })}</p>
                <p className="text-xl font-bold text-blue-600">
                  {affectedPopulation_size ? (affectedPopulation_size / 1000).toFixed(1) + 'K' : 'N/A'}
                </p>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Cost per Citizen Beneficiary', ar: 'التكلفة لكل مواطن مستفيد' })}</p>
              <p className="text-3xl font-bold text-green-700">
                {affectedPopulation_size ?
                  Math.round((challenge.budget_estimate + pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0)) / affectedPopulation_size)
                  : 'N/A'
                }
              </p>
              <p className="text-xs text-slate-600">SAR per person</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
        </TabsContent >

    {/* Workflow History Tab */ }
    < TabsContent value = "workflow-history" className = "space-y-6" >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            {t({ en: 'Approval & Status Timeline', ar: 'الجدول الزمني للموافقات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                {activities.map((activity, i) => {
                  const activityIcons = {
                    created: FileText,
                    updated: Activity,
                    status_changed: TrendingUp,
                    comment_added: MessageSquare,
                    solution_matched: Lightbulb,
                    pilot_created: TestTube,
                    approved: CheckCircle2,
                    archived: Archive,
                    shared: Users,
                    viewed: Target
                  };
                  const ActivityIcon = activityIcons[activity.activity_type] || Activity;

                  return (
                    <div key={activity.id} className="relative flex gap-4 pl-10">
                      <div className="absolute left-0 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center">
                        <ActivityIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-slate-900">{activity.activity_type?.replace(/_/g, ' ')}</p>
                          <span className="text-xs text-slate-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-slate-600">{activity.description}</p>
                        )}
                        {activity.performed_by && (
                          <p className="text-xs text-slate-500 mt-1">
                            by {activity.performed_by}
                          </p>
                        )}
                        {activity.metadata && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                            {JSON.stringify(activity.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No activity recorded yet', ar: 'لا يوجد نشاط مسجل' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

  {
    challenge.version_number > 1 && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t({ en: 'Version History', ar: 'سجل الإصدارات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Badge variant="outline">v{challenge.version_number}</Badge>
            <span>{t({ en: 'Current version', ar: 'الإصدار الحالي' })}</span>
            {challenge.previous_version_id && (
              <Button variant="link" size="sm" className="text-xs">
                {t({ en: 'View previous versions', ar: 'عرض الإصدارات السابقة' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
        </TabsContent >

    {/* Events Tab */ }
    < TabsContent value = "events" className = "space-y-6" >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            {t({ en: 'Related Events & Milestones', ar: 'الفعاليات والمعالم' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{event.title || event.name}</p>
                      <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        {event.event_date && (
                          <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                        )}
                        {event.location && <span>📍 {event.location}</span>}
                      </div>
                    </div>
                    {event.event_type && (
                      <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No events linked yet', ar: 'لا توجد فعاليات مرتبطة' })}</p>
            </div>
          )}

          {/* Show milestones from treatment plan */}
          {challenge.treatment_plan?.milestones?.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Treatment Milestones', ar: 'معالم المعالجة' })}</p>
              <div className="space-y-2">
                {challenge.treatment_plan.milestones.map((milestone, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white border rounded">
                    <div className="flex items-center gap-3">
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : milestone.status === 'in_progress' ? (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : (
                        <Clock className="h-5 w-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">{milestone.name}</p>
                        {milestone.due_date && (
                          <p className="text-xs text-slate-500">Due: {milestone.due_date}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={
                      milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                        milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                    }>
                      {milestone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent >

    {/* Policy Tab */ }
    < TabsContent value = "policy" className = "space-y-6" >
          <div className="flex justify-end mb-4">
            <Link to={createPageUrl(`PolicyCreate?challenge_id=${challengeId}&entity_type=challenge`)}>
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
                <Sparkles className="h-4 w-4" />
                {t({ en: 'Generate Policy Recommendation', ar: 'إنشاء توصية سياسية' })}
              </Button>
            </Link>
          </div>
          <PolicyRecommendationManager
            challengeId={challengeId}
            policies={policyRecommendations}
            challenge={challenge}
          />
        </TabsContent >

    {/* Experts Tab */ }
    < TabsContent value = "experts" className = "space-y-6" >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              {t({ en: 'Expert Evaluations', ar: 'تقييمات الخبراء' })}
            </CardTitle>
            <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=challenge&entity_id=${challengeId}`)} target="_blank">
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
                      <div className="text-sm font-bold text-amber-600">{evaluation.innovation_score}</div>
                      <div className="text-xs text-slate-600">{t({ en: 'Innovation', ar: 'الابتكار' })}</div>
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
              <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=challenge&entity_id=${challengeId}`)} target="_blank">
                <Button className="bg-purple-600">
                  <Users className="h-4 w-4 mr-2" />
                  {t({ en: 'Assign Experts Now', ar: 'تعيين خبراء الآن' })}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent >

    {/* Collaboration Tab */ }
    < TabsContent value = "collaboration" className = "space-y-6" >
          <CollaborativeEditing entityId={challengeId} entityType="Challenge" />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {t({ en: 'Team Workspace', ar: 'مساحة عمل الفريق' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Challenge Owner */}
                {challenge.challenge_owner && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {challenge.challenge_owner.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{challenge.challenge_owner}</p>
                        <p className="text-xs text-slate-600">{t({ en: 'Challenge Owner', ar: 'مالك التحدي' })}</p>
                        {challenge.challenge_owner_email && (
                          <p className="text-xs text-blue-600">{challenge.challenge_owner_email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviewer */}
                {challenge.reviewer && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold">
                        {challenge.reviewer.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{challenge.reviewer}</p>
                        <p className="text-xs text-slate-600">{t({ en: 'Assigned Reviewer', ar: 'المراجع المعين' })}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stakeholders */}
                {stakeholders?.length > 0 && (
                  <div>
                    <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Key Stakeholders', ar: 'أصحاب المصلحة الرئيسيون' })}</p>
                    <div className="space-y-2">
                      {stakeholders.map((stakeholder, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                            {stakeholder.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-slate-900">{stakeholder.name}</p>
                            <p className="text-xs text-slate-600">{stakeholder.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Activity Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t">
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">{comments.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Comments', ar: 'تعليقات' })}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <p className="text-2xl font-bold text-purple-600">{expertEvaluations.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Evaluations', ar: 'تقييمات' })}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded">
                    <p className="text-2xl font-bold text-green-600">{activities.length}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Activities', ar: 'نشاطات' })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent >

    {/* Dependencies Tab */ }
    < TabsContent value = "dependencies" className = "space-y-6" >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-teal-600" />
              {t({ en: 'Dependency Network', ar: 'شبكة التبعيات' })}
            </CardTitle>
            <Button onClick={() => setRelationManagerOpen(true)} className="gap-2">
              <Network className="h-4 w-4" />
              {t({ en: 'Manage Relations', ar: 'إدارة العلاقات' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {relations.length > 0 ? (
            <div className="space-y-4">
              {/* Mind Map Visualization */}
              <div className="relative p-8 bg-white rounded-xl border-2 border-slate-200 overflow-x-auto">
                <svg width="100%" height="500" className="min-w-[800px]">
                  {/* Define gradients */}
                  <defs>
                    <linearGradient id="grad-pilot" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="grad-solution" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="grad-rd" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="grad-program" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="grad-challenge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="grad-center" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#dc2626', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>

                  {/* Center node */}
                  <g transform="translate(400, 250)">
                    {/* Pulse circle */}
                    <circle cx="0" cy="0" r="50" fill="url(#grad-center)" opacity="0.1">
                      <animate attributeName="r" from="50" to="70" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.1" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>

                    {/* Main center circle */}
                    <circle cx="0" cy="0" r="45" fill="url(#grad-center)" stroke="white" strokeWidth="4" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))" />

                    {/* Center icon */}
                    <foreignObject x="-20" y="-20" width="40" height="40">
                      <div className="flex items-center justify-center w-full h-full">
                        <AlertCircle className="h-8 w-8 text-white" />
                      </div>
                    </foreignObject>

                    {/* Center label */}
                    <text x="0" y="65" textAnchor="middle" fill="#1e293b" fontSize="12" fontWeight="700">
                      {challenge.code}
                    </text>
                  </g>

                  {/* Branch nodes */}
                  {relations.slice(0, 12).map((rel, i) => {
                    const colors = {
                      pilot: 'url(#grad-pilot)',
                      solution: 'url(#grad-solution)',
                      rd_project: 'url(#grad-rd)',
                      program: 'url(#grad-program)',
                      challenge: 'url(#grad-challenge)'
                    };
                    const fill = colors[rel.related_entity_type] || '#64748b';

                    const getEntityName = () => {
                      if (rel.related_entity_type === 'challenge') {
                        const c = allChallenges.find(ch => ch.id === rel.related_entity_id);
                        return c?.code || 'Challenge';
                      }
                      if (rel.related_entity_type === 'solution') {
                        const s = solutions.find(s => s.id === rel.related_entity_id);
                        return s?.code || 'Solution';
                      }
                      if (rel.related_entity_type === 'pilot') {
                        const p = pilots.find(p => p.id === rel.related_entity_id);
                        return p?.code || 'Pilot';
                      }
                      return rel.related_entity_type;
                    };

                    // Mind map layout - spread around center
                    const angle = (i * 360) / Math.min(relations.length, 12);
                    const radius = 150;
                    const centerX = 400;
                    const centerY = 250;
                    const x = centerX + Math.cos((angle - 90) * Math.PI / 180) * radius;
                    const y = centerY + Math.sin((angle - 90) * Math.PI / 180) * radius;

                    return (
                      <g key={rel.id || i}>
                        {/* Curved connection line */}
                        <path
                          d={`M ${centerX} ${centerY} Q ${(centerX + x) / 2} ${(centerY + y) / 2 - 30} ${x} ${y}`}
                          fill="none"
                          stroke="#cbd5e1"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.6"
                        />

                        {/* Branch node circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r="30"
                          fill={fill}
                          stroke="white"
                          strokeWidth="3"
                          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                          className="hover:r-35 transition-all cursor-pointer"
                        />

                        {/* Strength badge */}
                        {rel.strength && (
                          <>
                            <circle
                              cx={x + 20}
                              cy={y - 20}
                              r="12"
                              fill="#0d9488"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <text
                              x={x + 20}
                              y={y - 16}
                              textAnchor="middle"
                              fill="white"
                              fontSize="10"
                              fontWeight="700"
                            >
                              {Math.round(typeof rel.strength === 'number' ? rel.strength : rel.strength * 100)}
                            </text>
                          </>
                        )}

                        {/* Label */}
                        <text
                          x={x}
                          y={y + 50}
                          textAnchor="middle"
                          fill="#1e293b"
                          fontSize="11"
                          fontWeight="600"
                          className="max-w-[100px]"
                        >
                          {getEntityName().substring(0, 15)}
                        </text>

                        {/* Relation role */}
                        <text
                          x={x}
                          y={y + 65}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="9"
                        >
                          {rel.relation_role?.replace(/_/g, ' ')}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend */}
                <div className="flex gap-4 flex-wrap justify-center mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                    <span className="text-xs text-slate-700 font-medium">Pilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500"></div>
                    <span className="text-xs text-slate-700 font-medium">Solution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500"></div>
                    <span className="text-xs text-slate-700 font-medium">R&D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600"></div>
                    <span className="text-xs text-slate-700 font-medium">Program</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-red-400 to-orange-400"></div>
                    <span className="text-xs text-slate-700 font-medium">Challenge</span>
                  </div>
                </div>
              </div>

              {/* Relation details list */}
              <div className="space-y-3">
                {relations.map((rel) => (
                  <div key={rel.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs capitalize">{rel.related_entity_type?.replace(/_/g, ' ')}</Badge>
                          <Badge className="text-xs capitalize bg-blue-100 text-blue-700">{rel.relation_role?.replace(/_/g, ' ')}</Badge>
                          {rel.created_via === 'ai' && (
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium text-slate-900">
                          {rel.related_entity_type === 'challenge' && allChallenges.find(c => c.id === rel.related_entity_id)?.title_en}
                          {rel.related_entity_type === 'solution' && solutions.find(s => s.id === rel.related_entity_id)?.name_en}
                          {rel.related_entity_type === 'pilot' && pilots.find(p => p.id === rel.related_entity_id)?.title_en}
                          {rel.related_entity_type === 'rd_project' && relatedRD.find(r => r.id === rel.related_entity_id)?.title_en}
                          {rel.related_entity_type === 'program' && linkedPrograms.find(p => p.id === rel.related_entity_id)?.name_en}
                        </p>
                        {rel.notes && (
                          <p className="text-xs text-slate-600 mt-2">{rel.notes}</p>
                        )}
                      </div>
                      {rel.strength && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-teal-600">{Math.round(typeof rel.strength === 'number' ? rel.strength : rel.strength * 100)}%</div>
                          <div className="text-xs text-slate-500">{t({ en: 'Strength', ar: 'قوة' })}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connection summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Total Connections', ar: 'إجمالي الاتصالات' })}</p>
                  <p className="text-2xl font-bold text-blue-600">{relations.length}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'AI-Detected', ar: 'مكتشف بالذكاء' })}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {relations.filter(r => r.created_via === 'ai').length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Network className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No dependencies mapped yet', ar: 'لا توجد تبعيات مرسومة بعد' })}</p>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent >

    {/* Scaling Tab */ }
    < TabsContent value = "scaling" className = "space-y-6" >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Scaling Readiness Assessment', ar: 'تقييم جاهزية التوسع' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pilots.filter(p => p.stage === 'completed' || p.recommendation === 'scale').length > 0 ? (
            <div className="space-y-4">
              {pilots.filter(p => p.stage === 'completed' || p.recommendation === 'scale').map((pilot) => (
                <div key={pilot.id} className="p-4 border-2 border-green-300 rounded-lg bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{pilot.title_en}</p>
                      <p className="text-xs text-slate-600 mt-1">{pilot.municipality_id}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">Ready to Scale</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-lg font-bold text-green-600">{pilot.success_probability || 85}%</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-lg font-bold text-blue-600">{pilot.trl_current || 7}</p>
                      <p className="text-xs text-slate-600">TRL</p>
                    </div>
                    <div className="text-center p-2 bg-white rounded">
                      <p className="text-lg font-bold text-purple-600">{pilot.deployment_count || 1}</p>
                      <p className="text-xs text-slate-600">{t({ en: 'Deployments', ar: 'النشر' })}</p>
                    </div>
                  </div>
                  <Link to={createPageUrl(`ScalingWorkflow?pilot_id=${pilot.id}`)}>
                    <Button className="w-full mt-3 bg-gradient-to-r from-green-600 to-teal-600">
                      {t({ en: 'Start Scaling Process', ar: 'بدء عملية التوسع' })}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No pilots ready for scaling yet', ar: 'لا توجد تجارب جاهزة للتوسع بعد' })}</p>
              <p className="text-xs text-slate-400 mt-2">{t({ en: 'Pilots must be completed and evaluated first', ar: 'يجب إكمال وتقييم التجارب أولاً' })}</p>
            </div>
          )}
        </CardContent>
      </Card>

  {
    challenge.status === 'resolved' && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            {t({ en: 'National Rollout Preview', ar: 'معاينة النشر الوطني' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-slate-700 mb-4">
              {t({ en: 'Based on successful resolution, this challenge solution could be scaled to:', ar: 'بناءً على الحل الناجح، يمكن توسيع هذا الحل إلى:' })}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border">
                <p className="text-2xl font-bold text-purple-600">15</p>
                <p className="text-xs text-slate-600">{t({ en: 'Similar municipalities', ar: 'بلديات مشابهة' })}</p>
              </div>
              <div className="p-3 bg-white rounded border">
                <p className="text-2xl font-bold text-blue-600">2.3M</p>
                <p className="text-xs text-slate-600">{t({ en: 'Potential beneficiaries', ar: 'مستفيدين محتملين' })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
        </TabsContent >

    {/* External Tab */ }
    < TabsContent value = "external" className = "space-y-6" >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            {t({ en: 'External Intelligence', ar: 'الذكاء الخارجي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              {t({ en: '🌍 International Best Practices', ar: '🌍 أفضل الممارسات الدولية' })}
            </p>
            <p className="text-xs text-slate-600">
              {t({
                en: 'AI-curated insights from similar challenges in other countries',
                ar: 'رؤى منسقة بالذكاء من تحديات مشابهة في دول أخرى'
              })}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-semibold text-green-900 mb-2">
              {t({ en: '📰 Related News & Publications', ar: '📰 الأخبار والمنشورات ذات الصلة' })}
            </p>
            <p className="text-xs text-slate-600">
              {t({
                en: 'External news articles and research papers related to this challenge',
                ar: 'مقالات إخبارية خارجية وأوراق بحثية تتعلق بهذا التحدي'
              })}
            </p>
          </div>

          {externalIntelligence?.best_practices && externalIntelligence.best_practices.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'International Case Studies', ar: 'دراسات الحالة الدولية' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {externalIntelligence.best_practices.map((bp, i) => (
                    <div key={i} className="p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{bp.city}, {bp.country}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">{bp.approach}</p>
                      <p className="text-xs text-green-700">✓ {bp.outcome}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {externalIntelligence?.publications && externalIntelligence.publications.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Recent Publications', ar: 'المنشورات الحديثة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {externalIntelligence.publications.map((pub, i) => (
                    <div key={i} className="p-3 bg-white border rounded-lg">
                      <p className="text-sm font-medium text-slate-900">{pub.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{pub.source}</p>
                      <p className="text-xs text-slate-700 mt-2">{pub.key_takeaway}</p>
                      {pub.url && (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                          Read more →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {externalIntelligence?.benchmarks && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mt-4">
              <p className="text-sm font-semibold text-purple-900 mb-2">
                {t({ en: '📊 Global Benchmarks', ar: '📊 المعايير العالمية' })}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-lg font-bold text-purple-600">{externalIntelligence.benchmarks.success_rate || 'N/A'}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Success rate', ar: 'معدل النجاح' })}</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-lg font-bold text-blue-600">{externalIntelligence.benchmarks.budget_range || 'N/A'}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Budget range', ar: 'نطاق الميزانية' })}</p>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <p className="text-lg font-bold text-green-600">{externalIntelligence.benchmarks.timeline || 'N/A'}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                {t({ en: 'AI-researched from global sources', ar: 'بحث بالذكاء من مصادر عالمية' })}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              try {
                const query = `${challenge.title_en} ${challenge.sector} municipal urban innovation best practices case studies`;
                toast.success(t({ en: 'Fetching global intelligence...', ar: 'جاري جلب الذكاء العالمي...' }));

                const result = await invokeAI({
                  prompt: `Research and provide real-world insights for this municipal challenge:
                          
Challenge: ${challenge.title_en}
Sector: ${challenge.sector}
Description: ${challenge.description_en?.substring(0, 300)}

Find and summarize:
1. 3-5 international best practices from similar challenges (city, country, approach, outcome)
2. 3-5 recent news articles or publications (title, source, key takeaway, URL if possible)
3. Real benchmark data (success rate %, typical budget range, typical timeline)

Provide specific, actionable intelligence.`,
                  response_json_schema: {
                    type: 'object',
                    properties: {
                      best_practices: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            city: { type: 'string' },
                            country: { type: 'string' },
                            approach: { type: 'string' },
                            outcome: { type: 'string' }
                          }
                        }
                      },
                      publications: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string' },
                            source: { type: 'string' },
                            key_takeaway: { type: 'string' },
                            url: { type: 'string' }
                          }
                        }
                      },
                      benchmarks: {
                        type: 'object',
                        properties: {
                          success_rate: { type: 'string' },
                          budget_range: { type: 'string' },
                          timeline: { type: 'string' }
                        }
                      }
                    }
                  }
                });

                if (result.success) {
                  setExternalIntelligence(result.data);
                  toast.success(t({ en: 'Global insights loaded', ar: 'تم تحميل الرؤى العالمية' }));
                } else {
                  toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
                }
              } catch (error) {
                toast.error(t({ en: 'Search failed', ar: 'فشل البحث' }));
              }
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI: Find Global Insights', ar: 'ذكاء: البحث عن رؤى عالمية' })}
          </Button>
        </CardContent>
      </Card>
        </TabsContent >

    {/* Activity Tab */ }
    < TabsContent value = "activity" >
      <ChallengeActivityTab challengeId={challengeId} comments={comments} comment={comment} setComment={setComment} commentMutation={commentMutation} />
    </TabsContent >

      </Tabs >
    </div >

    {/* Right Sidebar - Quick Info Panel */ }
    < ChallengeSidebar challenge = { challenge } citizenIdea = { citizenIdea } />
  </div >

    {/* Relation Manager Modal */ }
    < RelationManager
  entityType = "Challenge"
  entityId = { challengeId }
  open = { relationManagerOpen }
  onClose = {() => setRelationManagerOpen(false)
}
  />
    </PageLayout >
  );
}

export default ProtectedPage(ChallengeDetail, {
  requiredPermissions: ['challenge_view', 'challenge_view_all', 'challenge_view_own']
});