import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CapacityPlanning() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-capacity'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-capacity'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const activePilots = pilots.filter(p => ['active', 'monitoring'].includes(p.stage));
  const totalTeamSize = activePilots.reduce((sum, p) => sum + (p.team?.length || 0), 0);
  const avgTeamSize = activePilots.length > 0 ? Math.round(totalTeamSize / activePilots.length) : 0;

  const capacityData = [
    { month: 'Jan', capacity: 85, utilization: 72 },
    { month: 'Feb', capacity: 90, utilization: 78 },
    { month: 'Mar', capacity: 95, utilization: 88 },
    { month: 'Apr', capacity: 100, utilization: 92 },
    { month: 'May', capacity: 105, utilization: 98 },
    { month: 'Jun', capacity: 110, utilization: 95 }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Capacity Planning', ar: 'تخطيط القدرات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Monitor and optimize resource capacity', ar: 'مراقبة وتحسين القدرة الاستيعابية للموارد' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{activePilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{totalTeamSize}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Team Members', ar: 'أعضاء الفريق' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">86%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Utilization', ar: 'الاستخدام' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{avgTeamSize}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Team Size', ar: 'متوسط حجم الفريق' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Capacity vs Utilization', ar: 'القدرة مقابل الاستخدام' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="capacity" fill="#3b82f6" name={t({ en: 'Capacity', ar: 'القدرة' })} />
              <Bar dataKey="utilization" fill="#8b5cf6" name={t({ en: 'Utilization', ar: 'الاستخدام' })} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(CapacityPlanning, { requiredPermissions: [] });