import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

/**
 * Hook for fetching a single living lab by ID.
 */
export function useLivingLab(id) {
    return useQuery({
        queryKey: ['living-lab', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_labs')
                .select(`
          *,
          municipality:municipalities(id, name_en, name_ar, region_id),
          sector:sectors(id, name_en, name_ar)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Hook to manage living lab mutations
 */
export function useLivingLabMutations(labId) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const updateLivingLab = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('living_labs')
                .update(data)
                .eq('id', labId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['living-lab', labId]);
            queryClient.invalidateQueries(['living-labs-with-visibility']);
            toast.success(t({ en: 'Living lab updated', ar: 'تم تحديث المختبر' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update living lab', ar: 'فشل تحديث المختبر' }));
            console.error('Update error:', error);
        }
    });

    const createLivingLab = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('living_labs')
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['living-labs-with-visibility']);
            toast.success(t({ en: 'Living lab created', ar: 'تم إنشاء المختبر' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create living lab', ar: 'فشل إنشاء المختبر' }));
            console.error('Create error:', error);
        }
    });

    return {
        updateLivingLab,
        createLivingLab
    };
}

export default useLivingLab;
