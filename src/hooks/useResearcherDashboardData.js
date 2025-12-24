import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useResearcherDashboardData(user) {
    // 1. Researcher Profile
    const { data: researcherProfile, isLoading: profileLoading } = useQuery({
        queryKey: ['researcher-profile', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('researcher_profiles')
                .select('*')
                .eq('user_id', user?.id)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!user?.id
    });

    // 2. R&D Calls
    const { data: rdCalls = [], isLoading: callsLoading } = useQuery({
        queryKey: ['rd-calls-researcher'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_calls')
                .select('*')
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    // 3. R&D Projects
    const { data: rdProjects = [], isLoading: projectsLoading } = useQuery({
        queryKey: ['rd-projects-researcher', user?.email],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*')
                .eq('researcher_email', user?.email)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    // 4. Living Labs
    const { data: livingLabs = [], isLoading: labsLoading } = useQuery({
        queryKey: ['living-labs-researcher'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_labs')
                .select('*')
                .eq('is_deleted', false)
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .limit(5);
            if (error) throw error;
            return data || [];
        }
    });

    return {
        researcherProfile,
        rdCalls,
        rdProjects,
        livingLabs,
        isLoading: profileLoading || callsLoading || projectsLoading || labsLoading
    };
}
