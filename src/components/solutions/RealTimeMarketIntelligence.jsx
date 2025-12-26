import { useState, useEffect } from 'react';
import { useCompetitors } from '@/hooks/useMarketIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, AlertCircle, Sparkles, Loader2, Eye, DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildMarketIntelligencePrompt,
  MARKET_INTELLIGENCE_SYSTEM_PROMPT,
  MARKET_INTELLIGENCE_SCHEMA
} from '@/lib/ai/prompts/solutions/marketIntelligence';

export default function RealTimeMarketIntelligence({ solution }) {
  const { t } = useLanguage();
  const [intelligence, setIntelligence] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: competitors = [] } = useCompetitors(solution?.id, solution?.sectors);

  const fetchIntelligence = async () => {
    const result = await invokeAI({
      system_prompt: MARKET_INTELLIGENCE_SYSTEM_PROMPT,
      prompt: buildMarketIntelligencePrompt({ solution, competitors }),
      add_context_from_internet: true,
      response_json_schema: MARKET_INTELLIGENCE_SCHEMA
    });

    if (result.success) {
      result.data.last_updated = new Date().toISOString();
      setIntelligence(result.data);
      toast.success(t({ en: 'Intelligence updated', ar: 'تم تحديث المعلومات' }));
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchIntelligence, 300000); // 5 minutes
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const positionColors = {
    leader: 'green',
    strong: 'blue',
    moderate: 'yellow',
    weak: 'red'
  };

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Real-Time Market Intelligence', ar: 'معلومات السوق الفعلية' })}
            {intelligence && (
              <Badge variant="outline" className="text-xs">
                Updated {new Date(intelligence.last_updated).toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={autoRefresh ? 'default' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Auto ✓' : 'Manual'}
            </Button>
            <Button
              size="sm"
              onClick={fetchIntelligence}
              disabled={analyzing || !isAvailable}
              className="bg-indigo-600"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {!intelligence ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">
              {t({ en: 'Get real-time market intelligence', ar: 'احصل على معلومات السوق' })}
            </p>
          </div>
        ) : (
          <>
            {/* Market Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
                <DollarSign className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-blue-600">
                  {(intelligence.market_size_sar / 1000000).toFixed(0)}M
                </p>
                <p className="text-xs text-slate-600">Market Size (SAR)</p>
              </div>
              <div className="p-3 bg-green-50 rounded border border-green-200 text-center">
                <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-green-600">
                  +{intelligence.market_growth_rate}%
                </p>
                <p className="text-xs text-slate-600">Annual Growth</p>
              </div>
              <div className={`p-3 bg-${positionColors[intelligence.competitive_position]}-50 rounded border border-${positionColors[intelligence.competitive_position]}-200 text-center`}>
                <Users className="h-5 w-5 mx-auto mb-1" />
                <p className="text-xl font-bold capitalize">
                  {intelligence.competitive_position}
                </p>
                <p className="text-xs text-slate-600">Position</p>
              </div>
            </div>

            {/* Pricing Intelligence */}
            {intelligence.pricing_analysis && (
              <div className="p-3 bg-purple-50 rounded border border-purple-200">
                <p className="text-sm font-semibold text-purple-900 mb-2">
                  {t({ en: 'Pricing Intelligence', ar: 'معلومات التسعير' })}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-slate-600">Market Avg:</span>
                    <span className="font-bold ml-1">{intelligence.pricing_analysis.market_average_monthly} SAR/mo</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Our Position:</span>
                    <Badge className="ml-1 text-xs">{intelligence.pricing_analysis.our_position}</Badge>
                  </div>
                </div>
                <p className="text-xs text-purple-800 bg-white/50 p-2 rounded">
                  💡 {intelligence.pricing_analysis.recommendation}
                </p>
              </div>
            )}

            {/* Competitor Movements */}
            {intelligence.competitor_movements?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t({ en: 'Competitor Activity', ar: 'نشاط المنافسين' })}
                </p>
                <ul className="space-y-1">
                  {intelligence.competitor_movements.map((move, i) => (
                    <li key={i} className="text-xs text-amber-800">📍 {move}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Threats & Opportunities */}
            <div className="grid md:grid-cols-2 gap-3">
              {intelligence.emerging_threats?.length > 0 && (
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {t({ en: 'Threats', ar: 'المخاطر' })}
                  </p>
                  <ul className="space-y-1">
                    {intelligence.emerging_threats.map((threat, i) => (
                      <li key={i} className="text-xs text-red-800">⚠️ {threat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {intelligence.market_opportunities?.length > 0 && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t({ en: 'Opportunities', ar: 'الفرص' })}
                  </p>
                  <ul className="space-y-1">
                    {intelligence.market_opportunities.map((opp, i) => (
                      <li key={i} className="text-xs text-green-800">✓ {opp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Strategic Recommendations */}
            {intelligence.strategic_recommendations?.length > 0 && (
              <div className="p-3 bg-indigo-50 rounded border-2 border-indigo-300">
                <p className="text-sm font-semibold text-indigo-900 mb-2">
                  {t({ en: 'Strategic Recommendations', ar: 'التوصيات الاستراتيجية' })}
                </p>
                <ol className="space-y-1">
                  {intelligence.strategic_recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-indigo-800">{i + 1}. {rec}</li>
                  ))}
                </ol>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
