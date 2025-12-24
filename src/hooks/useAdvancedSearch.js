import { supabase } from '@/integrations/supabase/client';

/**
 * Advanced search across multiple entity types
 */
export async function searchWithFilters(filters) {
    const results = [];
    const entityTypeToTable = {
        Challenge: 'challenges',
        Pilot: 'pilots',
        Solution: 'solutions',
        RDProject: 'rd_projects',
        Program: 'programs',
        Organization: 'organizations'
    };

    const entities = filters.entityType === 'all'
        ? ['Challenge', 'Pilot', 'Solution', 'RDProject', 'Program', 'Organization']
        : [filters.entityType];

    for (const entityType of entities) {
        try {
            const tableName = entityTypeToTable[entityType];
            let query = supabase.from(tableName).select('*').limit(10);

            if (filters.sector !== 'all') query = query.eq('sector', filters.sector);
            if (filters.status !== 'all') query = query.eq('status', filters.status);
            if (filters.priority !== 'all') query = query.eq('priority', filters.priority);
            if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
            if (filters.query) {
                query = query.or(`title_en.ilike.%${filters.query}%,name_en.ilike.%${filters.query}%,description_en.ilike.%${filters.query}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (!error && data) {
                results.push(...data.map(item => ({ ...item, _type: entityType })));
            }
        } catch (error) {
            console.error(`Search error for ${entityType}:`, error);
        }
    }

    return results;
}

export function useAdvancedSearch() {
    return { searchWithFilters };
}
