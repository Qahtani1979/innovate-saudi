import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOrganizationMutations(organizationId, onCreateSuccess) {
    const queryClient = useQueryClient();

    const createOrganization = useMutation({
        mutationFn: async (data) => {
            const cleanData = { ...data };
            cleanData.is_active = true; // Always active on creation

            const { data: org, error } = await supabase
                .from('organizations')
                .insert(cleanData)
                .select()
                .single();

            if (error) throw error;

            // Auto-generate embedding
            try {
                await supabase.functions.invoke('generate-embeddings', {
                    body: {
                        entity_name: 'Organization',
                        entity_ids: [org.id]
                    }
                });
            } catch (err) {
                console.error('Embedding generation failed:', err);
            }

            return org;
        },
        onSuccess: (org) => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            queryClient.invalidateQueries({ queryKey: ['organizations-visibility'] });
            if (onCreateSuccess) onCreateSuccess(org);
        },
        onError: (error) => {
            console.error('Error creating organization:', error);
            toast.error('Failed to create organization');
        }
    });

    const updateOrganization = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('organizations')
                .update(data)
                .eq('id', organizationId);

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['organization', organizationId] })
            queryClient.invalidateQueries({ queryKey: ['organizations-visibility'] });

            // Auto-generate embedding if content changed
            try {
                supabase.functions.invoke('generate-embeddings', {
                    body: {
                        entity_name: 'Organization',
                        entity_ids: [organizationId],
                        mode: 'missing'
                    }
                });
            } catch (err) {
                console.error('Embedding generation failed:', err);
            }
            toast.success('Organization updated successfully');
        },
        onError: (error) => {
            console.error('Error updating organization:', error);
            toast.error('Failed to update organization');
        }
    });

    /**
     * Refresh organizations cache (Gold Standard Pattern)
     */
    const refreshOrganizations = () => {
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        queryClient.invalidateQueries({ queryKey: ['organizations-visibility'] });
        if (organizationId) {
            queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
        }
    };

    return {
        createOrganization,
        updateOrganization,
        refreshOrganizations  // ✅ Gold Standard
    };
}
