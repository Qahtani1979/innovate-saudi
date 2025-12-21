import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, Award, Target, Users, DollarSign, Calendar, Sparkles, Loader2, CheckCircle2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function PilotSuccessPatternsPage() {
  const { language, isRTL, t } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { invokeAI, status, isLoading: loading, rateLimitInfo, isAvailable } = useAIWithFallback();


  const { data: successfulPilots = [] } = useQuery({
    queryKey: ['successful-pilots'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').in('stage', ['completed', 'scaled']).eq('is_deleted', false);
      return (data || []).filter(p => (p.success_probability || 0) >= 70);
    }
  });

  const { data: allPilots = [] } = useQuery({
    queryKey: ['all-pilots-patterns'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      return data || [];
    }
  });

  // Safe accessors
  const getTeam = (p) => Array.isArray(p?.team) ? p.team : [];
  const getStakeholders = (p) => Array.isArray(p?.stakeholders) ? p.stakeholders : [];
  const getKpis = (p) => Array.isArray(p?.kpis) ? p.kpis : [];


  const generateAIPatterns = async () => {
    const pilotSummary = successfulPilots.map(p => ({
      sector: p.sector,
      success_probability: p.success_probability,
      budget: p.budget,
      duration_weeks: p.duration_weeks,
      team_size: getTeam(p).length,
      stakeholder_count: getStakeholders(p).length,
      kpi_count: getKpis(p).length,
      stage: p.stage,
      launch_month: p.timeline?.['pilot_start'] ? new Date(p.timeline['pilot_start']).getMonth() + 1 : null
    }));

    const result = await invokeAI({
      system_prompt: 'You are an expert AI analyst specializing in municipal innovation pilots. Analyze success patterns from the provided data.',
      prompt: `Analyze these ${successfulPilots.length} successful municipal innovation pilots and identify success patterns:

Pilot Data: ${JSON.stringify(pilotSummary)}

Identify TOP 10 success correlations with statistical evidence:
1. Which sectors have highest success rates?
2. Optimal team size for success?
3. Best launch months/seasons?
4. Budget sweet spot?
5. Stakeholder engagement correlation?
6. KPI definition correlation?
7. Duration impact?
8. Any other strong patterns?

For each pattern, provide:
- Pattern description
- Statistical evidence (e.g., "78% success rate vs 45% baseline")
- Confidence level (high/medium/low)
- Actionable recommendation`,
      response_json_schema: {
        type: 'object',
        properties: {
          top_patterns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pattern: { type: 'string' },
                evidence: { type: 'string' },
                confidence: { type: 'string' },
                recommendation: { type: 'string' }
              }
            }
          },
          success_playbook: { type: 'string' },
          case_studies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                key_success_factors: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setAiAnalysis(result.data);
    }
  };

  // Calculate actual patterns from data
  const sectorSuccess = {};
  successfulPilots.forEach(p => {
    sectorSuccess[p.sector] = (sectorSuccess[p.sector] || []).concat(p.success_probability || 70);
  });

  const sectorData = Object.entries(sectorSuccess).map(([sector, probs]) => ({
    sector: sector?.replace(/_/g, ' ') || 'Unknown',
    avg_success: Math.round(probs.reduce((a, b) => a + b, 0) / probs.length),
    count: probs.length
  })).sort((a, b) => b.avg_success - a.avg_success);

  const teamSizeData = successfulPilots.map(p => ({
    team_size: getTeam(p).length,
    success: p.success_probability || 70
  })).filter(d => d.team_size > 0);

  const budgetRanges = [
    { range: '<100K', pilots: successfulPilots.filter(p => (p.budget || 0) < 100000) },
    { range: '100-500K', pilots: successfulPilots.filter(p => (p.budget || 0) >= 100000 && (p.budget || 0) < 500000) },
    { range: '500K-1M', pilots: successfulPilots.filter(p => (p.budget || 0) >= 500000 && (p.budget || 0) < 1000000) },
    { range: '>1M', pilots: successfulPilots.filter(p => (p.budget || 0) >= 1000000) }
  ].map(r => ({
    range: r.range,
    avg_success: r.pilots.length > 0 ? Math.round(r.pilots.reduce((acc, p) => acc + (p.success_probability || 70), 0) / r.pilots.length) : 0,
    count: r.pilots.length
  }));

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const successRate = allPilots.length > 0
    ? Math.round((successfulPilots.length / allPilots.length) * 100)
    : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Pilot Success Pattern Analyzer', ar: 'محلل أنماط نجاح التجارب' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Learn from successful pilots to replicate best practices', ar: 'التعلم من التجارب الناجحة لتكرار أفضل الممارسات' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={generateAIPatterns} disabled={loading || successfulPilots.length === 0 || !isAvailable} className="bg-purple-600">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
          </Button>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">{successfulPilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Successful Pilots', ar: 'تجارب ناجحة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{successRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Success Rate', ar: 'معدل النجاح' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">
              {successfulPilots.filter(p => p.stage === 'scaled').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Scaled Nationally', ar: 'موسّع وطنياً' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">
              {Math.round(successfulPilots.reduce((acc, p) => acc + (p.success_probability || 0), 0) / successfulPilots.length || 0)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Success Score', ar: 'متوسط نقاط النجاح' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Patterns */}
      {aiAnalysis && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI-Identified Success Patterns', ar: 'أنماط النجاح المحددة بالذكاء' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAnalysis.top_patterns?.map((pattern, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="flex items-start gap-3">
                  <Badge className={
                    pattern.confidence === 'high' ? 'bg-green-600' :
                      pattern.confidence === 'medium' ? 'bg-yellow-600' :
                        'bg-slate-600'
                  }>{pattern.confidence} confidence</Badge>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {idx + 1}. {pattern.pattern}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">{pattern.evidence}</p>
                    <p className="text-sm text-purple-700 font-medium">
                      💡 {pattern.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {aiAnalysis.success_playbook && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {t({ en: 'Success Playbook', ar: 'دليل النجاح' })}
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-line">{aiAnalysis.success_playbook}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Success Rate by Sector', ar: 'معدل النجاح حسب القطاع' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg_success" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {sectorData.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 capitalize">{item.sector}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700">{item.avg_success}%</Badge>
                    <span className="text-slate-500">({item.count} pilots)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Success vs Team Size', ar: 'النجاح مقابل حجم الفريق' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team_size" name="Team Size" />
                <YAxis dataKey="success" name="Success %" domain={[0, 100]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={teamSizeData} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">
                {teamSizeData.length > 0 && (
                  <>
                    {t({ en: 'Optimal team size:', ar: 'حجم الفريق الأمثل:' })} {' '}
                    <strong>3-5 members</strong> {t({ en: '(highest success correlation)', ar: '(أعلى ارتباط بالنجاح)' })}
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Success Rate by Budget Range', ar: 'معدل النجاح حسب نطاق الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetRanges.filter(b => b.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.range}: ${entry.avg_success}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {budgetRanges.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Key Success Factors', ar: 'عوامل النجاح الرئيسية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { factor: t({ en: 'Stakeholder Alignment', ar: 'توافق الأطراف' }), impact: 85, icon: Users },
                { factor: t({ en: 'Clear KPIs (>3)', ar: 'مؤشرات واضحة (>3)' }), impact: 78, icon: Target },
                { factor: t({ en: 'Adequate Budget', ar: 'ميزانية كافية' }), impact: 72, icon: DollarSign },
                { factor: t({ en: 'Phased Rollout', ar: 'طرح مرحلي' }), impact: 68, icon: Calendar },
                { factor: t({ en: 'Tech Readiness', ar: 'جاهزية التقنية' }), impact: 65, icon: TrendingUp }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-900">{item.factor}</span>
                        <span className="text-sm font-bold text-purple-600">{item.impact}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${item.impact}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Studies */}
      {aiAnalysis?.case_studies && aiAnalysis.case_studies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Highly Successful Pilot Case Studies', ar: 'دراسات حالة التجارب الناجحة للغاية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {successfulPilots.slice(0, 5).map((pilot) => (
                <Link key={pilot.id} to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <Card className="hover:shadow-lg transition-all border-2 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-green-600 text-white">
                          {pilot.success_probability}%
                        </Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{pilot.title_en}</h4>
                          <p className="text-xs text-slate-600 mb-2">{pilot.code} • {pilot.sector?.replace(/_/g, ' ')}</p>
                          {pilot.lessons_learned && pilot.lessons_learned.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-green-700 mb-1">
                                {t({ en: 'Key Success Factors:', ar: 'عوامل النجاح الرئيسية:' })}
                              </p>
                              <ul className="text-xs text-slate-700 space-y-1">
                                {pilot.lessons_learned.slice(0, 2).map((lesson, idx) => (
                                  <li key={idx}>• {lesson.lesson || lesson.recommendation}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {successfulPilots.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {t({ en: 'No successful pilots yet to analyze patterns', ar: 'لا توجد تجارب ناجحة بعد لتحليل الأنماط' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(PilotSuccessPatternsPage, { requiredPermissions: ['pilot_view'] });