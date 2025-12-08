import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from '../LanguageContext';
import { DollarSign, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function DynamicPricingIntelligence({ solution }) {
  const { language, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [pricing, setPricing] = useState(null);

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const analyzePricing = async () => {
    setAnalyzing(true);
    try {
      const peers = solutions.filter(s => 
        s.sectors?.some(sec => solution.sectors?.includes(sec)) &&
        s.id !== solution.id &&
        s.pricing_details?.setup_cost
      );

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Pricing intelligence for solution:

SOLUTION: ${solution.name_en}
MATURITY: ${solution.maturity_level}
TRL: ${solution.trl || 'N/A'}
SECTORS: ${solution.sectors?.join(', ') || 'N/A'}
DEPLOYMENTS: ${solution.deployment_count || 0}

COMPETITOR DATA: ${peers.length} similar solutions
Sample pricing: ${peers.slice(0, 5).map(s => 
  `${s.name_en}: ${s.pricing_details?.setup_cost || '?'} SAR`
).join(', ')}

Provide:
1. Recommended price range (min-max SAR)
2. Average competitor pricing
3. Price elasticity estimate (win rate at different prices)
4. Optimal price for conversion vs margin
5. Market positioning advice`,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_min: { type: "number" },
            recommended_max: { type: "number" },
            optimal_price: { type: "number" },
            competitor_average: { type: "number" },
            elasticity: {
              type: "object",
              properties: {
                low_price_winrate: { type: "number" },
                mid_price_winrate: { type: "number" },
                high_price_winrate: { type: "number" }
              }
            },
            positioning_advice: { type: "string" }
          }
        }
      });

      setPricing(response);
      toast.success(t({ en: 'Pricing analysis complete', ar: 'تحليل التسعير مكتمل' }));
    } catch (error) {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {t({ en: 'Pricing Intelligence', ar: 'ذكاء التسعير' })}
          </CardTitle>
          <Button onClick={analyzePricing} disabled={analyzing} size="sm" className="bg-green-600">
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
        {!pricing && !analyzing && (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI recommends pricing based on features, market, and competitors', ar: 'الذكاء يوصي بالتسعير بناءً على الميزات والسوق والمنافسين' })}
            </p>
          </div>
        )}

        {pricing && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 text-center">
              <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
              <p className="text-4xl font-bold text-green-600">
                {(pricing.optimal_price / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'SAR - Optimal Price', ar: 'ريال - السعر الأمثل' })}</p>
              <div className="mt-3 flex justify-center gap-2">
                <Badge variant="outline">{(pricing.recommended_min / 1000).toFixed(0)}K min</Badge>
                <Badge variant="outline">{(pricing.recommended_max / 1000).toFixed(0)}K max</Badge>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">{t({ en: 'Market Average', ar: 'متوسط السوق' })}:</span>
                <span className="font-bold text-slate-900">{(pricing.competitor_average / 1000).toFixed(0)}K SAR</span>
              </div>
            </div>

            {pricing.elasticity && (
              <div className="p-4 bg-blue-50 rounded border-2 border-blue-300">
                <h4 className="font-semibold text-sm text-blue-900 mb-3">
                  {t({ en: '📊 Price Elasticity', ar: '📊 مرونة السعر' })}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t({ en: 'Low Price', ar: 'سعر منخفض' })} ({(pricing.recommended_min / 1000).toFixed(0)}K):</span>
                    <Badge className="bg-green-600">{pricing.elasticity.low_price_winrate}% win rate</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t({ en: 'Mid Price', ar: 'سعر متوسط' })} ({(pricing.optimal_price / 1000).toFixed(0)}K):</span>
                    <Badge className="bg-blue-600">{pricing.elasticity.mid_price_winrate}% win rate</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>{t({ en: 'High Price', ar: 'سعر عالي' })} ({(pricing.recommended_max / 1000).toFixed(0)}K):</span>
                    <Badge className="bg-yellow-600">{pricing.elasticity.high_price_winrate}% win rate</Badge>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-purple-50 rounded border border-purple-300">
              <h4 className="font-semibold text-sm text-purple-900 mb-2">
                {t({ en: '💡 Positioning Advice', ar: '💡 نصيحة الوضع' })}
              </h4>
              <p className="text-sm text-slate-700">{pricing.positioning_advice}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}