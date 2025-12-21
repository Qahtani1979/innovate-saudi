import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import KPIAlertConfig from '../components/kpi/KPIAlertConfig';
import DashboardBuilder from '../components/kpi/DashboardBuilder';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  STRATEGIC_KPI_INSIGHTS_SCHEMA,
  STRATEGIC_KPI_INSIGHTS_PROMPT_TEMPLATE
} from '@/lib/ai/prompts/kpi/strategicKPI';

function StrategicKPITracker() {
  const { language, isRTL, t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  /* 
   * MIGRATION NOTE: Replaced base44.entities with Supabase direct queries
   * Level 6 Verification: Data Layer Integration
   */
  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

  // Mock strategic KPIs - in real app, would come from StrategicPlan entity
  const strategicKPIs = [
    {
      name_en: 'Pilot Success Rate',
      name_ar: 'معدل نجاح التجارب',
      baseline: 60,
      target: 85,
      current: 73,
      unit: '%',
      status: 'on_track',
      trend: [
        { month: 'Jan', planned: 62, actual: 65 },
        { month: 'Feb', planned: 65, actual: 68 },
        { month: 'Mar', planned: 68, actual: 70 },
        { month: 'Apr', planned: 71, actual: 73 },
        { month: 'May', planned: 74, actual: null },
        { month: 'Jun', planned: 77, actual: null }
      ]
    },
    {
      name_en: 'Solutions Deployed',
      name_ar: 'الحلول المنشورة',
      baseline: 15,
      target: 50,
      current: 28,
      unit: 'solutions',
      status: 'on_track',
      trend: [
        { month: 'Jan', planned: 18, actual: 20 },
        { month: 'Feb', planned: 21, actual: 22 },
        { month: 'Mar', planned: 24, actual: 25 },
        { month: 'Apr', planned: 27, actual: 28 },
        { month: 'May', planned: 30, actual: null },
        { month: 'Jun', planned: 33, actual: null }
      ]
    },
    {
      name_en: 'Average MII Score',
      name_ar: 'متوسط مؤشر الابتكار البلدي',
      baseline: 52,
      target: 70,
      current: 58,
      unit: 'score',
      status: 'at_risk',
      trend: [
        { month: 'Jan', planned: 54, actual: 53 },
        { month: 'Feb', planned: 56, actual: 55 },
        { month: 'Mar', planned: 58, actual: 57 },
        { month: 'Apr', planned: 60, actual: 58 },
        { month: 'May', planned: 62, actual: null },
        { month: 'Jun', planned: 64, actual: null }
      ]
    },
    {
      name_en: 'R&D to Pilot Conversion',
      name_ar: 'تحويل البحث إلى تجارب',
      baseline: 25,
      target: 60,
      current: 42,
      unit: '%',
      status: 'on_track',
      trend: [
        { month: 'Jan', planned: 28, actual: 30 },
        { month: 'Feb', planned: 32, actual: 35 },
        { month: 'Mar', planned: 36, actual: 38 },
        { month: 'Apr', planned: 40, actual: 42 },
        { month: 'May', planned: 44, actual: null },
        { month: 'Jun', planned: 48, actual: null }
      ]
    }
  ];

  const statusColors = {
    on_track: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    at_risk: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    off_track: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  const onTrack = strategicKPIs.filter(k => k.status === 'on_track').length;
  const atRisk = strategicKPIs.filter(k => k.status === 'at_risk').length;
  const offTrack = strategicKPIs.filter(k => k.status === 'off_track').length;

  const generateAIInsights = async () => {
    const kpiData = strategicKPIs.map(kpi => ({
      name: kpi.name_en,
      baseline: kpi.baseline,
      current: kpi.current,
      target: kpi.target,
      progress: ((kpi.current - kpi.baseline) / (kpi.target - kpi.baseline)) * 100,
      status: kpi.status
    }));

    const result = await invokeAI({
      prompt: STRATEGIC_KPI_INSIGHTS_PROMPT_TEMPLATE({
        kpiData,
        activePilots: pilots.length,
        totalChallenges: challenges.length
      }),
      response_json_schema: STRATEGIC_KPI_INSIGHTS_SCHEMA
    });

    if (result.success) {
      setAiInsights(result.data);
      toast.success(t({ en: 'AI insights generated', ar: 'تم إنشاء الرؤى الذكية' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-teal-600 to-green-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '📊 Strategic KPI Tracker', ar: '📊 متتبع المؤشرات الاستراتيجية' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Plan vs Actuals • Real-time variance detection', ar: 'المخطط مقابل الفعلي • كشف الانحراف الفوري' })}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {selectedYear}
          </Badge>
          <Badge variant="outline" className="bg-white/20 text-white border-white/40">
            {strategicKPIs.length} KPIs
          </Badge>
        </div>
      </div>

      {/* AI Insights Generator */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900 mb-1 text-lg">
                {t({ en: 'AI KPI Analyzer', ar: 'محلل المؤشرات الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Anomaly detection, forecasting, correlation analysis, and intervention strategies', ar: 'كشف الشذوذ والتنبؤ وتحليل الارتباط واستراتيجيات التدخل' })}
              </p>
            </div>
            <Button onClick={generateAIInsights} disabled={aiLoading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {t({ en: 'AI Analyze', ar: 'تحليل ذكي' })}
            </Button>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Results */}
      {aiInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiInsights.anomalies?.length > 0 && (
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-900 text-sm">{t({ en: 'Anomalies Detected', ar: 'شذوذ مكتشف' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights.anomalies.map((anomaly, idx) => (
                    <div key={idx} className={`p-3 border rounded text-sm ${severityColors[anomaly.severity]}`}>
                      <p className="font-medium mb-1">{language === 'ar' ? anomaly.kpi_ar : anomaly.kpi_en}</p>
                      <p className="text-xs" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? anomaly.anomaly_ar : anomaly.anomaly_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiInsights.forecasts?.length > 0 && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900 text-sm">{t({ en: 'Predictive Forecasts', ar: 'التنبؤات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights.forecasts.map((forecast, idx) => (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="font-medium mb-1">{language === 'ar' ? forecast.kpi_ar : forecast.kpi_en}</p>
                      <p className="text-xs text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? forecast.forecast_ar : forecast.forecast_en}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">{forecast.confidence} confidence</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiInsights.correlations?.length > 0 && (
            <Card className="border-2 border-teal-200">
              <CardHeader>
                <CardTitle className="text-teal-900 text-sm">{t({ en: 'KPI Correlations', ar: 'ارتباطات المؤشرات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights.correlations.map((corr, idx) => (
                    <div key={idx} className="p-3 bg-teal-50 border border-teal-200 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? corr.correlation_ar : corr.correlation_en}
                        </p>
                        <Badge className={corr.strength === 'strong' ? 'bg-green-600' : 'bg-blue-600'} text-xs>
                          {corr.strength}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiInsights.interventions?.length > 0 && (
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-900 text-sm">{t({ en: 'Intervention Strategies', ar: 'استراتيجيات التدخل' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {aiInsights.interventions.map((intervention, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 border border-orange-200 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{language === 'ar' ? intervention.kpi_ar : intervention.kpi_en}</p>
                        <Badge className={intervention.urgency === 'high' ? 'bg-red-600' : 'bg-yellow-600'}>
                          {intervention.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {language === 'ar' ? intervention.strategy_ar : intervention.strategy_en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{strategicKPIs.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total KPIs', ar: 'إجمالي المؤشرات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{onTrack}</p>
            <p className="text-sm text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{atRisk}</p>
            <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-10 w-10 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{offTrack}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Off Track', ar: 'خارج المسار' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards */}
      {strategicKPIs.map((kpi, idx) => {
        const colors = statusColors[kpi.status];
        const progress = ((kpi.current - kpi.baseline) / (kpi.target - kpi.baseline)) * 100;

        return (
          <Card key={idx} className={`border-2 ${colors.border}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  {language === 'ar' ? kpi.name_ar : kpi.name_en}
                </CardTitle>
                <Badge className={`${colors.bg} ${colors.text}`}>
                  {kpi.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded">
                  <p className="text-xs text-slate-500">{t({ en: 'Baseline', ar: 'الأساس' })}</p>
                  <p className="text-2xl font-bold text-slate-700">{kpi.baseline}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-xs text-slate-500">{t({ en: 'Current', ar: 'الحالي' })}</p>
                  <p className="text-2xl font-bold text-blue-600">{kpi.current}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-xs text-slate-500">{t({ en: 'Target', ar: 'الهدف' })}</p>
                  <p className="text-2xl font-bold text-green-600">{kpi.target}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">{t({ en: 'Progress to Target', ar: 'التقدم نحو الهدف' })}</span>
                  <span className="text-sm font-bold text-slate-900">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              {/* Trend Chart */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-3">{t({ en: 'Plan vs Actual Trend', ar: 'اتجاه المخطط مقابل الفعلي' })}</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={kpi.trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Planned" />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Variance Alert */}
              {kpi.status === 'at_risk' && (
                <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">
                        {t({ en: 'Variance Alert', ar: 'تنبيه الانحراف' })}
                      </p>
                      <p className="text-xs text-yellow-700">
                        {t({ en: 'Current performance is below target trajectory. Corrective action recommended.', ar: 'الأداء الحالي أقل من المسار المستهدف. يوصى باتخاذ إجراء تصحيحي.' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <KPIAlertConfig kpis={strategicKPIs} />

      <DashboardBuilder kpis={strategicKPIs} />
    </div>
  );
}

const severityColors = {
  critical: 'bg-red-100 border-red-300',
  high: 'bg-orange-100 border-orange-300',
  medium: 'bg-yellow-100 border-yellow-300',
  low: 'bg-blue-100 border-blue-300'
};

export default ProtectedPage(StrategicKPITracker, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead'] });