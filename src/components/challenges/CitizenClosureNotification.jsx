import React from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from '../LanguageContext';
import { Mail, Loader2, CheckCircle2, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function CitizenClosureNotification({ challenge, onSent }) {
  const { language, isRTL, t } = useLanguage();
  const [message, setMessage] = React.useState('');

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!challenge.citizen_origin_idea_id) {
        toast.error(t({ en: 'No citizen to notify', ar: 'لا يوجد مواطن للإشعار' }));
        return;
      }

      // Get original idea creator
      const idea = await base44.entities.CitizenIdea.get(challenge.citizen_origin_idea_id);
      if (!idea || !idea.created_by) {
        throw new Error('Idea creator not found');
      }

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: idea.created_by,
        subject: language === 'ar' 
          ? `✅ تحديث: تم حل التحدي "${challenge.title_ar || challenge.title_en}"`
          : `✅ Update: Challenge "${challenge.title_en}" Resolved`,
        body: `
${language === 'ar' ? 'عزيزي المواطن،' : 'Dear Citizen,'}

${language === 'ar' 
  ? `شكراً لك على فكرتك! نود إعلامك بأن التحدي الذي تم إنشاؤه من فكرتك قد تم حله بنجاح.`
  : `Thank you for your idea! We're excited to inform you that the challenge created from your idea has been successfully resolved.`
}

${language === 'ar' ? 'التحدي:' : 'Challenge:'} ${language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}

${message || (language === 'ar' 
  ? 'تم معالجة التحدي بنجاح وتحقيق نتائج إيجابية للمجتمع.'
  : 'The challenge was successfully addressed with positive outcomes for the community.'
)}

${language === 'ar' 
  ? 'نقدر مشاركتك في تحسين خدماتنا البلدية!'
  : 'We appreciate your contribution to improving our municipal services!'
}

${language === 'ar' ? 'مع التحية،' : 'Best regards,'}
${language === 'ar' ? 'منصة الابتكار البلدي' : 'Saudi Innovates Platform'}
        `
      });

      return idea;
    },
    onSuccess: () => {
      toast.success(t({ en: 'Citizen notified successfully!', ar: 'تم إشعار المواطن بنجاح!' }));
      if (onSent) onSent();
    }
  });

  if (!challenge.citizen_origin_idea_id) {
    return (
      <Card className="border-2 border-slate-200">
        <CardContent className="py-6 text-center">
          <p className="text-sm text-slate-500">
            {t({ en: 'This challenge was not originated from a citizen idea', ar: 'لم ينشأ هذا التحدي من فكرة مواطن' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Heart className="h-5 w-5" />
            {t({ en: 'Notify Citizen of Resolution', ar: 'إشعار المواطن بالحل' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-slate-600 mb-1">
              {t({ en: 'This challenge was created from a citizen idea. Close the feedback loop!', ar: 'تم إنشاء هذا التحدي من فكرة مواطن. أغلق حلقة التغذية الراجعة!' })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Personal Message (Optional)', ar: 'رسالة شخصية (اختياري)' })}</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t({ 
                en: 'Add a personal thank you message or describe the outcome...', 
                ar: 'أضف رسالة شكر شخصية أو صف النتيجة...' 
              })}
              rows={4}
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-2">
              {t({ en: 'Email Preview:', ar: 'معاينة البريد:' })}
            </p>
            <div className="text-xs text-slate-700 space-y-1">
              <p>✉️ <strong>{t({ en: 'To:', ar: 'إلى:' })}</strong> {t({ en: 'Original idea creator', ar: 'مقدم الفكرة الأصلية' })}</p>
              <p>📋 <strong>{t({ en: 'Subject:', ar: 'الموضوع:' })}</strong> {t({ en: 'Challenge Resolved', ar: 'تم حل التحدي' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          {t({ en: 'Skip', ar: 'تخطي' })}
        </Button>
        <Button
          onClick={() => sendMutation.mutate()}
          disabled={sendMutation.isPending}
          className="bg-gradient-to-r from-green-600 to-teal-600"
        >
          {sendMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Sending...', ar: 'جاري الإرسال...' })}
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              {t({ en: 'Send Notification', ar: 'إرسال إشعار' })}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}