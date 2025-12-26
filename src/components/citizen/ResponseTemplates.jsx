import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { FileText, Send } from 'lucide-react';

const TEMPLATES = {
  approved: {
    en: "Thank you for your idea! We're pleased to inform you that your submission has been approved and will be considered for implementation.",
    ar: "شكراً لفكرتك! يسرنا إبلاغك بأن مقترحك تمت الموافقة عليه وسيتم النظر في تنفيذه."
  },
  rejected: {
    en: "Thank you for your submission. After careful review, we've decided not to proceed with this idea at this time. We encourage you to submit other ideas in the future.",
    ar: "شكراً لمقترحك. بعد المراجعة الدقيقة، قررنا عدم المضي قدماً في هذه الفكرة حالياً. نشجعك على تقديم أفكار أخرى مستقبلاً."
  },
  converted: {
    en: "Great news! Your idea has been converted into a formal challenge and is now in the innovation pipeline. Track its progress using the link below.",
    ar: "أخبار رائعة! تم تحويل فكرتك إلى تحدي رسمي وهي الآن في خط الابتكار. تابع تقدمها من خلال الرابط أدناه."
  },
  more_info: {
    en: "Thank you for your idea. We'd like to learn more before making a decision. Could you please provide additional details about [specific aspect]?",
    ar: "شكراً لفكرتك. نود معرفة المزيد قبل اتخاذ القرار. هل يمكنك تقديم تفاصيل إضافية حول [جانب محدد]؟"
  },
  duplicate: {
    en: "Thank you for your submission. We've identified a similar idea already in our system. We've merged your contribution with the existing submission.",
    ar: "شكراً لمقترحك. لقد حددنا فكرة مشابهة موجودة بالفعل في نظامنا. قمنا بدمج مساهمتك مع المقترح الموجود."
  }
};

export default function ResponseTemplates({ onSelect }) {
  const { language, t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizedText, setCustomizedText] = useState('');

  const selectTemplate = (key) => {
    setSelectedTemplate(key);
    setCustomizedText(TEMPLATES[key][language]);
  };

  const sendResponse = () => {
    if (onSelect) {
      onSelect(customizedText);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {Object.keys(TEMPLATES).map((key) => (
          <Button
            key={key}
            variant={selectedTemplate === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => selectTemplate(key)}
          >
            {key.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t({ en: 'Customize Response', ar: 'تخصيص الرد' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={customizedText}
              onChange={(e) => setCustomizedText(e.target.value)}
              rows={6}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
            <Button onClick={sendResponse} className="w-full bg-blue-600">
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Send to Citizen', ar: 'إرسال للمواطن' })}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
