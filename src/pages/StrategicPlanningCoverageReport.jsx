import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getStrategicCoverageData } from './strategicCoverageData';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useBudgetsWithVisibility } from '@/hooks/useBudgetsWithVisibility';

function StrategicPlanningCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: strategicPlans = [] } = useStrategiesWithVisibility();
  const { data: challenges = [] } = useChallengesWithVisibility();

  const { data: budgets = [] } = useBudgetsWithVisibility();

  const coverageData = getStrategicCoverageData(strategicPlans, challenges, budgets);

  return (
    <BaseCoverageReport
      title={t({ en: '🎯 Strategic Planning Coverage', ar: '🎯 تغطية التخطيط الاستراتيجي' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(StrategicPlanningCoverageReport, { requireAdmin: true });
