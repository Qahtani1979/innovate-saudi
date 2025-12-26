import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useChallengeResolutionTracker() {
    return useQuery({
        queryKey: ['resolution-tracker-challenges'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('challenges')
                .select(`
                    *,
                    municipality:municipalities(id, name_en, name_ar),
                    sector:sectors(id, name_en, name_ar)
                `)
                .eq('is_deleted', false)
                .in('status', ['approved', 'in_treatment', 'resolved', 'archived'])
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });
}
