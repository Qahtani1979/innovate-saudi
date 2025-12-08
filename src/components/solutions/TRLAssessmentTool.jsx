import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Beaker, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TRLAssessmentTool({ solution, onAssessmentComplete }) {
  const { t } = useLanguage();
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [evidence, setEvidence] = useState('');
  const queryClient = useQueryClient();

  const updateSolution = useMutation({
    mutationFn: (data) => base44.entities.Solution.update(solution.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['solution']);
      toast.success(t({ en: 'TRL updated', ar: 'تم تحديث المستوى' }));
      onAssessmentComplete?.();
    }
  });

  const assessTRL = async () => {
    setAssessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Assess Technology Readiness Level (TRL) for this solution following NASA TRL scale (1-9).

SOLUTION:
Name: ${solution.name_en}
Description: ${solution.description_en}
Maturity Level: ${solution.maturity_level}
Current TRL: ${solution.trl || 'Not assessed'}
Features: ${solution.features?.join(', ') || 'N/A'}
Deployments: ${solution.deployment_count || 0}
Technical Specs: ${JSON.stringify(solution.technical_specifications || {})}

USER PROVIDED EVIDENCE:
${evidence || 'No additional evidence provided'}

TRL SCALE:
TRL 1: Basic principles observed
TRL 2: Technology concept formulated
TRL 3: Experimental proof of concept
TRL 4: Technology validated in lab
TRL 5: Technology validated in relevant environment
TRL 6: Technology demonstrated in relevant environment
TRL 7: System prototype demonstration in operational environment
TRL 8: System complete and qualified
TRL 9: Actual system proven in operational environment

Provide:
1. Assessed TRL level (1-9)
2. Confidence score (0-100%)
3. Evidence supporting assessment
4. Next steps to advance TRL
5. Gaps preventing higher TRL
6. Estimated timeline to next level
7. Detailed reasoning for assessment

Be rigorous and evidence-based.`,
        response_json_schema: {
          type: 'object',
          properties: {
            assessed_trl: { type: 'number' },
            confidence_score: { type: 'number' },
            supporting_evidence: { type: 'array', items: { type: 'string' } },
            next_steps: { type: 'array', items: { type: 'string' } },
            trl_gaps: { type: 'array', items: { type: 'string' } },
            timeline_to_next_level_months: { type: 'number' },
            assessment_reasoning: { type: 'string' },
            readiness_for_pilot: { type: 'string', enum: ['ready', 'nearly_ready', 'not_ready'] }
          }
        }
      });

      setAssessment(result);
      toast.success(t({ en: 'Assessment complete', ar: 'اكتمل التقييم' }));
    } catch (error) {
      toast.error(t({ en: 'Assessment failed', ar: 'فشل التقييم' }));
    } finally {
      setAssessing(false);
    }
  };

  const saveTRL = () => {
    updateSolution.mutate({
      trl: assessment.assessed_trl,
      trl_assessment: {
        level: assessment.assessed_trl,
        evidence: assessment.assessment_reasoning,
        assessed_by: 'AI Assessment Tool',
        assessed_date: new Date().toISOString(),
        ai_confidence: assessment.confidence_score
      }
    });
  };

  const trlColor = assessment?.assessed_trl >= 7 ? 'green' :
                   assessment?.assessed_trl >= 4 ? 'blue' : 'amber';

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-purple-600" />
          {t({ en: 'TRL Assessment Tool', ar: 'أداة تقييم الجاهزية التقنية' })}
          {solution.trl && (
            <Badge className="bg-purple-600 text-white">
              Current: TRL {solution.trl}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Additional Evidence (optional)', ar: 'أدلة إضافية' })}
          </label>
          <Textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder={t({ 
              en: 'Provide deployment evidence, test results, validation data...', 
              ar: 'قدم أدلة النشر، نتائج الاختبار، بيانات التحقق...' 
            })}
            rows={3}
            className="text-sm"
          />
        </div>

        <Button
          onClick={assessTRL}
          disabled={assessing}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {assessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Analyzing technology readiness...', ar: 'جاري تحليل الجاهزية...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Run TRL Assessment', ar: 'تقييم الجاهزية' })}
            </>
          )}
        </Button>

        {assessment && (
          <div className="space-y-4">
            {/* TRL Score */}
            <div className={`p-4 bg-${trlColor}-50 border-2 border-${trlColor}-300 rounded-lg`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-900">
                  {t({ en: 'Assessed TRL', ar: 'المستوى المقيم' })}
                </p>
                <Badge className={`bg-${trlColor}-600 text-white`}>
                  {assessment.confidence_score}% confidence
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold text-${trlColor}-600`}>
                  {assessment.assessed_trl}
                </div>
                <div className="flex-1">
                  <Progress value={(assessment.assessed_trl / 9) * 100} className="h-3" />
                  <p className="text-xs text-slate-600 mt-1">
                    {assessment.readiness_for_pilot === 'ready' ? '✅ Ready for pilot' :
                     assessment.readiness_for_pilot === 'nearly_ready' ? '⚠️ Nearly ready' :
                     '❌ Not ready yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* Supporting Evidence */}
            {assessment.supporting_evidence?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {t({ en: 'Supporting Evidence', ar: 'الأدلة الداعمة' })}
                </p>
                <ul className="space-y-1">
                  {assessment.supporting_evidence.map((ev, i) => (
                    <li key={i} className="text-xs text-green-800">✓ {ev}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* TRL Gaps */}
            {assessment.trl_gaps?.length > 0 && (
              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  {t({ en: 'Gaps Preventing Higher TRL', ar: 'الفجوات المانعة' })}
                </p>
                <ul className="space-y-1">
                  {assessment.trl_gaps.map((gap, i) => (
                    <li key={i} className="text-xs text-amber-800">⚠️ {gap}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Steps */}
            {assessment.next_steps?.length > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t({ en: 'Next Steps to Advance', ar: 'الخطوات التالية' })}
                </p>
                <ol className="space-y-1">
                  {assessment.next_steps.map((step, i) => (
                    <li key={i} className="text-xs text-blue-800">{i + 1}. {step}</li>
                  ))}
                </ol>
                <p className="text-xs text-slate-600 mt-2">
                  ⏱️ Est. timeline: {assessment.timeline_to_next_level_months} months to TRL {assessment.assessed_trl + 1}
                </p>
              </div>
            )}

            {/* Assessment Reasoning */}
            <div className="p-3 bg-slate-50 rounded border">
              <p className="text-xs text-slate-700 leading-relaxed">
                {assessment.assessment_reasoning}
              </p>
            </div>

            {/* Save to Solution */}
            <Button
              onClick={saveTRL}
              disabled={updateSolution.isPending}
              className="w-full bg-purple-600"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Save TRL Assessment to Solution', ar: 'حفظ التقييم' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}