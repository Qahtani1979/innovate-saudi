
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook for R&D Proposal mutations (create, update, delete)
 */
export function useRDProposalMutations() {
    const queryClient = useQueryClient();

    const createRDProposal = useMutation({
        mutationFn: async (/** @type {any} */ newProposal) => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('rd_proposals')
                .insert(newProposal)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposals'] });
            toast.success('R&D Proposal created successfully');
        },
        onError: (error) => {
            console.error('Error creating R&D Proposal:', error);
            toast.error('Failed to create R&D Proposal');
        }
    });

    const updateRDProposal = useMutation({
        mutationFn: async ({ id, updates }) => {
            // @ts-ignore
            const { data, error } = await supabase
                .from('rd_proposals')
                .update(/** @type {any} */(updates))
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['rd-proposal', data.id] });
            toast.success('R&D Proposal updated successfully');
        },
        onError: (error) => {
            console.error('Error updating R&D Proposal:', error);
            toast.error('Failed to update R&D Proposal');
        }
    });

    const deleteRDProposal = useMutation({
        mutationFn: async (/** @type {string} */ id) => {
            const { error } = await supabase
                .from('rd_proposals')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposals'] });
            toast.success('R&D Proposal deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting R&D Proposal:', error);
            toast.error('Failed to delete R&D Proposal');
        }
    });

    const awardProposal = useMutation({
        mutationFn: async (/** @type {{ proposal: any, awardAmount: number, awardNotes: string, startDate: string, user: any, rdCall: any }} */ { proposal, awardAmount, awardNotes, startDate, user, rdCall }) => {
            // 1. Create R&D Project
            const { data: rdProject, error: projectError } = await supabase.from('rd_projects').insert({
                code: `RD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                title_en: proposal.title_en,
                title_ar: proposal.title_ar,
                tagline_en: proposal.tagline_en,
                tagline_ar: proposal.tagline_ar,
                abstract_en: proposal.abstract_en,
                abstract_ar: proposal.abstract_ar,
                rd_call_id: proposal.rd_call_id,
                institution_en: proposal.lead_institution,
                institution_ar: proposal.institution_ar,
                principal_investigator: proposal.principal_investigator,
                team_members: proposal.team_members || [],
                budget: awardAmount,
                budget_breakdown: proposal.budget_breakdown || [],
                funding_source_en: `${rdCall?.title_en || 'Unknown'} - Award`,
                funding_source_ar: `${rdCall?.title_ar || 'Unknown'} - Award`,
                funding_status: 'approved',
                duration_months: proposal.duration_months,
                trl_start: proposal.trl_start,
                trl_target: proposal.trl_target,
                trl_current: proposal.trl_start,
                status: 'approved',
                timeline: {
                    start_date: startDate || new Date().toISOString().split('T')[0],
                    milestones: []
                },
                is_published: false
            }).select().single();

            if (projectError) throw projectError;

            // 2. Update Proposal
            const { error: updateError } = await supabase.from('rd_proposals').update({
                status: 'approved',
                awarded_amount: awardAmount,
                award_date: new Date().toISOString(),
                award_notes: awardNotes,
                converted_rd_project_id: rdProject.id
            }).eq('id', proposal.id);

            if (updateError) throw updateError;

            // 3. Log Activity
            await supabase.from('system_activities').insert({
                entity_type: 'RDProposal',
                entity_id: proposal.id,
                activity_type: 'approved',
                description: `Proposal awarded ${awardAmount} SAR and converted to R&D project`,
                performed_by: user?.email,
                timestamp: new Date().toISOString(),
                metadata: { rd_project_id: rdProject.id, awarded_amount: awardAmount }
            });

            // 4. Trigger Email
            if (proposal.principal_investigator?.email) {
                await supabase.functions.invoke('email-trigger-hub', {
                    body: {
                        trigger: 'proposal.accepted',
                        recipient_email: proposal.principal_investigator.email,
                        entity_type: 'rd_proposal',
                        entity_id: proposal.id,
                        variables: {
                            recipientName: proposal.principal_investigator.name,
                            proposalTitle: proposal.title_en,
                            awardedAmount: awardAmount.toLocaleString(),
                            startDate: startDate
                        },
                        triggered_by: user?.email
                    }
                });
            }

            return rdProject;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['rd-projects'] });
            toast.success('Proposal awarded and project created!');
        },
        onError: (error) => {
            console.error('Error awarding proposal:', error);
            toast.error('Failed to process award');
        }
    });

    const reviewProposal = useMutation({
        mutationFn: async (/** @type {{ proposalId: string, decision: string, notes: string, userEmail: string }} */ { proposalId, decision, notes, userEmail }) => {
            // 1. Update proposal status
            const status = decision === 'approve' ? 'shortlisted' :
                decision === 'reject' ? 'rejected' : 'revisions_requested';

            const { error: updateError } = await supabase.from('rd_proposals').update({
                status,
                review_notes: notes,
                reviewed_by: userEmail,
                review_date: new Date().toISOString()
            }).eq('id', proposalId);

            if (updateError) throw updateError;

            // 2. Log activity
            const { error: activityError } = await supabase.from('system_activities').insert({
                entity_type: 'RDProposal',
                entity_id: proposalId,
                activity_type: 'status_changed',
                description: `Review completed: ${decision}`,
                performed_by: userEmail,
                timestamp: new Date().toISOString(),
                metadata: { decision, notes }
            });

            if (activityError) throw activityError;

            return { proposalId, status, decision, notes };
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['rd-proposal', data.proposalId] });
            toast.success('Review submitted successfully');
        },
        onError: (error) => {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        }
    });

    return {
        createRDProposal,
        updateRDProposal,
        deleteRDProposal,
        awardProposal,
        reviewProposal
    };
}
