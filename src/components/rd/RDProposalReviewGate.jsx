import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Eye, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import StageSpecificEvaluationForm from '../evaluation/StageSpecificEvaluationForm';
import PermissionGate from '@/components/permissions/PermissionGate';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useRDProposalMutations } from '@/hooks/useRDProposalMutations';
import { useMyExpertEvaluation, useExpertEvaluationMutations } from '@/hooks/useExpertEvaluations';

export default function RDProposalReviewGate({ proposal, onClose }) {
  const { t } = useLanguage();
  const [showEvalForm, setShowEvalForm] = useState(false);
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();
  const { reviewProposal } = useRDProposalMutations();
  const { submitEvaluation } = useExpertEvaluationMutations();

  // Use the new hook for fetching the specific evaluation
  const { data: existingEvaluation } = useMyExpertEvaluation(
    'rd_proposal',
    proposal.id,
    user?.email,
    'review'
  );

  const handleEvaluationSubmit = async (evaluationData) => {
    try {
      await submitEvaluation.mutateAsync(evaluationData);
      toast.success(t({ en: 'Evaluation saved', ar: 'تم حفظ التقييم' }));
      setShowEvalForm(false);

    } catch (error) {
      toast.error(t({ en: 'Failed to save', ar: 'فشل الحفظ' }));
    }
  };

  return (
    <PermissionGate
      permissions={['rd_proposal_evaluate', 'rd_proposal_review', 'expert_evaluation']}
      anyPermission={true}
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
                  <span className="text-2xl font-bold text-green-600">{existingEvaluation?.overall_score}</span>
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-600 text-white">
                    {existingEvaluation?.recommendation?.replace(/_/g, ' ')}
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
