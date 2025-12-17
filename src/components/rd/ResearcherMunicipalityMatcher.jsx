import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, Sparkles, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { RESEARCHER_MATCHER_PROMPTS } from '@/lib/ai/prompts/rd';
import { getSystemPrompt } from '@/lib/saudiContext';

export default function ResearcherMunicipalityMatcher({ researcherProfile }) {
  const { language, isRTL, t } = useLanguage();
  const [matches, setMatches] = useState([]);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const findMatches = async () => {
    const response = await invokeAI({
      systemPrompt: getSystemPrompt('rd_researcher_matcher'),
      prompt: RESEARCHER_MATCHER_PROMPTS.buildPrompt(researcherProfile, challenges),
      response_json_schema: RESEARCHER_MATCHER_PROMPTS.schema
    });

    if (response.success) {
      setMatches(response.data?.matches || []);
      toast.success(t({ en: 'Matches found', ar: 'وُجدت مطابقات' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            {t({ en: 'Municipality Collaboration Matcher', ar: 'مطابق التعاون مع البلديات' })}
          </CardTitle>
          <Button onClick={findMatches} disabled={isLoading || !isAvailable} size="sm" className="bg-blue-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Find Matches', ar: 'ابحث عن مطابقات' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />

        {!matches.length && !isLoading && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Find municipalities that need your research expertise', ar: 'ابحث عن البلديات التي تحتاج خبرتك البحثية' })}
            </p>
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-3">
            {matches.map((match, idx) => (
              <div key={idx} className="p-4 border-2 border-blue-200 rounded-lg bg-white hover:border-blue-400 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {language === 'ar' && match.municipality_ar ? match.municipality_ar : match.municipality}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-blue-100 text-blue-700">
                        {match.challenge_count} {t({ en: 'challenges', ar: 'تحديات' })}
                      </Badge>
                      <span className="text-2xl font-bold text-green-600">{match.match_score}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="font-medium text-blue-900 mb-1">{t({ en: 'Why Match:', ar: 'لماذا المطابقة:' })}</p>
                    <p className="text-slate-700">{language === 'ar' && match.reason_ar ? match.reason_ar : match.reason}</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <p className="font-medium text-green-900 mb-1">{t({ en: 'Opportunity:', ar: 'الفرصة:' })}</p>
                    <p className="text-slate-700">{language === 'ar' && match.opportunity_ar ? match.opportunity_ar : match.opportunity}</p>
                  </div>
                </div>

                <Button size="sm" className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {t({ en: 'Request Introduction', ar: 'طلب تعريف' })}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
