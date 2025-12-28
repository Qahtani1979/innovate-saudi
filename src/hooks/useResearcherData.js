import { useQuery } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useResearcherData() {
    const { data: projects = [], isLoading: projectsLoading } = useQuery({
        queryKey: ['rd-projects-network'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_projects')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });

    const { data: organizations = [], isLoading: orgsLoading } = useQuery({
        queryKey: ['organizations-network'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });

    return {
        projects,
        organizations,
        isLoading: projectsLoading || orgsLoading
    };
}

