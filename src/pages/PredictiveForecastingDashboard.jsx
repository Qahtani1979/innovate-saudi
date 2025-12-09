import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, AlertTriangle, Sparkles, Target, Zap, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function PredictiveForecastingDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [forecasts, setForecasts] = useState(null);
  const { invokeAI, status, isLoading: forecasting, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const generateForecasts = async () => {
    const currentMetrics = {
      mii_avg: municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / municipalities.length,
      pilot_count: pilots.length,
      pilot_success_rate: pilots.filter(p => p.stage === 'scaled').length / pilots.length,
      challenge_resolution_rate: challenges.filter(c => c.status === 'resolved').length / challenges.length,
      active_pilots: pilots.filter(p => p.stage === 'active').length
    };

    const result = await invokeAI({
      prompt: `Based on current trajectory, forecast key metrics for next 12, 24, and 36 months.

Current State:
- Average MII Score: ${currentMetrics.mii_avg.toFixed(1)}
- Total Pilots: ${currentMetrics.pilot_count}
- Pilot Success Rate: ${(currentMetrics.pilot_success_rate * 100).toFixed(0)}%
- Challenge Resolution: ${(currentMetrics.challenge_resolution_rate * 100).toFixed(0)}%
- Active Pilots: ${currentMetrics.active_pilots}

Predict realistic values for 12, 24, and 36 months ahead. Include:
1. MII score projections
2. Pilot count projections
3. Challenge resolution rate
4. Warnings if targets will be missed
5. Intervention suggestions to improve trajectory`,
      response_json_schema: {
        type: "object",
        properties: {
          forecasts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                months_ahead: { type: "number" },
                mii_score: { type: "number" },
                pilot_count: { type: "number" },
                challenge_resolution_rate: { type: "number" },
                confidence: { type: "string" }
              }
            }
          },
          warnings: { type: "array", items: { type: "string" } },
          interventions: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (result.success) {
      setForecasts(result.data);
      toast.success(t({ en: 'Forecasts generated', ar: 'تم إنشاء التنبؤات' }));
    }
  };

  const currentMII = municipalities.reduce((sum, m) => sum + (m.mii_score || 0), 0) / municipalities.length;

  const chartData = forecasts?.forecasts ? [
    { month: 'Current', mii: currentMII, pilots: pilots.length, resolution: (challenges.filter(c => c.status === 'resolved').length / challenges.length) * 100 },
    ...forecasts.forecasts.map(f => ({
      month: `+${f.months_ahead}mo`,
      mii: f.mii_score,
      pilots: f.pilot_count,
      resolution: f.challenge_resolution_rate
    }))
  ] : [];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Predictive Forecasting Dashboard', ar: 'لوحة التنبؤ التوقعي' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'ML-powered forecasting for strategic metrics', ar: 'التنبؤ المدعوم بالتعلم الآلي للمقاييس الاستراتيجية' })}
          </p>
        </div>
        <Button onClick={generateForecasts} disabled={forecasting || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
          {forecasting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {forecasting ? t({ en: 'Forecasting...', ar: 'جاري التنبؤ...' }) : t({ en: 'Generate Forecasts', ar: 'توليد التنبؤات' })}
        </Button>
      </div>
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Current State */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{currentMII.toFixed(1)}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Current MII', ar: 'المؤشر الحالي' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Pilots', ar: 'إجمالي التجارب' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {((challenges.filter(c => c.status === 'resolved').length / challenges.length) * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Resolution Rate', ar: 'معدل الحل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{pilots.filter(p => p.stage === 'active').length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Pilots', ar: 'التجارب النشطة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Charts */}
      {forecasts && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'MII Score Forecast', ar: 'توقع درجة المؤشر' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="mii" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Pilot Count Projection', ar: 'توقع عدد التجارب' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pilots" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Challenge Resolution Rate', ar: 'معدل حل التحديات' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="resolution" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Warnings & Interventions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forecasts.warnings?.length > 0 && (
              <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <AlertTriangle className="h-5 w-5" />
                    {t({ en: 'Warning Alerts', ar: 'تنبيهات تحذيرية' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {forecasts.warnings.map((warning, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">⚠️ {warning}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {forecasts.interventions?.length > 0 && (
              <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Zap className="h-5 w-5" />
                    {t({ en: 'AI Intervention Suggestions', ar: 'اقتراحات التدخل الذكية' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {forecasts.interventions.map((intervention, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-700">💡 {intervention}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      {!forecasts && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-purple-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                {t({ en: 'Click "Generate Forecasts" to see AI predictions', ar: 'انقر "توليد التنبؤات" لرؤية توقعات الذكاء الاصطناعي' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(PredictiveForecastingDashboard, { requiredPermissions: [] });