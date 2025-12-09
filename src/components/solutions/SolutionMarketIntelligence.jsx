import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Globe, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function SolutionMarketIntelligence({ solution }) {
  const { language, t } = useLanguage();
  const [intel, setIntel] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const fetchIntelligence = async () => {
    const response = await invokeAI({
      prompt: `Provide market intelligence for this municipal innovation solution:

Solution: ${solution.name_en}
Category: ${solution.category}
Description: ${solution.description_en}

Research and provide:
1. Global market trends in this category (2024-2025)
2. Estimated global market size and growth rate
3. Key competitors and market leaders
4. Emerging technologies in this space
5. Pricing benchmarks (if available)
6. Success factors for market penetration`,
      response_json_schema: {
        type: "object",
        properties: {
          market_trends: { type: "array", items: { type: "string" } },
          market_size: { type: "string" },
          competitors: { type: "array", items: { type: "string" } },
          emerging_tech: { type: "array", items: { type: "string" } },
          pricing_insights: { type: "string" },
          success_factors: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (response.success) {
      setIntel(response.data);
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-600" />
            {t({ en: 'Market Intelligence', ar: 'ذكاء السوق' })}
          </CardTitle>
          <Button onClick={fetchIntelligence} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Get Intel', ar: 'احصل على المعلومات' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!intel && !isLoading && (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI researches global market trends and competitive landscape', ar: 'الذكاء يبحث اتجاهات السوق العالمية والمنافسة' })}
            </p>
          </div>
        )}

        {intel && (
          <div className="space-y-4">
            {intel.market_size && (
              <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-teal-600" />
                  <h4 className="font-semibold text-sm text-teal-900">
                    {t({ en: 'Market Size', ar: 'حجم السوق' })}
                  </h4>
                </div>
                <p className="text-sm text-slate-700">{intel.market_size}</p>
              </div>
            )}

            {intel.market_trends?.length > 0 && (
              <div className="p-4 bg-white rounded border">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-sm text-blue-900">
                    {t({ en: 'Market Trends', ar: 'اتجاهات السوق' })}
                  </h4>
                </div>
                <ul className="space-y-1">
                  {intel.market_trends.map((trend, i) => (
                    <li key={i} className="text-xs text-slate-700">• {trend}</li>
                  ))}
                </ul>
              </div>
            )}

            {intel.competitors?.length > 0 && (
              <div className="p-4 bg-white rounded border">
                <h4 className="font-semibold text-sm text-slate-900 mb-3">
                  {t({ en: 'Key Competitors', ar: 'المنافسون الرئيسيون' })}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {intel.competitors.map((comp, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{comp}</Badge>
                  ))}
                </div>
              </div>
            )}

            {intel.emerging_tech?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded border border-purple-300">
                <h4 className="font-semibold text-sm text-purple-900 mb-3">
                  {t({ en: 'Emerging Technologies', ar: 'التقنيات الناشئة' })}
                </h4>
                <ul className="space-y-1">
                  {intel.emerging_tech.map((tech, i) => (
                    <li key={i} className="text-xs text-slate-700">• {tech}</li>
                  ))}
                </ul>
              </div>
            )}

            {intel.pricing_insights && (
              <div className="p-4 bg-amber-50 rounded border border-amber-300">
                <h4 className="font-semibold text-sm text-amber-900 mb-2">
                  {t({ en: 'Pricing Insights', ar: 'رؤى التسعير' })}
                </h4>
                <p className="text-xs text-slate-700">{intel.pricing_insights}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}