import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TaxonomyContext = createContext(null);

// Fetch full taxonomy hierarchy: Domain → Deputyship → Sector → Subsector → Service
async function fetchTaxonomyData() {
  const [domainsResult, deputyshipsResult, sectorsResult, subsectorsResult, servicesResult] = await Promise.all([
    supabase
      .from('domains')
      .select('id, code, name_en, name_ar, description_en, description_ar, icon, display_order, is_active')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('deputyships')
      .select('id, domain_id, code, name_en, name_ar, description_en, description_ar, icon, display_order, is_active')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('sectors')
      .select('id, deputyship_id, code, name_en, name_ar, description_en, description_ar, icon, display_order, is_active')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('subsectors')
      .select('id, sector_id, code, name_en, name_ar, description_en, description_ar, display_order, is_active')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('services')
      .select('id, subsector_id, code, name_en, name_ar, description_en, description_ar, is_active')
      .eq('is_active', true)
      .order('name_en')
  ]);

  if (domainsResult.error) throw domainsResult.error;
  if (deputyshipsResult.error) throw deputyshipsResult.error;
  if (sectorsResult.error) throw sectorsResult.error;
  if (subsectorsResult.error) throw subsectorsResult.error;
  if (servicesResult.error) throw servicesResult.error;

  const domains = domainsResult.data || [];
  const deputyships = deputyshipsResult.data || [];
  const sectors = sectorsResult.data || [];
  const subsectors = subsectorsResult.data || [];
  const services = servicesResult.data || [];

  // Build nested hierarchies
  const subsectorsWithServices = subsectors.map(sub => ({
    ...sub,
    services: services.filter(svc => svc.subsector_id === sub.id)
  }));

  const sectorsWithSubsectors = sectors.map(sector => ({
    ...sector,
    subsectors: subsectorsWithServices.filter(sub => sub.sector_id === sector.id)
  }));

  const deputyshipsWithSectors = deputyships.map(dep => ({
    ...dep,
    sectors: sectorsWithSubsectors.filter(sec => sec.deputyship_id === dep.id)
  }));

  const domainsWithDeputyships = domains.map(domain => ({
    ...domain,
    deputyships: deputyshipsWithSectors.filter(dep => dep.domain_id === domain.id)
  }));

  return {
    // Flat arrays
    domains,
    deputyships,
    sectors,
    subsectors,
    services,
    // Nested hierarchies
    domainsWithDeputyships,
    deputyshipsWithSectors,
    sectorsWithSubsectors,
    subsectorsWithServices,
    // Lookup maps for O(1) access
    domainsByCode: Object.fromEntries(domains.map(d => [d.code, d])),
    domainsById: Object.fromEntries(domains.map(d => [d.id, d])),
    deputyshipsByCode: Object.fromEntries(deputyships.map(d => [d.code, d])),
    deputyshipsById: Object.fromEntries(deputyships.map(d => [d.id, d])),
    sectorsByCode: Object.fromEntries(sectors.map(s => [s.code, s])),
    sectorsById: Object.fromEntries(sectors.map(s => [s.id, s])),
    subsectorsByCode: Object.fromEntries(subsectors.map(s => [s.code, s])),
    subsectorsById: Object.fromEntries(subsectors.map(s => [s.id, s])),
    servicesByCode: Object.fromEntries(services.map(s => [s.code, s])),
    servicesById: Object.fromEntries(services.map(s => [s.id, s]))
  };
}

