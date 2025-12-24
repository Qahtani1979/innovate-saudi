import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Users, Loader2, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildReviewerAssignmentPrompt, REVIEWER_ASSIGNMENT_SCHEMA } from '@/lib/ai/prompts/rd';

export default function ReviewerAutoAssignment({ rdCall, onClose }) {
  const { t, isRTL } = useLanguage();
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();
  const [assignments, setAssignments] = useState(null);
  const queryClient = useQueryClient();

  const { data: proposals = [] } = useQuery({
    queryKey: ['proposals-for-call', rdCall?.id],
    queryFn: async () => {
      const all = await base44.entities.RDProposal.list();
      return all.filter(p => p.rd_call_id === rdCall?.id && p.status === 'under_review');
    },
    enabled: !!rdCall?.id
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const updateMutation = useMutation({
    mutationFn: async (assignmentData) => {
      const updates = assignmentData.map(({ proposalId, reviewers }) =>
        base44.entities.RDProposal.update(proposalId, { 
          review_assigned_to: reviewers[0],
          reviewer_assignments: reviewers 
        })
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals-for-call']);
      toast.success(t({ en: 'Reviewers assigned successfully', ar: 'تم تعيين المراجعين بنجاح' }));
      onClose();
    }
  });

  const handleAutoAssign = async () => {
    if (!isAvailable) return;
    
    const prompt = buildReviewerAssignmentPrompt({ rdCall, users, proposals });

    const result = await invokeAI({
      prompt,
      response_json_schema: REVIEWER_ASSIGNMENT_SCHEMA
    });

    if (result.success && result.data) {
      const mappedAssignments = result.data.assignments.map(a => {
        const proposal = proposals.find(p => p.code === a.proposal_code || p.title_en === a.proposal_title);
        return {
          proposalId: proposal?.id,
          proposalTitle: a.proposal_title,
          reviewers: a.assigned_reviewers,
          reasoning: a.reasoning
        };
      }).filter(a => a.proposalId);

      setAssignments({ assignments: mappedAssignments, workload: result.data.workload_balance });
      toast.success(t({ en: 'AI assignments generated', ar: 'تم إنشاء التعيينات الذكية' }));
    }
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Reviewer Auto-Assignment', ar: 'التعيين التلقائي للمراجعين بالذكاء الاصطناعي' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-700">
            {t({
              en: `AI will analyze ${proposals.length} proposals and assign them to available reviewers based on expertise, workload balance, and conflict of interest rules.`,
              ar: `سيقوم الذكاء الاصطناعي بتحليل ${proposals.length} مقترحات وتعيينها للمراجعين المتاحين بناءً على الخبرة وتوازن العمل وقواعد تضارب المصالح.`
            })}
          </p>
        </div>

        {!assignments ? (
          <Button
            onClick={handleAutoAssign}
            disabled={loading || proposals.length === 0 || !isAvailable}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t({ en: 'Analyzing proposals...', ar: 'جاري تحليل المقترحات...' })}
              </>
            ) : (
              <>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Generate AI Assignments', ar: 'إنشاء تعيينات ذكية' })}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900">
                {t({ en: 'Proposed Assignments', ar: 'التعيينات المقترحة' })}
              </h4>
              <Button variant="outline" size="sm" onClick={handleAutoAssign}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t({ en: 'Regenerate', ar: 'إعادة إنشاء' })}
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignments.assignments.map((assignment, i) => (
                <div key={i} className="p-4 border rounded-lg bg-white">
                  <p className="font-medium text-sm text-slate-900 mb-2">{assignment.proposalTitle}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {assignment.reviewers.map((reviewer, j) => (
                      <Badge key={j} className="bg-purple-100 text-purple-700 text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {reviewer}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic">{assignment.reasoning}</p>
                </div>
              ))}
            </div>

            {assignments.workload && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  {t({ en: 'Workload Balance', ar: 'توازن العمل' })}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(assignments.workload).map(([reviewer, count]) => (
                    <div key={reviewer} className="flex justify-between">
                      <span>{reviewer}:</span>
                      <span className="font-medium">{count} proposals</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => updateMutation.mutate(assignments.assignments)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Confirm & Assign', ar: 'تأكيد وتعيين' })}
              </Button>
              <Button variant="outline" onClick={() => setAssignments(null)}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}