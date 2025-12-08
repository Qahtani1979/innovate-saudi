import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { FileText, Sparkles, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function StrategicNarrativeGenerator({ planId }) {
  const { language, t } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [narrative, setNarrative] = useState(null);

  const generateNarrative = async () => {
    setGenerating(true);
    try {
      const plan = await base44.entities.StrategicPlan.filter({ id: planId });
      const pilots = await base44.entities.Pilot.list();
      const challenges = await base44.entities.Challenge.list();

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a compelling strategic narrative for this municipal innovation plan:

Plan: ${plan[0]?.name_en}
Vision: ${plan[0]?.vision_en}
Themes: ${plan[0]?.strategic_themes?.map(t => t.name_en).join(', ')}
Active Pilots: ${pilots.filter(p => p.status === 'active').length}
Resolved Challenges: ${challenges.filter(c => c.status === 'resolved').length}

Create a 2-page narrative with:
1. Vision (inspiring opening)
2. Current State & Context
3. The Journey (what we've done, what we're doing)
4. Impact & Achievements (data-driven)
5. The Road Ahead (future focus)

Make it compelling, data-driven, and bilingual (English then Arabic).`,
        response_json_schema: {
          type: "object",
          properties: {
            title_en: { type: "string" },
            title_ar: { type: "string" },
            vision_section: { type: "string" },
            context_section: { type: "string" },
            journey_section: { type: "string" },
            impact_section: { type: "string" },
            future_section: { type: "string" }
          }
        }
      });

      setNarrative(response);
      toast.success(t({ en: 'Narrative generated', ar: 'السرد مُولد' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    } finally {
      setGenerating(false);
    }
  };

  const downloadNarrative = () => {
    if (!narrative) return;
    
    const content = `# ${narrative.title_en}\n\n${narrative.vision_section}\n\n${narrative.context_section}\n\n${narrative.journey_section}\n\n${narrative.impact_section}\n\n${narrative.future_section}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'strategic-narrative.md';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success(t({ en: 'Downloaded', ar: 'تم التنزيل' }));
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Strategic Narrative', ar: 'السرد الاستراتيجي' })}
          </CardTitle>
          {!narrative && (
            <Button onClick={generateNarrative} disabled={generating} size="sm" className="bg-indigo-600">
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate', ar: 'توليد' })}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!narrative && !generating && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI writes a compelling strategic story from your data', ar: 'الذكاء يكتب قصة استراتيجية مقنعة من بياناتك' })}
            </p>
          </div>
        )}

        {narrative && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              <div>
                <h3 className="font-bold text-indigo-900 text-lg">{narrative.title_en}</h3>
                <p className="text-sm text-indigo-700 mt-1">{narrative.title_ar}</p>
              </div>
              <Button onClick={downloadNarrative} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Download', ar: 'تنزيل' })}
              </Button>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="space-y-4">
                <div className="p-4 bg-white rounded border">
                  <h4 className="font-bold text-slate-900 mb-2">
                    {t({ en: '🎯 Vision', ar: '🎯 الرؤية' })}
                  </h4>
                  <ReactMarkdown>{narrative.vision_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-white rounded border">
                  <h4 className="font-bold text-slate-900 mb-2">
                    {t({ en: '📍 Current State', ar: '📍 الحالة الحالية' })}
                  </h4>
                  <ReactMarkdown>{narrative.context_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-white rounded border">
                  <h4 className="font-bold text-slate-900 mb-2">
                    {t({ en: '🚀 The Journey', ar: '🚀 الرحلة' })}
                  </h4>
                  <ReactMarkdown>{narrative.journey_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-white rounded border">
                  <h4 className="font-bold text-slate-900 mb-2">
                    {t({ en: '⭐ Impact & Achievements', ar: '⭐ التأثير والإنجازات' })}
                  </h4>
                  <ReactMarkdown>{narrative.impact_section}</ReactMarkdown>
                </div>

                <div className="p-4 bg-white rounded border">
                  <h4 className="font-bold text-slate-900 mb-2">
                    {t({ en: '🔮 The Road Ahead', ar: '🔮 الطريق القادم' })}
                  </h4>
                  <ReactMarkdown>{narrative.future_section}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}