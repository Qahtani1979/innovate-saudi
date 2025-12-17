import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { buildHistoricalTrendPrompt, historicalTrendSchema, HISTORICAL_TREND_SYSTEM_PROMPT } from '@/lib/ai/prompts/data';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function HistoricalTrendAnalyzer({ entityType, metric }) {
  const { language, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: trends = [] } = useQuery({
    queryKey: ['trends', entityType, metric],
    queryFn: async () => {
      const all = await base44.entities.TrendEntry.list('-created_date', 30);
      return all.filter(e => e.entity_type === entityType && e.metric_name === metric);
    }
  });

  const chartData = trends.map(t => ({
    date: new Date(t.created_date).toLocaleDateString(),
    value: t.metric_value
  }));

  const analyzePattern = async () => {
    const result = await invokeAI({
      prompt: buildHistoricalTrendPrompt(metric, trends),
      systemPrompt: getSystemPrompt(HISTORICAL_TREND_SYSTEM_PROMPT),
      response_json_schema: historicalTrendSchema
    });

    if (result.success) {
      setInsights(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'التحليل مكتمل' }));
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            {t({ en: 'Trend Analysis', ar: 'تحليل الاتجاه' })}
          </CardTitle>
          <Button onClick={analyzePattern} disabled={analyzing || trends.length < 3 || !isAvailable} size="sm" className="bg-teal-600">
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
      </CardHeader>
      <CardContent className="pt-6">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}

        {insights && (
          <div className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded text-center">
                <p className="text-xs text-slate-600">{t({ en: 'Trend', ar: 'الاتجاه' })}</p>
                <Badge className="mt-1 bg-blue-600 text-white">{insights.trend_direction}</Badge>
              </div>
              <div className="p-3 bg-purple-50 rounded text-center">
                <p className="text-xs text-slate-600">{t({ en: 'Rate', ar: 'المعدل' })}</p>
                <p className="text-sm font-medium text-purple-900 mt-1">{insights.rate_of_change}</p>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded border border-green-300">
              <p className="text-xs font-semibold text-green-900 mb-1">
                {t({ en: 'Forecast:', ar: 'التنبؤ:' })}
              </p>
              <p className="text-sm text-slate-700">{insights.forecast}</p>
            </div>

            {insights.recommendations?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-2">
                  {t({ en: 'Recommendations:', ar: 'التوصيات:' })}
                </p>
                <ul className="space-y-1">
                  {insights.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-700">→ {rec}</li>
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
