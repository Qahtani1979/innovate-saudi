import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCommunicationAudienceStats() {
    return useQuery({
        queryKey: ['communication-audience-stats'],
        queryFn: async () => {
            const [citizensRes, municipalitiesRes, partnersRes, usersRes] = await Promise.all([
                supabase.from('citizen_profiles').select('id', { count: 'exact', head: true }),
                supabase.from('municipalities').select('id', { count: 'exact', head: true }).eq('is_active', true),
                supabase.from('organizations').select('id', { count: 'exact', head: true }),
                supabase.from('user_profiles').select('id', { count: 'exact', head: true })
            ]);

            return {
                citizens: citizensRes.count || 0,
                municipalities: municipalitiesRes.count || 0,
                partners: partnersRes.count || 0,
                leadership: usersRes.count || 0
            };
        },
        staleTime: 1000 * 60 * 30 // Cache for 30 minutes
    });
}
