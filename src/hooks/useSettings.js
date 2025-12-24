import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSettings(userId) {
    const queryClient = useQueryClient();

    // Fetch settings
    const { data: settings, isLoading, error } = useQuery({
        queryKey: ['user-settings', userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return {}; // Return empty object if not found
                throw error;
            }
            return data;
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000
    });

    // Update settings
    const updateSettings = useMutation({
        mutationFn: async (data) => {
            if (!userId) throw new Error('User ID required');

            const { data: result, error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: userId,
                    ...data,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            toast.success('Settings saved successfully');
            queryClient.invalidateQueries({ queryKey: ['user-settings', userId] });
        },
        onError: (error) => {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        }
    });

    return { settings, isLoading, error, updateSettings };
}
