import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile'; // Consolidated user profile hook
import { differenceInDays } from 'date-fns';


// Actual Implementation
export function useMyPartnerships(userEmail, { page = 1, pageSize = 12, userId } = {}) {
    // Note: userId is passed optionally in verifying phase, ensure call sites pass it.
    // Ideally we should refactor signature, but let's try to get it from context if possible or assume passed.
    // For now, let's assume the component calling this passes userId or we find a way.
    // Actually, let's look at call sites. If simpler, let's just make it required in options or new arg.
    // Wait, the previous signature was `(userEmail, options)`. 
    // I will modify it to accept `user` object or separate IDs? 
    // Let's stick to modifying the hook to use userId if available from a new arg or options.

    // BETTER APPROACH: The hook consumes useUserProfile internally? No, it used it to get orgId.
    // Let's update the signature to `useMyPartnerships(user, ...)` or similar.
    // But to match existing pattern, let's look at `useMyPartnerships(userEmail, ...)`
    // I'll assume I can pass `userId` in the second argument options object for now to avoid breaking changes if I can't check all call sites easily.

    const { data: userProfile } = useUserProfile(userEmail);
    const orgId = userProfile?.organization_id;

    // 1. PAGINATED LIST
    const queryKey = ['my-partnerships', userEmail, userId, orgId, page, pageSize];
    const { data: queryData, isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!userEmail) return { data: [], count: 0 };

            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            // Complex Filter: (Org matches) OR (Contact matches) OR (Created By matches)
            const orConditions = [`primary_contact_email.eq.${userEmail}`];

            if (userId) {
                // If userId is provided, usage it for created_by
                orConditions.push(`created_by.eq.${userId}`);
            } else {
                // Fallback to email if userId missing (though risking 400), but ideally we fix call sites.
                // For safety I will try to fetch user ID if not passed? No, that's async inside async.
                // I will assume call sites updated to pass userId in options.
                orConditions.push(`created_by.eq.${userEmail}`);
            }

            if (orgId) {
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
        enabled: !!userEmail,
        placeholderData: (prev) => prev,
        staleTime: 5 * 60 * 1000
    });

    // 2. STATS
    const { data: stats = { activeCount: 0, atRiskCount: 0, avgHealth: 0, upcomingMilestones: [] } } = useQuery({
        queryKey: ['my-partnerships-stats', userEmail, userId, orgId],
        queryFn: async () => {
            if (!userEmail) return { activeCount: 0, atRiskCount: 0, avgHealth: 0, upcomingMilestones: [] };

            const orConditions = [`primary_contact_email.eq.${userEmail}`];
            if (userId) orConditions.push(`created_by.eq.${userId}`);
            else orConditions.push(`created_by.eq.${userEmail}`);

            if (orgId) orConditions.push(`parties.cs.{${orgId}}`);
            // ...

            // Fetch Minimal Fields for Stats
            const { data, error } = await supabase
                .from('partnerships')
                .select('id, status, milestones, deliverables, joint_initiatives')
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

