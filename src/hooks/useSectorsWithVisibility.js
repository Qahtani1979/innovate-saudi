import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch sectors with visibility filtering
 * Supports deputyship-based filtering for sector staff
 */
export function useSectorsWithVisibility(options = {}) {
  const { deputyshipId, includeSubsectors = false, includeServices = false } = options;
  
  return useQuery({
    queryKey: ['sectors-visibility', deputyshipId, includeSubsectors, includeServices],
    queryFn: async () => {
      let query = supabase
        .from('sectors')
        .select(`
          *
          ${includeSubsectors ? `, subsectors!subsectors_sector_id_fkey(*)` : ''}
        `)
        .eq('is_active', true)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('display_order', { ascending: true });
      
      if (deputyshipId) {
        query = query.eq('deputyship_id', deputyshipId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // If services requested, fetch them separately and merge
      if (includeServices && data) {
        const subsectorIds = data.flatMap(s => 
          s.subsectors?.map(sub => sub.id) || []
        );
        
        if (subsectorIds.length > 0) {
          const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .in('subsector_id', subsectorIds)
            .eq('is_active', true);
          
          if (!servicesError && services) {
            // Map services to their subsectors
            data.forEach(sector => {
              sector.subsectors?.forEach(subsector => {
                subsector.services = services.filter(s => s.subsector_id === subsector.id);
              });
            });
          }
        }
      }
      
      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch subsectors with visibility filtering
 */
export function useSubsectorsWithVisibility(options = {}) {
  const { sectorId, includeServices = false } = options;
  
  return useQuery({
    queryKey: ['subsectors-visibility', sectorId, includeServices],
    queryFn: async () => {
      let query = supabase
        .from('subsectors')
        .select(`
          *,
          sector:sectors(id, name_en, name_ar, code)
          ${includeServices ? `, services(*)` : ''}
        `)
        .eq('is_active', true)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('display_order', { ascending: true });
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch services with visibility filtering
 */
export function useServicesWithVisibility(options = {}) {
  const { sectorId, subsectorId } = options;
  
  return useQuery({
    queryKey: ['services-visibility', sectorId, subsectorId],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select(`
          *,
          subsector:subsectors(id, name_en, name_ar, code, sector_id),
          sector:sectors(id, name_en, name_ar, code)
        `)
        .eq('is_active', true)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('display_order', { ascending: true });
      
      if (subsectorId) {
        query = query.eq('subsector_id', subsectorId);
      }
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to fetch taxonomy statistics
 */
export function useTaxonomyStats() {
  return useQuery({
    queryKey: ['taxonomy-stats'],
    queryFn: async () => {
      const [
        { count: domainsCount },
        { count: deputyshipsCount },
        { count: sectorsCount },
        { count: subsectorsCount },
        { count: servicesCount }
      ] = await Promise.all([
        supabase.from('domains').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('deputyships').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('sectors').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('subsectors').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      
      return {
        domains: domainsCount || 0,
        deputyships: deputyshipsCount || 0,
        sectors: sectorsCount || 0,
        subsectors: subsectorsCount || 0,
        services: servicesCount || 0,
        total: (domainsCount || 0) + (deputyshipsCount || 0) + (sectorsCount || 0) + 
               (subsectorsCount || 0) + (servicesCount || 0)
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export default {
  useSectorsWithVisibility,
  useSubsectorsWithVisibility,
  useServicesWithVisibility,
  useTaxonomyStats
};
