import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Hook to fetch email logs
 */
export function useEmailLogs({ statusFilter = 'all', searchTerm = '', page = 0, pageSize = 20 }) {
    return useQuery({
        queryKey: ['email-logs', statusFilter, searchTerm, page],
        queryFn: async () => {
            let query = supabase
                .from('email_logs')
                .select('*, email_templates(name_en, name_ar)')
                .order('created_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (searchTerm) {
                query = query.or(`recipient_email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,template_key.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        }
    });
}

/**
 * Hook to fetch email log statistics
 */
export function useEmailStats() {
    return useQuery({
        queryKey: ['email-logs-stats'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('status');

            if (error) throw error;

            const counts = { total: 0, sent: 0, delivered: 0, failed: 0, opened: 0 };
            data?.forEach(log => {
                counts.total++;
                if (log.status) counts[log.status] = (counts[log.status] || 0) + 1;
            });
            return counts;
        }
    });
}

/**
 * Hook for email retry logic
 */
export function useEmailRetry() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    const retryEmail = useMutation({
        mutationFn: async (log) => {
            // Call email-trigger-hub with the original data
            const { error: invokeError } = await supabase.functions.invoke('email-trigger-hub', {
                body: {
                    trigger: log.template_key,
                    recipient_email: log.recipient_email,
                    variables: log.variables_used || {},
                    language: log.language || 'en',
                    triggered_by: 'manual_retry'
                }
            });

            if (invokeError) throw invokeError;

            // Update retry count locally (or rely on system to update it eventually, but immediate update is better UX)
            await supabase
                .from('email_logs')
                .update({
                    retry_count: (log.retry_count || 0) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', log.id);

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['email-logs'] });
            toast.success(t({ en: 'Email retry queued successfully', ar: 'تمت إضافة إعادة الإرسال للقائمة' }));
        },
        onError: (error) => {
            console.error('Retry error:', error);
            toast.error(t({ en: 'Failed to retry email', ar: 'فشل في إعادة إرسال البريد' }));
        }
    });

    return { retryEmail };
}

