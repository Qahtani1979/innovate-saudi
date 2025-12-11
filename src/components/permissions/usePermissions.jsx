import React from 'react';
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
        .select('role, municipality_id, organization_id')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });

  // Get user's municipality details (including region for national check)
  const { data: userMunicipality } = useQuery({
    queryKey: ['user-municipality', userRoles[0]?.municipality_id],
    queryFn: async () => {
      const municipalityId = userRoles[0]?.municipality_id;
      if (!municipalityId) return null;
      
      const { data, error } = await supabase
        .from('municipalities')
        .select(`
          *,
          region:regions(id, code, name_en, name_ar)
        `)
        .eq('id', municipalityId)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!userRoles[0]?.municipality_id
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

  // Extract role names for easier checking
  const roleNames = userRoles.map(r => r.role);
  
  const isAdmin = roleNames.includes('admin');
  
  // Check if user belongs to a national deputyship
  const isNationalEntity = userMunicipality?.region?.code === 'NATIONAL';
  
  // Deputyship user check
  const isDeputyship = isNationalEntity || 
    roleNames.includes('deputyship_admin') || 
    roleNames.includes('deputyship_staff');
  
  // Municipality user check
  const isMunicipality = !isNationalEntity && (
    roleNames.includes('municipality_admin') || 
    roleNames.includes('municipality_staff') || 
    roleNames.includes('municipality_coordinator')
  );

  // Staff user (either municipality or deputyship)
  const isStaffUser = isMunicipality || isDeputyship;

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
    return roleNames.includes(role);
  };

  const hasFunctionalRole = (roleName) => {
    if (isAdmin) return true;
    return functionalRoles.some(r => r.role_name === roleName);
  };

  // Get visibility scope for the user
  const getVisibilityScope = () => {
    if (isAdmin) {
      return { type: 'global', sectorIds: [], municipalityId: null };
    }
    
    if (isDeputyship && userMunicipality) {
      return {
        type: 'sectoral',
        sectorIds: userMunicipality.focus_sectors?.length > 0 
          ? userMunicipality.focus_sectors 
          : [userMunicipality.sector_id].filter(Boolean),
        municipalityId: userMunicipality.id
      };
    }
    
    if (isMunicipality && userMunicipality) {
      return {
        type: 'geographic',
        sectorIds: [],
        municipalityId: userMunicipality.id
      };
    }
    
    return { type: 'public', sectorIds: [], municipalityId: null };
  };

  return {
    user: session?.user ? { 
      ...session.user, 
      ...profile,
      role: roleNames[0] || 'user',
      municipality: userMunicipality
    } : null,
    userId,
    userEmail,
    profile,
    roles: roleNames,
    userRoles, // Full role objects with municipality_id/organization_id
    userMunicipality,
    functionalRoles,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessEntity,
    hasRole,
    hasFunctionalRole,
    isAdmin,
    // New visibility-related helpers
    isDeputyship,
    isMunicipality,
    isStaffUser,
    isNationalEntity,
    getVisibilityScope
  };
};
