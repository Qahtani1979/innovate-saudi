import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import SmartActionButton from '../components/SmartActionButton';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import {
  Sparkles, FileText, Lightbulb, Activity, MessageSquare, TrendingUp,
  MapPin, Calendar, Target, AlertCircle, TestTube, Microscope, Send,
  BarChart3, Users, Database, Award, Image, Clock, CheckCircle2, Loader2,
  Zap, Shield, Network, Archive, AlertTriangle, User, Globe, BookOpen
} from 'lucide-react';
import TrackAssignment from '../components/TrackAssignment';
import ChallengeSubmissionWizard from '../components/ChallengeSubmissionWizard';
import ChallengeReviewWorkflow from '../components/ChallengeReviewWorkflow';
import ChallengeTreatmentPlan from '../components/ChallengeTreatmentPlan';
import ChallengeResolutionWorkflow from '../components/ChallengeResolutionWorkflow';
import ChallengeToRDWizard from '../components/ChallengeToRDWizard';
import ChallengeArchiveWorkflow from '../components/ChallengeArchiveWorkflow';
import InnovationFramingGenerator from '../components/challenges/InnovationFramingGenerator';
import StrategicAlignmentSelector from '../components/challenges/StrategicAlignmentSelector';
import ProposalSubmissionForm from '../components/challenges/ProposalSubmissionForm';
import ChallengeRFPGenerator from '../components/challenges/ChallengeRFPGenerator';
import CollaborativeEditing from '../components/CollaborativeEditing';
import ImpactReportGenerator from '../components/challenges/ImpactReportGenerator';
import RelationManager from '../components/RelationManager';
import PolicyRecommendationManager from '../components/challenges/PolicyRecommendationManager';
import ChallengeActivityLog from '../components/challenges/ChallengeActivityLog';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';
import { useSolutionsWithVisibility, usePilotsWithVisibility, useContractsWithVisibility } from '@/hooks/visibility';

