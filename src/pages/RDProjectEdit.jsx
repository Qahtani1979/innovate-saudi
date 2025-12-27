import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles, X } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useRDProject } from '@/hooks/useRDProjectsWithVisibility';
import { useRDProjectMutations } from '@/hooks/useRDProjectMutations';
import { RD_PROJECT_SYSTEM_PROMPT, rdProjectPrompts } from '@/lib/ai/prompts/rd/projectPrompts';
import { buildPrompt } from '@/lib/ai/promptBuilder';

function RDProjectEditPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();


  const { data: project, isLoading } = useRDProject(projectId);
  const { updateRDProject } = useRDProjectMutations();

  const [formData, setFormData] = useState(null);

  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  React.useEffect(() => {
    if (project && !formData) {
      setFormData(project);
    }
  }, [project]);

  const handleUpdate = () => {
    updateRDProject.mutate(formData);
  };

  const handleAIEnhance = async () => {
    // Build Prompt
    const { prompt, schema } = buildPrompt(rdProjectPrompts.enhance, {
      formData
    });

    const result = await invokeAI({
      prompt,
      system_prompt: RD_PROJECT_SYSTEM_PROMPT,
      response_json_schema: schema
    });

    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        title_en: result.data.title_en || prev.title_en,
        title_ar: result.data.title_ar || prev.title_ar,
        tagline_en: result.data.tagline_en || prev.tagline_en,
        tagline_ar: result.data.tagline_ar || prev.tagline_ar,
        abstract_en: result.data.abstract_en || prev.abstract_en,
        abstract_ar: result.data.abstract_ar || prev.abstract_ar,
        institution_en: result.data.institution_en || prev.institution_en,
        institution_ar: result.data.institution_ar || prev.institution_ar,
        research_area_en: result.data.research_area_en || prev.research_area_en,
        research_area_ar: result.data.research_area_ar || prev.research_area_ar,
        methodology_en: result.data.methodology_en || prev.methodology_en,
        methodology_ar: result.data.methodology_ar || prev.methodology_ar,
        funding_source_en: result.data.funding_source_en || prev.funding_source_en,
        funding_source_ar: result.data.funding_source_ar || prev.funding_source_ar,
        principal_investigator: result.data.principal_investigator ? {
          ...prev.principal_investigator,
          name_en: result.data.principal_investigator.name_en || prev.principal_investigator?.name_en,
          name_ar: result.data.principal_investigator.name_ar || prev.principal_investigator?.name_ar,
          title_en: result.data.principal_investigator.title_en || prev.principal_investigator?.title_en,
          title_ar: result.data.principal_investigator.title_ar || prev.principal_investigator?.title_ar
        } : prev.principal_investigator,
        keywords: result.data.keywords || prev.keywords,
        research_themes: result.data.research_themes || prev.research_themes,
        expected_outputs: result.data.expected_outputs || prev.expected_outputs,
        impact_assessment: result.data.impact_assessment || prev.impact_assessment,
        pilot_opportunities: result.data.pilot_opportunities || prev.pilot_opportunities
      }));

      toast.success(t({ en: '✨ AI enhancement complete! All bilingual fields updated.', ar: '✨ تم التحسين! تم تحديث جميع الحقول ثنائية اللغة.' }));
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
          {t({ en: 'Edit R&D Project', ar: 'تعديل مشروع البحث والتطوير' })}
        </h1>
        <p className="text-slate-600 mt-1">{formData.title_en}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Project Information', ar: 'معلومات المشروع' })}</CardTitle>
            <Button
              onClick={handleAIEnhance}
              disabled={isAIProcessing}
              variant="outline"
              size="sm"
            >
              {isAIProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Abstract (English)', ar: 'الملخص (إنجليزي)' })}</Label>
              <Textarea
                value={formData.abstract_en || ''}
                onChange={(e) => setFormData({ ...formData, abstract_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Abstract (Arabic)', ar: 'الملخص (عربي)' })}</Label>
              <Textarea
                value={formData.abstract_ar || ''}
                onChange={(e) => setFormData({ ...formData, abstract_ar: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Institution (English)', ar: 'المؤسسة (إنجليزي)' })}</Label>
              <Input
                value={formData.institution_en || formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Institution (Arabic)', ar: 'المؤسسة (عربي)' })}</Label>
              <Input
                value={formData.institution_ar || ''}
                onChange={(e) => setFormData({ ...formData, institution_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Research Area (English)', ar: 'مجال البحث (إنجليزي)' })}</Label>
              <Input
                value={formData.research_area_en || formData.research_area || ''}
                onChange={(e) => setFormData({ ...formData, research_area_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Research Area (Arabic)', ar: 'مجال البحث (عربي)' })}</Label>
              <Input
                value={formData.research_area_ar || ''}
                onChange={(e) => setFormData({ ...formData, research_area_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Methodology (English)', ar: 'المنهجية (إنجليزي)' })}</Label>
              <Textarea
                value={formData.methodology_en || formData.methodology || ''}
                onChange={(e) => setFormData({ ...formData, methodology_en: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Methodology (Arabic)', ar: 'المنهجية (عربي)' })}</Label>
              <Textarea
                value={formData.methodology_ar || ''}
                onChange={(e) => setFormData({ ...formData, methodology_ar: e.target.value })}
                rows={3}
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="proposal">{t({ en: 'Proposal', ar: 'مقترح' })}</SelectItem>
                  <SelectItem value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</SelectItem>
                  <SelectItem value="active">{t({ en: 'Active', ar: 'نشط' })}</SelectItem>
                  <SelectItem value="on_hold">{t({ en: 'On Hold', ar: 'معلق' })}</SelectItem>
                  <SelectItem value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</SelectItem>
                  <SelectItem value="terminated">{t({ en: 'Terminated', ar: 'منتهي' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Duration (months)', ar: 'المدة (شهور)' })}</Label>
              <Input
                type="number"
                value={formData.duration_months || ''}
                onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Start', ar: 'المستوى التقني الحالي' })}</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={formData.trl_start || ''}
                onChange={(e) => setFormData({ ...formData, trl_start: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Current', ar: 'المستوى الحالي' })}</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={formData.trl_current || ''}
                onChange={(e) => setFormData({ ...formData, trl_current: parseInt(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Target', ar: 'المستوى المستهدف' })}</Label>
              <Input
                type="number"
                min="1"
                max="9"
                value={formData.trl_target || ''}
                onChange={(e) => setFormData({ ...formData, trl_target: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
            <Input
              type="number"
              value={formData.budget || ''}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Funding Source (English)', ar: 'مصدر التمويل (إنجليزي)' })}</Label>
              <Input
                value={formData.funding_source_en || formData.funding_source || ''}
                onChange={(e) => setFormData({ ...formData, funding_source_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Funding Source (Arabic)', ar: 'مصدر التمويل (عربي)' })}</Label>
              <Input
                value={formData.funding_source_ar || ''}
                onChange={(e) => setFormData({ ...formData, funding_source_ar: e.target.value })}
                dir="rtl"
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Media & Documentation', ar: 'الوسائط والتوثيق' })}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Project Image', ar: 'صورة المشروع' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                  description={t({ en: 'Project cover image', ar: 'صورة غلاف المشروع' })}
                  maxSize={10}
                  enableImageSearch={true}
                  searchContext={formData.title_en}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                />
                {formData.image_url && (
                  <img src={formData.image_url} alt="Current" className="w-full h-32 object-cover rounded" />
                )}
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Presentation Video', ar: 'فيديو العرض' })}</Label>
                <FileUploader
                  type="video"
                  label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                  description={t({ en: 'Project presentation video', ar: 'فيديو عرض المشروع' })}
                  maxSize={200}
                  preview={false}
                  onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Gallery Images', ar: 'معرض الصور' })}</Label>
              <FileUploader
                type="image"
                label={t({ en: 'Add to Gallery', ar: 'إضافة للمعرض' })}
                description={t({ en: 'Additional project images', ar: 'صور إضافية للمشروع' })}
                maxSize={10}
                onUploadComplete={(url) => {
                  setFormData(prev => ({
                    ...prev,
                    gallery_urls: [...(prev.gallery_urls || []), url]
                  }));
                }}
              />
              {formData.gallery_urls?.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {formData.gallery_urls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 h-6 w-6"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx)
                          }));
                        }}
                      >
                        <X className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`RDProjectDetail?id=${projectId}`))}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateRDProject.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {updateRDProject.isPending ? (
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

export default ProtectedPage(RDProjectEditPage, {
  requiredPermissions: ['rd_project_edit']
});
