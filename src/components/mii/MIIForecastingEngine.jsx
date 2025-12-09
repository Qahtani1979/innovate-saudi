import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function MIIForecastingEngine({ municipalityId }) {
  const { language, t } = useLanguage();
  const [forecast, setForecast] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateForecast = async () => {
    const result = await invokeAI({
      prompt: `Forecast MII score for next 12 months based on:
- Current score: 68
- Active pilots: 5
- Planned investments: Infrastructure upgrade, 2 new programs
- Historical trend: +3 points/year

Provide monthly forecast with reasoning.`,
      response_json_schema: {
        type: "object",
        properties: {
          forecasts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string" },
                score: { type: "number" }
              }
            }
          },
          drivers: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setForecast(result.data);
      toast.success(t({ en: 'Forecast generated', ar: 'التنبؤ مُولد' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'MII Forecasting', ar: 'التنبؤ بالمؤشر' })}
          </CardTitle>
          <Button onClick={generateForecast} disabled={isLoading || !isAvailable} size="sm" className="bg-blue-600">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Forecast', ar: 'تنبؤ' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {forecast && (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={forecast.forecasts}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[60, 80]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">{t({ en: '🎯 Key Drivers:', ar: '🎯 المحركات الرئيسية:' })}</p>
              <ul className="space-y-1">
                {forecast.drivers?.map((driver, i) => (
                  <li key={i} className="text-xs text-blue-700">• {driver}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
