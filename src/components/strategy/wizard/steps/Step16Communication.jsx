import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Megaphone, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';

// Combined Step 16 (Communication) and Step 17 (Change Management)
export function Step16Communication({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t({ en: 'Generate Communication Plan', ar: 'إنشاء خطة التواصل' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="w-5 h-5 text-primary" />
            {t({ en: 'Key Messages', ar: 'الرسائل الرئيسية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.communication_plan?.key_messages?.join('\n') || ''}
            onChange={(e) => onChange({ communication_plan: { ...data.communication_plan, key_messages: e.target.value.split('\n').filter(Boolean) } })}
            placeholder={t({ en: 'Enter key messages (one per line)...', ar: 'أدخل الرسائل الرئيسية (واحدة في كل سطر)...' })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Internal Channels', ar: 'القنوات الداخلية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.communication_plan?.internal_channels?.join('\n') || ''}
            onChange={(e) => onChange({ communication_plan: { ...data.communication_plan, internal_channels: e.target.value.split('\n').filter(Boolean) } })}
            placeholder={t({ en: 'e.g., Email, Intranet, Team meetings...', ar: 'مثال: البريد الإلكتروني، الشبكة الداخلية...' })}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'External Channels', ar: 'القنوات الخارجية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.communication_plan?.external_channels?.join('\n') || ''}
            onChange={(e) => onChange({ communication_plan: { ...data.communication_plan, external_channels: e.target.value.split('\n').filter(Boolean) } })}
            placeholder={t({ en: 'e.g., Press releases, Social media, Public events...', ar: 'مثال: البيانات الصحفية، وسائل التواصل...' })}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function Step17Change({ data, onChange, onGenerateAI, isGenerating }) {
  const { language, t, isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t({ en: 'Generate Change Plan', ar: 'إنشاء خطة التغيير' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5 text-primary" />
            {t({ en: 'Readiness Assessment', ar: 'تقييم الجاهزية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.change_management?.readiness_assessment || ''}
            onChange={(e) => onChange({ change_management: { ...data.change_management, readiness_assessment: e.target.value } })}
            placeholder={t({ en: 'Assess organizational readiness for change...', ar: 'تقييم جاهزية المنظمة للتغيير...' })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Change Approach', ar: 'نهج التغيير' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.change_management?.change_approach || ''}
            onChange={(e) => onChange({ change_management: { ...data.change_management, change_approach: e.target.value } })}
            placeholder={t({ en: 'Describe the change management approach...', ar: 'وصف نهج إدارة التغيير...' })}
            rows={4}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Resistance Management', ar: 'إدارة المقاومة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.change_management?.resistance_management || ''}
            onChange={(e) => onChange({ change_management: { ...data.change_management, resistance_management: e.target.value } })}
            placeholder={t({ en: 'How will you address resistance to change?', ar: 'كيف ستتعامل مع مقاومة التغيير؟' })}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default Step16Communication;
