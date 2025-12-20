import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Sparkles, Target, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

export default function SolutionRecommendationEngine({ challenge, userProfile, context = 'challenge' }) {
  const { language, isRTL, t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const { invokeAI, status: aiStatus, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generateRecommendations = async () => {
    const { data: solutions = [] } = await supabase.from('solutions').select('*').eq('is_published', true);
    
    const result = await invokeAI({
      prompt: `Recommend the best 5 solutions for this ${context} in BOTH English and Arabic:

${context === 'challenge' ? `Challenge: ${challenge?.title_en}
Sector: ${challenge?.sector}
Description: ${challenge?.description_en}
Root Causes: ${challenge?.root_causes?.join(', ')}
` : `User Profile:
Role: ${userProfile?.role}
Sectors of Interest: ${userProfile?.sectors?.join(', ')}
Previous Solutions: ${userProfile?.viewed_solutions?.join(', ')}
`}

Available Solutions:
${solutions.slice(0, 20).map(s => `${s.name_en} - ${s.provider_name} (${s.maturity_level}): ${s.value_proposition}`).join('\n')}

For each recommendation provide:
1. Solution match score (0-100)
2. Key match reasons (bilingual)
3. Implementation considerations (bilingual)
4. Expected impact (bilingual)`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                solution_name: { type: 'string' },
                match_score: { type: 'number' },
                match_reasons: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
                considerations: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } },
                expected_impact: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      // Match recommendations with actual solution IDs
      const enrichedRecommendations = result.data.recommendations.map(rec => {
        const solution = solutions.find(s => s.name_en === rec.solution_name);
        return {
          ...rec,
          solution_id: solution?.id,
          solution
        };
      }).filter(r => r.solution_id);

      setRecommendations(enrichedRecommendations);
    } else {
      toast.error(t({ en: 'Failed to generate recommendations', ar: 'فشل توليد التوصيات' }));
    }
  };

  useEffect(() => {
    if (challenge || userProfile) {
      generateRecommendations();
    }
  }, [challenge?.id, userProfile?.id]);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI-Powered Recommendations', ar: 'توصيات ذكية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-3 text-slate-600">{t({ en: 'Analyzing solutions...', ar: 'جاري تحليل الحلول...' })}</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Button onClick={generateRecommendations} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Get AI Recommendations', ar: 'احصل على توصيات ذكية' })}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{rec.solution?.name_en}</h4>
                      <Badge className="bg-purple-100 text-purple-700">
                        {rec.match_score}% {t({ en: 'match', ar: 'توافق' })}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{rec.solution?.provider_name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {rec.match_score >= 80 && <Target className="h-5 w-5 text-green-600" />}
                    {rec.match_score >= 90 && <Zap className="h-5 w-5 text-amber-600" />}
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-slate-700 mb-1">{t({ en: 'Why this matches:', ar: 'لماذا يتطابق:' })}</p>
                  <ul className="space-y-0.5">
                    {rec.match_reasons?.slice(0, 2).map((reason, i) => (
                      <li key={i} className="text-xs text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        ✓ {typeof reason === 'object' ? reason[language] || reason.en : reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expected Impact */}
                <div className="p-2 bg-green-50 rounded text-xs mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <span className="font-medium text-green-900">{t({ en: 'Impact:', ar: 'التأثير:' })}</span>{' '}
                  <span className="text-green-800">
                    {rec.expected_impact?.[language] || rec.expected_impact?.en}
                  </span>
                </div>

                {/* Considerations */}
                <div className="p-2 bg-amber-50 rounded text-xs mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <span className="font-medium text-amber-900">{t({ en: 'Note:', ar: 'ملاحظة:' })}</span>{' '}
                  <span className="text-amber-800">
                    {rec.considerations?.[language] || rec.considerations?.en}
                  </span>
                </div>

                <Link to={createPageUrl(`SolutionDetail?id=${rec.solution_id}`)}>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-xs">
                    {t({ en: 'View Solution Details', ar: 'عرض تفاصيل الحل' })}
                  </Button>
                </Link>
              </div>
            ))}

            <Button onClick={generateRecommendations} variant="outline" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              {t({ en: 'Refresh Recommendations', ar: 'تحديث التوصيات' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}