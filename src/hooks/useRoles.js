import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';


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

export function useUserRoles(userId) {
    return useQuery({
        queryKey: ['user-roles-settings', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('user_roles')
                .select('role, municipality_id, organization_id')
                .eq('user_id', userId);
            if (error) throw error;
            return data || [];
        },
        enabled: !!userId
    });
}


