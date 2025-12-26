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
import { usePermissions } from '@/hooks/usePermissions';

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
          .select('*');

        // Only filter is_deleted if column exists (graceful handling)
        try {
          query = query.or('is_deleted.eq.false,is_deleted.is.null');
        } catch (e) {
          // Column might not exist yet
        }

        if (orgType) {
          query = query.or(`org_type.eq.${orgType},type.eq.${orgType}`);
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
          .or('is_deleted.eq.false,is_deleted.is.null')
          .or(`is_active.eq.true,municipality_id.eq.${userMunicipalityId}`);

        if (orgType) {
          query = query.or(`org_type.eq.${orgType},type.eq.${orgType}`);
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
          .or('is_deleted.eq.false,is_deleted.is.null')
          .or(`is_active.eq.true,id.eq.${organizationId}`);

        if (orgType) {
          query = query.or(`org_type.eq.${orgType},type.eq.${orgType}`);
        }

        const { data, error } = await query.order('name_en');
        if (error) throw error;
        return data || [];
      }

      // Public - only active organizations
      let query = supabase
        .from('organizations')
        .select('*')
        .or('is_deleted.eq.false,is_deleted.is.null')
        .eq('is_active', true);

      if (orgType) {
        query = query.or(`org_type.eq.${orgType},type.eq.${orgType}`);
      }

      const { data, error } = await query.order('name_en');
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 5 * 60 * 1000
  });
}

export function useMyManagedOrganization() {
  const { userEmail } = usePermissions();

  return useQuery({
    queryKey: ['my-managed-organization', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('contact_email', userEmail)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userEmail,
    staleTime: 5 * 60 * 1000
  });
}

export default useOrganizationsWithVisibility;
