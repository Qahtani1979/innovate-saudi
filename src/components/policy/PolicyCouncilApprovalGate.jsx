import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, FileText, Presentation, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import RequesterAI from '../approval/RequesterAI';
import ReviewerAI from '../approval/ReviewerAI';
import { toast } from 'sonner';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

/**
 * PolicyCouncilApprovalGate
 * ✅ GOLD STANDARD COMPLIANT
 */
export default function PolicyCouncilApprovalGate({ policy, approvalRequest, currentUser }) {
  const { t, isRTL } = useLanguage();
  const [presentationNotes, setPresentationNotes] = useState(policy.council_presentation_notes || '');
  const [decisionComments, setDecisionComments] = useState('');

  const { updatePolicy, updatePolicyApproval } = usePolicyMutations();
  const { updateRequest } = useApprovalRequest();

  const handleCouncilDecision = async (decisionType) => {
    try {
      // 1. Update approval request status
      const status = decisionType === 'approved' ? 'approved' : decisionType === 'rejected' ? 'rejected' : 'conditional';
      await updateRequest.mutateAsync({
        id: approvalRequest.id,
        data: {
          status,
          decision: decisionType,
          decision_date: new Date().toISOString(),
          reviewer_email: currentUser.email,
          comments: decisionComments
        }
      });

      // 2. If approved, update policy workflow stage
      if (decisionType === 'approved') {
        await updatePolicyApproval.mutateAsync({
          id: policy.id,
          status: 'approve',
          comment: decisionComments
        });

        await updatePolicy.mutateAsync({
          id: policy.id,
          data: { workflow_stage: 'council_approved' }
        });
      }
    } catch (error) {
      // toast handled by mutation
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updatePolicy.mutateAsync({
        id: policy.id,
        data: { council_presentation_notes: presentationNotes }
      });
      toast.success(t({ en: 'Notes saved', ar: 'تم حفظ الملاحظات' }));
    } catch (e) { }
  };

  const isRequester = currentUser?.email === approvalRequest?.requester_email;
  const isReviewer = currentUser?.role === 'admin' || currentUser?.assigned_roles?.includes('council_member');

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Requester View */}
      {isRequester && (
        <>
          <RequesterAI
            entityType="policy_recommendation"
            entityData={policy}
            gateName="council_approval"
            gateConfig={{
              name: 'council_approval',
              label: { en: 'Council Approval', ar: 'موافقة المجلس' },
              type: 'approval',
              selfCheckItems: [
                { en: 'All documents prepared', ar: 'كل الوثائق جاهزة' },
                { en: 'Budget implications documented', ar: 'الآثار المالية موثقة' },
                { en: 'Public consultation completed', ar: 'الاستشارة العامة مكتملة' },
                { en: 'Presentation ready', ar: 'العرض التقديمي جاهز' }
              ]
            }}
            onSelfCheckUpdate={() => { }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-purple-600" />
                {t({ en: 'Council Presentation Preparation', ar: 'إعداد العرض للمجلس' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Presentation Notes & Key Points', ar: 'ملاحظات ونقاط رئيسية للعرض' })}
                </label>
                <Textarea
                  value={presentationNotes}
                  onChange={(e) => setPresentationNotes(e.target.value)}
                  placeholder={t({ en: 'Key points for council presentation...', ar: 'النقاط الرئيسية للعرض أمام المجلس...' })}
                  className="min-h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded border">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Budget Impact', ar: 'الأثر المالي' })}</p>
                  <p className="text-lg font-bold text-blue-900">
                    {policy.estimated_cost ? `${policy.estimated_cost.toLocaleString()} SAR` : t({ en: 'Not specified', ar: 'غير محدد' })}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded border">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Public Feedback', ar: 'التعليقات العامة' })}</p>
                  <p className="text-lg font-bold text-green-900">
                    {policy.public_feedback_count || 0} {t({ en: 'responses', ar: 'رد' })}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleSaveNotes}
                className="w-full"
                disabled={updatePolicy.isPending}
              >
                {updatePolicy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                {t({ en: 'Save Presentation Notes', ar: 'حفظ ملاحظات العرض' })}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reviewer View */}
      {isReviewer && approvalRequest && (
        <>
          <ReviewerAI
            entityType="policy_recommendation"
            entityData={policy}
            gateName="council_approval"
            gateConfig={{
              name: 'council_approval',
              label: { en: 'Council Approval', ar: 'موافقة المجلس' },
              type: 'approval',
              requiredRole: 'council_member',
              reviewerChecklistItems: [
                { en: 'Policy aligns with strategic goals', ar: 'السياسة متوافقة مع الأهداف' },
                { en: 'Budget reasonable', ar: 'الميزانية معقولة' },
                { en: 'Public support documented', ar: 'الدعم العام موثق' },
                { en: 'Implementation viable', ar: 'التنفيذ قابل للتطبيق' }
              ]
            }}
            approvalRequest={approvalRequest}
          />

          {approvalRequest.status !== 'approved' && approvalRequest.status !== 'rejected' && (
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle>{t({ en: 'Council Decision', ar: 'قرار المجلس' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t({ en: 'Council decision comments...', ar: 'تعليقات قرار المجلس...' })}
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
                  className="min-h-24"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCouncilDecision('approved')}
                    disabled={updatePolicyApproval.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {updatePolicyApproval.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    {t({ en: 'Approve', ar: 'موافقة' })}
                  </Button>
                  <Button
                    onClick={() => handleCouncilDecision('conditional')}
                    disabled={updateRequest.isPending}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t({ en: 'Conditional', ar: 'مشروط' })}
                  </Button>
                  <Button
                    onClick={() => handleCouncilDecision('rejected')}
                    disabled={updatePolicyApproval.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
