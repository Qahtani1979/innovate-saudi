
import { useIdea, useIdeaMutations } from '@/hooks/useCitizenIdeas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Lightbulb, ThumbsUp, MessageSquare, MapPin, User, Calendar,
  CheckCircle2, Sparkles, Network, AlertTriangle, Share2
} from 'lucide-react';
import CommentThread from '../components/citizen/CommentThread';
import SocialShare from '../components/citizen/SocialShare';
import MultiEvaluatorConsensus from '../components/citizen/MultiEvaluatorConsensus';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedWorkflowApprovalTab from '../components/approval/UnifiedWorkflowApprovalTab';
import CitizenIdeaWorkflowTab from '../components/citizen/CitizenIdeaWorkflowTab';

function IdeaDetail() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const ideaId = urlParams.get('id');

  const { data: idea, isLoading } = useIdea(ideaId);
  const { voteIdea } = useIdeaMutations();

  if (isLoading || !idea) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    converted_to_challenge: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700',
    duplicate: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="pt-8 pb-8">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-white/20 text-white border-white/40 capitalize">
                  {idea.category?.replace(/_/g, ' ')}
                </Badge>
                <Badge className={statusColors[idea.status]}>
                  {idea.status?.replace(/_/g, ' ')}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
              <div className="flex items-center gap-4 text-sm text-white/80">
                {idea.submitter_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {idea.submitter_name}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(idea.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                onClick={() => voteIdea.mutate({ id: ideaId, currentVotes: idea.votes_count })}
                disabled={voteIdea.isPending}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="text-lg font-bold">{idea.votes_count || 0}</span>
                <span>{t({ en: 'Votes', ar: 'أصوات' })}</span>
              </Button>
              <div className="flex items-center gap-2 text-slate-600">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">{idea.comment_count || 0}</span>
                <span className="text-sm">{t({ en: 'Comments', ar: 'تعليقات' })}</span>
              </div>
            </div>
            {idea.status === 'converted_to_challenge' && idea.converted_challenge_id && (
              <Link to={createPageUrl(`ChallengeDetail?id=${idea.converted_challenge_id}`)}>
                <Button variant="outline" className="gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t({ en: 'View Challenge', ar: 'عرض التحدي' })}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Description', ar: 'الوصف' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
            </CardContent>
          </Card>

          {idea.ai_classification && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {t({ en: 'AI Analysis', ar: 'التحليل الذكي' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-2">{t({ en: 'Suggested Category', ar: 'الفئة المقترحة' })}</p>
                  <Badge className="bg-purple-100 text-purple-700">
                    {idea.ai_classification.suggested_category}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-2">{t({ en: 'Priority Score', ar: 'نقاط الأولوية' })}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-600"
                        style={{ width: `${idea.ai_classification.priority_score || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{idea.ai_classification.priority_score || 0}/100</span>
                  </div>
                </div>
                {idea.ai_classification.is_duplicate && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <p className="text-sm font-medium text-amber-900">
                        {t({ en: 'Possible duplicate detected', ar: 'تم اكتشاف تكرار محتمل' })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {idea.attachment_urls && idea.attachment_urls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Attachments', ar: 'المرفقات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {idea.attachment_urls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Attachment ${idx + 1}`} className="w-full rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ en: 'Submission Details', ar: 'تفاصيل التقديم' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {idea.municipality_id && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Municipality', ar: 'البلدية' })}</p>
                  <p className="font-medium">{idea.municipality_id}</p>
                </div>
              )}
              {idea.submitter_name && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitted By', ar: 'قُدِّم من' })}</p>
                  <p className="font-medium">{idea.submitter_name}</p>
                </div>
              )}
              {idea.submitter_email && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Email', ar: 'البريد' })}</p>
                  <p className="font-medium text-xs">{idea.submitter_email}</p>
                </div>
              )}
              {idea.geolocation && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Location', ar: 'الموقع' })}</p>
                  <div className="flex items-center gap-1 text-blue-600">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">
                      {idea.geolocation.latitude?.toFixed(4)}, {idea.geolocation.longitude?.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Submitted', ar: 'تاريخ التقديم' })}</p>
                <p className="font-medium">{new Date(idea.created_at).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {idea.similar_ideas?.length > 0 && (
            <Card className="border-teal-200 bg-teal-50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="h-4 w-4 text-teal-700" />
                  {t({ en: 'Similar Ideas', ar: 'أفكار مشابهة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {idea.similar_ideas.slice(0, 3).map((simId, idx) => (
                    <Link
                      key={idx}
                      to={createPageUrl(`IdeaDetail?id=${simId}`)}
                      className="block p-2 bg-white rounded border border-teal-200 hover:border-teal-400 transition-colors"
                    >
                      <p className="text-sm text-teal-700">View similar idea #{idx + 1}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Workflow Status */}
      <CitizenIdeaWorkflowTab idea={idea} />

      {/* Unified Workflow & Approval */}
      <UnifiedWorkflowApprovalTab
        entityType="CitizenIdea"
        entityId={ideaId}
        currentStage={
          idea.status === 'submitted' ? 'screening' :
            idea.status === 'under_review' ? 'review' :
              idea.status === 'approved' ? 'approved' :
                idea.status === 'rejected' ? 'rejected' : 'screening'
        }
      />

      {/* Evaluations */}
      {idea.status !== 'submitted' && (
        <MultiEvaluatorConsensus ideaId={ideaId} />
      )}

      {/* Social Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            {t({ en: 'Share This Idea', ar: 'شارك هذه الفكرة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SocialShare idea={idea} />
        </CardContent>
      </Card>

      {/* Comments */}
      <CommentThread ideaId={ideaId} />
    </div>
  );
}

export default ProtectedPage(IdeaDetail, { requiredPermissions: [] });
