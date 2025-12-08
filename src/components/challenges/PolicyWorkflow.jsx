import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { FileText, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function PolicyWorkflow({ challenge, onSuccess, onCancel }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title_ar: `توصية سياسية لـ ${challenge.title_ar || challenge.title_en}`,
    recommendation_text_ar: '',
    regulatory_framework: '',
    regulatory_change_needed: false,
    policy_type: 'new_regulation',
    affected_stakeholders: [],
    implementation_complexity: 'medium',
    timeline_months: 6,
    impact_assessment: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      toast.info(t({ en: 'Translating to English...', ar: 'جاري الترجمة للإنجليزية...' }));
      
      // Auto-translate Arabic to English
      const translationResponse = await base44.functions.invoke('translatePolicy', {
        arabic_fields: {
          title_ar: data.title_ar,
          recommendation_text_ar: data.recommendation_text_ar,
          implementation_steps: [],
          success_metrics: [],
          stakeholder_involvement_ar: ''
        }
      });

      const translations = translationResponse.data;

      const policyRec = await base44.entities.PolicyRecommendation.create({
        challenge_id: challenge.id,
        entity_type: 'challenge',
        submitted_by: (await base44.auth.me()).email,
        submission_date: new Date().toISOString(),
        workflow_stage: 'draft',
        ...data,
        title_en: translations.title_en,
        recommendation_text_en: translations.recommendation_text_en,
        translation_metadata: translations.translation_metadata
      });

      // Update challenge track
      await base44.entities.Challenge.update(challenge.id, {
        tracks: [...new Set([...(challenge.tracks || []), 'policy'])]
      });

      return policyRec;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge', challenge.id]);
      queryClient.invalidateQueries(['policy-recommendations']);
      toast.success(t({ en: 'Policy recommendation created', ar: 'تم إنشاء التوصية السياسية' }));
      if (onSuccess) onSuccess();
    }
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            {t({ en: 'Convert Challenge to Policy Recommendation', ar: 'تحويل التحدي إلى توصية سياسية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Challenge', ar: 'التحدي' })}</p>
            <p className="font-semibold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Policy Type', ar: 'نوع السياسة' })}</Label>
            <Select
              value={formData.policy_type}
              onValueChange={(value) => setFormData({ ...formData, policy_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_regulation">{t({ en: 'New Regulation', ar: 'تنظيم جديد' })}</SelectItem>
                <SelectItem value="amendment">{t({ en: 'Amendment', ar: 'تعديل' })}</SelectItem>
                <SelectItem value="guideline">{t({ en: 'Guideline', ar: 'دليل إرشادي' })}</SelectItem>
                <SelectItem value="standard">{t({ en: 'Standard', ar: 'معيار' })}</SelectItem>
                <SelectItem value="bylaw">{t({ en: 'Municipal Bylaw', ar: 'لائحة بلدية' })}</SelectItem>
                <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <p className="text-xs text-blue-900">
              {t({ en: '🤖 Arabic-first system: English auto-translated', ar: '🤖 نظام عربي أولاً: الإنجليزية تُترجم تلقائياً' })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Policy Title (Arabic)', ar: 'عنوان السياسة' })}</Label>
            <Input
              value={formData.title_ar}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              placeholder="عنوان السياسة الموصى بها"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Recommendation Text (Arabic)', ar: 'نص التوصية' })}</Label>
            <Textarea
              value={formData.recommendation_text_ar}
              onChange={(e) => setFormData({ ...formData, recommendation_text_ar: e.target.value })}
              placeholder="صف التغيير السياسي الموصى به..."
              dir="rtl"
              rows={8}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.regulatory_change_needed}
              onChange={(e) => setFormData({ ...formData, regulatory_change_needed: e.target.checked })}
              className="rounded"
            />
            <Label>{t({ en: 'Regulatory change needed', ar: 'يتطلب تغيير تنظيمي' })}</Label>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Current Regulatory Framework', ar: 'الإطار التنظيمي الحالي' })}</Label>
            <Input
              value={formData.regulatory_framework}
              onChange={(e) => setFormData({ ...formData, regulatory_framework: e.target.value })}
              placeholder={t({ en: 'e.g., Municipal Services Law 2015', ar: 'مثلاً: قانون الخدمات البلدية 2015' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Complexity', ar: 'التعقيد' })}</Label>
              <Select
                value={formData.implementation_complexity}
                onValueChange={(value) => setFormData({ ...formData, implementation_complexity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                  <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                  <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                  <SelectItem value="very_high">{t({ en: 'Very High', ar: 'عالي جداً' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Timeline (Months)', ar: 'الجدول الزمني (شهور)' })}</Label>
              <Input
                type="number"
                value={formData.timeline_months}
                onChange={(e) => setFormData({ ...formData, timeline_months: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Impact Assessment', ar: 'تقييم الأثر' })}</Label>
            <Textarea
              value={formData.impact_assessment}
              onChange={(e) => setFormData({ ...formData, impact_assessment: e.target.value })}
              placeholder={t({ en: 'Expected impact of this policy change', ar: 'الأثر المتوقع لهذا التغيير السياسي' })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
        <Button
          onClick={() => submitMutation.mutate(formData)}
          disabled={submitMutation.isPending || !formData.recommendation_text_ar}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Translating & saving...', ar: 'جاري الترجمة والحفظ...' })}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Create Policy Recommendation', ar: 'إنشاء توصية سياسية' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}