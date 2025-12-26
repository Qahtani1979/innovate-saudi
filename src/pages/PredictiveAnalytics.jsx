import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePredictiveInsights } from '@/hooks/useAIInsights';
import { Skeleton } from '@/components/ui/skeleton';

function PredictiveAnalytics() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [] } = usePilotsWithVisibility();
  const { data: insightsData, isLoading: insightsLoading } = usePredictiveInsights();

  const successForecast = insightsData?.forecasts || [];
  const keyInsights = insightsData?.keyInsights || [];

  const riskAnalysis = pilots.map(p => ({
    name: p.code || p.title_en?.substring(0, 20),
    risk: p.risk_level === 'high' ? 80 : p.risk_level === 'medium' ? 50 : 20,
    success: p.success_probability || 70
  })).slice(0, 10);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Predictive Analytics', ar: 'التحليلات التنبؤية' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'AI-powered forecasts and risk analysis', ar: 'التوقعات وتحليل المخاطر بالذكاء الاصطناعي' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Success Rate Forecast', ar: 'توقع معدل النجاح' })}</p>
                <p className="text-3xl font-bold text-green-600">82%</p>
                <p className="text-xs text-slate-500 mt-1">Q1 2026</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'High Risk Pilots', ar: 'تجارب عالية المخاطر' })}</p>
                <p className="text-3xl font-bold text-amber-600">{pilots.filter(p => p.risk_level === 'high').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Scale Candidates', ar: 'مرشحو التوسع' })}</p>
                <p className="text-3xl font-bold text-blue-600">{pilots.filter(p => p.recommendation === 'scale').length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Predictions', ar: 'التوقعات الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insightsLoading ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              keyInsights.map((insight) => (
                <div key={insight.id} className="p-3 bg-white rounded-lg">
                  <p className={`text-sm font-medium ${insight.type === 'success' ? 'text-green-700' :
                      insight.type === 'warning' ? 'text-amber-700' : 'text-blue-700'
                    }`}>
                    {insight.type === 'success' ? '✓' : insight.type === 'warning' ? '⚠️' : '→'} {t({ en: insight.text, ar: insight.text })}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Success Rate Forecast', ar: 'توقعات معدل النجاح' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={successForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} name="Projected" strokeDasharray="5 5" />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Risk vs Success Analysis', ar: 'تحليل المخاطر مقابل النجاح' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={riskAnalysis.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="risk" fill="#f59e0b" name="Risk Score" />
                <Bar dataKey="success" fill="#10b981" name="Success Probability" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(PredictiveAnalytics, { requiredPermissions: [] });
