import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRegulatoryLibrary() {
    const useExemptions = () => useQuery({
        queryKey: ['regulatory-exemptions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('regulatory_exemptions').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const useExemptionAuditLogs = () => useQuery({
        queryKey: ['exemption-audit-logs'],
        queryFn: async () => {
            const { data, error } = await supabase.from('exemption_audit_logs').select('*');
            if (error) throw error;
            return data || [];
        }
    });

    return {
        useExemptions,
        useExemptionAuditLogs
    };
}

export default useRegulatoryLibrary;
