import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

const TABLE_MAP = {
    'City': 'cities',
    'Organization': 'organizations',
    'Region': 'regions',
    'Challenge': 'challenges',
    'Solution': 'solutions',
    'RDProject': 'rd_projects',
    'Program': 'programs',
    'StrategicPlan': 'strategic_plans',
    'KnowledgeDocument': 'knowledge_documents',
    'CitizenIdea': 'citizen_ideas',
    'StrategicTheme': 'strategic_themes',
    'VisionObjective': 'vision_objectives',
    'KPICategory': 'kpi_categories',
    'Sector': 'sectors',
    'SubSector': 'sub_sectors',
    'Municipality': 'municipalities',
    'Provider': 'providers',
    'Pilot': 'pilots',
    'Event': 'events',
    'News': 'news',
    'FAQ': 'faqs',
    'Achievement': 'achievements',
    'Proposal': 'proposals',
    'Feedback': 'feedback',
    'Milestone': 'milestones',
    'Task': 'tasks',
    'Team': 'teams',
    'Role': 'roles',
    'User': 'users', // Be careful with this one
    'Validation': 'validations',
    'SandboxApplication': 'sandbox_applications',
    'Audit': 'audits'
};

const getTableName = (entityType) => {
    return TABLE_MAP[entityType] || entityType.toLowerCase() + 's';
};

export function useBulkMutations(entityType) {
    const { t } = useLanguage();
    const queryClient = useAppQueryClient();
    const tableName = getTableName(entityType);

    const updateBatch = useMutation({
        mutationFn: async ({ ids, data }) => {
            // Supabase doesn't have a native "update where id IN (...)" with different values, 
            // but for "same value to many", we can do:
            const { error } = await supabase
                .from(tableName)
                .update(data)
                .in('id', ids);

            if (error) throw error;
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([tableName]);
            queryClient.invalidateQueries([entityType]); // Invalidate generic keys too if used
            toast.success(t({ en: 'Batch update successful', ar: 'تم التحديث الجماعي بنجاح' }));
        },
        onError: (error) => {
            console.error('Batch update error:', error);
            toast.error(t({ en: 'Batch update failed', ar: 'فشل التحديث الجماعي' }));
        }
    });

    const deleteBatch = useMutation({
        mutationFn: async (ids) => {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .in('id', ids);

            if (error) throw error;
            return ids;
        },
        onSuccess: () => {
            queryClient.invalidateQueries([tableName]);
            queryClient.invalidateQueries([entityType]);
            toast.success(t({ en: 'Batch delete successful', ar: 'تم الحذف الجماعي بنجاح' }));
        },
        onError: (error) => {
            console.error('Batch delete error:', error);
            toast.error(t({ en: 'Batch delete failed', ar: 'فشل الحذف الجماعي' }));
        }
    });

    return {
        updateBatch,
        deleteBatch
    };
}

