import { useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useRDProposalMutations() {
    const queryClient = useAppQueryClient();

    const submitProposal = useMutation({
        mutationFn: async (/** @type {{id: any, title: any, checklist: any, notes: string, aiBrief: any}} */ { id, title, checklist, notes, aiBrief }) => {
            // Update status and submission date
            const { error: updateError } = await supabase
                .from('rd_proposals')
                .update({
                    status: 'submitted',
                    submission_date: new Date().toISOString(),
                    submission_checklist: checklist,
                    submission_notes: notes,
                    ai_submission_brief: aiBrief
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
    const queryClient = useAppQueryClient();

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

    const advanceTRL = useMutation({
        mutationFn: async (/** @type {{project: any, newTRL: number, justification: string, evidence: string[], aiValidation: any}} */{ project, newTRL, justification, evidence, aiValidation }) => {
            const historyEntry = {
                from: project.trl_current || project.trl_start,
                to: newTRL,
                date: new Date().toISOString(),
                justification: justification,
                evidence_urls: evidence,
                ai_validation: aiValidation
            };

            const { error } = await supabase
                .from('rd_projects')
                .update({
                    trl_current: newTRL, // Cast to int?
                    trl_advancement_history: [...(project.trl_advancement_history || []), historyEntry]
                })
                .eq('id', project.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] }); // Singular or plural? RDTRLAdvancement uses 'rd-project' (singular)
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('TRL advanced successfully');
        },
        onError: (error) => {
            console.error('TRL advancement error:', error);
            toast.error('Failed to advance TRL');
        }
    });

    return { updateTRL, advanceTRL };
}

export function useRDMutations() {
    const queryClient = useAppQueryClient();

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



    const kickoffProject = useMutation({
        mutationFn: async (/** @type {{project: any, kickoffDate: string, notes: string, milestones: any[]}} */ { project, kickoffDate, notes, milestones }) => {
            const { error } = await supabase
                .from('rd_projects')
                .update({
                    status: 'active',
                    timeline: {
                        ...project.timeline,
                        start_date: kickoffDate,
                        milestones: milestones
                    },
                    kickoff_notes: notes
                })
                .eq('id', project.id);
            if (error) throw error;

            // Notification handled by component using useNotificationSystem
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] });
            toast.success('Project kicked off successfully');
        },
        onError: (error) => {
            console.error('Kickoff error:', error);
            toast.error('Failed to kick off project');
        }
    });

    const completeProject = useMutation({
        mutationFn: async (/** @type {{project: any, trlAchieved: number, impactSummary: string, lessonsLearned: string, commercializationPotential: string}} */ { project, trlAchieved, impactSummary, lessonsLearned, commercializationPotential }) => {
            const { error } = await supabase
                .from('rd_projects')
                .update({
                    status: 'completed',
                    trl_current: trlAchieved,
                    impact_assessment: {
                        ...project.impact_assessment,
                        summary: impactSummary
                    },
                    completion_data: {
                        completion_date: new Date().toISOString(),
                        lessons_learned: lessonsLearned,
                        commercialization_potential: commercializationPotential,
                        final_trl: trlAchieved
                    }
                })
                .eq('id', project.id);
            if (error) throw error;

            // Notification handled by component using useNotificationSystem
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] });
            toast.success('Project marked as completed');
        },
        onError: (error) => {
            console.error('Completion error:', error);
            toast.error('Failed to complete project');
        }
    });

    const provideFeedback = useMutation({
        mutationFn: async (/** @type {{proposal: any, feedback: string}} */ { proposal, feedback }) => {
            const { error } = await supabase
                .from('rd_proposals')
                .update({
                    feedback_provided: true,
                    feedback_text: feedback,
                    feedback_date: new Date().toISOString()
                })
                .eq('id', proposal.id);
            if (error) throw error;

            // Notification handled by component using useNotificationSystem
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposal'] });
            queryClient.invalidateQueries({ queryKey: ['proposals'] });
            toast.success('Feedback sent');
        },
        onError: (error) => {
            console.error('Feedback error:', error);
            toast.error('Failed to send feedback');
        }
    });

    const validateProjectOutputs = useMutation({
        mutationFn: async (/** @type {{projectId: any, notes: string, results: any, qualityScore: number}} */ { projectId, notes, results, qualityScore }) => {
            const { error } = await supabase
                .from('rd_projects')
                .update({
                    output_validation: {
                        validated: true,
                        validation_date: new Date().toISOString(),
                        validator_notes: notes,
                        validation_results: results,
                        quality_score: qualityScore
                    }
                })
                .eq('id', projectId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-project'] });
            toast.success('Outputs validated');
        },
        onError: (error) => {
            console.error('Validation error:', error);
            toast.error('Failed to validate outputs');
        }
    });

    return {
        submitProposal: useRDProposalMutations().submitProposal,
        updateProposal,
        updateProject,
        linkPolicyToProject,
        unlinkPolicyFromProject,
        kickoffProject,
        completeProject,
        validateProjectOutputs,
        provideFeedback
    };
}

