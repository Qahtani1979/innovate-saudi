import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdaptiveRolloutSequencing({ scalingPlan, municipalities }) {
  const { language, t } = useLanguage();
  const [optimizing, setOptimizing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const optimizeSequence = async () => {
    setOptimizing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Optimize rollout sequence based on real-time performance:

Current Plan: ${scalingPlan?.phases?.map(p => p.municipalities?.join(', ')).join(' → ')}

Municipality Performance:
${municipalities?.map(m => 
  `${m.name_en}: Adoption ${m.adoption_rate || 0}%, Issues: ${m.issue_count || 0}`
).join('\n')}

Recommend:
1. Should we accelerate any phase?
2. Should we delay/support any municipality?
3. Optimal next sequence
4. Specific interventions needed`,
        response_json_schema: {
          type: "object",
          properties: {
            accelerate: { type: "array", items: { type: "string" } },
            delay_support: { type: "array", items: { type: "string" } },
            next_sequence: { type: "array", items: { type: "string" } },
            interventions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setRecommendation(response);
      toast.success(t({ en: 'Optimization complete', ar: 'التحسين مكتمل' }));
    } catch (error) {
      toast.error(t({ en: 'Optimization failed', ar: 'فشل التحسين' }));
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            {t({ en: 'Adaptive Sequencing', ar: 'التسلسل التكيفي' })}
          </CardTitle>
          <Button onClick={optimizeSequence} disabled={optimizing} size="sm" className="bg-teal-600">
            {optimizing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Optimize', ar: 'تحسين' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!recommendation && !optimizing && (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI adjusts rollout sequence based on real-time performance', ar: 'الذكاء يعدل تسلسل الإطلاق بناءً على الأداء الفعلي' })}
            </p>
          </div>
        )}

        {recommendation && (
          <div className="space-y-3">
            {recommendation.accelerate?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border-2 border-green-200">
                <p className="text-xs font-semibold text-green-900 mb-2">🚀 {t({ en: 'Accelerate', ar: 'تسريع' })}</p>
                <ul className="space-y-1">
                  {recommendation.accelerate.map((item, i) => (
                    <li key={i} className="text-xs text-green-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendation.delay_support?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border-2 border-amber-200">
                <p className="text-xs font-semibold text-amber-900 mb-2">⚠️ {t({ en: 'Delay & Support', ar: 'تأخير ودعم' })}</p>
                <ul className="space-y-1">
                  {recommendation.delay_support.map((item, i) => (
                    <li key={i} className="text-xs text-amber-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded border-2 border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">📋 {t({ en: 'Recommended Sequence', ar: 'التسلسل الموصى به' })}</p>
              <ol className="space-y-1">
                {recommendation.next_sequence?.map((step, i) => (
                  <li key={i} className="text-xs text-blue-700">{i + 1}. {step}</li>
                ))}
              </ol>
            </div>

            {recommendation.interventions?.length > 0 && (
              <div className="p-3 bg-purple-50 rounded border-2 border-purple-200">
                <p className="text-xs font-semibold text-purple-900 mb-2">💡 {t({ en: 'Interventions Needed', ar: 'التدخلات المطلوبة' })}</p>
                <ul className="space-y-1">
                  {recommendation.interventions.map((int, i) => (
                    <li key={i} className="text-xs text-purple-700">• {int}</li>
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