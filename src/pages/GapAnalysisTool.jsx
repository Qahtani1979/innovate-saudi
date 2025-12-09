import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, AlertTriangle, TrendingUp, Target, Loader2, Plus, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function GapAnalysisTool() {
  const { language, isRTL, t } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const { invokeAI, status, isLoading: analyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const runGapAnalysis = async () => {
    const sectorData = sectors.map(s => ({
      sector: s.name_en,
      challenges: challenges.filter(c => c.sector === s.code).length,
      pilots: pilots.filter(p => p.sector === s.code).length,
      solutions: solutions.filter(sol => sol.sectors?.includes(s.code)).length
    }));

    const result = await invokeAI({
      prompt: `Perform COMPREHENSIVE gap analysis for Saudi municipal innovation ecosystem:

CURRENT PORTFOLIO:
${JSON.stringify(sectorData, null, 2)}

DETAILED METRICS:
- Total Challenges: ${challenges.length} (Approved: ${challenges.filter(c => c.status === 'approved').length}, High Priority: ${challenges.filter(c => c.priority === 'tier_1').length})
- Total Pilots: ${pilots.length} (Active: ${pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length}, At Risk: ${pilots.filter(p => p.risk_level === 'high').length})
- Total Solutions: ${solutions.length} (Market-ready: ${solutions.filter(s => s.maturity_level === 'market_ready' || s.maturity_level === 'proven').length})
- Total R&D Projects: ${rdProjects.length}

Identify in BOTH English and Arabic:

1. **Underserved Sectors** (high challenges but low solutions/pilots)
2. **Innovation Gaps** (missing capabilities, solution types, or approaches)
3. **Geographic Gaps** (municipalities/regions with limited activity)
4. **Technology Gaps** (emerging tech not yet piloted: AI, IoT, blockchain, digital twins, etc.)
5. **Capacity Gaps** (missing expertise, infrastructure, labs, sandboxes)
6. **Skills & Talent Gaps** (expertise areas needed but missing)
7. **Partnership Gaps** (underutilized collaborations: academia, private sector, international)
8. **Budget Gaps** (underfunded critical sectors vs overfunded low-priority)
9. **Timeline Gaps** (initiatives with no near-term execution plans)
10. **Service Quality Gaps** (municipal services with low performance/satisfaction)

For EACH gap provide:
- Severity (high/medium/low)
- Specific actionable recommendations
- Quick wins vs long-term strategies
- Resource/budget estimates

Include USE CASE scenarios:
- "Plan next R&D call based on these gaps"
- "Identify urgent intervention areas for next quarter"
- "Compare gap evolution: are we improving?"`,
        response_json_schema: {
          type: 'object',
          properties: {
            underserved_sectors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sector_en: { type: 'string' },
                  sector_ar: { type: 'string' },
                  severity: { type: 'string' },
                  gap_description_en: { type: 'string' },
                  gap_description_ar: { type: 'string' },
                  recommendation_en: { type: 'string' },
                  recommendation_ar: { type: 'string' }
                }
              }
            },
            innovation_gaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  gap_type_en: { type: 'string' },
                  gap_type_ar: { type: 'string' },
                  severity: { type: 'string' },
                  description_en: { type: 'string' },
                  description_ar: { type: 'string' },
                  action_en: { type: 'string' },
                  action_ar: { type: 'string' }
                }
              }
            },
            technology_gaps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  technology_en: { type: 'string' },
                  technology_ar: { type: 'string' },
                  potential_impact_en: { type: 'string' },
                  potential_impact_ar: { type: 'string' }
                }
              }
            },
            priority_actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action_en: { type: 'string' },
                  action_ar: { type: 'string' },
                  priority: { type: 'string' },
                  expected_impact_en: { type: 'string' },
                  expected_impact_ar: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    if (result.success) {
      setAiAnalysis(result.data);
      toast.success(t({ en: 'Gap analysis complete', ar: 'اكتمل تحليل الفجوات' }));
    }
  };

  const sectorCoverage = sectors.map(s => ({
    sector: language === 'ar' ? s.name_ar : s.name_en,
    challenges: challenges.filter(c => c.sector === s.code).length,
    pilots: pilots.filter(p => p.sector === s.code).length,
    solutions: solutions.filter(sol => sol.sectors?.includes(s.code)).length
  })).slice(0, 8);

  const severityColors = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-green-100 text-green-700 border-green-300'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🔍 Gap Analysis Tool', ar: '🔍 أداة تحليل الفجوات' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'AI-powered discovery of innovation gaps and opportunities', ar: 'اكتشاف الفجوات والفرص بالذكاء الاصطناعي' })}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{challenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{pilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'تجارب' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">{solutions.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Solutions', ar: 'حلول' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-amber-600">{rdProjects.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'R&D Projects', ar: 'مشاريع بحثية' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Run Analysis */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900 mb-1 text-lg">
                {t({ en: 'AI Gap Analysis', ar: 'تحليل الفجوات بالذكاء الاصطناعي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Comprehensive analysis of portfolio gaps, underserved sectors, and strategic opportunities',
                  ar: 'تحليل شامل لفجوات المحفظة والقطاعات غير المخدومة والفرص الاستراتيجية'
                })}
              </p>
            </div>
            <Button onClick={runGapAnalysis} disabled={analyzing || !isAvailable} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {analyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Run Analysis', ar: 'تشغيل التحليل' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Sector Coverage', ar: 'تغطية القطاعات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="challenges" fill="#ef4444" name="Challenges" />
                <Bar dataKey="pilots" fill="#3b82f6" name="Pilots" />
                <Bar dataKey="solutions" fill="#10b981" name="Solutions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Portfolio Balance', ar: 'توازن المحفظة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={sectorCoverage.slice(0, 6)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="sector" />
                <PolarRadiusAxis />
                <Radar name="Challenges" dataKey="challenges" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                <Radar name="Solutions" dataKey="solutions" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="space-y-6">
          {/* Underserved Sectors */}
          {aiAnalysis.underserved_sectors?.length > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertTriangle className="h-5 w-5" />
                  {t({ en: 'Underserved Sectors', ar: 'القطاعات غير المخدومة' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.underserved_sectors.map((gap, idx) => (
                    <div key={idx} className={`p-4 border-2 rounded-lg ${severityColors[gap.severity]}`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-slate-900">
                          {language === 'ar' ? gap.sector_ar : gap.sector_en}
                        </p>
                        <Badge className={gap.severity === 'high' ? 'bg-red-600' : gap.severity === 'medium' ? 'bg-yellow-600' : 'bg-green-600'}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? gap.gap_description_ar : gap.gap_description_en}
                      </p>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-xs font-medium text-slate-600 mb-1">
                          {t({ en: '💡 Recommendation:', ar: '💡 التوصية:' })}
                        </p>
                        <p className="text-sm text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? gap.recommendation_ar : gap.recommendation_en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Innovation Gaps */}
          {aiAnalysis.innovation_gaps?.length > 0 && (
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Target className="h-5 w-5" />
                  {t({ en: 'Innovation Gaps', ar: 'فجوات الابتكار' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiAnalysis.innovation_gaps.map((gap, idx) => (
                    <div key={idx} className={`p-4 border-2 rounded-lg ${severityColors[gap.severity]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-slate-900">
                          {language === 'ar' ? gap.gap_type_ar : gap.gap_type_en}
                        </p>
                        <Badge variant="outline">{gap.severity}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? gap.description_ar : gap.description_en}
                      </p>
                      <div className="p-2 bg-white rounded text-xs text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        → {language === 'ar' ? gap.action_ar : gap.action_en}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Geographic Gaps */}
          {aiAnalysis.geographic_gaps?.length > 0 && (
            <Card className="border-2 border-cyan-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-cyan-900">
                  <Target className="h-5 w-5" />
                  {t({ en: 'Geographic Gaps', ar: 'الفجوات الجغرافية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.geographic_gaps.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                      <p className="font-semibold text-slate-900 mb-2">
                        {language === 'ar' ? gap.region_ar : gap.region_en}
                      </p>
                      <p className="text-sm text-slate-600 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? gap.gap_description_ar : gap.gap_description_en}
                      </p>
                      <div className="p-2 bg-white rounded text-xs">
                        → {language === 'ar' ? gap.recommendation_ar : gap.recommendation_en}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technology Gaps */}
          {aiAnalysis.technology_gaps?.length > 0 && (
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <TrendingUp className="h-5 w-5" />
                  {t({ en: 'Technology Gaps', ar: 'الفجوات التقنية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiAnalysis.technology_gaps.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="font-semibold text-purple-900 mb-2">
                        {language === 'ar' ? gap.technology_ar : gap.technology_en}
                      </p>
                      <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? gap.potential_impact_ar : gap.potential_impact_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills & Talent Gaps */}
          {aiAnalysis.skills_gaps?.length > 0 && (
            <Card className="border-2 border-pink-200">
              <CardHeader>
                <CardTitle className="text-pink-900">{t({ en: 'Skills & Talent Gaps', ar: 'فجوات المهارات والمواهب' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {aiAnalysis.skills_gaps.map((gap, idx) => (
                    <div key={idx} className={`p-4 border-2 rounded-lg ${severityColors[gap.severity]}`}>
                      <p className="font-semibold text-slate-900 mb-2">
                        {language === 'ar' ? gap.skill_area_ar : gap.skill_area_en}
                      </p>
                      <p className="text-sm text-slate-600" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? gap.recommendation_ar : gap.recommendation_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Partnership Gaps */}
          {aiAnalysis.partnership_gaps?.length > 0 && (
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-900">{t({ en: 'Partnership & Collaboration Gaps', ar: 'فجوات الشراكة والتعاون' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.partnership_gaps.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <p className="font-semibold text-slate-900 mb-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? gap.gap_ar : gap.gap_en}
                      </p>
                      <div className="p-2 bg-white rounded text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        💡 {language === 'ar' ? gap.opportunity_ar : gap.opportunity_en}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Use Case Scenarios */}
          {aiAnalysis.use_case_scenarios?.length > 0 && (
            <Card className="border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-blue-900">{t({ en: '🎯 Actionable Use Cases', ar: '🎯 حالات الاستخدام القابلة للتنفيذ' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiAnalysis.use_case_scenarios.map((scenario, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-blue-200 rounded-lg">
                      <p className="font-bold text-blue-900 mb-3 text-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? scenario.scenario_ar : scenario.scenario_en}
                      </p>
                      <div className="p-3 bg-blue-50 rounded">
                        <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? scenario.action_plan_ar : scenario.action_plan_en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority Actions */}
          {aiAnalysis.priority_actions?.length > 0 && (
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Target className="h-5 w-5" />
                  {t({ en: 'Priority Actions', ar: 'الإجراءات ذات الأولوية' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiAnalysis.priority_actions.map((action, idx) => (
                    <div key={idx} className="p-4 bg-white border-2 border-green-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <p className="font-semibold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? action.action_ar : action.action_en}
                          </p>
                        </div>
                        <Badge className={action.priority === 'high' ? 'bg-red-600' : action.priority === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'}>
                          {action.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-2 pl-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? action.expected_impact_ar : action.expected_impact_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!aiAnalysis && (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {t({ en: 'Click "Run Analysis" to discover gaps and opportunities', ar: 'انقر على "تشغيل التحليل" لاكتشاف الفجوات والفرص' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(GapAnalysisTool, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead'] });