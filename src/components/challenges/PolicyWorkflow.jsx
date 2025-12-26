import { useState } from 'react';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';
import { useUpdateChallengeTracks } from '@/hooks/useChallengeMutations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Loader2, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function PolicyWorkflow({ challenge, onSuccess, onCancel }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { createPolicy } = usePolicyMutations();
  const updateTracks = useUpdateChallengeTracks();

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

  const handleSubmit = async () => {
    try {
      toast.info(t({ en: 'Creating policy recommendation...', ar: 'جاري إنشاء التوصية السياسية...' }));

      // Create policy recommendation
      await createPolicy.mutateAsync({
        challenge_id: challenge.id,
        entity_type: 'challenge',
        submitted_by: user?.email,
        submission_date: new Date().toISOString(),
        workflow_stage: 'draft',
        ...formData, // Spread formData directly
        title_en: formData.title_ar, // Will be translated later or by AI
        recommendation_text_en: formData.recommendation_text_ar
      });

      // Update challenge track
      const newTracks = [...new Set([...(challenge.tracks || []), 'policy'])];
      // @ts-ignore
      await updateTracks.mutateAsync({ id: challenge.id, tracks: newTracks });

      toast.success(t({ en: 'Policy recommendation created', ar: 'تم إنشاء التوصية السياسية' }));
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error('Workflow error:', error);
      toast.error(t({ en: 'Failed to create policy recommendation', ar: 'فشل إنشاء التوصية السياسية' }));
    }
  };

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
              {t({ en: 'Arabic-first system: English auto-translated', ar: 'نظام عربي أولاً: الإنجليزية تُترجم تلقائياً' })}
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
          onClick={handleSubmit}
          disabled={createPolicy.isPending || updateTracks.isPending || !formData.recommendation_text_ar}
          className="bg-gradient-to-r from-purple-600 to-indigo-600"
        >
          {createPolicy.isPending || updateTracks.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
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
