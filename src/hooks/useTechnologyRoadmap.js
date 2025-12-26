import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useVisibilitySystem } from '@/hooks/visibility/useVisibilitySystem';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';

/**
 * Hook for fetching technology roadmap items
 */
export function useTechnologyRoadmap(options = {}) {
    const { category, status, limit = 100 } = options;
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['technology-roadmap', { category, status, limit }],
        queryFn: async () => {
            let query = supabase
                .from('technology_roadmap')
                .select('*')
                .order('target_date', { ascending: true })
                .limit(limit);

            query = applyVisibilityRules(query, 'technology_roadmap');

            if (category) {
                query = query.eq('category', category);
            }
            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook for fetching single roadmap item
 */
export function useTechnologyRoadmapItem(id) {
    const { applyVisibilityRules } = useVisibilitySystem();

    return useQuery({
        queryKey: ['technology-roadmap-item', id],
        queryFn: async () => {
            let query = supabase
                .from('technology_roadmap')
                .select('*')
                .eq('id', id)
                .single();

            query = applyVisibilityRules(query, 'technology_roadmap');

            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

/**
 * Hook for technology roadmap mutations
 */
export function useTechnologyRoadmapMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    const createRoadmapItem = useMutation({
        mutationFn: async (data) => {
            const itemData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
                status: data.status || 'planned',
            };

            const { data: item, error } = await supabase
                .from('technology_roadmap')
                .insert(itemData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'technology_roadmap', item.id, null, itemData);

            return item;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['technology-roadmap']);
            toast.success(t({ en: 'Roadmap item created', ar: 'تم إنشاء عنصر خارطة الطريق' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create item', ar: 'فشل إنشاء العنصر' }));
            console.error('Create roadmap item error:', error);
        },
    });

    const updateRoadmapItem = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentItem } = await supabase
                .from('technology_roadmap')
                .select('*')
                .eq('id', id)
                .single();

            const { data: item, error } = await supabase
                .from('technology_roadmap')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'technology_roadmap', id, currentItem, data);

            return item;
        },
        onSuccess: (item) => {
            queryClient.invalidateQueries(['technology-roadmap']);
            queryClient.invalidateQueries(['technology-roadmap-item', item.id]);
            toast.success(t({ en: 'Roadmap item updated', ar: 'تم تحديث عنصر خارطة الطريق' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update item', ar: 'فشل تحديث العنصر' }));
            console.error('Update roadmap item error:', error);
        },
    });

    const deleteRoadmapItem = useMutation({
        mutationFn: async (id) => {
            const { data: currentItem } = await supabase
                .from('technology_roadmap')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('technology_roadmap')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'technology_roadmap', id, currentItem, { deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['technology-roadmap']);
            toast.success(t({ en: 'Roadmap item deleted', ar: 'تم حذف عنصر خارطة الطريق' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete item', ar: 'فشل حذف العنصر' }));
            console.error('Delete roadmap item error:', error);
        },
    });

    return {
        createRoadmapItem,
        updateRoadmapItem,
        deleteRoadmapItem,
    };
}

export default useTechnologyRoadmap;

