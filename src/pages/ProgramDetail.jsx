import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  Calendar, Users, Target, Award, DollarSign, Sparkles,
  FileText, TrendingUp, CheckCircle2, Clock, MessageSquare,
  Send, Image, Lightbulb, Activity, BookOpen, Loader2, X,
  Rocket, Filter
} from 'lucide-react';
import ProgramLaunchWorkflow from '../components/ProgramLaunchWorkflow';
import ProgramApplicationScreening from '../components/ProgramApplicationScreening';
import ProgramSelectionWorkflow from '../components/ProgramSelectionWorkflow';
import ProgramSessionManager from '../components/ProgramSessionManager';
import ProgramMentorMatching from '../components/ProgramMentorMatching';
import ProgramCompletionWorkflow from '../components/ProgramCompletionWorkflow';
import ProgramMidReviewGate from '../components/ProgramMidReviewGate';
import PolicyTabWidget from '../components/policy/PolicyTabWidget';
import ProgramActivityLog from '../components/programs/ProgramActivityLog';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import { usePermissions } from '../components/permissions/usePermissions';
import { Shield, Workflow } from 'lucide-react';
import AIProgramSuccessPredictor from '../components/programs/AIProgramSuccessPredictor';
import AICohortOptimizerWidget from '../components/programs/AICohortOptimizerWidget';
import AIDropoutPredictor from '../components/programs/AIDropoutPredictor';
import AIAlumniSuggester from '../components/programs/AIAlumniSuggester';
import ProgramToSolutionWorkflow from '../components/programs/ProgramToSolutionWorkflow';
import ProgramToPilotWorkflow from '../components/programs/ProgramToPilotWorkflow';
import StrategicAlignmentWidget from '../components/programs/StrategicAlignmentWidget';
import ParticipantAssignmentSystem from '../components/programs/ParticipantAssignmentSystem';
import WaitlistManager from '../components/programs/WaitlistManager';
import AlumniNetworkHub from '../components/programs/AlumniNetworkHub';
import AlumniImpactTracker from '../components/programs/AlumniImpactTracker';
import PeerCollaborationHub from '../components/programs/PeerCollaborationHub';
import ResourceLibrary from '../components/programs/ResourceLibrary';
import AlumniSuccessStoryGenerator from '../components/programs/AlumniSuccessStoryGenerator';
import MunicipalImpactCalculator from '../components/programs/MunicipalImpactCalculator';
import ProgramOutcomeKPITracker from '../components/programs/ProgramOutcomeKPITracker';
import ProgramLessonsToStrategy from '../components/programs/ProgramLessonsToStrategy';
import { usePrompt } from '@/hooks/usePrompt';
import { PROGRAM_DETAIL_PROMPT_TEMPLATE } from '@/lib/ai/prompts/programs/programDetail';
import { PageLayout } from '@/components/layout/PersonaPageLayout';

