import { useQuery } from '@/hooks/useAppQueryClient';
import { useVisibilitySystem } from './visibility/useVisibilitySystem';

/**
 * Hook to fetch and aggregate data for the Command Center dashboard
 * respecting the user's visibility scope.
 */
export function useCommandCenterData() {
    const { fetchWithVisibility, isLoading: isVisibilityLoading } = useVisibilitySystem();

    // 1. Challenges
    const { data: challenges = [], isLoading: isChallengesLoading } = useQuery({
        queryKey: ['challenges-command-v2'],
        queryFn: () => fetchWithVisibility('challenges', '*', {
            orderBy: 'created_at',
            orderAscending: false
        }),
        enabled: !isVisibilityLoading
    });

    // 2. Pilots
    const { data: pilots = [], isLoading: isPilotsLoading } = useQuery({
        queryKey: ['pilots-command-v2'],
        queryFn: () => fetchWithVisibility('pilots', '*', {
            orderBy: 'created_at',
            orderAscending: false
        }),
        enabled: !isVisibilityLoading
    });

    // 3. Programs
    const { data: programs = [], isLoading: isProgramsLoading } = useQuery({
        queryKey: ['programs-command-v2'],
        queryFn: () => fetchWithVisibility('programs', '*', {
            municipalityColumn: 'municipality_id', // Programs might be national or specific, assumes standard column
            orderBy: 'created_at',
            orderAscending: false
        }),
        enabled: !isVisibilityLoading
    });

    // 4. Expert Profiles (Usually global or high privilege, but let's apply visibility if relevant)
    // Experts might not have municipality_id directly on profile depending on schema, 
    // but let's assume standard visibility or fall back to open fetch if needed.
    // Checking schema implied by previous code: simple select *.
    const { data: expertProfiles = [], isLoading: isExpertsLoading } = useQuery({
        queryKey: ['experts-command-v2'],
        queryFn: () => fetchWithVisibility('expert_profiles', '*', {
            // Experts are often shared, but let's try visibility first. 
            // If table doesn't have municipality_id, fetchWithVisibility might fail if filtered by geo.
            // However, usually experts are "National" or have no restricted scope in this context.
            // For safety, given experts are a shared resource pool, we might want a raw fetch 
            // OR assume 'global' visibility for them. 
            // Current centralized logic applies visibility. 
            // If expert_profiles lacks 'municipality_id', we should ensure 'municipalityColumn' is mapped or ignored.
            // Let's assume standard fetch for now.
        }),
        enabled: !isVisibilityLoading
    });

    // 5. Expert Assignments
    const { data: expertAssignments = [], isLoading: isAssignmentsLoading } = useQuery({
        queryKey: ['assignments-command-v2'],
        queryFn: () => fetchWithVisibility('expert_assignments', '*'),
        enabled: !isVisibilityLoading
    });

    // Aggregation Logic
    const criticalItems = [
        ...challenges.filter(c => c.priority === 'tier_1' && c.status === 'under_review'),
        ...pilots.filter(p => p.risk_level === 'high' && ['active', 'monitoring'].includes(p.stage))
    ];

    const pendingApprovals = [
        ...challenges.filter(c => c.status === 'submitted'),
        ...pilots.filter(p => p.stage === 'approval_pending')
    ];

    const activeOperations = pilots.filter(p => ['active', 'monitoring'].includes(p.stage));

    const activeExperts = expertProfiles.filter(e => e.is_active).length;
    const availableExperts = expertProfiles.filter(e =>
        e.is_active &&
        (expertAssignments.filter(a => a.expert_email === e.user_email && ['pending', 'in_progress'].includes(a.status)).length < 3)
    );
    const expertCapacityRate = activeExperts > 0 ? Math.round((availableExperts.length / activeExperts) * 100) : 0;

    const isLoading = isVisibilityLoading || isChallengesLoading || isPilotsLoading || isProgramsLoading || isExpertsLoading || isAssignmentsLoading;

    return {
        challenges,
        pilots,
        programs,
        expertProfiles,
        expertAssignments,
        criticalItems,
        pendingApprovals,
        activeOperations,
        expertStats: {
            activeExperts,
            availableExperts: availableExperts.length,
            capacityRate: expertCapacityRate,
            inProgressAssignments: expertAssignments.filter(a => a.status === 'in_progress').length,
            utilizationRate: 100 - expertCapacityRate,
            avgAssignments: activeExperts > 0 ? (expertAssignments.filter(a => a.status !== 'completed').length / activeExperts).toFixed(1) : 0
        },
        isLoading
    };
}

