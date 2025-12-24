import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageContext';

export function usePartnershipMutations(onCreateSuccess) {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const createPartnership = useMutation({
        mutationFn: async ({ data, userEmail }) => {
            const { error } = await supabase
                .from('partnerships')
                .insert({
                    ...data,
                    status: 'prospect',
                    created_by: userEmail
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['partnerships']);
            queryClient.invalidateQueries(['partnerships-with-visibility']);
            toast.success(t({ en: 'Partnership created successfully', ar: 'تم إنشاء الشراكة بنجاح' }));
            if (onCreateSuccess) onCreateSuccess();
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create partnership', ar: 'فشل في إنشاء الشراكة' }));
            console.error(error);
        }
    });

    const updatePartnership = useMutation({
        mutationFn: async ({ id, ...data }) => {
            const { error } = await supabase
                .from('partnerships')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['partnerships']);
            queryClient.invalidateQueries(['partnerships-with-visibility']);
            toast.success(t({ en: 'Partnership updated successfully', ar: 'تم تحديث الشراكة بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update partnership', ar: 'فشل في تحديث الشراكة' }));
            console.error(error);
        }
    });

    /**
     * Refresh partnerships cache (Gold Standard Pattern)
     */
    const refreshPartnerships = () => {
        queryClient.invalidateQueries({ queryKey: ['partnerships'] });
        queryClient.invalidateQueries({ queryKey: ['partnerships-with-visibility'] });
    };

    return {
        createPartnership,
        updatePartnership,
        refreshPartnerships  // ✅ Gold Standard
    };
}

export default usePartnershipMutations;