export default function ProgramDetail() {
  const { hasPermission, user } = usePermissions();
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [comment, setComment] = useState('');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { invoke: invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = usePrompt(null);
  const [showLaunch, setShowLaunch] = useState(false);
  const [showScreening, setShowScreening] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showMentorMatch, setShowMentorMatch] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showMidReview, setShowMidReview] = useState(false);
  const queryClient = useQueryClient();

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('id', programId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!programId
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['program-applications', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_applications')
        .select('*')
        .eq('program_id', programId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['program-comments', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('program_comments')
        .select('*')
        .eq('program_id', programId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const { data: expertAssignments = [] } = useQuery({
    queryKey: ['program-expert-assignments', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_assignments')
        .select('*')
        .eq('entity_type', 'program')
        .eq('entity_id', programId)
        .eq('assignment_type', 'mentor');
      if (error) throw error;
      return data || [];
    },
    enabled: !!programId
  });

  const commentMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('program_comments').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['program-comments']);
      setComment('');
      toast.success('Comment added');
    }
  });

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    try {
      // Use centralized prompt template
      const promptConfig = PROGRAM_DETAIL_PROMPT_TEMPLATE(program);

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
    }
  };

  if (isLoading || !program) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusConfig = {
    planning: { color: 'bg-slate-100 text-slate-700', icon: Clock },
    applications_open: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    selection: { color: 'bg-yellow-100 text-yellow-700', icon: Users },
    active: { color: 'bg-blue-100 text-blue-700', icon: Activity },
    completed: { color: 'bg-teal-100 text-teal-700', icon: Award },
    cancelled: { color: 'bg-red-100 text-red-700', icon: CheckCircle2 }
  };

  const typeColors = {
    accelerator: 'bg-orange-100 text-orange-700',
    incubator: 'bg-pink-100 text-pink-700',
    hackathon: 'bg-indigo-100 text-indigo-700',
    challenge: 'bg-red-100 text-red-700',
    fellowship: 'bg-purple-100 text-purple-700',
    training: 'bg-teal-100 text-teal-700',
    matchmaker: 'bg-blue-100 text-blue-700',
    sandbox_wave: 'bg-purple-100 text-purple-700'
  };

  const statusInfo = statusConfig[program.status] || statusConfig.planning;
  const StatusIcon = statusInfo.icon;

  return (
    <PageLayout>
      {/* Workflow Modals */}
      {showLaunch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProgramLaunchWorkflow program={program} onClose={() => setShowLaunch(false)} />
          </div>
        </div>
      )}
      {showScreening && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ProgramApplicationScreening program={program} onClose={() => setShowScreening(false)} />
          </div>
        </div>
      )}
      {showSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ProgramSelectionWorkflow program={program} onClose={() => setShowSelection(false)} />
          </div>
        </div>
      )}
      {showSessions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ProgramSessionManager program={program} onClose={() => setShowSessions(false)} />
          </div>
        </div>
      )}
      {showMentorMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ProgramMentorMatching program={program} onClose={() => setShowMentorMatch(false)} />
          </div>
        </div>
      )}
      {showCompletion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ProgramCompletionWorkflow program={program} onClose={() => setShowCompletion(false)} />
          </div>
        </div>
      )}
      {showMidReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProgramMidReviewGate program={program} onClose={() => setShowMidReview(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {program.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {program.code}
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {program.status?.replace(/_/g, ' ')}
                </Badge>
                <Badge className={typeColors[program.program_type]}>
                  {program.program_type?.replace(/_/g, ' ')}
                </Badge>
                {program.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
              </h1>
              {(program.tagline_en || program.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && program.tagline_ar ? program.tagline_ar : program.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                {program.timeline?.application_open && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Opens {program.timeline.application_open}</span>
                  </div>
                )}
                {program.duration_weeks && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{program.duration_weeks} weeks</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {program.status === 'planning' && (
                <Button onClick={() => setShowLaunch(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Rocket className="h-4 w-4 mr-2" />
                  {t({ en: 'Launch', ar: 'إطلاق' })}
                </Button>
              )}
              {program.status === 'applications_open' && applications.length > 0 && (
                <Button onClick={() => setShowScreening(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Filter className="h-4 w-4 mr-2" />
                  {t({ en: 'Screen', ar: 'فرز' })}
                </Button>
              )}
              {program.status === 'selection' && (
                <Button onClick={() => setShowSelection(true)} className="bg-green-600 hover:bg-green-700">
                  <Award className="h-4 w-4 mr-2" />
                  {t({ en: 'Select', ar: 'اختيار' })}
                </Button>
              )}
              {program.status === 'active' && (
                <>
                  <Button onClick={() => setShowSessions(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t({ en: 'Sessions', ar: 'جلسات' })}
                  </Button>
                  <Button onClick={() => setShowMentorMatch(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Match Mentors', ar: 'مطابقة الموجهين' })}
                  </Button>
                  <Button onClick={() => setShowMidReview(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Target className="h-4 w-4 mr-2" />
                    {t({ en: 'Mid-Review', ar: 'مراجعة' })}
                  </Button>
                  <Button onClick={() => setShowCompletion(true)} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Complete', ar: 'إكمال' })}
                  </Button>
                </>
              )}
              {(hasPermission('program_edit') || program.created_by === user?.email) && (
                <Link to={createPageUrl(`ProgramEdit?id=${programId}`)}>
                  <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    {t({ en: 'Edit', ar: 'تعديل' })}
                  </Button>
                </Link>
              )}
              <Button className="bg-white text-pink-600 hover:bg-white/90" onClick={handleAIInsights}>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-pink-700">
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
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing program...', ar: 'جاري تحليل البرنامج...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.effectiveness?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Effectiveness', ar: 'الفعالية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.effectiveness.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.engagement_recommendations?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Engagement', ar: 'المشاركة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.engagement_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.outcome_optimization?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Optimization', ar: 'التحسين' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.outcome_optimization.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.scaling_potential?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Scaling Potential', ar: 'إمكانية التوسع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.scaling_potential.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.partnership_opportunities?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Partnership Opportunities', ar: 'فرص الشراكة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.partnership_opportunities.map((item, i) => (
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
                <p className="text-sm text-slate-600">{t({ en: 'Applications', ar: 'الطلبات' })}</p>
                <p className="text-3xl font-bold text-blue-600">{program.application_count || applications.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Accepted', ar: 'المقبول' })}</p>
                <p className="text-3xl font-bold text-green-600">{program.accepted_count || 0}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Outcomes', ar: 'النتائج' })}</p>
                <p className="text-3xl font-bold text-purple-600">{program.outcomes?.pilots_generated || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
                <p className="text-3xl font-bold text-amber-600">{program.duration_weeks || 0}w</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Funding', ar: 'التمويل' })}</p>
                <p className="text-3xl font-bold text-rose-600">
                  {program.funding_details?.total_pool ? `${(program.funding_details.total_pool / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-rose-600" />
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
              <TabsTrigger value="timeline" className="flex flex-col gap-1 py-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Timeline', ar: 'جدول' })}</span>
              </TabsTrigger>
              <TabsTrigger value="eligibility" className="flex flex-col gap-1 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Eligibility', ar: 'أهلية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Benefits', ar: 'فوائد' })}</span>
              </TabsTrigger>
              <TabsTrigger value="funding" className="flex flex-col gap-1 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Funding', ar: 'تمويل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="flex flex-col gap-1 py-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Curriculum', ar: 'منهج' })}</span>
              </TabsTrigger>
              <TabsTrigger value="mentors" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Mentors', ar: 'موجهون' })}</span>
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Apply', ar: 'تقديم' })}</span>
              </TabsTrigger>
              <TabsTrigger value="participants" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Cohort', ar: 'دفعة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="outcomes" className="flex flex-col gap-1 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Outcomes', ar: 'نتائج' })}</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
                <Image className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Discussion', ar: 'نقاش' })}</span>
              </TabsTrigger>
              <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
                <Workflow className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex flex-col gap-1 py-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Activity', ar: 'نشاط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="policy" className="flex flex-col gap-1 py-3">
                <Shield className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Policy', ar: 'سياسة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="conversions" className="flex flex-col gap-1 py-3">
                <Lightbulb className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Convert', ar: 'تحويل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Collab', ar: 'تعاون' })}</span>
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex flex-col gap-1 py-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Resources', ar: 'موارد' })}</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description | الوصف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {program.description_en || 'No description provided'}
                    </p>
                  </div>
                  {program.description_ar && (
                    <div className="pt-4 border-t" dir="rtl">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {program.description_ar}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <AIProgramSuccessPredictor program={program} />
            </TabsContent>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Program Timeline', ar: 'الجدول الزمني' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.timeline ? (
                    <div className="space-y-3">
                      {program.timeline.application_open && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">Applications Open:</span>
                          <span className="text-sm font-medium">{program.timeline.application_open}</span>
                        </div>
                      )}
                      {program.timeline.application_close && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                          <span className="text-sm text-slate-600">Deadline:</span>
                          <span className="text-sm font-medium text-red-700">{program.timeline.application_close}</span>
                        </div>
                      )}
                      {program.timeline.program_start && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">Program Starts:</span>
                          <span className="text-sm font-medium">{program.timeline.program_start}</span>
                        </div>
                      )}
                      {program.timeline.program_end && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">Program Ends:</span>
                          <span className="text-sm font-medium">{program.timeline.program_end}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No timeline specified</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eligibility">
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Criteria | معايير الأهلية</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.eligibility_criteria && Array.isArray(program.eligibility_criteria) && program.eligibility_criteria.length > 0 ? (
                    <div className="space-y-2">
                      {program.eligibility_criteria.map((criterion, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 border rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{criterion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-8">No criteria specified</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benefits">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Program Benefits', ar: 'فوائد البرنامج' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.benefits && program.benefits.length > 0 ? (
                    <div className="space-y-3">
                      {program.benefits.map((benefit, i) => (
                        <div key={i} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                          <p className="font-medium text-sm text-slate-900">{benefit.benefit}</p>
                          {benefit.description && (
                            <p className="text-sm text-slate-600 mt-1">{benefit.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No benefits listed</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="funding">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Funding Details', ar: 'تفاصيل التمويل' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.funding_available ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-900">Funding Available</p>
                      </div>
                      {program.funding_details && (
                        <div className="space-y-3">
                          {program.funding_details.total_pool && (
                            <div className="flex justify-between p-3 border rounded-lg">
                              <span className="text-sm text-slate-600">Total Pool:</span>
                              <span className="text-sm font-medium">{(program.funding_details.total_pool / 1000).toFixed(0)}K SAR</span>
                            </div>
                          )}
                          {program.funding_details.min_amount && (
                            <div className="flex justify-between p-3 border rounded-lg">
                              <span className="text-sm text-slate-600">Min per Project:</span>
                              <span className="text-sm font-medium">{(program.funding_details.min_amount / 1000).toFixed(0)}K SAR</span>
                            </div>
                          )}
                          {program.funding_details.max_amount && (
                            <div className="flex justify-between p-3 border rounded-lg">
                              <span className="text-sm text-slate-600">Max per Project:</span>
                              <span className="text-sm font-medium">{(program.funding_details.max_amount / 1000).toFixed(0)}K SAR</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No funding available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Program Curriculum', ar: 'منهج البرنامج' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.curriculum && program.curriculum.length > 0 ? (
                    <div className="space-y-3">
                      {program.curriculum.map((week, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <p className="font-medium text-sm text-slate-900">Week {week.week}: {week.topic}</p>
                          {week.activities && week.activities.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {week.activities.map((activity, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                  <p className="text-sm text-slate-600">{activity}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">No curriculum details</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mentors">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t({ en: 'Expert Mentors & Advisors', ar: 'الموجهون الخبراء والمستشارون' })}</CardTitle>
                    <div className="flex gap-2">
                      <Link to={createPageUrl('MentorDashboard')}>
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          {t({ en: 'Mentor Portal', ar: 'بوابة الموجهين' })}
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=program&entity_id=${programId}`)} target="_blank">
                        <Button size="sm" className="bg-purple-600">
                          <Users className="h-4 w-4 mr-2" />
                          {t({ en: 'Assign Mentors', ar: 'تعيين موجهين' })}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {expertAssignments.length > 0 ? (
                    <div className="space-y-4">
                      {expertAssignments.map((assignment) => (
                        <div key={assignment.id} className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">{assignment.expert_email}</p>
                              <p className="text-xs text-slate-500">
                                {t({ en: 'Assigned:', ar: 'تم التعيين:' })} {new Date(assignment.assigned_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={
                              assignment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                  assignment.status === 'accepted' ? 'bg-purple-100 text-purple-700' :
                                    assignment.status === 'declined' ? 'bg-red-100 text-red-700' :
                                      'bg-yellow-100 text-yellow-700'
                            }>
                              {assignment.status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          {assignment.notes && (
                            <p className="text-sm text-slate-600 mt-2">{assignment.notes}</p>
                          )}
                          {assignment.hours_estimated && (
                            <p className="text-xs text-slate-500 mt-1">
                              {t({ en: 'Est. Hours:', ar: 'الساعات المقدرة:' })} {assignment.hours_estimated}h
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : program.mentors && program.mentors.length > 0 ? (
                    <div>
                      <p className="text-xs text-amber-700 mb-3 p-2 bg-amber-50 rounded">
                        {t({ en: 'Legacy mentor data (not tracked as expert assignments)', ar: 'بيانات موجهين قديمة (غير متتبعة كتعيينات خبراء)' })}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {program.mentors.map((mentor, i) => (
                          <div key={i} className="p-4 border rounded-lg">
                            <p className="font-semibold text-sm text-slate-900">{mentor.name}</p>
                            {mentor.organization && (
                              <p className="text-xs text-slate-600">{mentor.organization}</p>
                            )}
                            {mentor.expertise && mentor.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {mentor.expertise.map((exp, j) => (
                                  <Badge key={j} variant="outline" className="text-xs">{exp}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 mb-4">{t({ en: 'No mentors assigned yet', ar: 'لم يتم تعيين موجهين بعد' })}</p>
                      <Link to={createPageUrl(`ExpertMatchingEngine?entity_type=program&entity_id=${programId}`)} target="_blank">
                        <Button className="bg-purple-600">
                          <Users className="h-4 w-4 mr-2" />
                          {t({ en: 'Match Mentors with AI', ar: 'مطابقة الموجهين بالذكاء الاصطناعي' })}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Applications | الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">
                      {t({ en: `${program.application_count || applications.length} applications received`, ar: `${program.application_count || applications.length} طلب مستلم` })}
                    </p>
                    <Link to={createPageUrl('ProgramApplicationWizard')}>
                      <Button className="bg-gradient-to-r from-blue-600 to-teal-600">
                        {t({ en: 'Apply Now', ar: 'تقدم الآن' })}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="participants" className="space-y-6">
              {program.status === 'selection' && (
                <>
                  <AICohortOptimizerWidget program={program} applications={applications} />
                  <WaitlistManager programId={programId} />
                </>
              )}

              {program.status === 'active' && (
                <>
                  <AIDropoutPredictor program={program} applications={applications} />
                  <ParticipantAssignmentSystem programId={programId} />
                </>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Cohort | الدفعة الحالية</CardTitle>
                    <Link to={createPageUrl('ParticipantDashboard')}>
                      <Button size="sm" className="bg-purple-600">
                        <Users className="h-4 w-4 mr-2" />
                        {t({ en: 'Participant Portal', ar: 'بوابة المشاركين' })}
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">
                      {t({ en: `${program.accepted_count || 0} participants enrolled`, ar: `${program.accepted_count || 0} مشارك مسجل` })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-6">
              <AlumniImpactTracker programId={programId} />
              <AlumniNetworkHub programId={programId} />
              <MunicipalImpactCalculator programId={programId} />

              {applications.length > 0 && (
                <AlumniSuccessStoryGenerator
                  alumnus={applications[0]}
                  program={program}
                />
              )}

              {program.status === 'completed' && applications?.length > 0 && (
                <>
                  <AIAlumniSuggester program={program} applications={applications} />

                  <Card className="border-2 border-teal-200">
                    <CardHeader>
                      <CardTitle>{t({ en: 'Graduate Pathways', ar: 'مسارات الخريجين' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <ProgramToSolutionWorkflow program={program} graduateApplication={applications[0]} />
                        <ProgramToPilotWorkflow program={program} graduateApplication={applications[0]} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Program Outcomes', ar: 'نتائج البرنامج' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.outcomes ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{program.outcomes.pilots_generated || 0}</div>
                        <div className="text-xs text-slate-600 mt-1">Pilots</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{program.outcomes.partnerships_formed || 0}</div>
                        <div className="text-xs text-slate-600 mt-1">Partnerships</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{program.outcomes.solutions_deployed || 0}</div>
                        <div className="text-xs text-slate-600 mt-1">Solutions</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">Outcomes pending</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="strategic" className="space-y-6">
              <StrategicAlignmentWidget program={program} />
              <ProgramOutcomeKPITracker program={program} />
              <ProgramLessonsToStrategy program={program} />
            </TabsContent>

            <TabsContent value="outcomes" className="space-y-6">
              {program.status === 'completed' && applications?.length > 0 && (
                <>
                  <AIAlumniSuggester program={program} applications={applications} />

                  <Card className="border-2 border-teal-200">
                    <CardHeader>
                      <CardTitle>{t({ en: 'Graduate Pathways', ar: 'مسارات الخريجين' })}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <ProgramToSolutionWorkflow program={program} graduateApplication={applications[0]} />
                        <ProgramToPilotWorkflow program={program} graduateApplication={applications[0]} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Program Outcomes', ar: 'نتائج البرنامج' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.outcomes ? (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{program.outcomes.pilots_generated || 0}</div>
                        <div className="text-xs text-slate-600 mt-1">Pilots</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{program.outcomes.partnerships_formed || 0}</div>
                        <div className="text-xs text-slate-600 mt-1">Partnerships</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">{program.outcomes.solutions_deployed || 0}</div>
                        <div className="text-xs text-slate-600 mt-1">Solutions</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">Outcomes pending</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {program.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={program.image_url} alt={program.name_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {program.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={program.image_url} alt={program.name_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="workflow">
              <UnifiedWorkflowApprovalTab
                entityType="program"
                entityId={programId}
                entityData={program}
                currentStage={program.workflow_stage || 'planning'}
                enableApprovalActions={hasPermission('program_approve') || user?.role === 'admin'}
              />
            </TabsContent>

            <TabsContent value="activity">
              <ProgramActivityLog programId={programId} />
            </TabsContent>

            <TabsContent value="policy">
              <PolicyTabWidget entityType="program" entityId={programId} />
            </TabsContent>

            <TabsContent value="collaboration">
              <PeerCollaborationHub programId={programId} />
            </TabsContent>

            <TabsContent value="resources">
              <ResourceLibrary programId={programId} />
            </TabsContent>

            <TabsContent value="conversions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    {t({ en: 'Conversions & Outputs', ar: 'التحويلات والمخرجات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Graduate Conversion Actions */}
                  {(program.status === 'active' || program.status === 'completed') && applications?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-900">
                        {t({ en: 'Convert Graduates to Ecosystem Outputs', ar: 'تحويل الخريجين لمخرجات النظام' })}
                      </h3>
                      <div className="flex gap-3">
                        <ProgramToSolutionWorkflow program={program} graduateApplication={applications[0]} />
                        <ProgramToPilotWorkflow program={program} graduateApplication={applications[0]} />
                      </div>
                      <p className="text-xs text-slate-500">
                        {t({
                          en: 'Convert program outcomes into marketplace solutions or pilot projects',
                          ar: 'تحويل نتائج البرنامج إلى حلول أو تجارب'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Linked Challenges */}
                  {program.linked_challenge_ids && program.linked_challenge_ids.length > 0 && (
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-2">
                        {t({ en: 'Addressing Challenges', ar: 'التحديات المعالجة' })}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {t({
                          en: `This program addresses ${program.linked_challenge_ids.length} municipal challenge(s)`,
                          ar: `يعالج هذا البرنامج ${program.linked_challenge_ids.length} تحدي بلدي`
                        })}
                      </p>
                    </div>
                  )}

                  {/* Info for non-active programs */}
                  {!['active', 'completed'].includes(program.status) && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-900">
                        {t({
                          en: 'Conversion workflows available when program is active or completed',
                          ar: 'سير عمل التحويل متاح عندما يكون البرنامج نشطاً أو مكتملاً'
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion">
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
                      placeholder={t({ en: "Add a comment...", ar: "أضف تعليقاً..." })}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={() => commentMutation.mutate({ program_id: programId, comment_text: comment })}
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
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Info | معلومات البرنامج</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Type', ar: 'النوع' })}</p>
              <Badge className={typeColors[program.program_type]}>{program.program_type?.replace(/_/g, ' ')}</Badge>
            </div>
            {program.timeline?.application_open && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Application Opens</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <p className="text-sm">{program.timeline.application_open}</p>
                </div>
              </div>
            )}
            {program.timeline?.application_close && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-900 font-medium mb-1">Deadline</p>
                <p className="text-sm text-red-700">{program.timeline.application_close}</p>
              </div>
            )}
            {program.duration_weeks && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Duration</p>
                <p className="text-sm">{program.duration_weeks} weeks</p>
              </div>
            )}
            {program.focus_areas && program.focus_areas.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-1">
                  {program.focus_areas.map((area, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}