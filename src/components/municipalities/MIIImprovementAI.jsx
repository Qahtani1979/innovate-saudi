import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../LanguageContext';
import { Sparkles, TrendingUp, Target, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MIIImprovementAI({ municipality }) {
  const { t, isRTL } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const [challenges, pilots, allMunicipalities] = await Promise.all([
        base44.entities.Challenge.filter({ municipality_id: municipality.id }).catch(() => []),
        base44.entities.Pilot.filter({ municipality_id: municipality.id }).catch(() => []),
        base44.entities.Municipality.list()
      ]);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this municipality's innovation performance and provide improvement recommendations:

Municipality: ${municipality.name_en}
Current MII Score: ${municipality.mii_score}/100
Rank: ${municipality.mii_rank}
Population: ${municipality.population}
Active Challenges: ${challenges.length}
Active Pilots: ${municipality.active_pilots}
Completed Pilots: ${municipality.completed_pilots}

National Context:
- Total municipalities: ${allMunicipalities.length}
- Average MII: ${(allMunicipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / allMunicipalities.length).toFixed(1)}

Provide:
1. Top 5 improvement actions (each with impact score 0-100 and timeline)
2. Dimension-specific gaps (innovation culture, digital capability, collaboration, pilots, R&D)
3. Benchmark against top-performing municipalities
4. Quick wins (actions that can improve score in 3-6 months)
5. Estimated MII improvement potential`,
        response_json_schema: {
          type: 'object',
          properties: {
            improvement_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  impact_score: { type: 'number' },
                  timeline_months: { type: 'number' },
                  difficulty: { type: 'string' }
                }
              }
            },
            dimension_gaps: {
              type: 'object',
              properties: {
                innovation_culture: { type: 'string' },
                digital_capability: { type: 'string' },
                collaboration: { type: 'string' },
                pilots: { type: 'string' },
                rd_integration: { type: 'string' }
              }
            },
            benchmark_insights: { type: 'string' },
            quick_wins: { type: 'array', items: { type: 'string' } },
            estimated_improvement: { type: 'number' }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error('AI recommendations failed:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t({ en: 'AI MII Improvement Plan', ar: 'خطة تحسين المؤشر الذكية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!recommendations && (
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="h-20 w-20 rounded-full bg-purple-100 mx-auto flex items-center justify-center mb-3">
                <Sparkles className="h-10 w-10 text-purple-600" />
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-2">
                {t({ en: 'Get AI-Powered Recommendations', ar: 'احصل على توصيات ذكية' })}
              </p>
              <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
                {t({ 
                  en: 'AI will analyze your municipality performance and provide personalized improvement actions to boost your MII score.',
                  ar: 'الذكاء سيحلل أداء بلديتك ويقدم إجراءات تحسين مخصصة لتعزيز درجة المؤشر.'
                })}
              </p>
            </div>
            <Button onClick={generateRecommendations} disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t({ en: 'AI Analyzing...', ar: 'الذكاء يحلل...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t({ en: 'Generate Improvement Plan', ar: 'إنشاء خطة التحسين' })}
                </>
              )}
            </Button>
          </div>
        )}

        {recommendations && (
          <div className="space-y-4">
            {/* Improvement Potential */}
            <div className="p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-300 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">{t({ en: 'Improvement Potential', ar: 'إمكانية التحسين' })}</p>
                <Badge className="bg-green-600 text-white">+{recommendations.estimated_improvement} points</Badge>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-600">{t({ en: 'Current', ar: 'الحالي' })}</p>
                  <p className="text-2xl font-bold text-slate-900">{municipality.mii_score}</p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-xs text-slate-600">{t({ en: 'Potential', ar: 'المحتمل' })}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {municipality.mii_score + recommendations.estimated_improvement}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                {t({ en: 'Quick Wins (3-6 months)', ar: 'مكاسب سريعة (3-6 أشهر)' })}
              </h4>
              <ul className="space-y-2">
                {recommendations.quick_wins?.map((win, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Actions */}
            <div>
              <h4 className="font-semibold text-sm mb-3">{t({ en: 'Prioritized Improvement Actions', ar: 'إجراءات التحسين ذات الأولوية' })}</h4>
              <div className="space-y-2">
                {recommendations.improvement_actions
                  ?.sort((a, b) => b.impact_score - a.impact_score)
                  .map((action, i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm flex-1">{action.action}</p>
                        <Badge className={
                          action.impact_score >= 80 ? 'bg-green-100 text-green-700' :
                          action.impact_score >= 60 ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          Impact: {action.impact_score}/100
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span>⏱️ {action.timeline_months} months</span>
                        <span>•</span>
                        <span className={
                          action.difficulty === 'easy' ? 'text-green-600' :
                          action.difficulty === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {action.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Dimension Gaps */}
            <div>
              <h4 className="font-semibold text-sm mb-3">{t({ en: 'Dimension Analysis', ar: 'تحليل الأبعاد' })}</h4>
              <div className="space-y-2">
                {Object.entries(recommendations.dimension_gaps || {}).map(([dimension, gap]) => (
                  <div key={dimension} className="p-3 bg-slate-50 rounded-lg">
                    <p className="font-medium text-xs text-slate-700 capitalize mb-1">
                      {dimension.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-600">{gap}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark */}
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-sm mb-2">{t({ en: 'Benchmark Analysis', ar: 'تحليل المقارنة' })}</h4>
              <p className="text-sm text-slate-700">{recommendations.benchmark_insights}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}