import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook for managing user sessions.
 * @param {string} userId - The ID of the user to manage sessions for.
 */
export function useSessions(userId) {
    const { t } = useLanguage();
    const queryClient = useAppQueryClient();

    // Fetch active sessions
    const sessionsQuery = useQuery({
        queryKey: ['user-sessions', userId],
        queryFn: async () => {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('user_sessions')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('started_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data || [];
        },
        enabled: !!userId,
    });

    // Terminate a specific session
    const terminateSessionMutation = useMutation({
        mutationFn: async (sessionId) => {
            const { error } = await supabase
                .from('user_sessions')
                .update({ is_active: false, ended_at: new Date().toISOString() })
                .eq('id', sessionId);

            if (error) throw error;
            return sessionId;
        },
        onSuccess: () => {
            toast.success(t({ en: 'Session terminated', ar: 'تم إنهاء الجلسة' }));
            queryClient.invalidateQueries(['user-sessions', userId]);
        },
        onError: (error) => {
            console.error('Error terminating session:', error);
            toast.error(t({ en: 'Failed to terminate session', ar: 'فشل إنهاء الجلسة' }));
        }
    });

    // Sign out from all devices
    const signOutAllMutation = useMutation({
        mutationFn: async () => {
            // 1. Mark all DB sessions as inactive
            if (userId) {
                await supabase
                    .from('user_sessions')
                    .update({ is_active: false, ended_at: new Date().toISOString() })
                    .eq('user_id', userId);
            }

            // 2. Global signout from Supabase Auth
            const { error } = await supabase.auth.signOut({ scope: 'global' });
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success(t({ en: 'Signed out from all devices', ar: 'تم تسجيل الخروج من جميع الأجهزة' }));
            // Redirect handled by component or global auth state
        },
        onError: (error) => {
            // Ignore session_not_found as it often means success in this context
            if (error?.message?.includes('session_not_found')) {
                toast.success(t({ en: 'Signed out from all devices', ar: 'تم تسجيل الخروج من جميع الأجهزة' }));
            } else {
                console.error('Sign out error:', error);
                toast.error(t({ en: 'Failed to sign out', ar: 'فشل في تسجيل الخروج' }));
            }
        }
    });

    return {
        sessions: sessionsQuery.data || [],
        isLoading: sessionsQuery.isLoading,
        isError: sessionsQuery.isError,
        terminateSession: terminateSessionMutation,
        signOutAll: signOutAllMutation,
        refetch: sessionsQuery.refetch
    };
}

