import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, Send, Sparkles, Loader2, X } from 'lucide-react';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import {
  SUBMISSION_BRIEF_SYSTEM_PROMPT,
  createSubmissionBriefPrompt,
  SUBMISSION_BRIEF_SCHEMA
} from '@/lib/ai/prompts/challenges/submissionBrief';
import { toast } from 'sonner';

export default function ChallengeSubmissionWizard({ challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const { invokeAI, status, isLoading: generatingBrief, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [aiBrief, setAiBrief] = useState(null);
  const { submitForReview } = useChallengeMutations();

  const [checklist, setChecklist] = useState([
    { id: 'title', label: { en: 'Title is clear and descriptive', ar: 'العنوان واضح ووصفي' }, checked: false },
    { id: 'description', label: { en: 'Problem description is complete', ar: 'وصف المشكلة كامل' }, checked: false },
    { id: 'root_cause', label: { en: 'Root cause identified', ar: 'السبب الجذري محدد' }, checked: false },
    { id: 'evidence', label: { en: 'Data/evidence attached', ar: 'البيانات/الأدلة مرفقة' }, checked: false },
    { id: 'population', label: { en: 'Affected population defined', ar: 'السكان المتأثرون محددون' }, checked: false },
    { id: 'stakeholders', label: { en: 'Key stakeholders listed', ar: 'الأطراف المعنية الرئيسية مدرجة' }, checked: false },
    { id: 'kpis', label: { en: 'Success metrics identified', ar: 'مقاييس النجاح محددة' }, checked: false },
    { id: 'budget', label: { en: 'Budget estimate provided', ar: 'تقدير الميزانية مقدم' }, checked: false }
  ]);

  const handleSubmit = () => {
    submitForReview.mutate({
      id: challenge.id,
      data: {
        submission_checklist: checklist.reduce((acc, item) => ({ ...acc, [item.id]: item.checked }), {})
      },
      metadata: {
        submission_notes: submissionNotes,
        ai_brief: aiBrief
      }
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const generateAIBrief = async () => {
    const result = await invokeAI({
      system_prompt: SUBMISSION_BRIEF_SYSTEM_PROMPT,
      prompt: createSubmissionBriefPrompt(challenge),
      response_json_schema: SUBMISSION_BRIEF_SCHEMA
    });

    if (result.success) {
      setAiBrief(result.data);
      toast.success(t({ en: 'AI brief generated', ar: 'تم إنشاء الملخص الذكي' }));
    }
  };

  const toggleCheck = (id) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const readinessScore = Math.round((checklist.filter(c => c.checked).length / checklist.length) * 100);
  const isReady = readinessScore >= 75;

  return (
    <Card className="max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            {t({ en: 'Submit Challenge for Review', ar: 'تقديم التحدي للمراجعة' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-1">
            <Progress value={(step / 3) * 100} className="h-2" />
          </div>
          <span className="text-sm text-slate-600">
            {t({ en: `Step ${step} of 3`, ar: `الخطوة ${step} من 3` })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Step 1: Readiness Checklist */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">{readinessScore}%</div>
              <p className="text-sm text-slate-600">{t({ en: 'Submission Readiness', ar: 'جاهزية التقديم' })}</p>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleCheck(item.id)}
                  />
                  <span className="text-sm text-slate-700">{item.label[language]}</span>
                </div>
              ))}
            </div>

            {readinessScore < 75 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  {t({
                    en: '⚠️ Submission readiness below 75%. Please complete missing items before proceeding.',
                    ar: '⚠️ جاهزية التقديم أقل من 75%. يرجى إكمال العناصر المفقودة قبل المتابعة.'
                  })}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button onClick={() => setStep(2)} disabled={!isReady}>
                {t({ en: 'Next', ar: 'التالي' })}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: AI Brief */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t({ en: 'AI Submission Brief', ar: 'الملخص الذكي للتقديم' })}
              </h3>
              <p className="text-sm text-slate-600">
                {t({ en: 'Generate an AI analysis to help reviewers understand your challenge', ar: 'إنشاء تحليل ذكي لمساعدة المراجعين على فهم التحدي' })}
              </p>
            </div>

            {!aiBrief && (
              <div className="text-center py-8">
                <Button
                  onClick={generateAIBrief}
                  disabled={generatingBrief}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  {generatingBrief ? (
                    <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  ) : (
                    <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  )}
                  {t({ en: 'Generate AI Brief', ar: 'إنشاء ملخص ذكي' })}
                </Button>
              </div>
            )}

            {aiBrief && (
              <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-2">{t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}</p>
                  <p className="text-sm text-slate-700">{language === 'ar' ? aiBrief.executive_summary_ar : aiBrief.executive_summary_en}</p>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-xs font-semibold text-slate-700 mb-2">{t({ en: 'Key Highlights', ar: 'النقاط الرئيسية' })}</p>
                  <ul className="space-y-1">
                    {aiBrief.key_highlights?.map((h, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>{typeof h === 'object' ? (language === 'ar' ? h.ar : h.en) : h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded border">
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Complexity', ar: 'التعقيد' })}</p>
                    <Badge className={
                      aiBrief.complexity === 'high' ? 'bg-red-100 text-red-700' :
                        aiBrief.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                    }>{aiBrief.complexity}</Badge>
                    <p className="text-xs text-slate-600 mt-2">{language === 'ar' ? aiBrief.complexity_reason_ar : aiBrief.complexity_reason_en}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border">
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Est. Review Time', ar: 'وقت المراجعة المقدر' })}</p>
                    <p className="font-semibold text-slate-900">{aiBrief.estimated_review_days} {t({ en: 'days', ar: 'أيام' })}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button onClick={() => setStep(3)} disabled={!aiBrief}>
                {t({ en: 'Next', ar: 'التالي' })}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Final Submission */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-900">{t({ en: 'Ready to Submit', ar: 'جاهز للتقديم' })}</p>
              </div>
              <p className="text-sm text-green-800">
                {t({
                  en: 'Your challenge is ready for review. Reviewers will be notified automatically.',
                  ar: 'التحدي جاهز للمراجعة. سيتم إشعار المراجعين تلقائياً.'
                })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                {t({ en: 'Submission Notes (Optional)', ar: 'ملاحظات التقديم (اختياري)' })}
              </label>
              <Textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder={t({ en: 'Add any notes for reviewers...', ar: 'أضف أي ملاحظات للمراجعين...' })}
                rows={4}
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border text-sm">
              <p className="font-medium text-slate-900 mb-2">{t({ en: 'What happens next?', ar: 'ما الذي سيحدث بعد ذلك؟' })}</p>
              <ol className="space-y-1 text-slate-700">
                <li>1. {t({ en: 'Reviewer will be assigned automatically', ar: 'سيتم تعيين المراجع تلقائياً' })}</li>
                <li>2. {t({ en: 'They will validate and provide feedback', ar: 'سيقومون بالتحقق وتقديم الملاحظات' })}</li>
                <li>3. {t({ en: 'Challenge status will update to "under_review"', ar: 'حالة التحدي ستتحدث إلى "قيد المراجعة"' })}</li>
                <li>4. {t({ en: 'You will be notified of the review outcome', ar: 'سيتم إشعارك بنتيجة المراجعة' })}</li>
              </ol>
            </div>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>
                {t({ en: 'Back', ar: 'رجوع' })}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitForReview.isPending}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {submitForReview.isPending ? (
                  <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                ) : (
                  <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                {t({ en: 'Submit Challenge', ar: 'تقديم التحدي' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
