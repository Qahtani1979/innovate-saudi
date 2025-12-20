import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Microscope, Sparkles, Target, DollarSign, Loader2, Plus, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function RDPortfolioPlanner() {
  const { language, isRTL, t } = useLanguage();
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls'],
    queryFn: () => base44.entities.RDCall.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const generatePortfolioPlan = async () => {
    const gapChallenges = challenges.filter(c => 
      !pilots.some(p => p.challenge_id === c.id) && 
      !rdProjects.some(r => r.challenge_ids?.includes(c.id))
    );

    const result = await invokeAI({
      prompt: `Create a strategic R&D portfolio plan for Saudi municipal innovation:

Current State:
- Active R&D Projects: ${rdProjects.length}
- R&D Calls: ${rdCalls.length}
- Unaddressed Challenges: ${gapChallenges.length}
- Challenges by sector: ${challenges.slice(0, 10).map(c => `${c.sector}: ${c.title_en}`).join('; ')}

Generate bilingual recommendations for:
1. Recommended R&D calls for next 12 months (3-5 calls)
2. Budget allocation across research themes
3. Priority research areas based on challenge gaps
4. Timeline for call launches
5. Expected TRL progression targets

Each recommendation should include English and Arabic versions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommended_calls: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title_en: { type: 'string' },
                title_ar: { type: 'string' },
                focus_area_en: { type: 'string' },
                focus_area_ar: { type: 'string' },
                budget: { type: 'number' },
                timeline_en: { type: 'string' },
                timeline_ar: { type: 'string' },
                expected_projects: { type: 'number' },
                priority: { type: 'string' }
              }
            }
          },
          research_themes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                theme_en: { type: 'string' },
                theme_ar: { type: 'string' },
                budget_percentage: { type: 'number' },
                rationale_en: { type: 'string' },
                rationale_ar: { type: 'string' }
              }
            }
          },
          portfolio_balance: {
            type: 'object',
            properties: {
              short_term_percentage: { type: 'number' },
              long_term_percentage: { type: 'number' },
              justification_en: { type: 'string' },
              justification_ar: { type: 'string' }
            }
          }
        }
      }
    });

    if (result.success) {
      setAiRecommendations(result.data);
      toast.success(t({ en: 'Portfolio plan generated', ar: 'تم إنشاء خطة المحفظة' }));
    }
  };

  const trlDistribution = rdProjects.reduce((acc, proj) => {
    const trl = proj.trl_current || proj.trl_start || 1;
    acc[`TRL ${trl}`] = (acc[`TRL ${trl}`] || 0) + 1;
    return acc;
  }, {});

  const trlData = Object.entries(trlDistribution).map(([trl, count]) => ({ trl, count }));

  const portfolioScatter = rdProjects.map(p => ({
    name: p.code || p.title_en?.substring(0, 15),
    trl: p.trl_current || p.trl_start || 1,
    budget: (p.budget || 500000) / 1000,
    impact: p.impact_score || 50
  }));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🔬 R&D Portfolio Planner', ar: '🔬 مخطط محفظة البحث والتطوير' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'AI-powered research portfolio optimization and call planning', ar: 'تحسين محفظة الأبحاث وتخطيط الدعوات بالذكاء الاصطناعي' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Microscope className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{rdProjects.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{rdCalls.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'R&D Calls', ar: 'دعوات بحثية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {rdProjects.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'In Progress', ar: 'جاري' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <DollarSign className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {(rdProjects.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Budget', ar: 'الميزانية الكلية' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Generate */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900 mb-1 text-lg">
                {t({ en: 'AI Portfolio Optimizer', ar: 'محسن المحفظة الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Generate optimized R&D call plan based on challenge gaps and strategic priorities', ar: 'إنشاء خطة دعوات بحثية محسنة بناءً على فجوات التحديات والأولويات الاستراتيجية' })}
              </p>
            </div>
            <Button onClick={generatePortfolioPlan} disabled={loading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Plan', ar: 'إنشاء خطة' })}
            </Button>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'TRL Distribution', ar: 'توزيع المستوى التقني' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trlData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trl" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Impact vs Budget', ar: 'التأثير مقابل الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="budget" name="Budget (K SAR)" />
                <YAxis dataKey="impact" name="Impact Score" />
                <ZAxis dataKey="trl" range={[50, 400]} name="TRL" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Projects" data={portfolioScatter} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations && (
        <div className="space-y-6">
          {/* Recommended Calls */}
          {aiRecommendations.recommended_calls?.length > 0 && (
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Target className="h-5 w-5" />
                  {t({ en: 'Recommended R&D Calls', ar: 'الدعوات البحثية الموصى بها' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiRecommendations.recommended_calls.map((call, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-white border-2 border-green-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? call.title_ar : call.title_en}
                          </p>
                          <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? call.focus_area_ar : call.focus_area_en}
                          </p>
                        </div>
                        <Badge className={call.priority === 'high' ? 'bg-red-600' : call.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}>
                          {call.priority}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="p-2 bg-white rounded border text-center">
                          <p className="text-xs text-slate-500">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                          <p className="font-bold text-blue-600">{(call.budget / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="p-2 bg-white rounded border text-center">
                          <p className="text-xs text-slate-500">{t({ en: 'Timeline', ar: 'الجدول' })}</p>
                          <p className="font-medium text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? call.timeline_ar : call.timeline_en}
                          </p>
                        </div>
                        <div className="p-2 bg-white rounded border text-center">
                          <p className="text-xs text-slate-500">{t({ en: 'Expected', ar: 'متوقع' })}</p>
                          <p className="font-bold text-green-600">{call.expected_projects}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Research Themes */}
          {aiRecommendations.research_themes?.length > 0 && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <TrendingUp className="h-5 w-5" />
                  {t({ en: 'Budget by Research Theme', ar: 'الميزانية حسب محور البحث' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRecommendations.research_themes.map((theme, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? theme.theme_ar : theme.theme_en}
                        </p>
                        <Badge>{theme.budget_percentage}%</Badge>
                      </div>
                      <Progress value={theme.budget_percentage} className="h-2" />
                      <p className="text-sm text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? theme.rationale_ar : theme.rationale_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Balance */}
          {aiRecommendations.portfolio_balance && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
              <CardHeader>
                <CardTitle>{t({ en: 'Portfolio Balance Strategy', ar: 'استراتيجية توازن المحفظة' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-white rounded-lg border-2 border-blue-300 text-center">
                    <p className="text-sm text-slate-600 mb-1">{t({ en: 'Short-term (1-2y)', ar: 'قصير المدى (1-2 سنة)' })}</p>
                    <p className="text-4xl font-bold text-blue-600">{aiRecommendations.portfolio_balance.short_term_percentage}%</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border-2 border-purple-300 text-center">
                    <p className="text-sm text-slate-600 mb-1">{t({ en: 'Long-term (3-5y)', ar: 'طويل المدى (3-5 سنوات)' })}</p>
                    <p className="text-4xl font-bold text-purple-600">{aiRecommendations.portfolio_balance.long_term_percentage}%</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? aiRecommendations.portfolio_balance.justification_ar : aiRecommendations.portfolio_balance.justification_en}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Current Portfolio */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Current R&D Portfolio', ar: 'محفظة البحث الحالية' })}</CardTitle>
            <Link to={createPageUrl('RDCallCreate')}>
              <Button>
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'New R&D Call', ar: 'دعوة بحثية جديدة' })}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rdProjects.slice(0, 6).map((project) => (
              <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                <div className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <Badge variant="outline" className="mb-2">{project.code}</Badge>
                  <p className="font-medium text-slate-900 mb-2 line-clamp-2">
                    {language === 'ar' ? project.title_ar : project.title_en}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge className="bg-blue-100 text-blue-700">TRL {project.trl_current || project.trl_start}</Badge>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RDPortfolioPlanner, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead', 'R&D Manager'] });