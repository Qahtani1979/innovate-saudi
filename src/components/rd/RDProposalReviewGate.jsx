import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Eye, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import StageSpecificEvaluationForm from '../evaluation/StageSpecificEvaluationForm';
import PermissionGate from '@/components/permissions/PermissionGate';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function RDProposalReviewGate({ proposal, onClose }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [showEvalForm, setShowEvalForm] = useState(false);
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  const { data: existingEvaluation } = useQuery({
    queryKey: ['proposal-evaluation', proposal.id],
    queryFn: async () => {
      const { data: evals } = await supabase.from('expert_evaluations').select('*')
        .eq('entity_type', 'rd_proposal')
        .eq('entity_id', proposal.id)
        .eq('expert_email', user?.email)
        .eq('evaluation_stage', 'review');
      return evals?.[0];
    },
    enabled: !!user
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      // Update proposal status
      await supabase.from('rd_proposals').update({
        status: reviewData.decision === 'approve' ? 'shortlisted' : 
                reviewData.decision === 'reject' ? 'rejected' : 'revisions_requested',
        review_notes: reviewData.notes,
        reviewed_by: user?.email,
        review_date: new Date().toISOString()
      }).eq('id', proposal.id);

      // Log activity
      await supabase.from('system_activities').insert({
        entity_type: 'RDProposal',
        entity_id: proposal.id,
        activity_type: 'status_changed',
        description: `Review completed: ${reviewData.decision}`,
        performed_by: user?.email,
        timestamp: new Date().toISOString(),
        metadata: { decision: reviewData.decision, notes: reviewData.notes }
      });
    },
    onSuccess: async (_, reviewData) => {
      queryClient.invalidateQueries(['rd-proposal']);
      
      // Trigger proposal.reviewed email
      try {
        await triggerEmail('proposal.reviewed', {
          entityType: 'rd_proposal',
          entityId: proposal.id,
          variables: {
            proposalTitle: proposal.title_en,
            decision: reviewData.decision,
            reviewerNotes: reviewData.notes,
            reviewerEmail: user?.email
          }
        });
      } catch (error) {
        console.error('Failed to send proposal.reviewed email:', error);
      }
      
      toast.success(t({ en: 'Review submitted', ar: 'تم تقديم المراجعة' }));
      onClose?.();
    }
  });

  const handleEvaluationSubmit = async (evaluationData) => {
    await supabase.from('expert_evaluations').insert(evaluationData);
    queryClient.invalidateQueries(['proposal-evaluation']);
    toast.success(t({ en: 'Evaluation saved', ar: 'تم حفظ التقييم' }));
    setShowEvalForm(false);
  };

  return (
    <PermissionGate 
      anyPermission={['rd_proposal_evaluate', 'rd_proposal_review', 'expert_evaluation']}
      fallback={
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-red-900">
              {t({ en: 'Access Denied', ar: 'الوصول مرفوض' })}
            </p>
            <p className="text-sm text-red-700">
              {t({ en: 'You need expert reviewer permissions to evaluate proposals.', ar: 'تحتاج صلاحيات المراجع الخبير لتقييم المقترحات.' })}
            </p>
          </CardContent>
        </Card>
      }
    >
      <div className="space-y-6">
        <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Eye className="h-5 w-5" />
              {t({ en: 'Review Gate: Expert Assessment', ar: 'بوابة المراجعة: التقييم الخبير' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showEvalForm ? (
              <>
                <div className="p-4 bg-yellow-100 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    {t({ en: 'Review Instructions:', ar: 'تعليمات المراجعة:' })}
                  </p>
                  <ol className="text-xs text-yellow-800 space-y-1 list-decimal list-inside">
                    <li>{t({ en: 'Complete the expert evaluation form below', ar: 'أكمل نموذج التقييم الخبير أدناه' })}</li>
                    <li>{t({ en: 'Review proposal against call criteria', ar: 'راجع المقترح مقابل معايير الدعوة' })}</li>
                    <li>{t({ en: 'Provide actionable feedback', ar: 'قدم ملاحظات قابلة للتنفيذ' })}</li>
                    <li>{t({ en: 'Make final recommendation', ar: 'قدم التوصية النهائية' })}</li>
                  </ol>
                </div>

                <Button
                  onClick={() => setShowEvalForm(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  {existingEvaluation ? (
                    <>{t({ en: 'Update Evaluation', ar: 'تحديث التقييم' })}</>
                  ) : (
                    <>{t({ en: 'Start Expert Evaluation', ar: 'بدء التقييم الخبير' })}</>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <StageSpecificEvaluationForm
                  entityType="rd_proposal"
                  entityId={proposal.id}
                  evaluationStage="review"
                  existingEvaluation={existingEvaluation}
                  onSubmit={handleEvaluationSubmit}
                />
                <Button variant="outline" onClick={() => setShowEvalForm(false)} className="w-full">
                  {t({ en: 'Cancel', ar: 'إلغاء' })}
                </Button>
              </div>
            )}

            {existingEvaluation && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="font-semibold text-green-900">
                    {t({ en: 'Evaluation Complete', ar: 'التقييم مكتمل' })}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{t({ en: 'Overall Score:', ar: 'الدرجة الكلية:' })}</span>
                  <span className="text-2xl font-bold text-green-600">{existingEvaluation.overall_score}</span>
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-600 text-white">
                    {existingEvaluation.recommendation.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGate>
  );
}