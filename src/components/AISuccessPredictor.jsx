import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildSuccessPredictorPrompt, successPredictorSchema, SUCCESS_PREDICTOR_SYSTEM_PROMPT } from '@/lib/ai/prompts/core';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AISuccessPredictor({ pilot, onPredictionComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generatePrediction = async () => {
    const result = await invokeAI({
      prompt: buildSuccessPredictorPrompt(pilot),
      systemPrompt: getSystemPrompt(SUCCESS_PREDICTOR_SYSTEM_PROMPT),
      response_json_schema: successPredictorSchema
    });

    if (result.success) {
      setPrediction(result.data);
      if (onPredictionComplete) onPredictionComplete(result.data);
      toast.success(t({ en: 'AI prediction generated', ar: 'تم إنشاء التنبؤ الذكي' }));
    }
  };

  const probabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-600';
    if (prob >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const confidenceColor = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-green-100 text-green-700'
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Success Prediction', ar: 'التنبؤ الذكي بالنجاح' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!prediction ? (
          <div className="text-center py-6">
            <Button
              onClick={generatePrediction}
              disabled={isLoading || !isAvailable}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate AI Prediction', ar: 'إنشاء التنبؤ الذكي' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success Probability */}
            <div className="text-center p-6 bg-white rounded-lg border-2 border-purple-300">
              <p className="text-sm text-slate-600 mb-2">
                {t({ en: 'Predicted Success Probability', ar: 'احتمالية النجاح المتوقعة' })}
              </p>
              <p className={`text-5xl font-bold ${probabilityColor(prediction.success_probability)}`}>
                {prediction.success_probability}%
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="text-sm text-slate-600">
                  {t({ en: 'Confidence:', ar: 'الثقة:' })}
                </span>
                <Badge className={confidenceColor[prediction.confidence_level]}>
                  {prediction.confidence_level}
                </Badge>
              </div>
              <Progress value={prediction.success_probability} className="mt-4 h-3" />
            </div>

            {/* Key Strengths */}
            {prediction.key_strengths?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="font-semibold text-green-900">
                    {t({ en: 'Key Strengths', ar: 'نقاط القوة الرئيسية' })}
                  </p>
                </div>
                <ul className="space-y-2">
                  {prediction.key_strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {prediction.risk_factors?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <p className="font-semibold text-amber-900">
                    {t({ en: 'Risk Factors', ar: 'عوامل الخطر' })}
                  </p>
                </div>
                <ul className="space-y-2">
                  {prediction.risk_factors.map((risk, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600">⚠</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <p className="font-semibold text-blue-900">
                    {t({ en: 'AI Recommendations', ar: 'التوصيات الذكية' })}
                  </p>
                </div>
                <ul className="space-y-2">
                  {prediction.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predicted Outcomes */}
            {prediction.predicted_outcomes && (
              <div className="p-4 bg-white rounded-lg border">
                <p className="font-semibold text-slate-900 mb-3">
                  {t({ en: 'Predicted Outcomes', ar: 'النتائج المتوقعة' })}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">KPI Achievement:</span>
                    <span className="font-medium">{prediction.predicted_outcomes.kpi_achievement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Timeline Adherence:</span>
                    <span className="font-medium">{prediction.predicted_outcomes.timeline_adherence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Budget Efficiency:</span>
                    <span className="font-medium">{prediction.predicted_outcomes.budget_efficiency}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison */}
            {prediction.comparison_to_similar_pilots && (
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-xs font-medium text-slate-700 mb-2">
                  {t({ en: 'Comparison to Similar Pilots', ar: 'مقارنة بالتجارب المماثلة' })}
                </p>
                <p className="text-sm text-slate-600">{prediction.comparison_to_similar_pilots}</p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={generatePrediction}
              disabled={isLoading || !isAvailable}
              className="w-full"
            >
              {t({ en: 'Refresh Prediction', ar: 'تحديث التنبؤ' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
