import { useState } from 'react';
import { useCaseStudyMutations } from '../hooks/useCaseStudies';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { Award, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import FileUploader from '../components/FileUploader';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CaseStudyCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    challenge_addressed: '',
    solution_applied: '',
    impact_statement: '',
    image_url: '',
    thumbnail_url: '',
    video_url: '',
    document_url: '',
    metrics: {},
    tags: []
  });

  const { createCaseStudy } = useCaseStudyMutations();

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Add Case Study', ar: 'إضافة دراسة حالة' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Document a successful innovation story', ar: 'وثق قصة ابتكار ناجحة' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            {t({ en: 'Case Study Details', ar: 'تفاصيل دراسة الحالة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Enter title"
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="أدخل العنوان"
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

          <div className="space-y-2">
            <Label>{t({ en: 'Challenge Addressed', ar: 'التحدي المعالج' })}</Label>
            <Textarea
              value={formData.challenge_addressed}
              onChange={(e) => setFormData({ ...formData, challenge_addressed: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Solution Applied', ar: 'الحل المطبق' })}</Label>
            <Textarea
              value={formData.solution_applied}
              onChange={(e) => setFormData({ ...formData, solution_applied: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Impact Statement', ar: 'بيان الأثر' })}</Label>
            <Textarea
              value={formData.impact_statement}
              onChange={(e) => setFormData({ ...formData, impact_statement: e.target.value })}
              placeholder="Describe the measurable impact and results"
              rows={3}
            />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{t({ en: 'Media Assets', ar: 'الوسائط' })}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Main Image', ar: 'الصورة الرئيسية' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Image', ar: 'رفع صورة' })}
                  maxSize={10}
                  onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                  description="Upload the main case study image"
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Thumbnail', ar: 'صورة مصغرة' })}</Label>
                <FileUploader
                  type="image"
                  label={t({ en: 'Upload Thumbnail', ar: 'رفع صورة مصغرة' })}
                  maxSize={5}
                  onUploadComplete={(url) => setFormData({ ...formData, thumbnail_url: url })}
                  description="Upload a thumbnail version"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Video (Optional)', ar: 'فيديو (اختياري)' })}</Label>
              <FileUploader
                type="video"
                label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                description="MP4, MOV - max 200MB"
                maxSize={200}
                preview={false}
                onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Full Document (Optional)', ar: 'المستند الكامل (اختياري)' })}</Label>
              <FileUploader
                type="document"
                label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                maxSize={50}
                preview={false}
                onUploadComplete={(url) => setFormData({ ...formData, document_url: url })}
                description="Upload the full PDF report"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Knowledge'))}
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => createCaseStudy.mutate(formData, {
                onSuccess: () => navigate(createPageUrl('Knowledge'))
              })}
              disabled={!formData.title_en || createCaseStudy.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {createCaseStudy.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Create Case Study', ar: 'إنشاء دراسة الحالة' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(CaseStudyCreate, { requiredPermissions: ['case_study_create'] });
