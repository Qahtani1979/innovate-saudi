import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function RealTimeKPIMonitor({ pilotId }) {
  const { language, isRTL, t } = useLanguage();
  const [liveData, setLiveData] = useState([]);

  const { data: pilot } = useQuery({
    queryKey: ['pilot', pilotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', pilotId)
        .single();
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000
  });

  const { data: datapoints = [] } = useQuery({
    queryKey: ['kpi-datapoints', pilotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilot_kpi_datapoints')
        .select('*')
        .eq('pilot_id', pilotId)
        .order('timestamp', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000
  });

  useEffect(() => {
    if (datapoints.length > 0) {
      const chartData = datapoints.reverse().map(d => ({
        timestamp: new Date(d.timestamp).toLocaleDateString(),
        value: d.value,
        target: d.target_value
      }));
      setLiveData(chartData);
    }
  }, [datapoints]);

  const kpiStatus = pilot?.kpis?.map(kpi => {
    const latestDatapoint = datapoints.find(d => d.kpi_name === kpi.name);
    const currentValue = latestDatapoint?.value || 0;
    const targetValue = parseFloat(kpi.target) || 0;
    const baselineValue = parseFloat(kpi.baseline) || 0;
    
    const progress = targetValue > baselineValue
      ? ((currentValue - baselineValue) / (targetValue - baselineValue)) * 100
      : 0;

    return {
      ...kpi,
      current_value: currentValue,
      progress: Math.min(Math.max(progress, 0), 100),
      status: progress >= 100 ? 'achieved' : progress >= 80 ? 'on_track' : progress >= 50 ? 'at_risk' : 'off_track',
      trend: latestDatapoint?.trend || 'stable'
    };
  }) || [];

  const statusColors = {
    achieved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    on_track: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    at_risk: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    off_track: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
            {t({ en: 'Real-Time KPI Monitor', ar: 'مراقب المؤشرات في الوقت الفعلي' })}
          </CardTitle>
          <Badge className="bg-green-500 text-white animate-pulse">
            {t({ en: 'Live', ar: 'مباشر' })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">
              {kpiStatus.filter(k => k.status === 'achieved').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Achieved', ar: 'محققة' })}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <TrendingUp className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">
              {kpiStatus.filter(k => k.status === 'on_track').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'On Track', ar: 'على المسار' })}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
            <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">
              {kpiStatus.filter(k => k.status === 'at_risk' || k.status === 'off_track').length}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
          </div>
        </div>

        {liveData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              {t({ en: 'KPI Trends (Last 30 Days)', ar: 'اتجاهات المؤشرات (آخر 30 يوم)' })}
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={liveData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Current" strokeWidth={2} />
                <Line type="monotone" dataKey="target" stroke="#10b981" name="Target" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-3">
          {kpiStatus.map((kpi, idx) => {
            const colors = statusColors[kpi.status];
            return (
              <div key={idx} className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{kpi.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-slate-600">
                        {kpi.current_value} / {kpi.target} {kpi.unit}
                      </span>
                      {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                    </div>
                  </div>
                  <Badge className={`${colors.bg} ${colors.text}`}>
                    {kpi.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        kpi.status === 'achieved' ? 'bg-green-600' :
                        kpi.status === 'on_track' ? 'bg-blue-600' :
                        kpi.status === 'at_risk' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${kpi.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{kpi.progress.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {kpiStatus.some(k => k.status === 'off_track') && (
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  {t({ en: '⚠️ Critical KPI Alert', ar: '⚠️ تنبيه مؤشر حرج' })}
                </p>
                <p className="text-sm text-slate-700">
                  {t({ 
                    en: 'One or more KPIs are significantly off track. Immediate corrective action required.', 
                    ar: 'واحد أو أكثر من المؤشرات خارج المسار بشكل كبير. مطلوب إجراء تصحيحي فوري.' 
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}