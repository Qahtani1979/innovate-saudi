import { useLanguage } from '../components/LanguageContext';
import { useRDCallsWithVisibility } from '@/hooks/useRDCallsWithVisibility';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
import { useRDProposalsWithVisibility } from '@/hooks/useRDProposalsWithVisibility';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getRDCoverageData } from './rdCoverageData';

function RDCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: rdCalls = [] } = useRDCallsWithVisibility();
  const { data: rdProjects = [] } = useRDProjectsWithVisibility();
  const { data: rdProposals = [] } = useRDProposalsWithVisibility();

  // Get the consolidated data object
  const coverageData = getRDCoverageData(rdCalls, rdProjects, rdProposals);

  return (
    <ProtectedPage requiredPermission="rd_call_view_all">
      <BaseCoverageReport
        title={t({ en: '🔬 R&D System Coverage', ar: '🔬 تغطية نظام البحث والتطوير' })}
        data={coverageData}
        language={language}
        isRTL={isRTL}
        t={t}
      />
    </ProtectedPage>
  );
}

export default RDCoverageReport;
