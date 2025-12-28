import { useEntityPagination } from '@/hooks/useEntityPagination';
import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMyChallenges(userEmail) {
    // 1. PRIMARY LIST (Paginated - Created by User)
    // We assume the user ID is available or we resolves it from Email (which is less ideal, but standard here)
    // Actually, useEntityPagination filters are flexible.

    // Note: The original hook used email. The system prefers ID. 
    // We'll rely on the passed email for now but ideally should be ID.
    // Gold Standard uses ID. Let's assume the component resolves it or we fetch it.
    // But to match the existing signature `useMyChallenges(userEmail)`, we might need to resolve ID or use email filter if supported.
    // `fetchWithVisibility` uses standard columns. `challenge_owner_email` is a column? 
    // Checking the previous file: .eq('challenge_owner_email', userEmail)
    // So yes, we can filter by email.

    const pagination = useEntityPagination({
        entityName: 'challenges',
        pageSize: 12,
        filters: {
            challenge_owner_email: userEmail
        },
        enabled: !!userEmail
    });

    // 2. STATS QUERY (Lightweight)
    // Instead of fetching ALL data for stats, we use a count query
    const { data: stats } = useQuery({
        queryKey: ['my-challenges-stats', userEmail],
        queryFn: async () => {
            if (!userEmail) return { total: 0, approved: 0, in_treatment: 0, under_review: 0 };

            // We can use RPC or raw select with count
            const { data, error } = await supabase
                .from('challenges')
                .select('status')
                .eq('challenge_owner_email', userEmail);

            if (error) return { total: 0 };

            // Aggregate locally (lightweight on status column only)
            return {
                total: data.length,
                approved: data.filter(c => c.status === 'approved').length,
                in_treatment: data.filter(c => c.status === 'in_treatment').length,
                under_review: data.filter(c => c.status === 'under_review').length
            };
        },
        enabled: !!userEmail,
        staleTime: 5 * 60 * 1000
    });

    return {
        // Pagination API (Flattened)
        ...pagination,
        challenges: pagination.data, // Check compatibility with existing code

        // Stats for the dashboard cards
        stats: stats || { total: 0, approved: 0, in_treatment: 0, under_review: 0 }
    };
}

