import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import TeamWorkspace from '../components/access/TeamWorkspace';
import TeamPerformanceAnalytics from '../components/access/TeamPerformanceAnalytics';

export default function TeamWorkspacePage() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');

  const { data: team } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.list();
      return teams.find(t => t.id === teamId);
    },
    enabled: !!teamId
  });

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">{t({ en: 'Team not found', ar: 'الفريق غير موجود' })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <TeamWorkspace team={team} />
      <TeamPerformanceAnalytics team={team} />
    </div>
  );
}