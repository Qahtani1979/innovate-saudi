import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AIPricingSuggester({ solution, onPricingComplete }) {
  const { language, isRTL, t } = useLanguage();
  const [pricingData, setPricingData] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const handleAnalyzePricing = async () => {
    try {
      // Find similar solutions for pricing comparison
      const solutions = await base44.entities.Solution.list();
      const similarSolutions = solutions
        .filter(s => 
          s.id !== solution?.id && 
          s.pricing_model && 
          s.sectors?.some(sec => solution?.sectors?.includes(sec))
        )
        .slice(0, 10);

      const response = await invokeAI({
        prompt: `Analyze pricing for this solution in Saudi municipal market:

Solution: ${solution?.name_en}
Maturity: ${solution?.maturity_level}
TRL: ${solution?.trl}
Features: ${solution?.features?.join(', ')}
Sectors: ${solution?.sectors?.join(', ')}

Similar solutions pricing:
${similarSolutions.map(s => 
  `- ${s.name_en}: ${s.pricing_model} ${s.pricing_details?.monthly_cost ? '('+s.pricing_details.monthly_cost+' SAR/mo)' : ''}`
).join('\n')}

Provide BILINGUAL pricing intelligence (AR+EN):
1. Recommended pricing model (subscription/one-time/usage-based/custom)
2. Price range (min-max in SAR)
3. Justification for pricing strategy
4. ROI value proposition for municipalities
5. Competitive positioning (premium/mid-market/value)`,
        response_json_schema: {
          type: 'object',
          properties: {
            pricing_model: { type: 'string' },
            price_range: {
              type: 'object',
              properties: {
                min: { type: 'number' },
                max: { type: 'number' },
                currency: { type: 'string' }
              }
            },
            justification: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
            roi_value: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
            positioning: { type: 'string' }
          }
        }
      });

      if (response.success) {
        setPricingData(response.data);
        
        if (onPricingComplete) {
          onPricingComplete(response.data);
        }

        toast.success(t({ en: '✅ Pricing analysis complete', ar: '✅ اكتمل تحليل التسعير' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Pricing analysis failed', ar: 'فشل تحليل التسعير' }));
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {t({ en: 'AI Pricing Intelligence', ar: 'ذكاء التسعير' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!pricingData ? (
          <Button onClick={handleAnalyzePricing} disabled={analyzing} className="w-full bg-green-600">
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                {t({ en: '💰 Get Pricing Guidance', ar: '💰 الحصول على إرشادات التسعير' })}
              </>
            )}
          </Button>
        ) : (
          <>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-900 mb-2">
                {t({ en: 'Recommended Pricing Model', ar: 'نموذج التسعير الموصى به' })}
              </p>
              <Badge className="bg-green-600 text-white capitalize">{pricingData.pricing_model}</Badge>
              {pricingData.positioning && (
                <Badge className="ml-2 bg-blue-600 text-white capitalize">{pricingData.positioning}</Badge>
              )}
            </div>

            {pricingData.price_range && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t({ en: 'Suggested Price Range', ar: 'نطاق السعر المقترح' })}
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {pricingData.price_range.min?.toLocaleString()} - {pricingData.price_range.max?.toLocaleString()} {pricingData.price_range.currency || 'SAR'}
                </p>
              </div>
            )}

            {pricingData.justification && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-semibold text-purple-900 mb-1">
                  {t({ en: '📊 Justification', ar: '📊 المبرر' })}
                </p>
                <p className="text-sm text-slate-700">
                  {typeof pricingData.justification === 'object'
                    ? (language === 'ar' ? pricingData.justification.ar : pricingData.justification.en)
                    : pricingData.justification}
                </p>
              </div>
            )}

            {pricingData.roi_value && (
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  {t({ en: '💡 ROI Value Proposition', ar: '💡 قيمة العائد' })}
                </p>
                <p className="text-sm text-slate-700">
                  {typeof pricingData.roi_value === 'object'
                    ? (language === 'ar' ? pricingData.roi_value.ar : pricingData.roi_value.en)
                    : pricingData.roi_value}
                </p>
              </div>
            )}

            <Button onClick={handleAnalyzePricing} variant="outline" size="sm" className="w-full">
              {t({ en: 'Refresh Pricing Analysis', ar: 'تحديث تحليل التسعير' })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}