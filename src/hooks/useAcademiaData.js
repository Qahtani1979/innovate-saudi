import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for fetching data tailored for the Academia & Research Portal.
 * Centralizes researcher profile, R&D calls, projects, proposals, and ecosystem resources.
 */
export function useAcademiaData() {
    const { user } = useAuth();

    // Researcher Profile
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['my-researcher-profile', user?.email],
        queryFn: async () => {
            const { data } = await supabase.from('researcher_profiles').select('*').eq('email', user?.email).single();
            return data || null;
        },
        enabled: !!user?.email
    });

    // Open R&D Calls
    const { data: openRDCalls, isLoading: callsLoading } = useQuery({
        queryKey: ['open-rd-calls-researcher'],
        queryFn: async () => {
            const { data, error } = await supabase.from('rd_calls')
                .select('*')
                .eq('status', 'open')
                .eq('is_published', true)
                .gt('application_deadline', new Date().toISOString())
                .order('application_deadline', { ascending: true });
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // My R&D Projects
    const { data: myRDProjects, isLoading: projectsLoading } = useQuery({
        queryKey: ['my-rd-projects-researcher', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase.from('rd_projects')
                .select('*')
                .eq('is_deleted', false)
                .eq('created_by', user?.email)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // My Proposals
    const { data: myProposals, isLoading: proposalsLoading } = useQuery({
        queryKey: ['my-rd-proposals', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase.from('rd_proposals')
                .select('*, rd_calls(*)')
                .or(`submitter_email.eq.${user?.email},submitter_id.eq.${user?.id}`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    // Research Challenges & Programs & Labs
    const { data: ecosystemData, isLoading: ecosystemLoading } = useQuery({
        queryKey: ['academia-ecosystem'],
        queryFn: async () => {
            const [challenges, labs, programs] = await Promise.all([
                supabase.from('challenges').select('*').eq('is_deleted', false).eq('is_published', true).in('status', ['approved', 'in_treatment']),
                supabase.from('living_labs').select('*').eq('is_deleted', false).eq('is_active', true).eq('is_public', true),
                supabase.from('programs').select('*').eq('is_deleted', false).eq('is_published', true).in('program_type', ['fellowship', 'training', 'challenge']).in('status', ['applications_open', 'active'])
            ]);

            return {
                researchChallenges: challenges.data || [],
                livingLabs: labs.data || [],
                researchPrograms: programs.data || []
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // My Lab Bookings
    const { data: myLabBookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['my-lab-bookings', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase.from('living_lab_bookings').select('*').eq('booked_by', user?.email);
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    return {
        profile,
        openRDCalls,
        myRDProjects,
        myProposals,
        myLabBookings,
        researchChallenges: ecosystemData?.researchChallenges || [],
        livingLabs: ecosystemData?.livingLabs || [],
        researchPrograms: ecosystemData?.researchPrograms || [],
        isLoading: profileLoading || callsLoading || projectsLoading || proposalsLoading || ecosystemLoading || bookingsLoading
    };
}

export default useAcademiaData;
