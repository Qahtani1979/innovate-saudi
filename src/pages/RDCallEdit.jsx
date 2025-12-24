import React, { useState } from 'react';

import { useRDCall } from '@/hooks/useRDCallsWithVisibility';
import { useRDCallMutations } from '@/hooks/useRDCallMutations';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function RDCallEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const callId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const { invokeAI, isLoading: aiEnhancing, status, error, rateLimitInfo } = useAIWithFallback();

  const { data: call, isLoading } = useRDCall(callId);
  const { updateRDCall, isUpdating } = useRDCallMutations();

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (call && !formData) {
      setFormData(call);
    }
  }, [call]);

  const handleUpdate = async () => {
    try {
      await updateRDCall(formData);
      navigate(createPageUrl(`RDCallDetail?id=${callId}`));
    } catch (error) {
      // Toast handled in hook
    }
  };

  const handleAIEnhance = async () => {
    const prompt = `Enhance this R&D call with professional content for Saudi municipal innovation:

Title: ${formData.title_en}
Current Description: ${formData.description_en || 'N/A'}
Current Themes: ${formData.research_themes?.map(t => t.theme).join(', ') || 'N/A'}
Call Type: ${formData.call_type || 'open_call'}

Generate comprehensive enhanced bilingual content:
1. Improved title (keep essence, make more professional) and tagline (EN + AR)
2. Professional detailed description (EN + AR) - 500+ words explaining scope, importance, alignment with Vision 2030
3. Clear objectives in both languages
4. Enhanced/expanded research themes with descriptions (3-5 themes)
5. Expected outcomes/deliverables (5-7 items)
6. Eligibility criteria (5-7 items)
7. Evaluation criteria with weights (4-5 items, weights sum to 100)
8. Submission requirements (3-5 items)
9. Focus areas/keywords (5-8 items)`;

    const result = await invokeAI({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title_en: { type: 'string' },
          title_ar: { type: 'string' },
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          objectives_en: { type: 'string' },
          objectives_ar: { type: 'string' },
          expected_outcomes: { type: 'array', items: { type: 'string' } },
          eligibility_criteria: { type: 'array', items: { type: 'string' } },
          research_themes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
                description: { type: 'string' }
              }
            }
          },
          evaluation_criteria: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                criterion: { type: 'string' },
                description: { type: 'string' },
                weight: { type: 'number' }
              }
            }
          },
          submission_requirements: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                requirement: { type: 'string' },
                description: { type: 'string' },
                mandatory: { type: 'boolean' }
              }
            }
          },
          focus_areas: { type: 'array', items: { type: 'string' } }
        }
      },
      system_prompt: "You are an expert R&D consultant helping to draft professional research calls."
    });

    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        title_en: result.data.title_en || prev.title_en,
        title_ar: result.data.title_ar || prev.title_ar,
        tagline_en: result.data.tagline_en || prev.tagline_en,
        tagline_ar: result.data.tagline_ar || prev.tagline_ar,
        description_en: result.data.description_en || prev.description_en,
        description_ar: result.data.description_ar || prev.description_ar,
        objectives_en: result.data.objectives_en || prev.objectives_en,
        objectives_ar: result.data.objectives_ar || prev.objectives_ar,
        expected_outcomes: result.data.expected_outcomes || prev.expected_outcomes,
        eligibility_criteria: result.data.eligibility_criteria || prev.eligibility_criteria,
        research_themes: result.data.research_themes || prev.research_themes,
        evaluation_criteria: result.data.evaluation_criteria || prev.evaluation_criteria,
        submission_requirements: result.data.submission_requirements || prev.submission_requirements,
        focus_areas: result.data.focus_areas || prev.focus_areas
      }));
      toast.success(t({ en: '✨ AI enhancement complete! All fields updated.', ar: '✨ تم التحسين! تم تحديث جميع الحقول.' }));
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit R&D Call', ar: 'تعديل دعوة البحث' })}
        </h1>
        <p className="text-slate-600 mt-1">{formData.title_en}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Call Information', ar: 'معلومات الدعوة' })}</CardTitle>
            <Button onClick={handleAIEnhance} disabled={aiEnhancing} variant="outline" size="sm">
              {aiEnhancing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input
                value={formData.title_ar || ''}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
              <Input
                value={formData.tagline_en || ''}
                onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
              <Input
                value={formData.tagline_ar || ''}
                onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
            <Textarea
              value={formData.description_en || ''}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
            <Textarea
              value={formData.description_ar || ''}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Call Type', ar: 'نوع الدعوة' })}</Label>
              <Select
                value={formData.call_type || 'open_call'}
                onValueChange={(v) => setFormData({ ...formData, call_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open_call">{t({ en: 'Open Call', ar: 'دعوة مفتوحة' })}</SelectItem>
                  <SelectItem value="targeted_call">{t({ en: 'Targeted Call', ar: 'دعوة موجهة' })}</SelectItem>
                  <SelectItem value="challenge_driven">{t({ en: 'Challenge Driven', ar: 'مبنية على التحديات' })}</SelectItem>
                  <SelectItem value="collaborative">{t({ en: 'Collaborative', ar: 'تعاونية' })}</SelectItem>
                  <SelectItem value="fellowship">{t({ en: 'Fellowship', ar: 'زمالة' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                  <SelectItem value="published">{t({ en: 'Published', ar: 'منشورة' })}</SelectItem>
                  <SelectItem value="open">{t({ en: 'Open', ar: 'مفتوحة' })}</SelectItem>
                  <SelectItem value="closed">{t({ en: 'Closed', ar: 'مغلقة' })}</SelectItem>
                  <SelectItem value="under_review">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</SelectItem>
                  <SelectItem value="awarded">{t({ en: 'Awarded', ar: 'ممنوحة' })}</SelectItem>
                  <SelectItem value="completed">{t({ en: 'Completed', ar: 'مكتملة' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Submission Open', ar: 'فتح التقديم' })}</Label>
              <Input
                type="date"
                value={formData.timeline?.submission_open || formData.open_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: { ...(formData.timeline || {}), submission_open: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Submission Close', ar: 'إغلاق التقديم' })}</Label>
              <Input
                type="date"
                value={formData.timeline?.submission_close || formData.close_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: { ...(formData.timeline || {}), submission_close: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Award Date', ar: 'تاريخ الإعلان' })}</Label>
              <Input
                type="date"
                value={formData.timeline?.award_date || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  timeline: { ...(formData.timeline || {}), award_date: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Total Funding (SAR)', ar: 'إجمالي التمويل (ريال)' })}</Label>
              <Input
                type="number"
                value={formData.total_funding || formData.budget_total || ''}
                onChange={(e) => setFormData({ ...formData, total_funding: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Number of Awards', ar: 'عدد الجوائز' })}</Label>
              <Input
                type="number"
                value={formData.number_of_awards || ''}
                onChange={(e) => setFormData({ ...formData, number_of_awards: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Call Media', ar: 'وسائط الدعوة' })}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Call Image/Banner', ar: 'صورة/بانر الدعوة' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                  maxSize={10}
                  enableImageSearch={true}
                  searchContext={formData.title_en}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  description="Upload a cover image for the call (JPG, PNG)"
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Call Document/Brochure', ar: 'مستند/كتيب الدعوة' })}</Label>
                <FileUploader
                  type="document"
                  label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                  maxSize={50}
                  preview={false}
                  onUploadComplete={(url) => setFormData({ ...formData, brochure_url: url })}
                  description="Upload the official call document (PDF, Max 50MB)"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`RDCallDetail?id=${callId}`))}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RDCallEdit, { requireAdmin: true });
