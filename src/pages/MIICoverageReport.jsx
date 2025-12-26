import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getMIICoverageData } from './miiCoverageData';

function MIICoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const coverageData = getMIICoverageData();

  return (
    <BaseCoverageReport
      title={t({ en: '🏆 Municipal Innovation Index (MII) Coverage Report', ar: '🏆 تقرير تغطية مؤشر الابتكار البلدي' })}
      data={coverageData}
      language={language}
      isRTL={isRTL}
      t={t}
    />
  );
}

export default ProtectedPage(MIICoverageReport, { requireAdmin: true });
