import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Shield, AlertTriangle, TrendingUp, Network } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import RequesterAI from '../approval/RequesterAI';
import ReviewerAI from '../approval/ReviewerAI';
import { toast } from 'sonner';
import { useMunicipalities } from '@/hooks/useMunicipalities';
import { useApprovalMutations } from '@/hooks/useApprovalRequest';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';

export default function PolicyMinistryApprovalGate({ policy, approvalRequest, currentUser }) {
  const { t, isRTL } = useLanguage();
  const [decisionComments, setDecisionComments] = useState('');
  const [scalingNotes, setScalingNotes] = useState(policy.scaling_potential_notes || '');

  const { data: municipalities = [] } = useMunicipalities();
  const { updatePolicy } = usePolicyMutations();
  const { updateApproval } = useApprovalMutations();

  const handleMinistryDecision = async (decisionType) => {
    await updateApproval.mutateAsync({
      id: approvalRequest.id,
      data: {
        status: decisionType === 'approved' ? 'approved' : decisionType === 'rejected' ? 'rejected' : 'conditional',
        decision: decisionType,
        decision_date: new Date().toISOString(),
        reviewer_email: currentUser.email,
        comments: decisionComments
      }
    });

    if (decisionType === 'approved') {
      await updatePolicy.mutateAsync({
        id: policy.id,
        data: {
          workflow_stage: 'ministry_approved',
          status: 'approved',
          approval_date: new Date().toISOString()
        }
      });
    }
  };

  const isRequester = currentUser?.email === approvalRequest?.requester_email;
  const isReviewer = currentUser?.role === 'admin' || currentUser?.assigned_roles?.includes('ministry_representative');

  const scalingPotential = municipalities.length > 1 ? Math.round((municipalities.length - 1) * 0.7) : 0;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Requester View */}
      {isRequester && (
        <>
          <RequesterAI
            entityType="policy_recommendation"
            entityData={policy}
            gateName="ministry_approval"
            gateConfig={{
              name: 'ministry_approval',
              label: { en: 'Ministry Approval', ar: 'موافقة الوزارة' },
              type: 'approval',
              selfCheckItems: [
                { en: 'Council approval obtained', ar: 'موافقة المجلس حاصلة' },
                { en: 'National alignment verified', ar: 'التوافق الوطني محقق' },
                { en: 'Inter-municipal impact assessed', ar: 'الأثر بين البلديات مقيّم' },
                { en: 'Final documentation complete', ar: 'التوثيق النهائي مكتمل' }
              ]
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-indigo-600" />
                {t({ en: 'National Impact & Scaling Assessment', ar: 'تقييم الأثر الوطني والتوسع' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-indigo-50 rounded border text-center">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Potential Reach', ar: 'الوصول المحتمل' })}</p>
                  <p className="text-2xl font-bold text-indigo-900">{scalingPotential}</p>
                  <p className="text-xs text-slate-500">{t({ en: 'municipalities', ar: 'بلدية' })}</p>
                </div>
                <div className="p-3 bg-green-50 rounded border text-center">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Council Status', ar: 'حالة المجلس' })}</p>
                  <Badge className="bg-green-600 text-white">
                    {t({ en: 'Approved', ar: 'موافق عليه' })}
                  </Badge>
                </div>
                <div className="p-3 bg-blue-50 rounded border text-center">
                  <p className="text-xs text-slate-600 mb-1">{t({ en: 'Public Support', ar: 'الدعم العام' })}</p>
                  <p className="text-2xl font-bold text-blue-900">{policy.public_feedback_count || 0}</p>
                  <p className="text-xs text-slate-500">{t({ en: 'responses', ar: 'رد' })}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  {t({ en: 'Scaling & National Alignment Notes', ar: 'ملاحظات التوسع والتوافق الوطني' })}
                </label>
                <Textarea
                  value={scalingNotes}
                  onChange={(e) => setScalingNotes(e.target.value)}
                  placeholder={t({ en: 'How this policy could scale to other municipalities...', ar: 'كيف يمكن توسيع هذه السياسة لبلديات أخرى...' })}
                  className="min-h-32"
                />
              </div>

              <Button
                onClick={() => updatePolicy.mutate({
                  id: policy.id,
                  data: { scaling_potential_notes: scalingNotes }
                })}
                className="w-full"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {t({ en: 'Save Scaling Assessment', ar: 'حفظ تقييم التوسع' })}
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
            gateName="ministry_approval"
            gateConfig={{
              name: 'ministry_approval',
              label: { en: 'Ministry Approval', ar: 'موافقة الوزارة' },
              type: 'approval',
              requiredRole: 'ministry_representative',
              reviewerChecklistItems: [
                { en: 'National policy alignment', ar: 'التوافق مع السياسة الوطنية' },
                { en: 'No inter-ministry conflicts', ar: 'لا توجد تعارضات بين الوزارات' },
                { en: 'Scalability to other municipalities', ar: 'قابلية التوسع لبلديات أخرى' },
                { en: 'Final approval justified', ar: 'الموافقة النهائية مبررة' }
              ]
            }}
            approvalRequest={approvalRequest}
          />

          {approvalRequest.status !== 'approved' && approvalRequest.status !== 'rejected' && (
            <Card className="border-2 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  {t({ en: 'Ministry Final Decision', ar: 'القرار النهائي للوزارة' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-amber-50 rounded border">
                  <p className="text-xs font-semibold text-amber-900 mb-2">
                    {t({ en: '⚠️ This is the final approval gate', ar: '⚠️ هذه بوابة الموافقة النهائية' })}
                  </p>
                  <p className="text-xs text-slate-700">
                    {t({
                      en: 'Once approved, the policy will be marked as officially approved and ready for implementation nationwide.',
                      ar: 'بمجرد الموافقة، ستكون السياسة معتمدة رسميًا وجاهزة للتنفيذ على المستوى الوطني.'
                    })}
                  </p>
                </div>

                <Textarea
                  placeholder={t({ en: 'Ministry decision rationale...', ar: 'مبررات قرار الوزارة...' })}
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
                  className="min-h-24"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleMinistryDecision('approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Approve', ar: 'موافقة' })}
                  </Button>
                  <Button
                    onClick={() => handleMinistryDecision('conditional')}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {t({ en: 'Conditional', ar: 'مشروط' })}
                  </Button>
                  <Button
                    onClick={() => handleMinistryDecision('rejected')}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {(approvalRequest.status === 'approved' || approvalRequest.status === 'rejected') && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-900">
                      {t({ en: 'Decision Recorded', ar: 'القرار مسجل' })}
                    </p>
                    <p className="text-xs text-slate-600">
                      {approvalRequest.reviewer_email} • {new Date(approvalRequest.decision_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge className={approvalRequest.decision === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
                  {approvalRequest.decision}
                </Badge>
                <p className="text-sm text-slate-700 mt-3">{approvalRequest.comments}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}