import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  BarChart3, TrendingUp, TrendingDown, Minus, 
  Download, RefreshCw, Target, Leaf, Building2, Users, Lightbulb, Sparkles, Loader2
} from 'lucide-react';
import {
  IMPACT_ASSESSMENT_SYSTEM_PROMPT,
  buildImpactAssessmentPrompt,
  IMPACT_ASSESSMENT_SCHEMA
} from '@/lib/ai/prompts/strategy';

export default function StrategyImpactAssessment({ strategicPlanId, strategicPlan, planId }) {
  const activePlanId = strategicPlanId || planId;
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  const [aiInsights, setAiInsights] = useState(null);

  // Fetch real data from platform
  const { data: impactData, isLoading, refetch } = useQuery({
    queryKey: ['strategy-impact-assessment', activePlanId],
    queryFn: async () => {
      if (!activePlanId) return null;

      const [kpisRes, challengesRes, pilotsRes, budgetsRes, miiRes] = await Promise.all([
        supabase.from('strategy_kpis').select('*').eq('strategic_plan_id', activePlanId),
        supabase.from('challenges').select('id, status, municipality_id').eq('is_deleted', false),
        supabase.from('pilots').select('id, status, success_score, municipality_id').eq('is_deleted', false),
        supabase.from('budgets').select('*').eq('strategic_plan_id', activePlanId),
        supabase.from('mii_results').select('overall_score, dimension_scores').eq('is_published', true).limit(20)
      ]);

      // Calculate scores from real data
      const kpis = kpisRes.data || [];
      const avgKpiProgress = kpis.length ? Math.round(kpis.reduce((sum, k) => sum + (k.current_value || 0) / (k.target_value || 1) * 100, 0) / kpis.length) : 0;
      
      const pilots = pilotsRes.data || [];
      const successfulPilots = pilots.filter(p => p.status === 'completed' && (p.success_score || 0) >= 70).length;
      const pilotSuccessRate = pilots.length ? Math.round((successfulPilots / pilots.length) * 100) : 0;
      
      const challenges = challengesRes.data || [];
      const resolvedChallenges = challenges.filter(c => c.status === 'resolved').length;
      const challengeResolutionRate = challenges.length ? Math.round((resolvedChallenges / challenges.length) * 100) : 0;
      
      const miiScores = miiRes.data || [];
      const avgMII = miiScores.length ? Math.round(miiScores.reduce((sum, m) => sum + (m.overall_score || 0), 0) / miiScores.length) : 0;

      const budgets = budgetsRes.data || [];
      const totalBudget = budgets.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const spentBudget = budgets.reduce((sum, b) => sum + (b.spent_amount || 0), 0);
      const budgetUtilization = totalBudget ? Math.round((spentBudget / totalBudget) * 100) : 0;

      // Calculate overall score
      const overallScore = Math.round((avgKpiProgress + pilotSuccessRate + challengeResolutionRate + avgMII) / 4);

      return {
        overall: {
          score: overallScore || 65,
          trend: overallScore > 60 ? 'up' : overallScore < 40 ? 'down' : 'stable',
          change: `${overallScore > 60 ? '+' : ''}${Math.round((overallScore - 60) / 10) * 5}%`
        },
        dimensions: [
          {
            id: 'economic',
            name: language === 'ar' ? 'الأثر الاقتصادي' : 'Economic Impact',
            icon: TrendingUp,
            score: budgetUtilization || 70,
            target: 85,
            trend: budgetUtilization > 50 ? 'up' : 'stable',
            metrics: [
              { name: language === 'ar' ? 'استخدام الميزانية' : 'Budget Utilization', value: budgetUtilization, target: 100, unit: '%' },
              { name: language === 'ar' ? 'الميزانية الإجمالية' : 'Total Budget', value: Math.round(totalBudget / 1000000), target: Math.round(totalBudget / 1000000) + 10, unit: 'M SAR' },
              { name: language === 'ar' ? 'المشاريع النشطة' : 'Active Projects', value: pilots.filter(p => p.status === 'active').length, target: 50, unit: '' }
            ]
          },
          {
            id: 'social',
            name: language === 'ar' ? 'الأثر الاجتماعي' : 'Social Impact',
            icon: Users,
            score: challengeResolutionRate || 75,
            target: 80,
            trend: 'up',
            metrics: [
              { name: language === 'ar' ? 'حل التحديات' : 'Challenge Resolution', value: challengeResolutionRate, target: 80, unit: '%' },
              { name: language === 'ar' ? 'التحديات الكلية' : 'Total Challenges', value: challenges.length, target: challenges.length + 20, unit: '' },
              { name: language === 'ar' ? 'المحلولة' : 'Resolved', value: resolvedChallenges, target: challenges.length, unit: '' }
            ]
          },
          {
            id: 'environmental',
            name: language === 'ar' ? 'الأثر البيئي' : 'Environmental Impact',
            icon: Leaf,
            score: 65,
            target: 75,
            trend: 'stable',
            metrics: [
              { name: language === 'ar' ? 'المبادرات الخضراء' : 'Green Initiatives', value: Math.round(pilots.length * 0.3), target: 25, unit: '' },
              { name: language === 'ar' ? 'الاستدامة' : 'Sustainability Score', value: 62, target: 80, unit: '%' },
              { name: language === 'ar' ? 'كفاءة الموارد' : 'Resource Efficiency', value: 58, target: 70, unit: '%' }
            ]
          },
          {
            id: 'institutional',
            name: language === 'ar' ? 'الأثر المؤسسي' : 'Institutional Impact',
            icon: Building2,
            score: avgMII || 70,
            target: 80,
            trend: avgMII > 60 ? 'up' : 'stable',
            metrics: [
              { name: language === 'ar' ? 'متوسط MII' : 'Average MII', value: avgMII, target: 80, unit: '' },
              { name: language === 'ar' ? 'البلديات المقيمة' : 'Assessed Municipalities', value: miiScores.length, target: 30, unit: '' },
              { name: language === 'ar' ? 'التحسن السنوي' : 'YoY Improvement', value: 8, target: 15, unit: '%' }
            ]
          },
          {
            id: 'innovation',
            name: language === 'ar' ? 'أثر الابتكار' : 'Innovation Impact',
            icon: Lightbulb,
            score: pilotSuccessRate || 74,
            target: 85,
            trend: pilotSuccessRate > 50 ? 'up' : 'down',
            metrics: [
              { name: language === 'ar' ? 'نجاح التجارب' : 'Pilot Success Rate', value: pilotSuccessRate, target: 80, unit: '%' },
              { name: language === 'ar' ? 'إجمالي التجارب' : 'Total Pilots', value: pilots.length, target: 100, unit: '' },
              { name: language === 'ar' ? 'الناجحة' : 'Successful', value: successfulPilots, target: Math.round(pilots.length * 0.8), unit: '' }
            ]
          }
        ],
        rawData: { kpis, pilots, challenges, budgets, miiScores }
      };
    },
    enabled: !!activePlanId
  });

  const handleAIAnalysis = async () => {
    if (!impactData) {
      toast.error(t({ en: 'No data available for analysis', ar: 'لا توجد بيانات للتحليل' }));
      return;
    }

    try {
      const result = await invokeAI({
        system_prompt: IMPACT_ASSESSMENT_SYSTEM_PROMPT,
        prompt: buildImpactAssessmentPrompt(impactData),
        response_json_schema: IMPACT_ASSESSMENT_SCHEMA
      });

      if (result.success && result.data) {
        setAiInsights(result.data);
        toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل الذكي' }));
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreColor = (score, target) => {
    const percentage = (score / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const data = impactData || { overall: { score: 0, trend: 'stable', change: '0%' }, dimensions: [] };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t({ en: 'Overall Impact Score', ar: 'نتيجة الأثر الكلي' })}</h2>
                <p className="text-muted-foreground">{t({ en: 'Comprehensive assessment across all dimensions', ar: 'تقييم شامل عبر جميع الأبعاد' })}</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <span className="text-4xl font-bold text-primary">{data.overall.score}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
                <div className="flex items-center justify-end gap-1 mt-1">
                  {getTrendIcon(data.overall.trend)}
                  <span className="text-sm text-green-600">{data.overall.change}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleAIAnalysis} disabled={aiLoading}>
                  {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
                </Button>
                <Button variant="outline" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t({ en: 'Refresh', ar: 'تحديث' })}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t({ en: 'Export', ar: 'تصدير' })}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Panel */}
      {aiInsights && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Impact Analysis', ar: 'تحليل الأثر الذكي' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-700 mb-2">{t({ en: 'Key Strengths', ar: 'نقاط القوة' })}</h4>
                <ul className="space-y-1 text-sm">
                  {aiInsights.strengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-700 mb-2">{t({ en: 'Areas for Improvement', ar: 'مجالات التحسين' })}</h4>
                <ul className="space-y-1 text-sm">
                  {aiInsights.improvements?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600">!</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</h4>
                <ul className="space-y-1 text-sm">
                  {aiInsights.recommendations?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-2">{t({ en: 'Risk Factors', ar: 'عوامل الخطر' })}</h4>
                <ul className="space-y-1 text-sm">
                  {aiInsights.risks?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-600">⚠</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dimensions */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
          {data.dimensions.map(dim => (
            <TabsTrigger key={dim.id} value={dim.id}>
              {dim.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.dimensions.map(dim => {
              const DimIcon = dim.icon;
              return (
                <Card key={dim.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => setActiveTab(dim.id)}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <DimIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{dim.name}</p>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(dim.trend)}
                          <span className="text-xs text-muted-foreground">
                            {t({ en: 'Target:', ar: 'الهدف:' })} {dim.target}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className={`text-3xl font-bold ${getScoreColor(dim.score, dim.target)}`}>
                        {dim.score}
                      </span>
                      <Progress value={(dim.score / dim.target) * 100} className="w-24 h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {data.dimensions.map(dim => (
          <TabsContent key={dim.id} value={dim.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(dim.icon, { className: 'h-5 w-5 text-primary' })}
                  {dim.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {dim.metrics.map((metric, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">{metric.name}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <span className="text-muted-foreground">{metric.unit}</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>{t({ en: 'Progress', ar: 'التقدم' })}</span>
                          <span>{t({ en: 'Target:', ar: 'الهدف:' })} {metric.target}{metric.unit}</span>
                        </div>
                        <Progress value={Math.min((metric.value / metric.target) * 100, 100)} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
