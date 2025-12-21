import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getChallengesCoverageData } from './challengesCoverageData';

function ChallengesCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-for-coverage'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('*');
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-for-coverage'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*');
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-for-coverage'],
    queryFn: async () => {
      const { data } = await supabase.from('solutions').select('*');
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-for-coverage'],
    queryFn: async () => {
      const { data } = await supabase.from('rd_projects').select('*');
      return data || [];
    }
  });

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