import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fetch full taxonomy hierarchy: Domain → Deputyship → Sector → Subsector → Service
// Plus all lookup reference data
export async function fetchTaxonomyData() {
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

export function useTaxonomyData() {
    return useQuery({
        queryKey: ['taxonomy-global'],
        queryFn: fetchTaxonomyData,
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60 * 24,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}
