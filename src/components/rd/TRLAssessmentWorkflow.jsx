import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

const TRL_DEFINITIONS = {
  1: { en: 'Basic principles observed', ar: 'المبادئ الأساسية ملاحظة' },
  2: { en: 'Technology concept formulated', ar: 'صياغة مفهوم التقنية' },
  3: { en: 'Experimental proof of concept', ar: 'إثبات المفهوم تجريبياً' },
  4: { en: 'Technology validated in lab', ar: 'التقنية معتمدة في المختبر' },
  5: { en: 'Technology validated in relevant environment', ar: 'التقنية معتمدة في بيئة ذات صلة' },
  6: { en: 'Technology demonstrated in relevant environment', ar: 'التقنية مُوضحة في بيئة ذات صلة' },
  7: { en: 'System prototype in operational environment', ar: 'نموذج أولي في بيئة تشغيلية' },
  8: { en: 'System complete and qualified', ar: 'النظام مكتمل ومؤهل' },
  9: { en: 'Actual system proven in operational environment', ar: 'النظام الفعلي مُثبت في بيئة تشغيلية' }
};

export default function TRLAssessmentWorkflow({ rdProject, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [evidence, setEvidence] = useState('');
  const [assessment, setAssessment] = useState(null);
  const { invokeAI, status, isLoading: aiAssessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const assessTRL = async () => {
    if (!evidence.trim()) {
      toast.error(t({ en: 'Provide evidence first', ar: 'قدم الأدلة أولاً' }));
      return;
    }

    const result = await invokeAI({
      prompt: `You are a TRL assessment expert. Assess the Technology Readiness Level for this R&D project:

Project: ${rdProject.title_en}
Current TRL: ${rdProject.trl_current || 'unknown'}
Evidence provided: ${evidence}

Recent Outputs: ${JSON.stringify(rdProject.expected_outputs || [])}
Publications: ${JSON.stringify(rdProject.publications || [])}

Based on NASA TRL definitions (1-9), assess:
1. Current TRL level (1-9)
2. Justification (why this level)
3. Evidence strength (0-100)
4. Next TRL advancement requirements
5. Readiness for pilot (TRL ≥ 6)
6. Commercialization readiness (TRL ≥ 7)

Be rigorous and evidence-based.`,
      response_json_schema: {
        type: 'object',
        properties: {
          assessed_trl: { type: 'number' },
          justification: { type: 'string' },
          confidence: { type: 'number' },
          evidence_quality: { type: 'number' },
          next_requirements: { type: 'array', items: { type: 'string' } },
          pilot_ready: { type: 'boolean' },
          commercialization_ready: { type: 'boolean' },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setAssessment(result.data);
      toast.success(t({ en: 'TRL assessed!', ar: 'تم تقييم مستوى النضج!' }));
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.RDProject.update(rdProject.id, {
        trl_current: assessment.assessed_trl,
        trl_assessment: {
          level: assessment.assessed_trl,
          evidence: evidence,
          assessed_by: 'AI',
          assessed_date: new Date().toISOString(),
          ai_confidence: assessment.confidence,
          justification: assessment.justification
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
      toast.success(t({ en: 'TRL updated!', ar: 'تم تحديث مستوى النضج!' }));
      onUpdate?.();
    }
  });

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          {t({ en: 'AI TRL Assessment', ar: 'تقييم مستوى النضج الذكي' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          {t({ en: 'Current TRL:', ar: 'مستوى النضج الحالي:' })} {rdProject.trl_current || 'Not assessed'}
        </p>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails className="mt-2" />
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t({ en: 'Provide evidence of progress:', ar: 'قدم أدلة على التقدم:' })}
          </label>
          <Textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={5}
            placeholder={t({
              en: 'E.g., Completed lab validation, published 2 papers, built prototype...',
              ar: 'مثلاً: أكملنا التحقق المختبري، نشرنا ورقتين، بنينا نموذجاً...'
            })}
          />
        </div>

        <Button
          onClick={assessTRL}
          disabled={aiAssessing || !evidence.trim() || !isAvailable}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600"
        >
          {aiAssessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'AI Assessing...', ar: 'جاري التقييم...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Assess TRL with AI', ar: 'تقييم مستوى النضج بالذكاء' })}
            </>
          )}
        </Button>

        {assessment && (
          <div className="space-y-4 pt-4 border-t">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-blue-900">
                  {t({ en: 'Assessed TRL:', ar: 'مستوى النضج المقيّم:' })}
                </p>
                <div className="text-4xl font-bold text-blue-600">{assessment.assessed_trl}</div>
              </div>
              <p className="text-xs text-slate-700 mb-2">
                {TRL_DEFINITIONS[assessment.assessed_trl][language]}
              </p>
              <Badge className="bg-blue-100 text-blue-700">
                {t({ en: 'Confidence:', ar: 'الثقة:' })} {assessment.confidence}%
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-2">
                {t({ en: 'Justification:', ar: 'المبرر:' })}
              </p>
              <p className="text-sm text-slate-700">{assessment.justification}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${assessment.pilot_ready ? 'bg-green-100' : 'bg-amber-100'}`}>
                <p className="text-xs font-medium mb-1">
                  {t({ en: 'Pilot Ready?', ar: 'جاهز للتجربة؟' })}
                </p>
                <p className="text-lg font-bold">
                  {assessment.pilot_ready ? '✅ Yes (TRL ≥ 6)' : '⚠️ Not yet'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${assessment.commercialization_ready ? 'bg-green-100' : 'bg-amber-100'}`}>
                <p className="text-xs font-medium mb-1">
                  {t({ en: 'Commercialization Ready?', ar: 'جاهز للتسويق؟' })}
                </p>
                <p className="text-lg font-bold">
                  {assessment.commercialization_ready ? '✅ Yes (TRL ≥ 7)' : '⚠️ Not yet'}
                </p>
              </div>
            </div>

            {assessment.next_requirements?.length > 0 && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-2">
                  {t({ en: 'Next Requirements:', ar: 'المتطلبات التالية:' })}
                </p>
                <ul className="text-sm text-slate-700 space-y-1">
                  {assessment.next_requirements.map((req, i) => (
                    <li key={i}>• {req}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Updating...', ar: 'جاري التحديث...' })}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Update Project TRL', ar: 'تحديث مستوى النضج' })}
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
