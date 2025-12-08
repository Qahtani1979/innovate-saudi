import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { Shield, Sparkles, ArrowRight, Loader2, X } from 'lucide-react';

export default function PilotToPolicyWorkflow({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    policy_recommendation_ar: '',
    policy_recommendation_en: '',
    rationale_ar: '',
    rationale_en: '',
    impact_assessment: ''
  });
  const [aiGenerating, setAiGenerating] = useState(false);

  const generateAI = async () => {
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this pilot's results, generate policy recommendations:

Pilot: ${pilot.title_en}
Sector: ${pilot.sector}
Municipality: ${pilot.municipality_id}
Evaluation: ${pilot.evaluation_summary_en || 'In progress'}
Success Probability: ${pilot.success_probability || 'N/A'}%
Lessons: ${pilot.lessons_learned?.map(l => l.lesson).join('; ') || 'N/A'}

Generate bilingual policy recommendation:
1. Policy recommendation (what regulatory/policy change is needed)
2. Rationale (why this policy change, based on pilot evidence)
3. Expected impact

Must be in both Arabic and English.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendation_ar: { type: 'string' },
            recommendation_en: { type: 'string' },
            rationale_ar: { type: 'string' },
            rationale_en: { type: 'string' },
            impact_en: { type: 'string' },
            impact_ar: { type: 'string' }
          }
        }
      });

      setFormData({
        policy_recommendation_ar: result.recommendation_ar || '',
        policy_recommendation_en: result.recommendation_en || '',
        rationale_ar: result.rationale_ar || '',
        rationale_en: result.rationale_en || '',
        impact_assessment: language === 'ar' ? result.impact_ar : result.impact_en
      });
      toast.success(t({ en: 'AI generated policy recommendation', ar: 'تم إنشاء التوصية' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setAiGenerating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.PolicyRecommendation.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['policies']);
      toast.success(t({ en: 'Policy recommendation created', ar: 'تم إنشاء التوصية' }));
      onClose();
    }
  });

  const handleSubmit = () => {
    createMutation.mutate({
      title_ar: `توصية سياسة من: ${pilot.title_ar || pilot.title_en}`,
      title_en: `Policy Recommendation from: ${pilot.title_en}`,
      recommendation_ar: formData.policy_recommendation_ar,
      recommendation_en: formData.policy_recommendation_en,
      rationale_ar: formData.rationale_ar,
      rationale_en: formData.rationale_en,
      impact_assessment_en: formData.impact_assessment,
      source_pilot_id: pilot.id,
      sector: pilot.sector,
      municipality_id: pilot.municipality_id,
      workflow_stage: 'draft',
      evidence_type: 'pilot_results',
      priority: 'medium'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          {t({ en: 'Create Policy Recommendation', ar: 'إنشاء توصية سياسة' })}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{t({ en: 'From Pilot:', ar: 'من التجربة:' })}</strong>{' '}
            {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
          </p>
        </div>

        <Button
          onClick={generateAI}
          disabled={aiGenerating}
          variant="outline"
          className="w-full border-purple-300 text-purple-700"
        >
          {aiGenerating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate AI Recommendation', ar: 'إنشاء توصية ذكية' })}
        </Button>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Policy Recommendation (Arabic)', ar: 'توصية السياسة (عربي)' })}
          </label>
          <Textarea
            value={formData.policy_recommendation_ar}
            onChange={(e) => setFormData({ ...formData, policy_recommendation_ar: e.target.value })}
            rows={4}
            dir="rtl"
            placeholder="ما التغيير السياسي أو التنظيمي الموصى به؟"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Policy Recommendation (English)', ar: 'توصية السياسة (إنجليزي)' })}
          </label>
          <Textarea
            value={formData.policy_recommendation_en}
            onChange={(e) => setFormData({ ...formData, policy_recommendation_en: e.target.value })}
            rows={4}
            dir="ltr"
            placeholder="What policy/regulatory change is recommended?"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Rationale (Evidence from Pilot)', ar: 'المنطق (دليل من التجربة)' })}
          </label>
          <Textarea
            value={language === 'ar' ? formData.rationale_ar : formData.rationale_en}
            onChange={(e) => setFormData({ 
              ...formData, 
              [language === 'ar' ? 'rationale_ar' : 'rationale_en']: e.target.value 
            })}
            rows={3}
            placeholder={t({ 
              en: 'Why this policy change, based on pilot evidence?',
              ar: 'لماذا هذا التغيير، بناءً على أدلة التجربة؟'
            })}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.policy_recommendation_en || createMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Create Policy Recommendation', ar: 'إنشاء توصية' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}