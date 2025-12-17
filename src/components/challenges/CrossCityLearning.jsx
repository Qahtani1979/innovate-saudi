import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MapPin, Sparkles, BookOpen, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildCrossCityLearningPrompt, 
  crossCityLearningSchema, 
  CROSS_CITY_LEARNING_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/challenges';

export default function CrossCityLearning({ challenge }) {
  const { language, isRTL, t } = useLanguage();
  const [similarCases, setSimilarCases] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: allChallenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const findSimilarSolutions = async () => {
    const resolvedChallenges = allChallenges.filter(c => 
      c.status === 'resolved' && 
      c.id !== challenge.id &&
      c.sector === challenge.sector
    );

    if (resolvedChallenges.length === 0) {
      toast.info(t({ en: 'No similar resolved challenges found', ar: 'لم يتم العثور على تحديات محلولة مشابهة' }));
      return;
    }

    const result = await invokeAI({
      systemPrompt: getSystemPrompt(CROSS_CITY_LEARNING_SYSTEM_PROMPT),
      prompt: buildCrossCityLearningPrompt(challenge, resolvedChallenges),
      response_json_schema: crossCityLearningSchema
    });

    if (result.success) {
      setSimilarCases(result.data?.similar_cases || []);
      toast.success(t({ en: 'Similar cases found', ar: 'تم العثور على حالات مشابهة' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-teal-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {t({ en: 'Learning from Other Cities', ar: 'التعلم من المدن الأخرى' })}
          </CardTitle>
          <Button onClick={findSimilarSolutions} disabled={loading || !isAvailable} size="sm" className="bg-blue-600">
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find Solutions', ar: 'ابحث عن حلول' })}
          </Button>
        </div>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
      </CardHeader>
      <CardContent className="pt-6">
        {!similarCases && !loading && (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Discover how other municipalities solved similar challenges', ar: 'اكتشف كيف حلت البلديات الأخرى تحديات مشابهة' })}
            </p>
          </div>
        )}

        {similarCases && (
          <div className="space-y-4">
            {similarCases.map((case_, idx) => (
              <div key={idx} className="p-4 border-2 border-blue-200 rounded-lg bg-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{case_.challenge_title}</h4>
                    <Badge className="bg-blue-100 text-blue-700">{case_.municipality}</Badge>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">
                      {t({ en: 'Why Similar:', ar: 'لماذا مشابه:' })}
                    </p>
                    <p className="text-slate-600">{case_.similarity_reason}</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium text-green-900 mb-1">
                      ✅ {t({ en: 'Resolution Approach:', ar: 'نهج الحل:' })}
                    </p>
                    <p className="text-slate-700">{case_.resolution_approach}</p>
                  </div>

                  <div>
                    <p className="font-medium text-slate-700 mb-1">
                      {t({ en: 'Results:', ar: 'النتائج:' })}
                    </p>
                    <p className="text-slate-600">{case_.results_achieved}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium text-blue-900 mb-2">
                      💡 {t({ en: 'Key Lessons:', ar: 'الدروس الرئيسية:' })}
                    </p>
                    <ul className="space-y-1">
                      {case_.lessons_learned?.map((lesson, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <Award className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>{lesson}</span>
                        </li>
                      ))}
                    </ul>
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