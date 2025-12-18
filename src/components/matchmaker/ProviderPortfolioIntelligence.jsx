import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  PORTFOLIO_ANALYSIS_SYSTEM_PROMPT,
  buildPortfolioAnalysisPrompt,
  PORTFOLIO_ANALYSIS_SCHEMA
} from '@/lib/ai/prompts/matchmaker/portfolioAnalysis';

export default function ProviderPortfolioIntelligence({ providerId }) {
  const { language, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: matches = [] } = useQuery({
    queryKey: ['provider-matches', providerId],
    queryFn: () => base44.entities.MatchmakerApplication.filter({ provider_id: providerId }),
    initialData: []
  });

  const analyzePortfolio = async () => {
    const successBySector = matches.reduce((acc, m) => {
      const sector = m.sector || 'other';
      if (!acc[sector]) acc[sector] = { total: 0, success: 0 };
      acc[sector].total += 1;
      if (m.status === 'converted_to_pilot') acc[sector].success += 1;
      return acc;
    }, {});

    const result = await invokeAI({
      system_prompt: PORTFOLIO_ANALYSIS_SYSTEM_PROMPT,
      prompt: buildPortfolioAnalysisPrompt({ successBySector }),
      response_json_schema: PORTFOLIO_ANALYSIS_SCHEMA
    });

    if (result.success) {
      setInsights(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'التحليل مكتمل' }));
    }
  };

  const sectorData = Object.entries(
    matches.reduce((acc, m) => {
      const sector = m.sector || 'other';
      acc[sector] = (acc[sector] || 0) + 1;
      return acc;
    }, {})
  ).map(([sector, count]) => ({ sector, count }));

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {t({ en: 'Portfolio Intelligence', ar: 'ذكاء المحفظة' })}
          </CardTitle>
          <Button onClick={analyzePortfolio} disabled={analyzing || !isAvailable} size="sm" className="bg-blue-600">
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        <div>
          <h4 className="font-semibold text-sm mb-3">{t({ en: 'Sector Distribution', ar: 'توزيع القطاعات' })}</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={sectorData}>
              <XAxis dataKey="sector" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {insights && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded border-2 border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">✅ {t({ en: 'Strong Sectors', ar: 'القطاعات القوية' })}</p>
              <div className="flex flex-wrap gap-1">
                {insights.strong_sectors?.map((s, i) => (
                  <Badge key={i} className="bg-green-600 text-xs">{s}</Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded border-2 border-amber-200">
              <p className="text-xs font-semibold text-amber-900 mb-2">⚠️ {t({ en: 'Growth Opportunities', ar: 'فرص النمو' })}</p>
              <ul className="space-y-1">
                {insights.opportunities?.map((opp, i) => (
                  <li key={i} className="text-xs text-slate-700">• {opp}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">💡 {t({ en: 'Recommendations', ar: 'التوصيات' })}</p>
              <ul className="space-y-1">
                {insights.recommendations?.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-700">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}