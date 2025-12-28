import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch permission templates from platform_config.
 * Templates are stored as jsonb in the 'value' column where the key matches 'permission_template_%'.
 */
export function usePermissionTemplates() {
    return useQuery({
        queryKey: ['permission-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platform_config')
                .select('*')
                .like('key', 'permission_template_%');

            if (error) throw error;
            return (data || []).map(c => ({ id: c.id, ...c.value, config_key: c.key }));
        }
    });
}

/**
 * Hook to manage permission template mutations.
 */
export function usePermissionTemplateMutations() {
    const queryClient = useAppQueryClient();

    const createTemplate = useMutation({
        mutationFn: async (template) => {
            const { error } = await supabase
                .from('platform_config')
                .insert({
                    key: `permission_template_${Date.now()}`,
                    value: template
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permission-templates'] });
            toast.success('Template created');
        },
        onError: (error) => toast.error(error.message)
    });

    const updateTemplate = useMutation({
        mutationFn: async ({ id, template }) => {
            const { error } = await supabase
                .from('platform_config')
                .update({ value: template })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permission-templates'] });
            toast.success('Template updated');
        },
        onError: (error) => toast.error(error.message)
    });

    const deleteTemplate = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('platform_config')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['permission-templates'] });
            toast.success('Template deleted');
        },
        onError: (error) => toast.error(error.message)
    });

    return { createTemplate, updateTemplate, deleteTemplate };
}



