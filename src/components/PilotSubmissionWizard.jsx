import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Send, CheckCircle2, AlertCircle, Loader2, FileText, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

function PilotSubmissionWizard({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submissionNote, setSubmissionNote] = useState('');
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [submissionBrief, setSubmissionBrief] = useState(null);
  const queryClient = useQueryClient();

  const readinessChecks = [
    { id: 'design_complete', label: { en: 'Design completed', ar: 'التصميم مكتمل' }, required: true },
    { id: 'team_assigned', label: { en: 'Team assigned', ar: 'تم تعيين الفريق' }, required: true },
    { id: 'budget_estimated', label: { en: 'Budget estimated', ar: 'تم تقدير الميزانية' }, required: true },
    { id: 'kpis_defined', label: { en: 'KPIs defined', ar: 'تم تحديد المؤشرات' }, required: true },
    { id: 'stakeholders_identified', label: { en: 'Stakeholders identified', ar: 'تم تحديد الأطراف' }, required: false }
  ];

  const [checklistState, setChecklistState] = useState(
    readinessChecks.reduce((acc, check) => ({ ...acc, [check.id]: false }), {})
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Pilot.update(pilot.id, {
        stage: 'approval_pending',
        timeline: {
          ...pilot.timeline,
          submission_date: new Date().toISOString()
        }
      });
      await base44.entities.SystemActivity.create({
        activity_type: 'pilot_submitted',
        entity_type: 'Pilot',
        entity_id: pilot.id,
        description: `Pilot "${pilot.title_en}" submitted for approval`,
        metadata: { submission_note: submissionNote }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Pilot submitted for approval', ar: 'تم تقديم التجربة للموافقة' }));
      if (onClose) onClose();
    }
  });

  const generateSubmissionBrief = async () => {
    setGeneratingBrief(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a concise submission brief for this pilot project to help approvers make a decision:

Title: ${pilot.title_en}
Sector: ${pilot.sector}
Municipality: ${pilot.municipality_id}
Budget: ${pilot.budget || 'TBD'} SAR
Duration: ${pilot.duration_weeks || 'TBD'} weeks
Challenge: ${pilot.challenge_id}

Provide:
1. Executive summary (2-3 sentences)
2. Strategic alignment (why this matters now)
3. Expected outcomes (3 key results)
4. Resource requirements summary
5. Risk assessment (top 3 risks)
6. Recommendation (approve/defer/reject with rationale)`,
        response_json_schema: {
          type: 'object',
          properties: {
            executive_summary: { type: 'string' },
            strategic_alignment: { type: 'string' },
            expected_outcomes: { type: 'array', items: { type: 'string' } },
            resource_summary: { type: 'string' },
            top_risks: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' },
            rationale: { type: 'string' }
          }
        }
      });
      setSubmissionBrief(result);
    } catch (error) {
      toast.error(t({ en: 'Failed to generate brief', ar: 'فشل إنشاء الملخص' }));
    } finally {
      setGeneratingBrief(false);
    }
  };

  const allRequiredChecked = readinessChecks
    .filter(c => c.required)
    .every(c => checklistState[c.id]);

  return (
    <Card className="border-2 border-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-blue-600" />
          {t({ en: 'Submit Pilot for Approval', ar: 'تقديم التجربة للموافقة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Readiness Check */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-1">
                {t({ en: 'Pre-Submission Checklist', ar: 'قائمة التحقق قبل التقديم' })}
              </p>
              <p className="text-xs text-blue-700">
                {t({ en: 'Verify all required items before submitting', ar: 'تحقق من جميع البنود المطلوبة قبل التقديم' })}
              </p>
            </div>

            <div className="space-y-2">
              {readinessChecks.map(check => (
                <div
                  key={check.id}
                  className={`p-3 border rounded-lg flex items-center justify-between ${
                    checklistState[check.id] ? 'bg-green-50 border-green-300' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {checklistState[check.id] ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-slate-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{check.label[language]}</p>
                      {check.required && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {t({ en: 'Required', ar: 'مطلوب' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={checklistState[check.id] ? 'outline' : 'default'}
                    onClick={() => setChecklistState({ ...checklistState, [check.id]: !checklistState[check.id] })}
                  >
                    {checklistState[check.id] ? t({ en: 'Uncheck', ar: 'إلغاء' }) : t({ en: 'Check', ar: 'تحقق' })}
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!allRequiredChecked}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {t({ en: 'Continue', ar: 'متابعة' })}
            </Button>
          </div>
        )}

        {/* Step 2: AI Submission Brief */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-900 mb-1">
                {t({ en: 'AI Submission Brief', ar: 'ملخص التقديم الذكي' })}
              </p>
              <p className="text-xs text-purple-700">
                {t({ en: 'Generate a submission brief to help approvers', ar: 'إنشاء ملخص لمساعدة المعتمدين' })}
              </p>
            </div>

            {!submissionBrief && (
              <Button
                onClick={generateSubmissionBrief}
                disabled={generatingBrief}
                className="w-full"
              >
                {generatingBrief ? (
                  <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                ) : (
                  <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                {t({ en: 'Generate AI Brief', ar: 'إنشاء ملخص ذكي' })}
              </Button>
            )}

            {submissionBrief && (
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</p>
                  <p className="text-sm text-slate-900">{submissionBrief.executive_summary}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 mb-1">{t({ en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' })}</p>
                  <p className="text-sm text-slate-900">{submissionBrief.strategic_alignment}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs text-slate-500 mb-2">{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</p>
                  {submissionBrief.expected_outcomes?.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <Target className="h-4 w-4 text-green-600 mt-0.5" />
                      <p className="text-sm text-slate-900">{outcome}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 mb-2">{t({ en: 'Top Risks', ar: 'المخاطر الرئيسية' })}</p>
                  {submissionBrief.top_risks?.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <p className="text-sm text-slate-900">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600">
                {t({ en: 'Continue', ar: 'متابعة' })}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Submission */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900 mb-1">
                {t({ en: 'Ready to Submit', ar: 'جاهز للتقديم' })}
              </p>
              <p className="text-xs text-green-700">
                {t({ en: 'Add final notes for approvers', ar: 'أضف ملاحظات نهائية للمعتمدين' })}
              </p>
            </div>

            <Textarea
              placeholder={t({ en: 'Submission notes for approvers (optional)...', ar: 'ملاحظات التقديم للمعتمدين (اختياري)...' })}
              value={submissionNote}
              onChange={(e) => setSubmissionNote(e.target.value)}
              rows={4}
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending}
                className="flex-1 bg-gradient-to-r from-green-600 to-teal-600"
              >
                {submitMutation.isPending ? (
                  <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                ) : (
                  <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                {t({ en: 'Submit for Approval', ar: 'تقديم للموافقة' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PilotSubmissionWizard;