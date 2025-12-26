import { useTeamsWithVisibility } from '@/hooks/useTeamsWithVisibility';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function TeamPerformance() {
  const { t } = useLanguage();

  const { data: teams = [], isLoading: teamsLoading } = useTeamsWithVisibility({ includeMembers: false });
  const { data: members = [], isLoading: membersLoading } = useTeamMembers();

  const activeTeams = teams.filter(t => t.status === 'active');

  const teamPerformance = teams.map(team => {
    const teamMembers = members.filter(m => m.team_id === team.id);
    const activeMembers = teamMembers.filter(m => m.status === 'active');

    return {
      name: team.name?.substring(0, 20) || 'Team',
      members: activeMembers.length,
      capacity: team.capacity || 10,
      utilizationRate: team.capacity ? (activeMembers.length / team.capacity * 100).toFixed(0) : 0
    };
  }).slice(0, 10);

  const stats = {
    total_teams: teams.length,
    active_teams: activeTeams.length,
    total_members: members.length,
    avg_team_size: activeTeams.length > 0 ? (members.length / activeTeams.length).toFixed(1) : 0
  };

  if (teamsLoading || membersLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Team Performance', ar: 'أداء الفرق' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Team productivity and utilization analytics', ar: 'تحليلات إنتاجية واستخدام الفرق' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_teams}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Teams', ar: 'إجمالي الفرق' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active_teams}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active Teams', ar: 'الفرق النشطة' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.total_members}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Members', ar: 'إجمالي الأعضاء' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.avg_team_size}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Team Size', ar: 'متوسط حجم الفريق' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Team Capacity Utilization', ar: 'استخدام سعة الفريق' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="members" fill="#3b82f6" name={t({ en: 'Members', ar: 'الأعضاء' })} />
              <Bar dataKey="capacity" fill="#94a3b8" name={t({ en: 'Capacity', ar: 'السعة' })} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Team Details', ar: 'تفاصيل الفرق' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teams.slice(0, 10).map(team => {
              const teamMembers = members.filter(m => m.team_id === team.id && m.status === 'active');
              const utilization = team.capacity ? (teamMembers.length / team.capacity * 100).toFixed(0) : 0;

              return (
                <div key={team.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{team.name}</h3>
                      <p className="text-sm text-slate-600">{team.description}</p>
                    </div>
                    <Badge className={utilization > 80 ? 'bg-green-200 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {utilization}% {t({ en: 'Utilized', ar: 'مستخدم' })}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600">
                    {teamMembers.length} / {team.capacity || 0} {t({ en: 'members', ar: 'أعضاء' })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(TeamPerformance, { requiredPermissions: ['team_view_all'] });
