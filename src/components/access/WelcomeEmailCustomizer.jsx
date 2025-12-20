import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Mail, Eye, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function WelcomeEmailCustomizer({ onSave }) {
  const { language, isRTL, t } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState({
    subject_en: 'Welcome to Saudi Innovates',
    subject_ar: 'مرحباً في الابتكار السعودي',
    body_en: 'Hello {{name}},\n\nWelcome to Saudi Innovates! Your account has been created.\n\nLogin: {{email}}\n\nBest regards,\nSaudi Innovates Team',
    body_ar: 'مرحباً {{name}}،\n\nمرحباً بك في الابتكار السعودي! تم إنشاء حسابك.\n\nالبريد: {{email}}\n\nمع التحية،\nفريق الابتكار السعودي',
    footer_en: '© 2025 Saudi Innovates. All rights reserved.',
    footer_ar: '© 2025 الابتكار السعودي. جميع الحقوق محفوظة.'
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {t({ en: 'Welcome Email Template', ar: 'قالب بريد الترحيب' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Subject (English)', ar: 'الموضوع (إنجليزي)' })}
              </label>
              <Input
                value={template.subject_en}
                onChange={(e) => setTemplate({...template, subject_en: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Subject (Arabic)', ar: 'الموضوع (عربي)' })}
              </label>
              <Input
                value={template.subject_ar}
                onChange={(e) => setTemplate({...template, subject_ar: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Body (English)', ar: 'المحتوى (إنجليزي)' })}
              </label>
              <Textarea
                value={template.body_en}
                onChange={(e) => setTemplate({...template, body_en: e.target.value})}
                rows={8}
              />
              <p className="text-xs text-slate-500 mt-1">
                {t({ en: 'Variables: {{name}}, {{email}}, {{role}}', ar: 'المتغيرات: {{name}}, {{email}}, {{role}}' })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Body (Arabic)', ar: 'المحتوى (عربي)' })}
              </label>
              <Textarea
                value={template.body_ar}
                onChange={(e) => setTemplate({...template, body_ar: e.target.value})}
                rows={8}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setShowPreview(true)} variant="outline" className="flex-1">
              <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Preview', ar: 'معاينة' })}
            </Button>
            <Button onClick={() => onSave?.(template)} className="flex-1 bg-blue-600">
              <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'Save Template', ar: 'حفظ القالب' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t({ en: 'Email Preview', ar: 'معاينة البريد' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border">
              <p className="text-sm font-medium text-slate-600 mb-2">Subject:</p>
              <p className="font-medium">{template[`subject_${language}`]}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <pre className="text-sm whitespace-pre-wrap">{template[`body_${language}`]}</pre>
            </div>
            <div className="text-xs text-slate-500 text-center">
              {template[`footer_${language}`]}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}