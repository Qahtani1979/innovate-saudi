import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage email settings from the database.
 */
export function useEmailSettings() {
    const queryClient = useQueryClient();

    const fetchSettings = useQuery({
        queryKey: ['email-settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_settings')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const saveSettings = useMutation({
        /** @param {Record<string, any>} settings */
        mutationFn: async (settings) => {
            const upserts = Object.entries(settings).map(([key, value]) => ({
                setting_key: key,
                setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
                updated_at: new Date().toISOString()
            }));

            for (const row of upserts) {
                const { error } = await supabase
                    .from('email_settings')
                    .upsert(row, { onConflict: 'setting_key' });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-settings'] });
            toast.success('Email settings saved successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    // Helper to parse settings into a flat object
    const getParsedSettings = (defaultSettings) => {
        if (!fetchSettings.data) return defaultSettings;

        const parsed = { ...defaultSettings };
        fetchSettings.data.forEach(row => {
            try {
                const value = row.setting_value;
                if (typeof value === 'string') {
                    try {
                        parsed[row.setting_key] = JSON.parse(value);
                    } catch {
                        parsed[row.setting_key] = value;
                    }
                } else {
                    parsed[row.setting_key] = value;
                }
            } catch {
                parsed[row.setting_key] = row.setting_value;
            }
        });
        return parsed;
    };

    return {
        settings: fetchSettings.data,
        isLoading: fetchSettings.isLoading,
        saveSettings,
        getParsedSettings
    };
}
