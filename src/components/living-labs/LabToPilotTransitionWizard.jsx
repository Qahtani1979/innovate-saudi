import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Rocket, Sparkles, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { usePilotMutations } from '@/hooks/usePilotMutations';

export default function LabToPilotTransitionWizard({ rdProject }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [pilotDraft, setPilotDraft] = useState(null);
  const { triggerEmail } = useEmailTrigger();

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  /* Refactored to useGoldStandard usePilotMutations */
  const { createPilot } = usePilotMutations();

  const handleCreatePilot = () => {
    createPilot.mutate({
      ...pilotDraft,
      rd_project_id: rdProject.id,
      sector: rdProject.sector || 'other',
      stage: 'design',
      budget: pilotDraft.budget_estimate,
      trl_start: rdProject.current_trl || rdProject.starting_trl,
      // Metadata for traceability
      metadata: {
        source: 'lab_transition',
        rd_project_title: rdProject.title_en,
        original_objectives: rdProject.objectives_en
      }
    }, {
      onSuccess: (pilot) => {
        navigate(createPageUrl(`PilotDetail?id=${pilot.id}`));
      }
    });
  };

  const generatePilotDraft = async () => {
    const { success, data } = await invokeAI({
      prompt: `Convert R&D project to municipal pilot proposal:

R&D PROJECT: ${rdProject.title_en}
OBJECTIVES: ${rdProject.objectives_en}
OUTPUTS: ${rdProject.expected_outputs?.join(', ')}
TRL: ${rdProject.current_trl || rdProject.starting_trl}
TEAM: ${rdProject.principal_investigator?.name}

Generate pilot proposal:
1. Title (concise, action-oriented)
2. Objective (what will be tested/validated)
3. Hypothesis (what we expect to learn)
4. Methodology (how the pilot will run)
5. Target population & scope
6. Suggested KPIs (3-5 measurable outcomes)
7. Timeline estimate (weeks)
8. Budget estimate (SAR)
9. Recommended municipality type (large/medium/small city)`,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          objective_en: { type: "string" },
          hypothesis: { type: "string" },
          methodology: { type: "string" },
          scope: { type: "string" },
          kpis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                baseline: { type: "string" },
                target: { type: "string" }
              }
            }
          },
          duration_weeks: { type: "number" },
          budget_estimate: { type: "number" },
          municipality_recommendation: { type: "string" }
        }
      }
    });

    if (success && data) {
      setPilotDraft(data);
      toast.success(t({ en: 'Draft generated', ar: 'المسودة أُنشئت' }));
    }
  };


  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-teal-600" />
          {t({ en: 'Lab → Pilot Fast-Track', ar: 'المسار السريع من المختبر للتجربة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />

        {!pilotDraft && (
          <div className="text-center py-8">
            <Rocket className="h-12 w-12 text-teal-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'AI converts lab research into ready-to-deploy pilot proposal', ar: 'الذكاء يحول بحث المختبر إلى مقترح تجربة جاهز للنشر' })}
            </p>
            <Button onClick={generatePilotDraft} disabled={isLoading || !isAvailable} className="bg-gradient-to-r from-teal-600 to-cyan-600">
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Pilot Proposal', ar: 'إنشاء مقترح التجربة' })}
            </Button>
          </div>
        )}

        {pilotDraft && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">{pilotDraft.title_en}</h3>
              </div>
              <p className="text-sm text-slate-700 mb-3">{pilotDraft.objective_en}</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-white rounded border">
                  <p className="text-xs text-slate-600">{t({ en: 'Duration', ar: 'المدة' })}</p>
                  <p className="text-lg font-bold text-teal-600">{pilotDraft.duration_weeks}w</p>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <p className="text-xs text-slate-600">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                  <p className="text-lg font-bold text-teal-600">{(pilotDraft.budget_estimate / 1000).toFixed(0)}K</p>
                </div>
                <div className="text-center p-2 bg-white rounded border">
                  <p className="text-xs text-slate-600">{t({ en: 'KPIs', ar: 'مؤشرات' })}</p>
                  <p className="text-lg font-bold text-teal-600">{pilotDraft.kpis?.length || 0}</p>
                </div>
              </div>
            </div>

            {pilotDraft.kpis?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900 mb-2">
                  {t({ en: 'Suggested KPIs', ar: 'المؤشرات المقترحة' })}
                </h4>
                <div className="space-y-2">
                  {pilotDraft.kpis.map((kpi, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border text-sm">
                      <p className="font-medium text-slate-900">{kpi.name}</p>
                      <div className="flex gap-4 mt-1 text-xs">
                        <span className="text-slate-600">Baseline: {kpi.baseline}</span>
                        <span className="text-green-600 font-medium">Target: {kpi.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded border border-blue-300">
              <p className="text-sm font-medium text-blue-900 mb-1">
                {t({ en: 'AI Recommendation:', ar: 'توصية الذكاء الاصطناعي:' })}
              </p>
              <p className="text-sm text-slate-700">{pilotDraft.municipality_recommendation}</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreatePilot} disabled={createPilot.isPending} className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600">
                <Rocket className="h-4 w-4 mr-2" />
                {t({ en: 'Create Pilot', ar: 'إنشاء التجربة' })}
              </Button>
              <Button variant="outline" onClick={() => setPilotDraft(null)}>
                {t({ en: 'Regenerate', ar: 'إعادة إنشاء' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
