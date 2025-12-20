import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2, Info } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import AIStatusIndicator, { AIOptionalBadge } from '@/components/ai/AIStatusIndicator';
import { getMatchSuccessPredictorPrompt, matchSuccessPredictorSchema } from '@/lib/ai/prompts/matchmaker';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function AIMatchSuccessPredictor({ match, provider, challenge }) {
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  
  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const predictSuccess = async () => {
    const { success, data } = await invokeAI({
      prompt: getMatchSuccessPredictorPrompt({ provider, challenge }),
      system_prompt: getSystemPrompt('COMPACT', true),
      response_json_schema: matchSuccessPredictorSchema
    });

    if (success && data) {
      setPrediction(data);
    }
  };

  const radarData = prediction ? [
    { dimension: 'Capability', score: prediction.dimension_scores?.capability_fit || 0 },
    { dimension: 'Sector Exp', score: prediction.dimension_scores?.sector_expertise || 0 },
    { dimension: 'Track Record', score: prediction.dimension_scores?.track_record || 0 },
    { dimension: 'Budget', score: prediction.dimension_scores?.budget_alignment || 0 },
    { dimension: 'Capacity', score: prediction.dimension_scores?.team_capacity || 0 }
  ] : [];

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-teal-600" />
            {t({ en: 'AI Match Success Predictor', ar: 'متنبئ نجاح المطابقة الذكي' })}
          </CardTitle>
          <AIOptionalBadge />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails={true} />
        
        <Button onClick={predictSuccess} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600 w-full">
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Predict', ar: 'تنبؤ' })}
        </Button>

        {status === AI_STATUS.RATE_LIMITED && (
          <div className="p-3 bg-muted rounded-lg border">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                {t({ en: 'You can still proceed with the match manually based on your assessment.', ar: 'لا يزال بإمكانك المتابعة مع المطابقة يدويًا بناءً على تقييمك.' })}
              </p>
            </div>
          </div>
        )}

        {!prediction && !isLoading && status !== AI_STATUS.RATE_LIMITED && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI predicts if match will convert to successful pilot', ar: 'الذكاء يتنبأ إذا كانت المطابقة ستتحول لتجربة ناجحة' })}
            </p>
          </div>
        )}

        {prediction && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-lg border-2 text-center ${
                prediction.success_probability >= 75 ? 'bg-green-50 border-green-300' :
                prediction.success_probability >= 50 ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <p className="text-sm text-slate-600 mb-2">{t({ en: 'Success Probability', ar: 'احتمالية النجاح' })}</p>
                <p className="text-5xl font-bold text-slate-900">{prediction.success_probability}%</p>
                <Badge className="mt-2">
                  {prediction.success_probability >= 75 ? 'High Confidence' :
                   prediction.success_probability >= 50 ? 'Moderate' : 'Low Confidence'}
                </Badge>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar dataKey="score" stroke="#0d9488" fill="#0d9488" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {prediction.risk_factors?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                <p className="font-semibold text-red-900 mb-2">
                  {t({ en: 'Risk Factors:', ar: 'عوامل المخاطر:' })}
                </p>
                <ul className="space-y-1">
                  {prediction.risk_factors.map((risk, idx) => (
                    <li key={idx} className="text-sm text-slate-700">⚠️ {risk}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`p-4 rounded-lg border-2 ${
              prediction.recommendation?.includes('proceed') ? 'bg-green-50 border-green-300' :
              prediction.recommendation?.includes('alternative') ? 'bg-yellow-50 border-yellow-300' :
              'bg-blue-50 border-blue-300'
            }`}>
              <p className="font-semibold text-slate-900 mb-2">
                {t({ en: 'AI Recommendation:', ar: 'توصية الذكاء الاصطناعي:' })}
              </p>
              <p className="text-sm text-slate-700">{prediction.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
