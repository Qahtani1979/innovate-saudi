import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RDToSolutionConverter({ rdProject, onClose, onSuccess }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [aiGenerating, setAiGenerating] = useState(false);
  const [solutionData, setSolutionData] = useState({
    name_en: rdProject.title_en || '',
    name_ar: rdProject.title_ar || '',
    tagline_en: '',
    tagline_ar: '',
    description_en: rdProject.abstract_en || '',
    description_ar: rdProject.abstract_ar || '',
    provider_name: rdProject.institution_en || '',
    provider_type: rdProject.institution_type || 'university',
    maturity_level: rdProject.trl_current >= 8 ? 'market_ready' : rdProject.trl_current >= 6 ? 'pilot_ready' : 'prototype',
    trl: rdProject.trl_current || 7,
    sectors: [rdProject.research_area_en || ''],
    contact_email: rdProject.principal_investigator?.email || '',
    technical_specifications: {},
    value_proposition: '',
    use_cases: [],
    pricing_model: '',
    origin_rd_project_id: rdProject.id
  });

  const generateCommercialProfile = async () => {
    setAiGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an R&D commercialization expert. Generate a commercial solution profile from this research project:

Research Title: ${rdProject.title_en}
Abstract: ${rdProject.abstract_en}
Research Area: ${rdProject.research_area_en}
Current TRL: ${rdProject.trl_current}
Outputs: ${JSON.stringify(rdProject.expected_outputs || [])}
Publications: ${JSON.stringify(rdProject.publications || [])}

Generate:
1. Commercial tagline (EN + AR)
2. Market-ready description (EN + AR)
3. Value proposition (why municipalities/companies should adopt)
4. 3-5 practical use cases with sectors
5. Pricing model recommendation
6. Technical specifications summary

Be compelling and highlight practical municipal applications.`,
        response_json_schema: {
          type: 'object',
          properties: {
            tagline_en: { type: 'string' },
            tagline_ar: { type: 'string' },
            description_en: { type: 'string' },
            description_ar: { type: 'string' },
            value_proposition: { type: 'string' },
            use_cases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  sector: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            pricing_model: { type: 'string' },
            technical_specifications: { type: 'object' }
          }
        }
      });

      setSolutionData(prev => ({
        ...prev,
        tagline_en: result.tagline_en,
        tagline_ar: result.tagline_ar,
        description_en: result.description_en,
        description_ar: result.description_ar,
        value_proposition: result.value_proposition,
        use_cases: result.use_cases,
        pricing_model: result.pricing_model,
        technical_specifications: result.technical_specifications
      }));

      toast.success(t({ en: 'AI generated commercial profile', ar: 'تم إنشاء الملف التجاري بالذكاء' }));
    } catch (error) {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل الإنشاء الذكي' }));
    } finally {
      setAiGenerating(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const solution = await base44.entities.Solution.create(data);
      
      // Update R&D project with commercialization notes
      await base44.entities.RDProject.update(rdProject.id, {
        commercialization_notes: `Commercialized as Solution ${solution.id}`,
        commercialization_solution_id: solution.id
      });

      // Create activity log
      await base44.entities.SystemActivity.create({
        activity_type: 'rd_commercialized',
        entity_type: 'rd_project',
        entity_id: rdProject.id,
        description_en: `R&D project commercialized as Solution: ${solution.name_en}`,
        metadata: { solution_id: solution.id }
      });

      return solution;
    },
    onSuccess: (solution) => {
      queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      toast.success(t({ en: 'Solution created successfully!', ar: 'تم إنشاء الحل بنجاح!' }));
      onSuccess?.(solution);
      onClose?.();
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to create solution', ar: 'فشل إنشاء الحل' }));
    }
  });

  const handleSubmit = () => {
    if (!solutionData.name_en || !solutionData.provider_name) {
      toast.error(t({ en: 'Name and provider required', ar: 'الاسم والمزود مطلوبان' }));
      return;
    }
    createMutation.mutate(solutionData);
  };

  return (
    <Card className="max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="border-b bg-gradient-to-r from-green-50 to-blue-50">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-600" />
          {t({ en: 'Commercialize R&D as Solution', ar: 'تسويق البحث كحل' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-2">
          {t({ en: 'Transform research outputs into a market-ready solution', ar: 'تحويل مخرجات البحث إلى حل جاهز للسوق' })}
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* TRL Warning */}
        {rdProject.trl_current < 7 && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                {t({ en: 'TRL Warning', ar: 'تحذير مستوى النضج' })}
              </p>
              <p className="text-xs text-amber-700 mt-1">
                {t({ 
                  en: `Current TRL is ${rdProject.trl_current}. Recommended TRL ≥ 7 for commercialization.`,
                  ar: `مستوى النضج الحالي ${rdProject.trl_current}. الموصى به ≥ 7 للتسويق.`
                })}
              </p>
            </div>
          </div>
        )}

        {/* R&D Context */}
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-xs font-medium text-purple-900 mb-2">
            {t({ en: 'Source R&D Project:', ar: 'المشروع البحثي المصدر:' })}
          </p>
          <p className="text-sm font-semibold text-slate-900">{rdProject.title_en}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{t({ en: 'TRL', ar: 'مستوى النضج' })}: {rdProject.trl_current}</Badge>
            <Badge>{rdProject.status}</Badge>
          </div>
        </div>

        {/* AI Generation */}
        <div className="flex justify-end">
          <Button
            onClick={generateCommercialProfile}
            disabled={aiGenerating}
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate Commercial Profile with AI', ar: 'إنشاء الملف التجاري بالذكاء' })}
              </>
            )}
          </Button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Solution Name (EN)', ar: 'اسم الحل (EN)' })}</label>
            <Input
              value={solutionData.name_en}
              onChange={(e) => setSolutionData({ ...solutionData, name_en: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Solution Name (AR)', ar: 'اسم الحل (AR)' })}</label>
            <Input
              value={solutionData.name_ar}
              onChange={(e) => setSolutionData({ ...solutionData, name_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Tagline (EN)', ar: 'الشعار (EN)' })}</label>
            <Input
              value={solutionData.tagline_en}
              onChange={(e) => setSolutionData({ ...solutionData, tagline_en: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Tagline (AR)', ar: 'الشعار (AR)' })}</label>
            <Input
              value={solutionData.tagline_ar}
              onChange={(e) => setSolutionData({ ...solutionData, tagline_ar: e.target.value })}
              dir="rtl"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Description (EN)', ar: 'الوصف (EN)' })}</label>
            <Textarea
              value={solutionData.description_en}
              onChange={(e) => setSolutionData({ ...solutionData, description_en: e.target.value })}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Description (AR)', ar: 'الوصف (AR)' })}</label>
            <Textarea
              value={solutionData.description_ar}
              onChange={(e) => setSolutionData({ ...solutionData, description_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t({ en: 'Value Proposition', ar: 'القيمة المقترحة' })}</label>
          <Textarea
            value={solutionData.value_proposition}
            onChange={(e) => setSolutionData({ ...solutionData, value_proposition: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">{t({ en: 'Provider Name', ar: 'اسم المزود' })}</label>
            <Input
              value={solutionData.provider_name}
              onChange={(e) => setSolutionData({ ...solutionData, provider_name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t({ en: 'Contact Email', ar: 'البريد الإلكتروني' })}</label>
            <Input
              type="email"
              value={solutionData.contact_email}
              onChange={(e) => setSolutionData({ ...solutionData, contact_email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t({ en: 'Pricing Model', ar: 'نموذج التسعير' })}</label>
          <Input
            value={solutionData.pricing_model}
            onChange={(e) => setSolutionData({ ...solutionData, pricing_model: e.target.value })}
            placeholder={t({ en: 'e.g., Subscription, License, Per-deployment', ar: 'مثلاً: اشتراك، رخصة، لكل نشر' })}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-green-600 to-blue-600"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                {t({ en: 'Create Solution', ar: 'إنشاء الحل' })}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}