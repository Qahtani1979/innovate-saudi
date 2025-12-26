import { useCitizenIdeasWithVisibility } from '../hooks/useCitizenIdeasWithVisibility';
import { useCitizenVotes } from '../hooks/useCitizenVotes';
import { useCitizenFeedback } from '../hooks/useCitizenFeedback';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getCitizenCoverageData } from './citizenCoverageData';

function CitizenEngagementCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: ideas = [] } = useCitizenIdeasWithVisibility({
    municipalityId: null, // Global view for coverage report
    status: 'all',
    limit: 1000
  });

  const { data: votes = [] } = useCitizenVotes();

  const { data: feedback = [] } = useCitizenFeedback();

  const coverageData = getCitizenCoverageData(ideas, votes, feedback);

  return (
    <BaseCoverageReport
      title={t({ en: '💡 Citizen Engagement Coverage', ar: '💡 تغطية مشاركة المواطنين' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(CitizenEngagementCoverageReport, { requireAdmin: true });
