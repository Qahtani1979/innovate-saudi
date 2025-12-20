import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Zap, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function VelocityAnalyticsPage() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-velocity'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('id, created_at, status').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-velocity'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('id, created_at, stage').eq('is_deleted', false);
      return data || [];
    }
  });

  const avgChallengeTime = 14;
  const avgPilotTime = 8;
  const throughput = Math.round((challenges.length + pilots.length) / 12);

  const velocityData = [
    { month: 'Jan', challenges: 12, pilots: 5 },
    { month: 'Feb', challenges: 15, pilots: 7 },
    { month: 'Mar', challenges: 18, pilots: 8 },
    { month: 'Apr', challenges: 22, pilots: 11 },
    { month: 'May', challenges: 25, pilots: 14 },
    { month: 'Jun', challenges: 28, pilots: 16 }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Velocity Analytics', ar: 'تحليلات السرعة' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Measure innovation pipeline velocity and throughput', ar: 'قياس سرعة وإنتاجية خط الابتكار' })}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{avgChallengeTime}d</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Challenge Time', ar: 'متوسط وقت التحدي' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{avgPilotTime}w</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Pilot Duration', ar: 'متوسط مدة التجربة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{throughput}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Monthly Throughput', ar: 'الإنتاجية الشهرية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">+23%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Velocity Trend', ar: 'اتجاه السرعة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Pipeline Velocity Trend', ar: 'اتجاه سرعة الخط' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="challenges" stroke="#3b82f6" name={t({ en: 'Challenges', ar: 'التحديات' })} />
              <Line type="monotone" dataKey="pilots" stroke="#a855f7" name={t({ en: 'Pilots', ar: 'التجارب' })} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(VelocityAnalyticsPage, { requiredPermissions: [] });