export function TaxonomyProvider({ children }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['taxonomy-global'],
    queryFn: fetchTaxonomyData,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const value = useMemo(() => ({
    // Flat data arrays
    domains: data?.domains || [],
    deputyships: data?.deputyships || [],
    sectors: data?.sectors || [],
    subsectors: data?.subsectors || [],
    services: data?.services || [],
    
    // Nested hierarchies
    domainsWithDeputyships: data?.domainsWithDeputyships || [],
    deputyshipsWithSectors: data?.deputyshipsWithSectors || [],
    sectorsWithSubsectors: data?.sectorsWithSubsectors || [],
    subsectorsWithServices: data?.subsectorsWithServices || [],
    
    // Lookup maps
    domainsByCode: data?.domainsByCode || {},
    domainsById: data?.domainsById || {},
    deputyshipsByCode: data?.deputyshipsByCode || {},
    deputyshipsById: data?.deputyshipsById || {},
    sectorsByCode: data?.sectorsByCode || {},
    sectorsById: data?.sectorsById || {},
    subsectorsByCode: data?.subsectorsByCode || {},
    subsectorsById: data?.subsectorsById || {},
    servicesByCode: data?.servicesByCode || {},
    servicesById: data?.servicesById || {},
    
    // State
    isLoading,
    error,
    refetch,

    // Helper functions - Get by code/id
    getDomainByCode: (code) => data?.domainsByCode?.[code] || null,
    getDomainById: (id) => data?.domainsById?.[id] || null,
    getDeputyshipByCode: (code) => data?.deputyshipsByCode?.[code] || null,
    getDeputyshipById: (id) => data?.deputyshipsById?.[id] || null,
    getSectorByCode: (code) => data?.sectorsByCode?.[code] || null,
    getSectorById: (id) => data?.sectorsById?.[id] || null,
    getSubsectorByCode: (code) => data?.subsectorsByCode?.[code] || null,
    getSubsectorById: (id) => data?.subsectorsById?.[id] || null,
    getServiceByCode: (code) => data?.servicesByCode?.[code] || null,
    getServiceById: (id) => data?.servicesById?.[id] || null,
    
    // Helper functions - Get names with language support
    getDomainName: (code, language = 'en') => {
      const domain = data?.domainsByCode?.[code];
      if (!domain) return code;
      return language === 'ar' ? (domain.name_ar || domain.name_en) : domain.name_en;
    },
    getDeputyshipName: (code, language = 'en') => {
      const dep = data?.deputyshipsByCode?.[code];
      if (!dep) return code;
      return language === 'ar' ? (dep.name_ar || dep.name_en) : dep.name_en;
    },
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
    getServiceName: (code, language = 'en') => {
      const service = data?.servicesByCode?.[code];
      if (!service) return code;
      return language === 'ar' ? (service.name_ar || service.name_en) : service.name_en;
    },

    // Helper functions - Get children
    getDeputyshipsForDomain: (domainIdOrCode) => {
      if (!data?.deputyships) return [];
      const domain = data.domainsById?.[domainIdOrCode] || data.domainsByCode?.[domainIdOrCode];
      if (!domain) return [];
      return data.deputyships.filter(dep => dep.domain_id === domain.id);
    },
    getSectorsForDeputyship: (deputyshipIdOrCode) => {
      if (!data?.sectors) return [];
      const dep = data.deputyshipsById?.[deputyshipIdOrCode] || data.deputyshipsByCode?.[deputyshipIdOrCode];
      if (!dep) return [];
      return data.sectors.filter(sec => sec.deputyship_id === dep.id);
    },
    getSubsectorsForSector: (sectorIdOrCode) => {
      if (!data?.subsectors) return [];
      const sector = data.sectorsById?.[sectorIdOrCode] || data.sectorsByCode?.[sectorIdOrCode];
      if (!sector) return [];
      return data.subsectors.filter(sub => sub.sector_id === sector.id);
    },
    getServicesForSubsector: (subsectorIdOrCode) => {
      if (!data?.services) return [];
      const subsector = data.subsectorsById?.[subsectorIdOrCode] || data.subsectorsByCode?.[subsectorIdOrCode];
      if (!subsector) return [];
      return data.services.filter(svc => svc.subsector_id === subsector.id);
    },

    // Backward compatibility
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
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });
}

export default TaxonomyContext;
