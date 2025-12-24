import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { 
  CROSS_JOURNEY_SYSTEM_PROMPT, 
  buildCrossJourneyPrompt, 
  CROSS_JOURNEY_SCHEMA 
} from '@/lib/ai/prompts/bonus/crossJourney';

export default function CrossJourneyInsightsDashboard() {
  const { language, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const analyzeCrossJourney = async () => {
    const result = await invokeAI({
      system_prompt: CROSS_JOURNEY_SYSTEM_PROMPT,
      prompt: buildCrossJourneyPrompt({ challenges, pilots, solutions, rdProjects }),
      response_json_schema: CROSS_JOURNEY_SCHEMA
    });

    if (result.success) {
      setInsights(result.data);
      toast.success(t({ en: 'Cross-journey analysis complete', ar: 'التحليل المتقاطع مكتمل' }));
    } else {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            {t({ en: 'Cross-Journey Insights', ar: 'رؤى متقاطعة' })}
          </CardTitle>
          <Button onClick={analyzeCrossJourney} disabled={analyzing} size="sm" className="bg-purple-600">
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
        {!insights && !analyzing && (
          <div className="text-center py-8">
            <Network className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI analyzes patterns across all innovation journeys', ar: 'الذكاء يحلل الأنماط عبر جميع رحلات الابتكار' })}
            </p>
          </div>
        )}

        {insights && (
          <div className="space-y-4">
            {insights.cross_sector_patterns?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t({ en: 'Cross-Sector Patterns', ar: 'الأنماط المتقاطعة' })}
                </h4>
                <ul className="space-y-1">
                  {insights.cross_sector_patterns.map((p, i) => (
                    <li key={i} className="text-sm text-slate-700">• {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.bottlenecks?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                <h4 className="font-semibold text-sm text-red-900 mb-2">
                  {t({ en: '⚠️ Innovation Bottlenecks', ar: '⚠️ الاختناقات' })}
                </h4>
                <div className="space-y-2">
                  {insights.bottlenecks.map((b, i) => (
                    <div key={i} className="p-2 bg-white rounded border">
                      <Badge variant="outline" className="mb-1 text-xs">{b.stage}</Badge>
                      <p className="text-sm text-slate-700">{b.description}</p>
                      <p className="text-xs text-red-700 mt-1">Impact: {b.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.success_patterns?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: '✨ Success Patterns', ar: '✨ أنماط النجاح' })}
                </h4>
                <ul className="space-y-1">
                  {insights.success_patterns.map((p, i) => (
                    <li key={i} className="text-sm text-slate-700">✓ {p}</li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
                <h4 className="font-semibold text-sm text-purple-900 mb-2">
                  {t({ en: '🎯 Strategic Recommendations', ar: '🎯 التوصيات الاستراتيجية' })}
                </h4>
                <div className="space-y-2">
                  {insights.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-slate-700 pt-0.5">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}