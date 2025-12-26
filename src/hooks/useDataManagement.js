import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage data entities for the Data Management Hub
 * Centralizes fetching, creating, updating, and deleting entities with visibility.
 */
export function useDataManagement(t) {
    const queryClient = useAppQueryClient();
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    // --- Fetching ---

    const { data: regions = [], isLoading: isRegionsLoading } = useQuery({
        queryKey: ['regions-dm'],
        queryFn: () => fetchWithVisibility('regions', '*', { orderBy: 'name_en' }),
        enabled: !isVisibilityLoading
    });

    const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
        queryKey: ['cities-dm'],
        queryFn: () => fetchWithVisibility('cities', '*', { orderBy: 'name_en' }),
        enabled: !isVisibilityLoading
    });

    const { data: organizations = [], isLoading: isOrgsLoading } = useQuery({
        queryKey: ['organizations-dm'],
        queryFn: () => fetchWithVisibility('organizations', '*', { orderBy: 'name_en' }),
        enabled: !isVisibilityLoading
    });

    const { data: challenges = [], isLoading: isChallengesLoading } = useQuery({
        queryKey: ['challenges-dm'],
        queryFn: () => fetchWithVisibility('challenges', '*', { orderBy: 'title_en' }),
        enabled: !isVisibilityLoading
    });

    const { data: solutions = [], isLoading: isSolutionsLoading } = useQuery({
        queryKey: ['solutions-dm'],
        queryFn: () => fetchWithVisibility('solutions', '*', { orderBy: 'title_en' }),
        enabled: !isVisibilityLoading
    });

    const { data: knowledgeDocs = [] } = useQuery({
        queryKey: ['knowledgeDocs-dm'],
        queryFn: () => fetchWithVisibility('knowledge_documents', '*'),
        enabled: !isVisibilityLoading
    });

    const { data: citizenIdeas = [] } = useQuery({
        queryKey: ['citizenIdeas-dm'],
        queryFn: () => fetchWithVisibility('citizen_ideas', '*'),
        enabled: !isVisibilityLoading
    });

    const { data: municipalities = [] } = useQuery({
        queryKey: ['municipalities-count-dm'],
        queryFn: () => fetchWithVisibility('municipalities', 'id'),
        enabled: !isVisibilityLoading
    });

    // --- Mutations ---

    const createMutation = useMutation({
        mutationFn: async ({ entity, data }) => {
            const tableMap = {
                'Region': 'regions',
                'City': 'cities',
                'Organization': 'organizations',
                'Municipality': 'municipalities'
            };

            const tableName = tableMap[entity];
            if (!tableName) throw new Error(`Unsupported entity: ${entity}`);

            // We still use direct Insert here as standard, but ideally wrapped in a service or RLS
            const { data: result, error } = await supabase.from(tableName).insert([data]).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success(t({ en: 'Created successfully', ar: 'تم الإنشاء بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Creation failed', ar: 'فشل الإنشاء' }));
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ entity, id, data }) => {
            const tableMap = {
                'Region': 'regions',
                'City': 'cities',
                'Organization': 'organizations',
                'Municipality': 'municipalities'
            };

            const tableName = tableMap[entity];
            if (!tableName) throw new Error(`Unsupported entity: ${entity}`);

            const { data: result, error } = await supabase.from(tableName).update(data).eq('id', id).select().single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success(t({ en: 'Updated successfully', ar: 'تم التحديث بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Update failed', ar: 'فشل التحديث' }));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ entity, id }) => {
            const tableMap = {
                'Region': 'regions',
                'City': 'cities',
                'Organization': 'organizations',
                'Municipality': 'municipalities'
            };

            const tableName = tableMap[entity];
            if (!tableName) throw new Error(`Unsupported entity: ${entity}`);

            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();
            toast.success(t({ en: 'Deleted successfully', ar: 'تم الحذف بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Delete failed', ar: 'فشل الحذف' }));
        }
    });

    const isLoading = isVisibilityLoading || isRegionsLoading || isCitiesLoading || isOrgsLoading;

    return {
        // Data
        regions,
        cities,
        organizations,
        challenges,
        solutions,
        knowledgeDocs,
        citizenIdeas,
        municipalities,

        // Mutations
        createMutation,
        updateMutation,
        deleteMutation,

        // State
        isLoading
    };
}

