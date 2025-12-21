import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getMatchmakerCoverageData } from './matchmakerCoverageData';

function MatchmakerCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: applications = [] } = useQuery({
    queryKey: ['matchmaker-applications-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase.from('matchmaker_applications').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['matchmaker-evaluations-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expert_evaluations').select('*').eq('entity_type', 'matchmaker_application');
      if (error) throw error;
      return data;
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-coverage-matchmaker'],
    queryFn: async () => {
      const { data, error } = await supabase.from('challenges').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-coverage-matchmaker'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pilots').select('*');
      if (error) throw error;
      return data;
    }
  });

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