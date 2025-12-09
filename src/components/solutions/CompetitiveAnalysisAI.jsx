import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function CompetitiveAnalysisAI({ solution, allSolutions }) {
  const { language, isRTL, t } = useLanguage();
  const [analysis, setAnalysis] = useState(null);
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();

  const handleAnalyze = async () => {
    const competitors = allSolutions.filter(s => 
      s.id !== solution.id && 
      s.sectors?.some(sec => solution.sectors?.includes(sec))
    ).slice(0, 5);

    const { success, data } = await invokeAI({
      prompt: `Perform competitive analysis for this solution in BOTH English and Arabic:

Solution: ${solution.name_en}
Provider: ${solution.provider_name}
Maturity: ${solution.maturity_level}
Pricing: ${solution.pricing_model}
Features: ${solution.features?.join(', ')}

Competitors:
${competitors.map(c => `- ${c.name_en} (${c.provider_name}): ${c.maturity_level}, ${c.pricing_model}`).join('\n')}

Provide bilingual analysis:
1. Market positioning (strengths/weaknesses vs competitors)
2. Unique differentiators
3. Pricing competitiveness
4. Target market fit
5. Recommendations for improvement`,
      response_json_schema: {
        type: 'object',
        properties: {
          positioning: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
          differentiators: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          pricing_analysis: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
          market_fit: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
          recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          competitive_score: { type: 'number' }
        }
      }
    });

    if (success) {
      setAnalysis(data);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Competitive Analysis', ar: 'تحليل تنافسي ذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        {!analysis ? (
          <Button onClick={handleAnalyze} disabled={loading || !isAvailable} className="w-full bg-purple-600 hover:bg-purple-700">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Run Competitive Analysis', ar: 'تشغيل التحليل التنافسي' })}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Competitive Score */}
            <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
              <p className="text-sm text-slate-600 mb-1">{t({ en: 'Competitive Score', ar: 'النتيجة التنافسية' })}</p>
              <p className="text-5xl font-bold text-purple-600">{analysis.competitive_score}/100</p>
            </div>

            {/* Market Positioning */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Market Positioning', ar: 'الموقع في السوق' })}</h4>
              <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {analysis.positioning?.[language] || analysis.positioning?.en}
              </p>
            </div>

            {/* Differentiators */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Unique Differentiators', ar: 'المميزات الفريدة' })}</h4>
              <ul className="space-y-1 text-sm">
                {analysis.differentiators?.map((item, i) => (
                  <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    ✓ {typeof item === 'object' ? item[language] || item.en : item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Analysis */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Pricing Competitiveness', ar: 'تنافسية التسعير' })}</h4>
              <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {analysis.pricing_analysis?.[language] || analysis.pricing_analysis?.en}
              </p>
            </div>

            {/* Market Fit */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Market Fit', ar: 'ملاءمة السوق' })}</h4>
              <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {analysis.market_fit?.[language] || analysis.market_fit?.en}
              </p>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Improvement Recommendations', ar: 'توصيات التحسين' })}</h4>
              <ul className="space-y-1 text-sm">
                {analysis.recommendations?.map((item, i) => (
                  <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    💡 {typeof item === 'object' ? item[language] || item.en : item}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={handleAnalyze} variant="outline" className="w-full">
              {t({ en: 'Refresh Analysis', ar: 'تحديث التحليل' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}