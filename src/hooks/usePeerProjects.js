import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

export function usePeerProjects(programId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const { data: program } = useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .eq('is_deleted', false)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!programId
    });

    const projects = program?.peer_projects || [];

    const createProject = useMutation({
        mutationFn: async (projectData) => {
            const newProjects = [...projects, {
                ...projectData,
                id: Date.now().toString(),
                created_date: new Date().toISOString(),
                created_by: user?.email || 'anonymous',
                reviews: []
            }];
            const { error } = await supabase
                .from('programs')
                .update({ peer_projects: newProjects })
                .eq('id', programId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program', programId] });
            toast.success('Team project created');
        }
    });

    const submitReview = useMutation({
        mutationFn: async ({ projectId, reviewData }) => {
            const updatedProjects = projects.map(p =>
                p.id === projectId ? {
                    ...p,
                    reviews: [...(p.reviews || []), {
                        reviewer_email: user?.email || 'anonymous',
                        rating: reviewData.rating,
                        feedback: reviewData.feedback,
                        review_date: new Date().toISOString()
                    }]
                } : p
            );

            const { error } = await supabase
                .from('programs')
                .update({ peer_projects: updatedProjects })
                .eq('id', programId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['program', programId] });
            toast.success('Peer review submitted');
        }
    });

    return {
        projects,
        createProject,
        submitReview
    };
}


