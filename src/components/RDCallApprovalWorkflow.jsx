import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, XCircle, AlertCircle, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function RDCallApprovalWorkflow({ rdCall, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [decision, setDecision] = useState('');
  const [comments, setComments] = useState('');

  const approvalMutation = useMutation({
    mutationFn: async () => {
      // Update call status based on decision
      let newStatus = rdCall.status;
      if (decision === 'approved') {
        newStatus = 'published';
      } else if (decision === 'rejected') {
        newStatus = 'draft';
      } else if (decision === 'revision') {
        newStatus = 'draft';
      }

      const { error } = await supabase
        .from('rd_calls')
        .update({
          status: newStatus,
          approval_status: decision,
          approval_comments: comments,
          approved_by: user?.email,
          approval_date: new Date().toISOString()
        })
        .eq('id', rdCall.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-call'] });
      toast.success(t({ en: 'Approval decision recorded', ar: 'تم تسجيل قرار الموافقة' }));
      onClose();
    }
  });

  const checklistItems = [
    { key: 'budget', label: { en: 'Budget allocation verified', ar: 'تم التحقق من تخصيص الميزانية' } },
    { key: 'alignment', label: { en: 'Aligned with strategic priorities', ar: 'متوافق مع الأولويات الاستراتيجية' } },
    { key: 'criteria', label: { en: 'Evaluation criteria are clear', ar: 'معايير التقييم واضحة' } },
    { key: 'timeline', label: { en: 'Timeline is realistic', ar: 'الجدول الزمني واقعي' } },
    { key: 'themes', label: { en: 'Research themes well-defined', ar: 'المحاور البحثية محددة جيداً' } }
  ];

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          {t({ en: 'R&D Call Approval', ar: 'الموافقة على دعوة البحث' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            {language === 'ar' && rdCall.title_ar ? rdCall.title_ar : rdCall.title_en}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600">{t({ en: 'Type:', ar: 'النوع:' })}</span>
              <span className="font-medium ml-2">{rdCall.call_type?.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-slate-600">{t({ en: 'Budget:', ar: 'الميزانية:' })}</span>
              <span className="font-medium ml-2">{rdCall.total_funding?.toLocaleString()} SAR</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">{t({ en: 'Approval Checklist', ar: 'قائمة الموافقة' })}</h4>
          {checklistItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2 p-3 bg-slate-50 rounded">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm">{item.label[language]}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">{t({ en: 'Decision', ar: 'القرار' })}</h4>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant={decision === 'approved' ? 'default' : 'outline'}
              onClick={() => setDecision('approved')}
              className={decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Approve', ar: 'موافقة' })}
            </Button>
            <Button
              variant={decision === 'revision' ? 'default' : 'outline'}
              onClick={() => setDecision('revision')}
              className={decision === 'revision' ? 'bg-amber-600 hover:bg-amber-700' : ''}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Request Revision', ar: 'طلب مراجعة' })}
            </Button>
            <Button
              variant={decision === 'rejected' ? 'default' : 'outline'}
              onClick={() => setDecision('rejected')}
              className={decision === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Reject', ar: 'رفض' })}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t({ en: 'Comments', ar: 'التعليقات' })}</label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder={t({ en: 'Provide feedback or justification...', ar: 'قدم ملاحظات أو تبرير...' })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => approvalMutation.mutate()}
            disabled={!decision || approvalMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {approvalMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t({ en: 'Submit Decision', ar: 'إرسال القرار' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}