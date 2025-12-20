import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Award, Loader2, CheckCircle2, TrendingUp, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

function PilotEvaluationGate({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [recommendation, setRecommendation] = useState('');
  const [summary, setSummary] = useState('');
  const { invokeAI, status, isLoading: generatingEvaluation, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const queryClient = useQueryClient();

  const closeAndEvaluateMutation = useMutation({
    mutationFn: async (recommendationType) => {
      await base44.entities.Pilot.update(pilot.id, {
        stage: 'evaluation',
        recommendation: recommendationType,
        evaluation_summary_en: summary,
        timeline: {
          ...pilot.timeline,
          evaluation_start: new Date().toISOString()
        }
      });
      await base44.entities.SystemActivity.create({
        activity_type: 'pilot_evaluation_started',
        entity_type: 'Pilot',
        entity_id: pilot.id,
        description: `Pilot "${pilot.title_en}" closed and moved to evaluation`,
        metadata: { recommendation: recommendationType, ai_evaluation: aiEvaluation }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pilot']);
      toast.success(t({ en: 'Pilot moved to evaluation', ar: 'تم نقل التجربة للتقييم' }));
      if (onClose) onClose();
    }
  });

  const generateAIEvaluation = async () => {
    const result = await invokeAI({
      prompt: `Evaluate this completed pilot and provide a comprehensive assessment:

Title: ${pilot.title_en}
Sector: ${pilot.sector}
Duration: ${pilot.duration_weeks} weeks
Budget: ${pilot.budget} SAR

KPIs:
${pilot.kpis?.map(k => `- ${k.name}: ${k.current || 'N/A'} (Target: ${k.target}, Baseline: ${k.baseline})`).join('\n') || 'No KPIs'}

Success Criteria:
${pilot.success_criteria?.map(c => `- ${c.criterion}: ${c.met ? 'MET' : 'NOT MET'}`).join('\n') || 'None'}

Provide:
1. Overall performance assessment (1-5 scale with explanation)
2. KPI achievement summary
3. Unexpected outcomes (positive and negative)
4. Scalability assessment
5. Recommendation (scale/iterate/pivot/terminate) with detailed rationale
6. Key success factors
7. Areas for improvement`,
      response_json_schema: {
        type: 'object',
        properties: {
          performance_score: { type: 'number' },
          performance_explanation: { type: 'string' },
          kpi_summary: { type: 'string' },
          unexpected_outcomes: { type: 'array', items: { type: 'string' } },
          scalability_assessment: { type: 'string' },
          recommendation: { type: 'string' },
          rationale: { type: 'string' },
          success_factors: { type: 'array', items: { type: 'string' } },
          improvement_areas: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setAiEvaluation(result.data);
      setSummary(result.data?.performance_explanation || '');
      setRecommendation(result.data?.recommendation || '');
    }
  };

  const recommendationOptions = [
    { value: 'scale', label: { en: 'Scale', ar: 'توسيع' }, icon: TrendingUp, color: 'bg-green-600' },
    { value: 'iterate', label: { en: 'Iterate', ar: 'تحسين' }, icon: RotateCcw, color: 'bg-blue-600' },
    { value: 'pivot', label: { en: 'Pivot', ar: 'تغيير' }, icon: RotateCcw, color: 'bg-amber-600' },
    { value: 'terminate', label: { en: 'Terminate', ar: 'إنهاء' }, icon: XCircle, color: 'bg-red-600' }
  ];

  return (
    <Card className="border-2 border-blue-300" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-blue-600" />
          {t({ en: 'Close Pilot & Begin Evaluation', ar: 'إغلاق التجربة وبدء التقييم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-1">
            {t({ en: 'Evaluation Process', ar: 'عملية التقييم' })}
          </p>
          <p className="text-xs text-blue-700">
            {t({ en: 'Closing the pilot will transition it to evaluation stage where final assessment is conducted.', ar: 'إغلاق التجربة سينقلها لمرحلة التقييم حيث يتم إجراء التقييم النهائي.' })}
          </p>
        </div>

        <Button
          onClick={generateAIEvaluation}
          disabled={generatingEvaluation}
          variant="outline"
          className="w-full"
        >
          {generatingEvaluation ? (
            <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
          ) : (
            <Award className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {t({ en: 'Generate AI Evaluation', ar: 'إنشاء تقييم ذكي' })}
        </Button>

        {aiEvaluation && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500">{t({ en: 'Performance Score', ar: 'نقاط الأداء' })}</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <CheckCircle2
                      key={star}
                      className={`h-4 w-4 ${star <= aiEvaluation.performance_score ? 'text-green-600' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-900">{aiEvaluation.performance_explanation}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-500 mb-2">{t({ en: 'KPI Achievement', ar: 'تحقيق المؤشرات' })}</p>
              <p className="text-sm text-slate-900">{aiEvaluation.kpi_summary}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-500 mb-2">{t({ en: 'Scalability Assessment', ar: 'تقييم قابلية التوسع' })}</p>
              <p className="text-sm text-slate-900">{aiEvaluation.scalability_assessment}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 mb-2">{t({ en: 'AI Recommendation', ar: 'التوصية الذكية' })}</p>
              <p className="text-sm font-medium text-purple-900 mb-1">{aiEvaluation.recommendation}</p>
              <p className="text-sm text-slate-900">{aiEvaluation.rationale}</p>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Evaluation Summary', ar: 'ملخص التقييم' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Enter evaluation summary...', ar: 'أدخل ملخص التقييم...' })}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Final Recommendation', ar: 'التوصية النهائية' })}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {recommendationOptions.map(option => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={recommendation === option.value ? 'default' : 'outline'}
                  onClick={() => setRecommendation(option.value)}
                  className={recommendation === option.value ? option.color : ''}
                >
                  <Icon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {option.label[language]}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => closeAndEvaluateMutation.mutate(recommendation)}
            disabled={!summary || !recommendation || closeAndEvaluateMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600"
          >
            {closeAndEvaluateMutation.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <Award className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Close & Evaluate', ar: 'إغلاق وتقييم' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PilotEvaluationGate;