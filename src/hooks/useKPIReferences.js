import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useKPIReferences = ({ entityId } = {}) => {
    return useQuery({
        queryKey: ['kpi-references', { entityId }],
        queryFn: async () => {
            let query = supabase
                .from('kpi_references')
                .select('*')
                .order('code');

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

export function useKPIReferenceMutations() {
    const queryClient = useAppQueryClient();

    const createKPIReference = useMutation({
        mutationFn: async (data) => {
            const { data: newKPI, error } = await supabase.from('kpi_references').insert(data).select().single();
            if (error) throw error;
            return newKPI;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['kpi-references']);
            toast.success('KPI Reference created');
        }
    });

    const deleteKPIReference = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('kpi_references').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['kpi-references']);
            toast.success('KPI Reference deleted');
        }
    });

    return {
        createKPIReference,
        deleteKPIReference
    };
}



