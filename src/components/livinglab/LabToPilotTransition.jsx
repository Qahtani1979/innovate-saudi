import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function LabToPilotTransition({ labProject }) {
  const { language, t } = useLanguage();
  const [readiness, setReadiness] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const assessReadiness = async () => {
    const result = await invokeAI({
      prompt: `Assess readiness for lab-to-pilot transition:

Lab Project: ${labProject?.title_en}
Results: ${labProject?.results_summary || 'N/A'}
TRL: ${labProject?.trl || 4}

Evaluate:
1. Technical readiness (0-100)
2. Regulatory clearance status
3. Budget requirements for pilot
4. Recommended pilot municipalities
5. Risk factors`,
      response_json_schema: {
        type: "object",
        properties: {
          readiness_score: { type: "number" },
          regulatory_status: { type: "string" },
          budget_estimate: { type: "string" },
          municipalities: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setReadiness(result.data);
      toast.success(t({ en: 'Assessment complete', ar: 'التقييم مكتمل' }));
    }
  };

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-teal-600" />
            {t({ en: 'Lab → Pilot Transition', ar: 'الانتقال من المختبر للتجربة' })}
          </CardTitle>
          <Button onClick={assessReadiness} disabled={isLoading || !isAvailable} size="sm" className="bg-teal-600">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t({ en: 'Assess', ar: 'تقييم' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        {readiness && (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-lg border-2 border-teal-300 text-center">
              <p className="text-4xl font-bold text-teal-900">{readiness.readiness_score}%</p>
              <p className="text-sm text-teal-700">{t({ en: 'Pilot Readiness', ar: 'جاهزية التجربة' })}</p>
            </div>
            <div className="p-3 bg-white rounded border">
              <p className="text-xs text-slate-500 font-semibold">{t({ en: 'Budget Estimate:', ar: 'تقدير الميزانية:' })}</p>
              <p className="text-sm font-bold text-slate-900">{readiness.budget_estimate}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded border">
              <p className="text-xs text-blue-700 font-semibold mb-2">{t({ en: 'Recommended Municipalities:', ar: 'البلديات الموصى بها:' })}</p>
              <div className="flex flex-wrap gap-1">
                {readiness.municipalities?.map((m, i) => (
                  <Badge key={i} className="bg-blue-600">{m}</Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
