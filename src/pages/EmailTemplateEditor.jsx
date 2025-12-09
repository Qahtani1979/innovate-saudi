import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Mail, Eye, Save, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function EmailTemplateEditor() {
  const { language, isRTL, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [showPreview, setShowPreview] = useState(false);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [template, setTemplate] = useState({
    subject_en: 'Welcome to Saudi Innovates',
    subject_ar: 'مرحباً في الابتكار السعودي',
    body_en: 'Dear {{name}},\n\nWelcome aboard!',
    body_ar: 'عزيزي {{name}}،\n\nمرحباً بك!'
  });

  const templates = [
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'invitation', label: 'User Invitation' },
    { value: 'challenge_approved', label: 'Challenge Approved' },
    { value: 'pilot_milestone', label: 'Pilot Milestone' },
    { value: 'program_acceptance', label: 'Program Acceptance' }
  ];

  const handleAIGenerate = async () => {
    const result = await invokeAI({
      prompt: `Generate a professional bilingual email template for: ${selectedTemplate}
        
For a Saudi municipal innovation platform. Include:
- Professional yet warm tone
- Clear call-to-action
- Both English and Arabic versions
- Use variables like {{name}}, {{email}}, {{challenge_title}}, etc.`,
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
    if (result.success) {
      setTemplate(result.data);
      toast.success(t({ en: 'AI template generated', ar: 'تم توليد القالب الذكي' }));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📧 Email Template Editor', ar: '📧 محرر قوالب البريد' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Create and customize bilingual email templates for all platform communications', ar: 'إنشاء وتخصيص قوالب بريد ثنائية اللغة لجميع اتصالات المنصة' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate} className="flex-1">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {templates.map(t => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAIGenerate} disabled={aiLoading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
          {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'AI Generate', ar: 'توليد ذكي' })}
        </Button>
      </div>

      <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'English Version', ar: 'النسخة الإنجليزية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Subject', ar: 'الموضوع' })}</label>
              <Input value={template.subject_en} onChange={(e) => setTemplate({...template, subject_en: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Body', ar: 'المحتوى' })}</label>
              <Textarea value={template.body_en} onChange={(e) => setTemplate({...template, body_en: e.target.value})} rows={12} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Arabic Version', ar: 'النسخة العربية' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Subject', ar: 'الموضوع' })}</label>
              <Input value={template.subject_ar} onChange={(e) => setTemplate({...template, subject_ar: e.target.value})} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t({ en: 'Body', ar: 'المحتوى' })}</label>
              <Textarea value={template.body_ar} onChange={(e) => setTemplate({...template, body_ar: e.target.value})} rows={12} dir="rtl" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-900">
              {t({ en: 'Available variables: {{name}}, {{email}}, {{challenge_title}}, {{pilot_code}}, {{date}}, {{link}}', ar: 'المتغيرات المتاحة: {{name}}, {{email}}, {{challenge_title}}, {{pilot_code}}, {{date}}, {{link}}' })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={() => setShowPreview(true)} variant="outline" className="flex-1">
          <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Preview', ar: 'معاينة' })}
        </Button>
        <Button className="flex-1 bg-blue-600 text-lg py-6">
          <Save className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Template', ar: 'حفظ القالب' })}
        </Button>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t({ en: 'Email Preview', ar: 'معاينة البريد' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Subject:</p>
              <p className="font-medium">{template[`subject_${language}`]}</p>
            </div>
            <div className="p-6 bg-white border rounded-lg">
              <pre className="whitespace-pre-wrap text-sm">{template[`body_${language}`]}</pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProtectedPage(EmailTemplateEditor, { requireAdmin: true });