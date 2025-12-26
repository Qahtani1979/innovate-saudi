import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInnovationMutations() {
    const queryClient = useQueryClient();

    const createRDProject = useMutation({
        mutationFn: async ({ projectData, proposalId }) => {
            // 1. Create RD Project
            const { data: rdProject, error: createError } = await supabase
                .from('rd_projects')
                .insert([projectData])
                .select()
                .single();

            if (createError) throw createError;

            // 2. Update Proposal if linked
            if (proposalId) {
                const { error: updateError } = await supabase
                    .from('innovation_proposals')
                    .update({
                        converted_entity_type: 'rd_project',
                        converted_entity_id: rdProject.id
                    })
                    .eq('id', proposalId);
                if (updateError) throw updateError;

                // 3. Log System Activity
                const { error: activityError } = await supabase
                    .from('system_activities')
                    .insert([{
                        entity_type: 'innovation_proposal',
                        entity_id: proposalId,
                        action: 'converted_to_rd_project',
                        description: `Proposal converted to R&D Project: ${rdProject.title_en || rdProject.title}`
                    }]);

                if (activityError) console.warn("Activity log error:", activityError);
            }

            return rdProject;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['innovation-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            // toast.success is handled in component usually, but ok here too if specific
        }
    });

    return {
        createRDProject
    };
}
