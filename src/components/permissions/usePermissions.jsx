import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const usePermissions = () => {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => base44.entities.Role?.list() || [],
    enabled: !!user
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team?.list() || [],
    enabled: !!user
  });

  const { data: delegations = [] } = useQuery({
    queryKey: ['active-delegations'],
    queryFn: async () => {
      if (!user) return [];
      const now = new Date().toISOString();
      return base44.entities.DelegationRule.filter({
        delegate_email: user.email,
        is_active: true,
        start_date: { $lte: now },
        end_date: { $gte: now }
      });
    },
    enabled: !!user
  });

  const getUserPermissions = () => {
    if (!user) return [];

    const permissions = new Set();

    // Admin has all permissions
    if (user.role === 'admin') {
      return ['*'];
    }

    // Priority 1: Get permissions from assigned roles
    if (user.assigned_roles?.length) {
      user.assigned_roles.forEach(roleId => {
        const role = roles.find(r => r.id === roleId);
        if (role?.permissions) {
          role.permissions.forEach(p => permissions.add(p));
        }
      });
    }

    // Priority 2: Get permissions from assigned teams (merged with role permissions)
    if (user.assigned_teams?.length) {
      user.assigned_teams.forEach(teamId => {
        const team = teams.find(t => t.id === teamId);
        if (team?.permissions) {
          team.permissions.forEach(p => permissions.add(p));
        }
      });
    }

    // Priority 3: Get permissions from active delegations
    delegations.forEach(delegation => {
      if (delegation.permission_types) {
        delegation.permission_types.forEach(p => permissions.add(p));
      }
    });

    // Return merged unique permissions from roles, teams, and delegations
    return Array.from(permissions);
  };

  const hasPermission = (permission) => {
    const userPermissions = getUserPermissions();
    
    // Admin wildcard
    if (userPermissions.includes('*')) return true;
    
    // Check exact permission
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => hasPermission(p));
  };

  const canAccessEntity = (entityType, action) => {
    const permissionKey = `${entityType}_${action}`;
    return hasPermission(permissionKey);
  };

  return {
    user,
    roles,
    teams,
    permissions: getUserPermissions(),
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessEntity,
    isAdmin: user?.role === 'admin'
  };
};