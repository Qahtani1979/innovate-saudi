import { useState } from 'react';
import { useRDProposal } from '@/hooks/useRDProposal';
import { useRDProposalComments, useAddRDProposalComment } from '@/hooks/useRDProposalComments';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  FileText,
  User,
  DollarSign,
  Calendar,
  Target,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Beaker,
  Users,
  Send,
  Eye,
  MessageSquare,
  Loader2,
  X,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import ProposalSubmissionWizard from '../components/ProposalSubmissionWizard';
import ProposalReviewWorkflow from '../components/ProposalReviewWorkflow';
import ProposalEligibilityChecker from '../components/ProposalEligibilityChecker';
import ProposalFeedbackWorkflow from '../components/ProposalFeedbackWorkflow';
import CollaborativeReviewPanel from '../components/CollaborativeReviewPanel';
import CrossEntityRecommender from '../components/CrossEntityRecommender';
import { Textarea } from "@/components/ui/textarea";

import ProtectedPage from '../components/permissions/ProtectedPage';
import RDProposalActivityLog from '../components/rd/RDProposalActivityLog';
import RDProposalAIScorerWidget from '../components/rd/RDProposalAIScorerWidget';
import RDProposalEscalationAutomation from '../components/rd/RDProposalEscalationAutomation';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';

function RDProposalDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const [showSubmit, setShowSubmit] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showEligibility, setShowEligibility] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCollaborativeReview, setShowCollaborativeReview] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { invokeAI, status, isLoading: aiLoading, rateLimitInfo, isAvailable } = useAIWithFallback();


  const {
    data: proposal,
    isLoading
  } = useRDProposal(proposalId);

  const { mutate: postComment, isPending: isAddingComment } = useAddRDProposalComment();

  const { data: rdCalls = [] } = useRDCallsWithVisibility({ limit: 1000 });
  const rdCall = rdCalls.find(c => c.id === proposal?.rd_call_id);
  const { data: comments = [] } = useRDProposalComments(proposalId);

  if (isLoading || !proposal) {
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
    shortlisted: 'bg-purple-100 text-purple-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  const statusConfig = {
    draft: { color: 'bg-slate-100 text-slate-700', icon: FileText },
    submitted: { color: 'bg-blue-100 text-blue-700', icon: FileText },
    under_review: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    shortlisted: { color: 'bg-purple-100 text-purple-700', icon: Award },
    accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    rejected: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
  };

  const statusInfo = statusConfig[proposal.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const result = await invokeAI({
      system_prompt: "You are a strategic R&D analyst specializing in Saudi municipal innovation and Vision 2030 alignment. Provide highly technical yet accessible insights on research proposals, focusing on feasibility, impact, and scaling potential.",
      prompt: `Analyze this research proposal for Saudi municipal innovation R&D and provide strategic insights in BOTH English AND Arabic:
... (trimmed) ...
 Risk factors and mitigation recommendations`,
      response_json_schema: {
        type: 'object',
        properties: {
          strengths: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          improvements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          vision_alignment: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          pilot_potential: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          risk_mitigation: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      },
      system_prompt: "You are an expert R&D consultant providing strategic insights on research proposals."
    });

    if (result.success) {
      setAiInsights(result.data);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Modals */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProposalSubmissionWizard proposal={proposal} rdCall={rdCall} onClose={() => setShowSubmit(false)} />
          </div>
        </div>
      )}
      {showReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProposalReviewWorkflow proposal={proposal} onClose={() => setShowReview(false)} />
          </div>
        </div>
      )}
      {showEligibility && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProposalEligibilityChecker proposal={proposal} rdCall={rdCall} onClose={() => setShowEligibility(false)} />
          </div>
        </div>
      )}
      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <ProposalFeedbackWorkflow proposal={proposal} onClose={() => setShowFeedback(false)} />
          </div>
        </div>
      )}
      {showCollaborativeReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CollaborativeReviewPanel proposal={proposal} onClose={() => setShowCollaborativeReview(false)} />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {proposal.status?.replace(/_/g, ' ')}
                </Badge>
                {proposal?.['ai_score'] && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Score: {proposal?.['ai_score']}
                  </Badge>
                )}
                {rdCall && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40">
                    {rdCall.call_type?.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl font-bold mb-2">
                {language === 'ar' && proposal?.['title_ar'] ? proposal?.['title_ar'] : (proposal?.['title_en'] || proposal?.rd_project_id)}
              </h1>
              <p className="text-xl text-white/90">{proposal?.['lead_institution'] || proposal?.institution_name}</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                {proposal?.['research_area'] && (
                  <div className="flex items-center gap-1">
                    <Beaker className="h-4 w-4" />
                    <span>{proposal?.['research_area']}</span>
                  </div>
                )}
                {proposal?.['duration_months'] && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{proposal?.['duration_months']} {t({ en: 'months', ar: 'شهر' })}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl(`RDProposalEdit?id=${proposalId}`)}>
                <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                  {t({ en: 'Edit', ar: 'تعديل' })}
                </Button>
              </Link>
              {proposal.status === 'draft' && (
                <Button onClick={() => setShowSubmit(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit', ar: 'تقديم' })}
                </Button>
              )}
              {(proposal.status === 'under_review' || proposal.status === 'shortlisted') && (
                <Button disabled className="bg-yellow-600 opacity-70">
                  <Clock className="h-4 w-4 mr-2" />
                  {t({ en: 'Under Review', ar: 'قيد المراجعة' })}
                </Button>
              )}
              {proposal.status === 'submitted' && (
                <>
                  <Button onClick={() => setShowEligibility(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Check Eligibility', ar: 'فحص الأهلية' })}
                  </Button>
                  <Button onClick={() => setShowReview(true)} className="bg-yellow-600 hover:bg-yellow-700">
                    <Eye className="h-4 w-4 mr-2" />
                    {t({ en: 'Review', ar: 'مراجعة' })}
                  </Button>
                </>
              )}
              {proposal.status === 'submitted' && (
                <>
                  <Button onClick={() => setShowEligibility(true)} variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Check Eligibility', ar: 'فحص الأهلية' })}
                  </Button>
                  <Button onClick={() => setShowReview(true)} className="bg-yellow-600 hover:bg-yellow-700">
                    <Eye className="h-4 w-4 mr-2" />
                    {t({ en: 'Review', ar: 'مراجعة' })}
                  </Button>
                </>
              )}
              {(proposal.status === 'under_review' || proposal.status === 'submitted') && (
                <Button onClick={() => setShowCollaborativeReview(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Users className="h-4 w-4 mr-2" />
                  {t({ en: 'Collaborative Review', ar: 'مراجعة تعاونية' })}
                </Button>
              )}
              {(proposal?.status === 'rejected' || proposal?.status === 'not_awarded') && !proposal?.['feedback_provided'] && (
                <Button onClick={() => setShowFeedback(true)} className="bg-blue-600 hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t({ en: 'Send Feedback', ar: 'إرسال ملاحظات' })}
                </Button>
              )}
              <Button className="bg-white text-teal-600 hover:bg-white/90" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
                {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
              </Button>
              <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={null} />
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
              {t({ en: 'AI Proposal Insights', ar: 'رؤى المقترح الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing proposal...', ar: 'جاري تحليل المقترح...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.strengths?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Strengths', ar: 'نقاط القوة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.strengths.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.improvements?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Improvements', ar: 'التحسينات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.improvements.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.vision_alignment?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Vision Alignment', ar: 'التوافق مع الرؤية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.vision_alignment.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.pilot_potential?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Pilot Potential', ar: 'إمكانات التجريب' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.pilot_potential.map((item, i) => (
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {proposal?.['requested_budget'] ? `${(proposal?.['requested_budget'] / 1000).toFixed(0)}K` : 'N/A'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'TRL Target', ar: 'المستوى المستهدف' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {proposal?.['trl_target'] || 'N/A'}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {proposal?.['duration_months'] ? `${proposal?.['duration_months']}m` : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Team Size', ar: 'حجم الفريق' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {proposal?.['team_members']?.length || 0}
                </p>
              </div>
              <User className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t({ en: 'Quick Info', ar: 'معلومات سريعة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'R&D Call', ar: 'دعوة البحث' })}</p>
              {rdCall ? (
                <Link to={createPageUrl(`RDCallDetail?id=${rdCall.id}`)} className="text-sm text-blue-600 hover:underline">
                  {rdCall.title_en}
                </Link>
              ) : (
                <p className="text-sm">N/A</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Principal Investigator', ar: 'الباحث الرئيسي' })}</p>
              <p className="text-sm">
                {typeof proposal?.['principal_investigator'] === 'object'
                  ? (proposal?.['principal_investigator']?.['name'] || 'N/A')
                  : (proposal?.['principal_investigator'] || 'N/A')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Contact', ar: 'التواصل' })}</p>
              <p className="text-sm">{proposal?.['contact_email'] || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitted', ar: 'تاريخ التقديم' })}</p>
              <p className="text-sm">{proposal?.['created_date'] ? new Date(proposal?.['created_date']).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US') : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <Tabs defaultValue="abstract" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="abstract" className="flex flex-col gap-1 py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Abstract', ar: 'ملخص' })}</span>
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="flex flex-col gap-1 py-3">
                <Award className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'AI Score', ar: 'التقييم' })}</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex flex-col gap-1 py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Team', ar: 'فريق' })}</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex flex-col gap-1 py-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Activity', ar: 'نشاط' })}</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex flex-col gap-1 py-3">
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">{t({ en: 'Discussion', ar: 'نقاش' })}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="abstract">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Proposal Abstract', ar: 'ملخص المقترح' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' && proposal?.['abstract_ar'] ? 'rtl' : 'ltr'}>
                    {language === 'ar' && proposal?.['abstract_ar'] ? proposal?.['abstract_ar'] : (proposal?.['abstract_en'] || t({ en: 'No abstract provided', ar: 'لا يوجد ملخص' }))}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methodology" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Research Methodology', ar: 'منهجية البحث' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' && proposal?.['methodology_ar'] ? 'rtl' : 'ltr'}>
                    {language === 'ar' && proposal?.['methodology_ar'] ? proposal?.['methodology_ar'] : (proposal?.['methodology_en'] || t({ en: 'No methodology details provided', ar: 'لا توجد تفاصيل المنهجية' }))}
                  </p>
                </CardContent>
              </Card>

              {proposal?.['expected_outputs']?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Expected Outputs', ar: 'المخرجات المتوقعة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(proposal?.['expected_outputs'] || []).map((output, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{output?.['output'] || output}</p>
                            <Badge variant="outline" className="text-xs">{output?.['type'] || 'N/A'}</Badge>
                          </div>
                          {output?.['target_date'] && (
                            <p className="text-xs text-slate-500">{t({ en: 'Target', ar: 'الموعد المستهدف' })}: {output?.['target_date']}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {(proposal?.['impact_statement'] || proposal?.['innovation_claim']) && (
                <div className="grid grid-cols-2 gap-4">
                  {proposal?.['impact_statement'] && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t({ en: 'Impact Statement', ar: 'بيان التأثير' })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{proposal?.['impact_statement']}</p>
                      </CardContent>
                    </Card>
                  )}
                  {proposal?.['innovation_claim'] && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t({ en: 'Innovation Claim', ar: 'ادعاء الابتكار' })}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-700">{proposal?.['innovation_claim']}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Principal Investigator', ar: 'الباحث الرئيسي' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {proposal?.['principal_investigator']?.['name'] ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-bold text-blue-900">{proposal?.['principal_investigator']?.['name']}</p>
                      {proposal?.['principal_investigator']?.['title'] && (
                        <p className="text-sm text-slate-700 mt-1">{proposal?.['principal_investigator']?.['title']}</p>
                      )}
                      {proposal?.['principal_investigator']?.['email'] && (
                        <p className="text-sm text-blue-600 mt-1">{proposal?.['principal_investigator']?.['email']}</p>
                      )}
                      {(proposal?.['principal_investigator']?.['expertise'] || [])?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proposal?.['principal_investigator']?.['expertise']?.map((exp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      {typeof proposal?.['principal_investigator'] === 'string'
                        ? proposal?.['principal_investigator']
                        : t({ en: 'Not specified', ar: 'غير محدد' })}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {proposal?.['team_members'] && (proposal?.['team_members'] || [])?.length > 0 ? (
                    <div className="space-y-3">
                      {(proposal?.['team_members'] || [])?.map((member, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-lg border">
                          <p className="font-medium text-slate-900">{member?.['name'] || member}</p>
                          <p className="text-sm text-slate-600">{member?.['role'] || 'Team Member'}</p>
                          <p className="text-xs text-slate-500">{member?.['affiliation'] || 'Expert'}</p>
                          {(member?.['expertise'] || [])?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {member?.['expertise']?.map((exp, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{exp}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm text-center py-4">{t({ en: 'No team members listed', ar: 'لا يوجد أعضاء فريق' })}</p>
                  )}
                </CardContent>
              </Card>

              {proposal?.['partner_institutions'] && (proposal?.['partner_institutions'] || [])?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t({ en: 'Partner Institutions', ar: 'المؤسسات الشريكة' })}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(proposal?.['partner_institutions'] || []).map((partner, idx) => (
                        <div key={idx} className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">{partner?.['name'] || partner}</p>
                          <p className="text-xs text-slate-600">{partner?.['role'] || 'Partner'}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="evaluation">
              <div className="space-y-6">
                <RDProposalEscalationAutomation proposal={proposal} rdCall={rdCall} />
                <RDProposalAIScorerWidget proposal={proposal} />
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <RDProposalActivityLog proposalId={proposalId} />
            </TabsContent>

            {/* Discussion Tab */}
            <TabsContent value="discussion">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    {t({ en: 'Comments & Feedback', ar: 'التعليقات والملاحظات' })} ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg border ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-900">{c?.['user_name'] || c?.['user_email'] || c?.['created_by']}</span>
                            {c.is_internal && <Badge variant="outline" className="text-xs">{t({ en: 'Internal', ar: 'داخلي' })}</Badge>}
                            {c?.['comment_type'] && c?.['comment_type'] !== 'general' && (
                              <Badge className="text-xs">{c?.['comment_type']?.replace(/_/g, ' ')}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-700">{c.comment_text}</p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            {new Date(c?.['created_date'] || c?.['created_at']).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder={t({ en: 'Add a comment or question...', ar: 'أضف تعليقاً أو سؤالاً...' })}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={() => postComment({ rd_proposal_id: proposalId, comment_text: comment }, {
                        onSuccess: () => setComment('')
                      })}
                      className="bg-gradient-to-r from-blue-600 to-teal-600"
                      disabled={!comment || isAddingComment}
                    >
                      {isAddingComment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
                      {t({ en: 'Post Comment', ar: 'نشر تعليق' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Connections Tab */}
            <TabsContent value="connections">
              <CrossEntityRecommender
                sourceEntity={proposal}
                sourceType="RDProposal"
                recommendations={['rdcalls', 'rdprojects', 'challenges']}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(RDProposalDetail, { requiredPermissions: [] });