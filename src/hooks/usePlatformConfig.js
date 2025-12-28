import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage platform configurations (branding, feature flags, etc.)
 */
export function usePlatformConfig(category) {
    const queryClient = useAppQueryClient();
    const queryKey = ['platform-config', category];

    // Fetch config
    const { data: config, isLoading, error } = useQuery({
        queryKey,
        queryFn: async () => {
            let query = supabase
                .from('platform_configs')
                .select('*');

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;
            if (error) throw error;

            // Return as array by default, consumers can transform if needed
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Helper to get config as object (key-value pairs)
    const getConfigAsObject = () => {
        const configObj = {};
        (config || []).forEach(item => {
            configObj[item.config_key] = item.config_value;
        });
        return configObj;
    };

    // Mutation to save/update config
    const saveConfig = useMutation({
        mutationFn: async (variables) => {
            const { key, value, category: itemCategory } = variables;
            const { error } = await supabase
                .from('platform_configs')
                .upsert({
                    config_key: key,
                    config_value: value,
                    category: itemCategory || category,
                    is_active: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'config_key' });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    // Batch save mutation
    const saveBatchConfig = useMutation({
        mutationFn: async (configObject) => {
            const upserts = Object.entries(configObject).map(([key, value]) => ({
                config_key: key,
                config_value: value,
                category: category,
                is_active: true,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('platform_configs')
                .upsert(upserts, { onConflict: 'config_key' });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    return {
        config,
        configAsObject: getConfigAsObject(),
        isLoading,
        error,
        saveConfig,
        saveBatchConfig
    };
}



