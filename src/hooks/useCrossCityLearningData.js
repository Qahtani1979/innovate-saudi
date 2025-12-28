import { useQuery } from '@/hooks/useAppQueryClient';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook to aggregate data for the Cross-City Learning Hub
 */
export function useCrossCityLearningData() {
    const { user } = useAuth();

    // Fetch base data using existing visibility hooks
    const { data: allMunicipalities = [], isLoading: isLoadingMunicipalities } =
        useMunicipalitiesWithVisibility({ includeNational: true });
    const { data: pilots = [], isLoading: isLoadingPilots } = usePilotsWithVisibility();
    const { data: challenges = [], isLoading: isLoadingChallenges } = useChallengesWithVisibility();

    // Find current user's municipality
    const myMunicipality = allMunicipalities.find(m => m.contact_email === user?.email);

    // Identify peer municipalities
    const peerMunicipalities = myMunicipality
        ? allMunicipalities.filter(m =>
            m.id !== myMunicipality.id &&
            (Math.abs((m.population || 0) - (myMunicipality.population || 0)) < myMunicipality.population * 0.5 ||
                m.city_type === myMunicipality.city_type)
        )
        : [];

    // Identify success stories from peers
    const peerSuccesses = pilots.filter(p =>
        p.stage === 'completed' &&
        p.recommendation === 'scale' &&
        peerMunicipalities.some(m => m.id === p.municipality_id)
    );

    return {
        allMunicipalities,
        myMunicipality,
        peerMunicipalities,
        peerSuccesses,
        pilots,
        challenges,
        isLoading: isLoadingMunicipalities || isLoadingPilots || isLoadingChallenges
    };
}