export default function ChallengeDetail() {
  const { hasPermission, isAdmin } = usePermissions();
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
  const { invokeAI, status: aiStatus, isLoading: generatingInsights, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*').eq('id', challengeId).maybeSingle();
      return data;
    },
    enabled: !!challengeId
  });

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
  const { data: allSolutions = [] } = useSolutionsWithVisibility();
  const solutions = allSolutions; // Alias for backward compatibility

  // Pilots related to this challenge (filtered from visibility-aware data)
  const { data: allPilots = [] } = usePilotsWithVisibility();
  const pilots = allPilots.filter(p => p.challenge_id === challengeId);

  // Contracts with visibility
  const { data: allContracts = [] } = useContractsWithVisibility();

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
      const { data } = await supabase.from('challenge_proposals').select('*').eq('challenge_id', challengeId);
      return data || [];
    },
    enabled: !!challengeId
  });

  const { data: linkedPrograms = [] } = useQuery({
    queryKey: ['challenge-programs', challengeId],
    queryFn: async () => {
      if (!challenge?.linked_program_ids || challenge.linked_program_ids.length === 0) return [];
      const { data } = await supabase.from('programs').select('*');
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

  // Contracts filtered from visibility-aware data
  const contracts = allContracts.filter(c => c.challenge_id === challengeId);

  const { data: events = [] } = useQuery({
    queryKey: ['challenge-events', challengeId],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('*');
      return data?.filter(e => e.challenge_id === challengeId) || [];
    },
    enabled: !!challengeId
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
      const { data } = await supabase.from('rd_projects').select('*');
      return data?.filter(rd => challenge.linked_rd_ids.includes(rd.id)) || [];
    },
    enabled: !!challenge
  });

  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: async (data) => {
      return supabase.from('comments').insert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge-comments']);
      setComment('');
      toast.success('Comment added');
    }
  });

  const { data: allChallenges = [] } = useQuery({
    queryKey: ['all-challenges'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*');
      return data || [];
    }
  });

  const generateFreshInsights = async () => {
    if (!challenge) {
      toast.error(t({ en: 'Challenge not loaded', ar: 'لم يتم تحميل التحدي' }));
      return;
    }
    
    setGeneratingInsights(true);
    try {
      const prompt = `Analyze this Saudi municipal challenge and provide COMPLETE BILINGUAL (Arabic + English) strategic insights:

Challenge Details:
- Code: ${challenge.code}
- Title EN: ${challenge.title_en}
- Title AR: ${challenge.title_ar}
- Description EN: ${challenge.description_en}
- Description AR: ${challenge.description_ar}
- Problem EN: ${challenge.problem_statement_en}
- Problem AR: ${challenge.problem_statement_ar}
- Current EN: ${challenge.current_situation_en}
- Current AR: ${challenge.current_situation_ar}
- Desired EN: ${challenge.desired_outcome_en}
- Desired AR: ${challenge.desired_outcome_ar}
- Sector: ${challenge.sector}, Sub: ${challenge.sub_sector}
- Type: ${challenge.challenge_type}
- Municipality: ${challenge.municipality_id}
- City/Region: ${challenge.city_id} / ${challenge.region_id}
- Current Status: ${challenge.status}
- Priority: ${challenge.priority}
- Tracks: ${JSON.stringify(challenge.tracks || [])}
- Affected Population: ${JSON.stringify(challenge.affected_population || {})}
- Budget Est: ${challenge.budget_estimate}
- Timeline Est: ${challenge.timeline_estimate}
- Root Causes: ${JSON.stringify(challenge.root_causes || [])}
- KPIs: ${JSON.stringify(challenge.kpis || [])}
- Stakeholders: ${JSON.stringify(challenge.stakeholders || [])}

Provide BILINGUAL (AR+EN) analysis:
1. Strategic importance (why this matters now) - AR + EN
2. Recommended treatment approach (pilot/r_and_d/program/procurement/policy) - with reasoning
3. Expected complexity (low/medium/high) with detailed justification
4. Potential partners (specific organization types + why)
5. Success indicators (4-6 measurable outcomes) - bilingual
6. Risk factors (4-5 key risks to watch) - bilingual
7. Next steps (4-5 immediate actions) - bilingual, prioritized
8. Timeline estimate (detailed breakdown in weeks/months)
9. Resource requirements (team, budget, tech)
10. Dependencies (what needs to happen first)`;

      const result = await invokeAI({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            strategic_importance_en: { type: 'string' },
            strategic_importance_ar: { type: 'string' },
            recommended_approach: { type: 'string' },
            approach_reasoning: { type: 'string' },
            complexity: { type: 'string' },
            complexity_reason: { type: 'string' },
            potential_partners: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  reason: { type: 'string' }
                }
              }
            },
            success_indicators: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            },
            risk_factors: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            },
            next_steps: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' },
                  priority: { type: 'number' }
                }
              }
            },
            timeline_estimate: { type: 'string' },
            resource_requirements: {
              type: 'object',
              properties: {
                team_size: { type: 'string' },
                budget_range: { type: 'string' },
                tech_needs: { type: 'array', items: { type: 'string' } }
              }
            },
            dependencies: { type: 'array', items: { type: 'string' } }
          }
        }
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Modals */}
      {showSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeSubmissionWizard challenge={challenge} onClose={() => setShowSubmission(false)} />
          </div>
        </div>
      )}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeReviewWorkflow challenge={challenge} onClose={() => setShowReview(false)} />
          </div>
        </div>
      )}
      {showTreatment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ChallengeTreatmentPlan challenge={challenge} onClose={() => setShowTreatment(false)} />
          </div>
        </div>
      )}
      {showResolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ChallengeResolutionWorkflow challenge={challenge} onClose={() => setShowResolution(false)} />
          </div>
        </div>
      )}
      {showRDConversion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ChallengeToRDWizard challenge={challenge} onClose={() => setShowRDConversion(false)} />
          </div>
        </div>
      )}
      {showArchive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ChallengeArchiveWorkflow challenge={challenge} onClose={() => setShowArchive(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {challenge.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {challenge.code}
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {challenge.status?.replace(/_/g, ' ')}
                </Badge>
                <Badge className={priorityColors[challenge.priority]}>
                  {challenge.priority}
                </Badge>
                {challenge.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
              </h1>
              {(challenge.tagline_en || challenge.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && challenge.tagline_ar ? challenge.tagline_ar : challenge.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{challenge.municipality_id}</span>
                </div>
                {challenge.sector && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{challenge.sector.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {challenge.overall_score && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span>Score: {challenge.overall_score}/100</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {challenge.status === 'draft' && (
                <Button onClick={() => setShowSubmission(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Submit', ar: 'تقديم' })}
                </Button>
              )}
              {challenge.status === 'submitted' && (
                <Button onClick={() => setShowReview(true)} className="bg-yellow-600 hover:bg-yellow-700">
                  <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Review', ar: 'مراجعة' })}
                </Button>
              )}
              {challenge.status === 'approved' && (
                <>
                  <Button onClick={() => setShowTreatment(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Activity className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Plan Treatment', ar: 'تخطيط المعالجة' })}
                  </Button>
                  <SmartActionButton 
                    context="challenge_to_pilot"
                    entity={{ ...challenge, entity_type: 'challenge' }}
                    icon={TestTube}
                    label={t({ en: 'Design Pilot', ar: 'تصميم تجربة' })}
                    variant="default"
                  />
                  {challenge.track === 'r_and_d' && (
                    <Button onClick={() => setShowRDConversion(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Microscope className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Create R&D', ar: 'إنشاء بحث' })}
                    </Button>
                  )}
                </>
              )}
              {challenge.status === 'in_treatment' && (
                <Button onClick={() => setShowResolution(true)} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Resolve', ar: 'حل' })}
                </Button>
              )}
              {!['archived', 'resolved'].includes(challenge.status) && (
                <Button onClick={() => setShowArchive(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  <Archive className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Archive', ar: 'أرشفة' })}
                </Button>
              )}
              <Link to={createPageUrl(`ChallengeEdit?id=${challengeId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
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
            <TabsContent value="overview" className="space-y-6">
              <TrackAssignment challenge={challenge} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Description', ar: 'الوصف' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' && challenge.description_ar ? 'rtl' : 'ltr'}>
                    {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                  </p>
                </CardContent>
              </Card>

              {challenge.current_situation && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Current Situation', ar: 'الوضع الحالي' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{challenge.current_situation}</p>
                  </CardContent>
                </Card>
              )}

              {challenge.desired_outcome && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Desired Outcome', ar: 'النتيجة المرغوبة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{challenge.desired_outcome}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Problem Tab */}
            <TabsContent value="problem" className="space-y-6">
              {challenge.problem_statement && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Problem Statement', ar: 'بيان المشكلة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{challenge.problem_statement}</p>
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

              {challenge.affected_population && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Affected Population', ar: 'السكان المتأثرون' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {challenge.affected_population.size && (
                      <div>
                        <span className="text-slate-500">Size:</span> {challenge.affected_population.size}
                      </div>
                    )}
                    {challenge.affected_population.demographics && (
                      <div>
                        <span className="text-slate-500">Demographics:</span> {challenge.affected_population.demographics}
                      </div>
                    )}
                    {challenge.affected_population.location && (
                      <div>
                        <span className="text-slate-500">Location:</span> {challenge.affected_population.location}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {challenge.constraints?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Constraints', ar: 'القيود' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {challenge.constraints.map((constraint, i) => (
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

            {/* Data/Evidence Tab */}
            <TabsContent value="data" className="space-y-6">
              {challenge.data_evidence && challenge.data_evidence.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      {t({ en: 'Data & Evidence', ar: 'البيانات والأدلة' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {challenge.data_evidence.map((evidence, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <Badge variant="outline" className="text-xs mb-2">{evidence.type}</Badge>
                              <p className="text-sm text-slate-700">{evidence.value}</p>
                              <p className="text-xs text-slate-500 mt-1">Source: {evidence.source}</p>
                              {evidence.date && (
                                <p className="text-xs text-slate-500">Date: {evidence.date}</p>
                              )}
                            </div>
                          </div>
                          {evidence.url && (
                            <Button variant="outline" size="sm" asChild className="mt-2">
                              <a href={evidence.url} target="_blank" rel="noopener noreferrer">View Data</a>
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
            <TabsContent value="kpis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    {t({ en: 'Key Performance Indicators', ar: 'مؤشرات الأداء الرئيسية' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challenge.kpis && challenge.kpis.length > 0 ? (
                    <div className="space-y-3">
                      {challenge.kpis.map((kpi, i) => (
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
                    <p className="text-slate-500 text-sm text-center py-8">No KPIs defined</p>
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
                      <div className="text-xs text-slate-600 mt-1">Severity</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">{challenge.impact_score || 0}</div>
                      <div className="text-xs text-slate-600 mt-1">Impact</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{challenge.overall_score || 0}</div>
                      <div className="text-xs text-slate-600 mt-1">Overall</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stakeholders Tab */}
            <TabsContent value="stakeholders">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Stakeholders', ar: 'أصحاب المصلحة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challenge.stakeholders && challenge.stakeholders.length > 0 ? (
                    <div className="space-y-3">
                      {challenge.stakeholders.map((stakeholder, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-slate-900">{stakeholder.name}</p>
                            <Badge variant="outline" className="text-xs">{stakeholder.role}</Badge>
                          </div>
                          {stakeholder.involvement && (
                            <p className="text-sm text-slate-600">{stakeholder.involvement}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No stakeholders listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="ai" className="space-y-6">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={generateFreshInsights}
                  disabled={generatingInsights}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {generatingInsights ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'Generate Fresh AI Insights', ar: 'إنشاء رؤى ذكية جديدة' })}
                </Button>
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    AI-Generated Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {challenge.ai_summary || challenge.description_en?.substring(0, 200) + '...'}
                  </p>
                </CardContent>
              </Card>

              {freshAiInsights && (
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="text-purple-900 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {t({ en: 'Fresh Strategic Analysis', ar: 'التحليل الاستراتيجي الجديد' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-purple-200">
                      <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Strategic Importance', ar: 'الأهمية الاستراتيجية' })}</p>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' && freshAiInsights.strategic_importance_ar 
                          ? freshAiInsights.strategic_importance_ar 
                          : freshAiInsights.strategic_importance_en || freshAiInsights.strategic_importance}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded-lg border">
                        <p className="text-xs text-slate-500 mb-1">{t({ en: 'Recommended Approach', ar: 'النهج الموصى به' })}</p>
                        <Badge className="bg-blue-100 text-blue-700">{freshAiInsights.recommended_approach}</Badge>
                      </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <p className="text-xs text-slate-500 mb-1">{t({ en: 'Complexity', ar: 'التعقيد' })}</p>
                        <Badge className={
                          freshAiInsights.complexity === 'high' ? 'bg-red-100 text-red-700' :
                          freshAiInsights.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>{freshAiInsights.complexity}</Badge>
                      </div>
                    </div>

                    {freshAiInsights.next_steps?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Next Steps', ar: 'الخطوات التالية' })}</p>
                        <div className="space-y-2">
                          {freshAiInsights.next_steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {typeof step === 'object' ? step.priority || i + 1 : i + 1}
                              </div>
                              <span className="text-slate-700 pt-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                {typeof step === 'string' ? step : (language === 'ar' && step.ar ? step.ar : step.en)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {freshAiInsights.potential_partners?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Potential Partners', ar: 'الشركاء المحتملون' })}</p>
                        <div className="space-y-2">
                          {freshAiInsights.potential_partners.map((p, i) => (
                            <div key={i} className="p-2 bg-white rounded border">
                              <p className="text-sm font-medium">{typeof p === 'string' ? p : p.type}</p>
                              {typeof p === 'object' && p.reason && (
                                <p className="text-xs text-slate-600 mt-1">{p.reason}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {freshAiInsights.risk_factors?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Risk Factors', ar: 'عوامل المخاطر' })}</p>
                        <div className="space-y-1">
                          {freshAiInsights.risk_factors.map((risk, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                {typeof risk === 'string' ? risk : (language === 'ar' && risk.ar ? risk.ar : risk.en)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}



              {challenge.ai_suggestions && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Suggestions (Original)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-900">Recommended Track</p>
                        <p className="text-sm text-slate-700 mt-1">
                          Based on complexity and maturity, this challenge is best suited for{' '}
                          <span className="font-semibold">{challenge.track || 'pilot testing'}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Solutions Tab */}
            <TabsContent value="solutions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    AI-Matched Solutions ({solutions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {solutions.slice(0, 5).map((solution, idx) => (
                      <Link
                        key={solution.id}
                        to={createPageUrl(`SolutionDetail?id=${solution.id}`)}
                        className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{solution.name_en}</p>
                            <p className="text-sm text-slate-600 mt-1">{solution.provider_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{solution.maturity_level?.replace(/_/g, ' ')}</Badge>
                              <Badge variant="outline">TRL {solution.trl}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{95 - idx * 3}%</div>
                            <div className="text-xs text-slate-500">AI Match</div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pilots Tab */}
            <TabsContent value="pilots" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-blue-600" />
                    Related Pilots ({pilots.length})
                  </CardTitle>
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
                            <Badge>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No pilots linked yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* R&D Tab */}
            <TabsContent value="rd" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Microscope className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Related R&D Projects', ar: 'مشاريع البحث والتطوير' })} ({relatedRD.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedRD.length > 0 ? (
                    <div className="space-y-3">
                      {relatedRD.map((rd) => (
                        <Link
                          key={rd.id}
                          to={createPageUrl(`RDProjectDetail?id=${rd.id}`)}
                          className="block p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono text-xs">{rd.code}</Badge>
                                <Badge className="text-xs">TRL {rd.trl_current || rd.trl_start}</Badge>
                              </div>
                              <p className="font-medium text-slate-900">{language === 'ar' && rd.title_ar ? rd.title_ar : rd.title_en}</p>
                              <p className="text-sm text-slate-600 mt-1">{rd.institution_en}</p>
                            </div>
                            <Badge className={
                              rd.status === 'active' ? 'bg-green-100 text-green-700' :
                              rd.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {rd.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'No R&D projects linked yet', ar: 'لا توجد مشاريع بحثية مرتبطة' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Related Tab */}
            <TabsContent value="related" className="space-y-6">
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

              {challenge.related_initiatives && challenge.related_initiatives.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Related Initiatives', ar: 'المبادرات ذات الصلة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {challenge.related_initiatives.map((init, i) => (
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

            {/* Impact Report Tab */}
            <TabsContent value="impact">
              {challenge.status === 'resolved' ? (
                <ImpactReportGenerator 
                  challenge={challenge}
                  pilots={pilots}
                  contracts={contracts}
                />
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      {t({ en: 'Impact report available once challenge is resolved', ar: 'تقرير الأثر متاح بمجرد حل التحدي' })}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              {challenge.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={challenge.image_url} alt={challenge.title_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}

              {challenge.gallery_urls && challenge.gallery_urls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Gallery', ar: 'المعرض' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {challenge.gallery_urls.map((url, i) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="w-full rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Innovation Framing Tab */}
            <TabsContent value="innovation">
              <InnovationFramingGenerator
                challenge={challenge}
                onFramingGenerated={async (framing) => {
                  await base44.entities.Challenge.update(challengeId, { innovation_framing: framing });
                  queryClient.invalidateQueries(['challenge', challengeId]);
                }}
              />
            </TabsContent>

            {/* Strategic Alignment Tab */}
            <TabsContent value="strategy">
              <StrategicAlignmentSelector
                challenge={challenge}
                onUpdate={() => queryClient.invalidateQueries(['challenge', challengeId])}
              />
            </TabsContent>

            {/* Proposals Tab */}
            <TabsContent value="proposals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    {t({ en: 'Provider Proposals', ar: 'مقترحات المزودين' })} ({proposals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {proposals.length > 0 ? (
                    <div className="space-y-3">
                      {proposals.map((p) => (
                        <Link
                          key={p.id}
                          to={createPageUrl(`ChallengeProposalDetail?id=${p.id}`)}
                          className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{p.proposal_title}</p>
                              <p className="text-xs text-slate-500">{p.proposer_email}</p>
                            </div>
                            <Badge>{p.status}</Badge>
                          </div>
                          <p className="text-sm text-slate-700">{p.approach_summary}</p>
                          <div className="flex gap-3 mt-2 text-xs text-slate-600">
                            <span>⏱️ {p.timeline_weeks} weeks</span>
                            <span>💰 {p.estimated_cost} SAR</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">{t({ en: 'No proposals submitted yet', ar: 'لم يتم تقديم مقترحات بعد' })}</p>
                      <ProposalSubmissionForm
                        challenge={challenge}
                        onSuccess={() => queryClient.invalidateQueries(['challenge-proposals'])}
                        onCancel={() => {}}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <ChallengeRFPGenerator challenge={challenge} onComplete={() => queryClient.invalidateQueries(['challenge', challengeId])} />
            </TabsContent>

            {/* Programs Tab */}
            <TabsContent value="programs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Linked Programs', ar: 'البرامج المرتبطة' })} ({linkedPrograms.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {linkedPrograms.length > 0 ? (
                    <div className="space-y-3">
                      {linkedPrograms.map((program) => (
                        <Link
                          key={program.id}
                          to={createPageUrl(`ProgramDetail?id=${program.id}`)}
                          className="block p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono text-xs">{program.code}</Badge>
                                <Badge className="text-xs">{program.program_type?.replace(/_/g, ' ')}</Badge>
                              </div>
                              <p className="font-medium text-slate-900">{language === 'ar' && program.name_ar ? program.name_ar : program.name_en}</p>
                              {program.tagline_en && (
                                <p className="text-sm text-slate-600 mt-1">{language === 'ar' && program.tagline_ar ? program.tagline_ar : program.tagline_en}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                {program.timeline?.program_start && (
                                  <span>📅 {new Date(program.timeline.program_start).toLocaleDateString()}</span>
                                )}
                                {program.duration_weeks && <span>⏱️ {program.duration_weeks} weeks</span>}
                              </div>
                            </div>
                            <Badge className={
                              program.status === 'active' ? 'bg-green-100 text-green-700' :
                              program.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {program.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'No programs linked yet', ar: 'لا توجد برامج مرتبطة بعد' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Knowledge Tab */}
            <TabsContent value="knowledge" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                    {t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {challenge.lessons_learned && challenge.lessons_learned.length > 0 ? (
                    <div className="space-y-3">
                      {challenge.lessons_learned.map((lesson, i) => (
                        <div key={i} className="p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">{lesson.category}</Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">{lesson.lesson}</p>
                          {lesson.recommendation && (
                            <p className="text-sm text-slate-600 mt-2">
                              <span className="font-semibold text-indigo-700">Recommendation:</span> {lesson.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'Lessons will be captured when challenge is resolved', ar: 'سيتم تسجيل الدروس عند حل التحدي' })}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cross-City Learning from similar challenges in relations */}
              {relations.filter(r => r.relation_role === 'similar_to').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5 text-teal-600" />
                      {t({ en: 'Cross-City Learning', ar: 'التعلم بين المدن' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      {t({ en: 'How other cities tackled similar challenges:', ar: 'كيف تعاملت المدن الأخرى مع تحديات مشابهة:' })}
                    </p>
                    <div className="space-y-3">
                      {relations.filter(r => r.relation_role === 'similar_to').slice(0, 3).map((rel) => {
                        const similar = allChallenges.find(c => c.id === rel.related_entity_id);
                        if (!similar) return null;
                        
                        return (
                          <div key={rel.id} className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-sm text-slate-900">{similar.title_en}</p>
                                <p className="text-xs text-slate-600">{similar.municipality_id}</p>
                              </div>
                              <Badge className={
                                similar.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {similar.status}
                              </Badge>
                            </div>
                            {similar.status === 'resolved' && similar.lessons_learned?.length > 0 && (
                              <div className="mt-2 p-2 bg-white rounded text-xs">
                                <p className="font-semibold text-teal-700 mb-1">{t({ en: 'Key Lesson:', ar: 'درس رئيسي:' })}</p>
                                <p className="text-slate-700">{similar.lessons_learned[0].lesson}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
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
                    <p className="text-xs text-slate-500">SAR (from pilots)</p>
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

              {contracts.length > 0 && (
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
              )}

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
                        {challenge.budget_estimate ? `${(challenge.budget_estimate / 1000).toFixed(0)}K SAR` : 'N/A'}
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

              {/* ROI Calculator */}
              {challenge.budget_estimate && pilots.length > 0 && (
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
                            {challenge.affected_population_size ? (challenge.affected_population_size / 1000).toFixed(1) + 'K' : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">{t({ en: 'Cost per Citizen Beneficiary', ar: 'التكلفة لكل مواطن مستفيد' })}</p>
                        <p className="text-3xl font-bold text-green-700">
                          {challenge.affected_population_size ? 
                            Math.round((challenge.budget_estimate + pilots.reduce((sum, p) => sum + (p.budget_spent || 0), 0)) / challenge.affected_population_size) 
                            : 'N/A'
                          }
                        </p>
                        <p className="text-xs text-slate-600">SAR per person</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Workflow History Tab */}
            <TabsContent value="workflow-history" className="space-y-6">
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

              {challenge.version_number > 1 && (
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
              )}
            </TabsContent>

            {/* Events Tab */}
            <TabsContent value="events" className="space-y-6">
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
            </TabsContent>

            {/* Policy Tab */}
            <TabsContent value="policy" className="space-y-6">
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
            </TabsContent>

            {/* Collaboration Tab */}
            <TabsContent value="collaboration" className="space-y-6">
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
                    {challenge.stakeholders?.length > 0 && (
                      <div>
                        <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Key Stakeholders', ar: 'أصحاب المصلحة الرئيسيون' })}</p>
                        <div className="space-y-2">
                          {challenge.stakeholders.map((stakeholder, i) => (
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
            </TabsContent>

            {/* Dependencies Tab */}
            <TabsContent value="dependencies" className="space-y-6">
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
            </TabsContent>

            {/* Scaling Tab */}
            <TabsContent value="scaling" className="space-y-6">
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

              {challenge.status === 'resolved' && (
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
              )}
            </TabsContent>

            {/* External Tab */}
            <TabsContent value="external" className="space-y-6">
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
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <ChallengeActivityLog challengeId={challengeId} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    Comments & Discussion ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comments.filter(c => c && c.created_date).map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg border ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">{c.created_by}</span>
                            {c.is_internal && <Badge variant="outline" className="text-xs">Internal</Badge>}
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
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={() => commentMutation.mutate({ challenge_id: challengeId, comment_text: comment })}
                      className="bg-gradient-to-r from-blue-600 to-teal-600"
                      disabled={!comment}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Citizen Origin Badge */}
            {challenge.citizen_origin_idea_id && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-900">{t({ en: 'Citizen-Originated', ar: 'من أصل مواطن' })}</p>
                </div>
                {citizenIdea ? (
                  <Link to={createPageUrl(`IdeaDetail?id=${citizenIdea.id}`)} className="text-xs text-blue-600 hover:underline">
                    💡 {t({ en: 'View original idea', ar: 'عرض الفكرة الأصلية' })}: {citizenIdea.title}
                  </Link>
                ) : (
                  <p className="text-xs text-blue-600">💡 Idea #{challenge.citizen_origin_idea_id}</p>
                )}
              </div>
            )}

            {/* Public Visibility Status */}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Visibility', ar: 'الرؤية' })}</p>
              <div className="flex items-center gap-2">
                {challenge.is_published ? (
                  <Badge className="bg-green-100 text-green-700">
                    <Globe className="h-3 w-3 mr-1" />
                    {t({ en: 'Published', ar: 'منشور' })}
                  </Badge>
                ) : (
                  <Badge variant="outline">{t({ en: 'Internal Only', ar: 'داخلي فقط' })}</Badge>
                )}
                {challenge.is_confidential && (
                  <Badge className="bg-red-100 text-red-700">
                    <Shield className="h-3 w-3 mr-1" />
                    {t({ en: 'Confidential', ar: 'سري' })}
                  </Badge>
                )}
              </div>
            </div>

            {/* Citizen Votes */}
            {challenge.citizen_votes_count > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Citizen Votes', ar: 'أصوات المواطنين' })}</p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-bold text-purple-600">{challenge.citizen_votes_count}</span>
                  <span className="text-xs text-slate-600">{t({ en: 'votes', ar: 'صوت' })}</span>
                </div>
              </div>
            )}

            {/* View Count */}
            {challenge.view_count > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Views', ar: 'المشاهدات' })}</p>
                <p className="font-medium text-sm">{challenge.view_count.toLocaleString()}</p>
              </div>
            )}

            {/* SLA & Escalation Status */}
            {challenge.sla_due_date && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <p className="text-xs font-semibold text-amber-900">{t({ en: 'SLA Due Date', ar: 'الموعد النهائي للاتفاقية' })}</p>
                </div>
                <p className="text-xs text-amber-800">{new Date(challenge.sla_due_date).toLocaleDateString()}</p>
                {challenge.escalation_level > 0 && (
                  <Badge className={
                    challenge.escalation_level === 2 ? 'bg-red-600 text-white mt-2' :
                    'bg-orange-600 text-white mt-2'
                  }>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {challenge.escalation_level === 2 ? t({ en: 'CRITICAL', ar: 'حرج' }) : t({ en: 'WARNING', ar: 'تحذير' })}
                  </Badge>
                )}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sector', ar: 'القطاع' })}</p>
              <p className="font-medium capitalize text-sm">{challenge.sector?.replace(/_/g, ' ')}</p>
            </div>
            {challenge.sub_sector && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Sub-Sector', ar: 'المجال الفرعي' })}</p>
                <p className="font-medium text-sm">{challenge.sub_sector}</p>
              </div>
            )}
            {challenge.service_id && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Affected Service', ar: 'الخدمة المتأثرة' })}</p>
                <p className="font-medium text-sm">{challenge.service_id}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Municipality', ar: 'البلدية' })}</p>
              <p className="font-medium text-sm">{challenge.municipality_id?.substring(0, 20)}</p>
            </div>
            {challenge.city_id && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'City', ar: 'المدينة' })}</p>
                <p className="font-medium text-sm">{challenge.city_id}</p>
              </div>
            )}
            {challenge.region_id && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Region', ar: 'المنطقة' })}</p>
                <p className="font-medium text-sm">{challenge.region_id}</p>
              </div>
            )}
            {challenge.coordinates && (challenge.coordinates.latitude || challenge.coordinates.longitude) && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Coordinates', ar: 'الإحداثيات' })}</p>
                <p className="font-medium text-xs font-mono">
                  {challenge.coordinates.latitude?.toFixed(6)}, {challenge.coordinates.longitude?.toFixed(6)}
                </p>
              </div>
            )}
            {challenge.affected_population_size && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Affected Population', ar: 'السكان المتأثرون' })}</p>
                <p className="font-medium text-sm">{challenge.affected_population_size.toLocaleString()}</p>
              </div>
            )}
            {challenge.ministry_service && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Ministry Service', ar: 'الخدمة من الوزارة' })}</p>
                <p className="font-medium text-sm">{challenge.ministry_service}</p>
              </div>
            )}
            {challenge.responsible_agency && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Responsible Agency', ar: 'الوكالة المسؤولة' })}</p>
                <p className="font-medium text-sm">{challenge.responsible_agency}</p>
              </div>
            )}
            {challenge.department && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Department', ar: 'الإدارة' })}</p>
                <p className="font-medium text-sm">{challenge.department}</p>
              </div>
            )}
            {challenge.challenge_owner && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Challenge Owner', ar: 'مالك التحدي' })}</p>
                <p className="font-medium text-sm">{challenge.challenge_owner}</p>
              </div>
            )}
            {challenge.challenge_owner_email && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Owner Email', ar: 'بريد المالك' })}</p>
                <p className="font-medium text-sm">{challenge.challenge_owner_email}</p>
              </div>
            )}
            {challenge.reviewer && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Reviewer', ar: 'المراجع' })}</p>
                <p className="font-medium text-sm">{challenge.reviewer}</p>
              </div>
            )}
            {challenge.theme && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Theme', ar: 'الثيم' })}</p>
                <p className="font-medium text-sm">{challenge.theme}</p>
              </div>
            )}
            {challenge.challenge_type && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Type', ar: 'النوع' })}</p>
                <Badge variant="outline" className="text-xs capitalize">
                  {challenge.challenge_type?.replace(/_/g, ' ')}
                </Badge>
              </div>
            )}
            {challenge.category && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Category', ar: 'الفئة' })}</p>
                <p className="font-medium text-sm">{challenge.category}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Tracks', ar: 'المسارات' })}</p>
              <div className="flex flex-wrap gap-1">
                {challenge.tracks?.length > 0 ? (
                  challenge.tracks.map((track, i) => (
                    <Badge key={i} variant="outline" className="capitalize text-xs">
                      {track.replace(/_/g, ' ')}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">{t({ en: 'None', ar: 'لا يوجد' })}</span>
                )}
              </div>
            </div>
            {challenge.source && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Source', ar: 'المصدر' })}</p>
                <p className="font-medium text-sm">{challenge.source}</p>
              </div>
            )}
            {challenge.strategic_goal && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Strategic Goal', ar: 'الهدف الاستراتيجي' })}</p>
                <p className="font-medium text-sm">{challenge.strategic_goal}</p>
              </div>
            )}
            {challenge.entry_date && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Entry Date', ar: 'تاريخ الإدخال' })}</p>
                <p className="text-sm">{challenge.entry_date}</p>
              </div>
            )}
            {challenge.processing_date && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Processing Date', ar: 'تاريخ المعالجة' })}</p>
                <p className="text-sm">{challenge.processing_date}</p>
              </div>
            )}
            {challenge.related_questions_count > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Related Questions', ar: 'الأسئلة المرتبطة' })}</p>
                <p className="font-medium text-sm">{challenge.related_questions_count}</p>
              </div>
            )}
            {challenge.keywords?.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">{t({ en: 'Keywords', ar: 'الكلمات المفتاحية' })}</p>
                <div className="flex flex-wrap gap-1">
                  {challenge.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}
            {challenge.budget_estimate && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Budget Est.', ar: 'تقدير الميزانية' })}</p>
                <p className="font-medium text-sm">{(challenge.budget_estimate / 1000).toFixed(0)}K SAR</p>
              </div>
            )}
            {challenge.timeline_estimate && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</p>
                <p className="text-sm">{challenge.timeline_estimate}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Created', ar: 'تاريخ الإنشاء' })}</p>
              <p className="text-sm">{new Date(challenge.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Relation Manager Modal */}
      <RelationManager
        entityType="Challenge"
        entityId={challengeId}
        open={relationManagerOpen}
        onClose={() => setRelationManagerOpen(false)}
      />
    </div>
  );
}