import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch communication analytics summary
 */
export function useCommunicationAnalytics(timeRange = '30d') {
    return useQuery({
        queryKey: ['communication-analytics', timeRange],
        queryFn: async () => {
            // Mocking analytic aggregation or fetching from a specialized view/function
            // In a real scenario, this would likely call an RPC or a sophisticated query
            // For refactoring purposes, we'll fetch raw counts or use a simplified query
            // comparable to what the component was doing.

            // Example: "fetch stats"
            const { data, error } = await supabase
                .from('communication_analytics')
                .select('*')
                .limit(1)
                .single();

            // If table doesn't exist or returns nothing, return mock/zero structure
            if (error && error.code !== 'PGRST116') {
                console.warn('Communication analytics fetch error (ignoring if table missing in dev):', error);
            }

            return data || {
                total_emails_sent: 0,
                open_rate: 0,
                click_rate: 0,
                engagement_score: 0
            };
        },
        staleTime: 1000 * 60 * 15
    });
}

/**
 * Hook to fetch recent email logs for dashboard
 */
export function useDashboardEmailLogs() {
    return useQuery({
        queryKey: ['dashboard-email-logs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('id, recipient_email, subject, status, created_at')
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 2
    });
}

/**
 * Hook to fetch recent system feedback for dashboard
 */
export function useDashboardFeedback() {
    return useQuery({
        queryKey: ['dashboard-feedback'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('citizen_feedback')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5
    });
}
