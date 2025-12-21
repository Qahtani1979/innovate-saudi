import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getRDCoverageData } from './rdCoverageData';

function RDCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rdcalls-for-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_calls')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rdprojects-for-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_projects')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: rdProposals = [] } = useQuery({
    queryKey: ['rdproposals-for-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_proposals')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

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