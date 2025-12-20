import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { TRL_ASSESSMENT_PROMPTS } from '@/lib/ai/prompts/rd';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function TRLAssessmentWorkflow({ rdProject, onUpdate }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [evidence, setEvidence] = useState('');
  const [assessment, setAssessment] = useState(null);
  const { invokeAI, status, isLoading: aiAssessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const TRL_DEFINITIONS = TRL_ASSESSMENT_PROMPTS.TRL_DEFINITIONS;

  const assessTRL = async () => {
    if (!evidence.trim()) {
      toast.error(t({ en: 'Provide evidence first', ar: 'قدم الأدلة أولاً' }));
      return;
    }

    const result = await invokeAI({
      systemPrompt: getSystemPrompt('rd_trl_assessment'),
      prompt: TRL_ASSESSMENT_PROMPTS.buildPrompt(rdProject, evidence),
      response_json_schema: TRL_ASSESSMENT_PROMPTS.schema
    });

    if (result.success) {
      setAssessment(result.data);
      toast.success(t({ en: 'TRL assessed!', ar: 'تم تقييم مستوى النضج!' }));
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('rd_projects')
        .update({
          trl_current: assessment.assessed_trl,
          trl_assessment: {
            level: assessment.assessed_trl,
            evidence: evidence,
            assessed_by: 'AI',
            assessed_date: new Date().toISOString(),
            ai_confidence: assessment.confidence,
            justification: assessment.justification
          }
        })
        .eq('id', rdProject.id);
      if (error) throw error;
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
          {t({ en: 'Current TRL:', ar: 'مستوى النضج الحالي:' })} {rdProject.trl_current || t({ en: 'Not assessed', ar: 'لم يتم التقييم' })}
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
                {TRL_DEFINITIONS[assessment.assessed_trl]?.[language] || TRL_DEFINITIONS[assessment.assessed_trl]?.en}
              </p>
              <Badge className="bg-blue-100 text-blue-700">
                {t({ en: 'Confidence:', ar: 'الثقة:' })} {assessment.confidence}%
              </Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-2">
                {t({ en: 'Justification:', ar: 'المبرر:' })}
              </p>
              <p className="text-sm text-slate-700">
                {language === 'ar' && assessment.justification_ar ? assessment.justification_ar : assessment.justification}
              </p>
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
                  {(language === 'ar' && assessment.next_requirements_ar?.length ? assessment.next_requirements_ar : assessment.next_requirements).map((req, i) => (
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
