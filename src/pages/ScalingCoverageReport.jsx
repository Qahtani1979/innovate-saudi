import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getScalingCoverageData } from './scalingCoverageData';

function ScalingCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-coverage-scaling'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

  const { data: scalingPlans = [] } = useQuery({
    queryKey: ['scaling-plans-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scaling_plans')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: scalingReadiness = [] } = useQuery({
    queryKey: ['scaling-readiness-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scaling_readiness')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

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