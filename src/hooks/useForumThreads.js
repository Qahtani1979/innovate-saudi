import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch forum threads
 * @param {{ limit?: number }} options
 */
export function useForumThreads(options = {}) {
    const { limit = 20 } = options;

    return useQuery({
        queryKey: ['forum-threads', limit],
        queryFn: async () => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('forum_threads')
                .select('*')
                .order('last_activity', { ascending: false })
                .limit(limit);
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });
}
