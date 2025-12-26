import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRDProposalMutations() {
    const queryClient = useQueryClient();

    const submitProposal = useMutation({
        mutationFn: async (/** @type {{id: any, title: any}} */ { id, title }) => {
            // Update status and submission date
            const { error: updateError } = await supabase
                .from('rd_proposals')
                .update({
                    status: 'submitted',
                    submission_date: new Date().toISOString()
                })
                .eq('id', id);
            if (updateError) throw updateError;

            // Create system activity
            const { error: activityError } = await supabase
                .from('system_activities')
                .insert({
                    entity_type: 'RDProposal',
                    entity_id: id,
                    activity_type: 'submitted',
                    description: `Proposal "${title}" submitted for review`,
                    // performed_by is handled by RLS or trigger usually, but we can pass it if context available. 
                    // For now relying on default or let component pass it if needed, but the original code passed created_by from proposal object which might be stale.
                    // Better to let backend handle performed_by or assume auth user.
                    timestamp: new Date().toISOString()
                });
            if (activityError) console.error('Activity log error:', activityError);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposal'] });
            // Success toast handled by component usually, or here.
        },
        onError: (error) => {
            console.error('Submission error:', error);
            toast.error('Failed to submit proposal');
        }
    });

    return { submitProposal };
}

export function useTRLAssessmentMutations() {
    const queryClient = useQueryClient();

    const updateTRL = useMutation({
        mutationFn: async (/** @type {{id: any, trl: any, assessment: any}} */ { id, trl, assessment }) => {
            const { error } = await supabase
                .from('rd_projects')
                .update({
                    trl_current: trl,
                    trl_assessment: assessment
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('TRL updated successfully');
        },
        onError: (error) => {
            console.error('TRL update error:', error);
            toast.error('Failed to update TRL');
        }
    });

    return { updateTRL };
}

export function useRDMutations() {
    const queryClient = useQueryClient();

    const updateProposal = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase
                .from('rd_proposals')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposal'] });
            toast.success('Proposal updated');
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error('Failed to update proposal');
        }
    });

    const updateProject = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase
                .from('rd_projects')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] });
            toast.success('Project updated');
        },
        onError: (error) => {
            console.error('Update error:', error);
            toast.error('Failed to update project');
        }
    });

    const linkPolicyToProject = useMutation({
        mutationFn: async ({ projectId, policyId, currentInfluencedPolicyIds, currentResearchEvidenceIds, projectPublications }) => {
            // Update R&D Project
            const { error: rdError } = await supabase
                .from('rd_projects')
                .update({
                    influenced_policy_ids: [...(currentInfluencedPolicyIds || []), policyId]
                })
                .eq('id', projectId);
            if (rdError) throw rdError;

            // Update Policy
            // We need to fetch the policy first to get its current arrays if not provided, 
            // but usually we can assume the component provides necessary info or we fetch here.
            // For simplicity/atomicness, we could use a stored procedure, but here we'll fetch-update.
            // Better yet, the component provided logic invoked a lot of reads.
            // Let's rely on the strategy of the component but encapsulated here.

            const { data: policy, error: fetchError } = await supabase
                .from('policy_recommendations')
                .select('research_evidence_ids, research_publications_cited')
                .eq('id', policyId)
                .single();

            if (fetchError) throw fetchError;

            const { error: policyError } = await supabase
                .from('policy_recommendations')
                .update({
                    research_evidence_ids: [...(policy.research_evidence_ids || []), projectId],
                    research_publications_cited: [
                        ...(policy.research_publications_cited || []),
                        ...(projectPublications?.map(p => p.title) || [])
                    ]
                })
                .eq('id', policyId);

            if (policyError) throw policyError;

            return { projectId, policyId };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] });
            queryClient.invalidateQueries({ queryKey: ['policies-for-impact'] });
            toast.success('Policy impact linked');
        },
        onError: (error) => {
            console.error('Link error:', error);
            toast.error('Failed to link policy');
        }
    });

    const unlinkPolicyFromProject = useMutation({
        mutationFn: async ({ projectId, policyId, currentInfluencedPolicyIds }) => {
            // Update R&D Project
            const { error: rdError } = await supabase
                .from('rd_projects')
                .update({
                    influenced_policy_ids: (currentInfluencedPolicyIds || []).filter(id => id !== policyId)
                })
                .eq('id', projectId);
            if (rdError) throw rdError;

            // Update Policy
            const { data: policy, error: fetchError } = await supabase
                .from('policy_recommendations')
                .select('research_evidence_ids')
                .eq('id', policyId)
                .single();

            if (fetchError) throw fetchError;

            const { error: policyError } = await supabase
                .from('policy_recommendations')
                .update({
                    research_evidence_ids: (policy.research_evidence_ids || []).filter(id => id !== projectId)
                })
                .eq('id', policyId);

            if (policyError) throw policyError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] });
            queryClient.invalidateQueries({ queryKey: ['policies-for-impact'] });
            toast.success('Link removed');
        },
        onError: (error) => {
            console.error('Unlink error:', error);
            toast.error('Failed to unlink policy');
        }
    });

    return {
        submitProposal: useRDProposalMutations().submitProposal, // Re-exporting for convenience if needed, or just keep separate
        updateProposal,
        updateProject,
        linkPolicyToProject,
        unlinkPolicyFromProject
    };
}
