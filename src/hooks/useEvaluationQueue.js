import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export function useEvaluationQueue() {
    const queryClient = useAppQueryClient();
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [showEvaluationForm, setShowEvaluationForm] = useState(false);

    // For now, we'll fetch all and the form will handle assignment check if needed, 
    // but we should ideally pass an assignmentId if we have one.
    // In many cases, we might not have a direct assignmentId here if it's a general queue.
    // Let's at least ensure we provide one if possible or make it optional in the form.

    const { data: proposals = [], isLoading: isLoadingProposals } = useQuery({
        queryKey: ['pending-proposals'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('rd_proposals')
                .select('*, expert_assignments(id)')
                .in('status', ['submitted', 'under_review']);
            if (error) throw error;
            return data || [];
        }
    });

    const { data: pilots = [], isLoading: isLoadingPilots } = useQuery({
        queryKey: ['evaluation-pilots'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('pilots')
                .select('*, expert_assignments(id)')
                .eq('stage', 'evaluation');
            if (error) throw error;
            return data || [];
        }
    });

    const handleEvaluate = (entity, type) => {
        setSelectedEntity({ ...entity, entityType: type });
        setShowEvaluationForm(true);
    };

    const handleEvaluationComplete = async () => {
        setShowEvaluationForm(false);

        if (selectedEntity) {
            try {
                await supabase.functions.invoke('checkConsensus', {
                    body: {
                        entity_type: selectedEntity.entityType,
                        entity_id: selectedEntity.id
                    }
                });
                // eslint-disable-next-line no-empty
            } catch (e) {
                console.error('Error invoking checkConsensus:', e);
            }
        }

        setSelectedEntity(null);
        queryClient.invalidateQueries({ queryKey: ['pending-proposals'] });
        queryClient.invalidateQueries({ queryKey: ['evaluation-pilots'] });
    };

    return {
        proposals,
        pilots,
        isLoading: isLoadingProposals || isLoadingPilots,
        selectedEntity,
        showEvaluationForm,
        setShowEvaluationForm,
        handleEvaluate,
        handleEvaluationComplete
    };
}

