import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useNewsData() {
    const { data: pilots = [], isLoading: pilotsLoading } = useQuery({
        queryKey: ['pilots-news'],
        queryFn: async () => {
            const { data } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true)
                .in('stage', ['scaled', 'completed'])
                .order('updated_at', { ascending: false })
                .limit(5);
            return data || [];
        }
    });

    const { data: programs = [], isLoading: programsLoading } = useQuery({
        queryKey: ['programs-news'],
        queryFn: async () => {
            const { data } = await supabase
                .from('programs')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true)
                .eq('status', 'active')
                .order('created_at', { ascending: false })
                .limit(5);
            return data || [];
        }
    });

    return {
        pilots,
        programs,
        isLoading: pilotsLoading || programsLoading
    };
}
