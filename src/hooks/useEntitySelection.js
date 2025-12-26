import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch available entities for selection (Pilots, Challenges, Solutions, etc.)
 */
export function useAvailableEntities(entityType) {
    return useQuery({
        queryKey: ['available-entities', entityType],
        queryFn: async () => {
            if (!entityType) return [];

            let table = '';
            let select = 'id, title_en, created_at'; // Default select
            let filter = (q) => q.eq('is_deleted', false);

            switch (entityType) {
                case 'pilot':
                    table = 'pilots';
                    break;
                case 'challenge':
                    table = 'challenges';
                    break;
                case 'solution':
                    table = 'solutions';
                    select = 'id, name_en, created_at';
                    break;
                case 'rd_project':
                    table = 'rd_projects';
                    break;
                case 'program':
                    table = 'programs';
                    select = 'id, title_en, created_at';
                    break;
                default:
                    return [];
            }

            let query = supabase.from(table).select(select);
            query = filter(query);
            query = query.order('created_at', { ascending: false }).limit(50);

            const { data, error } = await query;
            if (error) throw error;

            // Normalize data for dropdowns
            return (data || []).map(item => ({
                id: item.id,
                title: item.title_en || item.name_en || 'Untitled',
                created_at: item.created_at
            }));
        },
        enabled: !!entityType,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook to fetch specific single entity details for display
 */
export function useEntityDetails(entityType, entityId) {
    return useQuery({
        queryKey: ['entity-details', entityType, entityId],
        queryFn: async () => {
            if (!entityType || !entityId) return null;

            let table = '';
            switch (entityType) {
                case 'pilot': table = 'pilots'; break;
                case 'challenge': table = 'challenges'; break;
                case 'solution': table = 'solutions'; break;
                case 'rd_project': table = 'rd_projects'; break;
                default: return null;
            }

            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', entityId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!entityType && !!entityId
    });
}
