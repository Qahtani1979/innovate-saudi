import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useContent() {
    const useNews = (limit = 3) => useQuery({
        queryKey: ['news', limit],
        queryFn: async () => {
            const { data } = await supabase
                .from('news_articles')
                .select('id, title_en, title_ar, published_at, image_url')
                .eq('is_published', true)
                .order('published_at', { ascending: false })
                .limit(limit);
            return data || [];
        }
    });

    const usePlatformStats = () => useQuery({
        queryKey: ['platform-stats'],
        queryFn: async () => {
            const [challenges, pilots, solutions, municipalities] = await Promise.all([
                supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_published', true),
                supabase.from('pilots').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_published', true),
                supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_published', true),
                supabase.from('municipalities').select('*', { count: 'exact', head: true }).eq('is_active', true)
            ]);
            return {
                challenges: challenges.count || 0,
                pilots: pilots.count || 0,
                solutions: solutions.count || 0,
                municipalities: municipalities.count || 0
            };
        }
    });

    return {
        useNews,
        usePlatformStats
    };
}

