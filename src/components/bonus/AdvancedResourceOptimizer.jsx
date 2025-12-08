import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedResourceOptimizer() {
  const { language, t } = useLanguage();
  const [optimizing, setOptimizing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const optimize = async () => {
    setOptimizing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize resource allocation across platform:

Resources:
- Budget: 50M SAR
- Expert mentors: 15 available
- Living lab slots: 20 per quarter
- Sandbox zones: 3 active

Current allocation:
- Pilots: 30M, 8 mentors, 12 lab slots
- R&D: 15M, 5 mentors, 8 lab slots
- Programs: 5M, 2 mentors, 0 lab slots

Recommend reallocation for maximum ROI and suggest conflicts to resolve.`,
        response_json_schema: {
          type: "object",
          properties: {
            reallocations: { type: "array", items: { type: "string" } },
            expected_roi_gain: { type: "string" },
            conflicts: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRecommendations(response);
      toast.success(t({ en: 'Optimization complete', ar: 'التحسين مكتمل' }));
    } catch (error) {
      toast.error(t({ en: 'Failed', ar: 'فشل' }));
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Resource Optimizer', ar: 'محسن الموارد' })}
          </CardTitle>
          <Button onClick={optimize} disabled={optimizing} size="sm" className="bg-indigo-600">
            {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Optimize', ar: 'تحسين' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {recommendations && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded border-2 border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">💡 {t({ en: 'Reallocations:', ar: 'إعادة التوزيع:' })}</p>
              <ul className="space-y-1">
                {recommendations.reallocations?.map((r, i) => (
                  <li key={i} className="text-xs text-green-700">• {r}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs font-semibold text-blue-900">{t({ en: 'Expected ROI Gain:', ar: 'مكسب العائد المتوقع:' })}</p>
              <p className="text-sm text-blue-700 mt-1">{recommendations.expected_roi_gain}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}