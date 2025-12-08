import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Activity, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RealTimeIntelligence() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-intel'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-intel'],
    queryFn: () => base44.entities.Challenge.list()
  });

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
            <p className="text-3xl font-bold text-blue-600">{challenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Challenges', ar: 'تحديات نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Live Pilots', ar: 'تجارب مباشرة' })}</p>
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