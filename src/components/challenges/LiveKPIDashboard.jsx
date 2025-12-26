import { usePilotKPIDatapoints } from '@/hooks/useKPIs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveKPIDashboard({ challenge }) {
  const { language, isRTL, t } = useLanguage();

  const { data: kpiDatapoints = [] } = usePilotKPIDatapoints(
    (challenge.status === 'in_treatment' && challenge.linked_pilot_ids?.length > 0)
      ? challenge.linked_pilot_ids
      : []
  );

  if (!challenge.kpis || challenge.kpis.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            {t({ en: 'No KPIs defined for this challenge', ar: 'لا توجد مؤشرات أداء لهذا التحدي' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Activity className="h-5 w-5" />
            {t({ en: 'Live KPI Tracking', ar: 'تتبع مؤشرات الأداء المباشر' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenge.kpis.map((kpi, i) => {
            const kpiData = kpiDatapoints.filter(d => d.kpi_name === kpi.name);
            const latestValue = kpiData.length > 0 ? kpiData[kpiData.length - 1]?.value : null;
            const baseline = parseFloat(kpi.baseline) || 0;
            const target = parseFloat(kpi.target) || 100;
            const current = latestValue ? parseFloat(latestValue) : baseline;
            const progress = ((current - baseline) / (target - baseline)) * 100;
            const isImproving = current > baseline;

            return (
              <div key={i} className="p-4 bg-slate-50 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{kpi.name}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="text-slate-600">
                        {t({ en: 'Baseline:', ar: 'الأساس:' })} {kpi.baseline}
                      </span>
                      <span className="text-slate-600">→</span>
                      <span className="text-green-600 font-medium">
                        {t({ en: 'Target:', ar: 'الهدف:' })} {kpi.target}
                      </span>
                    </div>
                  </div>
                  {latestValue && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{latestValue}</div>
                      <div className="flex items-center gap-1 text-xs mt-1">
                        {isImproving ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">{t({ en: 'Improving', ar: 'تحسّن' })}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">{t({ en: 'Declining', ar: 'تراجع' })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {latestValue && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{t({ en: 'Progress to Target', ar: 'التقدم نحو الهدف' })}</span>
                      <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={Math.max(0, Math.min(100, progress))} />
                  </div>
                )}

                {/* Mini Chart */}
                {kpiData.length >= 3 && (
                  <div className="mt-4 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={kpiData.map(d => ({ date: d.date, value: parseFloat(d.value) }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
