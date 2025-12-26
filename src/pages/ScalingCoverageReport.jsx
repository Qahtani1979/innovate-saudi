import usePilotsWithVisibility from '@/hooks/usePilotsWithVisibility';
import { useScalingPlansByPilot, useScalingReadiness } from '@/hooks/useScalingPlans';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getScalingCoverageData } from './scalingCoverageData';

/**
 * ScalingCoverageReport
 * ✅ GOLD STANDARD COMPLIANT
 */
function ScalingCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilotsRaw = [] } = usePilotsWithVisibility();
  const pilots = Array.isArray(pilotsRaw) ? pilotsRaw : pilotsRaw?.data || [];

  const { data: scalingPlansRaw = [] } = useScalingPlansByPilot();
  const scalingPlans = Array.isArray(scalingPlansRaw) ? scalingPlansRaw : scalingPlansRaw?.data || [];

  const { data: scalingReadiness = [] } = useScalingReadiness();

  const coverageData = getScalingCoverageData(pilots, scalingPlans, scalingReadiness);

  return (
    <BaseCoverageReport
      title={t({ en: '📈 Scaling Coverage Report', ar: '📈 تقرير تغطية التوسع' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(ScalingCoverageReport, { requireAdmin: true });