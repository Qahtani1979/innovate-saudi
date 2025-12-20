import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, TrendingUp, AlertTriangle, Target, Zap, Loader2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function PredictiveInsights() {
  const { language, isRTL, t } = useLanguage();
  const [insights, setInsights] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateInsights = async () => {
    const { PREDICTIVE_INSIGHTS_PROMPT_TEMPLATE } = await import('@/lib/ai/prompts/insights/predictive');
    const promptConfig = PREDICTIVE_INSIGHTS_PROMPT_TEMPLATE();

    const result = await invokeAI({
      prompt: promptConfig.prompt,
      system_prompt: promptConfig.system,
      response_json_schema: promptConfig.schema
    });
    if (result.success) {
      setInsights(result.data);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'AI Predictive Insights', ar: 'الرؤى التنبؤية الذكية' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'AI-powered forecasting and strategic intelligence', ar: 'التنبؤ الذكي والذكاء الاستراتيجي' })}
          </p>
        </div>
        <Button onClick={generateInsights} disabled={loading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-blue-600">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />}
          {t({ en: 'Generate Insights', ar: 'توليد الرؤى' })}
        </Button>
      </div>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {!insights && !loading && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-8 pb-8 text-center">
            <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <p className="text-lg text-slate-700">
              {t({ en: 'Click "Generate Insights" to unlock AI predictions', ar: 'انقر "توليد الرؤى" للحصول على التنبؤات الذكية' })}
            </p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">{t({ en: 'AI is analyzing platform data...', ar: 'الذكاء الاصطناعي يحلل بيانات المنصة...' })}</p>
          </CardContent>
        </Card>
      )}

      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.emerging_challenges?.length > 0 && (
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Emerging Challenges', ar: 'تحديات ناشئة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.emerging_challenges.map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-slate-700">• {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.pilot_opportunities?.length > 0 && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Target className="h-5 w-5" />
                  {t({ en: 'Pilot Opportunities', ar: 'فرص التجريب' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.pilot_opportunities.map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-slate-700">• {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.breakthrough_sectors?.length > 0 && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Zap className="h-5 w-5" />
                  {t({ en: 'Breakthrough Sectors', ar: 'قطاعات الاختراق' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.breakthrough_sectors.map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-slate-700">• {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.scaling_opportunities?.length > 0 && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <TrendingUp className="h-5 w-5" />
                  {t({ en: 'Scaling Opportunities', ar: 'فرص التوسع' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.scaling_opportunities.map((item, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <p className="text-sm text-slate-700">• {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(PredictiveInsights, { requiredPermissions: [] });