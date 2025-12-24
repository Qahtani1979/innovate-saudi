import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRoles() {
    return useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const { data, error } = await supabase.from('roles').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useRoleDetails(roleId) {
    return useQuery({
        queryKey: ['role-detail', roleId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('roles')
                .select('*')
                .eq('id', roleId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!roleId
    });
}

export function useUsersWithRole(roleId) {
    return useQuery({
        queryKey: ['role-users', roleId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*, user_profiles:user_id(full_name, user_email)')
                .eq('role_id', roleId)
                .eq('is_active', true);
            if (error) throw error;
            return data || [];
        },
        enabled: !!roleId
    });
}

export function useRoleMutations() {
    const queryClient = useQueryClient();

    const createRole = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('roles')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Role created');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateRole = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase
                .from('roles')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Role updated');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const deleteRole = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('roles').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Role deleted');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    return { createRole, updateRole, deleteRole };
}
