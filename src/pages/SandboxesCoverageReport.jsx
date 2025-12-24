import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getSandboxesCoverageData } from './sandboxesCoverageData';
import { useSandboxesWithVisibility } from '@/hooks/useSandboxesWithVisibility';
import { useSandboxApplications } from '@/hooks/useSandboxApplications';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';

function SandboxesCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: sandboxes = [] } = useSandboxesWithVisibility({ limit: 1000 });
  const { data: applications = [] } = useSandboxApplications({ limit: 1000 });
  const { data: pilots = [] } = usePilotsWithVisibility({ limit: 1000 });

  const coverageData = getSandboxesCoverageData(sandboxes, applications, pilots);

  return (
    <BaseCoverageReport
      title={t({ en: '🏖️ Sandboxes Coverage Report', ar: '🏖️ تقرير تغطية المختبرات التنظيمية' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(SandboxesCoverageReport, { requireAdmin: true });