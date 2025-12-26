/**
 * Visibility-Aware Search Hook
 * 
 * Provides search functionality that respects the visibility system.
 * Only returns entities the current user has access to view.
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';
import { usePermissions } from '@/hooks/usePermissions';

export function useVisibilityAwareSearch() {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const {
    hasFullVisibility,
    isNational,
    sectorIds,
    userMunicipalityId,
    nationalMunicipalityIds,
    isLoading: visibilityLoading
  } = useVisibilitySystem();

  const { isAdmin, isProvider, userId, userEmail } = usePermissions();

  const applyVisibilityFilter = useCallback((data, entityType) => {
    if (!data || data.length === 0) return [];

    // Admin or full visibility - return all
    if (isAdmin || hasFullVisibility) {
      return data;
    }

    // National deputyship - filter by sectors
    if (isNational && sectorIds?.length > 0) {
      return data.filter(item => {
        // Include if in user's sectors
        if (item.sector_id && sectorIds.includes(item.sector_id)) return true;
        // Include national entities
        if (item.municipality_id && nationalMunicipalityIds?.includes(item.municipality_id)) return true;
        // Include published items
        if (item.is_published) return true;
        return false;
      });
    }

    // Municipality staff - filter by municipality
    if (userMunicipalityId) {
      return data.filter(item => {
        // Own municipality
        if (item.municipality_id === userMunicipalityId) return true;
        // National entities
        if (item.municipality_id && nationalMunicipalityIds?.includes(item.municipality_id)) return true;
        // Published items
        if (item.is_published) return true;
        return false;
      });
    }

    // Provider - own entities + published
    if (isProvider) {
      return data.filter(item => {
        if (item.created_by === userEmail) return true;
        if (item.provider_id === userId) return true;
        if (item.is_published) return true;
        return false;
      });
    }

    // Public - only published
    return data.filter(item => item.is_published || item.status === 'published' || item.status === 'active');
  }, [hasFullVisibility, isNational, sectorIds, userMunicipalityId, nationalMunicipalityIds, isAdmin, isProvider, userId, userEmail]);

  const calculateRelevance = (query, text) => {
    if (!text) return 0;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (textLower.includes(queryLower)) return 1.0;
    
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    const overlap = queryWords.filter(w => textWords.some(tw => tw.includes(w) || w.includes(tw)));
    
    return overlap.length / queryWords.length;
  };

  const search = useCallback(async (query, options = {}) => {
    if (!query?.trim() || visibilityLoading) return [];

    const { entityTypes = ['challenges', 'pilots', 'solutions', 'rd_projects', 'programs', 'events'], limit = 10 } = options;

    setSearching(true);
    try {
      const queries = [];
      const activeEntityTypes = [];

      if (entityTypes.includes('challenges')) {
        queries.push(
          supabase.from('challenges')
            .select('id, title_en, title_ar, description_en, status, is_published, municipality_id, sector_id, created_by')
            .eq('is_deleted', false)
        );
        activeEntityTypes.push('challenges');
      }

      if (entityTypes.includes('pilots')) {
        queries.push(
          supabase.from('pilots')
            .select('id, title_en, title_ar, description_en, stage, is_published, municipality_id, sector_id, created_by')
            .eq('is_deleted', false)
        );
        activeEntityTypes.push('pilots');
      }

      if (entityTypes.includes('solutions')) {
        queries.push(
          supabase.from('solutions')
            .select('id, name_en, name_ar, description_en, is_published, sector_id, created_by, provider_id')
            .eq('is_deleted', false)
        );
        activeEntityTypes.push('solutions');
      }

      if (entityTypes.includes('rd_projects')) {
        queries.push(
          supabase.from('rd_projects')
            .select('id, title_en, title_ar, description_en, status, is_published, municipality_id, sector_id, created_by')
            .eq('is_deleted', false)
        );
        activeEntityTypes.push('rd_projects');
      }

      if (entityTypes.includes('programs')) {
        queries.push(
          supabase.from('programs')
            .select('id, name_en, name_ar, description_en, status, is_published, municipality_id, sector_id, created_by')
            .eq('is_deleted', false)
        );
        activeEntityTypes.push('programs');
      }

      if (entityTypes.includes('events')) {
        queries.push(
          supabase.from('events')
            .select('id, title_en, title_ar, description_en, status, is_published, municipality_id, sector_id, created_by, start_date, event_type')
            .eq('is_deleted', false)
        );
        activeEntityTypes.push('events');
      }

      const responses = await Promise.all(queries);
      const searchResults = [];

      responses.forEach((res, idx) => {
        if (res.error) return;
        
        const entityType = activeEntityTypes[idx];
        const filteredData = applyVisibilityFilter(res.data || [], entityType);

        filteredData.forEach(item => {
          const title = item.title_en || item.name_en || '';
          const description = item.description_en || '';
          const relevance = calculateRelevance(query, `${title} ${description}`);
          
          if (relevance > 0.3) {
            // Map entity type to singular form for URL generation
            const typeMap = {
              'challenges': 'challenge',
              'pilots': 'pilot',
              'solutions': 'solution',
              'rd_projects': 'rd-project',
              'programs': 'program',
              'events': 'event'
            };
            
            searchResults.push({
              type: typeMap[entityType] || entityType.slice(0, -1),
              entity: item,
              relevance,
              title,
              id: item.id,
              // Add event-specific metadata
              ...(entityType === 'events' && {
                startDate: item.start_date,
                eventType: item.event_type
              })
            });
          }
        });
      });

      const sortedResults = searchResults
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);

      setResults(sortedResults);
      return sortedResults;
    } finally {
      setSearching(false);
    }
  }, [applyVisibilityFilter, visibilityLoading]);

  return {
    search,
    results,
    searching,
    isLoading: visibilityLoading
  };
}

export default useVisibilityAwareSearch;
