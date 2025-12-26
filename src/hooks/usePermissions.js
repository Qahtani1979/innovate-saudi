import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Safe defaults for when queries are loading or fail
const SAFE_DEFAULTS = {
  user: null,
  userId: null,
  userEmail: null,
  profile: null,
  roles: [],
  userRoles: [],
  userMunicipality: null,
  functionalRoles: [],
  permissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  canAccessEntity: () => false,
  hasRole: () => false,
  hasFunctionalRole: () => false,
  isAdmin: false,
  isDeputyship: false,
  isMunicipality: false,
  isStaffUser: false,
  isNationalEntity: false,
  getVisibilityScope: () => ({ type: 'public', sectorIds: [], municipalityId: null }),
};

export function usePermissions() {
  // Get current user session
  const { data: session, isError: sessionError } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  // Get user profile (handle case where profile doesn't exist yet)
  const { data: profile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!userId,
    retry: 1,
  });

  // Get user's roles from user_roles table
  // Supports both legacy 'role' text column and new 'role_id' FK to roles table
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user-app-roles', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          role_id,
          municipality_id,
          organization_id,
          is_active,
          roles:role_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!userId,
    retry: 1,
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
    enabled: !!userRoles[0]?.municipality_id,
    retry: 1,
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
    enabled: !!userId,
    retry: 1,
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
    enabled: !!userId,
    retry: 1,
  });

  // Extract role names - check both direct 'role' column and joined 'roles.name'
  const roleNames = (userRoles || []).map(r => r.role || r.roles?.name).filter(Boolean);
  
  // Admin check - check both direct role column and joined roles table
  const isAdmin = (userRoles || []).some(r => 
    r.role?.toLowerCase() === 'admin' || r.roles?.name?.toLowerCase() === 'admin'
  );
  
  // Check if user belongs to a national deputyship
  const isNationalEntity = userMunicipality?.region?.code === 'NATIONAL';
  
  // Deputyship user check - check both direct role and joined roles
  const isDeputyship = isNationalEntity || 
    (userRoles || []).some(r => 
      (r.role || r.roles?.name)?.toLowerCase().includes('deputyship')
    );
  
  // Municipality user check - check both direct role and joined roles
  const isMunicipality = !isNationalEntity && 
    (userRoles || []).some(r => 
      (r.role || r.roles?.name)?.toLowerCase().includes('municipality')
    );

  // Staff user (either municipality or deputyship)
  const isStaffUser = isMunicipality || isDeputyship;

  const hasPermission = (permission) => {
    // Admin wildcard
    if (isAdmin || (permissions || []).includes('*')) return true;
    // Check exact permission
    return (permissions || []).includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    if (isAdmin || (permissions || []).includes('*')) return true;
    return (permissionList || []).some(p => (permissions || []).includes(p));
  };

  const hasAllPermissions = (permissionList) => {
    if (isAdmin || (permissions || []).includes('*')) return true;
    return (permissionList || []).every(p => (permissions || []).includes(p));
  };

  const canAccessEntity = (entityType, action) => {
    const permissionKey = `${entityType}_${action}`;
    return hasPermission(permissionKey);
  };

  // Check role by name - supports both direct role column and joined roles table
  const hasRole = (role) => {
    if (isAdmin) return true;
    return roleNames.some(name => 
      name?.toLowerCase() === role?.toLowerCase()
    );
  };

  const hasFunctionalRole = (roleName) => {
    if (isAdmin) return true;
    return (functionalRoles || []).some(r => r.role_name === roleName);
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
    userRoles: userRoles || [], // Full role objects with municipality_id/organization_id
    userMunicipality,
    functionalRoles: functionalRoles || [],
    permissions: permissions || [],
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
}
