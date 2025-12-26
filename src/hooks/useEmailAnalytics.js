import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

/**
 * Hook to fetch email analytics statistics and time-series data.
 */
export function useEmailAnalytics(dateRange = '30') {
    const startDate = subDays(new Date(), parseInt(dateRange));

    const statsQuery = useQuery({
        queryKey: ['email-analytics-stats', dateRange],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('status')
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            const counts = {
                sent: 0,
                delivered: 0,
                opened: 0,
                clicked: 0,
                failed: 0,
                bounced: 0
            };

            data?.forEach(log => {
                if (log.status && counts[log.status] !== undefined) {
                    counts[log.status]++;
                }
            });

            const total = data?.length || 0;
            return { ...counts, total };
        }
    });

    const categoriesQuery = useQuery({
        queryKey: ['email-analytics-categories', dateRange],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('template_key')
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            const categories = {};
            data?.forEach(log => {
                const category = log.template_key?.split('_')[0] || 'other';
                categories[category] = (categories[category] || 0) + 1;
            });

            return Object.entries(categories)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 8);
        }
    });

    const timeSeriesQuery = useQuery({
        queryKey: ['email-analytics-timeseries', dateRange],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('created_at, status')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            if (error) throw error;

            const byDate = {};
            data?.forEach(log => {
                const date = format(new Date(log.created_at), 'MMM d');
                if (!byDate[date]) {
                    byDate[date] = { date, sent: 0, opened: 0, clicked: 0 };
                }
                byDate[date].sent++;
                if (log.status === 'opened') byDate[date].opened++;
                if (log.status === 'clicked') byDate[date].clicked++;
            });

            return Object.values(byDate);
        }
    });

    const templatesQuery = useQuery({
        queryKey: ['email-analytics-templates', dateRange],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('email_logs')
                .select('template_key, status')
                .gte('created_at', startDate.toISOString());

            if (error) throw error;

            const templates = {};
            data?.forEach(log => {
                const key = log.template_key || 'unknown';
                if (!templates[key]) {
                    templates[key] = { template_key: key, sent: 0, opened: 0, clicked: 0 };
                }
                templates[key].sent++;
                if (log.status === 'opened') templates[key].opened++;
                if (log.status === 'clicked') templates[key].clicked++;
            });

            return Object.values(templates)
                .map(t => ({
                    ...t,
                    openRate: t.sent > 0 ? ((t.opened / t.sent) * 100).toFixed(1) : '0.0'
                }))
                .sort((a, b) => b.sent - a.sent)
                .slice(0, 10);
        }
    });

    return {
        stats: statsQuery.data,
        categories: categoriesQuery.data,
        timeSeries: timeSeriesQuery.data,
        templates: templatesQuery.data,
        isLoading: statsQuery.isLoading || categoriesQuery.isLoading || timeSeriesQuery.isLoading || templatesQuery.isLoading,
        error: statsQuery.error || categoriesQuery.error || timeSeriesQuery.error || templatesQuery.error
    };
}
