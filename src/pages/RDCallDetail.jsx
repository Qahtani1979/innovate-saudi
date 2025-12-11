import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Calendar, DollarSign, FileText, Target, Sparkles, TrendingUp,
  Clock, Award, Users, CheckCircle2, Send, MessageSquare, BookOpen,
  Beaker, AlertCircle, Image, Video, BarChart3, Mail, Play, Loader2, X
} from 'lucide-react';
import RDCallPublishWorkflow from '../components/RDCallPublishWorkflow';
import RDCallReviewWorkflow from '../components/RDCallReviewWorkflow';
import RDCallEvaluationPanel from '../components/RDCallEvaluationPanel';
import RDCallAwardWorkflow from '../components/RDCallAwardWorkflow';
import RDCallApprovalWorkflow from '../components/RDCallApprovalWorkflow';
import CrossEntityRecommender from '../components/CrossEntityRecommender';
import ReviewerAutoAssignment from '../components/ReviewerAutoAssignment';
import CommitteeMeetingScheduler from '../components/CommitteeMeetingScheduler';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';

function RDCallDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const callId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showPublish, setShowPublish] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showAward, setShowAward] = useState(false);
  const [showApproval, setShowApproval] = useState(false);
  const [selectedForAward, setSelectedForAward] = useState([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAutoAssign, setShowAutoAssign] = useState(false);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const queryClient = useQueryClient();
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: call, isLoading } = useQuery({
    queryKey: ['rd-call', callId],
    queryFn: async () => {
      const calls = await base44.entities.RDCall.list();
      return calls.find(c => c.id === callId);
    },
    enabled: !!callId
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals-for-call', callId],
    queryFn: async () => {
      const allProposals = await base44.entities.RDProposal.list();
      return allProposals.filter(p => p.rd_call_id === callId);
    },
    enabled: !!callId
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['rdcall-comments', callId],
    queryFn: async () => {
      const all = await base44.entities.RDCallComment.list();
      return all.filter(c => c.rd_call_id === callId);
    },
    enabled: !!callId
  });

  const commentMutation = useMutation({
    mutationFn: (data) => base44.entities.RDCallComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rdcall-comments']);
      setComment('');
      toast.success(t({ en: 'Comment added', ar: 'تم إضافة التعليق' }));
    }
  });

  if (isLoading || !call) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    published: { color: 'bg-blue-100 text-blue-700', icon: Sparkles },
    open: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    closed: { color: 'bg-red-100 text-red-700', icon: Clock },
    under_review: { color: 'bg-yellow-100 text-yellow-700', icon: BarChart3 },
    awarded: { color: 'bg-teal-100 text-teal-700', icon: Award },
    completed: { color: 'bg-purple-100 text-purple-700', icon: CheckCircle2 }
  };

  const typeColors = {
    open_call: 'bg-blue-100 text-blue-700',
    targeted_call: 'bg-purple-100 text-purple-700',
    challenge_driven: 'bg-red-100 text-red-700',
    collaborative: 'bg-green-100 text-green-700',
    fellowship: 'bg-amber-100 text-amber-700'
  };

  const statusInfo = statusConfig[call.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const response = await invokeAI({
      prompt: `Analyze this R&D Call for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Call: ${call.title_en}
Type: ${call.call_type}
Status: ${call.status}
Total Funding: ${call.total_funding || 'N/A'} SAR
Research Themes: ${call.research_themes?.map(t => t.theme).join(', ') || 'N/A'}
Focus Areas: ${call.focus_areas?.join(', ') || 'N/A'}
Number of Proposals: ${proposals.length}
Deadline: ${call.timeline?.submission_close || 'N/A'}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Strategic alignment with Vision 2030
2. Expected research impact
3. Recommendations to attract quality proposals
4. Potential collaboration opportunities with universities/research centers
5. Risk factors and mitigation suggestions`,
      response_json_schema: {
        type: 'object',
        properties: {
          strategic_alignment: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          expected_impact: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          proposal_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Modals */}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDCallPublishWorkflow rdCall={call} onClose={() => setShowPublish(false)} />
          </div>
        </div>
      )}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDCallReviewWorkflow rdCall={call} onClose={() => setShowReview(false)} />
          </div>
        </div>
      )}
      {showAward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDCallAwardWorkflow rdCall={call} selectedProposals={selectedForAward} onClose={() => setShowAward(false)} />
          </div>
        </div>
      )}
      {showApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <RDCallApprovalWorkflow rdCall={call} onClose={() => setShowApproval(false)} />
          </div>
        </div>
      )}
      {showAutoAssign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <ReviewerAutoAssignment rdCall={call} onClose={() => setShowAutoAssign(false)} />
          </div>
        </div>
      )}
      {showMeetingScheduler && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CommitteeMeetingScheduler rdCall={call} proposals={proposals} onClose={() => setShowMeetingScheduler(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {call.code && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 font-mono">
                    {call.code}
                  </Badge>
                )}
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {call.status?.replace(/_/g, ' ')}
                </Badge>
                <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                  {call.call_type?.replace(/_/g, ' ')}
                </Badge>
                {call.is_featured && (
                  <Badge className="bg-amber-500 text-white">
                    <Award className="h-3 w-3 mr-1" />
                    {t({ en: 'Featured', ar: 'مميز' })}
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && call.title_ar ? call.title_ar : call.title_en}
              </h1>
              {(call.tagline_en || call.tagline_ar) && (
                <p className="text-xl text-white/90">
                  {language === 'ar' && call.tagline_ar ? call.tagline_ar : call.tagline_en}
                </p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                {call.timeline?.submission_close && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{t({ en: 'Closes', ar: 'يغلق' })} {call.timeline.submission_close}</span>
                  </div>
                )}
                {call.total_funding && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{(call.total_funding / 1000000).toFixed(1)}M SAR</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {call.status === 'draft' && (
                <>
                  <Button onClick={() => setShowApproval(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Request Approval', ar: 'طلب موافقة' })}
                  </Button>
                  <Button onClick={() => setShowReview(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Review', ar: 'مراجعة' })}
                  </Button>
                  <Button onClick={() => setShowPublish(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Play className="h-4 w-4 mr-2" />
                    {t({ en: 'Publish', ar: 'نشر' })}
                  </Button>
                </>
              )}
              {(call.status === 'open' || call.status === 'closed' || call.status === 'under_review') && proposals.length > 0 && (
                <Button onClick={() => setShowEvaluation(true)} className="bg-purple-600 hover:bg-purple-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t({ en: 'Evaluate', ar: 'تقييم' })}
                </Button>
              )}
              {call.status === 'under_review' && proposals.filter(p => p.status === 'submitted').length > 0 && (
                <>
                  <Button onClick={() => setShowAutoAssign(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Users className="h-4 w-4 mr-2" />
                    {t({ en: 'Auto-Assign', ar: 'تعيين تلقائي' })}
                  </Button>
                  <Button onClick={() => setShowMeetingScheduler(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t({ en: 'Schedule Meeting', ar: 'جدولة اجتماع' })}
                  </Button>
                  <Button onClick={() => {
                    setSelectedForAward(proposals.filter(p => p.reviewer_scores?.length > 0).slice(0, call.number_of_awards || 3));
                    setShowAward(true);
                  }} className="bg-amber-600 hover:bg-amber-700">
                    <Award className="h-4 w-4 mr-2" />
                    {t({ en: 'Award', ar: 'جوائز' })}
                  </Button>
                </>
              )}
              {call.status === 'open' && (
                <Link to={createPageUrl(`ProposalWizard?callId=${callId}`)}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Send className="h-4 w-4 mr-2" />
                    {t({ en: 'Apply Now', ar: 'تقدم الآن' })}
                  </Button>
                </Link>
              )}
              <Link to={createPageUrl(`RDCallEdit?id=${callId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
              <Button className="bg-white text-teal-600 hover:bg-white/90" onClick={handleAIInsights}>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-teal-700">
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
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-3 text-slate-600">{t({ en: 'Analyzing R&D call...', ar: 'جاري تحليل دعوة البحث...' })}</span>
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
                {aiInsights.expected_impact?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Expected Impact', ar: 'الأثر المتوقع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.expected_impact.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.proposal_recommendations?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Proposal Recommendations', ar: 'توصيات المقترحات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.proposal_recommendations.map((item, i) => (
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
                <p className="text-sm text-slate-600">{t({ en: 'Total Funding', ar: 'التمويل الكلي' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {call.total_funding ? `${(call.total_funding / 1000000).toFixed(1)}M` : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Proposals', ar: 'المقترحات' })}</p>
                <p className="text-3xl font-bold text-green-600">{call.submission_count || proposals.length}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Awards', ar: 'الجوائز' })}</p>
                <p className="text-3xl font-bold text-purple-600">{call.number_of_awards || 0}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Per Project', ar: 'لكل مشروع' })}</p>
                <p className="text-3xl font-bold text-amber-600">
                  {call.funding_per_project?.max ? `${(call.funding_per_project.max / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
              <Target className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Themes', ar: 'المواضيع' })}</p>
                <p className="text-3xl font-bold text-teal-600">{call.research_themes?.length || 0}</p>
              </div>
              <Beaker className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="workflow" className="space-y-6">
            <TabsList className="grid w-full grid-cols-13 h-auto">
              <TabsTrigger value="workflow" className="flex flex-col gap-1 py-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Workflow', ar: 'سير العمل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Overview', ar: 'نظرة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="themes" className="flex flex-col gap-1 py-3">
                <Beaker className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Themes', ar: 'مواضيع' })}</span>
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex flex-col gap-1 py-3">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Timeline', ar: 'جدول' })}</span>
              </TabsTrigger>
              <TabsTrigger value="eligibility" className="flex flex-col gap-1 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Eligibility', ar: 'أهلية' })}</span>
              </TabsTrigger>
              <TabsTrigger value="funding" className="flex flex-col gap-1 py-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Funding', ar: 'تمويل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="submission" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Submit', ar: 'إرسال' })}</span>
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="flex flex-col gap-1 py-3">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Eval', ar: 'تقييم' })}</span>
              </TabsTrigger>
              <TabsTrigger value="proposals" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Proposals', ar: 'مقترحات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex flex-col gap-1 py-3">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Challenges', ar: 'تحديات' })}</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'FAQ', ar: 'أسئلة' })}</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex flex-col gap-1 py-3">
                <Image className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Media', ar: 'وسائط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Contact', ar: 'تواصل' })}</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Discussion', ar: 'نقاش' })}</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex flex-col gap-1 py-3">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'AI Links', ar: 'روابط' })}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflow">
              <UnifiedWorkflowApprovalTab
                entityType="RDCall"
                entityId={callId}
                currentStage={
                  call.status === 'draft' ? 'draft' :
                  call.status === 'published' || call.status === 'open' ? 'published' :
                  call.status === 'under_review' ? 'review' :
                  call.status === 'awarded' ? 'awarded' : 'draft'
                }
              />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Call Description', ar: 'وصف الدعوة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' && call.description_ar ? 'rtl' : 'ltr'}>
                    {language === 'ar' && call.description_ar ? call.description_ar : (call.description_en || t({ en: 'No description provided', ar: 'لا يوجد وصف' }))}
                  </p>
                </CardContent>
              </Card>

              {(call.objectives_en || call.objectives_ar) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Objectives', ar: 'الأهداف' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' && call.objectives_ar ? 'rtl' : 'ltr'}>
                      {language === 'ar' && call.objectives_ar ? call.objectives_ar : call.objectives_en}
                    </p>
                  </CardContent>
                </Card>
              )}

              {call.expected_outcomes && call.expected_outcomes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {call.expected_outcomes.map((outcome, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="themes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-teal-600" />
                    {t({ en: 'Research Themes', ar: 'المواضيع البحثية' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {call.research_themes && call.research_themes.length > 0 ? (
                    <div className="space-y-4">
                      {call.research_themes.map((theme, i) => (
                        <div key={i} className="p-4 border-l-4 border-teal-500 bg-teal-50 rounded-r-lg">
                          <h4 className="font-semibold text-slate-900">{theme.theme}</h4>
                          {theme.description && (
                            <p className="text-sm text-slate-700 mt-1">{theme.description}</p>
                          )}
                          {theme.budget_allocation && (
                            <p className="text-sm text-teal-900 font-medium mt-2">
                              {t({ en: 'Budget', ar: 'الميزانية' })}: {(theme.budget_allocation / 1000).toFixed(0)}K SAR
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No research themes defined', ar: 'لم يتم تحديد المواضيع البحثية' })}</p>
                  )}
                </CardContent>
              </Card>

              {call.focus_areas && call.focus_areas.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Focus Areas', ar: 'مجالات التركيز' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {call.focus_areas.map((area, i) => (
                        <Badge key={i} variant="outline">{area}</Badge>
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
                    {t({ en: 'Important Dates', ar: 'التواريخ المهمة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {call.timeline ? (
                    <div className="space-y-3">
                      {call.timeline.announcement_date && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">{t({ en: 'Announcement', ar: 'الإعلان' })}:</span>
                          <span className="text-sm font-medium">{call.timeline.announcement_date}</span>
                        </div>
                      )}
                      {call.timeline.submission_open && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                          <span className="text-sm text-slate-600">{t({ en: 'Submissions Open', ar: 'فتح التقديم' })}:</span>
                          <span className="text-sm font-medium text-green-700">{call.timeline.submission_open}</span>
                        </div>
                      )}
                      {call.timeline.submission_close && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                          <span className="text-sm text-slate-600">{t({ en: 'Deadline', ar: 'الموعد النهائي' })}:</span>
                          <span className="text-sm font-medium text-red-700">{call.timeline.submission_close}</span>
                        </div>
                      )}
                      {call.timeline.review_period && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm text-slate-600">{t({ en: 'Review Period', ar: 'فترة المراجعة' })}:</span>
                          <span className="text-sm font-medium">{call.timeline.review_period}</span>
                        </div>
                      )}
                      {call.timeline.award_date && (
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                          <span className="text-sm text-slate-600">{t({ en: 'Award Date', ar: 'تاريخ الإعلان' })}:</span>
                          <span className="text-sm font-medium text-blue-700">{call.timeline.award_date}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No timeline specified', ar: 'لم يتم تحديد الجدول الزمني' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="eligibility">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Eligibility Criteria', ar: 'معايير الأهلية' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.eligibility_criteria && Array.isArray(call.eligibility_criteria) && call.eligibility_criteria.length > 0 ? (
                    <div className="space-y-2">
                      {call.eligibility_criteria.map((criterion, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 border rounded-lg">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{criterion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No specific criteria listed', ar: 'لا توجد معايير محددة' })}</p>
                  )}
                </CardContent>
              </Card>

              {call.eligible_institutions && call.eligible_institutions.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Eligible Institutions', ar: 'المؤسسات المؤهلة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {call.eligible_institutions.map((inst, i) => (
                        <Badge key={i} variant="outline">{inst}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="funding">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {t({ en: 'Funding Details', ar: 'تفاصيل التمويل' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-green-900">{t({ en: 'Total Pool', ar: 'إجمالي التمويل' })}</p>
                      <span className="text-2xl font-bold text-green-600">
                        {call.total_funding ? `${(call.total_funding / 1000000).toFixed(1)}M SAR` : t({ en: 'N/A', ar: 'غير محدد' })}
                      </span>
                    </div>
                  </div>

                  {call.funding_per_project && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-slate-500">{t({ en: 'Min per Project', ar: 'الحد الأدنى للمشروع' })}</p>
                        <p className="text-lg font-bold text-slate-900">{(call.funding_per_project.min / 1000).toFixed(0)}K SAR</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-slate-500">{t({ en: 'Max per Project', ar: 'الحد الأقصى للمشروع' })}</p>
                        <p className="text-lg font-bold text-slate-900">{(call.funding_per_project.max / 1000).toFixed(0)}K SAR</p>
                      </div>
                    </div>
                  )}

                  {call.number_of_awards && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">{call.number_of_awards}</span> {t({ en: 'awards available', ar: 'جوائز متاحة' })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="submission">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Submission Requirements', ar: 'متطلبات التقديم' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.submission_requirements && call.submission_requirements.length > 0 ? (
                    <div className="space-y-3">
                      {call.submission_requirements.map((req, i) => (
                        <div key={i} className={`p-4 border rounded-lg ${req.mandatory ? 'border-red-300 bg-red-50' : ''}`}>
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm text-slate-900">{req.requirement}</p>
                            {req.mandatory && (
                              <Badge className="bg-red-100 text-red-700 text-xs">{t({ en: 'Mandatory', ar: 'إلزامي' })}</Badge>
                            )}
                          </div>
                          {req.description && (
                            <p className="text-sm text-slate-600">{req.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No requirements specified', ar: 'لم يتم تحديد المتطلبات' })}</p>
                  )}
                </CardContent>
              </Card>

              {call.document_urls && call.document_urls.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Documents', ar: 'المستندات' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {call.document_urls.map((doc, i) => (
                        <Button key={i} variant="outline" asChild className="w-full justify-start">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            {doc.name}
                          </a>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="evaluation">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Evaluation Criteria', ar: 'معايير التقييم' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.evaluation_criteria && call.evaluation_criteria.length > 0 ? (
                    <div className="space-y-3">
                      {call.evaluation_criteria.map((criterion, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm text-slate-900">{criterion.criterion}</p>
                            <Badge variant="outline" className="text-xs">{criterion.weight}%</Badge>
                          </div>
                          {criterion.description && (
                            <p className="text-sm text-slate-600">{criterion.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No evaluation criteria specified', ar: 'لم يتم تحديد معايير التقييم' })}</p>
                  )}
                </CardContent>
              </Card>

              {call.review_process && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Review Process', ar: 'عملية المراجعة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed">{call.review_process}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="proposals">
              {showEvaluation ? (
                <RDCallEvaluationPanel rdCall={call} proposals={proposals} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Submitted Proposals', ar: 'المقترحات المقدمة' })} ({proposals.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {proposals.length > 0 ? (
                      <div className="space-y-3">
                        {proposals.map((proposal) => (
                          <Link
                            key={proposal.id}
                            to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}
                            className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{proposal.title_en}</p>
                                <p className="text-sm text-slate-600 mt-1">{proposal.lead_institution}</p>
                              </div>
                              <Badge>{proposal.status?.replace(/_/g, ' ')}</Badge>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">
                          {t({ en: 'No proposals submitted yet', ar: 'لم يتم تقديم مقترحات بعد' })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="challenges">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Linked Challenges', ar: 'التحديات المرتبطة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.linked_challenges && call.linked_challenges.length > 0 ? (
                    <div className="space-y-2">
                      {call.linked_challenges.map((id, i) => (
                        <Link key={i} to={createPageUrl(`ChallengeDetail?id=${id}`)} className="block p-3 border rounded-lg hover:bg-slate-50">
                          <p className="text-sm text-blue-600">Challenge {id.substring(0, 8)}</p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">
                      {call.linked_challenges?.length || 0} challenges linked to this call
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Frequently Asked Questions', ar: 'الأسئلة الشائعة' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {call.faq && call.faq.length > 0 ? (
                    <div className="space-y-4">
                      {call.faq.map((item, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <p className="font-semibold text-sm text-slate-900 mb-2">
                            {language === 'ar' && item.question_ar ? item.question_ar : item.question_en}
                          </p>
                          <p className="text-sm text-slate-700">
                            {language === 'ar' && item.answer_ar ? item.answer_ar : item.answer_en}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-8">{t({ en: 'No FAQs available', ar: 'لا توجد أسئلة شائعة' })}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              {call.image_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img src={call.image_url} alt={call.title_en} className="w-full rounded-lg" />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Contact Information', ar: 'معلومات التواصل' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {call.contact_person && (
                    <>
                      {call.contact_person.name && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">{t({ en: 'Contact Person', ar: 'جهة الاتصال' })}</p>
                          <p className="text-sm font-medium">{call.contact_person.name}</p>
                        </div>
                      )}
                      {call.contact_person.email && (
                        <a href={`mailto:${call.contact_person.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {call.contact_person.email}
                        </a>
                      )}
                      {call.contact_person.phone && (
                        <p className="text-sm text-slate-600">{call.contact_person.phone}</p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {call.webinar_dates && call.webinar_dates.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>{t({ en: 'Information Sessions', ar: 'الجلسات الإعلامية' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {call.webinar_dates.map((webinar, i) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm text-slate-900">{webinar.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{webinar.date}</p>
                          {webinar.registration_url && (
                            <Button variant="outline" size="sm" asChild className="mt-2">
                              <a href={webinar.registration_url} target="_blank" rel="noopener noreferrer">
                                {t({ en: 'Register', ar: 'تسجيل' })}
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Discussion Tab */}
            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    {t({ en: 'Discussion & Q&A', ar: 'النقاش والأسئلة' })} ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comments.map((c) => (
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
                  ))}
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder={t({ en: 'Ask a question or add a comment...', ar: 'اطرح سؤالاً أو أضف تعليقاً...' })}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      onClick={() => commentMutation.mutate({ rd_call_id: callId, comment_text: comment })}
                      className="bg-gradient-to-r from-blue-600 to-teal-600"
                      disabled={!comment}
                    >
                      <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Post Comment', ar: 'نشر تعليق' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Connections Tab */}
            <TabsContent value="connections">
              <CrossEntityRecommender 
                sourceEntity={call} 
                sourceType="RDCall" 
                recommendations={['challenges', 'rdprojects', 'pilots']}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Call Info', ar: 'معلومات الدعوة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Type', ar: 'النوع' })}</p>
              <Badge className={typeColors[call.call_type]}>
                {call.call_type?.replace(/_/g, ' ')}
              </Badge>
            </div>
            {call.issuing_organization_id && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Issuer', ar: 'الجهة المصدرة' })}</p>
                <p className="text-sm font-medium">{call.issuing_organization_id}</p>
              </div>
            )}
            {call.timeline?.submission_close && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-900 font-medium mb-1">{t({ en: 'Deadline', ar: 'الموعد النهائي' })}</p>
                <p className="text-sm text-red-700">{call.timeline.submission_close}</p>
              </div>
            )}
            {call.timeline?.award_date && (
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Award Date', ar: 'تاريخ الإعلان' })}</p>
                <p className="text-sm">{call.timeline.award_date}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Status', ar: 'الحالة' })}</p>
              <Badge className={statusInfo.color}>
                {call.status?.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(RDCallDetailPage, { requiredPermissions: [] });