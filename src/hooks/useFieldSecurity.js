import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to fetch field security rules for a specific entity.
 * Rules are stored in platform_config with key 'field_security_{entity}'.
 */
export function useFieldSecurityRules(entity) {
    return useQuery({
        queryKey: ['field-security', entity],
        queryFn: async () => {
            if (!entity) return {};
            const { data, error } = await supabase
                .from('platform_config')
                .select('*')
                .eq('key', `field_security_${entity}`)
                .maybeSingle();

            if (error) throw error;
            return data?.value || {};
        },
        enabled: !!entity
    });
}

/**
 * Hook to update field security rules for an entity.
 */
export function useUpdateFieldSecurityRules() {
    const queryClient = useAppQueryClient();

    return useMutation({
        mutationFn: async ({ entity, rules }) => {
            const key = `field_security_${entity}`;

            const { data: existing, error: fetchError } = await supabase
                .from('platform_config')
                .select('id')
                .eq('key', key)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (existing) {
                const { error } = await supabase
                    .from('platform_config')
                    .update({ value: rules })
                    .eq('id', existing.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('platform_config')
                    .insert({ key, value: rules });
                if (error) throw error;
            }
        },
        onSuccess: (_, { entity }) => {
            queryClient.invalidateQueries({ queryKey: ['field-security', entity] });
            toast.success('Field security rules updated');
        },
        onError: (error) => toast.error(error.message)
    });
}



