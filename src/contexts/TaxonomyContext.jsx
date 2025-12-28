import React, { createContext, useContext, useMemo } from 'react';
import { useTaxonomyData } from '@/hooks/useTaxonomyData';

const TaxonomyContext = createContext(null);


export function TaxonomyProvider({ children }) {
  const { data, isLoading, error, refetch } = useTaxonomyData();

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
  return useTaxonomyData();
}

export default TaxonomyContext;
