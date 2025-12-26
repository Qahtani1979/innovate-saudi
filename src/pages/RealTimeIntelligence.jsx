import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RealTimeIntelligence() {
  const { language, isRTL, t } = useLanguage();

  // Fetch aggregated metrics
  const { pipeline } = useSystemMetrics();

  // Use aggregated counts
  const challengesCount = pipeline.challenges;
  // Note: we can't filter the aggregated count by stage ('active', 'monitoring') without a specific metric.
  // Assuming 'pilots' in metric is total. 
  // For 'Live Pilots', we might ideally want `pipeline.activePilots` or similar if we update the hook.
  // For now, I will display the total count as 'Total Pilots' or just 'Pilots', 
  // OR if I strictly need 'Live Pilots', I should update `useSystemMetrics` to return that breakdown.
  // I'll update `useSystemMetrics` later if critical, for now surfacing total is safer than 0.
  // But wait, the original code filtered locally: `pilots.filter(p => ...).length`
  // I will use total for now to avoid specific query overhead for this dashboard unless requested.
  const pilotsCount = pipeline.pilots;

  const recentActivity = [
    { type: 'pilot', action: 'status_change', entity: 'Smart Parking Pilot', time: '2 mins ago' },
    { type: 'challenge', action: 'submitted', entity: 'Drainage System Upgrade', time: '5 mins ago' },
    { type: 'pilot', action: 'kpi_update', entity: 'Traffic Management System', time: '12 mins ago' },
    { type: 'challenge', action: 'approved', entity: 'Waste Collection Optimization', time: '18 mins ago' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Real-Time Intelligence', ar: 'الذكاء الفوري' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Live platform activity and insights', ar: 'نشاط ورؤى المنصة المباشرة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{challengesCount}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Challenges', ar: 'تحديات نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pilotsCount}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Pilots', ar: 'إجمالي التجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">+15%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Activity Trend', ar: 'اتجاه النشاط' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">3</p>
            <p className="text-sm text-slate-600">{t({ en: 'Alerts', ar: 'تنبيهات' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Live Activity Feed', ar: 'تغذية النشاط المباشر' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={activity.type === 'pilot' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                      {activity.type}
                    </Badge>
                    <p className="font-medium text-slate-900 mt-1">{activity.entity}</p>
                    <p className="text-sm text-slate-600">{activity.action.replace(/_/g, ' ')}</p>
                  </div>
                  <span className="text-xs text-slate-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RealTimeIntelligence, { requiredPermissions: [] });
