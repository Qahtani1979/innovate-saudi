import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { DollarSign, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function ScalingCostBenefitAnalyzer({ pilot, targetMunicipalities }) {
  const { language, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [forecast, setForecast] = useState(null);

  const analyzeCostBenefit = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate cost-benefit analysis for scaling pilot:

PILOT: ${pilot.title_en}
- Current budget: ${pilot.budget}
- Current results: ${pilot.kpis?.map(k => `${k.name}: ${k.current}`).join(', ')}
- Target municipalities: ${targetMunicipalities.length}

For scaling to ${targetMunicipalities.length} cities, estimate:
1. Total deployment cost
2. Expected annual benefits (cost savings, efficiency gains)
3. Break-even point (months)
4. 3-year ROI
5. Cost per municipality
6. Benefit variance (best/worst case)`,
        response_json_schema: {
          type: "object",
          properties: {
            total_cost: { type: "number" },
            annual_benefit: { type: "number" },
            break_even_months: { type: "number" },
            three_year_roi: { type: "number" },
            cost_per_municipality: { type: "number" },
            benefit_variance: {
              type: "object",
              properties: {
                best_case: { type: "number" },
                worst_case: { type: "number" }
              }
            },
            cashflow_projection: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  month: { type: "number" },
                  cost: { type: "number" },
                  benefit: { type: "number" }
                }
              }
            }
          }
        }
      });

      setForecast(response);
      toast.success(t({ en: 'Analysis complete', ar: 'اكتمل التحليل' }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
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
          <Button onClick={analyzeCostBenefit} disabled={analyzing} size="sm" className="bg-green-600">
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
                <p className="text-xl font-bold text-blue-600">{forecast.break_even_months}mo</p>
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
                    <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost" />
                    <Line type="monotone" dataKey="benefit" stroke="#10b981" name="Benefit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900">{t({ en: 'Investment Summary', ar: 'ملخص الاستثمار' })}</h4>
                <Badge className={forecast.three_year_roi >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                  {forecast.three_year_roi >= 100 ? 'Strong ROI' : 'Moderate ROI'}
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