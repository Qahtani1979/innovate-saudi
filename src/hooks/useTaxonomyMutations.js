import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';

import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useTaxonomyMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

    // --- Sectors ---
    const createSector = useMutation({
        mutationFn: async (data) => {
            const { data: newSector, error } = await supabase.from('sectors').insert(data).select().single();
            if (error) throw error;
            return newSector;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sectors']);
            notify.success('Sector created');

            // Notification: Sector Created
            notify({
                type: 'sector_created',
                entityType: 'sector',
                entityId: 'new_sector', // ID not in scope unless we change onSuccess(data)
                recipientEmails: [],
                title: 'Sector Created',
                message: 'New sector created.',
                sendEmail: false
            });
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
            notify.success('Sector updated');
        }
    });

    const deleteSector = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('sectors').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['sectors']);
            notify.success('Sector deleted');
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
            notify.success('Subsector created');
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
            notify.success('Subsector updated');
        }
    });

    const deleteSubsector = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('subsectors').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['subsectors']);
            notify.success('Subsector deleted');
        }
    });

    // --- Services ---
    const createService = useMutation({
        mutationFn: async (data) => {
            const { data: newService, error } = await supabase.from('services').insert(data).select().single();
            if (error) throw error;
            return newService;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['services']);
            notify.success('Service created');
        }
    });

    const updateService = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: updated, error } = await supabase.from('services').update(data).eq('id', id).select().single();
            if (error) throw error;
            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['services']);
            notify.success('Service updated');
        }
    });

    const deleteService = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['services']);
            notify.success('Service deleted');
        }
    });

    // --- Tags ---
    const createTag = useMutation({
        mutationFn: async (data) => {
            const { data: newTag, error } = await supabase.from('tags').insert(data).select().single();
            if (error) throw error;
            return newTag;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tags']);
            queryClient.invalidateQueries(['tags-all']); // Invalidate both potential keys
            notify.success('Tag created');
        }
    });

    const deleteTag = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('tags').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['tags']);
            queryClient.invalidateQueries(['tags-all']);
            notify.success('Tag deleted');
        }
    });

    return {
        createSector,
        updateSector,
        deleteSector,
        createSubsector,
        updateSubsector,
        deleteSubsector,
        createService,
        updateService,
        deleteService,
        createTag,
        deleteTag
    };
}

