import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function useNotificationPreferences(userEmail) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const { data: preferences, isLoading } = useQuery({
        queryKey: ['notification-prefs', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_notification_preferences')
                .select('*')
                .eq('user_email', userEmail)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!userEmail
    });

    const savePreferences = useMutation({
        /**
         * @param {{ data: any, userId: string, quietHoursEnabled?: boolean }} params
         */
        mutationFn: async ({ data, userId, quietHoursEnabled }) => {
            const prefsToSave = {
                ...data,
                quiet_hours_start: quietHoursEnabled ? data.quiet_hours_start : null,
                quiet_hours_end: quietHoursEnabled ? data.quiet_hours_end : null,
            };

            if (preferences?.id) {
                const { error } = await supabase
                    .from('user_notification_preferences')
                    .update(prefsToSave)
                    .eq('id', preferences.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('user_notification_preferences')
                    .insert({
                        ...prefsToSave,
                        user_email: userEmail,
                        user_id: userId
                    });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-prefs'] });
            toast.success(t({ en: 'Preferences saved successfully', ar: 'تم حفظ التفضيلات بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to save preferences', ar: 'فشل حفظ التفضيلات' }));
            console.error('Save error:', error);
        }
    });

    return {
        preferences,
        isLoading,
        savePreferences
    };
}

export default useNotificationPreferences;

