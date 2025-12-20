import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { 
  FileText, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2,
  ArrowLeft,
  Calendar,
  DollarSign,
  Target,
  CheckCircle2
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ChallengeProposalDetail() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: async () => {
      const proposals = await base44.entities.ChallengeProposal.list();
      const found = proposals.find(p => p.id === proposalId);
      if (found) setFormData(found);
      return found;
    },
    enabled: !!proposalId
  });

  const { data: challenge } = useQuery({
    queryKey: ['challenge', proposal?.challenge_id],
    queryFn: async () => {
      if (!proposal?.challenge_id) return null;
      const challenges = await base44.entities.Challenge.list();
      return challenges.find(c => c.id === proposal.challenge_id);
    },
    enabled: !!proposal?.challenge_id
  });

  const { data: solution } = useQuery({
    queryKey: ['solution', proposal?.solution_id],
    queryFn: async () => {
      if (!proposal?.solution_id) return null;
      const solutions = await base44.entities.Solution.list();
      return solutions.find(s => s.id === proposal.solution_id);
    },
    enabled: !!proposal?.solution_id
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ChallengeProposal.update(proposalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['proposal']);
      queryClient.invalidateQueries(['challenge-proposals']);
      setIsEditing(false);
      toast.success(t({ en: 'Proposal updated', ar: 'تم تحديث المقترح' }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.ChallengeProposal.delete(proposalId),
    onSuccess: () => {
      toast.success(t({ en: 'Proposal deleted', ar: 'تم حذف المقترح' }));
      window.location.href = createPageUrl(`ChallengeDetail?id=${proposal.challenge_id}`);
    }
  });

  if (isLoading || !proposal) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    shortlisted: 'bg-purple-100 text-purple-700',
    selected: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`ChallengeDetail?id=${proposal.challenge_id}`)}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back to Challenge', ar: 'العودة للتحدي' })}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Proposal Details', ar: 'تفاصيل المقترح' })}
          </h1>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm(t({ en: 'Delete this proposal?', ar: 'حذف هذا المقترح؟' }))) {
                    deleteMutation.mutate();
                  }
                }}
                className="gap-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {t({ en: 'Delete', ar: 'حذف' })}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => updateMutation.mutate(formData)} disabled={updateMutation.isPending} className="gap-2">
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t({ en: 'Save', ar: 'حفظ' })}
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(proposal); }}>
                <X className="h-4 w-4 mr-2" />
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge className={`${statusColors[proposal.status]} text-sm px-3 py-1`}>
          {proposal.status?.replace(/_/g, ' ')}
        </Badge>
        {proposal.ai_screening_score && (
          <Badge className="bg-purple-100 text-purple-700">
            AI Score: {proposal.ai_screening_score}
          </Badge>
        )}
      </div>

      {/* Challenge Context */}
      {challenge && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold text-blue-900">{t({ en: 'Responding to Challenge', ar: 'الرد على التحدي' })}</p>
            </div>
            <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="hover:underline">
              <p className="text-sm font-medium text-blue-700">{challenge.code}: {challenge.title_en}</p>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Proposal Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Proposal Information', ar: 'معلومات المقترح' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label>{t({ en: 'Proposal Title', ar: 'عنوان المقترح' })}</Label>
                <Input
                  value={formData.proposal_title || ''}
                  onChange={(e) => setFormData({...formData, proposal_title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Approach Summary', ar: 'ملخص النهج' })}</Label>
                <Textarea
                  value={formData.approach_summary || ''}
                  onChange={(e) => setFormData({...formData, approach_summary: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Detailed Proposal', ar: 'المقترح التفصيلي' })}</Label>
                <Textarea
                  value={formData.detailed_proposal || ''}
                  onChange={(e) => setFormData({...formData, detailed_proposal: e.target.value})}
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Timeline (weeks)', ar: 'الجدول (أسابيع)' })}</Label>
                  <Input
                    type="number"
                    value={formData.timeline_weeks || ''}
                    onChange={(e) => setFormData({...formData, timeline_weeks: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Estimated Cost (SAR)', ar: 'التكلفة المقدرة (ريال)' })}</Label>
                  <Input
                    type="number"
                    value={formData.estimated_cost || ''}
                    onChange={(e) => setFormData({...formData, estimated_cost: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-2">{proposal.proposal_title}</p>
                <p className="text-sm text-slate-700">{proposal.approach_summary}</p>
              </div>
              {proposal.detailed_proposal && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-700 mb-2">{t({ en: 'Detailed Proposal', ar: 'المقترح التفصيلي' })}</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{proposal.detailed_proposal}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                    <p className="font-bold text-blue-700">{proposal.timeline_weeks} {t({ en: 'weeks', ar: 'أسابيع' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-slate-600">{t({ en: 'Cost', ar: 'التكلفة' })}</p>
                    <p className="font-bold text-green-700">{(proposal.estimated_cost / 1000).toFixed(0)}K SAR</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Deliverables */}
      {proposal.deliverables && proposal.deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              {t({ en: 'Deliverables', ar: 'المخرجات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proposal.deliverables.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-slate-700">{d}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Metrics */}
      {proposal.success_metrics && proposal.success_metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proposal.success_metrics.map((m, i) => (
                <div key={i} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-slate-700">{m}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Solution */}
      {solution && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Linked Solution', ar: 'الحل المرتبط' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="hover:underline">
              <p className="text-sm font-medium text-yellow-900">{solution.name_en}</p>
              <p className="text-xs text-yellow-700">{solution.provider_name}</p>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Submission Details', ar: 'تفاصيل التقديم' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-500">{t({ en: 'Submitted by', ar: 'قدم بواسطة' })}</p>
            <p className="font-medium">{proposal.proposer_email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{t({ en: 'Submission Date', ar: 'تاريخ التقديم' })}</p>
            <p className="font-medium">{new Date(proposal.created_date).toLocaleString()}</p>
          </div>
          {proposal.updated_date && (
            <div>
              <p className="text-xs text-slate-500">{t({ en: 'Last Updated', ar: 'آخر تحديث' })}</p>
              <p className="font-medium">{new Date(proposal.updated_date).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ChallengeProposalDetail, { requiredPermissions: [] });