import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CheckCircle2, X, Sparkles, Send, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildProposalBriefPrompt, proposalBriefSchema, PROPOSAL_BRIEF_SYSTEM_PROMPT } from '@/lib/ai/prompts/core';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function ProposalSubmissionWizard({ proposal, rdCall, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [notes, setNotes] = useState('');
  const [aiBrief, setAiBrief] = useState(null);
  
  const [checklist, setChecklist] = useState({
    title_complete: false,
    abstract_clear: false,
    methodology_detailed: false,
    team_qualified: false,
    budget_justified: false,
    timeline_realistic: false,
    outputs_defined: false,
    eligibility_met: false
  });

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.RDProposal.update(proposal.id, {
        status: 'submitted',
        submission_date: new Date().toISOString(),
        submission_checklist: checklist,
        submission_notes: notes,
        ai_submission_brief: aiBrief
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rdProposal']);
      toast.success(t({ en: 'Proposal submitted', ar: 'تم تقديم المقترح' }));
      onClose();
    }
  });

  const generateAIBrief = async () => {
    const { success, data } = await invokeAI({
      prompt: buildProposalBriefPrompt(proposal),
      systemPrompt: getSystemPrompt(PROPOSAL_BRIEF_SYSTEM_PROMPT),
      response_json_schema: proposalBriefSchema
    });

    if (success && data) {
      setAiBrief(data);
      toast.success(t({ en: 'AI brief generated', ar: 'تم إنشاء الملخص الذكي' }));
    }
  };

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(v => v);
  const readinessScore = Math.round((Object.values(checklist).filter(v => v).length / Object.keys(checklist).length) * 100);

  return (
    <Card className="border-2 border-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-600" />
            {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <Progress value={(step / 3) * 100} className="mt-4" />
        <p className="text-sm text-slate-600 mt-2">
          {t({ en: `Step ${step} of 3`, ar: `الخطوة ${step} من 3` })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
        
        {/* Step 1: Readiness Checklist */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">{readinessScore}%</div>
              <p className="text-sm text-slate-600">{t({ en: 'Submission Readiness', ar: 'جاهزية التقديم' })}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">{t({ en: 'Submission Checklist', ar: 'قائمة التحقق من التقديم' })}</h4>
              
              {[
                { key: 'title_complete', label: { en: 'Title in both languages', ar: 'العنوان باللغتين' } },
                { key: 'abstract_clear', label: { en: 'Clear research abstract', ar: 'ملخص بحثي واضح' } },
                { key: 'methodology_detailed', label: { en: 'Detailed methodology', ar: 'منهجية مفصلة' } },
                { key: 'team_qualified', label: { en: 'Qualified research team', ar: 'فريق بحثي مؤهل' } },
                { key: 'budget_justified', label: { en: 'Budget breakdown justified', ar: 'تفصيل الميزانية مبرر' } },
                { key: 'timeline_realistic', label: { en: 'Realistic timeline', ar: 'جدول زمني واقعي' } },
                { key: 'outputs_defined', label: { en: 'Expected outputs defined', ar: 'المخرجات المتوقعة محددة' } },
                { key: 'eligibility_met', label: { en: 'Eligibility criteria met', ar: 'معايير الأهلية مستوفاة' } }
              ].map(item => (
                <div
                  key={item.key}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                    checklist[item.key] ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'
                  }`}
                  onClick={() => toggleCheck(item.key)}
                >
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                    checklist[item.key] ? 'bg-green-600 border-green-600' : 'border-slate-300'
                  }`}>
                    {checklist[item.key] && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </div>
                  <span className="text-sm text-slate-900">{item.label[language]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: AI Brief */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h4 className="font-semibold text-slate-900 mb-2">
                {t({ en: 'AI Submission Brief', ar: 'ملخص التقديم الذكي' })}
              </h4>
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Generate an AI brief to help reviewers understand your proposal quickly',
                  ar: 'إنشاء ملخص ذكي لمساعدة المراجعين على فهم مقترحك بسرعة'
                })}
              </p>
            </div>

            {!aiBrief ? (
              <Button
                onClick={generateAIBrief}
                disabled={isLoading || !isAvailable}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'Generate AI Brief', ar: 'إنشاء ملخص ذكي' })}
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h5 className="font-semibold text-purple-900 text-sm mb-2">
                    {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
                  </h5>
                  <p className="text-sm text-slate-700">{aiBrief.executive_summary}</p>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-semibold text-green-900 text-sm mb-2">
                    {t({ en: 'Key Strengths', ar: 'نقاط القوة الرئيسية' })}
                  </h5>
                  <ul className="space-y-1">
                    {aiBrief.strengths?.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700">• {s}</li>
                    ))}
                  </ul>
                </div>

                {aiBrief.concerns?.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-semibold text-yellow-900 text-sm mb-2">
                      {t({ en: 'Potential Concerns', ar: 'المخاوف المحتملة' })}
                    </h5>
                    <ul className="space-y-1">
                      {aiBrief.concerns.map((c, i) => (
                        <li key={i} className="text-sm text-slate-700">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Final Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 mb-2">
                {t({ en: 'Ready to Submit', ar: 'جاهز للتقديم' })}
              </h4>
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Your proposal will be submitted for review',
                  ar: 'سيتم تقديم مقترحك للمراجعة'
                })}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                {t({ en: 'Submission Notes (Optional)', ar: 'ملاحظات التقديم (اختياري)' })}
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t({ 
                  en: 'Add any additional notes for reviewers...',
                  ar: 'أضف أي ملاحظات إضافية للمراجعين...'
                })}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {isRTL ? <ArrowRight className="h-4 w-4 mr-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
            {step === 1 ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Back', ar: 'رجوع' })}
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !allChecked}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t({ en: 'Next', ar: 'التالي' })}
              {isRTL ? <ArrowLeft className="h-4 w-4 ml-2" /> : <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          ) : (
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-blue-600"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Submitting...', ar: 'جاري التقديم...' })}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
