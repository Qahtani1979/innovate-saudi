import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function TreatmentPlanCoPilot({ challenge }) {
  const { language, t } = useLanguage();
  const [plan, setPlan] = useState(null);
  const { invokeAI, status, isLoading: generating, rateLimitInfo, isAvailable } = useAIWithFallback();

  const generatePlan = async () => {
    const { success, data } = await invokeAI({
      prompt: `Generate treatment plan for challenge:

CHALLENGE: ${challenge.title_en}
SECTOR: ${challenge.sector}
ROOT CAUSE: ${challenge.root_cause_en || 'Not specified'}
PRIORITY: ${challenge.priority}

Based on similar challenges, suggest:
1. Recommended approach (pilot/R&D/program/procurement)
2. Step-by-step treatment plan (5-7 milestones)
3. Timeline estimation (weeks/months)
4. Resource allocation (team size, budget range)
5. Key success factors
6. Potential risks and mitigation`,
      response_json_schema: {
        type: "object",
        properties: {
          recommended_approach: { type: "string" },
          milestones: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                duration: { type: "string" },
                deliverables: { type: "array", items: { type: "string" } }
              }
            }
          },
          timeline_weeks: { type: "number" },
          team_size: { type: "string" },
          budget_estimate: { type: "string" },
          success_factors: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (success) {
      setPlan(data);
      toast.success(t({ en: 'Treatment plan generated', ar: 'خطة المعالجة أُنشئت' }));
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            {t({ en: 'AI Treatment Plan Co-Pilot', ar: 'مساعد خطة المعالجة الذكي' })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={generatePlan} disabled={generating || !isAvailable} size="sm" className="bg-indigo-600">
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Plan', ar: 'إنشاء خطة' })}
            </Button>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!plan && !generating && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI suggests treatment approach, milestones, and resources based on similar challenges', ar: 'الذكاء يقترح نهج المعالجة والمعالم والموارد بناءً على تحديات مشابهة' })}
            </p>
          </div>
        )}

        {plan && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300">
              <h4 className="font-bold text-indigo-900 mb-2">
                {t({ en: 'Recommended Approach', ar: 'النهج الموصى به' })}
              </h4>
              <p className="text-sm text-slate-700">{plan.recommended_approach}</p>
              <div className="flex gap-2 mt-3">
                <Badge>{plan.timeline_weeks} weeks</Badge>
                <Badge variant="outline">{plan.team_size}</Badge>
                <Badge variant="outline">{plan.budget_estimate}</Badge>
              </div>
            </div>

            {plan.milestones?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-3">
                  {t({ en: '📋 Suggested Milestones', ar: '📋 المعالم المقترحة' })}
                </h4>
                <div className="space-y-2">
                  {plan.milestones.map((milestone, i) => (
                    <div key={i} className="p-3 bg-white rounded border">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-medium text-slate-900">{milestone.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">{milestone.duration}</Badge>
                      </div>
                      {milestone.deliverables?.length > 0 && (
                        <ul className="ml-8 space-y-1 mt-2">
                          {milestone.deliverables.map((d, j) => (
                            <li key={j} className="text-xs text-slate-600">• {d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.success_factors?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t({ en: 'Success Factors', ar: 'عوامل النجاح' })}
                </h4>
                <ul className="space-y-1">
                  {plan.success_factors.map((factor, i) => (
                    <li key={i} className="text-sm text-slate-700">✓ {factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {plan.risks?.length > 0 && (
              <div className="p-3 bg-red-50 rounded border border-red-300">
                <h4 className="font-semibold text-sm text-red-900 mb-2">
                  {t({ en: '⚠️ Risks & Mitigation', ar: '⚠️ المخاطر والتخفيف' })}
                </h4>
                <ul className="space-y-1">
                  {plan.risks.map((risk, i) => (
                    <li key={i} className="text-sm text-slate-700">⚠️ {risk}</li>
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