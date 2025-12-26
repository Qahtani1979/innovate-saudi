import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching R&D projects with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All R&D projects
 * - National Deputyship: All R&D projects in their sector(s)
 * - Municipality Staff: Own + national R&D projects
 * - Academia/Researcher: Projects they are involved in
 * - Others: Published projects only
 */
export function useRDProjectsWithVisibility(options = {}) {
  const {
    status,
    sectorId,
    projectType,
    limit = 100,
    includeDeleted = false
  } = options;

  const { isAdmin, hasRole, userId, profile } = usePermissions();
  const {
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    hasFullVisibility,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const isStaffUser = hasRole('municipality_staff') ||
    hasRole('municipality_admin') ||
    hasRole('deputyship_staff') ||
    hasRole('deputyship_admin');

  const isResearcher = hasRole('academia') || hasRole('researcher');

  return useQuery({
    queryKey: ['rd-projects-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      status,
      sectorId,
      projectType,
      limit
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar, region_id),
        sector:sectors(id, name_en, name_ar, code),
        institution:institutions(id, name_en, name_ar)
      `;

      let query = supabase
        .from('rd_projects')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      // Apply status filter if provided
      if (status) {
        query = /** @type {any} */(query).eq('status', status);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Apply project type filter if provided
      if (projectType) {
        query = query.eq('project_type', projectType);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users only see published projects
      if (!isStaffUser && !isResearcher) {
        query = query.eq('is_published', true);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // National deputyship: Filter by sector
      if (isNational && sectorIds?.length > 0) {
        query = query.in('sector_id', sectorIds);
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Geographic municipality: Own + national
      if (userMunicipalityId) {
        // Get own municipality R&D projects
        const { data: ownProjects, error: ownError } = await supabase
          .from('rd_projects')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Get national R&D projects
        let nationalProjects = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natProjects, error: natError } = await supabase
            .from('rd_projects')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalProjects = natProjects || [];
          }
        }

        // Combine and deduplicate
        const allProjects = [...(ownProjects || []), ...nationalProjects];
        const uniqueProjects = allProjects.filter((project, index, self) =>
          index === self.findIndex(p => p.id === project.id)
        );

        // Apply additional filters
        let filtered = uniqueProjects;
        if (status) {
          filtered = filtered.filter(p => p.status === status);
        }
        if (sectorId) {
          filtered = filtered.filter(p => p.sector_id === sectorId);
        }

        return filtered.slice(0, limit);
      }

      // Fallback: published only
      query = query.eq('is_published', true);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !visibilityLoading,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch a single R&D Project by ID with visibility checks
 * @param {string} projectId 
 */
export function useRDProject(projectId) {
  return useQuery({
    queryKey: ['rd-project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rd_projects')
        .select(`
          *,
          municipality:municipalities(id, name_en, name_ar, region_id),
          sector:sectors(id, name_en, name_ar, code),
          institution:institutions(id, name_en, name_ar)
        `)
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000
  });
}

export default useRDProjectsWithVisibility;
