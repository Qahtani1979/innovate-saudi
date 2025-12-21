import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';
import BaseCoverageReport from '../components/reports/BaseCoverageReport';
import { getSandboxesCoverageData } from './sandboxesCoverageData';

function SandboxesCoverageReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: sandboxes = [] } = useQuery({
    queryKey: ['sandboxes-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sandboxes')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['sandbox-applications-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sandbox_applications')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-coverage-sandboxes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data;
    }
  });

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