import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { RefreshCw, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useIterationPilots } from '../hooks/usePilots';
import { usePilotMutations } from '../hooks/usePilotMutations';

function IterationWorkflow() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { invokeAI, status, isLoading: generatingPlan, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: iterationPilots = [] } = useIterationPilots();
  const { startIteration } = usePilotMutations();

  const [selectedPilot, setSelectedPilot] = useState(null);
  const [iterationPlan, setIterationPlan] = useState('');

  const generateIterationPlan = async (pilot) => {
    const response = await invokeAI({
      prompt: `Generate iteration plan for this pilot that needs improvements:

Title: ${pilot.title_en}
Sector: ${pilot.sector}
Evaluation: ${pilot.evaluation_summary_en}
KPIs: ${JSON.stringify(pilot.kpis || [])}
Risks: ${JSON.stringify(pilot.risks || [])}
Lessons Learned: ${JSON.stringify(pilot.lessons_learned || [])}

Provide:
1. Key issues identified (3-5 points)
2. Recommended improvements for each issue
3. Revised KPI targets
4. Suggested timeline for iteration (weeks)
5. Budget adjustments needed
6. New success criteria

Return as structured JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          issues: { type: "array", items: { type: "string" } },
          improvements: { type: "array", items: { type: "string" } },
          revised_kpis: { type: "array", items: { type: "object" } },
          timeline_weeks: { type: "number" },
          budget_adjustment: { type: "string" },
          new_success_criteria: { type: "array", items: { type: "string" } },
          iteration_summary: { type: "string" }
        }
      }
    });

    if (response.success) {
      setIterationPlan(response.data.iteration_summary);
      setSelectedPilot({ ...pilot, iterationData: response.data });
      toast.success('AI generated iteration plan');
    }
  };

  const handleStartIteration = (pilotId) => {
    startIteration.mutate(pilotId, {
      onSuccess: () => {
        navigate(createPageUrl(`PilotEdit?id=${pilotId}`));
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 text-white">
        <div className="relative z-10">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 mb-3">
            {t({ en: 'Continuous Improvement', ar: 'التحسين المستمر' })}
          </Badge>
          <h1 className="text-5xl font-bold mb-2">
            {t({ en: 'Iteration Workflow', ar: 'سير عمل التحسين' })}
          </h1>
          <p className="text-xl text-white/90">
            {t({ en: 'Refine and improve pilots for better outcomes', ar: 'تحسين وتطوير التجارب لنتائج أفضل' })}
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span>{iterationPilots.length} {t({ en: 'pilots need iteration', ar: 'تجربة تحتاج تحسين' })}</span>
          </div>
        </div>
      </div>

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Pilots List */}
      <div className="space-y-4">
        {iterationPilots.map((pilot) => (
          <Card key={pilot.id} className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{pilot.code}</Badge>
                      <Badge className="bg-amber-100 text-amber-700">ITERATE</Badge>
                      <Badge variant="outline">{pilot.sector?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{pilot.title_en}</h3>
                    {pilot.evaluation_summary_en && (
                      <p className="text-sm text-slate-600 line-clamp-2">{pilot.evaluation_summary_en}</p>
                    )}
                  </div>
                  <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                    <Button variant="outline" size="sm">{t({ en: 'View Details', ar: 'عرض التفاصيل' })}</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg text-sm">
                  <div>
                    <span className="text-slate-500">{t({ en: 'Duration:', ar: 'المدة:' })}</span>
                    <p className="font-medium">{pilot.duration_weeks}w</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t({ en: 'Budget:', ar: 'الميزانية:' })}</span>
                    <p className="font-medium">{pilot.budget ? `${(pilot.budget / 1000).toFixed(0)}K` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t({ en: 'Success:', ar: 'النجاح:' })}</span>
                    <p className="font-medium text-amber-600">{pilot.success_probability || 50}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t({ en: 'KPIs:', ar: 'المؤشرات:' })}</span>
                    <p className="font-medium">{pilot.kpis?.length || 0}</p>
                  </div>
                </div>

                {selectedPilot?.id === pilot.id && selectedPilot.iterationData && (
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border-2 border-amber-300">
                    <p className="text-sm font-semibold text-amber-900 mb-3">
                      {t({ en: 'AI Iteration Plan', ar: 'خطة التحسين الذكية' })}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium text-slate-900 mb-1">{t({ en: 'Key Issues:', ar: 'القضايا الرئيسية:' })}</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {selectedPilot.iterationData.issues?.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium text-slate-900 mb-1">{t({ en: 'Improvements:', ar: 'التحسينات:' })}</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {selectedPilot.iterationData.improvements?.map((imp, idx) => (
                            <li key={idx}>{imp}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div>
                          <p className="text-xs text-slate-500">Timeline Adjustment</p>
                          <p className="font-medium">{selectedPilot.iterationData.timeline_weeks}w</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Budget Adjustment</p>
                          <p className="font-medium">{selectedPilot.iterationData.budget_adjustment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => generateIterationPlan(pilot)}
                    disabled={generatingPlan || !isAvailable}
                    className="flex-1"
                  >
                    {generatingPlan ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> {t({ en: 'Generate Plan', ar: 'إنشاء خطة' })}</>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleStartIteration(pilot.id)}
                    disabled={startIteration.isPending}
                    className="bg-gradient-to-r from-amber-600 to-orange-600 flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t({ en: 'Start Iteration', ar: 'بدء التحسين' })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {iterationPilots.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No pilots need iteration', ar: 'لا توجد تجارب تحتاج تحسين' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(IterationWorkflow, { requiredPermissions: [] });
