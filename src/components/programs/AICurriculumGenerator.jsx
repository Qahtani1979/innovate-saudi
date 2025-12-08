import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AICurriculumGenerator({ programType, duration_weeks, objectives, onCurriculumGenerated }) {
  const { t, language } = useLanguage();
  const [generating, setGenerating] = useState(false);
  const [curriculum, setCurriculum] = useState(null);

  const generateCurriculum = async () => {
    setGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Design a comprehensive ${duration_weeks}-week curriculum for a ${programType} program.

Objectives: ${objectives || 'General innovation and entrepreneurship'}

Generate week-by-week curriculum with:
- Week number (1-${duration_weeks})
- Topic (bilingual: en + ar)
- Learning objectives (3-5 per week)
- Activities (workshops, mentoring, assignments)
- Deliverables
- Resources needed

Make it practical for Saudi municipal innovation context.`,
        response_json_schema: {
          type: 'object',
          properties: {
            curriculum: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  week: { type: 'number' },
                  topic_en: { type: 'string' },
                  topic_ar: { type: 'string' },
                  objectives: { type: 'array', items: { type: 'string' } },
                  activities: { type: 'array', items: { type: 'string' } },
                  deliverables: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setCurriculum(result.curriculum);
      toast.success(t({ en: 'Curriculum generated!', ar: 'تم توليد المنهج!' }));
    } catch (error) {
      toast.error(t({ en: 'Generation failed', ar: 'فشل التوليد' }));
    } finally {
      setGenerating(false);
    }
  };

  const handleAccept = () => {
    if (onCurriculumGenerated && curriculum) {
      onCurriculumGenerated(curriculum);
      toast.success(t({ en: 'Curriculum added', ar: 'تمت إضافة المنهج' }));
    }
  };

  return (
    <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-teal-900">
            <BookOpen className="h-5 w-5" />
            {t({ en: 'AI Curriculum Generator', ar: 'مولد المنهج الذكي' })}
          </CardTitle>
          {!curriculum && (
            <Button onClick={generateCurriculum} disabled={generating} size="sm">
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
      {curriculum && (
        <CardContent className="space-y-3">
          <div className="max-h-96 overflow-y-auto space-y-2">
            {curriculum.map((week, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Badge className="mb-1">{t({ en: `Week ${week.week}`, ar: `أسبوع ${week.week}` })}</Badge>
                    <h4 className="font-semibold text-sm">
                      {language === 'ar' && week.topic_ar ? week.topic_ar : week.topic_en}
                    </h4>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  {week.activities?.slice(0, 3).map((activity, i) => (
                    <p key={i}>• {activity}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleAccept} className="w-full bg-teal-600">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Use This Curriculum', ar: 'استخدم هذا المنهج' })}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}