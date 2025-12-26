import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle, Lightbulb, Target, Loader2, CheckCircle2, Users, Zap, BookOpen, Plus
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  buildGapProgramRecommenderPrompt,
  gapProgramRecommenderSchema,
  GAP_PROGRAM_RECOMMENDER_SYSTEM_PROMPT
} from '@/lib/ai/prompts/strategy';

import { useStrategiesWithVisibility, useStrategyMutations } from '@/hooks/useStrategyMutations';
import { useProgramsWithVisibility } from '@/hooks/useProgramMutations';
import { useChallengesWithVisibility } from '@/hooks/useChallengeMutations';
import { useSectors } from '@/hooks/useSectors';
import { useProgramMutations } from '@/hooks/useProgramMutations';

export default function StrategicGapProgramRecommender({ strategicPlanId, onProgramCreated }) {
  const { language, isRTL, t } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: strategicPlans = [] } = useStrategiesWithVisibility({
    status: 'all'
  });

  const { data: programs = [] } = useProgramsWithVisibility({
    status: 'all',
    limit: 1000
  });

  const { data: challenges = [] } = useChallengesWithVisibility({
    status: 'all',
    limit: 1000,
    includeDeleted: false
  });

  const { data: sectors = [] } = useSectors();

  const gaps = useMemo(() => {
    const list = [];

    // 1. Objectives with no programs
    strategicPlans.filter(p => !strategicPlanId || p.id === strategicPlanId).forEach(plan => {
      (plan.objectives || []).forEach(obj => {
        const hasProgram = programs.some(prog =>
          (prog.objectives || []).some(progObj => progObj.id === obj.id)
        );
        if (!hasProgram) {
          list.push({
            id: `obj-${obj.id}`,
            type: 'uncovered_objective',
            title: { en: obj.title_en, ar: obj.title_ar },
            description: { en: 'Objective has no supporting programs', ar: 'الهدف ليس لديه برامج داعمة' },
            severity: 'high',
            plan: plan,
            objective: obj
          });
        }
      });
    });

    // 2. Unaddressed Challenges
    challenges.filter(c => c.status === 'open').forEach(challenge => {
      const hasProgram = programs.some(prog =>
        (prog.related_challenges || []).includes(challenge.id)
      );
      if (!hasProgram) {
        list.push({
          id: `challenge-${challenge.id}`,
          type: 'unaddressed_challenge',
          title: { en: challenge.title_en, ar: challenge.title_ar },
          description: { en: 'Open challenge with no planned intervention', ar: 'تحدي مفتوح بدون تدخل مخطط' },
          severity: 'medium',
          challenge: challenge
        });
      }
    });

    return list;
  }, [strategicPlans, programs, challenges, strategicPlanId]);

  const { createProgramFromRecommendation, isCreatingFromRec } = useProgramMutations();
  const { generateGapRecommendations } = useStrategyMutations();

  const handleGenerateRecommendations = async () => {
    try {
      const data = await generateGapRecommendations.mutateAsync({
        gaps,
        strategicPlans,
        sectors,
        invokeAI,
        prompts: { buildGapProgramRecommenderPrompt, GAP_PROGRAM_RECOMMENDER_SYSTEM_PROMPT },
        schemas: { gapProgramRecommenderSchema }
      });
      setRecommendations(data || []);
      toast.success(t({
        en: `Generated ${data?.length || 0} program recommendations`,
        ar: `تم توليد ${data?.length || 0} توصية برامج`
      }));
    } catch (error) {
      console.error('Recommendation generation failed:', error);
    }
  };

  const severityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const gapTypeIcons = {
    no_programs: Target,
    uncovered_objective: Lightbulb,
    unaddressed_challenge: AlertTriangle,
    sector_gap: Users
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-5 w-5" />
          {t({ en: 'Strategic Gap → Program Recommender', ar: 'موصي البرامج من الفجوات الاستراتيجية' })}
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          {t({
            en: 'Identify strategic gaps and get AI-powered program recommendations',
            ar: 'تحديد الفجوات الاستراتيجية والحصول على توصيات برامج بالذكاء الاصطناعي'
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <AIStatusIndicator status={aiStatus} error={generateGapRecommendations.error} rateLimitInfo={rateLimitInfo} />

        {/* Gap Summary */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-slate-700">{gaps?.length || 0}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Gaps', ar: 'إجمالي الفجوات' })}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{gaps.filter(g => g.severity === 'high').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'High Priority', ar: 'أولوية عالية' })}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">{gaps.filter(g => g.severity === 'medium').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Medium', ar: 'متوسط' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{gaps.filter(g => g.severity === 'low').length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Low', ar: 'منخفض' })}</p>
          </div>
        </div>

        <Tabs defaultValue="gaps" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="gaps">
              {t({ en: 'Identified Gaps', ar: 'الفجوات المحددة' })} ({gaps.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations">
              {t({ en: 'Recommendations', ar: 'التوصيات' })} ({recommendations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gaps" className="space-y-3 mt-4">
            {(!gaps || gaps.length === 0) ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">
                  {t({ en: 'No strategic gaps identified!', ar: 'لم يتم تحديد فجوات استراتيجية!' })}
                </p>
              </div>
            ) : (
              gaps.map((gap, index) => {
                const GapIcon = gapTypeIcons[gap.type] || AlertTriangle;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${severityColors[gap.severity]}`}
                  >
                    <div className="flex items-start gap-3">
                      <GapIcon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">
                            {language === 'ar' ? gap.title.ar : gap.title.en}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {gap.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1 opacity-80">
                          {language === 'ar' ? gap.description.ar : gap.description.en}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {gaps.length > 0 && (
              <Button
                onClick={handleGenerateRecommendations}
                disabled={generateGapRecommendations.isPending || aiLoading}
                className="w-full mt-4"
              >
                {generateGapRecommendations.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Analyzing gaps...', ar: 'جاري تحليل الفجوات...' })}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {t({ en: 'Generate Program Recommendations', ar: 'توليد توصيات البرامج' })}
                  </>
                )}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-3 mt-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>{t({ en: 'Generate recommendations from the Gaps tab', ar: 'قم بتوليد التوصيات من تبويب الفجوات' })}</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={rec.priority === 'P0' ? 'text-red-600' : rec.priority === 'P1' ? 'text-amber-600' : 'text-blue-600'}>
                          {rec.priority}
                        </Badge>
                        <h4 className="font-semibold text-slate-800">
                          {language === 'ar' ? rec.program_name_ar : rec.program_name_en}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Badge variant="secondary">{rec.program_type?.replace(/_/g, ' ')}</Badge>
                        <span>•</span>
                        <span>{rec.duration_months} {t({ en: 'months', ar: 'شهور' })}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rec.objectives?.slice(0, 3).map((obj, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => createProgramFromRecommendation.mutate(rec)}
                      disabled={isCreatingFromRec}
                    >
                      {isCreatingFromRec ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          {t({ en: 'Create', ar: 'إنشاء' })}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
