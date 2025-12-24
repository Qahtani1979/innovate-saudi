import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const TaxonomyContext = createContext(null);

// Fetch full taxonomy hierarchy: Domain → Deputyship → Sector → Subsector → Service
// Plus all lookup reference data
async function fetchTaxonomyData() {
  const [
    domainsResult,
    deputyshipsResult,
    sectorsResult,
    subsectorsResult,
    servicesResult,
    regionsResult,
    strategicThemesResult,
    technologiesResult,
    visionProgramsResult,
    stakeholderTypesResult,
    riskCategoriesResult,
    stakeholderTypesResult,
    riskCategoriesResult,
    governanceRolesResult,
    tagsResult
  ] = await Promise.all([

    // Core taxonomy
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
      .order('name_en'),
    // Reference data
    supabase
      .from('regions')
      .select('id, code, name_en, name_ar, is_active, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('lookup_strategic_themes')
      .select('id, code, name_en, name_ar, description_en, description_ar, icon, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('lookup_technologies')
      .select('id, code, name_en, name_ar, description_en, description_ar, category, icon, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('lookup_vision_programs')
      .select('id, code, name_en, name_ar, description_en, description_ar, official_url, icon, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('lookup_stakeholder_types')
      .select('id, code, name_en, name_ar, description_en, description_ar, icon, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('lookup_risk_categories')
      .select('id, code, name_en, name_ar, description_en, description_ar, icon, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('lookup_governance_roles')
      .select('id, code, name_en, name_ar, description_en, description_ar, icon, display_order')
      .eq('is_active', true)
      .order('display_order'),
    supabase
      .from('tags')
      .select('*')
      .order('name_en')
  ]);


  // Core taxonomy errors
  if (domainsResult.error) throw domainsResult.error;
  if (deputyshipsResult.error) throw deputyshipsResult.error;
  if (sectorsResult.error) throw sectorsResult.error;
  if (subsectorsResult.error) throw subsectorsResult.error;
  if (servicesResult.error) throw servicesResult.error;

  // Reference data - log warnings but don't fail
  if (regionsResult.error) console.warn('Failed to load regions:', regionsResult.error);
  if (strategicThemesResult.error) console.warn('Failed to load strategic themes:', strategicThemesResult.error);
  if (technologiesResult.error) console.warn('Failed to load technologies:', technologiesResult.error);
  if (visionProgramsResult.error) console.warn('Failed to load vision programs:', visionProgramsResult.error);
  if (stakeholderTypesResult.error) console.warn('Failed to load stakeholder types:', stakeholderTypesResult.error);
  if (riskCategoriesResult.error) console.warn('Failed to load risk categories:', riskCategoriesResult.error);
  if (riskCategoriesResult.error) console.warn('Failed to load risk categories:', riskCategoriesResult.error);
  if (governanceRolesResult.error) console.warn('Failed to load governance roles:', governanceRolesResult.error);
  if (tagsResult.error) console.warn('Failed to load tags:', tagsResult.error);


  const domains = domainsResult.data || [];
  const deputyships = deputyshipsResult.data || [];
  const sectors = sectorsResult.data || [];
  const subsectors = subsectorsResult.data || [];
  const services = servicesResult.data || [];

  // Reference data
  const regions = regionsResult.data || [];
  const strategicThemes = strategicThemesResult.data || [];
  const technologies = technologiesResult.data || [];
  const visionPrograms = visionProgramsResult.data || [];
  const stakeholderTypes = stakeholderTypesResult.data || [];
  const riskCategories = riskCategoriesResult.data || [];
  const riskCategories = riskCategoriesResult.data || [];
  const governanceRoles = governanceRolesResult.data || [];
  const tags = tagsResult.data || [];


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
    // Flat arrays - Core taxonomy
    domains,
    deputyships,
    sectors,
    subsectors,
    services,

    // Flat arrays - Reference data
    regions,
    strategicThemes,
    technologies,
    visionPrograms,
    stakeholderTypes,
    riskCategories,
    governanceRoles,
    tags,


    // Nested hierarchies
    domainsWithDeputyships,
    deputyshipsWithSectors,
    sectorsWithSubsectors,
    subsectorsWithServices,

    // Lookup maps for O(1) access - Core taxonomy
    domainsByCode: Object.fromEntries(domains.map(d => [d.code, d])),
    domainsById: Object.fromEntries(domains.map(d => [d.id, d])),
    deputyshipsByCode: Object.fromEntries(deputyships.map(d => [d.code, d])),
    deputyshipsById: Object.fromEntries(deputyships.map(d => [d.id, d])),
    sectorsByCode: Object.fromEntries(sectors.map(s => [s.code, s])),
    sectorsById: Object.fromEntries(sectors.map(s => [s.id, s])),
    subsectorsByCode: Object.fromEntries(subsectors.map(s => [s.code, s])),
    subsectorsById: Object.fromEntries(subsectors.map(s => [s.id, s])),
    servicesByCode: Object.fromEntries(services.map(s => [s.code, s])),
    servicesById: Object.fromEntries(services.map(s => [s.id, s])),

    // Lookup maps - Reference data
    regionsByCode: Object.fromEntries(regions.map(r => [r.code, r])),
    regionsById: Object.fromEntries(regions.map(r => [r.id, r])),
    strategicThemesByCode: Object.fromEntries(strategicThemes.map(t => [t.code, t])),
    technologiesByCode: Object.fromEntries(technologies.map(t => [t.code, t])),
    visionProgramsByCode: Object.fromEntries(visionPrograms.map(p => [p.code, p])),
    stakeholderTypesByCode: Object.fromEntries(stakeholderTypes.map(s => [s.code, s])),
    riskCategoriesByCode: Object.fromEntries(riskCategories.map(r => [r.code, r])),
    governanceRolesByCode: Object.fromEntries(governanceRoles.map(g => [g.code, g]))
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
    // Flat data arrays - Core taxonomy
    domains: data?.domains || [],
    deputyships: data?.deputyships || [],
    sectors: data?.sectors || [],
    subsectors: data?.subsectors || [],
    services: data?.services || [],

    // Flat data arrays - Reference data
    regions: data?.regions || [],
    strategicThemes: data?.strategicThemes || [],
    technologies: data?.technologies || [],
    visionPrograms: data?.visionPrograms || [],
    stakeholderTypes: data?.stakeholderTypes || [],
    riskCategories: data?.riskCategories || [],
    stakeholderTypes: data?.stakeholderTypes || [],
    riskCategories: data?.riskCategories || [],
    governanceRoles: data?.governanceRoles || [],
    tags: data?.tags || [],


    // Nested hierarchies
    domainsWithDeputyships: data?.domainsWithDeputyships || [],
    deputyshipsWithSectors: data?.deputyshipsWithSectors || [],
    sectorsWithSubsectors: data?.sectorsWithSubsectors || [],
    subsectorsWithServices: data?.subsectorsWithServices || [],

    // Lookup maps - Core taxonomy
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

    // Lookup maps - Reference data
    regionsByCode: data?.regionsByCode || {},
    regionsById: data?.regionsById || {},
    strategicThemesByCode: data?.strategicThemesByCode || {},
    technologiesByCode: data?.technologiesByCode || {},
    visionProgramsByCode: data?.visionProgramsByCode || {},
    stakeholderTypesByCode: data?.stakeholderTypesByCode || {},
    riskCategoriesByCode: data?.riskCategoriesByCode || {},
    governanceRolesByCode: data?.governanceRolesByCode || {},

    // State
    isLoading,
    error,
    refetch,

    // Helper functions - Get by code/id (Core taxonomy)
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

    // Helper functions - Get by code (Reference data)
    getRegionByCode: (code) => data?.regionsByCode?.[code] || null,
    getStrategicThemeByCode: (code) => data?.strategicThemesByCode?.[code] || null,
    getTechnologyByCode: (code) => data?.technologiesByCode?.[code] || null,
    getVisionProgramByCode: (code) => data?.visionProgramsByCode?.[code] || null,
    getStakeholderTypeByCode: (code) => data?.stakeholderTypesByCode?.[code] || null,
    getRiskCategoryByCode: (code) => data?.riskCategoriesByCode?.[code] || null,
    getGovernanceRoleByCode: (code) => data?.governanceRolesByCode?.[code] || null,

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
    getRegionName: (code, language = 'en') => {
      const region = data?.regionsByCode?.[code];
      if (!region) return code;
      return language === 'ar' ? (region.name_ar || region.name_en) : region.name_en;
    },
    getStrategicThemeName: (code, language = 'en') => {
      const theme = data?.strategicThemesByCode?.[code];
      if (!theme) return code;
      return language === 'ar' ? (theme.name_ar || theme.name_en) : theme.name_en;
    },
    getTechnologyName: (code, language = 'en') => {
      const tech = data?.technologiesByCode?.[code];
      if (!tech) return code;
      return language === 'ar' ? (tech.name_ar || tech.name_en) : tech.name_en;
    },
    getVisionProgramName: (code, language = 'en') => {
      const program = data?.visionProgramsByCode?.[code];
      if (!program) return code;
      return language === 'ar' ? (program.name_ar || program.name_en) : program.name_en;
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

// Default empty context for components outside provider
const defaultContext = {
  domains: [], deputyships: [], sectors: [], subsectors: [], services: [],
  regions: [], strategicThemes: [], technologies: [], visionPrograms: [],
  stakeholderTypes: [], riskCategories: [], governanceRoles: [], tags: [],

  domainsWithDeputyships: [], deputyshipsWithSectors: [], sectorsWithSubsectors: [], subsectorsWithServices: [],
  domainsByCode: {}, domainsById: {}, deputyshipsByCode: {}, deputyshipsById: {},
  sectorsByCode: {}, sectorsById: {}, subsectorsByCode: {}, subsectorsById: {},
  servicesByCode: {}, servicesById: {}, regionsByCode: {}, regionsById: {},
  strategicThemesByCode: {}, technologiesByCode: {}, visionProgramsByCode: {},
  stakeholderTypesByCode: {}, riskCategoriesByCode: {}, governanceRolesByCode: {},
  isLoading: false, error: null, refetch: () => { },
  getDomainByCode: () => null, getDomainById: () => null,
  getDeputyshipByCode: () => null, getDeputyshipById: () => null,
  getSectorByCode: () => null, getSectorById: () => null,
  getSubsectorByCode: () => null, getSubsectorById: () => null,
  getServiceByCode: () => null, getServiceById: () => null,
  getRegionByCode: () => null, getStrategicThemeByCode: () => null,
  getTechnologyByCode: () => null, getVisionProgramByCode: () => null,
  getStakeholderTypeByCode: () => null, getRiskCategoryByCode: () => null,
  getGovernanceRoleByCode: () => null,
  getDomainName: (code) => code, getDeputyshipName: (code) => code,
  getSectorName: (code) => code, getSubsectorName: (code) => code,
  getServiceName: (code) => code, getRegionName: (code) => code,
  getStrategicThemeName: (code) => code, getTechnologyName: (code) => code,
  getVisionProgramName: (code) => code,
  getDeputyshipsForDomain: () => [], getSectorsForDeputyship: () => [],
  getSubsectorsForSector: () => [], getServicesForSubsector: () => [],
  getSectorsForSelect: () => []
};

export function useTaxonomy() {
  const context = useContext(TaxonomyContext);
  // Return default context if outside provider (prevents crashes during loading)
  if (!context) {
    console.warn('useTaxonomy called outside TaxonomyProvider - returning defaults');
    return defaultContext;
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
