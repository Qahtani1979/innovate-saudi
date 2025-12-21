import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Zap, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getFastTrackEligibilityPrompt, fastTrackEligibilitySchema } from '@/lib/ai/prompts/sandbox';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function FastTrackEligibilityChecker({ application }) {
  const { language, t } = useLanguage();
  const [eligibility, setEligibility] = useState(null);
  const { invokeAI, status, isLoading: checking, rateLimitInfo, isAvailable } = useAIWithFallback();

  const checkEligibility = async () => {
    const { success, data } = await invokeAI({
      prompt: getFastTrackEligibilityPrompt({ application }),
      system_prompt: getSystemPrompt('COMPACT', true),
      response_json_schema: fastTrackEligibilitySchema
    });

    if (success) {
      setEligibility(data);
      toast.success(t({ en: 'Eligibility check complete', ar: 'اكتمل فحص الأهلية' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            {t({ en: 'Fast-Track Eligibility Checker', ar: 'فاحص أهلية المسار السريع' })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={checkEligibility} disabled={checking || !isAvailable} size="sm" className="bg-green-600">
              {checking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Check', ar: 'فحص' })}
            </Button>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!eligibility && !checking && (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI determines if project qualifies for 48-hour fast-track approval', ar: 'الذكاء يحدد إذا كان المشروع مؤهل للموافقة السريعة خلال 48 ساعة' })}
            </p>
          </div>
        )}

        {eligibility && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-2 text-center ${
              eligibility.eligible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
            }`}>
              {eligibility.eligible ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-green-900 mb-2">
                    {t({ en: 'FAST-TRACK ELIGIBLE', ar: 'مؤهل للمسار السريع' })}
                  </p>
                  <p className="text-sm text-slate-700">
                    {t({ en: `Estimated approval: ${eligibility.approval_hours} hours`, ar: `الموافقة المقدرة: ${eligibility.approval_hours} ساعة` })}
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-red-900 mb-2">
                    {t({ en: 'STANDARD REVIEW REQUIRED', ar: 'المراجعة القياسية مطلوبة' })}
                  </p>
                  <p className="text-sm text-slate-700">
                    {t({ en: `Estimated approval: ${eligibility.approval_hours} hours`, ar: `الموافقة المقدرة: ${eligibility.approval_hours} ساعة` })}
                  </p>
                </>
              )}
              <Badge className="mt-2">
                {eligibility.confidence}% {t({ en: 'Confidence', ar: 'ثقة' })}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(eligibility.criteria_met || {}).map(([key, met]) => (
                <div key={key} className={`p-3 rounded-lg border text-center ${
                  met ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}>
                  {met ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />
                  )}
                  <p className="text-xs text-slate-700 capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>

            {eligibility.recommendations?.length > 0 && !eligibility.eligible && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2">
                  {t({ en: 'How to Qualify for Fast-Track:', ar: 'كيفية التأهل للمسار السريع:' })}
                </h4>
                <ul className="space-y-1">
                  {eligibility.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700">→ {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
