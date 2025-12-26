import { usePermissions } from './usePermissions';

// Row-level security rules configuration
export const RLS_RULES = {
  Challenge: {
    municipalityUser: (user, entity) => {
      // Municipality users see only their city's challenges
      return user.municipality_id === entity.municipality_id || user.city_id === entity.city_id;
    },
    orgUser: (user, entity) => {
      // Organization users see only challenges they created or are stakeholders in
      return entity.created_by === user.email || 
             entity.stakeholders?.some(s => s.email === user.email);
    }
  },
  Pilot: {
    municipalityUser: (user, entity) => {
      return user.municipality_id === entity.municipality_id || user.city_id === entity.city_id;
    },
    providerUser: (user, entity) => {
      // Providers see pilots they're involved in
      return entity.team?.some(member => member.email === user.email) ||
             entity.created_by === user.email;
    }
  },
  Solution: {
    providerUser: (user, entity) => {
      // Providers see only their own solutions
      return user.organization_id === entity.provider_id || 
             entity.created_by === user.email;
    }
  },
  RDProject: {
    academicUser: (user, entity) => {
      // Researchers see projects they're involved in
      return entity.principal_investigator?.email === user.email ||
             entity.team_members?.some(m => m.email === user.email) ||
             entity.created_by === user.email;
    }
  },
  Organization: {
    orgUser: (user, entity) => {
      // Users see only their own organization's full details
      return user.organization_id === entity.id;
    }
  }
};

export const useRowLevelSecurity = (entityType) => {
  const { user, isAdmin, hasPermission } = usePermissions();

  const canAccessEntity = (entity) => {
    // Admins can access everything
    if (isAdmin) return true;

    // Users with "view_all" permission can see all
    const viewAllPermission = `${entityType.toLowerCase()}_view_all`;
    if (hasPermission(viewAllPermission)) return true;

    // Apply RLS rules based on user type
    const rules = RLS_RULES[entityType];
    if (!rules) return true; // No rules = accessible to all

    // Determine user type and apply appropriate rule
    if (user?.municipality_id && rules.municipalityUser) {
      return rules.municipalityUser(user, entity);
    }
    
    if (user?.organization_id && rules.orgUser) {
      return rules.orgUser(user, entity);
    }

    if (user?.organization_id && rules.providerUser) {
      return rules.providerUser(user, entity);
    }

    if (rules.academicUser && (user?.institution_id || user?.areas_of_expertise?.length)) {
      return rules.academicUser(user, entity);
    }

    // Default: user created it or is assigned
    return entity.created_by === user?.email;
  };

  const filterEntities = (entities) => {
    if (!entities) return [];
    if (isAdmin) return entities;

    return entities.filter(entity => canAccessEntity(entity));
  };

  const getEntityQuery = () => {
    // Returns query filter to apply RLS at database level
    if (isAdmin) return {};

    const viewAllPermission = `${entityType.toLowerCase()}_view_all`;
    if (hasPermission(viewAllPermission)) return {};

    const filters = [];

    // Add user-specific filters
    if (user?.municipality_id) {
      filters.push({ municipality_id: user.municipality_id });
    }
    
    if (user?.city_id) {
      filters.push({ city_id: user.city_id });
    }

    if (user?.organization_id) {
      filters.push({ provider_id: user.organization_id });
    }

    // Always include entities created by user
    filters.push({ created_by: user?.email });

    // Combine with OR logic
    return filters.length > 0 ? { $or: filters } : {};
  };

  return {
    canAccessEntity,
    filterEntities,
    getEntityQuery
  };
};

// HOC for entity lists with RLS
export function withRowLevelSecurity(Component, entityType) {
  return function RLSWrappedComponent(props) {
    const { filterEntities } = useRowLevelSecurity(entityType);
    
    const filteredData = filterEntities(props.data || []);
    
    return <Component {...props} data={filteredData} />;
  };
}
