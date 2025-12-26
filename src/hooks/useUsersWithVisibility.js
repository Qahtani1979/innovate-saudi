/**
 * Users with Visibility Hook
 * 
 * Fetches users that the current user can see/interact with
 * based on their visibility level (municipality, sector, etc.)
 * 
 * Refactored to support Pagination and Standard Response Shape { data, count }.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

export function useUsersWithVisibility(options = {}) {
  const { page = 1, pageSize = 20, filters = {} } = options;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

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
      page,
      pageSize,
      filters
    }],
    queryFn: async () => {
      // 1. Admin or full visibility - All users
      if (isAdmin || hasFullVisibility) {
        let query = supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(start, end);

        if (filters.search) {
          query = query.or(`full_name_en.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
      }

      // 2. National deputyship - Users in Sectors
      if (isNational && sectorIds?.length > 0) {
        // Fetch User IDs first (Permission Layer)
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, municipality_id');

        if (rolesError) throw rolesError;

        const relevantMunicipalityIds = new Set(nationalMunicipalityIds || []);

        const relevantUserIds = userRoles
          .filter(ur => ur.municipality_id && (relevantMunicipalityIds.has(ur.municipality_id) || true)) // Strategy: Deputyship sees all?
          .map(ur => ur.user_id);

        if (relevantUserIds.length === 0) return { data: [], count: 0 };

        // Fetch Profiles
        let query = supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .in('id', relevantUserIds)
          .range(start, end);

        if (filters.search) {
          query = query.or(`full_name_en.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
      }

      // 3. Municipality staff
      if (userMunicipalityId) {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('municipality_id', userMunicipalityId);

        if (rolesError) throw rolesError;
        const userIds = userRoles.map(ur => ur.user_id);

        if (userIds.length === 0) return { data: [], count: 0 };

        let query = supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .in('id', userIds)
          .range(start, end);

        if (filters.search) {
          query = query.or(`full_name_en.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
      }

      // 4. Organization member
      if (organizationId) {
        const { data: orgMembers, error: membersError } = await supabase
          .from('organization_members')
          .select('user_email')
          .eq('organization_id', organizationId);

        if (membersError) throw membersError;
        const emails = orgMembers.map(m => m.user_email);

        if (emails.length === 0) return { data: [], count: 0 };

        let query = supabase
          .from('user_profiles')
          .select('*', { count: 'exact' })
          .in('email', emails)
          .range(start, end);

        if (filters.search) {
          query = query.or(`full_name_en.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
        }

        const { data, count, error } = await query;
        if (error) throw error;
        return { data: data || [], count: count || 0 };
      }

      return { data: [], count: 0 };
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2,
    keepPreviousData: true,
  });
}

export default useUsersWithVisibility;
