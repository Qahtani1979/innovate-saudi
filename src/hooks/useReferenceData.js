import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useMunicipalities() {
    return useQuery({
        queryKey: ['municipalities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('municipalities').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60 // 1 hour
    });
}

export function useRegions() {
    return useQuery({
        queryKey: ['regions'],
        queryFn: async () => {
            const { data, error } = await supabase.from('regions').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useCities() {
    return useQuery({
        queryKey: ['cities'],
        queryFn: async () => {
            const { data, error } = await supabase.from('cities').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useServices() {
    return useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const { data, error } = await supabase.from('services').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useSubsectors() {
    return useQuery({
        queryKey: ['subsectors'],
        queryFn: async () => {
            const { data, error } = await supabase.from('subsectors').select('*').order('name_en');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 60
    });
}

export function useCitizenIdeas() {
    return useQuery({
        queryKey: ['citizen-ideas-approved'],
        queryFn: async () => {
            const { data, error } = await supabase.from('citizen_ideas').select('*').eq('status', 'approved');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5
    });
}

export function useCitizenIdea(id) {
    return useQuery({
        queryKey: ['citizen-idea', id],
        queryFn: async () => {
            const { data, error } = await supabase.from('citizen_ideas').select('*').eq('id', id).maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5
    });
}

/**
 * Hook to load reference data for entity resolution (AI Uploader)
 * @param {string[]} fields - Array of field names that need reference data
 */
export function useEntityReferenceData(fields = []) {
    const LOOKUP_TABLES = {
        sector_id: { table: 'sectors', nameField: 'name_en' },
        municipality_id: { table: 'municipalities', nameField: 'name_en' },
        region_id: { table: 'regions', nameField: 'name_en' },
        city_id: { table: 'cities', nameField: 'name_en' },
        organization_id: { table: 'organizations', nameField: 'name_en' },
        provider_id: { table: 'providers', nameField: 'name_en' },
        subsector_id: { table: 'subsectors', nameField: 'name_en' },
        service_id: { table: 'services', nameField: 'name_en' },
        ministry_id: { table: 'ministries', nameField: 'name_en' },
        program_id: { table: 'programs', nameField: 'name_en' },
        pilot_id: { table: 'pilots', nameField: 'name_en' },
        challenge_id: { table: 'challenges', nameField: 'title_en' },
        solution_id: { table: 'solutions', nameField: 'name_en' },
    };

    return useQuery({
        queryKey: ['entity-reference-data', fields.sort().join(',')],
        queryFn: async () => {
            const refData = {};

            const neededLookups = Object.entries(LOOKUP_TABLES).filter(([field]) =>
                fields.includes(field) ||
                fields.some(f => f.includes(field.replace('_id', '')))
            );

            for (const [field, config] of neededLookups) {
                try {
                    const { data } = await supabase
                        .from(config.table)
                        .select(`id, ${config.nameField}, name_ar`)
                        .limit(500);

                    if (data) {
                        refData[field] = data.map(item => ({
                            id: item.id,
                            name_en: item[config.nameField] || item.name_en || item.title_en,
                            name_ar: item.name_ar || item.title_ar
                        }));
                    }
                } catch (e) {
                    console.warn(`Failed to load ${config.table}:`, e);
                }
            }

            return refData;
        },
        enabled: fields.length > 0,
        staleTime: 5 * 60 * 1000
    });
}

/**
 * Hook to check for database duplicates
 */
export function useCheckDatabaseDuplicates(tableName, fieldName, values = []) {
    return useQuery({
        queryKey: ['database-duplicates', tableName, fieldName, values.slice(0, 50).join(',')],
        queryFn: async () => {
            if (!tableName || !fieldName || values.length === 0) {
                return [];
            }

            let query = supabase
                .from(tableName)
                .select(fieldName)
                .in(fieldName, values.slice(0, 50))
                .limit(100);

            const tablesWithDeleted = [
                'challenges', 'solutions', 'pilots', 'programs', 'providers',
                'organizations', 'rd_projects', 'sandboxes', 'events', 'contracts',
                'budgets', 'strategic_plans', 'rd_calls'
            ];

            if (tablesWithDeleted.includes(tableName)) {
                query = query.eq('is_deleted', false);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Database duplicate check error:', error);
                return [];
            }

            return data || [];
        },
        enabled: !!tableName && !!fieldName && values.length > 0,
        staleTime: 1 * 60 * 1000
    });
}


