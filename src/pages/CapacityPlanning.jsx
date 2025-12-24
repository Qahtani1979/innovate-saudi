import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { Users, TrendingUp, Activity, AlertTriangle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function CapacityPlanning() {
  const { isRTL, t } = useLanguage();

  const { data: pilots = [], isLoading: isPilotsLoading } = usePilotsWithVisibility();

  const { data: challenges = [], isLoading: isChallengesLoading } = useChallengesWithVisibility();

  const isLoading = isPilotsLoading || isChallengesLoading;

  const activePilots = pilots.filter(p => ['active', 'monitoring'].includes(p.stage));
  const totalTeamSize = activePilots.reduce((sum, p) => {
    const team = p?.['team'];
    return sum + (Array.isArray(team) ? team.length : 0);
  }, 0);
  const avgTeamSize = activePilots.length > 0 ? Math.round(totalTeamSize / activePilots.length) : 0;

  const capacityData = [
    { month: 'Jan', capacity: 85, utilization: 72 },
    { month: 'Feb', capacity: 90, utilization: 78 },
    { month: 'Mar', capacity: 95, utilization: 88 },
    { month: 'Apr', capacity: 100, utilization: 92 },
    { month: 'May', capacity: 105, utilization: 98 },
    { month: 'Jun', capacity: 110, utilization: 95 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Capacity Planning', ar: 'تخطيط القدرات' }}
        subtitle={{ en: 'Monitor and optimize resource capacity', ar: 'مراقبة وتحسين القدرة الاستيعابية للموارد' }}
        icon={<Activity className="h-6 w-6 text-white" />}
        description=""
        action={null}
        actions={null}
        stats={[
          { icon: Activity, value: activePilots.length, label: { en: 'Active Projects', ar: 'مشاريع نشطة' } },
          { icon: Users, value: totalTeamSize, label: { en: 'Team Members', ar: 'أعضاء الفريق' } },
          { icon: TrendingUp, value: '86%', label: { en: 'Utilization', ar: 'الاستخدام' } },
          { icon: AlertTriangle, value: avgTeamSize, label: { en: 'Avg Team Size', ar: 'متوسط حجم الفريق' } },
        ]}
      />

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
    </PageLayout>
  );
}

export default ProtectedPage(CapacityPlanning, { requiredPermissions: [] });
