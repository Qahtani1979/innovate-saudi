import { Button } from "@/components/ui/button";
import { Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

/**
 * Auto-translate user-generated content
 */
export default function AutoTranslator({ text, onTranslated }) {
  const { invokeAI, isLoading, isAvailable } = useAIWithFallback({ showToasts: false });

  const translate = async (targetLang) => {
    const result = await invokeAI({
      prompt: `Translate the following text to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Maintain tone and meaning:\n\n${text}`,
      response_json_schema: {
        type: 'object',
        properties: {
          translated_text: { type: 'string' }
        }
      }
    });

    if (result.success) {
      onTranslated(result.data.translated_text, targetLang);
      toast.success(`Translated to ${targetLang === 'ar' ? 'Arabic' : 'English'}`);
    } else {
      toast.error('Translation failed');
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => translate('ar')}
        disabled={isLoading || !isAvailable}
      >
        {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Globe className="h-3 w-3 mr-1" />}
        Translate to Arabic
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => translate('en')}
        disabled={isLoading || !isAvailable}
      >
        {isLoading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Globe className="h-3 w-3 mr-1" />}
        Translate to English
      </Button>
    </div>
  );
}
