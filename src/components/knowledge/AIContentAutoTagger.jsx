import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Tags, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentAutoTagger({ document, onTagsGenerated }) {
  const { language, t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState(null);

  const generateTags = async () => {
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze document and suggest metadata tags:

TITLE: ${document.title_en || document.title}
CONTENT: ${(document.content_en || document.content || '').substring(0, 500)}
TYPE: ${document.type || 'general'}

Extract:
1. Primary sector (urban_design, transport, environment, etc.)
2. Keywords (5-10 relevant terms)
3. Categories (best_practice, case_study, guide, template, etc.)
4. Related entities (mention Challenge codes, Pilot codes, municipalities)
5. Topics/themes`,
        response_json_schema: {
          type: "object",
          properties: {
            sector: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            categories: { type: "array", items: { type: "string" } },
            related_entity_codes: { type: "array", items: { type: "string" } },
            themes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setSuggestedTags(response);
      if (onTagsGenerated) {
        onTagsGenerated(response);
      }
      toast.success(t({ en: 'Tags generated', ar: 'الوسوم أُنشئت' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل الإنشاء' }));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-green-600" />
            {t({ en: 'AI Auto-Tagger', ar: 'الوسم التلقائي الذكي' })}
          </CardTitle>
          <Button onClick={generateTags} disabled={generating} size="sm" className="bg-green-600">
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Generate', ar: 'إنشاء' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!suggestedTags && !generating && (
          <div className="text-center py-8">
            <Tags className="h-12 w-12 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI extracts sectors, keywords, and related entities automatically', ar: 'الذكاء يستخرج القطاعات، الكلمات المفتاحية، والكيانات ذات الصلة تلقائياً' })}
            </p>
          </div>
        )}

        {suggestedTags && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-300">
              <p className="text-xs font-semibold text-blue-900 mb-2">
                {t({ en: 'Primary Sector:', ar: 'القطاع الأساسي:' })}
              </p>
              <Badge className="bg-blue-600 text-white capitalize">
                {suggestedTags.sector?.replace(/_/g, ' ')}
              </Badge>
            </div>

            {suggestedTags.keywords?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-2">
                  {t({ en: 'Keywords:', ar: 'الكلمات المفتاحية:' })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            )}

            {suggestedTags.categories?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-2">
                  {t({ en: 'Categories:', ar: 'الفئات:' })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.categories.map((cat, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">{cat}</Badge>
                  ))}
                </div>
              </div>
            )}

            {suggestedTags.related_entity_codes?.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <p className="text-xs font-semibold text-green-900 mb-2">
                  {t({ en: 'Auto-Linked Entities:', ar: 'الكيانات المربوطة تلقائياً:' })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.related_entity_codes.map((code, idx) => (
                    <Badge key={idx} variant="outline" className="font-mono text-xs">{code}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}