import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useOrganizationMutations(organizationId, onCreateSuccess) {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

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

            // Notification: Org Created
            notify({
                type: 'organization_created',
                entityType: 'organization',
                entityId: org.id,
                recipientEmails: ['admin@municipality.gov.sa'],
                title: 'New Organization Registered',
                message: `Organization "${org.name_en}" has been registered.`,
                sendEmail: true
            });
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

    const verifyOrganization = useMutation({
        /** @param {{ id: string, notes: string, verifier: string }} params */
        mutationFn: async ({ id, notes, verifier }) => {
            const { error } = await supabase
                .from('organizations')
                .update({
                    is_verified: true,
                    verification_date: new Date().toISOString().split('T')[0],
                    verification_notes: notes,
                    verified_by: verifier
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            queryClient.invalidateQueries({ queryKey: ['organization'] });
            queryClient.invalidateQueries({ queryKey: ['organizations-visibility'] });
            toast.success('Organization verified successfully');

            // Notification: Verified
            notify({
                type: 'organization_verified',
                entityType: 'organization',
                entityId: id,
                recipientEmails: [], // Notify Org Owner if possible (needs fetch)
                title: 'Organization Verified',
                message: 'Organization has been verified.',
                sendEmail: false
            });
        },
        onError: (error) => {
            console.error('Error verifying organization:', error);
            toast.error('Failed to verify organization');
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
        verifyOrganization,
        refreshOrganizations  // ✅ Gold Standard
    };
}


