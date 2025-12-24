import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useKPIReferences = ({ entityId } = {}) => {
    return useQuery({
        queryKey: ['kpi-references', { entityId }],
        queryFn: async () => {
            let query = supabase
                .from('kpi_references')
                .select('*');

            if (entityId) {
                query = query.eq('entity_id', entityId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
};
