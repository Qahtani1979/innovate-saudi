import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function RDToPolicyConverter({ rdProject, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [policyData, setPolicyData] = useState({
    title_en: '',
    title_ar: '',
    recommendation_text_en: '',
    recommendation_text_ar: '',
    rationale_en: '',
    rationale_ar: '',
    rd_project_id: rdProject.id,
    entity_type: 'rd_project',
    sector: rdProject.research_area_en || '',
    workflow_stage: 'draft',
    source: 'research',
    supporting_evidence: rdProject.publications || []
  });

  const generatePolicy = async () => {
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a policy analyst. Generate an evidence-based policy recommendation from this R&D project:

Research Title: ${rdProject.title_en}
Abstract: ${rdProject.abstract_en}
Research Area: ${rdProject.research_area_en}
Publications: ${JSON.stringify(rdProject.publications || [])}
Impact Assessment: ${JSON.stringify(rdProject.impact_assessment || {})}
TRL: ${rdProject.trl_current}

Generate:
1. Policy title (EN + AR)
2. Policy recommendation text (EN + AR) - actionable policy changes
3. Rationale (EN + AR) - evidence from research findings
4. Implementation steps (EN + AR)
5. Success metrics
6. Affected stakeholders

Be specific and actionable for municipal implementation.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            recommendation_text_en: { type: 'string' },
            recommendation_text_ar: { type: 'string' },
            rationale_en: { type: 'string' },
            rationale_ar: { type: 'string' },
            implementation_steps_en: { type: 'string' },
            implementation_steps_ar: { type: 'string' },
            success_metrics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  metric_en: { type: 'string' },
                  metric_ar: { type: 'string' },
                  target: { type: 'string' }
                }
              }
            },
            affected_stakeholders: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      setPolicyData(prev => ({
        ...prev,
        title_en: result.title_en,
        title_ar: result.title_ar,
        recommendation_text_en: result.recommendation_text_en,
        recommendation_text_ar: result.recommendation_text_ar,
        rationale_en: result.rationale_en,
        rationale_ar: result.rationale_ar,
        implementation_steps_en: result.implementation_steps_en,
        implementation_steps_ar: result.implementation_steps_ar,
        success_metrics: result.success_metrics,
        affected_stakeholders: result.affected_stakeholders
      }));

      toast.success(t({ en: 'AI generated policy', ar: 'تم إنشاء السياسة' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setAiGenerating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const policy = await base44.entities.PolicyRecommendation.create(data);
      
      // Update R&D with policy impact
      await base44.entities.RDProject.update(rdProject.id, {
        policy_impact: {
          ...rdProject.policy_impact,
          policy_generated_id: policy.id,
          policy_generated_date: new Date().toISOString()
        }
      });

      return policy;
    },
    onSuccess: (policy) => {
      queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      toast.success(t({ en: 'Policy created!', ar: 'تم إنشاء السياسة!' }));
      onSuccess?.(policy);
      onClose?.();
    }
  });

  return (
    <Card className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Generate Policy Recommendation', ar: 'إنشاء توصية سياسة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* R&D Context */}
        <div className="p-4 bg-purple-50 rounded-lg flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-medium text-purple-900 mb-1">
              {t({ en: 'Source R&D:', ar: 'المصدر البحثي:' })}
            </p>
            <p className="text-sm font-semibold">{rdProject.title_en}</p>
            <p className="text-xs text-slate-600 mt-1">
              {rdProject.publications?.length || 0} {t({ en: 'publications', ar: 'منشورات' })}
            </p>
          </div>
        </div>

        {/* AI Button */}
        <Button
          onClick={generatePolicy}
          disabled={aiGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {aiGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Generating Evidence-Based Policy...', ar: 'جاري إنشاء سياسة قائمة على الأدلة...' })}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Generate Evidence-Based Policy', ar: 'إنشاء سياسة قائمة على الأدلة' })}
            </>
          )}
        </Button>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (EN)', ar: 'العنوان (EN)' })}</label>
            <Input
              value={policyData.title_en}
              onChange={(e) => setPolicyData({ ...policyData, title_en: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Title (AR)', ar: 'العنوان (AR)' })}</label>
            <Input
              value={policyData.title_ar}
              onChange={(e) => setPolicyData({ ...policyData, title_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Recommendation (EN)', ar: 'التوصية (EN)' })}</label>
            <Textarea
              value={policyData.recommendation_text_en}
              onChange={(e) => setPolicyData({ ...policyData, recommendation_text_en: e.target.value })}
              rows={5}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Recommendation (AR)', ar: 'التوصية (AR)' })}</label>
            <Textarea
              value={policyData.recommendation_text_ar}
              onChange={(e) => setPolicyData({ ...policyData, recommendation_text_ar: e.target.value })}
              rows={5}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Rationale (EN)', ar: 'المبرر (EN)' })}</label>
            <Textarea
              value={policyData.rationale_en}
              onChange={(e) => setPolicyData({ ...policyData, rationale_en: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Rationale (AR)', ar: 'المبرر (AR)' })}</label>
            <Textarea
              value={policyData.rationale_ar}
              onChange={(e) => setPolicyData({ ...policyData, rationale_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={() => createMutation.mutate(policyData)}
            disabled={createMutation.isPending || !policyData.recommendation_text_en || !policyData.recommendation_text_ar}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                {t({ en: 'Create Policy', ar: 'إنشاء السياسة' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}