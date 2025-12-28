import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useEventAnalytics(options = {}) {
    const {
        timeRange = 'all' // all, 30, 90, 365
    } = options;

    // 1. Fetch Aggregated Event Stats
    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['event-analytics-stats', timeRange],
        queryFn: async () => {
            const now = new Date();
            let startDateStr = null;

            if (timeRange === '30') {
                const date = new Date();
                date.setDate(date.getDate() - 30);
                startDateStr = date.toISOString();
            } else if (timeRange === '90') {
                const date = new Date();
                date.setDate(date.getDate() - 90);
                startDateStr = date.toISOString();
            } else if (timeRange === '365') {
                const date = new Date();
                date.setFullYear(date.getFullYear() - 1);
                startDateStr = date.toISOString();
            }

            // We need to fetch raw data to aggregate because Supabase JS client 
            // doesn't support complex aggregations easily without views/rpcs.
            // For now, we fetch optimized subset of fields.

            let query = supabase
                .from('events')
                .select('id, event_type, status, start_date, registration_count, is_virtual')
                .eq('is_deleted', false);

            if (startDateStr) {
                query = query.gte('start_date', startDateStr);
            }

            const { data: events, error } = await query;
            if (error) throw error;

            // Calculate aggregations in JS
            const totalEvents = events.length;
            const completedEvents = events.filter(e => e.status === 'completed').length;
            const upcomingEvents = events.filter(e => new Date(e.start_date) > now).length;
            const virtualCount = events.filter(e => e.is_virtual).length;
            const inPersonCount = totalEvents - virtualCount;

            // Events by Type
            const typeCounts = {};
            events.forEach(e => {
                typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1;
            });
            const eventsByType = Object.entries(typeCounts).map(([type, count]) => ({
                type: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
                count
            }));

            // Status Distribution
            const statusCounts = {};
            events.forEach(e => {
                statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
            });
            const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
                value: count,
                color: status === 'completed' ? '#10B981' :
                    status === 'published' ? '#3B82F6' :
                        status === 'draft' ? '#9CA3AF' :
                            status === 'cancelled' ? '#EF4444' : '#F59E0B'
            }));

            // Calculate total registrations
            const totalRegistrations = events.reduce((sum, e) => sum + (e.registration_count || 0), 0);
            const avgRegistrations = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0;

            // Calculate Monthly Trend (Last 12 Months)
            const monthlyTrend = [];
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthEvents = events.filter(e => {
                    const eventDate = new Date(e.start_date);
                    return eventDate.getFullYear() === date.getFullYear() &&
                        eventDate.getMonth() === date.getMonth();
                });

                monthlyTrend.push({
                    month: date.toLocaleDateString('en-US', { month: 'short' }),
                    monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
                    rawDate: date,
                    events: monthEvents.length,
                    registrations: 0 // Placeholder
                });
            }

            return {
                totalEvents,
                completedEvents,
                upcomingEvents,
                filteredEvents: events,
                totalRegistrations,
                avgRegistrations,
                eventsByType,
                statusDistribution,
                modeDistribution: [
                    { name: 'Virtual', value: virtualCount, color: '#8B5CF6' },
                    { name: 'In-Person', value: inPersonCount, color: '#F59E0B' }
                ],
                monthlyTrend
            };
        },
        staleTime: 5 * 60 * 1000
    });

    // 2. Fetch Registration Trends (requires joining or separate query on event_registrations)
    // We'll fetch this separately to avoid blocking the main stats
    const { data: registrationStats, isLoading: regLoading } = useQuery({
        queryKey: ['event-analytics-registrations', timeRange],
        queryFn: async () => {
            // This might be heavy, so we limit fields
            const { data: regs, error } = await supabase
                .from('event_registrations')
                .select('status, attendance_status')
                .eq('is_deleted', false);

            if (error) throw error;

            const attended = regs.filter(r => r.attendance_status === 'attended').length;
            const total = regs.length;
            const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

            return {
                totalRegistrationsFromTable: total,
                attendedCount: attended,
                attendanceRate: rate
            };
        },
        staleTime: 10 * 60 * 1000
    });

    return {
        ...stats,
        ...registrationStats,
        isLoading: statsLoading || regLoading
    };
}

export default useEventAnalytics;

