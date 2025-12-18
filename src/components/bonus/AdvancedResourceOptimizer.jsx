import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  RESOURCE_OPTIMIZER_SYSTEM_PROMPT, 
  buildResourceOptimizerPrompt, 
  RESOURCE_OPTIMIZER_SCHEMA 
} from '@/lib/ai/prompts/bonus/resourceOptimizer';

export default function AdvancedResourceOptimizer({ resources, currentAllocation }) {
  const { language, t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const optimize = async () => {
    const result = await invokeAI({
      system_prompt: RESOURCE_OPTIMIZER_SYSTEM_PROMPT,
      prompt: buildResourceOptimizerPrompt({ resources, currentAllocation }),
      response_json_schema: RESOURCE_OPTIMIZER_SCHEMA
    });

    if (result.success) {
      setRecommendations(result.data);
      toast.success(t({ en: 'Optimization complete', ar: 'التحسين مكتمل' }));
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
          <Button onClick={optimize} disabled={isLoading || !isAvailable} size="sm" className="bg-indigo-600">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Optimize', ar: 'تحسين' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mb-4" />
        
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
