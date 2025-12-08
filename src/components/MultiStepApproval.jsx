import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, ArrowRight, User } from 'lucide-react';
import { toast } from 'sonner';
import { createNotification } from './AutoNotification';
import { useLanguage } from './LanguageContext';

const APPROVAL_WORKFLOWS = {
  Challenge: [
    { step: 1, role: 'municipality_lead', label: 'Municipality Lead', label_ar: 'قائد البلدية' },
    { step: 2, role: 'sector_expert', label: 'Sector Expert', label_ar: 'خبير القطاع' },
    { step: 3, role: 'gdisb_admin', label: 'GDISB Admin', label_ar: 'مسؤول المنصة' }
  ],
  Pilot: [
    { step: 1, role: 'technical_lead', label: 'Technical Lead', label_ar: 'القائد التقني' },
    { step: 2, role: 'budget_officer', label: 'Budget Officer', label_ar: 'مسؤول الميزانية' },
    { step: 3, role: 'municipality_director', label: 'Director', label_ar: 'المدير' },
    { step: 4, role: 'gdisb_admin', label: 'GDISB Final Approval', label_ar: 'الموافقة النهائية' }
  ],
  Program: [
    { step: 1, role: 'program_manager', label: 'Program Manager', label_ar: 'مدير البرنامج' },
    { step: 2, role: 'gdisb_admin', label: 'GDISB Admin', label_ar: 'مسؤول المنصة' }
  ]
};

export default function MultiStepApproval({ entity, entityType, currentUser }) {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();
  const { language, isRTL, t } = useLanguage();

  const workflow = APPROVAL_WORKFLOWS[entityType] || [];
  const approvals = entity.approvals || [];

  const currentStep = approvals.length > 0 
    ? Math.max(...approvals.map(a => a.step)) + 1 
    : 1;

  const currentStepConfig = workflow.find(s => s.step === currentStep);
  const canApprove = currentStepConfig && currentUser?.role === currentStepConfig.role;

  const approveMutation = useMutation({
    mutationFn: async ({ decision, comment }) => {
      const approval = {
        entity_type: entityType.toLowerCase(),
        entity_id: entity.id,
        step: currentStep,
        approver_role: currentStepConfig.role,
        approver_name: currentUser.full_name,
        decision,
        comments: comment,
        approved_date: new Date().toISOString()
      };

      await base44.entities.PilotApproval.create(approval);

      // Notify next approver
      if (decision === 'approved' && currentStep < workflow.length) {
        const nextStep = workflow.find(s => s.step === currentStep + 1);
        await createNotification({
          title: `${entityType} Approval Required`,
          body: `${entity.code || entity.title_en} requires your approval`,
          type: 'approval',
          priority: 'high',
          linkUrl: `${entityType}Detail?id=${entity.id}`,
          entityType: entityType.toLowerCase(),
          entityId: entity.id
        });
      }

      // If final approval, update entity status
      if (decision === 'approved' && currentStep === workflow.length) {
        await base44.entities[entityType].update(entity.id, { status: 'approved' });
        await createNotification({
          title: `${entityType} Fully Approved`,
          body: `${entity.code || entity.title_en} has completed all approval steps`,
          type: 'alert',
          priority: 'medium',
          linkUrl: `${entityType}Detail?id=${entity.id}`,
          entityType: entityType.toLowerCase(),
          entityId: entity.id
        });
      }

      // If rejected, update status
      if (decision === 'rejected') {
        await base44.entities[entityType].update(entity.id, { status: 'rejected' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot-approvals']);
      queryClient.invalidateQueries([entityType.toLowerCase()]);
      setComment('');
      toast.success('Decision recorded');
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'Multi-Step Approval Workflow', ar: 'سير عمل الموافقات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {workflow.map((step, idx) => {
            const approval = approvals.find(a => a.step === step.step);
            const isCompleted = !!approval;
            const isCurrent = step.step === currentStep;
            
            return (
              <React.Fragment key={step.step}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted 
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
        {canApprove && currentStep <= workflow.length && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-slate-900">{t({ en: 'Your Decision Required:', ar: 'قرارك مطلوب:' })}</p>
            <Textarea
              placeholder={t({ en: 'Add comments (optional)', ar: 'إضافة تعليقات (اختياري)' })}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => approveMutation.mutate({ decision: 'approved', comment })}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Approve', ar: 'موافقة' })}
              </Button>
              <Button
                onClick={() => approveMutation.mutate({ decision: 'rejected', comment })}
                disabled={approveMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Reject', ar: 'رفض' })}
              </Button>
            </div>
          </div>
        )}

        {!canApprove && currentStep <= workflow.length && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-900">
            ⏳ {t({ en: 'Waiting for approval from:', ar: 'في انتظار موافقة:' })} <strong>{language === 'ar' ? currentStepConfig?.label_ar : currentStepConfig?.label}</strong>
          </div>
        )}

        {currentStep > workflow.length && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-900">
            ✅ {t({ en: 'All approval steps completed', ar: 'تمت جميع خطوات الموافقة' })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}