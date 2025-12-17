import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Loader2, BookOpen, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildCurriculumPrompt, 
  getCurriculumSchema,
  CURRICULUM_GENERATOR_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/programs';

export default function AICurriculumGenerator({ programType, duration_weeks, objectives, onCurriculumGenerated }) {
  const { t, language } = useLanguage();
  const { invokeAI, status, isLoading: generating, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [curriculum, setCurriculum] = useState(null);

  const generateCurriculum = async () => {
    const result = await invokeAI({
      prompt: buildCurriculumPrompt(programType, duration_weeks, objectives),
      response_json_schema: getCurriculumSchema(),
      system_prompt: getSystemPrompt(CURRICULUM_GENERATOR_SYSTEM_PROMPT)
    });

    if (result.success && result.data?.curriculum) {
      setCurriculum(result.data.curriculum);
      toast.success(t({ en: 'Curriculum generated!', ar: 'تم توليد المنهج!' }));
    }
  };

  const handleAccept = () => {
    if (onCurriculumGenerated && curriculum) {
      onCurriculumGenerated(curriculum);
      toast.success(t({ en: 'Curriculum added', ar: 'تمت إضافة المنهج' }));
    }
  };

  const getLocalizedField = (week, field) => {
    if (language === 'ar' && week[`${field}_ar`]) {
      return week[`${field}_ar`];
    }
    return week[field];
  };

  const getLocalizedArray = (week, field) => {
    if (language === 'ar' && week[`${field}_ar`]) {
      return week[`${field}_ar`];
    }
    return week[field] || [];
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
            <Button onClick={generateCurriculum} disabled={generating || !isAvailable} size="sm">
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
      <CardContent className="space-y-3">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        
        {!curriculum && !generating && (
          <div className="text-center py-6">
            <BookOpen className="h-10 w-10 text-teal-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {t({ en: 'AI will generate a comprehensive curriculum', ar: 'سيقوم الذكاء بتوليد منهج شامل' })}
            </p>
          </div>
        )}
        
        {curriculum && (
          <>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {curriculum.map((week, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge className="mb-1">{t({ en: `Week ${week.week}`, ar: `أسبوع ${week.week}` })}</Badge>
                      <h4 className="font-semibold text-sm">
                        {language === 'ar' ? week.topic_ar : week.topic_en}
                      </h4>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-medium text-slate-700">{t({ en: 'Activities:', ar: 'الأنشطة:' })}</p>
                    {getLocalizedArray(week, 'activities').slice(0, 3).map((activity, i) => (
                      <p key={i}>• {activity}</p>
                    ))}
                  </div>
                  {week.deliverables?.length > 0 && (
                    <div className="mt-2 pt-2 border-t text-xs">
                      <p className="font-medium text-slate-700">{t({ en: 'Deliverables:', ar: 'المخرجات:' })}</p>
                      {getLocalizedArray(week, 'deliverables').slice(0, 2).map((d, i) => (
                        <p key={i} className="text-slate-600">• {d}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleAccept} className="w-full bg-teal-600">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Use This Curriculum', ar: 'استخدم هذا المنهج' })}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
