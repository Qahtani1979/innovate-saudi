import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { RotateCcw, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

function PilotPivotWorkflow({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [pivotType, setPivotType] = useState('');
  const [rationale, setRationale] = useState('');
  const [proposedChanges, setProposedChanges] = useState('');
  const [impactAssessment, setImpactAssessment] = useState('');
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const queryClient = useQueryClient();

  const pivotTypes = [
    { value: 'scope_change', label: { en: 'Scope Change', ar: 'تغيير النطاق' } },
    { value: 'approach_change', label: { en: 'Approach Change', ar: 'تغيير المنهج' } },
    { value: 'target_change', label: { en: 'Target Population Change', ar: 'تغيير الفئة المستهدفة' } },
    { value: 'technology_change', label: { en: 'Technology Change', ar: 'تغيير التقنية' } },
    { value: 'timeline_extension', label: { en: 'Timeline Extension', ar: 'تمديد الجدول' } },
    { value: 'budget_revision', label: { en: 'Budget Revision', ar: 'مراجعة الميزانية' } }
  ];

  const pivotMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Pilot.update(pilot.id, {
        pivot_history: [
          ...(pilot.pivot_history || []),
          {
            date: new Date().toISOString(),
            type: pivotType,
            rationale,
            proposed_changes: proposedChanges,
            impact_assessment: impactAssessment,
            ai_analysis: aiAnalysis
          }
        ]
      });
      await base44.entities.SystemActivity.create({
        activity_type: 'pilot_pivot',
        entity_type: 'Pilot',
        entity_id: pilot.id,
        description: `Pilot "${pilot.title_en}" pivot initiated: ${pivotType}`,
        metadata: { pivot_type: pivotType, rationale, ai_analysis: aiAnalysis }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Pivot request submitted', ar: 'تم تقديم طلب التغيير' }));
      if (onClose) onClose();
    }
  });

  const generateImpactAnalysis = async () => {
    setGeneratingAnalysis(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze the impact of this proposed pilot pivot:

Pilot: ${pilot.title_en}
Current Stage: ${pilot.stage}
Pivot Type: ${pivotType}
Rationale: ${rationale}
Proposed Changes: ${proposedChanges}

Current KPIs:
${pilot.kpis?.map(k => `- ${k.name}: Current ${k.current}, Target ${k.target}`).join('\n') || 'None'}

Provide:
1. Impact on timeline (estimated delay/acceleration)
2. Impact on budget (estimated increase/decrease in %)
3. Impact on success probability (increase/decrease)
4. Risks introduced by this pivot
5. Benefits of this pivot
6. Alternative approaches to consider
7. Recommendation (approve/defer/reject pivot with rationale)`,
        response_json_schema: {
          type: 'object',
          properties: {
            timeline_impact: { type: 'string' },
            budget_impact: { type: 'string' },
            success_probability_impact: { type: 'string' },
            new_risks: { type: 'array', items: { type: 'string' } },
            benefits: { type: 'array', items: { type: 'string' } },
            alternatives: { type: 'array', items: { type: 'string' } },
            recommendation: { type: 'string' },
            rationale_ai: { type: 'string' }
          }
        }
      });
      setAiAnalysis(result);
      setImpactAssessment(result.rationale_ai);
    } catch (error) {
      toast.error(t({ en: 'Failed to generate analysis', ar: 'فشل إنشاء التحليل' }));
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  return (
    <Card className="border-2 border-amber-300 bg-amber-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900">
          <RotateCcw className="h-5 w-5" />
          {t({ en: 'Pilot Pivot Request', ar: 'طلب تغيير التجربة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                {t({ en: 'Mid-Flight Change', ar: 'تغيير أثناء التنفيذ' })}
              </p>
              <p className="text-xs text-amber-700">
                {t({ en: 'Pivoting requires approval and may impact timeline, budget, and success probability', ar: 'التغيير يتطلب موافقة وقد يؤثر على الجدول والميزانية واحتمالية النجاح' })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Pivot Type', ar: 'نوع التغيير' })}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {pivotTypes.map(type => (
              <Button
                key={type.value}
                variant={pivotType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPivotType(type.value)}
                className={pivotType === type.value ? 'bg-amber-600' : ''}
              >
                {type.label[language]}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Rationale', ar: 'المبرر' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Why is this pivot necessary?', ar: 'لماذا هذا التغيير ضروري؟' })}
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Proposed Changes', ar: 'التغييرات المقترحة' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Describe the specific changes in detail...', ar: 'اوصف التغييرات المحددة بالتفصيل...' })}
            value={proposedChanges}
            onChange={(e) => setProposedChanges(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={generateImpactAnalysis}
          disabled={!pivotType || !rationale || !proposedChanges || generatingAnalysis}
          variant="outline"
          className="w-full"
        >
          {generatingAnalysis ? (
            <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
          ) : (
            <Lightbulb className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {t({ en: 'Generate AI Impact Analysis', ar: 'إنشاء تحليل التأثير الذكي' })}
        </Button>

        {aiAnalysis && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Timeline', ar: 'الجدول' })}</p>
                <p className="text-sm font-medium text-slate-900">{aiAnalysis.timeline_impact}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                <p className="text-sm font-medium text-slate-900">{aiAnalysis.budget_impact}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-xs text-slate-500 mb-1">{t({ en: 'Success', ar: 'النجاح' })}</p>
                <p className="text-sm font-medium text-slate-900">{aiAnalysis.success_probability_impact}</p>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-2">{t({ en: 'Benefits', ar: 'الفوائد' })}</p>
              {aiAnalysis.benefits?.map((benefit, i) => (
                <p key={i} className="text-sm text-slate-900 mb-1">• {benefit}</p>
              ))}
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-medium text-red-700 mb-2">{t({ en: 'New Risks', ar: 'مخاطر جديدة' })}</p>
              {aiAnalysis.new_risks?.map((risk, i) => (
                <p key={i} className="text-sm text-slate-900 mb-1">• {risk}</p>
              ))}
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-medium text-purple-700 mb-2">{t({ en: 'AI Recommendation', ar: 'التوصية الذكية' })}</p>
              <p className="text-sm font-medium text-purple-900">{aiAnalysis.recommendation}</p>
            </div>

            <Textarea
              placeholder={t({ en: 'Your impact assessment...', ar: 'تقييم التأثير الخاص بك...' })}
              value={impactAssessment}
              onChange={(e) => setImpactAssessment(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => pivotMutation.mutate()}
            disabled={!pivotType || !rationale || !proposedChanges || pivotMutation.isPending}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600"
          >
            {pivotMutation.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <RotateCcw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Submit Pivot Request', ar: 'تقديم طلب التغيير' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PilotPivotWorkflow;