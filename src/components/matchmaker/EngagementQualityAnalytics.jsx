import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Sparkles, Loader2, Send } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  ENGAGEMENT_QUALITY_SYSTEM_PROMPT, 
  buildEngagementQualityPrompt, 
  ENGAGEMENT_QUALITY_SCHEMA 
} from '@/lib/ai/prompts/matchmaker/engagementQuality';

export default function EngagementQualityAnalytics({ matchId, engagementHistory }) {
  const { language, t } = useLanguage();
  const [analysis, setAnalysis] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const meetings = engagementHistory?.filter(e => e.type === 'meeting').length || 0;
  const documents = engagementHistory?.filter(e => e.type === 'document').length || 0;
  const daysSinceLastContact = engagementHistory?.length > 0
    ? Math.floor((new Date() - new Date(engagementHistory[0].date)) / (1000 * 60 * 60 * 24))
    : 999;

  const analyzeEngagement = async () => {
    const response = await invokeAI({
      system_prompt: ENGAGEMENT_QUALITY_SYSTEM_PROMPT,
      prompt: buildEngagementQualityPrompt({
        engagements: engagementHistory?.map(e => ({
          type: e.type,
          date: e.date,
          meetings,
          documents,
          daysSinceLastContact
        })),
        conversions: [],
        timeframe: 'Last 30 days'
      }),
      response_json_schema: ENGAGEMENT_QUALITY_SCHEMA
    });

    if (response.success) {
      setAnalysis(response.data);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t({ en: 'Engagement Quality Analytics', ar: 'تحليلات جودة المشاركة' })}
          </CardTitle>
          <Button onClick={analyzeEngagement} disabled={isLoading || !isAvailable} size="sm" className="bg-purple-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Analyze', ar: 'تحليل' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!analysis && !isLoading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg border text-center">
              <p className="text-2xl font-bold text-blue-600">{meetings}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Meetings', ar: 'اجتماعات' })}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border text-center">
              <p className="text-2xl font-bold text-green-600">{documents}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Documents', ar: 'مستندات' })}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border text-center">
              <p className="text-2xl font-bold text-yellow-600">{daysSinceLastContact}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Days Idle', ar: 'أيام خمول' })}</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 text-center ${
                analysis.conversion_probability >= 75 ? 'bg-green-50 border-green-300' :
                analysis.conversion_probability >= 50 ? 'bg-yellow-50 border-yellow-300' :
                'bg-red-50 border-red-300'
              }`}>
                <p className="text-sm text-slate-600 mb-1">{t({ en: 'Conversion Probability', ar: 'احتمالية التحويل' })}</p>
                <p className="text-4xl font-bold">{analysis.conversion_probability}%</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
                <p className="text-sm text-slate-600 mb-1">{t({ en: 'Quality Score', ar: 'درجة الجودة' })}</p>
                <p className="text-4xl font-bold text-purple-600">{analysis.quality_score}</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              analysis.status === 'healthy' ? 'bg-green-50 border-green-300' :
              analysis.status === 'at_risk' ? 'bg-yellow-50 border-yellow-300' :
              'bg-red-50 border-red-300'
            }`}>
              <Badge className="mb-2">{analysis.status?.toUpperCase()}</Badge>
              <p className="font-semibold text-slate-900 mb-2">{t({ en: 'Next Action:', ar: 'الإجراء التالي:' })}</p>
              <p className="text-sm text-slate-700 mb-3">{analysis.next_action}</p>
              
              {analysis.intervention_needed && (
                <Button size="sm" className="w-full bg-red-600">
                  <Send className="h-3 w-3 mr-1" />
                  {t({ en: 'Send Intervention', ar: 'إرسال تدخل' })}
                </Button>
              )}
            </div>

            {analysis.recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-300">
                <p className="font-semibold text-blue-900 mb-2">{t({ en: 'Recommendations:', ar: 'التوصيات:' })}</p>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-slate-700">✓ {rec}</li>
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
