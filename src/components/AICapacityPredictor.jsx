import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, TrendingUp, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AICapacityPredictor({ sandbox }) {
  const { language, isRTL, t } = useLanguage();
  const [prediction, setPrediction] = useState(null);

  const { data: applications = [] } = useQuery({
    queryKey: ['sandbox-applications'],
    queryFn: () => base44.entities.SandboxApplication.list()
  });

  const predictMutation = useMutation({
    mutationFn: async () => {
      const historicalData = applications.filter(a => a.sandbox_id === sandbox.id);
      
      const prompt = `Analyze sandbox capacity and predict future demand:

Sandbox: ${sandbox.name_en}
Domain: ${sandbox.domain}
Current Capacity: ${sandbox.capacity}
Current Usage: ${sandbox.current_pilots}
Historical Applications: ${historicalData.length}
Active Projects: ${historicalData.filter(a => a.status === 'active').length}
Completed Projects: ${historicalData.filter(a => a.status === 'completed').length}

Recent application data:
${JSON.stringify(historicalData.slice(-10).map(a => ({
  title: a.project_title,
  duration_months: a.duration_months,
  start_date: a.start_date,
  status: a.status
})))}

Provide JSON analysis with:
1. 6-month demand forecast (monthly predictions)
2. Peak demand periods
3. Capacity utilization forecast
4. Recommendations for capacity adjustments
5. Resource allocation suggestions
6. Bottleneck predictions`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            forecast_6_months: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "string" },
                  predicted_demand: { type: "number" },
                  confidence: { type: "string", enum: ["low", "medium", "high"] },
                  capacity_available: { type: "number" }
                }
              }
            },
            peak_periods: {
              type: "array",
              items: { type: "string" }
            },
            utilization_forecast: { type: "number", description: "Average % over 6 months" },
            capacity_recommendation: {
              type: "string",
              enum: ["increase", "maintain", "optimize"]
            },
            recommended_capacity: { type: "number" },
            resource_allocation: {
              type: "array",
              items: { type: "string" }
            },
            potential_bottlenecks: {
              type: "array",
              items: { type: "string" }
            },
            insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setPrediction(data);
    }
  });

  const recommendationColors = {
    increase: 'bg-orange-100 text-orange-700 border-orange-300',
    maintain: 'bg-green-100 text-green-700 border-green-300',
    optimize: 'bg-blue-100 text-blue-700 border-blue-300'
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          {t({ en: 'AI Capacity Prediction & Planning', ar: 'التنبؤ الذكي بالسعة والتخطيط' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction ? (
          <div className="text-center py-6">
            <Button
              onClick={() => predictMutation.mutate()}
              disabled={predictMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {predictMutation.isPending ? (
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
          </div>
        ) : (
          <div className="space-y-4">
            {/* Capacity Recommendation */}
            <div className={`p-4 rounded-lg border-2 ${recommendationColors[prediction.capacity_recommendation]}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">
                  {t({ en: 'Capacity Recommendation', ar: 'توصية السعة' })}
                </p>
                <Badge className={recommendationColors[prediction.capacity_recommendation]}>
                  {prediction.capacity_recommendation.toUpperCase()}
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

            {/* Resource Allocation */}
            {prediction.resource_allocation?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-2">
                  {t({ en: 'Resource Allocation Suggestions', ar: 'اقتراحات تخصيص الموارد' })}
                </p>
                <ul className="space-y-1">
                  {prediction.resource_allocation.map((item, idx) => (
                    <li key={idx} className="text-sm text-green-800">• {item}</li>
                  ))}
                </ul>
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