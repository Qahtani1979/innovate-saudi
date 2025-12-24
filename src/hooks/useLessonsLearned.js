import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch lessons learned
 */
export function useLessonsLearned() {
    return useQuery({
        queryKey: ['lessons-learned'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('lessons_learned')
                .select(`
                    *,
                    sector:sectors(id, name_en, name_ar),
                    municipality:municipalities(id, name_en, name_ar)
                `)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
}

export default useLessonsLearned;
