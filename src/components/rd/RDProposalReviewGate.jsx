import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Eye, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import StageSpecificEvaluationForm from '../evaluation/StageSpecificEvaluationForm';

export default function RDProposalReviewGate({ proposal, onClose }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [showEvalForm, setShowEvalForm] = useState(false);

  const { data: existingEvaluation } = useQuery({
    queryKey: ['proposal-evaluation', proposal.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      const evals = await base44.entities.ExpertEvaluation.list();
      return evals.find(e => 
        e.entity_type === 'rd_proposal' && 
        e.entity_id === proposal.id &&
        e.expert_email === user.email &&
        e.evaluation_stage === 'review'
      );
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      const user = await base44.auth.me();
      
      // Update proposal status
      await base44.entities.RDProposal.update(proposal.id, {
        status: reviewData.decision === 'approve' ? 'shortlisted' : 
                reviewData.decision === 'reject' ? 'rejected' : 'revisions_requested',
        review_notes: reviewData.notes,
        reviewed_by: user.email,
        review_date: new Date().toISOString()
      });

      // Log activity
      await base44.entities.SystemActivity.create({
        entity_type: 'RDProposal',
        entity_id: proposal.id,
        activity_type: 'status_changed',
        description: `Review completed: ${reviewData.decision}`,
        performed_by: user.email,
        timestamp: new Date().toISOString(),
        metadata: { decision: reviewData.decision, notes: reviewData.notes }
      });

      // Notify PI
      if (proposal.principal_investigator?.email) {
        await base44.integrations.Core.SendEmail({
          to: proposal.principal_investigator.email,
          subject: `R&D Proposal Review Decision: ${proposal.title_en}`,
          body: `Your proposal "${proposal.title_en}" has been reviewed.\n\nDecision: ${reviewData.decision}\n\nNotes:\n${reviewData.notes}`
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-proposal']);
      toast.success(t({ en: 'Review submitted', ar: 'تم تقديم المراجعة' }));
      onClose?.();
    }
  });

  const handleEvaluationSubmit = async (evaluationData) => {
    await base44.entities.ExpertEvaluation.create(evaluationData);
    queryClient.invalidateQueries(['proposal-evaluation']);
    toast.success(t({ en: 'Evaluation saved', ar: 'تم حفظ التقييم' }));
    setShowEvalForm(false);
  };

  return (
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
  );
}