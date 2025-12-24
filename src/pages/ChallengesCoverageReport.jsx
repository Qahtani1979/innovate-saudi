import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getChallengesCoverageData } from './challengesCoverageData';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';

function ChallengesCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useChallengesWithVisibility({ limit: 5000 });
  const { data: pilots = [] } = usePilotsWithVisibility({ limit: 5000 });
  const { data: solutions = [] } = useSolutionsWithVisibility({ limit: 5000 });
  const { data: rdProjects = [] } = useRDProjectsWithVisibility({ limit: 5000 });

  const coverageData = getChallengesCoverageData(challenges, pilots, solutions, rdProjects);

  return (
    <BaseCoverageReport
      title={t({ en: '🎯 Challenges Coverage', ar: '🎯 تغطية التحديات' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(ChallengesCoverageReport, { requireAdmin: true });