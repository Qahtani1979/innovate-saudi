/**
 * Users with Visibility Hook
 * 
 * Fetches users that the current user can see/interact with
 * based on their visibility level (municipality, sector, etc.)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';

export function useUsersWithVisibility(options = {}) {
  const { limit = 100, includeInactive = false } = options;

  const {
    hasFullVisibility,
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const { isAdmin, organizationId } = usePermissions();

  return useQuery({
    queryKey: ['users-with-visibility', {
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      limit
    }],
    queryFn: async () => {
      // Admin or full visibility - all users
      if (isAdmin || hasFullVisibility) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      }

      // National deputyship - users in their sectors (via user_roles)
      if (isNational && sectorIds?.length > 0) {
        // Get users in municipalities that have entities in the user's sectors
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, municipality_id');
        
        if (rolesError) throw rolesError;

        // Get municipality IDs that are national or in user's sectors
        const relevantMunicipalityIds = new Set(nationalMunicipalityIds || []);
        
        // For sectoral visibility, we show users from all municipalities
        // since deputyship oversees across municipalities
        const relevantUserIds = userRoles
          .filter(ur => ur.municipality_id && (relevantMunicipalityIds.has(ur.municipality_id) || true))
          .map(ur => ur.user_id);

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      }

      // Municipality staff - users in same municipality
      if (userMunicipalityId) {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('municipality_id', userMunicipalityId);
        
        if (rolesError) throw rolesError;

        const userIds = userRoles.map(ur => ur.user_id);

        if (userIds.length === 0) return [];

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .in('id', userIds)
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      }

      // Organization member - users in same organization
      if (organizationId) {
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('user_email')
          .eq('organization_id', organizationId);
        
        if (membersError) throw membersError;

        const emails = orgMembers.map(m => m.user_email);

        if (emails.length === 0) return [];

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .in('email', emails)
          .limit(limit);
        
        if (error) throw error;
        return data || [];
      }

      // No visibility - return empty
      return [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export default useUsersWithVisibility;
