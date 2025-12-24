import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch system defaults configuration
 */
export function useSystemConfig() {
    const { data: config, isLoading, error } = useQuery({
        queryKey: ['system-defaults'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_defaults')
                .select('*')
                .eq('id', 1) // Assuming single row config pattern or handle multiple
                .single();

            if (error) {
                // If not found, might return null or default structure
                if (error.code === 'PGRST116') return null;
                throw error;
            }
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });

    return { config, isLoading, error };
}

/**
 * Hook to update system defaults
 */
export function useSystemConfigMutations() {
    const queryClient = useQueryClient();

    const updateConfig = useMutation({
        mutationFn: async (updates) => {
            // Upsert to ensure it exists if it's the first time
            const { data, error } = await supabase
                .from('system_defaults')
                .upsert({ id: 1, ...updates })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            toast.success('System configuration updated');
            queryClient.invalidateQueries({ queryKey: ['system-defaults'] });
        },
        onError: (error) => {
            console.error('Error updating system config:', error);
            toast.error('Failed to update system configuration');
        }
    });

    return { updateConfig };
}
