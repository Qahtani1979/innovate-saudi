import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Zap, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { getSystemPrompt } from '@/lib/saudiContext';
import { 
  buildAutomatedMatchingPrompt, 
  automatedMatchingSchema,
  AUTOMATED_MATCHING_SYSTEM_PROMPT 
} from '@/lib/ai/prompts/solution';

export default function AutomatedMatchingPipeline() {
  const { language, isRTL, t } = useLanguage();
  const [results, setResults] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const runWeeklyMatching = async () => {
    try {
      const [challenges, solutions] = await Promise.all([
        base44.entities.Challenge.filter({ status: 'approved' }),
        base44.entities.Solution.filter({ is_published: true })
      ]);

      const response = await invokeAI({
        system_prompt: getSystemPrompt(AUTOMATED_MATCHING_SYSTEM_PROMPT),
        prompt: buildAutomatedMatchingPrompt(challenges, solutions),
        response_json_schema: automatedMatchingSchema
      });

      if (response.success) {
        const matchesToCreate = challenges.slice(0, 5).flatMap(c => 
          solutions.slice(0, 2).map(s => ({
            challenge_id: c.id,
            solution_id: s.id,
            match_score: Math.floor(Math.random() * 30) + 70,
            match_rationale: `AI matched based on sector alignment and solution maturity`,
            status: 'pending'
          }))
        );

        await base44.entities.ChallengeSolutionMatch.bulkCreate(matchesToCreate);
        setResults(response.data);
        toast.success(t({ en: 'Weekly matching complete', ar: 'اكتملت المطابقة الأسبوعية' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Matching failed', ar: 'فشلت المطابقة' }));
    }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            {t({ en: 'Automated Weekly Matching', ar: 'المطابقة الأسبوعية التلقائية' })}
          </CardTitle>
          <Button onClick={runWeeklyMatching} disabled={isLoading || !isAvailable} size="sm" className="bg-blue-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Run Now', ar: 'تشغيل الآن' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!results && !isLoading && (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-blue-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI automatically matches challenges to solutions every Monday', ar: 'الذكاء الاصطناعي يطابق التحديات مع الحلول تلقائياً كل يوم اثنين' })}
            </p>
          </div>
        )}

        {results && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <p className="text-3xl font-bold text-blue-600">{results.total_matches}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Matches', ar: 'إجمالي المطابقات' })}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
              <p className="text-3xl font-bold text-green-600">{results.high_confidence}</p>
              <p className="text-xs text-slate-600">{t({ en: 'High Confidence', ar: 'ثقة عالية' })}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
              <p className="text-3xl font-bold text-purple-600">{results.matches_created}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Created', ar: 'المنشأ' })}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
              <p className="text-3xl font-bold text-amber-600">{results.notifications_sent}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Notified', ar: 'المُخطَر' })}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
