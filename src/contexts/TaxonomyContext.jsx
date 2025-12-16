import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TaxonomyContext = createContext(null);

// Fetch sectors with subsectors in a single query
async function fetchTaxonomyData() {
  const [sectorsResult, subsectorsResult] = await Promise.all([
    supabase
      .from('sectors')
      .select('id, code, name_en, name_ar, description_en, description_ar, icon, is_active')
      .eq('is_active', true)
      .order('name_en'),
    supabase
      .from('subsectors')
      .select('id, sector_id, code, name_en, name_ar, description_en, description_ar, is_active')
      .eq('is_active', true)
      .order('name_en')
  ]);

  if (sectorsResult.error) throw sectorsResult.error;
  if (subsectorsResult.error) throw subsectorsResult.error;

  const sectors = sectorsResult.data || [];
  const subsectors = subsectorsResult.data || [];

  // Build sectors with nested subsectors
  const sectorsWithSubsectors = sectors.map(sector => ({
    ...sector,
    subsectors: subsectors.filter(sub => sub.sector_id === sector.id)
  }));

  return {
    sectors,
    subsectors,
    sectorsWithSubsectors,
    // Create lookup maps for O(1) access
    sectorsByCode: Object.fromEntries(sectors.map(s => [s.code, s])),
    sectorsById: Object.fromEntries(sectors.map(s => [s.id, s])),
    subsectorsByCode: Object.fromEntries(subsectors.map(s => [s.code, s])),
    subsectorsById: Object.fromEntries(subsectors.map(s => [s.id, s]))
  };
}

export function TaxonomyProvider({ children }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['taxonomy-global'],
    queryFn: fetchTaxonomyData,
    staleTime: 1000 * 60 * 60, // 1 hour - taxonomy rarely changes
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours in cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const value = useMemo(() => ({
    // Data
    sectors: data?.sectors || [],
    subsectors: data?.subsectors || [],
    sectorsWithSubsectors: data?.sectorsWithSubsectors || [],
    
    // Lookup maps
    sectorsByCode: data?.sectorsByCode || {},
    sectorsById: data?.sectorsById || {},
    subsectorsByCode: data?.subsectorsByCode || {},
    subsectorsById: data?.subsectorsById || {},
    
    // State
    isLoading,
    error,
    refetch,

    // Helper functions
    getSectorByCode: (code) => data?.sectorsByCode?.[code] || null,
    getSectorById: (id) => data?.sectorsById?.[id] || null,
    getSubsectorByCode: (code) => data?.subsectorsByCode?.[code] || null,
    getSubsectorById: (id) => data?.subsectorsById?.[id] || null,
    
    getSectorName: (code, language = 'en') => {
      const sector = data?.sectorsByCode?.[code];
      if (!sector) return code;
      return language === 'ar' ? (sector.name_ar || sector.name_en) : sector.name_en;
    },
    
    getSubsectorName: (code, language = 'en') => {
      const subsector = data?.subsectorsByCode?.[code];
      if (!subsector) return code;
      return language === 'ar' ? (subsector.name_ar || subsector.name_en) : subsector.name_en;
    },

    getSubsectorsForSector: (sectorIdOrCode) => {
      if (!data?.subsectors) return [];
      const sector = data.sectorsById?.[sectorIdOrCode] || data.sectorsByCode?.[sectorIdOrCode];
      if (!sector) return [];
      return data.subsectors.filter(sub => sub.sector_id === sector.id);
    },

    // For backward compatibility with MOMAH_SECTORS format
    getSectorsForSelect: () => {
      return (data?.sectors || []).map(s => ({
        code: s.code,
        name_en: s.name_en,
        name_ar: s.name_ar,
        id: s.id
      }));
    }
  }), [data, isLoading, error, refetch]);

  return (
    <TaxonomyContext.Provider value={value}>
      {children}
    </TaxonomyContext.Provider>
  );
}

export function useTaxonomy() {
  const context = useContext(TaxonomyContext);
  if (!context) {
    throw new Error('useTaxonomy must be used within a TaxonomyProvider');
  }
  return context;
}

// Standalone hook for components outside the provider (uses same cache)
export function useTaxonomyQuery() {
  return useQuery({
    queryKey: ['taxonomy-global'],
    queryFn: fetchTaxonomyData,
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
}

export default TaxonomyContext;
