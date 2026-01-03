import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '@/components/LanguageContext';
import { XCircle, Loader2, AlertTriangle, FileText, Lightbulb } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { usePilotMutations } from '@/hooks/usePilotMutations';
import {
  POST_MORTEM_SYSTEM_PROMPT,
  buildPostMortemPrompt,
  POST_MORTEM_SCHEMA
} from '@/lib/ai/prompts/pilots/postMortem';

export default function PilotTerminationWorkflow({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [reason, setReason] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { invokeAI, status, isLoading: generatingAnalysis, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { updatePilot } = usePilotMutations();

  const terminationReasons = [
    { value: 'budget_constraints', label: { en: 'Budget Constraints', ar: 'قيود الميزانية' } },
    { value: 'technical_infeasibility', label: { en: 'Technical Infeasibility', ar: 'عدم جدوى تقنية' } },
    { value: 'regulatory_barriers', label: { en: 'Regulatory Barriers', ar: 'حواجز تنظيمية' } },
    { value: 'lack_of_stakeholder_support', label: { en: 'Lack of Support', ar: 'نقص الدعم' } },
    { value: 'poor_performance', label: { en: 'Poor Performance', ar: 'أداء ضعيف' } },
    { value: 'changed_priorities', label: { en: 'Changed Priorities', ar: 'تغيير الأولويات' } },
    { value: 'other', label: { en: 'Other', ar: 'أخرى' } }
  ];

  const [selectedReason, setSelectedReason] = useState('');

  const handleTerminate = () => {
    updatePilot.mutate({
      id: pilot.id,
      data: {
        stage: 'terminated',
        termination_reason: reason,
        termination_date: new Date().toISOString(),
        lessons_learned: lessonsLearned ? [
          { category: 'termination', lesson: lessonsLearned, recommendation: aiAnalysis?.recommendations?.[0]?.recommendation || '' }
        ] : pilot.lessons_learned,
        metadata: { reason: selectedReason, analysis: aiAnalysis }
      }
    }, {
      onSuccess: () => {
        if (onClose) onClose();
      }
    });
  };

  const generatePostMortem = async () => {
    const result = await invokeAI({
      system_prompt: POST_MORTEM_SYSTEM_PROMPT,
      prompt: buildPostMortemPrompt({
        pilot: {
          title_en: pilot.title_en,
          start_date: pilot.start_date,
          end_date: pilot.end_date,
          municipality_name: pilot.municipality_name,
          solution_name: pilot.solution_name,
          status: 'Terminated'
        },
        termination_reason: selectedReason,
        metrics: pilot.kpis?.reduce((acc, k) => {
          acc[k.name] = { current: k.current, target: k.target };
          return acc;
        }, {}) || {},
        stakeholder_feedback: []
      }),
      response_json_schema: POST_MORTEM_SCHEMA
    });

    if (result.success) {
      // Map response to expected format
      setAiAnalysis({
        root_cause: result.data.root_cause_analysis?.primary_causes?.join('. ') || result.data.executive_summary,
        lessons: result.data.lessons_learned?.map(l => l.lesson) || [],
        recommendations: result.data.recommendations?.map(r => r.recommendation).join('. ') || '',
        salvageable_insights: result.data.successes?.map(s => s.description) || [],
        communication_summary: result.data.executive_summary
      });
    }
  };

  return (
    <Card className="border-2 border-red-300 bg-red-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <XCircle className="h-5 w-5" />
          {t({ en: 'Terminate Pilot', ar: 'إنهاء التجربة' })}
        </CardTitle>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={null} showDetails className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-white rounded-lg border border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900 mb-1">
                {t({ en: 'Warning: Permanent Action', ar: 'تحذير: إجراء دائم' })}
              </p>
              <p className="text-xs text-red-700">
                {t({ en: 'Terminating a pilot is irreversible. Please document the decision carefully.', ar: 'إنهاء التجربة لا رجعة فيه. يرجى توثيق القرار بعناية.' })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Termination Reason', ar: 'سبب الإنهاء' })}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {terminationReasons.map(r => (
              <Button
                key={r.value}
                variant={selectedReason === r.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedReason(r.value)}
                className={selectedReason === r.value ? 'bg-red-600' : ''}
              >
                {r.label[language]}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-900 mb-2 block">
            {t({ en: 'Detailed Explanation', ar: 'شرح تفصيلي' })}
          </label>
          <Textarea
            placeholder={t({ en: 'Provide details about why this pilot is being terminated...', ar: 'قدم تفاصيل حول سبب إنهاء هذه التجربة...' })}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={generatePostMortem}
          disabled={!selectedReason || !reason || generatingAnalysis || !isAvailable}
          variant="outline"
          className="w-full"
        >
          {generatingAnalysis ? (
            <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
          ) : (
            <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {t({ en: 'Generate AI Post-Mortem Analysis', ar: 'إنشاء تحليل ما بعد الإنهاء' })}
        </Button>

        {aiAnalysis && (
          <div className="space-y-3">
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs font-medium text-slate-500 mb-2">{t({ en: 'Root Cause Analysis', ar: 'تحليل السبب الجذري' })}</p>
              <p className="text-sm text-slate-900">{aiAnalysis.root_cause}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs font-medium text-slate-500 mb-2">{t({ en: 'Key Lessons Learned', ar: 'الدروس المستفادة' })}</p>
              {aiAnalysis.lessons?.map((lesson, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-slate-900">{lesson}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-2">{t({ en: 'Salvageable Insights', ar: 'الرؤى القابلة للاستفادة' })}</p>
              {aiAnalysis.salvageable_insights?.map((insight, i) => (
                <p key={i} className="text-sm text-slate-900 mb-1">• {insight}</p>
              ))}
            </div>

            <Textarea
              placeholder={t({ en: 'Add your own lessons learned...', ar: 'أضف دروسك المستفادة...' })}
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleTerminate}
            disabled={!selectedReason || !reason || updatePilot.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {updatePilot.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Confirm Termination', ar: 'تأكيد الإنهاء' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}