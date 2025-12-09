import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Sparkles, Loader2, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function AIMessageComposerWidget({ context }) {
  const { language, t } = useLanguage();
  const [intent, setIntent] = useState('');
  const [tone, setTone] = useState('professional');
  const [draft, setDraft] = useState('');
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();

  const composeDraft = async () => {
    if (!intent) return;
    
    const result = await invokeAI({
      prompt: `Compose a ${tone} ${language === 'ar' ? 'Arabic' : 'English'} message:

Intent: ${intent}
Context: ${context?.type || 'General'} ${context?.entity || ''}

Requirements:
- Professional ${tone} tone
- Clear and concise
- Action-oriented if applicable
- Culturally appropriate for Saudi context

Write the message:`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          subject: { type: "string" }
        }
      }
    });

    if (result.success) {
      setDraft(result.data.message);
      toast.success(t({ en: 'Draft generated', ar: 'المسودة مولدة' }));
    }
  };

  const translate = async () => {
    if (!draft) return;
    
    const result = await invokeAI({
      prompt: `Translate this message to ${language === 'ar' ? 'English' : 'Arabic'}:

${draft}

Maintain the same tone and intent.`,
      response_json_schema: {
        type: "object",
        properties: {
          translated: { type: "string" }
        }
      }
    });

    if (result.success) {
      setDraft(result.data.translated);
      toast.success(t({ en: 'Translated', ar: 'مترجم' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          {t({ en: 'AI Message Composer', ar: 'محرر الرسائل الذكي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t({ en: 'What do you want to communicate?', ar: 'ماذا تريد أن توصل؟' })}
          </label>
          <Input
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder={t({ en: 'e.g., Request budget approval for pilot', ar: 'مثال: طلب موافقة ميزانية للتجربة' })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">
            {t({ en: 'Tone', ar: 'النبرة' })}
          </label>
          <div className="flex gap-2">
            {['professional', 'friendly', 'urgent'].map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-4 py-2 rounded border text-sm ${tone === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={composeDraft} 
          disabled={!intent || generating}
          className="w-full bg-blue-600"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {t({ en: 'Generate Draft', ar: 'توليد المسودة' })}
        </Button>

        {draft && (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              className="font-sans"
            />
            <div className="flex gap-2">
              <Button onClick={translate} variant="outline" size="sm" disabled={generating}>
                <Languages className="h-4 w-4 mr-2" />
                {t({ en: 'Translate', ar: 'ترجم' })}
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(draft);
                  toast.success(t({ en: 'Copied', ar: 'منسوخ' }));
                }}
                variant="outline"
                size="sm"
              >
                {t({ en: 'Copy', ar: 'نسخ' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}