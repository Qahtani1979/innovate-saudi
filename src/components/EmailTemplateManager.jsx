import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Mail, Plus, Edit2, Copy } from 'lucide-react';
import { toast } from 'sonner';

function EmailTemplateManager() {
  const { language, isRTL, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: '1',
      name: 'Pilot Approval',
      subject_en: 'Your Pilot Has Been Approved',
      subject_ar: 'تمت الموافقة على تجربتك',
      body_en: 'Dear {{user_name}},\n\nCongratulations! Your pilot "{{pilot_title}}" has been approved...',
      body_ar: 'عزيزي {{user_name}}،\n\nتهانينا! تمت الموافقة على تجربتك "{{pilot_title}}"...',
      variables: ['user_name', 'pilot_title', 'approval_date'],
      category: 'approvals'
    },
    {
      id: '2',
      name: 'Challenge Submitted',
      subject_en: 'Challenge Submission Received',
      subject_ar: 'تم استلام التحدي المقدم',
      body_en: 'Dear {{user_name}},\n\nThank you for submitting challenge "{{challenge_title}}"...',
      body_ar: 'عزيزي {{user_name}}،\n\nشكرًا لك على تقديم التحدي "{{challenge_title}}"...',
      variables: ['user_name', 'challenge_title', 'challenge_code'],
      category: 'submissions'
    }
  ];

  const categories = [
    { value: 'approvals', label: { en: 'Approvals', ar: 'الموافقات' }, color: 'bg-green-100 text-green-700' },
    { value: 'submissions', label: { en: 'Submissions', ar: 'التقديمات' }, color: 'bg-blue-100 text-blue-700' },
    { value: 'alerts', label: { en: 'Alerts', ar: 'التنبيهات' }, color: 'bg-red-100 text-red-700' }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            {t({ en: 'Email Templates', ar: 'قوالب البريد الإلكتروني' })}
          </CardTitle>
          <Button size="sm">
            <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'New Template', ar: 'قالب جديد' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            {templates.map(template => {
              const category = categories.find(c => c.value === template.category);
              return (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 mb-2">{template.name}</p>
                      <p className="text-sm text-slate-600 mb-2">
                        {language === 'ar' ? template.subject_ar : template.subject_en}
                      </p>
                      <Badge className={category?.color}>
                        {category?.label[language]}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            {selectedTemplate ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t({ en: 'Preview', ar: 'معاينة' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Subject', ar: 'الموضوع' })}</p>
                    <Input value={selectedTemplate.subject_en} readOnly />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t({ en: 'Body', ar: 'المحتوى' })}</p>
                    <Textarea value={selectedTemplate.body_en} rows={8} readOnly />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-2">{t({ en: 'Variables', ar: 'المتغيرات' })}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`{{${variable}}}`);
                            toast.success(t({ en: 'Copied', ar: 'تم النسخ' }));
                          }}
                        >
                          <Copy className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {`{{${variable}}}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-96 flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-slate-500">
                  {t({ en: 'Select a template', ar: 'اختر قالبًا' })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmailTemplateManager;