import { useLanguage } from '../components/LanguageContext';
import TeamWorkspace from '../components/access/TeamWorkspace';
import TeamPerformanceAnalytics from '../components/access/TeamPerformanceAnalytics';
import { useTeams } from '@/hooks/useTeams';

export default function TeamWorkspacePage() {
  const { language, isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');

  const { data: teams = [] } = useTeams();
  const team = teams.find(t => t.id === teamId);

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