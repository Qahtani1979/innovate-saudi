import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, X } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { SCALING_INSIGHTS_PROMPTS } from '@/lib/ai/prompts/scaling';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function ScalingListAIInsights({ completedPilots, scaledPilots }) {
  const { t, isRTL } = useLanguage();
  const [insights, setInsights] = useState(null);
  const [visible, setVisible] = useState(false);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generateInsights = async () => {
    setVisible(true);
    
    const response = await invokeAI({
      systemPrompt: getSystemPrompt('scaling_insights'),
      prompt: SCALING_INSIGHTS_PROMPTS.buildPrompt(completedPilots, scaledPilots),
      response_json_schema: SCALING_INSIGHTS_PROMPTS.schema
    });

    if (response.success) {
      setInsights(response.data);
    }
  };

  if (!visible) {
    return (
      <Button onClick={generateInsights} variant="outline" className="gap-2" disabled={!isAvailable}>
        <Sparkles className="h-4 w-4" />
        {t({ en: 'AI Scaling Insights', ar: 'رؤى التوسع الذكية' })}
      </Button>
    );
  }

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-5 w-5" />
            {t({ en: 'AI National Scaling Insights', ar: 'رؤى التوسع الوطني الذكية' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing...', ar: 'يحلل...' })}</span>
          </div>
        ) : insights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.priority_pilots?.length > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Priority Pilots', ar: 'تجارب ذات أولوية' })}</h4>
                <ul className="text-sm space-y-1">
                  {insights.priority_pilots.map((item, i) => (
                    <li key={i} className="text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {insights.geographic_strategy?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Geographic Strategy', ar: 'استراتيجية جغرافية' })}</h4>
                <ul className="text-sm space-y-1">
                  {insights.geographic_strategy.map((item, i) => (
                    <li key={i} className="text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {insights.sector_opportunities?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Sector Opportunities', ar: 'فرص القطاعات' })}</h4>
                <ul className="text-sm space-y-1">
                  {insights.sector_opportunities.map((item, i) => (
                    <li key={i} className="text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {insights.budget_optimization?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Budget Optimization', ar: 'تحسين الميزانية' })}</h4>
                <ul className="text-sm space-y-1">
                  {insights.budget_optimization.map((item, i) => (
                    <li key={i} className="text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {insights.risk_mitigation?.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg md:col-span-2">
                <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' })}</h4>
                <ul className="text-sm space-y-1">
                  {insights.risk_mitigation.map((item, i) => (
                    <li key={i} className="text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
