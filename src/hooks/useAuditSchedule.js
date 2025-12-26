import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage RBAC audit schedule configuration in platform_config.
 */
export function useAuditSchedule() {
    const queryClient = useAppQueryClient();

    const query = useQuery({
        queryKey: ['audit-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platform_config')
                .select('*')
                .eq('key', 'rbac_audit_schedule')
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            return data?.value || {
                enabled: false,
                frequency: 'weekly',
                notify_admins: true,
                auto_cleanup_stale: false
            };
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (newConfig) => {
            const key = 'rbac_audit_schedule';

            // Check if exists
            const { data: existing } = await supabase
                .from('platform_config')
                .select('id')
                .eq('key', key)
                .single();

            if (existing) {
                const { error } = await supabase
                    .from('platform_config')
                    .update({ value: newConfig })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('platform_config')
                    .insert({ key, value: newConfig });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['audit-config'] });
            toast.success('Audit schedule updated');
        },
        onError: (error) => {
            toast.error(`Update failed: ${error.message}`);
        }
    });

    return {
        config: query.data,
        isLoading: query.isLoading,
        error: query.error,
        updateConfig: updateMutation.mutate,
        isUpdating: updateMutation.isPending
    };
}

