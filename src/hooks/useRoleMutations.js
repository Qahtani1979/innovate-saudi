import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';

export function useRoleMutations() {
    const queryClient = useAppQueryClient();
    const { notify } = useNotificationSystem();

    const createRole = useMutation({
        mutationFn: async (data) => {
            const { name, description, permissions } = data;
            const { data: role, error } = await supabase.from('roles').insert({ name, description }).select().single();
            if (error) throw error;

            if (permissions && permissions.length > 0) {
                const { data: permRecords } = await supabase
                    .from('permissions')
                    .select('id, code')
                    .in('code', permissions);

                if (permRecords && permRecords.length > 0) {
                    const rolePermInserts = permRecords.map(p => ({ role_id: role.id, permission_id: p.id }));
                    await supabase.from('role_permissions').insert(rolePermInserts);
                }
            }
            return role;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
            toast.success('Role created');

            // Notification: Role Created
            notify({
                type: 'role_created',
                entityType: 'role',
                entityId: 'new',
                recipientEmails: [],
                title: 'Role Created',
                message: 'New role created.',
                sendEmail: false
            });
        }
    });

    const updateRole = useMutation({
        mutationFn: async ({ id, data }) => {
            const { name, description, permissions } = data;
            const { error } = await supabase.from('roles').update({ name, description }).eq('id', id);
            if (error) throw error;

            if (permissions !== undefined) {
                // Delete existing permissions
                await supabase.from('role_permissions').delete().eq('role_id', id);

                // Insert new ones if any
                if (permissions.length > 0) {
                    const { data: permRecords } = await supabase
                        .from('permissions')
                        .select('id, code')
                        .in('code', permissions);

                    if (permRecords && permRecords.length > 0) {
                        const rolePermInserts = permRecords.map(p => ({ role_id: id, permission_id: p.id }));
                        await supabase.from('role_permissions').insert(rolePermInserts);
                    }
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
            toast.success('Role updated');

            // Notification: Role Updated
            notify({
                type: 'role_updated',
                entityType: 'role',
                entityId: 'id', // Not passed to onSuccess, assuming administrative
                recipientEmails: [],
                title: 'Role Updated',
                message: 'Role updated.',
                sendEmail: false
            });
        }
    });

    const deleteRole = useMutation({
        mutationFn: async (id) => {
            // Cleanup related data first
            await supabase.from('role_permissions').delete().eq('role_id', id);
            await supabase.from('user_roles').update({ is_active: false }).eq('role_id', id);

            const { error } = await supabase.from('roles').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Role deleted');

            // Notification: Role Deleted
            notify({
                type: 'role_deleted',
                entityType: 'role',
                entityId: 'id',
                recipientEmails: [],
                title: 'Role Deleted',
                message: 'Role deleted.',
                sendEmail: false
            });
        }
    });

    const bulkAddPermissions = useMutation({
        mutationFn: async ({ roles: selectedRoles, permissionCodes }) => {
            const { data: permRecords, error: fetchError } = await supabase
                .from('permissions')
                .select('id, code')
                .in('code', permissionCodes);

            if (fetchError) throw fetchError;
            if (!permRecords || permRecords.length === 0) throw new Error('No valid permissions found');

            for (const roleId of selectedRoles) {
                const { data: existing } = await supabase
                    .from('role_permissions')
                    .select('permission_id')
                    .eq('role_id', roleId);

                const existingPermIds = new Set(existing?.map(e => e.permission_id) || []);

                const newPermissions = permRecords
                    .filter(p => !existingPermIds.has(p.id))
                    .map(p => ({
                        role_id: roleId,
                        permission_id: p.id
                    }));

                if (newPermissions.length > 0) {
                    const { error: insertError } = await supabase.from('role_permissions').insert(newPermissions);
                    if (insertError) throw insertError;
                }
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
            toast.success('Permissions added to selected roles');
        }
    });

    const bulkRemovePermissions = useMutation({
        mutationFn: async ({ roles: selectedRoles, permissionCodes }) => {
            const { data: permRecords, error: fetchError } = await supabase
                .from('permissions')
                .select('id, code')
                .in('code', permissionCodes);

            if (fetchError) throw fetchError;
            if (!permRecords || permRecords.length === 0) throw new Error('No valid permissions found');

            const permIds = permRecords.map(p => p.id);

            for (const roleId of selectedRoles) {
                const { error: deleteError } = await supabase
                    .from('role_permissions')
                    .delete()
                    .eq('role_id', roleId)
                    .in('permission_id', permIds);

                if (deleteError) throw deleteError;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
            toast.success('Permissions removed from selected roles');
        }
    });

    const bulkDeleteRoles = useMutation({
        mutationFn: async ({ roles: selectedRoles, allRoles }) => {
            const deletable = selectedRoles.filter(roleId => {
                const role = allRoles.find(r => r.id === roleId);
                return !role?.is_system_role;
            });

            for (const roleId of deletable) {
                await supabase.from('role_permissions').delete().eq('role_id', roleId);
                await supabase.from('user_roles').update({ is_active: false }).eq('role_id', roleId);
                await supabase.from('roles').delete().eq('id', roleId);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Selected roles deleted');
        }
    });

    return {
        createRole,
        updateRole,
        deleteRole,
        bulkAddPermissions,
        bulkRemovePermissions,
        bulkDeleteRoles
    };
}



