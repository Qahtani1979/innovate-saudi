import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage City and Region data for the admin interface.
 * Enforces visibility rules via useVisibilitySystem.
 */
export function useCityManagement(t) {
    const queryClient = useAppQueryClient();
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    // --- Queries ---

    const { data: cities = [], isLoading: isCitiesLoading } = useQuery({
        queryKey: ['cities-management'],
        queryFn: () => fetchWithVisibility('cities', '*', {
            orderBy: 'name_en',
            // Default filter usually active=true, but management might need deleted/inactive too?
            // The existing page filters by is_deleted=false, so we keep that default in fetchWithVisibility if possible
            // OR we fetch all and filter in UI? 
            // Existing code: .eq('is_deleted', false)
            // We'll interpret this as standard visibility for "active" items.
            additionalFilters: (query) => query.eq('is_deleted', false)
        }),
        enabled: !isVisibilityLoading
    });

    const { data: regions = [], isLoading: isRegionsLoading } = useQuery({
        queryKey: ['regions-management'],
        queryFn: () => fetchWithVisibility('regions', '*', { orderBy: 'name_en' }),
        enabled: !isVisibilityLoading
    });

    // --- Mutations ---

    const createCityMutation = useMutation({
        mutationFn: async (data) => {
            // Admin operation: Direct insert is usually fine as RLS protects it, 
            // but wrapped here for consistency.
            const { data: newCity, error } = await supabase.from('cities').insert(data).select().single();
            if (error) throw error;
            return newCity;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cities-management']);
            toast.success(t({ en: 'City created', ar: 'تم إنشاء المدينة' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Failed to create city', ar: 'فشل إنشاء المدينة' }));
        }
    });

    const updateCityMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: updatedCity, error } = await supabase.from('cities').update(data).eq('id', id).select().single();
            if (error) throw error;
            return updatedCity;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cities-management']);
            toast.success(t({ en: 'City updated', ar: 'تم تحديث المدينة' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Failed to update city', ar: 'فشل تحديث المدينة' }));
        }
    });

    const deleteCityMutation = useMutation({
        mutationFn: async (id) => {
            // Soft delete
            const { error } = await supabase.from('cities').update({ is_deleted: true }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cities-management']);
            toast.success(t({ en: 'City deleted', ar: 'تم حذف المدينة' }));
        },
        onError: (error) => {
            toast.error(error.message || t({ en: 'Failed to delete city', ar: 'فشل حذف المدينة' }));
        }
    });

    const isLoading = isVisibilityLoading || isCitiesLoading || isRegionsLoading;

    return {
        cities,
        regions,
        createCityMutation,
        updateCityMutation,
        deleteCityMutation,
        isLoading
    };
}

