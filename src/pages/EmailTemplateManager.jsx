import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Mail, Plus, Pencil, Trash2, Eye, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const DEFAULT_TEMPLATES = [
  {
    name: 'Idea Approved',
    key: 'idea_approved',
    subject_en: 'Your Idea Has Been Approved!',
    subject_ar: 'تم قبول فكرتك!',
    body_en: 'Dear {{citizen_name}},\n\nCongratulations! Your idea "{{idea_title}}" has been approved by our team.\n\nNext Steps:\n- Your idea will be reviewed for conversion to a challenge\n- You will be notified of any progress\n\nThank you for your contribution to innovation!\n\nBest regards,\nSaudi Innovates Team',
    body_ar: 'عزيزي {{citizen_name}}،\n\nتهانينا! تم قبول فكرتك "{{idea_title}}" من قبل فريقنا.\n\nالخطوات التالية:\n- سيتم مراجعة فكرتك لتحويلها إلى تحدي\n- سيتم إشعارك بأي تقدم\n\nشكراً لمساهمتك في الابتكار!\n\nمع أطيب التحيات،\nفريق الابتكار السعودي',
    variables: ['citizen_name', 'idea_title']
  },
  {
    name: 'Idea Under Review',
    key: 'idea_under_review',
    subject_en: 'Your Idea is Being Reviewed',
    subject_ar: 'فكرتك قيد المراجعة',
    body_en: 'Dear {{citizen_name}},\n\nYour idea "{{idea_title}}" is now under review by our expert team.\n\nWe will notify you of the outcome within {{review_days}} days.\n\nThank you for your patience!\n\nBest regards,\nSaudi Innovates Team',
    body_ar: 'عزيزي {{citizen_name}}،\n\nفكرتك "{{idea_title}}" قيد المراجعة من قبل فريق الخبراء.\n\nسنقوم بإشعارك بالنتيجة خلال {{review_days}} أيام.\n\nشكراً لصبرك!\n\nمع أطيب التحيات،\nفريق الابتكار السعودي',
    variables: ['citizen_name', 'idea_title', 'review_days']
  },
  {
    name: 'Idea Converted to Challenge',
    key: 'idea_converted',
    subject_en: 'Your Idea Became an Official Challenge!',
    subject_ar: 'أصبحت فكرتك تحدياً رسمياً!',
    body_en: 'Dear {{citizen_name}},\n\nGreat news! Your idea "{{idea_title}}" has been converted into an official innovation challenge: {{challenge_code}}\n\nYou can track the challenge progress here: {{challenge_url}}\n\nThank you for contributing to Saudi innovation!\n\nBest regards,\nSaudi Innovates Team',
    body_ar: 'عزيزي {{citizen_name}}،\n\nأخبار رائعة! تم تحويل فكرتك "{{idea_title}}" إلى تحدي ابتكار رسمي: {{challenge_code}}\n\nيمكنك متابعة تقدم التحدي هنا: {{challenge_url}}\n\nشكراً لمساهمتك في الابتكار السعودي!\n\nمع أطيب التحيات،\nفريق الابتكار السعودي',
    variables: ['citizen_name', 'idea_title', 'challenge_code', 'challenge_url']
  },
  {
    name: 'Challenge Resolved',
    key: 'challenge_resolved',
    subject_en: 'Challenge from Your Idea Has Been Resolved!',
    subject_ar: 'تم حل التحدي من فكرتك!',
    body_en: 'Dear {{citizen_name}},\n\nWe are excited to inform you that the challenge "{{challenge_title}}" based on your idea has been successfully resolved!\n\nImpact:\n{{impact_summary}}\n\nThank you for making Saudi cities better!\n\nBest regards,\nSaudi Innovates Team',
    body_ar: 'عزيزي {{citizen_name}}،\n\nيسعدنا إبلاغك بأن التحدي "{{challenge_title}}" المبني على فكرتك تم حله بنجاح!\n\nالأثر:\n{{impact_summary}}\n\nشكراً لجعل المدن السعودية أفضل!\n\nمع أطيب التحيات،\nفريق الابتكار السعودي',
    variables: ['citizen_name', 'challenge_title', 'impact_summary']
  }
];

