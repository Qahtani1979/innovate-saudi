import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { RotateCcw, Sparkles, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  PORTFOLIO_REBALANCING_SCHEMA,
  PORTFOLIO_REBALANCING_PROMPT_TEMPLATE
} from '@/lib/ai/prompts/portfolio/rebalancing';

function PortfolioRebalancing() {
  const { language, isRTL, t } = useLanguage();
  const [rebalanceScenario, setRebalanceScenario] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const runRebalanceAnalysis = async () => {
    const currentPortfolio = sectors.map(s => ({
      sector: s.name_en,
      challenges: challenges.filter(c => c.sector === s.code).length,
      pilots: pilots.filter(p => p.sector === s.code).length,
      rd: rdProjects.filter(r => r.research_area_en?.includes(s.name_en)).length,
      total_budget: pilots.filter(p => p.sector === s.code).reduce((sum, p) => sum + (p.budget || 0), 0)
    }));

    const result = await invokeAI({
      prompt: PORTFOLIO_REBALANCING_PROMPT_TEMPLATE({
        currentPortfolio,
        totalChallenges: challenges.length,
        totalPilots: pilots.length,
        highPriorityChallenges: challenges.filter(c => c.priority === 'tier_1').length,
        atRiskPilots: pilots.filter(p => p.risk_level === 'high').length
      }),
      response_json_schema: PORTFOLIO_REBALANCING_SCHEMA
    });

    if (result.success) {
      setRebalanceScenario(result.data);
      toast.success(t({ en: 'Rebalancing analysis complete', ar: 'اكتمل تحليل إعادة التوازن' }));
    }
  };

  const currentBalance = sectors.map(s => ({
    sector: language === 'ar' ? s.name_ar : s.name_en,
    challenges: challenges.filter(c => c.sector === s.code).length,
    pilots: pilots.filter(p => p.sector === s.code).length
  })).slice(0, 8);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '⚖️ Portfolio Rebalancing Wizard', ar: '⚖️ معالج إعادة توازن المحفظة' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'AI-powered portfolio optimization and strategic reallocation', ar: 'تحسين المحفظة وإعادة التخصيص الاستراتيجي بالذكاء الاصطناعي' })}
        </p>
      </div>

      {/* Current State */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{rdProjects.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'R&D Projects', ar: 'مشاريع بحثية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">
              {pilots.filter(p => p.recommendation === 'scale').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Ready to Scale', ar: 'جاهز للتوسع' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Run Analysis */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900 mb-1 text-lg">
                {t({ en: 'AI Rebalancing Analysis', ar: 'تحليل إعادة التوازن الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Analyze current portfolio and suggest strategic reallocations', ar: 'تحليل المحفظة الحالية واقتراح إعادة توزيع استراتيجي' })}
              </p>
            </div>
            <Button onClick={runRebalanceAnalysis} disabled={analyzing || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {analyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Analyze', ar: 'تحليل' })}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-3" />
        </CardContent>
      </Card>

      {/* Current Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Current Sector Distribution', ar: 'التوزيع القطاعي الحالي' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currentBalance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="challenges" fill="#ef4444" name="Challenges" />
                <Bar dataKey="pilots" fill="#3b82f6" name="Pilots" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Portfolio Balance Radar', ar: 'رادار توازن المحفظة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={currentBalance.slice(0, 6)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="sector" />
                <PolarRadiusAxis />
                <Radar name="Challenges" dataKey="challenges" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Radar name="Pilots" dataKey="pilots" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {rebalanceScenario && (
        <div className="space-y-6">
          {/* Overinvested */}
          {rebalanceScenario.overinvested?.length > 0 && (
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Overinvested Sectors', ar: 'القطاعات المفرطة الاستثمار' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebalanceScenario.overinvested.map((item, idx) => (
                    <div key={idx} className="p-4 bg-amber-50 border border-amber-300 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">{language === 'ar' ? item.sector_ar : item.sector_en}</p>
                        <Badge className="bg-amber-600">-{item.suggested_reduction}%</Badge>
                      </div>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? item.reason_ar : item.reason_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Underinvested */}
          {rebalanceScenario.underinvested?.length > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Underinvested Sectors', ar: 'القطاعات ناقصة الاستثمار' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebalanceScenario.underinvested.map((item, idx) => (
                    <div key={idx} className="p-4 bg-red-50 border border-red-300 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">{language === 'ar' ? item.sector_ar : item.sector_en}</p>
                        <Badge className="bg-green-600">+{item.suggested_increase}%</Badge>
                      </div>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? item.reason_ar : item.reason_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reallocations */}
          {rebalanceScenario.reallocations?.length > 0 && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <RotateCcw className="h-5 w-5" />
                  {t({ en: 'Recommended Reallocations', ar: 'إعادة التخصيصات الموصى بها' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rebalanceScenario.reallocations.map((realloc, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-blue-300 rounded-lg">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1 text-center p-3 bg-red-50 rounded">
                          <p className="text-xs text-slate-600 mb-1">{t({ en: 'From', ar: 'من' })}</p>
                          <p className="font-semibold text-slate-900">{language === 'ar' ? realloc.from_ar : realloc.from_en}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-5 w-5 text-blue-600" />
                          <Badge className="bg-blue-600">{realloc.amount_percentage}%</Badge>
                        </div>
                        <div className="flex-1 text-center p-3 bg-green-50 rounded">
                          <p className="text-xs text-slate-600 mb-1">{t({ en: 'To', ar: 'إلى' })}</p>
                          <p className="font-semibold text-slate-900">{language === 'ar' ? realloc.to_ar : realloc.to_en}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">{t({ en: 'Expected Impact:', ar: 'التأثير المتوقع:' })}</p>
                        <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? realloc.impact_ar : realloc.impact_en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Wins */}
          {rebalanceScenario.quick_wins?.length > 0 && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Quick Wins', ar: 'انتصارات سريعة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rebalanceScenario.quick_wins.map((win, idx) => (
                    <div key={idx} className="p-4 bg-white border border-green-300 rounded-lg">
                      <p className="font-semibold text-slate-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {idx + 1}. {language === 'ar' ? win.action_ar : win.action_en}
                      </p>
                      <p className="text-sm text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        💡 {language === 'ar' ? win.expected_impact_ar : win.expected_impact_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(PortfolioRebalancing, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead'] });