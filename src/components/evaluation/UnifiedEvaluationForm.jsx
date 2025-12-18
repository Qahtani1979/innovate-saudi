import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useAuth } from '@/lib/AuthContext';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { buildEvaluationAssistPrompt, EVALUATION_ASSIST_SCHEMA } from '@/lib/ai/prompts/evaluation';

export default function UnifiedEvaluationForm({ 
  entityType, 
  entityId, 
  assignmentId,
  onComplete 
}) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiAssisting, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { user } = useAuth();
  const { triggerEmail } = useEmailTrigger();

  const [scores, setScores] = useState({
    feasibility_score: 50,
    impact_score: 50,
    innovation_score: 50,
    cost_effectiveness_score: 50,
    risk_score: 50,
    strategic_alignment_score: 50,
    technical_quality_score: 50,
    scalability_score: 50
  });

  const [recommendation, setRecommendation] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [strengths, setStrengths] = useState(['', '', '']);
  const [weaknesses, setWeaknesses] = useState(['', '', '']);
  const [improvements, setImprovements] = useState(['', '', '']);
  const [conditions, setConditions] = useState(['']);

  const createEvaluationMutation = useMutation({
    mutationFn: async (evaluationData) => {
      const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

      const { error } = await supabase.from('expert_evaluations').insert({
        expert_email: user?.email,
        assignment_id: assignmentId,
        entity_type: entityType,
        entity_id: entityId,
        evaluation_date: new Date().toISOString(),
        ...scores,
        overall_score: overallScore,
        recommendation,
        feedback_text: feedbackText,
        strengths: strengths.filter(s => s.trim()),
        weaknesses: weaknesses.filter(w => w.trim()),
        improvement_suggestions: improvements.filter(i => i.trim()),
        conditions: recommendation.includes('conditions') ? conditions.filter(c => c.trim()) : []
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      // Trigger evaluation completed email
      await triggerEmail('evaluation.completed', {
        entityType: entityType,
        entityId: entityId,
        variables: {
          entity_type: entityType,
          entity_id: entityId,
          evaluator_email: user?.email,
          recommendation: recommendation,
          overall_score: Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
        }
      }).catch(err => console.error('Email trigger failed:', err));

      queryClient.invalidateQueries(['expert-evaluations']);
      queryClient.invalidateQueries(['expert-assignments']);
      toast.success(t({ en: 'Evaluation submitted', ar: 'تم إرسال التقييم' }));
      if (onComplete) onComplete();
    }
  });

  const getAIAssistance = async () => {
    const response = await invokeAI({
      prompt: buildEvaluationAssistPrompt(entityType, entityId),
      response_json_schema: EVALUATION_ASSIST_SCHEMA
    });

    if (response.success) {
      setScores({ ...scores, ...response.data.scores });
      setStrengths(response.data.strengths || ['', '', '']);
      setWeaknesses(response.data.weaknesses || ['', '', '']);
      setImprovements(response.data.improvements || ['', '', '']);
      setFeedbackText(response.data.feedback || '');
      toast.success(t({ en: 'AI suggestions loaded', ar: 'تم تحميل اقتراحات الذكاء الاصطناعي' }));
    }
  };

  const criteriaLabels = {
    feasibility_score: { en: 'Feasibility', ar: 'الجدوى' },
    impact_score: { en: 'Impact', ar: 'التأثير' },
    innovation_score: { en: 'Innovation', ar: 'الابتكار' },
    cost_effectiveness_score: { en: 'Cost Effectiveness', ar: 'فعالية التكلفة' },
    risk_score: { en: 'Risk Level', ar: 'مستوى المخاطر' },
    strategic_alignment_score: { en: 'Strategic Alignment', ar: 'التوافق الاستراتيجي' },
    technical_quality_score: { en: 'Technical Quality', ar: 'الجودة التقنية' },
    scalability_score: { en: 'Scalability', ar: 'القابلية للتوسع' }
  };

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

  return (
    <Card className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {t({ en: 'Expert Evaluation', ar: 'تقييم الخبراء' })} - {entityType}
          </CardTitle>
          <Button
            onClick={getAIAssistance}
            disabled={aiAssisting || !isAvailable}
            variant="outline"
            className="gap-2"
          >
            {aiAssisting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t({ en: 'AI Assist', ar: 'المساعد الذكي' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <p className="text-sm text-slate-600 mb-2">{t({ en: 'Overall Score', ar: 'النقاط الإجمالية' })}</p>
          <p className="text-4xl font-bold text-blue-600">{overallScore.toFixed(1)}/100</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">{t({ en: 'Evaluation Criteria', ar: 'معايير التقييم' })}</h3>
          {Object.entries(criteriaLabels).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">{label[language]}</Label>
                <span className="text-sm font-bold text-slate-700">{scores[key]}/100</span>
              </div>
              <Slider
                value={[scores[key]]}
                onValueChange={(val) => setScores({ ...scores, [key]: val[0] })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label>{t({ en: 'Strengths (Top 3)', ar: 'نقاط القوة (أهم 3)' })}</Label>
            {strengths.map((s, i) => (
              <Textarea
                key={i}
                value={s}
                onChange={(e) => {
                  const newStrengths = [...strengths];
                  newStrengths[i] = e.target.value;
                  setStrengths(newStrengths);
                }}
                placeholder={`${t({ en: 'Strength', ar: 'نقطة قوة' })} ${i + 1}`}
                rows={2}
                className="mt-2"
              />
            ))}
          </div>

          <div>
            <Label>{t({ en: 'Weaknesses (Top 3)', ar: 'نقاط الضعف (أهم 3)' })}</Label>
            {weaknesses.map((w, i) => (
              <Textarea
                key={i}
                value={w}
                onChange={(e) => {
                  const newWeaknesses = [...weaknesses];
                  newWeaknesses[i] = e.target.value;
                  setWeaknesses(newWeaknesses);
                }}
                placeholder={`${t({ en: 'Weakness', ar: 'نقطة ضعف' })} ${i + 1}`}
                rows={2}
                className="mt-2"
              />
            ))}
          </div>

          <div>
            <Label>{t({ en: 'Improvement Suggestions', ar: 'اقتراحات التحسين' })}</Label>
            {improvements.map((imp, i) => (
              <Textarea
                key={i}
                value={imp}
                onChange={(e) => {
                  const newImprovements = [...improvements];
                  newImprovements[i] = e.target.value;
                  setImprovements(newImprovements);
                }}
                placeholder={`${t({ en: 'Suggestion', ar: 'اقتراح' })} ${i + 1}`}
                rows={2}
                className="mt-2"
              />
            ))}
          </div>

          <div>
            <Label>{t({ en: 'Detailed Feedback', ar: 'ملاحظات تفصيلية' })}</Label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder={t({ en: 'Provide detailed feedback...', ar: 'قدم ملاحظات تفصيلية...' })}
            />
          </div>
        </div>

        <div>
          <Label>{t({ en: 'Final Recommendation', ar: 'التوصية النهائية' })}</Label>
          <Select value={recommendation} onValueChange={setRecommendation}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Select recommendation', ar: 'اختر التوصية' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">{t({ en: 'Approve', ar: 'الموافقة' })}</SelectItem>
              <SelectItem value="approve_with_conditions">{t({ en: 'Approve with Conditions', ar: 'موافقة مشروطة' })}</SelectItem>
              <SelectItem value="revise_and_resubmit">{t({ en: 'Revise & Resubmit', ar: 'تعديل وإعادة تقديم' })}</SelectItem>
              <SelectItem value="reject">{t({ en: 'Reject', ar: 'رفض' })}</SelectItem>
              <SelectItem value="request_more_info">{t({ en: 'Request More Info', ar: 'طلب معلومات إضافية' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {recommendation === 'approve_with_conditions' && (
          <div>
            <Label>{t({ en: 'Conditions for Approval', ar: 'شروط الموافقة' })}</Label>
            {conditions.map((cond, i) => (
              <Textarea
                key={i}
                value={cond}
                onChange={(e) => {
                  const newConditions = [...conditions];
                  newConditions[i] = e.target.value;
                  setConditions(newConditions);
                }}
                placeholder={`${t({ en: 'Condition', ar: 'شرط' })} ${i + 1}`}
                rows={2}
                className="mt-2"
              />
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConditions([...conditions, ''])}
              className="mt-2"
            >
              + {t({ en: 'Add Condition', ar: 'إضافة شرط' })}
            </Button>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => createEvaluationMutation.mutate()}
            disabled={!recommendation || createEvaluationMutation.isPending}
            className="flex-1 bg-green-600"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Submit Evaluation', ar: 'إرسال التقييم' })}
          </Button>
          {onComplete && (
            <Button variant="outline" onClick={onComplete}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
