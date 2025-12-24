import { useState } from 'react';
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
import { Save, Loader2, Sparkles, Megaphone } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function RDCallCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { invokeAI, status: aiStatus, isLoading: aiDrafting, rateLimitInfo, isAvailable, error: aiError } = useAIWithFallback();

  const [formData, setFormData] = useState({
    code: '',
    title_en: '',
    title_ar: '',
    tagline_en: '',
    tagline_ar: '',
    description_en: '',
    description_ar: '',
    issuing_organization_id: '',
    call_type: 'open_call',
    focus_areas: [],
    research_themes: [],
    objectives_en: '',
    objectives_ar: '',
    eligibility_criteria: [],
    expected_outcomes: [],
    timeline: {
      announcement_date: '',
      submission_open: '',
      submission_close: '',
      review_period: '',
      award_date: '',
      project_start: ''
    },
    status: 'draft',
    total_funding: '',
    funding_per_project: {
      min: '',
      max: ''
    },
    number_of_awards: '',
    submission_requirements: [],
    evaluation_criteria: [],
    contact_person: {
      name: '',
      email: '',
      phone: ''
    },
    is_published: false,
    is_featured: false,
    image_url: '',
    brochure_url: ''
  });

  const { createRDCall, isCreating } = useRDCallMutations();

  const handleCreate = async () => {
    try {
      await createRDCall(formData);
      navigate(createPageUrl('RDCalls'));
    } catch (error) {
      // Toast handled in hook
    }
  };

  const handleAIDraft = async () => {
    if (!formData.title_en) {
      toast.error(t({ en: 'Please enter a title first', ar: 'يرجى إدخال العنوان أولاً' }));
      return;
    }

    // Import centralized prompt module
    const { RD_CALL_CREATE_PROMPT_TEMPLATE, RD_CALL_CREATE_RESPONSE_SCHEMA } = await import('@/lib/ai/prompts/rd/callCreate');

    const { success, data } = await invokeAI({
      prompt: RD_CALL_CREATE_PROMPT_TEMPLATE(formData),
      response_json_schema: RD_CALL_CREATE_RESPONSE_SCHEMA,
      system_prompt: "You are an expert R&D consultant helping to draft research call documents."
    });

    if (success) {
      setFormData(prev => ({
        ...prev,
        title_ar: data.title_ar || prev.title_ar,
        tagline_en: data.tagline_en || prev.tagline_en,
        tagline_ar: data.tagline_ar || prev.tagline_ar,
        description_en: data.description_en || prev.description_en,
        description_ar: data.description_ar || prev.description_ar,
        objectives_en: data.objectives_en || prev.objectives_en,
        objectives_ar: data.objectives_ar || prev.objectives_ar,
        eligibility_criteria: data.eligibility_criteria || prev.eligibility_criteria,
        expected_outcomes: data.expected_outcomes || prev.expected_outcomes,
        research_themes: data.research_themes || prev.research_themes,
        evaluation_criteria: data.evaluation_criteria || prev.evaluation_criteria,
        submission_requirements: data.submission_requirements || prev.submission_requirements,
        focus_areas: data.focus_areas || prev.focus_areas
      }));
      toast.success(t({ en: '✨ AI draft complete! All fields populated.', ar: '✨ تم إكمال المسودة! تم ملء جميع الحقول.' }));
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          icon={Megaphone}
          title={t({ en: 'Create R&D Call', ar: 'إنشاء دعوة بحث وتطوير' })}
          description={t({ en: 'Launch a new research funding call', ar: 'إطلاق دعوة تمويل بحثية جديدة' })} subtitle={undefined} action={undefined} actions={undefined} children={undefined} />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t({ en: 'Call Information', ar: 'معلومات الدعوة' })}</CardTitle>
              <div className="flex items-center gap-2">
                <Button onClick={handleAIDraft} disabled={aiDrafting || !isAvailable} variant="outline">
                  {aiDrafting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Drafting...', ar: 'جاري الصياغة...' })}</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'AI Draft Complete Call', ar: 'صياغة كاملة ذكية' })}</>
                  )}
                </Button>
                <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} error={aiError} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t({ en: 'Call Code', ar: 'رمز الدعوة' })}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="CALL-2025-SMART-01"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Title (English) *', ar: 'العنوان (إنجليزي) *' })}</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder={t({ en: 'Innovation in Smart Cities', ar: 'الابتكار في المدن الذكية' })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
                <Input
                  value={formData.tagline_en}
                  onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                  placeholder={t({ en: 'Advancing urban innovation through research', ar: 'تعزيز الابتكار الحضري من خلال البحث' })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
                <Input
                  value={formData.tagline_ar}
                  onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={4}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Call Type *', ar: 'نوع الدعوة *' })}</Label>
                <Select
                  value={formData.call_type}
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
                <Label>{t({ en: 'Number of Awards', ar: 'عدد الجوائز' })}</Label>
                <Input
                  type="number"
                  value={formData.number_of_awards?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, number_of_awards: parseInt(e.target.value) })}
                  placeholder="5"
                />
              </div>
            </div>

            <div>
              <Label>{t({ en: 'Objectives (English)', ar: 'الأهداف (إنجليزي)' })}</Label>
              <Textarea
                value={formData.objectives_en}
                onChange={(e) => setFormData({ ...formData, objectives_en: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Submission Open Date', ar: 'تاريخ فتح التقديم' })}</Label>
                <Input
                  type="date"
                  value={formData.timeline.submission_open}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeline: { ...formData.timeline, submission_open: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Submission Close Date', ar: 'تاريخ إغلاق التقديم' })}</Label>
                <Input
                  type="date"
                  value={formData.timeline.submission_close}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeline: { ...formData.timeline, submission_close: e.target.value }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Total Funding (SAR)', ar: 'إجمالي التمويل (ريال)' })}</Label>
                <Input
                  type="number"
                  value={formData.total_funding?.toString() || ''}
                  onChange={(e) => setFormData({ ...formData, total_funding: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Min per Project (SAR)', ar: 'الحد الأدنى للمشروع (ريال)' })}</Label>
                <Input
                  type="number"
                  value={formData.funding_per_project.min?.toString() || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    funding_per_project: { ...formData.funding_per_project, min: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Max per Project (SAR)', ar: 'الحد الأقصى للمشروع (ريال)' })}</Label>
                <Input
                  type="number"
                  value={formData.funding_per_project.max?.toString() || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    funding_per_project: { ...formData.funding_per_project, max: parseFloat(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Contact Name', ar: 'اسم جهة الاتصال' })}</Label>
                <Input
                  value={formData.contact_person.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_person: { ...formData.contact_person, name: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Contact Email', ar: 'البريد الإلكتروني' })}</Label>
                <Input
                  type="email"
                  value={formData.contact_person.email}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_person: { ...formData.contact_person, email: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Contact Phone', ar: 'رقم الهاتف' })}</Label>
                <Input
                  value={formData.contact_person.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact_person: { ...formData.contact_person, phone: e.target.value }
                  })}
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
                    description={t({ en: 'Upload a banner image for the call', ar: 'تحميل صورة بانر للدعوة' })}
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded mt-2" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Call Document', ar: 'مستند الدعوة' })}</Label>
                  <FileUploader
                    type="document"
                    label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                    maxSize={50}
                    preview={false}
                    onUploadComplete={(url) => setFormData({ ...formData, brochure_url: url })}
                    description={t({ en: 'Upload the call brochure (PDF)', ar: 'تحميل كتيب الدعوة (PDF)' })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => navigate(createPageUrl('RDCalls'))}>
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !formData.title_en || !formData.call_type}
                className="bg-gradient-to-r from-blue-600 to-teal-600"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Creating...', ar: 'جاري الإنشاء...' })}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t({ en: 'Create Call', ar: 'إنشاء الدعوة' })}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(RDCallCreate, { requireAdmin: true });