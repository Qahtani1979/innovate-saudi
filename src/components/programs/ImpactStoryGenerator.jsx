import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildImpactStoryPrompt, 
  getImpactStorySchema,
  IMPACT_STORY_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/programs';

export default function ImpactStoryGenerator({ programId, graduates, programName }) {
  const { language, t } = useLanguage();
  const [stories, setStories] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateStories = async () => {
    const result = await invokeAI({
      prompt: buildImpactStoryPrompt(programName, graduates || []),
      response_json_schema: getImpactStorySchema(),
      system_prompt: getSystemPrompt(IMPACT_STORY_SYSTEM_PROMPT)
    });

    if (result.success && result.data?.stories) {
      setStories(result.data.stories);
      toast.success(t({ 
        en: `${result.data.stories.length} stories generated`, 
        ar: `تم إنشاء ${result.data.stories.length} قصة` 
      }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(t({ en: 'Copied', ar: 'تم النسخ' }));
  };

  const getLocalizedField = (story, field) => {
    if (language === 'ar' && story[`${field}_ar`]) {
      return story[`${field}_ar`];
    }
    return story[field];
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            {t({ en: 'AI Impact Story Generator', ar: 'مولد قصص التأثير الذكي' })}
          </CardTitle>
          <Button onClick={generateStories} disabled={isLoading || !isAvailable} size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate', ar: 'إنشاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!stories.length && !isLoading && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI creates compelling success stories for communications', ar: 'الذكاء الاصطناعي ينشئ قصص نجاح مقنعة للاتصالات' })}
            </p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="space-y-6">
            {stories.map((story, idx) => (
              <div key={idx} className="p-4 border-2 border-indigo-200 rounded-lg bg-gradient-to-br from-white to-indigo-50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-indigo-900">{story.startup}</h3>
                  <Badge className="bg-indigo-100 text-indigo-700">
                    {t({ en: 'Success Story', ar: 'قصة نجاح' })}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">{t({ en: 'Headline:', ar: 'العنوان:' })}</p>
                    <p className="font-bold text-lg text-slate-900">
                      {language === 'ar' ? story.headline_ar : story.headline_en}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">{t({ en: 'Story:', ar: 'القصة:' })}</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {language === 'ar' ? story.story_ar : story.story_en}
                    </p>
                  </div>

                  {story.metrics?.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {story.metrics.map((metric, i) => (
                        <div key={i} className="p-2 bg-white rounded border text-center">
                          <p className="text-xs text-slate-600">{metric}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {story.quote && (
                    <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                      <p className="text-sm italic text-slate-700">
                        "{getLocalizedField(story, 'quote')}"
                      </p>
                    </div>
                  )}

                  {story.social_caption && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">{t({ en: 'Social Media:', ar: 'وسائل التواصل:' })}</p>
                      <p className="text-sm text-slate-700">
                        {getLocalizedField(story, 'social_caption')}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(language === 'ar' ? story.story_ar : story.story_en)}>
                      <Copy className="h-3 w-3 mr-1" />
                      {t({ en: 'Copy', ar: 'نسخ' })}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      {t({ en: 'Export', ar: 'تصدير' })}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
