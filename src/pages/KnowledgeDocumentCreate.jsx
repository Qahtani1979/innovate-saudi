import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../components/LanguageContext';
import { BookOpen, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import FileUploader from '../components/FileUploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function KnowledgeDocumentCreate() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    doc_type: 'guideline',
    content_type: 'document',
    category: '',
    file_url: '',
    thumbnail_url: '',
    video_url: '',
    audio_url: '',
    duration: '',
    tags: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.KnowledgeDocument.create(data),
    onSuccess: () => {
      // Auto-generate embedding
      base44.functions.invoke('generateEmbeddings', {
        entity_name: 'KnowledgeDocument',
        mode: 'missing'
      }).catch(err => console.error('Embedding generation failed:', err));
      toast.success(t({ en: 'Document created', ar: 'تم إنشاء المستند' }));
      navigate(createPageUrl('Knowledge'));
    }
  });

  return (
    <PageLayout className="max-w-4xl mx-auto">
      <PageHeader
        icon={BookOpen}
        title={{ en: 'Add Knowledge Document', ar: 'إضافة مستند معرفي' }}
        description={{ en: 'Add a new resource to the knowledge base', ar: 'أضف مورداً جديداً إلى قاعدة المعرفة' }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            {t({ en: 'Document Information', ar: 'معلومات المستند' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}</Label>
              <Input
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="Enter title in English"
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                placeholder="أدخل العنوان بالعربية"
                dir="rtl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
            <Textarea
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              placeholder="Describe the resource"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
            <Textarea
              value={formData.description_ar}
              onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              placeholder="اكتب وصفاً للمورد"
              rows={4}
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Document Type', ar: 'نوع المستند' })}</Label>
              <Select value={formData.doc_type} onValueChange={(value) => setFormData({ ...formData, doc_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toolkit">Toolkit</SelectItem>
                  <SelectItem value="guideline">Guideline</SelectItem>
                  <SelectItem value="research_paper">Research Paper</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="best_practice">Best Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Content Type', ar: 'نوع المحتوى' })}</Label>
              <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio/Podcast</SelectItem>
                  <SelectItem value="infographic">Infographic</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ en: 'Category', ar: 'الفئة' })}</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Smart Mobility"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Thumbnail Image', ar: 'صورة مصغرة' })}</Label>
            <FileUploader
              type="image"
              label={t({ en: 'Upload Thumbnail', ar: 'رفع صورة مصغرة' })}
              description={t({ en: 'Recommended: 16:9 ratio, max 5MB', ar: 'مقترح: نسبة 16:9، حد أقصى 5MB' })}
              maxSize={5}
              onUploadComplete={(url) => setFormData({ ...formData, thumbnail_url: url })}
            />
          </div>

          {formData.content_type === 'document' && (
            <div className="space-y-2">
              <Label>{t({ en: 'Document File', ar: 'ملف المستند' })}</Label>
              <FileUploader
                type="document"
                label={t({ en: 'Upload Document', ar: 'رفع مستند' })}
                description="PDF, DOC, DOCX, PPT, PPTX"
                maxSize={50}
                preview={false}
                onUploadComplete={(url) => setFormData({ ...formData, file_url: url })}
              />
            </div>
          )}

          {formData.content_type === 'video' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Video File', ar: 'ملف الفيديو' })}</Label>
                <FileUploader
                  type="video"
                  label={t({ en: 'Upload Video', ar: 'رفع فيديو' })}
                  description="MP4, MOV, AVI"
                  maxSize={200}
                  preview={false}
                  onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Duration (mm:ss)', ar: 'المدة (دد:ثث)' })}</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="15:30"
                />
              </div>
            </div>
          )}

          {formData.content_type === 'audio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Audio File', ar: 'ملف صوتي' })}</Label>
                <FileUploader
                  type="audio"
                  label={t({ en: 'Upload Audio', ar: 'رفع صوت' })}
                  description="MP3, WAV, M4A"
                  maxSize={100}
                  preview={false}
                  onUploadComplete={(url) => setFormData({ ...formData, audio_url: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Duration', ar: 'المدة' })}</Label>
                <Input
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="45:00"
                />
              </div>
            </div>
          )}

          {formData.content_type === 'infographic' && (
            <div className="space-y-2">
              <Label>{t({ en: 'Infographic Image', ar: 'صورة إنفوجرافيك' })}</Label>
              <FileUploader
                type="image"
                label={t({ en: 'Upload Infographic', ar: 'رفع إنفوجرافيك' })}
                description="High resolution image"
                maxSize={10}
                onUploadComplete={(url) => setFormData({ ...formData, file_url: url })}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl('Knowledge'))}
            >
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.title_en || createMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Create Document', ar: 'إنشاء المستند' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(KnowledgeDocumentCreate, { requiredPermissions: ['knowledge_create'] });