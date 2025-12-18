import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Sparkles, Calendar, Zap, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function ProgressToGoalsTracker() {
  const { language, isRTL, t } = useLanguage();
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];

  const calculateKPIProgress = (kpi) => {
    const baseline = parseFloat(kpi.baseline) || 0;
    const target = parseFloat(kpi.target) || 100;
    const current = parseFloat(kpi.current) || baseline;

    const progress = ((current - baseline) / (target - baseline)) * 100;
    const velocity = current - baseline; // Simplified velocity calculation

    // Forecast
    const remaining = target - current;
    const monthsElapsed = 6; // Example: 6 months into plan
    const monthlyVelocity = velocity / monthsElapsed;
    const monthsToTarget = monthlyVelocity > 0 ? remaining / monthlyVelocity : 999;

    // Status
    let status = 'on_track';
    if (progress >= 90) status = 'on_track';
    else if (progress >= 60) status = 'at_risk';
    else status = 'off_track';

    return {
      progress: Math.min(Math.max(progress, 0), 100),
      current,
      target,
      baseline,
      monthsToTarget: Math.round(monthsToTarget),
      status,
      velocity: monthlyVelocity
    };
  };

  const generateAIRecommendations = async () => {
    if (!activePlan?.kpis) return;

    // Import centralized prompt module
    const { 
      KPI_PROGRESS_PROMPT_TEMPLATE, 
      KPI_PROGRESS_RESPONSE_SCHEMA 
    } = await import('@/lib/ai/prompts/analytics/kpiProgress');

    const kpiData = activePlan.kpis.map(kpi => ({
      name: kpi.name_en,
      ...calculateKPIProgress(kpi)
    }));

    const result = await invokeAI({
      prompt: KPI_PROGRESS_PROMPT_TEMPLATE(kpiData),
      response_json_schema: KPI_PROGRESS_RESPONSE_SCHEMA
    });

    if (result.success) {
      setAiRecommendations(result.data);
    }
  };

  const statusConfig = {
    on_track: {
      color: 'green',
      icon: CheckCircle2,
      label: t({ en: 'On Track', ar: 'على المسار' }),
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700'
    },
    at_risk: {
      color: 'yellow',
      icon: AlertTriangle,
      label: t({ en: 'At Risk', ar: 'في خطر' }),
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700'
    },
    off_track: {
      color: 'red',
      icon: AlertTriangle,
      label: t({ en: 'Off Track', ar: 'خارج المسار' }),
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-700'
    }
  };

  if (!activePlan) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">{t({ en: 'No active strategic plan', ar: 'لا توجد خطة استراتيجية نشطة' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Progress to Goals Tracker', ar: 'متتبع التقدم نحو الأهداف' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Track strategic KPI progress with AI forecasting', ar: 'تتبع تقدم المؤشرات الاستراتيجية مع التنبؤ الذكي' })}
          </p>
        </div>
        <Button onClick={generateAIRecommendations} className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Sparkles className="h-4 w-4 mr-2" />
          {t({ en: 'AI Recommendations', ar: 'توصيات الذكاء الاصطناعي' })}
        </Button>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations && (
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              {t({ en: 'AI Intervention Recommendations', ar: 'توصيات التدخل الذكية' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiRecommendations.recommendations?.map((rec, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 mb-1">{rec.kpi_name}</h4>
                    <p className="text-sm text-red-700 mb-2">⚠️ {rec.issue}</p>
                    <p className="text-sm text-slate-700 mb-2"><strong>{t({ en: 'Action:', ar: 'الإجراء:' })}</strong> {rec.action}</p>
                    <p className="text-sm text-green-700">📈 {t({ en: 'Impact:', ar: 'التأثير:' })} {rec.expected_impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* KPI Progress Cards */}
      <div className="space-y-4">
        {activePlan.kpis?.map((kpi, idx) => {
          const progress = calculateKPIProgress(kpi);
          const config = statusConfig[progress.status];
          const Icon = config.icon;

          return (
            <Card key={idx} className={`border-2 ${config.border}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {language === 'ar' && kpi.name_ar ? kpi.name_ar : kpi.name_en}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {t({ en: 'Measurement Frequency:', ar: 'تكرار القياس:' })} {kpi.measurement_frequency || 'Quarterly'}
                    </p>
                  </div>
                  <Badge className={`${config.bg} ${config.text} border ${config.border}`}>
                    <Icon className="h-4 w-4 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {t({ en: 'Progress', ar: 'التقدم' })}: {Math.round(progress.progress)}%
                    </span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-slate-900">{progress.current}</span>
                      <span className="text-sm text-slate-500"> / {progress.target} {kpi.unit}</span>
                    </div>
                  </div>
                  <Progress value={progress.progress} className="h-3" />
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                    <span>{t({ en: 'Baseline:', ar: 'الأساس:' })} {progress.baseline}</span>
                    <span>{t({ en: 'Target:', ar: 'الهدف:' })} {progress.target}</span>
                  </div>
                </div>

                {/* Forecast */}
                <div className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className={`h-4 w-4 ${config.text}`} />
                    <span className={`text-sm font-semibold ${config.text}`}>
                      {t({ en: 'Forecast', ar: 'التنبؤ' })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {progress.monthsToTarget < 100 ? (
                      t({ 
                        en: `At current pace, will reach target in ${progress.monthsToTarget} months`, 
                        ar: `بالوتيرة الحالية، سنصل للهدف في ${progress.monthsToTarget} شهر` 
                      })
                    ) : (
                      t({ 
                        en: 'Current velocity too low - will miss target without intervention', 
                        ar: 'السرعة الحالية منخفضة جداً - سنفقد الهدف بدون تدخل' 
                      })
                    )}
                  </p>
                  {progress.velocity > 0 && (
                    <p className="text-xs text-slate-600 mt-1">
                      {t({ en: 'Velocity:', ar: 'السرعة:' })} +{progress.velocity.toFixed(2)} {kpi.unit}/{t({ en: 'month', ar: 'شهر' })}
                    </p>
                  )}
                </div>

                {/* Historical Trend (Placeholder) */}
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { month: 'Jan', value: progress.baseline },
                      { month: 'Mar', value: progress.baseline + (progress.current - progress.baseline) * 0.3 },
                      { month: 'Jun', value: progress.current },
                      { month: 'Sep', value: progress.current + progress.velocity * 3, projected: true },
                      { month: 'Dec', value: progress.target, target: true }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ProtectedPage(ProgressToGoalsTracker, { requiredPermissions: [] });