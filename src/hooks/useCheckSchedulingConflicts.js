import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useCheckSchedulingConflicts() {
    const eventsQuery = useQuery({
        queryKey: ['conflict-check-events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('id, title_en, title_ar, start_date, end_date, event_type')
                .eq('is_deleted', false)
                .gte('start_date', new Date().toISOString());
            if (error) throw error;
            return data || [];
        }
    });

    const pilotsQuery = useQuery({
        queryKey: ['conflict-check-pilots'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('id, title_en, title_ar, timeline')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    const programsQuery = useQuery({
        queryKey: ['conflict-check-programs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('id, name_en, name_ar, timeline')
                .eq('is_deleted', false);
            if (error) throw error;
            return data || [];
        }
    });

    return {
        events: eventsQuery.data || [],
        pilots: pilotsQuery.data || [],
        programs: programsQuery.data || [],
        isLoading: eventsQuery.isLoading || pilotsQuery.isLoading || programsQuery.isLoading,
        isError: eventsQuery.isError || pilotsQuery.isError || programsQuery.isError
    };
}

