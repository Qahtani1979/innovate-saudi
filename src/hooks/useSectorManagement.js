import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
/**
 * Hook for Sector Management
 * Handles fetching and mutations for Sectors, Subsectors, Services, and Deputyships.
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useTaxonomy } from '@/contexts/TaxonomyContext';

export function useSectorManagement() {
    const { t } = useLanguage();
    const queryClient = useAppQueryClient();
    const { refetch: refetchTaxonomy } = useTaxonomy();

    // --- Queries ---

    const { data: sectors = [], isLoading: loadingSectors, error: sectorsError } = useQuery({
        queryKey: ['sectors-management'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sectors')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: subsectors = [], isLoading: loadingSubsectors } = useQuery({
        queryKey: ['subsectors-management'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('subsectors')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: services = [], isLoading: loadingServices } = useQuery({
        queryKey: ['services-management'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5,
    });

    const { data: deputyships = [] } = useQuery({
        queryKey: ['deputyships-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('deputyships')
                .select('id, name_en, name_ar, code')
                .eq('is_active', true)
                .order('display_order');
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 30,
    });

    // --- Mutations ---

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ['sectors-management'] });
        queryClient.invalidateQueries({ queryKey: ['subsectors-management'] });
        queryClient.invalidateQueries({ queryKey: ['services-management'] });
        queryClient.invalidateQueries({ queryKey: ['taxonomy-global'] });
        refetchTaxonomy(); // Update context
    };

    const createMutation = useMutation({
        mutationFn: async ({ table, data }) => {
            const { error } = await supabase.from(table).insert([data]);
            if (error) throw error;
        },
        onSuccess: () => {
            invalidateAll();
            toast.success(t({ en: 'Created successfully', ar: 'تم الإنشاء بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ table, id, data }) => {
            const { error } = await supabase.from(table).update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            invalidateAll();
            toast.success(t({ en: 'Updated successfully', ar: 'تم التحديث بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async ({ table, id }) => {
            const { error } = await supabase
                .from(table)
                .update({ is_active: false, is_deleted: true, deleted_at: new Date().toISOString() })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            invalidateAll();
            toast.success(t({ en: 'Deleted successfully', ar: 'تم الحذف بنجاح' }));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    return {
        sectors,
        subsectors,
        services,
        deputyships,
        loadingSectors,
        loadingSubsectors,
        loadingServices,
        sectorsError,
        createMutation,
        updateMutation,
        deleteMutation
    };
}



