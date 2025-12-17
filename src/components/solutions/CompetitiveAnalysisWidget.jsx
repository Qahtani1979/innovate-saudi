import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Loader2, Target, TrendingUp, Award, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildCompetitiveAnalysisWidgetPrompt, 
  competitiveAnalysisWidgetSchema,
  COMPETITIVE_ANALYSIS_WIDGET_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/solution';

export default function CompetitiveAnalysisWidget({ solution, onAnalysisComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [competitors, setCompetitors] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const handleAnalyze = async () => {
    try {
      const embeddingResult = await base44.functions.invoke('generateEmbeddings', {
        text: `${solution?.name_en || ''} ${solution?.description_en || ''}`,
        return_embedding: true
      });

      let matches = { data: { results: [] } };
      if (embeddingResult.data?.embedding) {
        matches = await base44.functions.invoke('semanticSearch', {
          entity_name: 'Solution',
          query_embedding: embeddingResult.data.embedding,
          top_k: 5,
          filter: { id: { $ne: solution?.id } }
        });

        setCompetitors(matches.data?.results || []);
      }

      const { success, data } = await invokeAI({
        system_prompt: getSystemPrompt(COMPETITIVE_ANALYSIS_WIDGET_SYSTEM_PROMPT),
        prompt: buildCompetitiveAnalysisWidgetPrompt(solution, matches.data?.results),
        response_json_schema: competitiveAnalysisWidgetSchema
      });

      if (success && data) {
        setAnalysis(data);
        
        if (onAnalysisComplete) {
          onAnalysisComplete({ competitors: matches.data?.results, analysis: data });
        }
        
        toast.success(t({ en: '✅ Competitive analysis complete', ar: '✅ اكتمل التحليل التنافسي' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          {t({ en: 'Competitive Analysis', ar: 'التحليل التنافسي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
        
        {!competitors.length && !analysis ? (
          <Button onClick={handleAnalyze} disabled={isLoading || !isAvailable} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                {t({ en: '🔍 Analyze Competition', ar: '🔍 تحليل المنافسة' })}
              </>
            )}
          </Button>
        ) : (
          <>
            {competitors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">
                  {t({ en: 'Similar Solutions Found:', ar: 'حلول مشابهة:' })}
                </p>
                <div className="space-y-2">
                  {competitors.slice(0, 5).map((comp, i) => (
                    <div key={i} className="p-2 bg-slate-50 rounded border flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{comp.name_en}</p>
                        <p className="text-xs text-slate-600">{comp.provider_name}</p>
                      </div>
                      <Badge>{Math.round(comp.score * 100)}% similar</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis && (
              <>
                {analysis.differentiators?.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 mb-2">
                      {t({ en: '✨ Key Differentiators', ar: '✨ المميزات الرئيسية' })}
                    </p>
                    <ul className="text-sm space-y-1">
                      {analysis.differentiators.map((item, i) => (
                        <li key={i} className="text-slate-700">
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.positioning && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      {t({ en: '🎯 Positioning Strategy', ar: '🎯 استراتيجية التموضع' })}
                    </p>
                    <p className="text-sm text-slate-700">
                      {typeof analysis.positioning === 'object' 
                        ? (language === 'ar' ? analysis.positioning.ar : analysis.positioning.en)
                        : analysis.positioning}
                    </p>
                  </div>
                )}

                {analysis.pricing_strategy && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      {t({ en: '💰 Pricing Strategy', ar: '💰 استراتيجية التسعير' })}
                    </p>
                    <p className="text-sm text-slate-700">
                      {typeof analysis.pricing_strategy === 'object'
                        ? (language === 'ar' ? analysis.pricing_strategy.ar : analysis.pricing_strategy.en)
                        : analysis.pricing_strategy}
                    </p>
                  </div>
                )}
              </>
            )}

            <Button onClick={handleAnalyze} variant="outline" size="sm" className="w-full" disabled={isLoading || !isAvailable}>
              {t({ en: 'Refresh Analysis', ar: 'تحديث التحليل' })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
