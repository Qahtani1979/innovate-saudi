import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengeImpactForecaster({ challenge }) {
  const { language, t } = useLanguage();
  const [forecasting, setForecasting] = useState(false);
  const [forecast, setForecast] = useState(null);

  const generateForecast = async () => {
    setForecasting(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Forecast impact if challenge is resolved:

CHALLENGE: ${challenge.title_en}
SECTOR: ${challenge.sector}
AFFECTED POPULATION: ${challenge.affected_population?.size || 'Unknown'}
CURRENT SEVERITY: ${challenge.severity_score || 'Not scored'}
BUDGET ESTIMATE: ${challenge.budget_estimate || 'Not estimated'}

Predict if resolved:
1. MII impact: estimated point increase (0-10 scale)
2. Complaint reduction: percentage decrease
3. Annual cost savings: estimated in SAR
4. Citizen satisfaction: improvement percentage
5. Confidence level: 0-100%
6. ROI estimate: cost to solve vs annual value`,
        response_json_schema: {
          type: "object",
          properties: {
            mii_impact: { type: "number" },
            complaint_reduction_percent: { type: "number" },
            annual_savings_sar: { type: "number" },
            satisfaction_improvement: { type: "number" },
            confidence: { type: "number" },
            roi_multiple: { type: "number" },
            summary: { type: "string" },
            comparison: { type: "string" }
          }
        }
      });

      setForecast(response);
      toast.success(t({ en: 'Forecast generated', ar: 'التنبؤ مُنشأ' }));
    } catch (error) {
      toast.error(t({ en: 'Forecast failed', ar: 'فشل التنبؤ' }));
    } finally {
      setForecasting(false);
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Impact Forecaster', ar: 'متنبئ التأثير' })}
          </CardTitle>
          <Button onClick={generateForecast} disabled={forecasting} size="sm" className="bg-green-600">
            {forecasting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Forecast', ar: 'توقع' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!forecast && !forecasting && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI predicts MII impact, cost savings, and ROI if challenge resolved', ar: 'الذكاء يتنبأ بتأثير المؤشر، توفير التكاليف، والعائد إذا حُل التحدي' })}
            </p>
          </div>
        )}

        {forecast && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 rounded border-2 border-blue-300 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-blue-600">+{forecast.mii_impact}</p>
                <p className="text-xs text-slate-600">{t({ en: 'MII Points', ar: 'نقاط المؤشر' })}</p>
              </div>
              <div className="p-4 bg-green-50 rounded border-2 border-green-300 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-green-600">{(forecast.annual_savings_sar / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-slate-600">{t({ en: 'SAR Savings/Year', ar: 'ريال توفير/سنة' })}</p>
              </div>
              <div className="p-4 bg-red-50 rounded border text-center">
                <p className="text-3xl font-bold text-red-600">-{forecast.complaint_reduction_percent}%</p>
                <p className="text-xs text-slate-600">{t({ en: 'Complaints', ar: 'الشكاوى' })}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded border text-center">
                <p className="text-3xl font-bold text-purple-600">{forecast.roi_multiple}x</p>
                <p className="text-xs text-slate-600">{t({ en: 'ROI', ar: 'العائد' })}</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <h4 className="font-semibold text-sm text-green-900 mb-2">
                {t({ en: '📊 Forecast Summary', ar: '📊 ملخص التنبؤ' })}
              </h4>
              <p className="text-sm text-slate-700">{forecast.summary}</p>
              {forecast.comparison && (
                <p className="text-sm text-slate-600 mt-2 italic">{forecast.comparison}</p>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border">
              <span className="text-sm text-slate-700">{t({ en: 'Confidence Level', ar: 'مستوى الثقة' })}</span>
              <Badge className="bg-blue-600">{forecast.confidence}%</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}