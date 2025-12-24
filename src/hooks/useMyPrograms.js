import { useEntityPagination } from '@/hooks/useEntityPagination';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMyPrograms(userEmail, page = 1) {
    // 1. PAGINATED APPLICATIONS (Main List)
    // We join the 'programs' table to get details efficiently without fetching all programs.
    // Assuming standard Supabase relationship: program_applications.program_id -> programs.id
    const pagination = useEntityPagination({
        entityName: 'program_applications',
        pageSize: 12,
        page,
        select: '*, program:programs(*)', // Join program details
        filters: {
            applicant_email: userEmail
        },
        enabled: !!userEmail
    });

    // 2. DASHBOARD STATS (Lightweight Count)
    const { data: stats = { total: 0, pending: 0, graduated: 0, enrolled: 0 } } = useQuery({
        queryKey: ['my-programs-stats', userEmail],
        queryFn: async () => {
            if (!userEmail) return { total: 0, pending: 0, graduated: 0, enrolled: 0 };

            const { data, error } = await supabase
                .from('program_applications')
                .select('status')
                .eq('applicant_email', userEmail);

            if (error) return { total: 0 };

            return {
                total: data.length,
                enrolled: data.filter(a => ['accepted', 'enrolled'].includes(a.status)).length,
                pending: data.filter(a => ['submitted', 'under_review'].includes(a.status)).length,
                graduated: data.filter(a => a.status === 'graduated').length
            };
        },
        enabled: !!userEmail,
        staleTime: 5 * 60 * 1000
    });

    // 3. UPCOMING EVENTS (For Enrolled Programs)
    // We first need the IDs of enrolled programs. This is a potential 2-step fetch, 
    // but usually "My Events" is a distinct widget. 
    // We can fetch "events for programs where I have an accepted application".
    const { data: upcomingEvents = [] } = useQuery({
        queryKey: ['my-program-events-dashboard', userEmail],
        queryFn: async () => {
            if (!userEmail) return [];

            // Step 1: Get Enrolled Program IDs (Lightweight)
            const { data: apps } = await supabase
                .from('program_applications')
                .select('program_id')
                .eq('applicant_email', userEmail)
                .in('status', ['accepted', 'enrolled']);

            const programIds = apps?.map(a => a.program_id) || [];
            if (programIds.length === 0) return [];

            // Step 2: Fetch Events
            const { data: events, error } = await supabase
                .from('events')
                .select('*')
                .in('program_id', programIds)
                .eq('is_deleted', false)
                .gte('start_date', new Date().toISOString())
                .order('start_date', { ascending: true })
                .limit(5);

            if (error) throw error;
            return events || [];
        },
        enabled: !!userEmail,
        staleTime: 10 * 60 * 1000
    });

    return {
        // Pagination
        ...pagination,
        applications: pagination.data, // Alias for component readability

        // Dashboard Data
        stats,
        upcomingEvents
    };
}
