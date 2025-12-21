import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getCitizenCoverageData } from './citizenCoverageData';

function CitizenEngagementCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: ideas = [] } = useQuery({
    queryKey: ['citizen-ideas-for-coverage'],
    queryFn: () => base44.entities.CitizenIdea.list()
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['citizen-votes-for-coverage'],
    queryFn: () => base44.entities.CitizenVote.list()
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['citizen-feedback-for-coverage'],
    queryFn: () => base44.entities.CitizenFeedback.list()
  });

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