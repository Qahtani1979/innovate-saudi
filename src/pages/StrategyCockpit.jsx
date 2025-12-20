import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { useActivePlan } from '@/contexts/StrategicPlanContext';
import { 
  Target, AlertTriangle, CheckCircle2, 
  Sparkles, Loader2, X, ArrowRight, Clock,
  ExternalLink, ChevronRight, BarChart3, DollarSign, Layers, Eye, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import ResourceAllocationView from '../components/strategy/ResourceAllocationView';
import PartnershipNetwork from '../components/strategy/PartnershipNetwork';
import BottleneckDetector from '../components/strategy/BottleneckDetector';
import StrategicCoverageWidget from '../components/strategy/StrategicCoverageWidget';
import ActivePlanBanner from '@/components/strategy/ActivePlanBanner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';

function StrategyCockpitPage() {
  const { language, isRTL, t } = useLanguage();
  const { activePlanId, activePlan, strategicPlans } = useActivePlan();
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, isLoading: aiLoading } = useAIWithFallback();
  
  // Use activePlanId from context, default to 'all' for filtering
  const selectedPlanId = activePlanId || 'all';

  const { data: trendData = [] } = useQuery({
    queryKey: ['strategy-trends'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trend_entries').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-cockpit'],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-cockpit'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-cockpit'],
    queryFn: async () => {
      const { data, error } = await supabase.from('solutions').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-cockpit'],
    queryFn: async () => {
      const { data, error } = await supabase.from('rd_projects').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-cockpit'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programs').select('*').eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Use strategicPlans from context - avoid duplicate query
  // Note: Additional local filtering for cockpit-specific needs can be done here
  const cockpitPlans = strategicPlans.filter(p => !p.is_deleted);

  const { data: approvals = [] } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('approval_status', 'pending')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  // Filter data by selected strategic plan
  const filteredChallenges = selectedPlanId === 'all' 
    ? challenges 
    : challenges.filter(c => c.strategic_plan_ids?.includes(selectedPlanId));
  
  const filteredPilots = selectedPlanId === 'all'
    ? pilots
    : pilots.filter(p => p.strategic_plan_ids?.includes(selectedPlanId));

  const filteredPrograms = selectedPlanId === 'all'
    ? programs
    : programs.filter(p => p.strategic_plan_ids?.includes(selectedPlanId));

  const roadmapData = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'].map(quarter => ({
    quarter,
    challenges: trendData.filter(t => t.period === quarter && t.metric_name === 'challenges_count')[0]?.metric_value || 0,
    pilots: trendData.filter(t => t.period === quarter && t.metric_name === 'pilots_count')[0]?.metric_value || 0,
    scaled: trendData.filter(t => t.period === quarter && t.metric_name === 'scaled_count')[0]?.metric_value || 0,
  }));

  const sectors = ['urban_design', 'transport', 'environment', 'digital_services'];
  const portfolioHeatmap = sectors.map(sector => ({
    sector: sector.replace(/_/g, ' '),
    discover: filteredChallenges.filter(c => c.sector === sector && c.status === 'draft').length,
    validate: filteredChallenges.filter(c => c.sector === sector && c.status === 'under_review').length,
    pilot: filteredPilots.filter(p => p.sector === sector && p.stage === 'in_progress').length,
    scale: filteredPilots.filter(p => p.sector === sector && p.stage === 'scaled').length,
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
        prompt: `Analyze this strategic portfolio for Saudi municipal innovation and provide strategic insights:

Challenges: ${filteredChallenges.length}
Active Pilots: ${filteredPilots.filter(p => p.stage === 'in_progress').length}
Completed: ${filteredPilots.filter(p => p.stage === 'completed').length}
At Risk: ${filteredPilots.filter(p => p.risk_level === 'high').length}
Programs: ${filteredPrograms.length}

Portfolio by Sector: ${JSON.stringify(portfolioHeatmap)}

Provide insights in format:
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

  // Metric card with drill-down
  const MetricCard = ({ title, value, icon: Icon, color, bgColor, link, subtext }) => (
    <Card className={`${bgColor} hover:shadow-md transition-shadow cursor-pointer group`}>
      <Link to={link}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{t(title)}</p>
              <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
              {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Icon className={`h-8 w-8 ${color}`} />
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  // Pipeline stage card with drill-down
  const PipelineCard = ({ label, count, bgColor, textColor, link }) => (
    <Link to={link}>
      <Card className={`${bgColor} hover:shadow-md transition-all cursor-pointer group`}>
        <CardContent className="pt-4 text-center">
          <p className="text-xs text-slate-500 mb-1">{t(label)}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
          <ExternalLink className="h-3 w-3 mx-auto mt-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6 container mx-auto py-6 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <ActivePlanBanner />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Strategy Cockpit', ar: 'لوحة الاستراتيجية' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Real-time strategic monitoring & decision support', ar: 'المراقبة الاستراتيجية الفورية ودعم القرار' })}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleAIInsights}>
          <Sparkles className="h-4 w-4" />
          {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
        </Button>
      </div>

      {/* Quick Actions Bar */}
      {approvals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-800">
                  {t({ en: `${approvals.length} pending approval(s) require attention`, ar: `${approvals.length} موافقة(ات) معلقة تتطلب الاهتمام` })}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/approvals">
                  {t({ en: 'Review All', ar: 'مراجعة الكل' })}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Panel */}
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
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>
                  {t({ en: 'Analyzing strategy...', ar: 'جاري تحليل الاستراتيجية...' })}
                </span>
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
            ) : (
              <p className="text-center text-slate-500 py-4">
                {t({ en: 'Click "AI Insights" to generate analysis', ar: 'انقر على "رؤى ذكية" لتوليد التحليل' })}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Full Innovation Pipeline with drill-downs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <PipelineCard 
          label={{ en: 'Discover', ar: 'اكتشاف' }}
          count={filteredChallenges.filter(c => c.status === 'draft' || c.status === 'submitted').length}
          bgColor="bg-gradient-to-br from-slate-50 to-white"
          textColor="text-slate-600"
          link="/Challenges?status=draft"
        />
        <PipelineCard 
          label={{ en: 'Validate', ar: 'تحقق' }}
          count={filteredChallenges.filter(c => c.status === 'under_review').length}
          bgColor="bg-gradient-to-br from-blue-50 to-white"
          textColor="text-blue-600"
          link="/Challenges?status=under_review"
        />
        <PipelineCard 
          label={{ en: 'Experiment', ar: 'تجربة' }}
          count={rdProjects.filter(r => r.status === 'active').length}
          bgColor="bg-gradient-to-br from-purple-50 to-white"
          textColor="text-purple-600"
          link="/rd-projects?status=active"
        />
        <PipelineCard 
          label={{ en: 'Pilot', ar: 'تجريب' }}
          count={filteredPilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length}
          bgColor="bg-gradient-to-br from-green-50 to-white"
          textColor="text-green-600"
          link="/Pilots?stage=active"
        />
        <PipelineCard 
          label={{ en: 'Scale', ar: 'توسع' }}
          count={filteredPilots.filter(p => p.stage === 'scaled').length}
          bgColor="bg-gradient-to-br from-orange-50 to-white"
          textColor="text-orange-600"
          link="/Pilots?stage=scaled"
        />
        <PipelineCard 
          label={{ en: 'Institutionalize', ar: 'مأسسة' }}
          count={solutions.filter(s => s.maturity_level === 'proven').length}
          bgColor="bg-gradient-to-br from-teal-50 to-white"
          textColor="text-teal-600"
          link="/Solutions?maturity=proven"
        />
      </div>

      {/* Key Portfolio Metrics with drill-downs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          title={{ en: 'Total Challenges', ar: 'إجمالي التحديات' }}
          value={filteredChallenges.length}
          icon={Target}
          color="text-blue-600"
          bgColor="bg-gradient-to-br from-blue-50 to-white"
          link="/Challenges"
        />
        <MetricCard 
          title={{ en: 'Active Pilots', ar: 'التجارب النشطة' }}
          value={filteredPilots.filter(p => p.stage === 'active' || p.stage === 'monitoring').length}
          icon={CheckCircle2}
          color="text-green-600"
          bgColor="bg-gradient-to-br from-green-50 to-white"
          link="/Pilots?stage=active"
        />
        <MetricCard 
          title={{ en: 'At Risk', ar: 'في خطر' }}
          value={filteredPilots.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length}
          icon={AlertTriangle}
          color="text-yellow-600"
          bgColor="bg-gradient-to-br from-yellow-50 to-white"
          link="/Pilots?risk=high"
          subtext={t({ en: 'Requires attention', ar: 'يتطلب الاهتمام' })}
        />
        <MetricCard 
          title={{ en: 'Active Programs', ar: 'البرامج النشطة' }}
          value={filteredPrograms.filter(p => p.status === 'active').length}
          icon={Layers}
          color="text-purple-600"
          bgColor="bg-gradient-to-br from-purple-50 to-white"
          link="/Programs?status=active"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t({ en: 'Innovation Roadmap', ar: 'خارطة الطريق' })}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/strategy-roadmap-page">
                <Eye className="h-4 w-4 mr-1" />
                {t({ en: 'Full View', ar: 'عرض كامل' })}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={roadmapData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="challenges" stroke="#3b82f6" name={t({ en: 'Challenges', ar: 'التحديات' })} />
                <Line type="monotone" dataKey="pilots" stroke="#10b981" name={t({ en: 'Pilots', ar: 'التجارب' })} />
                <Line type="monotone" dataKey="scaled" stroke="#f59e0b" name={t({ en: 'Scaled', ar: 'موسعة' })} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Capacity Metrics', ar: 'مؤشرات القدرات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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

      {/* Portfolio Heatmap with drill-down */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t({ en: 'Portfolio Heatmap by Sector', ar: 'خريطة المحفظة حسب القطاع' })}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/strategy-sector-analysis-page">
              <BarChart3 className="h-4 w-4 mr-1" />
              {t({ en: 'Detailed Analysis', ar: 'تحليل مفصل' })}
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={portfolioHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="discover" stackId="a" fill="#94a3b8" name={t({ en: 'Discover', ar: 'اكتشاف' })} />
              <Bar dataKey="validate" stackId="a" fill="#3b82f6" name={t({ en: 'Validate', ar: 'تحقق' })} />
              <Bar dataKey="pilot" stackId="a" fill="#10b981" name={t({ en: 'Pilot', ar: 'تجريب' })} />
              <Bar dataKey="scale" stackId="a" fill="#f59e0b" name={t({ en: 'Scale', ar: 'توسع' })} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget & Strategic Plan Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {t({ en: 'Budget Overview', ar: 'نظرة عامة على الميزانية' })}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/budgets">
                <Eye className="h-4 w-4 mr-1" />
                {t({ en: 'Details', ar: 'التفاصيل' })}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-slate-600">{t({ en: 'Pilots Budget', ar: 'ميزانية التجارب' })}</span>
                <span className="font-bold text-blue-600">{(filteredPilots.reduce((sum, p) => sum + (p.budget || 0), 0) / 1000000).toFixed(1)}M SAR</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-slate-600">{t({ en: 'R&D Budget', ar: 'ميزانية البحث' })}</span>
                <span className="font-bold text-purple-600">{(rdProjects.reduce((sum, r) => sum + (r.budget || 0), 0) / 1000000).toFixed(1)}M SAR</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-slate-600">{t({ en: 'Programs Budget', ar: 'ميزانية البرامج' })}</span>
                <span className="font-bold text-green-600">{(filteredPrograms.reduce((sum, p) => sum + (p.funding_details?.total_pool || 0), 0) / 1000000).toFixed(1)}M SAR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t({ en: 'Strategic Plans', ar: 'الخطط الاستراتيجية' })}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/strategy-hub">
                <ArrowRight className="h-4 w-4 mr-1" />
                {t({ en: 'Hub', ar: 'المركز' })}
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {strategicPlans.length > 0 ? (
              <div className="space-y-3">
                {strategicPlans.slice(0, 3).map(plan => (
                  <Link key={plan.id} to={`/strategic-plans-page`} className="block">
                    <div className="p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                      <p className="font-medium text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? plan.name_ar : plan.name_en}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{plan.start_year} - {plan.end_year}</Badge>
                        <Badge className={plan.status === 'active' ? 'bg-green-600' : 'bg-blue-600'}>{plan.status}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">
                {t({ en: 'No strategic plans', ar: 'لا توجد خطط استراتيجية' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Coverage Widget */}
      <StrategicCoverageWidget />

      {/* Resource Allocation */}
      <ResourceAllocationView />

      {/* Partnership Network */}
      <PartnershipNetwork />

      {/* Bottleneck Detector */}
      <BottleneckDetector />
    </div>
  );
}

export default ProtectedPage(StrategyCockpitPage, { requiredPermissions: ['strategy_view'] });
