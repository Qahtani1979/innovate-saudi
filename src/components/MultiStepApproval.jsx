import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, ArrowRight, User, Loader2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useApprovalWorkflow } from '@/hooks/useGovernance';

export default function MultiStepApproval({ entity, entityType }) {
  const [comment, setComment] = useState('');
  const { language, isRTL, t } = useLanguage();

  // High-level "Gold Standard" hook
  const {
    approvals,
    isLoading: approvalsLoading,
    workflow,
    currentStep,
    currentStepConfig,
    canApprove,
    isWorkflowCompleted,
    submitApprovalDecision,
    currentUser
  } = useApprovalWorkflow(entity.id, entityType);

  const handleDecision = (decision) => {
    if (!currentStepConfig) return;

    submitApprovalDecision.mutate({
      entity,
      entityType,
      step: currentStep,
      approverRole: currentStepConfig.role,
      approverName: currentUser?.full_name || currentUser?.email || 'System User',
      decision,
      comments: comment
    }, {
      onSuccess: () => {
        setComment('');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Multi-Step Approval Workflow', ar: 'سير عمل الموافقات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvalsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {workflow.map((step, idx) => {
                // Find matching approval by step sequence
                const approval = approvals[idx];
                const isCompleted = !!approval;
                const isCurrent = step.step === currentStep;

                return (
                  <React.Fragment key={step.step}>
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted
                        ? approval.decision === 'approved'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                        : isCurrent
                          ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200'
                          : 'bg-slate-100 text-slate-400'
                        }`}>
                        {isCompleted ? (
                          approval.decision === 'approved' ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <XCircle className="h-6 w-6" />
                          )
                        ) : isCurrent ? (
                          <Clock className="h-6 w-6 animate-pulse" />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-slate-900">{language === 'ar' ? step.label_ar : step.label}</p>
                      </div>
                      {approval && (
                        <Badge variant="outline" className="text-xs">
                          {approval.approver_name}
                        </Badge>
                      )}
                    </div>
                    {idx < workflow.length - 1 && (
                      <ArrowRight className={`h-4 w-4 ${isCompleted ? 'text-green-600' : 'text-slate-300'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Approval History */}
            {approvals.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium text-slate-700">{t({ en: 'Approval History:', ar: 'سجل الموافقات:' })}</p>
                {approvals.map((approval, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{approval.approver_name}</span>
                      <Badge className={approval.decision === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {approval.decision}
                      </Badge>
                    </div>
                    {approval.comments && (
                      <p className="text-slate-600 mt-1">{approval.comments}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(approval.approved_date).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Action Panel */}
            {canApprove && !isWorkflowCompleted && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-slate-900">{t({ en: 'Your Decision Required:', ar: 'قرارك مطلوب:' })}</p>
                <Textarea
                  placeholder={t({ en: 'Add comments (optional)', ar: 'إضافة تعليقات (اختياري)' })}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  disabled={submitApprovalDecision.isPending}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDecision('approved')}
                    disabled={submitApprovalDecision.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {submitApprovalDecision.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    )}
                    {t({ en: 'Approve', ar: 'موافقة' })}
                  </Button>
                  <Button
                    onClick={() => handleDecision('rejected')}
                    disabled={submitApprovalDecision.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    {submitApprovalDecision.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    )}
                    {t({ en: 'Reject', ar: 'رفض' })}
                  </Button>
                </div>
              </div>
            )}

            {!canApprove && !isWorkflowCompleted && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-900">
                ⏳ {t({ en: 'Waiting for approval from:', ar: 'في انتظار موافقة:' })} <strong>{language === 'ar' ? currentStepConfig?.label_ar : currentStepConfig?.label}</strong>
              </div>
            )}

            {isWorkflowCompleted && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-900">
                ✅ {t({ en: 'All approval steps completed', ar: 'تمت جميع خطوات الموافقة' })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}