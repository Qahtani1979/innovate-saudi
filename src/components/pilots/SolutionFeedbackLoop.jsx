import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { Lightbulb, TrendingUp, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  SOLUTION_FEEDBACK_SYSTEM_PROMPT,
  buildSolutionFeedbackPrompt,
  SOLUTION_FEEDBACK_SCHEMA
} from '@/lib/ai/prompts/pilots/solutionFeedback';
import { useSolution } from '@/hooks/useSolutions';
import { useSolutionMutations } from '@/hooks/useSolutionMutations';

export default function SolutionFeedbackLoop({ pilot }) {
  const { language, isRTL, t } = useLanguage();

  const [improvements, setImprovements] = useState('');
  const [suggestions, setSuggestions] = useState(null);

  const { invokeAI, status, isLoading: aiAnalyzing, isAvailable, rateLimitInfo, error } = useAIWithFallback();

  const { data: solution } = useSolution(pilot?.solution_id);

  const analyzeImprovements = async () => {
    const result = await invokeAI({
      system_prompt: SOLUTION_FEEDBACK_SYSTEM_PROMPT,
      prompt: buildSolutionFeedbackPrompt({ pilot, solution }),
      response_json_schema: SOLUTION_FEEDBACK_SCHEMA
    });

    if (result.success && result.data) {
      setSuggestions(result.data);
      toast.success(t({ en: 'AI analyzed pilot results', ar: 'تم تحليل نتائج التجربة' }));
    }
  };

  const { sendFeedbackToProvider } = useSolutionMutations();

  const handleSendFeedback = () => {
    sendFeedbackToProvider.mutate({
      pilotId: pilot.id,
      solutionId: pilot.solution_id,
      solution,
      pilot,
      data: {
        improvements,
        ai_suggestions: suggestions
      }
    }, {
      onSuccess: () => {
        setImprovements('');
        setSuggestions(null);
      }
    });
  };

  if (!pilot.solution_id) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <p className="text-slate-600">
            {t({ en: 'No solution linked to this pilot', ar: 'لا يوجد حل مرتبط بهذه التجربة' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-600" />
          {t({ en: 'Solution Improvement Feedback', ar: 'ملاحظات تحسين الحل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={error} />

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{t({ en: 'Solution:', ar: 'الحل:' })}</strong>{' '}
            {solution ? (language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en) : 'N/A'}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {t({ en: 'Provider:', ar: 'المزود:' })} {solution?.provider_name || 'N/A'}
          </p>
        </div>

        <Button
          onClick={analyzeImprovements}
          disabled={aiAnalyzing || !isAvailable}
          variant="outline"
          className="w-full border-purple-300 text-purple-700"
        >
          {aiAnalyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'AI Analyze Pilot Results', ar: 'تحليل نتائج التجربة' })}
        </Button>

        {suggestions && (
          <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900">
              {t({ en: 'AI Recommendations:', ar: 'التوصيات الذكية:' })}
            </p>

            {suggestions.features?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-purple-800 mb-2">
                  {t({ en: 'Feature Enhancements:', ar: 'تحسينات الميزات:' })}
                </p>
                <ul className="space-y-1">
                  {suggestions.features.map((item, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5" />
                      <span>{typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}</span>
                      {item.priority && (
                        <Badge className="text-xs">{item.priority}</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.performance?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-purple-800 mb-2">
                  {t({ en: 'Performance:', ar: 'الأداء:' })}
                </p>
                <ul className="space-y-1">
                  {suggestions.performance.map((item, i) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <TrendingUp className="h-3 w-3 text-green-600 mt-0.5" />
                      <span>{typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Additional Feedback for Provider', ar: 'ملاحظات إضافية للمزود' })}
          </label>
          <Textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            rows={4}
            placeholder={t({
              en: 'What improvements should the provider make based on pilot learnings?',
              ar: 'ما التحسينات التي يجب على المزود إجراؤها؟'
            })}
          />
        </div>

        <Button
          onClick={handleSendFeedback}
          disabled={!improvements || sendFeedbackToProvider.isPending}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600"
        >
          {sendFeedbackToProvider.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          )}
          {t({ en: 'Send Feedback to Provider', ar: 'إرسال للمزود' })}
        </Button>
      </CardContent>
    </Card>
  );
}