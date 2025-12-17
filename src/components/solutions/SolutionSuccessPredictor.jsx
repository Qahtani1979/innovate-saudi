import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  generateSuccessPredictionPrompt,
  getSuccessPredictionSchema,
  getSuccessPredictionSystemPrompt
} from '@/lib/ai/prompts/solution';

export default function SolutionSuccessPredictor({ solution, challenge }) {
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const predictSuccess = async () => {
    const result = await invokeAI({
      prompt: generateSuccessPredictionPrompt(solution, challenge),
      response_json_schema: getSuccessPredictionSchema(),
      system_prompt: getSuccessPredictionSystemPrompt()
    });

    if (result.success) {
      setPrediction(result.data);
      toast.success(t({ en: 'Prediction complete', ar: 'اكتمل التنبؤ' }));
    }
  };

  const successColor = prediction?.success_probability >= 70 ? 'green' :
                       prediction?.success_probability >= 50 ? 'yellow' : 'red';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Success Prediction', ar: 'التنبؤ بالنجاح' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        <Button
          onClick={predictSuccess}
          disabled={isLoading || !isAvailable}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Analyzing historical patterns...', ar: 'جاري تحليل الأنماط...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Predict Pilot Success', ar: 'توقع نجاح التجربة' })}
            </>
          )}
        </Button>

        {prediction && (
          <div className="space-y-4">
            {/* Success Probability */}
            <div className={`p-4 bg-${successColor}-50 border-2 border-${successColor}-300 rounded-lg`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-900">
                  {t({ en: 'Success Probability', ar: 'احتمال النجاح' })}
                </p>
                <Badge className={`bg-${successColor}-600 text-white`}>
                  {prediction.confidence_level} confidence
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-5xl font-bold text-${successColor}-600`}>
                  {prediction.success_probability}%
                </div>
                <div className="flex-1">
                  <Progress value={prediction.success_probability} className="h-3" />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
                <p className="text-xs text-slate-600">Best Case</p>
                <p className="text-xl font-bold text-green-600">
                  {prediction.timeline_prediction?.best_case_months}mo
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
                <p className="text-xs text-slate-600">Likely</p>
                <p className="text-xl font-bold text-blue-600">
                  {prediction.timeline_prediction?.likely_months}mo
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded border border-red-200 text-center">
                <p className="text-xs text-slate-600">Worst Case</p>
                <p className="text-xl font-bold text-red-600">
                  {prediction.timeline_prediction?.worst_case_months}mo
                </p>
              </div>
            </div>

            {/* Success Factors */}
            {prediction.success_factors?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t({ en: 'Success Factors', ar: 'عوامل النجاح' })}
                </p>
                <ul className="space-y-1">
                  {prediction.success_factors.map((factor, i) => (
                    <li key={i} className="text-xs text-green-800">✓ {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {prediction.risk_factors?.length > 0 && (
              <div className="p-3 bg-red-50 rounded border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t({ en: 'Risk Factors', ar: 'عوامل المخاطر' })}
                </p>
                <ul className="space-y-1">
                  {prediction.risk_factors.map((factor, i) => (
                    <li key={i} className="text-xs text-red-800">⚠ {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preparation Steps */}
            {prediction.preparation_steps?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t({ en: 'Recommended Preparation', ar: 'التحضير الموصى به' })}
                </p>
                <ol className="space-y-1">
                  {prediction.preparation_steps.map((step, i) => (
                    <li key={i} className="text-xs text-blue-800">{i + 1}. {step}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Overall Recommendation */}
            <div className="p-3 bg-purple-50 rounded border-2 border-purple-300">
              <p className="text-sm font-semibold text-purple-900 mb-1">
                {t({ en: 'Overall Recommendation', ar: 'التوصية الشاملة' })}
              </p>
              <p className="text-sm text-slate-700">{prediction.overall_recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
