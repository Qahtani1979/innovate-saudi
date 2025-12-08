import { usePermissions } from '../permissions/usePermissions';
import { base44 } from '@/api/base44Client';

// Row-level security rules
const RLS_RULES = {
  Challenge: (user) => {
    if (user.role === 'admin') return {};
    
    // Municipality users see only their city's challenges
    if (user.municipality_id) {
      return { municipality_id: user.municipality_id };
    }
    
    // Regular users see only their own or public challenges
    return {
      $or: [
        { created_by: user.email },
        { is_published: true }
      ]
    };
  },
  
  Pilot: (user) => {
    if (user.role === 'admin') return {};
    
    if (user.municipality_id) {
      return { municipality_id: user.municipality_id };
    }
    
    return {
      $or: [
        { 'team.email': user.email },
        { created_by: user.email }
      ]
    };
  },
  
  Solution: (user) => {
    if (user.role === 'admin') return {};
    
    // Providers see their own solutions + published ones
    if (user.organization_id) {
      return {
        $or: [
          { provider_id: user.organization_id },
          { is_published: true }
        ]
      };
    }
    
    return { is_published: true };
  },
  
  Organization: (user) => {
    if (user.role === 'admin') return {};
    
    // Users see their own org + partners
    if (user.organization_id) {
      return {
        $or: [
          { id: user.organization_id },
          { is_partner: true }
        ]
      };
    }
    
    return {};
  }
};

export function useRowLevelSecurity() {
  const { user, isAdmin } = usePermissions();

  const applyRLS = (entityType, baseQuery = {}) => {
    if (!user || isAdmin) return baseQuery;
    
    const rlsRule = RLS_RULES[entityType];
    if (!rlsRule) return baseQuery;
    
    const securityFilter = rlsRule(user);
    
    // Merge security filter with base query
    if (Object.keys(securityFilter).length === 0) {
      return baseQuery;
    }
    
    if (Object.keys(baseQuery).length === 0) {
      return securityFilter;
    }
    
    return {
      $and: [baseQuery, securityFilter]
    };
  };

  const canAccessRecord = (entityType, record) => {
    if (isAdmin) return true;
    if (!user) return false;
    
    const rlsRule = RLS_RULES[entityType];
    if (!rlsRule) return true;
    
    const filter = rlsRule(user);
    
    // Simple check - would need more sophisticated matching
    if (filter.created_by && record.created_by !== user.email) {
      return false;
    }
    
    if (filter.municipality_id && record.municipality_id !== user.municipality_id) {
      return false;
    }
    
    return true;
  };

  return {
    applyRLS,
    canAccessRecord
  };
}