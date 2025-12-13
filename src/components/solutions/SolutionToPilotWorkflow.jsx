import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Sparkles, TestTube, Loader2, CheckCircle2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';

export default function SolutionToPilotWorkflow({ solution, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { triggerEmail } = useEmailTrigger();
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState('');
  const [pilotData, setPilotData] = useState({
    title_en: '',
    title_ar: '',
    hypothesis: '',
    objective_en: '',
    objective_ar: '',
    kpis: []
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-solution-match'],
    queryFn: () => base44.entities.Challenge.filter({ sector: solution.sectors?.[0], status: 'approved' })
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-for-pilot'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const createPilotMutation = useMutation({
    mutationFn: async (data) => {
      const pilot = await base44.entities.Pilot.create(data);
      
      await base44.entities.SystemActivity.create({
        entity_type: 'solution',
        entity_id: solution.id,
        action: 'proposed_pilot',
        description: `Provider proposed pilot: ${pilot.title_en}`
      });

      return pilot;
    },
    onSuccess: async (pilot) => {
      // Send pilot created email notification using hook
      await triggerEmail('pilot.created', {
        entityType: 'pilot',
        entityId: pilot.id,
        variables: {
          pilot_title: pilot.title_en || pilot.title_ar,
          pilot_code: pilot.code || `PLT-${pilot.id?.substring(0, 8)}`,
          solution_name: solution.name_en,
          start_date: new Date().toISOString().split('T')[0]
        }
      }).catch(err => console.error('Email trigger failed:', err));

      queryClient.invalidateQueries({ queryKey: ['pilots'] });
      toast.success(t({ en: 'Pilot proposal created', ar: 'تم إنشاء مقترح التجربة' }));
      onSuccess?.(pilot);
      onClose?.();
    }
  });

  const generateWithAI = async () => {
    if (!selectedChallengeId || !selectedMunicipalityId) {
      toast.error(t({ en: 'Select challenge and municipality', ar: 'اختر التحدي والبلدية' }));
      return;
    }

    const challenge = challenges.find(c => c.id === selectedChallengeId);
    
    const response = await invokeAI({
      prompt: `Design a pilot to test this solution for a challenge.

SOLUTION:
Name: ${solution.name_en}
Description: ${solution.description_en}
Features: ${solution.features?.join(', ')}
Maturity: ${solution.maturity_level}
TRL: ${solution.trl}

CHALLENGE:
Title: ${challenge?.title_en}
Problem: ${challenge?.problem_statement_en}
Desired Outcome: ${challenge?.desired_outcome_en}

Generate pilot design:
- Hypothesis (what we're testing)
- Objectives (bilingual)
- Success KPIs (3-5 measurable metrics)
- Test methodology
- Budget estimate`,
      response_json_schema: {
        type: "object",
        properties: {
          title_en: { type: "string" },
          title_ar: { type: "string" },
          hypothesis: { type: "string" },
          objective_en: { type: "string" },
          objective_ar: { type: "string" },
          methodology: { type: "string" },
          kpis: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name_en: { type: "string" },
                name_ar: { type: "string" },
                target: { type: "string" }
              }
            }
          },
          budget_estimate: { type: "number" }
        }
      }
    });

    if (response.success) {
      setPilotData(response.data);
      toast.success(t({ en: 'AI designed pilot', ar: 'تم تصميم التجربة' }));
    }
  };

  const handleSubmit = () => {
    if (!pilotData.hypothesis) {
      toast.error(t({ en: 'Generate pilot design first', ar: 'يرجى توليد تصميم التجربة' }));
      return;
    }

    createPilotMutation.mutate({
      ...pilotData,
      solution_id: solution.id,
      challenge_id: selectedChallengeId,
      municipality_id: selectedMunicipalityId,
      sector: solution.sectors?.[0],
      trl_start: solution.trl,
      provider_id: solution.provider_id,
      provider_name: solution.provider_name,
      stage: 'design',
      status: 'proposal_pending'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-6 w-6" />
            {t({ en: 'Propose Pilot for Solution', ar: 'اقتراح تجربة للحل' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm font-semibold text-teal-900 mb-1">
              {t({ en: 'Solution:', ar: 'الحل:' })}
            </p>
            <p className="font-medium text-slate-900">{solution.name_en}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              {t({ en: 'Select Challenge to Address', ar: 'اختر التحدي المراد معالجته' })}
            </label>
            <Select value={selectedChallengeId} onValueChange={setSelectedChallengeId}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose challenge...', ar: 'اختر التحدي...' })} />
              </SelectTrigger>
              <SelectContent>
                {challenges.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title_en || c.title_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              {t({ en: 'Select Municipality', ar: 'اختر البلدية' })}
            </label>
            <Select value={selectedMunicipalityId} onValueChange={setSelectedMunicipalityId}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'Choose municipality...', ar: 'اختر البلدية...' })} />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name_en || m.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateWithAI}
            disabled={generating || !selectedChallengeId || !selectedMunicipalityId || !isAvailable}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t({ en: 'AI Designing Pilot...', ar: 'تصميم التجربة...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t({ en: 'Generate Pilot Design with AI', ar: 'توليد تصميم التجربة بالذكاء' })}
              </>
            )}
          </Button>

          {pilotData.hypothesis && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900 mb-2">{pilotData.title_en}</p>
                <p className="text-sm text-slate-700 mb-2">
                  <strong>{t({ en: 'Hypothesis:', ar: 'الفرضية:' })}</strong> {pilotData.hypothesis}
                </p>
                <p className="text-sm text-slate-700">{pilotData.objective_en}</p>
              </div>

              {pilotData.kpis?.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-900 mb-2">
                    {t({ en: 'Success KPIs:', ar: 'مؤشرات النجاح:' })}
                  </p>
                  {pilotData.kpis.map((kpi, i) => (
                    <div key={i} className="text-sm text-slate-700">
                      • {kpi.name_en}: {kpi.target}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createPilotMutation.isPending || !pilotData.hypothesis}
              className="flex-1 bg-gradient-to-r from-teal-600 to-blue-600"
            >
              {createPilotMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Submit Pilot Proposal', ar: 'تقديم مقترح التجربة' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}