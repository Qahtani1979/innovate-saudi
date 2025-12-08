import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, Plus, UserPlus, UserMinus, Target, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function TeamManagement() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list('-created_date')
  });

  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => base44.entities.TeamMember.list()
  });

  const activeTeams = teams.filter(t => t.is_active);

  const stats = {
    total_teams: teams.length,
    active_teams: activeTeams.length,
    total_members: teamMembers.filter(tm => tm.status === 'active').length,
    avg_size: activeTeams.length > 0 
      ? teamMembers.filter(tm => tm.status === 'active').length / activeTeams.length 
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Team Management', ar: 'إدارة الفرق' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage teams and members across initiatives', ar: 'إدارة الفرق والأعضاء عبر المبادرات' })}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Create Team', ar: 'إنشاء فريق' })}
        </Button>
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
            <Target className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active_teams}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <UserPlus className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.total_members}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Members', ar: 'الأعضاء' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.avg_size.toFixed(1)}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Size', ar: 'متوسط الحجم' })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeTeams.map(team => {
          const members = teamMembers.filter(tm => tm.team_id === team.id && tm.status === 'active');
          
          return (
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{team.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{team.description}</p>
                  </div>
                  <Badge className="bg-green-200 text-green-700">
                    {members.length} {t({ en: 'members', ar: 'عضو' })}
                  </Badge>
                </div>

                {team.lead_user_email && (
                  <div className="text-sm text-slate-600 mb-3">
                    <span className="font-medium">{t({ en: 'Lead:', ar: 'القائد:' })}</span> {team.lead_user_email}
                  </div>
                )}

                <div className="space-y-1">
                  {members.slice(0, 5).map(member => (
                    <div key={member.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded">
                      <span className="text-slate-700">{member.user_email}</span>
                      <Badge variant="outline" className="text-xs">{member.team_role}</Badge>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-1">
                      +{members.length - 5} {t({ en: 'more', ar: 'المزيد' })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default ProtectedPage(TeamManagement, { requiredPermissions: ['team_view_all'] });