import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../LanguageContext';
import { DollarSign, CheckCircle2, XCircle } from 'lucide-react';

export default function BudgetApprovalGate({ scalingPlan, onApproved, onRejected }) {
  const { t, isRTL } = useLanguage();
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await base44.entities.ScalingPlan.update(scalingPlan.id, {
        budget_approved: true,
        budget_approval_date: new Date().toISOString(),
        budget_approval_comments: comments
      });
      
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'proposal.accepted',
          recipient_email: scalingPlan.created_by,
          entity_type: 'scaling_plan',
          entity_id: scalingPlan.id,
          variables: {
            planTitle: scalingPlan.title_en,
            budgetAmount: scalingPlan.estimated_budget,
            comments: comments
          },
          triggered_by: 'system'
        }
      });
      
      onApproved?.();
    } catch (error) {
      console.error('Approval failed:', error);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await base44.entities.ScalingPlan.update(scalingPlan.id, {
        budget_approved: false,
        budget_approval_date: new Date().toISOString(),
        budget_approval_comments: comments
      });
      
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'proposal.revision_requested',
          recipient_email: scalingPlan.created_by,
          entity_type: 'scaling_plan',
          entity_id: scalingPlan.id,
          variables: {
            planTitle: scalingPlan.title_en,
            comments: comments
          },
          triggered_by: 'system'
        }
      });
      
      onRejected?.();
    } catch (error) {
      console.error('Rejection failed:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-amber-600" />
          {t({ en: 'Budget Approval Gate', ar: 'بوابة الموافقة على الميزانية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">{t({ en: 'Total Budget', ar: 'الميزانية الكلية' })}</p>
            <p className="text-2xl font-bold text-slate-900">{scalingPlan?.estimated_budget?.toLocaleString()} SAR</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">{t({ en: 'Per Municipality', ar: 'لكل بلدية' })}</p>
            <p className="text-2xl font-bold text-slate-900">
              {scalingPlan?.target_municipalities?.length > 0 
                ? (scalingPlan.estimated_budget / scalingPlan.target_municipalities.length).toLocaleString()
                : 'N/A'} SAR
            </p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
            <p className="text-2xl font-bold text-slate-900">{scalingPlan?.target_municipalities?.length || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
            <p className="text-2xl font-bold text-slate-900">{scalingPlan?.estimated_timeline_months || 0} months</p>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{t({ en: 'Approval Checklist', ar: 'قائمة الموافقة' })}</h4>
          {[
            { key: 'budget_justified', label: { en: 'Budget breakdown is justified', ar: 'تفصيل الميزانية مبرر' } },
            { key: 'roi_acceptable', label: { en: 'Expected ROI is acceptable', ar: 'العائد المتوقع مقبول' } },
            { key: 'funding_available', label: { en: 'Funding source confirmed', ar: 'مصدر التمويل مؤكد' } },
            { key: 'timeline_realistic', label: { en: 'Timeline is realistic', ar: 'الجدول الزمني واقعي' } }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">{t(item.label)}</span>
            </div>
          ))}
        </div>

        {/* Comments */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Approval Comments', ar: 'ملاحظات الموافقة' })}
          </label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={t({ en: 'Add your comments...', ar: 'أضف ملاحظاتك...' })}
            className="h-24"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleReject} disabled={loading} className="gap-2">
            <XCircle className="h-4 w-4" />
            {t({ en: 'Request Revision', ar: 'طلب مراجعة' })}
          </Button>
          <Button onClick={handleApprove} disabled={loading} className="gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4" />
            {t({ en: 'Approve Budget', ar: 'الموافقة على الميزانية' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}