export default function EmailTemplateManager() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [enhancing, setEnhancing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    subject_en: '',
    subject_ar: '',
    body_en: '',
    body_ar: '',
    variables: []
  });

  const templates = DEFAULT_TEMPLATES;

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({ ...template });
    setDialogOpen(true);
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const enhanceWithAI = async () => {
    setEnhancing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Enhance this email template for citizen communication:

Subject (EN): ${formData.subject_en}
Body (EN): ${formData.body_en}

Generate:
1. Professional subject line (EN & AR)
2. Warm, engaging email body (EN & AR)
3. Clear call-to-action
4. Maintain all variables: ${formData.variables.join(', ')}`,
        response_json_schema: {
          type: 'object',
          properties: {
            subject_en: { type: 'string' },
            subject_ar: { type: 'string' },
            body_en: { type: 'string' },
            body_ar: { type: 'string' }
          }
        }
      });

      setFormData({ ...formData, ...result });
      toast.success(t({ en: 'Template enhanced', ar: 'تم التحسين' }));
    } catch (error) {
      toast.error(t({ en: 'Enhancement failed', ar: 'فشل التحسين' }));
    } finally {
      setEnhancing(false);
    }
  };

  const sampleData = {
    citizen_name: 'Ahmed Mohammed',
    idea_title: 'Smart Street Lighting System',
    review_days: '7',
    challenge_code: 'CH-RUH-2025-042',
    challenge_url: 'https://platform.example.com/challenge/details',
    challenge_title: 'Smart Street Lighting System',
    impact_summary: '30% energy savings, improved safety in 5 neighborhoods'
  };

  const renderTemplate = (template, lang) => {
    let text = lang === 'en' ? template.body_en : template.body_ar;
    Object.entries(sampleData).forEach(([key, value]) => {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return text;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
          {t({ en: 'Email Template Manager', ar: 'إدارة قوالب البريد' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Manage citizen communication templates', ar: 'إدارة قوالب التواصل مع المواطنين' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Email Templates', ar: 'قوالب البريد' })}</CardTitle>
            <Button onClick={() => { setEditingTemplate(null); setFormData({ name: '', key: '', subject_en: '', subject_ar: '', body_en: '', body_ar: '', variables: [] }); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'New Template', ar: 'قالب جديد' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.map((template, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">{template.key}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{template.subject_en}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map(v => (
                        <Badge key={v} className="text-xs bg-purple-100 text-purple-700">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(template)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t({ en: 'Edit Template', ar: 'تعديل القالب' }) : t({ en: 'New Template', ar: 'قالب جديد' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button onClick={enhanceWithAI} disabled={enhancing} variant="outline" className="w-full">
              {enhancing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'AI Enhance Template', ar: 'تحسين القالب بالذكاء' })}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Template Name', ar: 'اسم القالب' })}</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t({ en: 'Template Key', ar: 'مفتاح القالب' })}</label>
                <Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="idea_approved" />
              </div>
            </div>

            <Tabs defaultValue="en">
              <TabsList className="grid grid-cols-2 w-64">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject (EN)</label>
                  <Input value={formData.subject_en} onChange={(e) => setFormData({ ...formData, subject_en: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Body (EN)</label>
                  <Textarea value={formData.body_en} onChange={(e) => setFormData({ ...formData, body_en: e.target.value })} rows={12} />
                </div>
              </TabsContent>

              <TabsContent value="ar" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject (AR)</label>
                  <Input value={formData.subject_ar} onChange={(e) => setFormData({ ...formData, subject_ar: e.target.value })} dir="rtl" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Body (AR)</label>
                  <Textarea value={formData.body_ar} onChange={(e) => setFormData({ ...formData, body_ar: e.target.value })} rows={12} dir="rtl" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t({ en: 'Cancel', ar: 'إلغاء' })}</Button>
            <Button onClick={() => { toast.success(t({ en: 'Template saved', ar: 'تم الحفظ' })); setDialogOpen(false); }}>
              {t({ en: 'Save', ar: 'حفظ' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t({ en: 'Template Preview', ar: 'معاينة القالب' })}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <Tabs defaultValue="en">
                <TabsList className="grid grid-cols-2 w-64">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>

                <TabsContent value="en">
                  <div className="p-4 border rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 mb-2">Subject:</p>
                    <p className="font-semibold text-slate-900 mb-4">{previewTemplate.subject_en}</p>
                    <p className="text-xs text-slate-500 mb-2">Body:</p>
                    <div className="whitespace-pre-wrap text-sm text-slate-700">
                      {renderTemplate(previewTemplate, 'en')}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ar">
                  <div className="p-4 border rounded-lg bg-slate-50" dir="rtl">
                    <p className="text-xs text-slate-500 mb-2">الموضوع:</p>
                    <p className="font-semibold text-slate-900 mb-4">{previewTemplate.subject_ar}</p>
                    <p className="text-xs text-slate-500 mb-2">المحتوى:</p>
                    <div className="whitespace-pre-wrap text-sm text-slate-700">
                      {renderTemplate(previewTemplate, 'ar')}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}