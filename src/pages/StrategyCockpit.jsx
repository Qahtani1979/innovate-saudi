import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Target, TrendingUp, Users, Zap, AlertTriangle, CheckCircle2, Sparkles, Loader2, X, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ResourceAllocationView from '../components/strategy/ResourceAllocationView';
import PartnershipNetwork from '../components/strategy/PartnershipNetwork';
import BottleneckDetector from '../components/strategy/BottleneckDetector';
import StrategyToProgramGenerator from '../components/strategy/StrategyToProgramGenerator';
import StrategicGapProgramRecommender from '../components/strategy/StrategicGapProgramRecommender';
import StrategicCoverageWidget from '../components/strategy/StrategicCoverageWidget';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useStrategicKPI } from '@/hooks/useStrategicKPI';

function StrategyCockpitPage() {
  const { language, isRTL, t } = useLanguage();
  const [showAIInsights, setShowAIInsights] = React.useState(false);
  const [aiInsights, setAiInsights] = React.useState(null);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: trendData = [] } = useQuery({
    queryKey: ['strategy-trends'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trend_entries').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solutions').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rd_projects').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programs').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.from('strategic_plans').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const roadmapData = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'].map(quarter => ({
    quarter,
    challenges: trendData.filter(t => t.period === quarter && t.metric_name === 'challenges_count')[0]?.metric_value || 0,
    pilots: trendData.filter(t => t.period === quarter && t.metric_name === 'pilots_count')[0]?.metric_value || 0,
    scaled: trendData.filter(t => t.period === quarter && t.metric_name === 'scaled_count')[0]?.metric_value || 0,
  }));

  const sectors = ['urban_design', 'transport', 'environment', 'digital_services'];
  const portfolioHeatmap = sectors.map(sector => ({
    sector: sector.replace(/_/g, ' '),
    discover: challenges.filter(c => c.sector === sector && c.status === 'draft').length,
    validate: challenges.filter(c => c.sector === sector && c.status === 'under_review').length,
    pilot: pilots.filter(p => p.sector === sector && p.stage === 'in_progress').length,
    scale: pilots.filter(p => p.sector === sector && p.stage === 'scaled').length,
  }));

  const capacityData = [
    { indicator: 'Training', value: trendData.find(t => t.metric_name === 'training_completion')?.metric_value || 75 },
    { indicator: 'Tools', value: trendData.find(t => t.metric_name === 'tools_adoption')?.metric_value || 85 },
    { indicator: 'Network', value: trendData.find(t => t.metric_name === 'network_strength')?.metric_value || 68 },
    { indicator: 'Budget', value: trendData.find(t => t.metric_name === 'budget_utilization')?.metric_value || 90 },
    { indicator: 'Skills', value: trendData.find(t => t.metric_name === 'skills_readiness')?.metric_value || 72 },
  ];

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    try {
      const result = await invokeAI({
        prompt: `Analyze this strategic portfolio for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Challenges: ${challenges.length}
Active Pilots: ${pilots.filter(p => p.stage === 'in_progress').length}
Completed: ${pilots.filter(p => p.stage === 'completed').length}
At Risk: ${pilots.filter(p => p.risk_level === 'high').length}

Portfolio by Sector: ${JSON.stringify(portfolioHeatmap)}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Strategic focus recommendations for next quarter
2. Portfolio balance and diversification analysis
3. Risk mitigation priorities
4. Acceleration opportunities
5. Resource reallocation suggestions`,
        response_json_schema: {
          type: 'object',
          properties: {
            strategic_focus: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            portfolio_balance: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            risk_priorities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            acceleration_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            resource_reallocation: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });
      if (result.success) {
        setAiInsights(result.data);
      } else {
        toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Strategy Cockpit', ar: 'لوحة الاستراتيجية' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Strategic planning and portfolio management', ar: 'التخطيط الاستراتيجي وإدارة المحفظة' })}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleAIInsights}>
          <Sparkles className="h-4 w-4" />
          {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
        </Button>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing strategy...', ar: 'جاري تحليل الاستراتيجية...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.strategic_focus?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Strategic Focus', ar: 'التركيز الاستراتيجي' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.strategic_focus.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.portfolio_balance?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Portfolio Balance', ar: 'توازن المحفظة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.portfolio_balance.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.risk_priorities?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Risk Priorities', ar: 'أولويات المخاطر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.risk_priorities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.acceleration_opportunities?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Acceleration', ar: 'التسريع' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.acceleration_opportunities.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.resource_reallocation?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Resource Reallocation', ar: 'إعادة تخصيص الموارد' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.resource_reallocation.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Full Pipeline Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Discover', ar: 'اكتشاف' })}</p>
            <p className="text-2xl font-bold text-slate-600">{challenges.filter(c => c.status === 'draft' || c.status === 'submitted').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Validate', ar: 'تحقق' })}</p>
            <p className="text-2xl font-bold text-blue-600">{challenges.filter(c => c.status === 'under_review').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Experiment', ar: 'تجربة' })}</p>
            <p className="text-2xl font-bold text-purple-600">{rdProjects.filter(r => r.status === 'active').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Pilot', ar: 'تجريب' })}</p>
            <p className="text-2xl font-bold text-green-600">{pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Scale', ar: 'توسع' })}</p>
            <p className="text-2xl font-bold text-orange-600">{pilots.filter(p => p.stage === 'scaled').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{t({ en: 'Institutionalize', ar: 'مأسسة' })}</p>
            <p className="text-2xl font-bold text-teal-600">{solutions.filter(s => s.maturity_level === 'proven').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Portfolio Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Challenges', ar: 'إجمالي التحديات' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{challenges.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {pilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {pilots.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {pilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Innovation Roadmap', ar: 'خارطة الطريق' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={roadmapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="challenges" stroke="#3b82f6" name="Challenges" />
                <Line type="monotone" dataKey="pilots" stroke="#10b981" name="Pilots" />
                <Line type="monotone" dataKey="scaled" stroke="#f59e0b" name="Scaled" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Capacity Metrics', ar: 'مؤشرات القدرات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={capacityData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="indicator" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Portfolio Heatmap', ar: 'خريطة المحفظة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={portfolioHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="discover" stackId="a" fill="#94a3b8" name="Discover" />
              <Bar dataKey="validate" stackId="a" fill="#3b82f6" name="Validate" />
              <Bar dataKey="pilot" stackId="a" fill="#10b981" name="Pilot" />
              <Bar dataKey="scale" stackId="a" fill="#f59e0b" name="Scale" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Budget Utilization', ar: 'استخدام الميزانية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t({ en: 'Pilots Budget', ar: 'ميزانية التجارب' })}</span>
                <span className="font-bold">{(pilots.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1)}M SAR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t({ en: 'R&D Budget', ar: 'ميزانية البحث' })}</span>
                <span className="font-bold">{(rdProjects.reduce((sum, r) => sum + (r.budget || 0), 0) / 1000000).toFixed(1)}M SAR</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{t({ en: 'Programs Budget', ar: 'ميزانية البرامج' })}</span>
                <span className="font-bold">{(programs.reduce((sum, p) => sum + (p.funding_details?.total_pool || 0), 0) / 1000000).toFixed(1)}M SAR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Strategic Plan Execution', ar: 'تنفيذ الخطة الاستراتيجية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {strategicPlans.length > 0 ? (
              <div className="space-y-3">
                {strategicPlans.slice(0, 2).map(plan => (
                  <div key={plan.id} className="p-3 border rounded-lg">
                    <p className="font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      {language === 'ar' ? plan.name_ar : plan.name_en}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{plan.start_year} - {plan.end_year}</Badge>
                      <Badge className={plan.status === 'active' ? 'bg-green-600' : 'bg-blue-600'}>{plan.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                {t({ en: 'No strategic plan active', ar: 'لا توجد خطة استراتيجية نشطة' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* NEW: Strategic Coverage Widget */}
      <StrategicCoverageWidget />

      <ResourceAllocationView />

      <PartnershipNetwork />

      <BottleneckDetector />

      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Strategic Insights', ar: 'رؤى استراتيجية ذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-green-700">
              ✓ {t({ en: 'Portfolio is well-balanced across sectors', ar: 'المحفظة متوازنة عبر القطاعات' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-yellow-700">
              ⚠ {t({ en: 'Environment sector has low pilot conversion rate', ar: 'قطاع البيئة لديه معدل تحويل منخفض' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-blue-700">
              💡 {t({ en: 'Recommend focusing on scaling successful digital pilots', ar: 'نوصي بالتركيز على توسيع التجارب الرقمية الناجحة' })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategyCockpitPage, { requiredPermissions: [] });