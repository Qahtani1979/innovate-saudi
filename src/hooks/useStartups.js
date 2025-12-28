import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage startup profiles
 */
export function useStartups() {
    const queryClient = useAppQueryClient();

    return useQuery({
        queryKey: ['startups'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch a specific startup by ID
 */
export function useStartup(startupId) {
    return useQuery({
        queryKey: ['startup', startupId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('startup_profiles')
                .select('*')
                .eq('id', startupId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!startupId
    });
}

/**
 * Hook to manage partnerships
 */
export function usePartnerships(startupId) {
    const queryClient = useAppQueryClient();

    const query = useQuery({
        queryKey: ['partnerships', startupId],
        queryFn: async () => {
            if (!startupId) return [];
            const { data, error } = await supabase
                .from('partnerships')
                .select('*')
                .or(`partner_a_id.eq.${startupId},partner_b_id.eq.${startupId}`);
            if (error) throw error;
            return data || [];
        },
        enabled: !!startupId
    });

    const createPartnership = useMutation({
        mutationFn: async (data) => {
            const { data: newPartnership, error } = await supabase
                .from('partnerships')
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return newPartnership;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['partnerships', startupId]);
            toast.success('Partnership request created');
        },
        onError: (error) => {
            console.error('Failed to create partnership:', error);
            toast.error('Failed to create partnership');
        }
    });

    return {
        ...query,
        createPartnership
    };
}



