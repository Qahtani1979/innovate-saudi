/**
 * Organizations With Visibility Hook
 * 
 * Fetches organizations respecting the visibility system.
 * - Admin: All organizations
 * - Deputyship: All organizations (national oversight)
 * - Municipality: Organizations linked to their municipality + public orgs
 * - Provider: Own organization + public orgs
 * - Public: Only active/published organizations
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';

export function useOrganizationsWithVisibility(options = {}) {
  const { orgType, includeAll = false } = options;
  
  const {
    hasFullVisibility,
    isNational,
    userMunicipalityId,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const { isAdmin, isProvider, userEmail, organizationId } = usePermissions();

  return useQuery({
    queryKey: ['organizations-visibility', orgType, hasFullVisibility, isNational, userMunicipalityId, organizationId, includeAll],
    queryFn: async () => {
      // Admin or national deputyship - all organizations
      if (isAdmin || hasFullVisibility || isNational) {
        let query = supabase
          .from('organizations')
          .select('*')
          .eq('is_deleted', false);
        
        if (orgType) {
          query = query.eq('org_type', orgType);
        }
        
        const { data, error } = await query.order('name_en');
        if (error) throw error;
        return data || [];
      }

      // Municipality staff - orgs linked to their municipality + public orgs
      if (userMunicipalityId) {
        let query = supabase
          .from('organizations')
          .select('*')
          .eq('is_deleted', false)
          .or(`is_active.eq.true,municipality_id.eq.${userMunicipalityId}`);
        
        if (orgType) {
          query = query.eq('org_type', orgType);
        }
        
        const { data, error } = await query.order('name_en');
        if (error) throw error;
        return data || [];
      }

      // Provider - own organization + active orgs
      if (isProvider && organizationId) {
        let query = supabase
          .from('organizations')
          .select('*')
          .eq('is_deleted', false)
          .or(`is_active.eq.true,id.eq.${organizationId}`);
        
        if (orgType) {
          query = query.eq('org_type', orgType);
        }
        
        const { data, error } = await query.order('name_en');
        if (error) throw error;
        return data || [];
      }

      // Public - only active organizations
      let query = supabase
        .from('organizations')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_active', true);
      
      if (orgType) {
        query = query.eq('org_type', orgType);
      }
      
      const { data, error } = await query.order('name_en');
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 5 * 60 * 1000
  });
}

export default useOrganizationsWithVisibility;
