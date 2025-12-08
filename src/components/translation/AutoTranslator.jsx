import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Auto-translate user-generated content
 */
export default function AutoTranslator({ text, onTranslated }) {
  const [translating, setTranslating] = useState(false);

  const translate = async (targetLang) => {
    setTranslating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Maintain tone and meaning:\n\n${text}`,
        response_json_schema: {
          type: 'object',
          properties: {
            translated_text: { type: 'string' }
          }
        }
      });

      onTranslated(response.translated_text, targetLang);
      toast.success(`Translated to ${targetLang === 'ar' ? 'Arabic' : 'English'}`);
    } catch (error) {
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => translate('ar')}
        disabled={translating}
      >
        <Globe className="h-3 w-3 mr-1" />
        Translate to Arabic
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => translate('en')}
        disabled={translating}
      >
        <Globe className="h-3 w-3 mr-1" />
        Translate to English
      </Button>
    </div>
  );
}