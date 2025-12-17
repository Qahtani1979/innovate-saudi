import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { COST_BENEFIT_PROMPTS } from '@/lib/ai/prompts/scaling';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function ScalingCostBenefitAnalyzer({ pilot, targetMunicipalities }) {
  const { language, t } = useLanguage();
  const [forecast, setForecast] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const analyzeCostBenefit = async () => {
    const result = await invokeAI({
      systemPrompt: getSystemPrompt('scaling_cost_benefit'),
      prompt: COST_BENEFIT_PROMPTS.buildPrompt(pilot, targetMunicipalities),
      response_json_schema: COST_BENEFIT_PROMPTS.schema
    });

    if (result.success) {
      setForecast(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {t({ en: 'AI Cost-Benefit Analyzer', ar: 'محلل التكلفة والعائد الذكي' })}
          </CardTitle>
          <Button onClick={analyzeCostBenefit} disabled={analyzing || !isAvailable} size="sm" className="bg-green-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!forecast && !analyzing && (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: `AI forecasts economic impact of scaling to ${targetMunicipalities.length} municipalities`, ar: `الذكاء يتنبأ بالتأثير الاقتصادي للتوسع إلى ${targetMunicipalities.length} بلدية` })}
            </p>
          </div>
        )}

        {forecast && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-red-50 rounded-lg border-2 border-red-300 text-center">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Total Cost', ar: 'التكلفة الإجمالية' })}</p>
                <p className="text-xl font-bold text-red-600">{(forecast.total_cost / 1000000).toFixed(1)}M</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border-2 border-green-300 text-center">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Annual Benefit', ar: 'الفائدة السنوية' })}</p>
                <p className="text-xl font-bold text-green-600">{(forecast.annual_benefit / 1000000).toFixed(1)}M</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
                <p className="text-xs text-slate-600 mb-1">{t({ en: 'Break-Even', ar: 'التعادل' })}</p>
                <p className="text-xl font-bold text-blue-600">{forecast.break_even_months}{t({ en: 'mo', ar: 'ش' })}</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
                <p className="text-xs text-slate-600 mb-1">{t({ en: '3-Year ROI', ar: 'عائد 3 سنوات' })}</p>
                <p className="text-xl font-bold text-purple-600">{forecast.three_year_roi}%</p>
              </div>
            </div>

            {forecast.cashflow_projection?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Cashflow Projection', ar: 'توقع التدفق النقدي' })}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={forecast.cashflow_projection.slice(0, 36)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cost" stroke="#ef4444" name={t({ en: 'Cost', ar: 'التكلفة' })} />
                    <Line type="monotone" dataKey="benefit" stroke="#10b981" name={t({ en: 'Benefit', ar: 'الفائدة' })} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900">{t({ en: 'Investment Summary', ar: 'ملخص الاستثمار' })}</h4>
                <Badge className={forecast.three_year_roi >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {forecast.three_year_roi >= 100 ? t({ en: 'Strong ROI', ar: 'عائد قوي' }) : t({ en: 'Moderate ROI', ar: 'عائد متوسط' })}
                </Badge>
              </div>
              <p className="text-sm text-slate-700">
                {t({
                  en: `Scaling to ${targetMunicipalities.length} cities costs ${(forecast.total_cost / 1000000).toFixed(1)}M SAR, generates ${(forecast.annual_benefit / 1000000).toFixed(1)}M SAR annually. Break-even in ${forecast.break_even_months} months with ${forecast.three_year_roi}% ROI over 3 years.`,
                  ar: `التوسع لـ ${targetMunicipalities.length} مدينة يكلف ${(forecast.total_cost / 1000000).toFixed(1)} م ريال، يولد ${(forecast.annual_benefit / 1000000).toFixed(1)} م ريال سنوياً. التعادل في ${forecast.break_even_months} شهر مع عائد ${forecast.three_year_roi}٪ على 3 سنوات.`
                })}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
