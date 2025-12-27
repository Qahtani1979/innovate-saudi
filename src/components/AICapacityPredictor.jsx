import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, TrendingUp, Calendar, AlertTriangle, Loader2, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import useAIWithFallback, { AI_STATUS } from '@/hooks/useAIWithFallback';
import AIStatusIndicator, { AIOptionalBadge } from '@/components/ai/AIStatusIndicator';
import { useSystemEntities } from '@/hooks/useSystemData';

export default function AICapacityPredictor({ sandbox }) {
  const { isRTL, t, language } = useLanguage();
  const [prediction, setPrediction] = useState(null);

  const { data: applications = [] } = useSystemEntities('SandboxApplication');
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();

  const runPrediction = async () => {
    const historicalData = applications.filter(a => a.sandbox_id === sandbox.id);
    const { sandboxPrompts } = await import('@/lib/ai/prompts/ecosystem/sandboxPrompts');
    const { buildPrompt } = await import('@/lib/ai/promptBuilder');

    const { prompt, schema, system } = buildPrompt(sandboxPrompts.capacityPrediction, {
      sandbox,
      historicalData
    });

    const { success, data } = await invokeAI({
      prompt,
      system_prompt: system,
      response_json_schema: schema
    });

    if (success) {
      setPrediction({
        ...data,
        peak_periods: language === 'ar' ? data.peak_periods_ar : data.peak_periods_en,
        resource_allocation: language === 'ar' ? data.resource_allocation_ar : data.resource_allocation_en,
        potential_bottlenecks: language === 'ar' ? data.potential_bottlenecks_ar : data.potential_bottlenecks_en,
        insights: language === 'ar' ? data.insights_ar : data.insights_en
      });
    }
  };

  const recommendationColors = {
    increase: 'bg-orange-100 text-orange-700 border-orange-300',
    maintain: 'bg-green-100 text-green-700 border-green-300',
    optimize: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Capacity Prediction & Planning', ar: 'التنبؤ الذكي بالسعة والتخطيط' })}
          </CardTitle>
          <AIOptionalBadge />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails={true} />

        {!prediction ? (
          <div className="text-center py-6 space-y-4">
            <Button
              onClick={runPrediction}
              disabled={isLoading || !isAvailable}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate 6-Month Forecast', ar: 'إنشاء توقعات 6 أشهر' })}
                </>
              )}
            </Button>

            {status === AI_STATUS.RATE_LIMITED && (
              <div className="p-3 bg-muted rounded-lg border">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    {t({ en: 'You can still plan capacity manually based on historical data.', ar: 'لا يزال بإمكانك تخطيط السعة يدويًا بناءً على البيانات التاريخية.' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Capacity Recommendation */}
            <div className={`p-4 rounded-lg border-2 ${recommendationColors[prediction.capacity_recommendation] || recommendationColors.maintain}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">
                  {t({ en: 'Capacity Recommendation', ar: 'توصية السعة' })}
                </p>
                <Badge className={recommendationColors[prediction.capacity_recommendation] || recommendationColors.maintain}>
                  {prediction.capacity_recommendation?.toUpperCase() || 'MAINTAIN'}
                </Badge>
              </div>
              <p className="text-sm">
                {prediction.capacity_recommendation === 'increase' &&
                  t({ en: `Recommended capacity: ${prediction.recommended_capacity}`, ar: `السعة الموصى بها: ${prediction.recommended_capacity}` })
                }
                {prediction.capacity_recommendation === 'maintain' &&
                  t({ en: 'Current capacity is adequate', ar: 'السعة الحالية كافية' })
                }
                {prediction.capacity_recommendation === 'optimize' &&
                  t({ en: 'Optimize resource allocation', ar: 'تحسين تخصيص الموارد' })
                }
              </p>
            </div>

            {/* Forecast Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t({ en: '6-Month Demand Forecast', ar: 'توقعات الطلب لمدة 6 أشهر' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={prediction.forecast_6_months}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="predicted_demand"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name={t({ en: 'Predicted Demand', ar: 'الطلب المتوقع' })}
                    />
                    <Line
                      type="monotone"
                      dataKey="capacity_available"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name={t({ en: 'Available Capacity', ar: 'السعة المتاحة' })}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Peak Periods */}
            {prediction.peak_periods?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  <p className="font-semibold text-amber-900">
                    {t({ en: 'Expected Peak Periods', ar: 'فترات الذروة المتوقعة' })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prediction.peak_periods.map((period, idx) => (
                    <Badge key={idx} className="bg-amber-100 text-amber-800">
                      {period}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bottlenecks */}
            {prediction.potential_bottlenecks?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-900">
                    {t({ en: 'Potential Bottlenecks', ar: 'الاختناقات المحتملة' })}
                  </p>
                </div>
                <ul className="space-y-1">
                  {prediction.potential_bottlenecks.map((item, idx) => (
                    <li key={idx} className="text-sm text-red-800">⚠ {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            {prediction.insights?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-2">
                  {t({ en: 'Key Insights', ar: 'الرؤى الرئيسية' })}
                </p>
                <ul className="space-y-1">
                  {prediction.insights.map((item, idx) => (
                    <li key={idx} className="text-sm text-blue-800">→ {item}</li>
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
