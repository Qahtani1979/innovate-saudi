import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTaxonomyMutations() {
    const queryClient = useQueryClient();

    // --- Sectors ---
    const createSector = useMutation({
        mutationFn: async (data) => {
            const { data: newSector, error } = await supabase.from('sectors').insert(data).select().single();
            if (error) throw error;
            return newSector;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sectors']);
            toast.success('Sector created');
        }
    });

    const updateSector = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: updated, error } = await supabase.from('sectors').update(data).eq('id', id).select().single();
            if (error) throw error;
            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sectors']);
            toast.success('Sector updated');
        }
    });

    const deleteSector = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('sectors').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sectors']);
            toast.success('Sector deleted');
        }
    });

    // --- Subsectors ---
    const createSubsector = useMutation({
        mutationFn: async (data) => {
            const { data: newSub, error } = await supabase.from('subsectors').insert(data).select().single();
            if (error) throw error;
            return newSub;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['subsectors']);
            toast.success('Subsector created');
        }
    });

    const updateSubsector = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: updated, error } = await supabase.from('subsectors').update(data).eq('id', id).select().single();
            if (error) throw error;
            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['subsectors']);
            toast.success('Subsector updated');
        }
    });

    const deleteSubsector = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('subsectors').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['subsectors']);
            toast.success('Subsector deleted');
        }
    });

    // --- Tags ---
    // (Assuming tags might strictly need mutation later, but Builder fetched them)

    return {
        createSector,
        updateSector,
        deleteSector,
        createSubsector,
        updateSubsector,
        deleteSubsector
    };
}
