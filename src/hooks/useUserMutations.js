/**
 * User Mutations Hook
 * Centralized mutations for user management, profiles, and roles.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS, ENTITY_TYPES } from './useAuditLogger';

export function useUserMutations() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();

    /**
     * Invite Users (bulk or single)
     */
    const inviteUsers = useMutation({
        mutationFn: async (invites) => {
            // Ensure invites is an array
            const invitesArray = Array.isArray(invites) ? invites : [invites];

            const invitesWithMetadata = invitesArray.map(invite => ({
                ...invite,
                invited_by: user?.id,
                status: 'pending',
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            }));

            const { data, error } = await supabase
                .from('user_invitations')
                .insert(invitesWithMetadata)
                .select();

            if (error) throw error;

            // Log for each invite
            await Promise.all(data.map(invite =>
                logCrudOperation(
                    AUDIT_ACTIONS.CREATE,
                    ENTITY_TYPES.USER, // Using USER as entity type for invitations
                    invite.id,
                    null,
                    { ...invite, action: 'invite_sent' }
                )
            ));

            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
            toast.success(`Successfully invited ${data.length} user(s)`);
        },
        onError: (error) => {
            console.error('Invite error:', error);
            toast.error('Failed to send invitations');
        }
    });

    /**
     * Resend Invitation
     */
    const resendInvitation = useMutation({
        mutationFn: async (id) => {
            const { data, error } = await supabase
                .from('user_invitations')
                .update({
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
            toast.success('Invitation resent');
        },
        onError: (error) => {
            toast.error(`Failed to resend: ${error.message}`);
        }
    });

    /**
     * Cancel Invitation
     */
    const cancelInvitation = useMutation({
        mutationFn: async (id) => {
            const { data: currentInvite } = await supabase
                .from('user_invitations')
                .select('*')
                .eq('id', id)
                .single();

            const { data, error } = await supabase
                .from('user_invitations')
                .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange(
                ENTITY_TYPES.USER,
                id,
                currentInvite?.status,
                'cancelled',
                { record_type: 'invitation' }
            );

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
            toast.success('Invitation cancelled');
        },
        onError: (error) => {
            toast.error(`Failed to cancel invitation: ${error.message}`);
        }
    });

    /**
     * Update User Profile (Admin or Self)
     */
    const updateUserProfile = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentProfile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', id)
                .single();

            const { data: updatedProfile, error } = await supabase
                .from('user_profiles')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(
                AUDIT_ACTIONS.UPDATE,
                ENTITY_TYPES.USER,
                id,
                currentProfile,
                data
            );

            return updatedProfile;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
            queryClient.invalidateQueries({ queryKey: ['user-profile', id] });
            toast.success('Profile updated details');
        },
        onError: (error) => {
            toast.error(`Failed to update profile: ${error.message}`);
        }
    });

    /**
     * Assign/Update User Roles
     * This handles the complex logic of replacing roles or adding them
     */
    const updateUserRoles = useMutation({
        mutationFn: async ({ userId, roles }) => {
            // 1. Get current roles
            const { data: currentRoles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', userId);

            const currentRoleNames = currentRoles?.map(r => r.role) || [];

            // 2. Delete existing roles (simple replacement strategy for MVP)
            // Note: In a real prod app you might want to diff them to minimal updates
            const { error: deleteError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // 3. Insert new roles
            if (roles.length > 0) {
                const { error: insertError } = await supabase
                    .from('user_roles')
                    .insert(roles.map(role => ({
                        user_id: userId,
                        role: role,
                        assigned_by: user?.id,
                        assigned_at: new Date().toISOString()
                    })));

                if (insertError) throw insertError;
            }

            await logCrudOperation(
                AUDIT_ACTIONS.UPDATE,
                ENTITY_TYPES.USER,
                userId,
                { roles: currentRoleNames },
                { roles: roles }
            );

            return roles;
        },
        onSuccess: (_, { userId }) => {
            queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
            toast.success('User roles updated');
        },
        onError: (error) => {
            toast.error(`Failed to update roles: ${error.message}`);
        }
    });

    /**
     * Deactivate User (Soft Delete / Status Change)
     */
    const deactivateUser = useMutation({
        mutationFn: async (userId) => {
            const { error } = await supabase
                .from('user_profiles')
                .update({
                    is_active: false,
                    deactivated_at: new Date().toISOString(),
                    deactivated_by: user?.id
                })
                .eq('user_id', userId);

            if (error) throw error;

            await logStatusChange(
                ENTITY_TYPES.USER,
                userId,
                'active',
                'inactive'
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user-profiles'] });
            toast.success('User deactivated');
        }
    });

    return {
        inviteUsers,
        cancelInvitation,
        updateUserProfile,
        updateUserRoles,
        deactivateUser,
        resendInvitation
    };
}

export default useUserMutations;
