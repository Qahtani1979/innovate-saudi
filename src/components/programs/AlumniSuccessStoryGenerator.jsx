import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Award, Loader2, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  ALUMNI_STORY_SYSTEM_PROMPT,
  buildAlumniStoryPrompt,
  ALUMNI_STORY_SCHEMA
} from '@/lib/ai/prompts/programs/alumniStory';

export default function AlumniSuccessStoryGenerator({ alumnus, program }) {
  const { t, language } = useLanguage();
  const [story, setStory] = useState(null);
  const [copied, setCopied] = useState(false);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const generateStory = async () => {
    const { success, data } = await invokeAI({
      prompt: buildAlumniStoryPrompt({ alumnus, program }),
      system_prompt: ALUMNI_STORY_SYSTEM_PROMPT,
      response_json_schema: ALUMNI_STORY_SCHEMA
    });

    if (success && data) {
      setStory(data);
      toast.success(t({ en: 'Success story generated!', ar: 'تم توليد قصة النجاح!' }));
    }
  };

  const copyToClipboard = () => {
    const text = language === 'ar' ? story.story_ar : story.story_en;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t({ en: 'Copied to clipboard', ar: 'تم النسخ' }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Success Story Generator', ar: 'مولد قصص النجاح الذكي' })}
          </CardTitle>
          {!story && (
            <Button onClick={generateStory} disabled={isLoading || !isAvailable} size="sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Generating...', ar: 'جاري التوليد...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Generate', ar: 'توليد' })}
                </>
              )}
            </Button>
          )}
        </div>
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} />
      </CardHeader>
      {story && (
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
            <h3 className="text-lg font-bold text-purple-900 mb-3">
              {language === 'ar' ? story.headline_ar : story.headline_en}
            </h3>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line">
              {language === 'ar' ? story.story_ar : story.story_en}
            </div>
            {story.quote_en && (
              <div className="mt-4 p-3 border-l-4 border-purple-600 bg-white/50 italic text-sm">
                "{language === 'ar' ? story.quote_ar : story.quote_en}"
              </div>
            )}
          </div>

          {story.key_metrics && story.key_metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {story.key_metrics.map((metric, i) => (
                <div key={i} className="p-3 bg-white border rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{metric.value}</p>
                  <p className="text-xs text-slate-600">{language === 'ar' ? metric.metric_ar : metric.metric_en}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="flex-1">
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Copy Story', ar: 'نسخ القصة' })}
            </Button>
            <Button onClick={() => setStory(null)} variant="outline">
              <X className="h-4 w-4 mr-2" />
              {t({ en: 'Clear', ar: 'مسح' })}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
