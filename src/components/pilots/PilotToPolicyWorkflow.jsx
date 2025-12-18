import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { Shield, Sparkles, ArrowRight, Loader2, X } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  POLICY_WORKFLOW_SYSTEM_PROMPT,
  buildPolicyWorkflowPrompt,
  POLICY_WORKFLOW_SCHEMA
} from '@/lib/ai/prompts/pilots/policyWorkflow';

export default function PilotToPolicyWorkflow({ pilot, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, isLoading: aiGenerating, status, error, rateLimitInfo } = useAIWithFallback();

  const [formData, setFormData] = useState({
    policy_recommendation_ar: '',
    policy_recommendation_en: '',
    rationale_ar: '',
    rationale_en: '',
    impact_assessment: ''
  });

  const generateAI = async () => {
    const result = await invokeAI({
      prompt: buildPolicyWorkflowPrompt({ pilot }),
      system_prompt: POLICY_WORKFLOW_SYSTEM_PROMPT,
      response_json_schema: POLICY_WORKFLOW_SCHEMA
    });

    if (result.success && result.data) {
      setFormData({
        policy_recommendation_ar: result.data.recommendation_ar || '',
        policy_recommendation_en: result.data.recommendation_en || '',
        rationale_ar: result.data.rationale_ar || '',
        rationale_en: result.data.rationale_en || '',
        impact_assessment: language === 'ar' ? result.data.impact_ar : result.data.impact_en
      });
      toast.success(t({ en: 'AI generated policy recommendation', ar: 'تم إنشاء التوصية' }));
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
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
        
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
