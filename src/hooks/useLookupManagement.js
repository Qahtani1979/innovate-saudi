import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';

export function useLookupStats() {
    return useQuery({
        queryKey: ['lookup-stats'],
        queryFn: async () => {
            const [departments, specializations, pendingEntries, rules] = await Promise.all([
                supabase.from('lookup_departments').select('*', { count: 'exact', head: true }),
                supabase.from('lookup_specializations').select('*', { count: 'exact', head: true }),
                supabase.from('custom_entries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('auto_approval_rules').select('*', { count: 'exact', head: true })
            ]);

            return {
                departmentsCount: departments.count || 0,
                specializationsCount: specializations.count || 0,
                pendingEntriesCount: pendingEntries.count || 0,
                rulesCount: rules.count || 0
            };
        },
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
}

export function useLookupData({ tableName, queryKey, sortColumn = 'display_order', enabled = true }) {
    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .order(sortColumn);
            if (error) throw error;
            return data || [];
        },
        enabled
    });
}

export function useLookupMutations({ tableName, queryKey, entityName }) {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const label = entityName || { en: 'Item', ar: 'العنصر' };

    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (data.id) {
                const { error } = await supabase.from(tableName).update(data).eq('id', data.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from(tableName).insert(data);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t({ en: `${label.en} saved`, ar: `تم حفظ ${label.ar}` }));
        },
        onError: () => toast.error(t({ en: 'Failed to save', ar: 'فشل في الحفظ' }))
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success(t({ en: `${label.en} deleted`, ar: `تم حذف ${label.ar}` }));
        },
        onError: () => toast.error(t({ en: 'Failed to delete', ar: 'فشل في الحذف' }))
    });


    return { saveMutation, deleteMutation };
}

export function useReviewCustomEntry() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: async ({ id, status, reviewNotes, entry }) => {
            const { error } = await supabase
                .from('custom_entries')
                .update({
                    status,
                    review_notes: reviewNotes,
                    reviewed_at: new Date().toISOString()
                })
                .eq('id', id);
            if (error) throw error;

            // If approved, add to the appropriate lookup table
            if (status === 'approved' && entry) {
                const table = entry.entry_type === 'department' ? 'lookup_departments' : 'lookup_specializations';
                const { error: insertError } = await supabase.from(table).insert({
                    name_en: entry.name_en,
                    name_ar: entry.name_ar,
                    is_active: true,
                    display_order: 99
                });
                if (insertError) throw insertError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['custom-entries-admin'] });
            queryClient.invalidateQueries({ queryKey: ['lookup-departments-admin'] });
            queryClient.invalidateQueries({ queryKey: ['lookup-specializations-admin'] });
            queryClient.invalidateQueries({ queryKey: ['lookup-stats'] });
            toast.success(t({ en: 'Entry reviewed', ar: 'تمت المراجعة' }));
        },
        onError: () => toast.error(t({ en: 'Failed to review', ar: 'فشل في المراجعة' }))
    });
}


