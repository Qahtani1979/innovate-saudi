import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useMutation } from '@tanstack/react-query';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

/**
 * Hook to manage user role mutations
 */
export function useUserRoleMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

    const addRole = useMutation({
        /**
         * @param {{ userId: string, role: string }} params
         */
        mutationFn: async ({ userId, role }) => {
            const { data, error } = await supabase
                .from('user_roles')
                .insert({ user_id: userId, role })
                .select();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, { userId }) => {
            toast.success('Role added successfully');
            queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] }); // Maybe refresh user list too

            // Notification: Role Added
            notify({
                type: 'user_role_assigned',
                entityType: 'user_role',
                entityId: userId,
                recipientEmails: [], // User presumably
                title: 'Role Assigned',
                message: 'A new role has been assigned to your account.',
                sendEmail: true
            });
        },
        onError: (error) => {
            console.error('Error adding role:', error);
            toast.error('Failed to add role');
        }
    });

    const removeRole = useMutation({
        /**
         * @param {{ userId: string, role: string }} params
         */
        mutationFn: async ({ userId, role }) => {
            const { error } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId)
                .eq('role', role);

            if (error) throw error;
        },
        onSuccess: (_, { userId }) => {
            toast.success('Role removed successfully');
            queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
            queryClient.invalidateQueries({ queryKey: ['users'] });

            // Notification: Role Removed
            notify({
                type: 'user_role_removed',
                entityType: 'user_role',
                entityId: userId,
                recipientEmails: [], // User
                title: 'Role Removed',
                message: 'A role has been removed from your account.',
                sendEmail: true
            });
        },
        onError: (error) => {
            console.error('Error removing role:', error);
            toast.error('Failed to remove role');
        }
    });

    const updateRoles = useMutation({
        /**
        * @param {{ userId: string, roles: string[] }} params
        */
        mutationFn: async ({ userId, roles }) => {
            // First delete all existing roles for user
            const { error: deleteError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (deleteError) throw deleteError;

            // Then insert new roles
            if (roles.length > 0) {
                const rolesToInsert = roles.map(role => ({ user_id: userId, role }));
                const { error: insertError } = await supabase
                    .from('user_roles')
                    .insert(rolesToInsert);

                if (insertError) throw insertError;
            }
        },
        onSuccess: (_, { userId }) => {
            toast.success('Roles updated successfully');
            queryClient.invalidateQueries(['user-roles', userId]);

            // Notification: Roles Updated
            notify({
                type: 'user_roles_updated',
                entityType: 'user_role',
                entityId: userId,
                recipientEmails: [],
                title: 'Roles Updated',
                message: 'Your account roles have been updated.',
                sendEmail: true
            });
        },
        onError: (error) => {
            console.error('Error updating roles:', error);
            toast.error('Failed to update roles');
        }
    });

    return { addRole, removeRole, updateRoles };
}

