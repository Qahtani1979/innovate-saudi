import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook to fetch program applications
 * Typically for admin/dashboard use
 */
export function useProgramApplications(options = {}) {
    const { programId, status, limit = 1000 } = options;
    const { isAdmin, hasRole, userId } = usePermissions();

    const isStaff = hasRole('municipality_staff') || hasRole('deputyship_staff') || isAdmin;

    return useQuery({
        queryKey: ['program-applications', { programId, status, userId, isStaff }],
        queryFn: async () => {
            let query = supabase
                .from('program_applications')
                .select('*, program:programs(name_en, name_ar)')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (programId) query = query.eq('program_id', programId);
            if (status) query = query.eq('status', status);

            // If not staff, only see own applications (unless we want to enforce RLS strictly, but filtering here helps)
            if (!isStaff && userId) {
                query = query.eq('applicant_id', userId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!userId
    });
}

export default useProgramApplications;

