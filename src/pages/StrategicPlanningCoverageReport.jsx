import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getStrategicCoverageData } from './strategicCoverageData';

function StrategicPlanningCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-strategy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['budgets-strategy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

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