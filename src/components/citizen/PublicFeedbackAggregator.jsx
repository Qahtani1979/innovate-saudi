import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Sparkles, Loader2, TrendingUp, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  generateFeedbackAggregationPrompt,
  getFeedbackAggregationSchema,
  getFeedbackAggregationSystemPrompt
} from '@/lib/ai/prompts/citizen';
import { supabase } from '@/lib/supabase';

export default function PublicFeedbackAggregator({ municipalityId }) {
  const { language, t } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: feedback = [] } = useQuery({
    queryKey: ['public-feedback', municipalityId],
    queryFn: async () => {
      let query = supabase.from('citizen_feedback').select('*');

      if (municipalityId) {
        query = query.eq('challenge_id', municipalityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const aggregateAndAnalyze = async () => {
    const result = await invokeAI({
      prompt: generateFeedbackAggregationPrompt(feedback, { municipalityId }),
      response_json_schema: getFeedbackAggregationSchema(),
      system_prompt: getFeedbackAggregationSystemPrompt()
    });

    if (result.success) {
      setAnalysis(result.data);
      toast.success(t({ en: 'Analysis complete', ar: 'التحليل مكتمل' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            {t({ en: 'Public Feedback Aggregator', ar: 'مجمع التغذية الراجعة العامة' })}
          </CardTitle>
          <Button onClick={aggregateAndAnalyze} disabled={isLoading || !isAvailable || feedback.length === 0} size="sm" className="bg-green-600">
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
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />

        <div className="mb-4">
          <p className="text-sm text-slate-700">
            {t({ en: `Analyzing ${feedback.length} public feedback entries`, ar: `تحليل ${feedback.length} مدخلات من التغذية الراجعة` })}
          </p>
        </div>

        {!analysis && !isLoading && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI aggregates and analyzes public sentiment and themes', ar: 'الذكاء يجمع ويحلل المشاعر والمواضيع العامة' })}
            </p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {analysis.sentiment_breakdown && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-green-50 rounded text-center">
                  <p className="text-2xl font-bold text-green-600">{analysis.sentiment_breakdown.positive}%</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Positive', ar: 'إيجابي' })}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded text-center">
                  <p className="text-2xl font-bold text-slate-600">{analysis.sentiment_breakdown.neutral}%</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Neutral', ar: 'محايد' })}</p>
                </div>
                <div className="p-3 bg-red-50 rounded text-center">
                  <p className="text-2xl font-bold text-red-600">{analysis.sentiment_breakdown.negative}%</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Negative', ar: 'سلبي' })}</p>
                </div>
              </div>
            )}

            {analysis.themes?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  {t({ en: '🔥 Top Themes', ar: '🔥 المواضيع الرئيسية' })}
                </h4>
                <div className="space-y-2">
                  {analysis.themes.map((theme, i) => (
                    <div key={i} className="p-3 bg-white rounded border flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{theme.theme}</p>
                        <p className="text-xs text-slate-600">{theme.count} mentions</p>
                      </div>
                      <Badge className={
                        theme.priority === 'high' ? 'bg-red-100 text-red-700' :
                          theme.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                      }>{theme.priority}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.geographic_clusters?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t({ en: 'Geographic Hotspots', ar: 'النقاط الجغرافية الساخنة' })}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.geographic_clusters.map((loc, i) => (
                    <Badge key={i} variant="outline">{loc}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-purple-50 rounded border border-purple-300">
              <h4 className="font-semibold text-sm text-purple-900 mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t({ en: 'Trend:', ar: 'الاتجاه:' })}
              </h4>
              <p className="text-sm text-slate-700">{analysis.trend}</p>
            </div>

            {analysis.recommendations?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded border-2 border-amber-300">
                <h4 className="font-semibold text-sm text-amber-900 mb-2">
                  {t({ en: '💡 Recommendations', ar: '💡 التوصيات' })}
                </h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, i) => (
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
