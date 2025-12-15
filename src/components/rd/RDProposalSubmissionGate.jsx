import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function RDProposalSubmissionGate({ proposal, rdCall, onClose }) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { triggerEmail } = useEmailTrigger();
  const [checklist, setChecklist] = useState({
    title_complete: false,
    abstract_complete: false,
    methodology_complete: false,
    pi_info_complete: false,
    budget_breakdown: false,
    timeline_realistic: false,
    trl_defined: false,
    alignment_confirmed: false
  });

  // Auto-check based on proposal data
  useEffect(() => {
    if (proposal) {
      setChecklist({
        title_complete: !!(proposal.title_en && proposal.title_ar),
        abstract_complete: !!(proposal.abstract_en && proposal.abstract_en.length >= 200),
        methodology_complete: !!(proposal.methodology_en && proposal.methodology_en.length >= 100),
        pi_info_complete: !!(proposal.principal_investigator?.name && proposal.principal_investigator?.email),
        budget_breakdown: !!(proposal.budget_breakdown && proposal.budget_breakdown.length >= 3),
        timeline_realistic: !!(proposal.duration_months && proposal.duration_months >= 6),
        trl_defined: !!(proposal.trl_start && proposal.trl_target),
        alignment_confirmed: !!(proposal.rd_call_id === rdCall?.id)
      });
    }
  }, [proposal, rdCall]);

  const allChecked = Object.values(checklist).every(v => v);

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Update status and submission date
      await base44.entities.RDProposal.update(proposal.id, {
        status: 'submitted',
        submission_date: new Date().toISOString()
      });

      // Create system activity
      await base44.entities.SystemActivity.create({
        entity_type: 'RDProposal',
        entity_id: proposal.id,
        activity_type: 'submitted',
        description: `Proposal "${proposal.title_en}" submitted for review`,
        performed_by: proposal.created_by,
        timestamp: new Date().toISOString()
      });

    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['rd-proposal']);
      
      // Notify call organizer using triggerEmail
      if (rdCall?.organizer_email) {
        try {
          await triggerEmail('proposal.submitted', {
            entityType: 'rd_proposal',
            entityId: proposal.id,
            recipientEmail: rdCall.organizer_email,
            variables: {
              proposalTitle: proposal.title_en,
              rdCallTitle: rdCall.title_en,
              piName: proposal.principal_investigator?.name,
              budgetRequested: proposal.budget_requested
            }
          });
        } catch (error) {
          console.error('Failed to send proposal.submitted email:', error);
        }
      }
      
      toast.success(t({ en: 'Proposal submitted successfully!', ar: 'تم تقديم المقترح بنجاح!' }));
      onClose?.();
    }
  });

  const checklistItems = [
    { key: 'title_complete', label: { en: 'Bilingual title (EN + AR)', ar: 'العنوان ثنائي اللغة' } },
    { key: 'abstract_complete', label: { en: 'Abstract (min. 200 words)', ar: 'الملخص (200 كلمة على الأقل)' } },
    { key: 'methodology_complete', label: { en: 'Methodology (min. 100 words)', ar: 'المنهجية (100 كلمة على الأقل)' } },
    { key: 'pi_info_complete', label: { en: 'PI name and email', ar: 'اسم وبريد الباحث الرئيسي' } },
    { key: 'budget_breakdown', label: { en: 'Budget breakdown (3+ items)', ar: 'تفصيل الميزانية (3 بنود)' } },
    { key: 'timeline_realistic', label: { en: 'Realistic timeline (6+ months)', ar: 'جدول زمني واقعي (6 شهور)' } },
    { key: 'trl_defined', label: { en: 'TRL start and target defined', ar: 'المستوى التقني محدد' } },
    { key: 'alignment_confirmed', label: { en: 'Aligned with R&D call', ar: 'متوافق مع دعوة البحث' } }
  ];

  return (
    <Card className="border-2 border-blue-400 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Send className="h-5 w-5" />
          {t({ en: 'Submission Gate: Readiness Check', ar: 'بوابة التقديم: فحص الجاهزية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900 mb-2 font-medium">
            {t({ en: 'Pre-submission Checklist', ar: 'قائمة التحقق قبل التقديم' })}
          </p>
          <p className="text-xs text-slate-600">
            {t({ en: 'Ensure all requirements are met before submitting to the call.', ar: 'تأكد من استيفاء جميع المتطلبات قبل التقديم.' })}
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div
              key={item.key}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                checklist[item.key] ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
              }`}
            >
              {checklist[item.key] ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              )}
              <span className={`text-sm font-medium ${checklist[item.key] ? 'text-green-900' : 'text-red-900'}`}>
                {t(item.label)}
              </span>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          {allChecked ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  {t({ en: 'All requirements met. Ready to submit!', ar: 'تم استيفاء جميع المتطلبات. جاهز للتقديم!' })}
                </p>
              </div>
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
                size="lg"
              >
                <Send className="h-5 w-5 mr-2" />
                {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900 mb-1">
                  {t({ en: 'Cannot submit yet', ar: 'لا يمكن التقديم بعد' })}
                </p>
                <p className="text-xs text-red-700">
                  {t({ en: 'Please complete all required items marked with ✗', ar: 'الرجاء إكمال جميع البنود المطلوبة المعلمة بـ ✗' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}