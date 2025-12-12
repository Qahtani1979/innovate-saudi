import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/components/permissions/usePermissions';

/**
 * Hook for fetching case studies with visibility rules applied.
 */
export function useCaseStudiesWithVisibility(options = {}) {
  const { 
    sectorId,
    limit = 100,
    includeDeleted = false,
    featuredOnly = false
  } = options;

  const { isAdmin, hasRole, userId } = usePermissions();
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

  return useQuery({
    queryKey: ['case-studies-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      sectorId,
      limit,
      featuredOnly
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar),
        sector:sectors(id, name_en, name_ar, code)
      `;

      let query = supabase
        .from('case_studies')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Apply featured filter
      if (featuredOnly) {
        query = query.eq('is_featured', true);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users only see published case studies
      if (!isStaffUser) {
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

      // Geographic municipality: Own + national + published
      if (userMunicipalityId) {
        // Get own municipality case studies
        const { data: ownStudies, error: ownError } = await supabase
          .from('case_studies')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Get national case studies
        let nationalStudies = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natStudies, error: natError } = await supabase
            .from('case_studies')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalStudies = natStudies || [];
          }
        }

        // Get all published case studies
        const { data: publishedStudies, error: publishedError } = await supabase
          .from('case_studies')
          .select(baseSelect)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (publishedError) throw publishedError;

        // Combine and deduplicate
        const allStudies = [...(ownStudies || []), ...nationalStudies, ...(publishedStudies || [])];
        const uniqueStudies = allStudies.filter((study, index, self) =>
          index === self.findIndex(s => s.id === study.id)
        );

        // Apply additional filters
        let filtered = uniqueStudies;
        if (sectorId) {
          filtered = filtered.filter(s => s.sector_id === sectorId);
        }
        if (featuredOnly) {
          filtered = filtered.filter(s => s.is_featured);
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
    staleTime: 1000 * 60 * 2,
  });
}

export default useCaseStudiesWithVisibility;
