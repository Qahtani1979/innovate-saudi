import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getMatchmakerCoverageData } from './matchmakerCoverageData';
import { useMatchmakerApplications } from '@/hooks/useMatchmakerApplications';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';

function MatchmakerCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: applications = [] } = useMatchmakerApplications();
  const { data: challenges = [] } = useChallengesWithVisibility({ includeAll: true });
  const { data: pilots = [] } = usePilotsWithVisibility({ includeAll: true });

  const evaluations = applications.flatMap(app => app.expert_evaluations || []);

  const coverageData = getMatchmakerCoverageData(applications, evaluations, challenges, pilots);

  return (
    <BaseCoverageReport
      title={t({ en: '🤝 Matchmaker Coverage Report', ar: '🤝 تقرير تغطية صانع التطابق' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(MatchmakerCoverageReport, { requireAdmin: true });