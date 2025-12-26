import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useBudgetAllocationApproval } from '@/hooks/useBudgetGates';

export default function BudgetAllocationApprovalGate({ allocation, onApprove, onReject, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState('');


  const { approvalMutation } = useBudgetAllocationApproval();

  // Wrap mutation call to match expected signature if needed, or update call sites.
  // The hook's mutation expects { allocation, decision, comments }
  const handleDecision = (decisionType) => {
    setDecision(decisionType);
    approvalMutation.mutate({ allocation, decision: decisionType, comments }, {
      onSuccess: () => {
        if (decisionType === 'approve') onApprove?.({ comments });
        else onReject?.({ comments });
      }
    });
  };

  const categories = [
    { id: 'pilots', name_en: 'Pilot Programs', color: '#3b82f6' },
    { id: 'rd', name_en: 'R&D Initiatives', color: '#8b5cf6' },
    { id: 'programs', name_en: 'Capacity Programs', color: '#10b981' },
    { id: 'infrastructure', name_en: 'Infrastructure', color: '#f59e0b' },
    { id: 'scaling', name_en: 'Scaling Operations', color: '#06b6d4' },
    { id: 'operations', name_en: 'Platform Operations', color: '#ec4899' }
  ];

  const pieData = categories.map(cat => ({
    name: cat.name_en,
    value: allocation?.[cat.id] || 0,
    color: cat.color
  })).filter(d => d.value > 0);

  const totalBudget = 50000000;
  const allocationValues = allocation || {};
  const validationChecks = [
    { check: 'Total = 100%', passed: Object.values(allocationValues).reduce((a, b) => a + (Number(b) || 0), 0) === 100 },
    { check: 'Pilots ≥ 30%', passed: (allocationValues.pilots || 0) >= 30 },
    { check: 'R&D ≥ 15%', passed: (allocationValues.rd || 0) >= 15 },
    { check: 'All categories > 0%', passed: Object.values(allocationValues).every(v => (Number(v) || 0) > 0) }
  ];

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {t({ en: 'Budget Allocation Approval Gate', ar: 'بوابة الموافقة على توزيع الميزانية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visualization */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Allocation Breakdown', ar: 'تفاصيل التوزيع' })}</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Amounts', ar: 'المبالغ' })}</p>
            {categories.map(cat => {
              const percentage = allocationValues[cat.id] || 0;
              const amount = (percentage / 100) * totalBudget;
              return (
                <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium">{cat.name_en}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{(amount / 1000000).toFixed(2)}M</p>
                    <p className="text-xs text-slate-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation */}
        <div>
          <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Validation Checks', ar: 'فحوصات التحقق' })}</p>
          <div className="space-y-2">
            {validationChecks.map((check, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${check.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="text-sm">{check.check}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">{t({ en: 'Approval Comments:', ar: 'تعليقات الموافقة:' })}</label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder={t({ en: 'Comments...', ar: 'التعليقات...' })}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleDecision('approve')}
            disabled={!validationChecks.every(c => c.passed) || approvalMutation.isPending}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
          >
            <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Approve Budget', ar: 'الموافقة على الميزانية' })}
          </Button>
          <Button
            onClick={() => handleDecision('reject')}
            variant="outline"
            className="flex-1 border-red-600 text-red-600"
          >
            <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Request Revision', ar: 'طلب تنقيح' })}
          </Button>
          <Button onClick={onClose} variant="outline">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}