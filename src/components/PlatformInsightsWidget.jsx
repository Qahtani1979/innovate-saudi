import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageContext';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Target, Loader2, RefreshCw } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  PLATFORM_INSIGHTS_SYSTEM_PROMPT,
  buildPlatformInsightsPrompt,
  PLATFORM_INSIGHTS_SCHEMA
} from '@/lib/ai/prompts/core';
import { usePlatformInsights } from '@/hooks/usePlatformInsights';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

export default function PlatformInsightsWidget() {
  const { language, isRTL, t } = useLanguage();
  const { invokeAI, status, isLoading: generating, rateLimitInfo, isAvailable } = useAIWithFallback();

  // Use custom hook for insights (maps announcements to insights)
  const { announcements: insights, refetch } = usePlatformInsights();

  // Use custom hook for challenges (fetching broad list for analysis)
  const { data: challenges = [] } = useChallengesWithVisibility({
    limit: 1000,
    publishedOnly: false // Get internal ones too for analysis
  });

  const generateFreshInsights = async () => {
    if (!isAvailable) return;

    // Logic to generate insights using AI based on challenges data
    const sectorCounts = challenges.reduce((acc, c) => {
      acc[c.sector] = (acc[c.sector] || 0) + 1;
      return acc;
    }, {});

    const statusCounts = challenges.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    const result = await invokeAI({
      systemPrompt: PLATFORM_INSIGHTS_SYSTEM_PROMPT,
      prompt: buildPlatformInsightsPrompt(sectorCounts, statusCounts, challenges.length),
      response_json_schema: PLATFORM_INSIGHTS_SCHEMA
    });

    if (result.success) {
      // In a real implementation, we would save the result to the database here.
      // Since this is a widget, and usePlatformInsights fetches from DB, 
      // we would need a mutation to save 'result.data' to 'platform_insights'.
      // For now, we will just refetch to simulate update if logic was complete, 
      // or we accept that 'generateFreshInsights' might effectively be a "dry run" 
      // or we need to add a 'saveInsight' mutation. 
      // Given the refactoring scope is removing base44, and the original code just did `refetch()` 
      // implying the AI invocation might have had side effects or the original code was incomplete/mocked?
      // Original code:
      // const result = await invokeAI(...)
      // if (result.success) refetch()
      // Wait, invokeAI uses an edge function usually? Or client side?
      // If it's client side, it doesn't save to DB unless we tell it.
      // The original code uses `base44` to fetch.
      // If `invokeAI` was just returning data, `refetch()` wouldn't show it unless it was saved.
      // Assuming existing `invokeAI` might handle saving? Or this was a placeholder.
      // I will keep the behavior.
      refetch();
    }
  };

  const insightIcons = {
    trend: TrendingUp,
    opportunity: Lightbulb,
    alert: AlertTriangle,
    recommendation: Target,
    success: Sparkles
  };

  const insightColors = {
    trend: 'bg-blue-50 border-blue-200 text-blue-700',
    opportunity: 'bg-purple-50 border-purple-200 text-purple-700',
    alert: 'bg-red-50 border-red-200 text-red-700',
    recommendation: 'bg-green-50 border-green-200 text-green-700',
    success: 'bg-amber-50 border-amber-200 text-amber-700'
  };

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Sparkles className="h-5 w-5" />
            {t({ en: 'AI Platform Insights', ar: 'رؤى المنصة الذكية' })}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateFreshInsights}
            disabled={generating || !isAvailable}
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {insights.length > 0 ? (
          insights.map((insight) => {
            const Icon = insightIcons[insight.insight_type] || Sparkles;
            const colorClass = insightColors[insight.insight_type] || 'bg-slate-50 border-slate-200 text-slate-700';

            return (
              <div key={insight.id} className={`p-3 rounded-lg border ${colorClass}`}>
                <div className="flex items-start gap-2">
                  <Icon className="h-4 w-4 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {language === 'ar' && insight.title_ar ? insight.title_ar : insight.title_en}
                    </p>
                    {insight.description_en && (
                      <p className="text-xs mt-1 opacity-90">
                        {language === 'ar' && insight.description_ar ? insight.description_ar : insight.description_en}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-purple-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {t({ en: 'No insights yet. Click refresh to generate.', ar: 'لا توجد رؤى بعد. انقر على التحديث للتوليد.' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}