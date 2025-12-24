import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { DollarSign, CheckCircle2, XCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePilotMutations } from '@/hooks/usePilotMutations';

function BudgetApprovalWorkflow({ pilot, phase, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [adjustedAmount, setAdjustedAmount] = useState('');
  const { user } = useAuth();

  const { processBudgetApproval } = usePilotMutations();

  const phases = {
    initial: { amount: pilot.budget, label: { en: 'Initial Budget', ar: 'الميزانية الأولية' } },
    phase_1: { amount: pilot.budget * 0.3, label: { en: 'Phase 1 (30%)', ar: 'المرحلة 1 (30%)' } },
    phase_2: { amount: pilot.budget * 0.4, label: { en: 'Phase 2 (40%)', ar: 'المرحلة 2 (40%)' } },
    phase_3: { amount: pilot.budget * 0.3, label: { en: 'Phase 3 (30%)', ar: 'المرحلة 3 (30%)' } },
    additional: { amount: 0, label: { en: 'Additional Budget', ar: 'ميزانية إضافية' } }
  };

  const currentPhase = phases[phase] || phases.initial;

  const handleDecision = (approved) => {
    const amount = adjustedAmount ? parseFloat(adjustedAmount) : currentPhase.amount;

    processBudgetApproval.mutate({
      pilot,
      phase,
      amount,
      approved,
      comments
    }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  const budgetUtilization = pilot.budget_released
    ? ((pilot.budget_released / pilot.budget) * 100).toFixed(1)
    : 0;

  return (
    <Card className="border-2 border-green-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {t({ en: 'Budget Approval', ar: 'الموافقة على الميزانية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm font-medium text-green-900 mb-3">
            {currentPhase.label[language]}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-green-700 mb-1">{t({ en: 'Total Budget', ar: 'الميزانية الإجمالية' })}</p>
              <p className="text-lg font-bold text-green-900">
                {(pilot.budget || 0).toLocaleString()} SAR
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 mb-1">{t({ en: 'Released', ar: 'المصروف' })}</p>
              <p className="text-lg font-bold text-blue-900">
                {(pilot.budget_released || 0).toLocaleString()} SAR
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 mb-1">{t({ en: 'Utilization', ar: 'نسبة الاستخدام' })}</p>
              <p className="text-lg font-bold text-purple-900">{budgetUtilization}%</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-900">{t({ en: 'Request Amount', ar: 'المبلغ المطلوب' })}</p>
            <p className="text-2xl font-bold text-green-600">
              {currentPhase.amount.toLocaleString()} SAR
            </p>
          </div>

          {pilot.budget_breakdown && (
            <div className="space-y-2 mt-4">
              <p className="text-xs text-slate-500 mb-2">{t({ en: 'Budget Breakdown', ar: 'تفصيل الميزانية' })}</p>
              {pilot.budget_breakdown.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{item.category}</span>
                  <span className="font-medium">{(item.amount || 0).toLocaleString()} SAR</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Adjusted Amount (optional)', ar: 'المبلغ المعدل (اختياري)' })}
          </label>
          <Input
            type="number"
            placeholder={currentPhase.amount.toString()}
            value={adjustedAmount}
            onChange={(e) => setAdjustedAmount(e.target.value)}
          />
          {adjustedAmount && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              {parseFloat(adjustedAmount) > currentPhase.amount ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">
                    +{((parseFloat(adjustedAmount) - currentPhase.amount) / currentPhase.amount * 100).toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    {((parseFloat(adjustedAmount) - currentPhase.amount) / currentPhase.amount * 100).toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Approval Comments', ar: 'تعليقات الموافقة' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Add your review comments...', ar: 'أضف تعليقات المراجعة...' })}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </div>

        {pilot.budget_approvals && pilot.budget_approvals.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-slate-900 mb-2">
              {t({ en: 'Previous Approvals', ar: 'الموافقات السابقة' })}
            </p>
            <div className="space-y-2">
              {pilot.budget_approvals.slice(-3).map((approval, i) => (
                <div key={i} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium">{approval.phase}</span>
                    <span className="text-slate-500 ml-2">{approval.amount?.toLocaleString()} SAR</span>
                  </div>
                  <Badge className={approval.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {approval.approved ? t({ en: 'Approved', ar: 'موافق' }) : t({ en: 'Rejected', ar: 'مرفوض' })}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => handleDecision(false)}
            disabled={processBudgetApproval.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {processBudgetApproval.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Reject', ar: 'رفض' })}
          </Button>
          <Button
            onClick={() => handleDecision(true)}
            disabled={processBudgetApproval.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {processBudgetApproval.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default BudgetApprovalWorkflow;