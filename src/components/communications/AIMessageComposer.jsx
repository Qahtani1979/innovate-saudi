import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, Languages, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AIMessageComposer({ context, onUseMessage }) {
  const { language, t } = useLanguage();
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState('professional');

  const composeDraft = async (intent) => {
    setComposing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
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

      setDraft(response.message);
      toast.success(t({ en: 'Draft generated', ar: 'المسودة أُنشئت' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setComposing(false);
    }
  };

  const translateDraft = async () => {
    setComposing(true);
    try {
      const targetLang = language === 'ar' ? 'English' : 'Arabic';
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this message to ${targetLang}:

${draft}

Maintain tone and professionalism.`
      });

      setDraft(response);
      toast.success(t({ en: 'Translated', ar: 'مُترجم' }));
    } catch (error) {
      toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
    } finally {
      setComposing(false);
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
          <Button onClick={() => composeDraft('Request status update')} disabled={composing} size="sm" variant="outline">
            {t({ en: 'Status Update', ar: 'طلب تحديث' })}
          </Button>
          <Button onClick={() => composeDraft('Schedule meeting')} disabled={composing} size="sm" variant="outline">
            {t({ en: 'Meeting', ar: 'اجتماع' })}
          </Button>
          <Button onClick={() => composeDraft('Request approval')} disabled={composing} size="sm" variant="outline">
            {t({ en: 'Approval', ar: 'موافقة' })}
          </Button>
          <Button onClick={() => composeDraft('Thank you and next steps')} disabled={composing} size="sm" variant="outline">
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
              <Button onClick={translateDraft} disabled={composing} size="sm" variant="outline">
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