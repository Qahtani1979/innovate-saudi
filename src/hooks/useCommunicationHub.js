import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

/**
 * Hook for global communications, messaging, and system activity
 * ✅ GOLD STANDARD COMPLIANT
 */
export function useCommunicationHub() {
    const { t } = useLanguage();
    const queryClient = useAppQueryClient();

    // --- Messages ---

    const messages = useQuery({
        queryKey: ['messages'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    const threadMessages = (threadId) => useQuery({
        queryKey: ['messages', threadId],
        queryFn: async () => {
            if (!threadId) return [];
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('thread_id', threadId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        enabled: !!threadId
    });

    const sendMessage = useMutation({
        /** @param {{content: string, thread_id?: string, recipient_email?: string, sender_email?: string, metadata?: any}} payload */
        mutationFn: async (payload) => {
            const { data, error } = await supabase
                .from('messages')
                .insert(payload)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
            if (variables.thread_id) {
                queryClient.invalidateQueries({ queryKey: ['messages', variables.thread_id] });
            }
            toast.success(t({ en: 'Message sent', ar: 'تم إرسال الرسالة' }));
        }
    });

    // --- System Activities ---

    const activities = (period = 'weekly') => useQuery({
        queryKey: ['system-activities', period],
        queryFn: async () => {
            const days = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .gte('created_at', cutoff)
                .order('created_at', { ascending: false })
                .limit(200);

            if (error) throw error;
            return data || [];
        }
    });

    // --- Global Notifications (Admin View) ---

    const allNotifications = useQuery({
        queryKey: ['all-notifications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(500);
            if (error) throw error;
            return data || [];
        }
    });

    return {
        messages,
        threadMessages,
        sendMessage,
        activities,
        allNotifications
    };
}



