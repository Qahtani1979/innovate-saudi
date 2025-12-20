import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildEligibilityCheckPrompt, ELIGIBILITY_CHECK_SCHEMA } from '@/lib/ai/prompts/rd';

export default function ProposalEligibilityChecker({ proposal, rdCall, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [results, setResults] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.RDProposal.update(proposal.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposals']);
      toast.success(t({ en: 'Eligibility check complete', ar: 'فحص الأهلية مكتمل' }));
      onClose();
    }
  });

  const runEligibilityCheck = async () => {
    const prompt = buildEligibilityCheckPrompt({ proposal, rdCall });

    const response = await invokeAI({
      prompt,
      response_json_schema: ELIGIBILITY_CHECK_SCHEMA
    });

    if (response.success) {
      setResults(response.data);
    }
  };

  const handleDecision = (eligible) => {
    updateMutation.mutate({
      eligibility_status: eligible ? 'eligible' : 'ineligible',
      eligibility_check: results,
      eligibility_date: new Date().toISOString(),
      status: eligible ? proposal.status : 'rejected'
    });
  };

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>{t({ en: 'Automated Eligibility Check', ar: 'فحص الأهلية الآلي' })}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900">{proposal.title_en}</p>
          <p className="text-xs text-slate-600 mt-1">{proposal.lead_institution}</p>
        </div>

        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

        {!results && !isLoading && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI will validate proposal against call eligibility criteria', ar: 'سيتحقق الذكاء الاصطناعي من المقترح مقابل معايير الأهلية' })}
            </p>
            <Button onClick={runEligibilityCheck} disabled={!isAvailable} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Run Eligibility Check', ar: 'تشغيل فحص الأهلية' })}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI analyzing eligibility...', ar: 'الذكاء الاصطناعي يحلل الأهلية...' })}
            </p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${results.overall_eligible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {results.overall_eligible ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  )}
                  <span className="font-semibold text-lg">
                    {results.overall_eligible 
                      ? t({ en: 'ELIGIBLE', ar: 'مؤهل' })
                      : t({ en: 'NOT ELIGIBLE', ar: 'غير مؤهل' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t({ en: 'Eligibility Checks', ar: 'فحوصات الأهلية' })}</Label>
              {results.checks?.map((check, i) => (
                <div key={i} className={`p-3 border rounded-lg ${check.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-start gap-2">
                    {check.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{check.criterion}</p>
                      <p className="text-xs text-slate-600 mt-1">{check.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {results.recommendation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">AI Recommendation:</p>
                <p className="text-sm text-slate-700">{results.recommendation}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              {!results.overall_eligible && (
                <Button
                  onClick={() => handleDecision(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={updateMutation.isPending}
                >
                  {t({ en: 'Reject (Ineligible)', ar: 'رفض (غير مؤهل)' })}
                </Button>
              )}
              {results.overall_eligible && (
                <Button
                  onClick={() => handleDecision(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={updateMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Confirm Eligible', ar: 'تأكيد الأهلية' })}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
