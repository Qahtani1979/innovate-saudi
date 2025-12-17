import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Target, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildMIIImprovementPrompt, 
  miiImprovementSchema, 
  MII_IMPROVEMENT_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/mii';

export default function MIIImprovementPlanner({ municipalityId, currentScore }) {
  const { language, t } = useLanguage();
  const [plan, setPlan] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generatePlan = async () => {
    const result = await invokeAI({
      systemPrompt: getSystemPrompt(MII_IMPROVEMENT_SYSTEM_PROMPT),
      prompt: buildMIIImprovementPrompt(currentScore, 10, 12),
      response_json_schema: miiImprovementSchema
    });

    if (result.success) {
      setPlan(result.data);
      toast.success(t({ en: 'Plan generated', ar: 'الخطة مُولدت' }));
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {t({ en: 'MII Improvement Planner', ar: 'مخطط تحسين المؤشر' })}
          </CardTitle>
          <Button onClick={generatePlan} disabled={isLoading || !isAvailable} size="sm" className="bg-green-600">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Generate', ar: 'توليد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {plan && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded border-2 border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">🚀 {t({ en: 'Quick Wins:', ar: 'مكاسب سريعة:' })}</p>
              <ul className="space-y-1">
                {plan.quick_wins?.map((w, i) => (
                  <li key={i} className="text-xs text-green-700">• {w}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">🎯 {t({ en: 'Strategic:', ar: 'استراتيجي:' })}</p>
              <ul className="space-y-1">
                {plan.strategic?.map((s, i) => (
                  <li key={i} className="text-xs text-blue-700">• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
