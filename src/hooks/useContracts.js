import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch contracts related to a provider (startup)
 */
export function useContracts(providerId) {
    return useQuery({
        queryKey: ['contracts', providerId],
        queryFn: async () => {
            if (!providerId) return [];
            // Direct query if provider_id is on contracts table
            // Based on checking the code, contracts appear to link to solutions OR providers directly
            // We check both for robustness as seen in the legacy code
            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .or(`provider_id.eq.${providerId}`);

            // NOTE: The legacy code also fetched ALL contracts and filtered by solution_id if provider_id matched.
            // A more efficient way is to join. But for now, we'll assume provider_id is populated on contracts
            // or we do a two-step if needed. Let's start with direct provider fetch.
            // If the schema requires solution traversal, we might need a join or RCP.

            if (error) throw error;
            return data || [];
        },
        enabled: !!providerId
    });
}

/**
 * Hook to fetch all contracts (for admin/analytics)
 */
export function useAllContracts() {
    return useQuery({
        queryKey: ['all-contracts'],
        queryFn: async () => {
            const { data, error } = await supabase.from('contracts').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useCreateContract() {
    const queryClient = useAppQueryClient();
    return useMutation({
        mutationFn: async (contractData) => {
            const { data, error } = await supabase
                .from('contracts')
                .insert(contractData)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contracts']);
            queryClient.invalidateQueries(['all-contracts']);
        }
    });
}

export function useContract(id) {
    return useQuery({
        queryKey: ['contract', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('contracts')
                .select(`
                    *,
                    municipality:municipalities(id, name_en, name_ar),
                    provider:providers(id, name_en, name_ar),
                    pilot:pilots(id, name_en, name_ar),
                    solution:solutions(id, name_en, name_ar)
                `)
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

export function useUpdateContract() {
    const queryClient = useAppQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('contracts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['contracts']);
            queryClient.invalidateQueries(['all-contracts']);
            queryClient.invalidateQueries(['contract', data.id]);
        }
    });
}

