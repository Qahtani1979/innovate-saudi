import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getPortfolioOptimizerPrompt, portfolioOptimizerSchema } from '@/lib/ai/prompts/portfolio';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function PilotPortfolioOptimizer() {
  const { language, t } = useLanguage();
  const { invokeAI, status, isLoading: optimizing, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [recommendations, setRecommendations] = useState(null);

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
    initialData: []
  });

  const optimize = async () => {
    const prompt = getPortfolioOptimizerPrompt(pilots);
    
    const result = await invokeAI({
      prompt,
      response_json_schema: portfolioOptimizerSchema,
      system_prompt: getSystemPrompt('INNOVATION', true)
    });

    if (result.success) {
      setRecommendations(result.data);
      toast.success(t({ en: 'Optimization complete', ar: 'التحسين مكتمل' }));
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Portfolio Optimizer', ar: 'محسّن المحفظة' })}
          </CardTitle>
          <Button onClick={optimize} disabled={optimizing || !isAvailable} size="sm" className="bg-indigo-600">
            {optimizing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Optimize', ar: 'حسّن' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
      </CardHeader>
      <CardContent className="pt-6">
        {!recommendations && !optimizing && (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI analyzes portfolio health and suggests optimal resource allocation', ar: 'الذكاء يحلل صحة المحفظة ويقترح تخصيص الموارد الأمثل' })}
            </p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-4">
            {recommendations.portfolio_health_score && (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300 text-center">
                <TrendingUp className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                <p className="text-4xl font-bold text-indigo-600">{recommendations.portfolio_health_score}</p>
                <p className="text-sm text-slate-600 mt-1">{t({ en: 'Portfolio Health Score', ar: 'درجة صحة المحفظة' })}</p>
              </div>
            )}

            {recommendations.accelerate?.length > 0 && (
              <div className="p-4 bg-green-50 rounded border-2 border-green-300">
                <h4 className="font-semibold text-green-900 mb-3">
                  {t({ en: '🚀 ACCELERATE', ar: '🚀 تسريع' })} ({recommendations.accelerate.length})
                </h4>
                {recommendations.accelerate.map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded mb-2">
                    <p className="font-medium text-sm text-slate-900">{item.pilot_title}</p>
                    <p className="text-xs text-slate-600 mt-1">{item.rationale}</p>
                    <p className="text-xs text-green-700 mt-1 font-medium">→ {item.action}</p>
                  </div>
                ))}
              </div>
            )}

            {recommendations.pause?.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded border-2 border-yellow-300">
                <h4 className="font-semibold text-yellow-900 mb-3">
                  {t({ en: '⏸️ PAUSE', ar: '⏸️ إيقاف' })} ({recommendations.pause.length})
                </h4>
                {recommendations.pause.map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded mb-2">
                    <p className="font-medium text-sm text-slate-900">{item.pilot_title}</p>
                    <p className="text-xs text-slate-600 mt-1">{item.rationale}</p>
                    <p className="text-xs text-yellow-700 mt-1 font-medium">→ {item.alternative}</p>
                  </div>
                ))}
              </div>
            )}

            {recommendations.terminate?.length > 0 && (
              <div className="p-4 bg-red-50 rounded border-2 border-red-300">
                <h4 className="font-semibold text-red-900 mb-3">
                  {t({ en: '🛑 TERMINATE', ar: '🛑 إنهاء' })} ({recommendations.terminate.length})
                </h4>
                {recommendations.terminate.map((item, i) => (
                  <div key={i} className="p-3 bg-white rounded mb-2">
                    <p className="font-medium text-sm text-slate-900">{item.pilot_title}</p>
                    <p className="text-xs text-slate-600 mt-1">{item.rationale}</p>
                  </div>
                ))}
              </div>
            )}

            {recommendations.rebalancing_suggestions?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded border-2 border-purple-300">
                <h4 className="font-semibold text-purple-900 mb-3">
                  {t({ en: '💡 Rebalancing Suggestions', ar: '💡 اقتراحات إعادة التوازن' })}
                </h4>
                <ul className="space-y-2">
                  {recommendations.rebalancing_suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-slate-700">• {suggestion}</li>
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