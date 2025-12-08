import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Award, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AlumniSuccessStoryGenerator({ alumnus, program }) {
  const { t, language } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [story, setStory] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateStory = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling alumni success story for a Saudi municipal innovation program graduate.

Program: ${program.name_en}
Graduate: ${alumnus.applicant_name}
Organization: ${alumnus.applicant_org_name || 'N/A'}
Sector: ${alumnus.focus_sector || 'Innovation'}
Achievements:
- Solutions created: ${alumnus.solutions_count || 0}
- Pilots launched: ${alumnus.pilots_count || 0}
- Program completion: ${alumnus.graduation_date || 'Recent'}

Generate a professional success story in BOTH English and Arabic with:
1. Compelling headline (bilingual)
2. Challenge they faced before program
3. Journey through the program (key moments)
4. Impact achieved after graduation
5. Quote from the graduate (fictional but realistic)
6. Future aspirations

Make it inspiring and suitable for social media, website, and reports.`,
        response_json_schema: {
          type: 'object',
          properties: {
            headline_en: { type: 'string' },
            headline_ar: { type: 'string' },
            story_en: { type: 'string' },
            story_ar: { type: 'string' },
            quote_en: { type: 'string' },
            quote_ar: { type: 'string' },
            key_metrics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  metric_en: { type: 'string' },
                  metric_ar: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setStory(result);
      toast.success(t({ en: 'Success story generated!', ar: 'تم توليد قصة النجاح!' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    } finally {
      setGenerating(false);
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
            <Button onClick={generateStory} disabled={generating} size="sm">
              {generating ? (
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