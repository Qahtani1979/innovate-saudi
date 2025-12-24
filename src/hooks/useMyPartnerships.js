import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfiles } from '@/hooks/useUserProfiles'; // Assuming this exists/works as seen in Page
import { differenceInDays } from 'date-fns';

export function useMyPartnerships(userEmail) {
    // 1. Get User Profile to find Organization ID
    const { data: userProfile } = useUserProfiles(userEmail);
    const orgId = userProfile?.organization_id;

    // Pagination State
    // Note: Since this hook uses manual query construction for complex OR logic, 
    // we accept page/pageSize as args usually, but standard simple hooks might fix them.
    // For consistency with useEntityPagination usage in components, we usually pass page to the hook?
    // useEntityPagination({ page: current }) -> re-runs query.
    // So let's accept { page = 1, pageSize = 12 } as options.
}

// We need to return a hook function similar to useEntityPagination factory result
export function useMyPartnershipsHook({ page = 1, pageSize = 12 } = {}, userEmail) {
    // This naming is awkward. Usually we just export `useMyPartnerships(userEmail, page)`.
    // Let's stick to the signature: useMyPartnerships(userEmail, { page, pageSize }) 
}

// Actual Implementation
export function useMyPartnerships(userEmail, { page = 1, pageSize = 12 } = {}) {
    const { data: userProfile } = useUserProfiles(userEmail);
    const orgId = userProfile?.organization_id;

    // 1. PAGINATED LIST
    const queryKey = ['my-partnerships', userEmail, orgId, page, pageSize];
    const { data: queryData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userEmail) return { data: [], count: 0 };

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            // Complex Filter: (Org matches) OR (Contact matches) OR (Created By matches)
            const orConditions = [
                `primary_contact_email.eq.${userEmail}`,
                `created_by.eq.${userEmail}`
            ];
            if (orgId) {
                // 'parties' is usually array of IDs. Check if array contains orgId.
                // Supabase 'cs' operator: parties.cs.{orgId}
                orConditions.push(`parties.cs.{${orgId}}`);
            }

            const { data, error, count } = await supabase
                .from('partnerships')
                .select('*', { count: 'exact' })
                .eq('is_deleted', false)
                .or(orConditions.join(','))
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;
            return { data, count };
        },
        enabled: !!userEmail, // Wait for email, orgId might be null which is fine
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000
    });

    // 2. STATS (Lightweight fetch for ALL matching partnerships to calculate health/counts)
    // We can't rely on the paginated page for totals.
    const { data: stats = { activeCount: 0, atRiskCount: 0, avgHealth: 0, upcomingMilestones: [] } } = useQuery({
        queryKey: ['my-partnerships-stats', userEmail, orgId],
        queryFn: async () => {
            if (!userEmail) return { activeCount: 0, atRiskCount: 0, avgHealth: 0, upcomingMilestones: [] };

            const orConditions = [
                `primary_contact_email.eq.${userEmail}`,
                `created_by.eq.${userEmail}`
            ];
            if (orgId) orConditions.push(`parties.cs.{${orgId}}`);

            // Fetch Minimal Fields for Stats
            const { data, error } = await supabase
                .from('partnerships')
                .select('id, status, milestones, deliverables, meetings, joint_initiatives')
                .eq('is_deleted', false)
                .or(orConditions.join(','));

            if (error) return { activeCount: 0 };

            const partnerships = data || [];
            const active = partnerships.filter(p => p.status === 'active');

            // Calculate Risk/Health (lightweight version of Page logic)
            // Health Score Logic (Duplicated from component for consistency)
            const calculateHealthScore = (p) => {
                const completedDel = p.deliverables?.filter(d => d.status === 'completed').length || 0;
                const totalDel = p.deliverables?.length || 1;
                const delScore = (completedDel / totalDel) * 40;

                const lastMeeting = p.meetings?.[0]?.date;
                const daysSince = lastMeeting ? differenceInDays(new Date(), new Date(lastMeeting)) : 90;
                const commScore = Math.max(0, 30 - (daysSince / 3));

                const initScore = Math.min(30, (p.joint_initiatives?.length || 0) * 10);
                return Math.round(delScore + commScore + initScore);
            };

            const atRisk = active.filter(p => calculateHealthScore(p) < 50).length;
            const healthSum = active.reduce((sum, p) => sum + calculateHealthScore(p), 0);
            const avgHealth = active.length ? Math.round(healthSum / active.length) : 0;

            // Milestones
            const milestones = active.flatMap(p => p.milestones || [])
                .filter(m => m.status !== 'completed' && m.due_date)
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                .slice(0, 5);

            return {
                activeCount: active.length,
                atRiskCount: atRisk,
                avgHealth,
                upcomingMilestones: milestones
            };
        },
        enabled: !!userEmail,
        staleTime: 5 * 60 * 1000
    });

    const data = queryData?.data || [];
    const totalCount = queryData?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        partnerships: data,
        stats,
        // Standard Pagination API
        isLoading,
        isEmpty: !isLoading && data.length === 0,
        totalCount,
        totalPages,
        currentPage: page,
        refetch
    };
}
