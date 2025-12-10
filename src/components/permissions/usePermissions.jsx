import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const usePermissions = () => {
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Get user's app_role from user_roles table
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-app-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
    enabled: !!userId
  });

  // Get permissions using the new database function
  const { data: permissions = [] } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .rpc('get_user_permissions', { _user_id: userId });
      if (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!userId
  });

  // Get functional roles using the new database function
  const { data: functionalRoles = [] } = useQuery({
    queryKey: ['user-functional-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .rpc('get_user_functional_roles', { _user_id: userId });
      if (error) {
        console.error('Error fetching functional roles:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!userId
  });

  const isAdmin = userRoles.includes('admin');

  const hasPermission = (permission) => {
    // Admin wildcard
    if (isAdmin || permissions.includes('*')) return true;
    // Check exact permission
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (isAdmin || permissions.includes('*')) return true;
    return permissionList.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (permissionList) => {
    if (isAdmin || permissions.includes('*')) return true;
    return permissionList.every(p => permissions.includes(p));
  };

  const canAccessEntity = (entityType, action) => {
    const permissionKey = `${entityType}_${action}`;
    return hasPermission(permissionKey);
  };

  const hasRole = (role) => {
    if (isAdmin) return true;
    return userRoles.includes(role);
  };

  const hasFunctionalRole = (roleName) => {
    if (isAdmin) return true;
    return functionalRoles.some(r => r.role_name === roleName);
  };

  return {
    user: session?.user ? { 
      ...session.user, 
      ...profile,
      role: userRoles[0] || 'user'
    } : null,
    userId,
    userEmail,
    profile,
    roles: userRoles,
    functionalRoles,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessEntity,
    hasRole,
    hasFunctionalRole,
    isAdmin
  };
};
