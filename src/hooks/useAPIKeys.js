import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAPIKeys() {
    return useQuery({
        queryKey: ['api-keys'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platform_configs')
                .select('*')
                .eq('config_type', 'api_key')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });
}

export function useAPIKeyMutations() {
    const queryClient = useQueryClient();

    const createKey = useMutation({
        mutationFn: async (name) => {
            // Generate a secure-looking key (in production, this would be server-side)
            const key = `sk_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
            const maskedKey = `sk_***${key.slice(-8)}`;

            const { data, error } = await supabase
                .from('platform_configs')
                .insert({
                    config_key: `api_key_${Date.now()}`,
                    config_value: {
                        name,
                        key: maskedKey, // In production, store hashed key
                        created: new Date().toISOString(),
                        lastUsed: null
                    },
                    config_type: 'api_key',
                    is_active: true
                })
                .select()
                .single();

            if (error) throw error;
            return { ...data, fullKey: key }; // Return full key only on creation
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        }
    });

    const deleteKey = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('platform_configs')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            toast.success('API key deleted');
        },
        onError: (error) => {
            toast.error(`Failed to delete API key: ${error.message}`);
        }
    });

    return { createKey, deleteKey };
}
