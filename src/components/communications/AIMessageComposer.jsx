import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Languages, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIMessageComposer({ context, onUseMessage }) {
  const { language, t } = useLanguage();
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState('professional');

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const composeDraft = async (intent) => {
    const { success, data } = await invokeAI({
      prompt: `Compose ${tone} ${language === 'ar' ? 'Arabic' : 'English'} message:

INTENT: ${intent}
CONTEXT: ${JSON.stringify(context || {}).substring(0, 300)}
TONE: ${tone}

Write a clear, concise, ${tone} message. Keep it under 200 words.`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          subject: { type: "string" }
        }
      }
    });

    if (success && data) {
      setDraft(data.message);
      toast.success(t({ en: 'Draft generated', ar: 'المسودة أُنشئت' }));
    }
  };

  const translateDraft = async () => {
    const targetLang = language === 'ar' ? 'English' : 'Arabic';
    const { success, data } = await invokeAI({
      prompt: `Translate this message to ${targetLang}:

${draft}

Maintain tone and professionalism.`
    });

    if (success && data) {
      setDraft(typeof data === 'string' ? data : data.message || draft);
      toast.success(t({ en: 'Translated', ar: 'مُترجم' }));
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI Message Composer', ar: 'محرر الرسائل الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={tone === 'professional' ? 'default' : 'outline'}
            onClick={() => setTone('professional')}
          >
            {t({ en: 'Professional', ar: 'رسمي' })}
          </Button>
          <Button
            size="sm"
            variant={tone === 'friendly' ? 'default' : 'outline'}
            onClick={() => setTone('friendly')}
          >
            {t({ en: 'Friendly', ar: 'ودي' })}
          </Button>
          <Button
            size="sm"
            variant={tone === 'urgent' ? 'default' : 'outline'}
            onClick={() => setTone('urgent')}
          >
            {t({ en: 'Urgent', ar: 'عاجل' })}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => composeDraft('Request status update')} disabled={isLoading || !isAvailable} size="sm" variant="outline">
            {t({ en: 'Status Update', ar: 'طلب تحديث' })}
          </Button>
          <Button onClick={() => composeDraft('Schedule meeting')} disabled={isLoading || !isAvailable} size="sm" variant="outline">
            {t({ en: 'Meeting', ar: 'اجتماع' })}
          </Button>
          <Button onClick={() => composeDraft('Request approval')} disabled={isLoading || !isAvailable} size="sm" variant="outline">
            {t({ en: 'Approval', ar: 'موافقة' })}
          </Button>
          <Button onClick={() => composeDraft('Thank you and next steps')} disabled={isLoading || !isAvailable} size="sm" variant="outline">
            {t({ en: 'Thank You', ar: 'شكر' })}
          </Button>
        </div>

        {draft && (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              className="bg-white"
            />
            <div className="flex gap-2">
              <Button onClick={translateDraft} disabled={isLoading || !isAvailable} size="sm" variant="outline">
                <Languages className="h-3 w-3 mr-1" />
                {t({ en: 'Translate', ar: 'ترجم' })}
              </Button>
              <Button onClick={() => { navigator.clipboard.writeText(draft); toast.success('Copied'); }} size="sm" variant="outline">
                <Copy className="h-3 w-3 mr-1" />
                {t({ en: 'Copy', ar: 'نسخ' })}
              </Button>
              {onUseMessage && (
                <Button onClick={() => onUseMessage(draft)} size="sm" className="bg-purple-600">
                  {t({ en: 'Use Message', ar: 'استخدام الرسالة' })}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
