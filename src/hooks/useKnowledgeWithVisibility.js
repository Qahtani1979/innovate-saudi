import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for fetching knowledge documents with visibility rules applied.
 * 
 * Visibility:
 * - Admin / Full Visibility Users: All documents
 * - National Deputyship: All documents in their sector(s)
 * - Municipality Staff: Own + national + published documents
 * - Others: Published documents only
 */
export function useKnowledgeWithVisibility(options = {}) {
  const { 
    documentType,
    sectorId,
    limit = 100,
    includeDeleted = false
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
    queryKey: ['knowledge-with-visibility', {
      userId,
      isAdmin,
      hasFullVisibility,
      isNational,
      sectorIds,
      userMunicipalityId,
      documentType,
      sectorId,
      limit
    }],
    queryFn: async () => {
      const baseSelect = `
        *,
        municipality:municipalities(id, name_en, name_ar),
        sector:sectors(id, name_en, name_ar, code)
      `;

      let query = supabase
        .from('knowledge_documents')
        .select(baseSelect)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Apply deleted filter
      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      // Apply document type filter if provided
      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      // Apply sector filter if provided
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }

      // Admin or full visibility users see everything
      if (hasFullVisibility) {
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      // Non-staff users only see published documents
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
        // Get own municipality documents
        const { data: ownDocs, error: ownError } = await supabase
          .from('knowledge_documents')
          .select(baseSelect)
          .eq('municipality_id', userMunicipalityId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (ownError) throw ownError;

        // Get national documents
        let nationalDocs = [];
        if (nationalMunicipalityIds?.length > 0) {
          const { data: natDocs, error: natError } = await supabase
            .from('knowledge_documents')
            .select(baseSelect)
            .in('municipality_id', nationalMunicipalityIds)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

          if (!natError) {
            nationalDocs = natDocs || [];
          }
        }

        // Get all published documents
        const { data: publishedDocs, error: publishedError } = await supabase
          .from('knowledge_documents')
          .select(baseSelect)
          .eq('is_published', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (publishedError) throw publishedError;

        // Combine and deduplicate
        const allDocs = [...(ownDocs || []), ...nationalDocs, ...(publishedDocs || [])];
        const uniqueDocs = allDocs.filter((doc, index, self) =>
          index === self.findIndex(d => d.id === doc.id)
        );

        // Apply additional filters
        let filtered = uniqueDocs;
        if (documentType) {
          filtered = filtered.filter(d => d.document_type === documentType);
        }
        if (sectorId) {
          filtered = filtered.filter(d => d.sector_id === sectorId);
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

export default useKnowledgeWithVisibility;
