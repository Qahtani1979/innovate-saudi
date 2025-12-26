import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';

/**
 * Hook to aggregate all types of initiatives into a unified view for the portfolio
 */
export function useInitiativePortfolioData() {
    const { data: challenges = [], isLoading: isLoadingChallenges } = useChallengesWithVisibility();
    const { data: pilots = [], isLoading: isLoadingPilots } = usePilotsWithVisibility();
    const { data: rdProjects = [], isLoading: isLoadingRD } = useRDProjectsWithVisibility();
    const { data: programs = [], isLoading: isLoadingPrograms } = useProgramsWithVisibility();
    const { data: strategicPlans = [], isLoading: isLoadingStrategies } = useStrategiesWithVisibility();

    const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];

    // @ts-ignore
    const initiativesData = challenges?.data || challenges || [];
    // @ts-ignore
    const pilotsData = pilots?.data || pilots || [];
    // @ts-ignore
    const rdData = rdProjects?.data || rdProjects || [];
    // @ts-ignore
    const programsData = programs?.data || programs || [];

    // Unified initiative view
    const allInitiatives = [
        ...initiativesData.map(c => ({
            id: c.id,
            type: 'challenge',
            title: c.title_en || c.title_ar,
            sector: c.sector,
            status: c.status,
            strategic_theme: c.tags?.find(t => {
                // @ts-ignore
                return activePlan?.strategic_themes?.some(st => (st.name_en || st).toLowerCase().includes(t.toLowerCase()));
            }),
            year: (c.created_at || c.created_date) ? new Date(c.created_at || c.created_date).getFullYear() : null,
            entity: c,
            page: 'ChallengeDetail'
        })),
        ...pilotsData.map(p => ({
            id: p.id,
            type: 'pilot',
            title: p.title_en || p.title_ar,
            sector: p.sector,
            status: p.stage,
            strategic_theme: p.tags?.find(t => {
                // @ts-ignore
                return activePlan?.strategic_themes?.some(st => (st.name_en || st).toLowerCase().includes(t.toLowerCase()));
            }),
            year: (p.created_at || p.created_date) ? new Date(p.created_at || p.created_date).getFullYear() : null,
            entity: p,
            page: 'PilotDetail'
        })),
        ...rdData.map(r => ({
            id: r.id,
            type: 'rd_project',
            title: r.title_en || r.title_ar,
            sector: r.research_area_en,
            status: r.status,
            strategic_theme: r.tags?.find(t => {
                // @ts-ignore
                return activePlan?.strategic_themes?.some(st => (st.name_en || st).toLowerCase().includes(t.toLowerCase()));
            }),
            year: (r.created_at || r.created_date) ? new Date(r.created_at || r.created_date).getFullYear() : null,
            entity: r,
            page: 'RDProjectDetail'
        })),
        ...programsData.map(p => ({
            id: p.id,
            type: 'program',
            title: p.name_en || p.name_ar,
            sector: p.focus_areas?.join(', '),
            status: p.status,
            strategic_theme: p.tags?.find(t => {
                // @ts-ignore
                return activePlan?.strategic_themes?.some(st => (st.name_en || st).toLowerCase().includes(t.toLowerCase()));
            }),
            year: (p.created_at || p.created_date) ? new Date(p.created_at || p.created_date).getFullYear() : null,
            entity: p,
            page: 'ProgramDetail'
        }))
    ];

    return {
        allInitiatives,
        activePlan,
        themes: activePlan?.strategic_themes || [],
        isLoading: isLoadingChallenges || isLoadingPilots || isLoadingRD || isLoadingPrograms || isLoadingStrategies
    };
}
