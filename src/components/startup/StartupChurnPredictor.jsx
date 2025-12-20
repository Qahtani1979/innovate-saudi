import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertTriangle, Sparkles, TrendingDown, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildChurnPredictorPrompt, CHURN_PREDICTOR_SCHEMA } from '@/lib/ai/prompts/startup';

export default function StartupChurnPredictor({ startupId }) {
  const { t } = useLanguage();
  const [prediction, setPrediction] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const { data: startup } = useQuery({
    queryKey: ['startup-churn', startupId],
    queryFn: async () => {
      const all = await base44.entities.StartupProfile.list();
      return all.find(s => s.id === startupId);
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['startup-solutions-churn', startupId],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.provider_id === startupId);
    }
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['startup-activities-churn', startupId],
    queryFn: async () => {
      const all = await base44.entities.UserActivity.list();
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      return all.filter(a => 
        a.entity_id === startupId && 
        new Date(a.created_date) >= last30Days
      );
    }
  });

  const runPrediction = async () => {
    const result = await invokeAI({
      prompt: buildChurnPredictorPrompt(startup, solutions, activities),
      response_json_schema: CHURN_PREDICTOR_SCHEMA
    });

    if (result.success) {
      setPrediction(result.data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-600" />
          {t({ en: 'Churn Risk Prediction', ar: 'التنبؤ بمخاطر المغادرة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!prediction && (
          <Button onClick={runPrediction} disabled={isLoading || !isAvailable} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Predict Churn Risk', ar: 'التنبؤ بالمخاطر' })}
              </>
            )}
          </Button>
        )}

        {prediction && (
          <div className="space-y-4">
            <div className={`p-6 rounded-lg border-2 text-center ${
              prediction.churn_risk === 'high' ? 'bg-red-50 border-red-400' :
              prediction.churn_risk === 'medium' ? 'bg-amber-50 border-amber-400' :
              'bg-green-50 border-green-400'
            }`}>
              <AlertTriangle className={`h-12 w-12 mx-auto mb-2 ${
                prediction.churn_risk === 'high' ? 'text-red-600' :
                prediction.churn_risk === 'medium' ? 'text-amber-600' :
                'text-green-600'
              }`} />
              <p className="text-3xl font-bold mb-1">
                {prediction.churn_probability}%
              </p>
              <Badge className={
                prediction.churn_risk === 'high' ? 'bg-red-600' :
                prediction.churn_risk === 'medium' ? 'bg-amber-600' :
                'bg-green-600'
              }>
                {prediction.churn_risk.toUpperCase()} RISK
              </Badge>
            </div>

            {prediction.risk_factors?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-2">
                  {t({ en: 'Risk Factors', ar: 'عوامل المخاطرة' })}
                </p>
                <ul className="space-y-1">
                  {prediction.risk_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-red-800">• {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {prediction.retention_recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">
                  {t({ en: 'Retention Actions', ar: 'إجراءات الاحتفاظ' })}
                </p>
                <ul className="space-y-1">
                  {prediction.retention_recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-blue-800">✓ {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button onClick={runPrediction} variant="outline" className="w-full" disabled={isLoading || !isAvailable}>
              {t({ en: 'Re-analyze', ar: 'إعادة التحليل' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
