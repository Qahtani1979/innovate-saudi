import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Building2, Sparkles, Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import AIStatusIndicator, { AIOptionalBadge } from '@/components/ai/AIStatusIndicator';
import { useMunicipalitiesWithVisibility } from '@/hooks/visibility';
import { SCALING_READINESS_PROMPTS } from '@/lib/ai/prompts/scaling';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AIScalingReadinessPredictor({ municipalityId, solution }) {
  const { t } = useLanguage();
  const [readiness, setReadiness] = useState(null);
  
  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const { data: municipalities = [] } = useMunicipalitiesWithVisibility();

  const analyzeMunicipality = async () => {
    const muni = municipalities.find(m => m.id === municipalityId);

    const { success, data } = await invokeAI({
      systemPrompt: getSystemPrompt('scaling_readiness'),
      prompt: SCALING_READINESS_PROMPTS.buildPrompt(muni, solution),
      response_json_schema: SCALING_READINESS_PROMPTS.schema
    });

    if (success && data) {
      setReadiness(data);
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            {t({ en: 'AI Municipal Readiness Predictor', ar: 'متنبئ جاهزية البلدية الذكي' })}
          </CardTitle>
          <AIOptionalBadge />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails={true} />
        
        <Button onClick={analyzeMunicipality} disabled={isLoading || !isAvailable} size="sm" className="bg-green-600 w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Assess', ar: 'تقييم' })}
        </Button>

        {status === AI_STATUS.RATE_LIMITED && (
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t({ en: 'You can still assess municipality readiness manually based on available data.', ar: 'لا يزال بإمكانك تقييم جاهزية البلدية يدويًا بناءً على البيانات المتاحة.' })}
              </p>
            </div>
          </div>
        )}

        {!readiness && !isLoading && status !== AI_STATUS.RATE_LIMITED && (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI predicts if municipality is ready for scaling', ar: 'الذكاء يتنبأ إذا كانت البلدية جاهزة للتوسع' })}
            </p>
          </div>
        )}

        {readiness && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-2 text-center ${
              readiness.overall_score >= 75 ? 'bg-green-50 border-green-300' :
              readiness.overall_score >= 50 ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Readiness', ar: 'الجاهزية الإجمالية' })}</p>
              <p className="text-5xl font-bold text-slate-900">{readiness.overall_score}</p>
              <Badge className="mt-2 text-sm">
                {readiness.readiness_level || (readiness.overall_score >= 75 ? t({ en: 'Ready', ar: 'جاهز' }) : readiness.overall_score >= 50 ? t({ en: 'Needs Support', ar: 'يحتاج دعم' }) : t({ en: 'Not Ready', ar: 'غير جاهز' }))}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(readiness.dimension_scores || {}).map(([key, score]) => (
                <div key={key} className="p-3 bg-slate-50 rounded-lg border text-center">
                  <p className="text-xs text-slate-600 mb-1 capitalize">{key.replace('_', ' ')}</p>
                  <p className={`text-xl font-bold ${
                    score >= 75 ? 'text-green-600' :
                    score >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{score}</p>
                </div>
              ))}
            </div>

            {readiness.gaps?.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  {t({ en: 'Gaps to Address', ar: 'الفجوات للمعالجة' })}
                </h4>
                <div className="space-y-1">
                  {readiness.gaps.map((gap, idx) => (
                    <div key={idx} className="p-2 bg-yellow-50 rounded border border-yellow-200 text-sm text-slate-700">
                      ⚠️ {gap}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {readiness.enablers?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  {t({ en: 'Recommended Enablers:', ar: 'الممكنات الموصى بها:' })}
                </h4>
                <ul className="space-y-1">
                  {readiness.enablers.map((enabler, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {enabler}</li>
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
