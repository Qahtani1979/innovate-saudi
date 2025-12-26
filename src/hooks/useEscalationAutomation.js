/**
 * Hook for Proposal Escalation Automation
 * Handles logic checking and triggering escalation for R&D proposals.
 */

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';

export function useProposalEscalation() {
    const queryClient = useAppQueryClient();

    const escalateMutation = useMutation({
        mutationFn: async ({ proposal, rdCall, escalationData }) => {
            // Update proposal with escalation
            const { error: updateError } = await supabase
                .from('rd_proposals')
                .update(escalationData)
                .eq('id', proposal.id);
            if (updateError) throw updateError;

            // Create notification
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_email: rdCall?.organizer_email || 'admin@platform.com',
                    title: `🚨 R&D Proposal Escalation: ${proposal.title_en}`,
                    message: `Proposal ${proposal.proposal_code} has been escalated (Level ${escalationData.escalation_level})`,
                    type: 'escalation',
                    entity_type: 'RDProposal',
                    entity_id: proposal.id,
                    priority: 'high'
                });
            if (notifError) console.error('Notification error:', notifError);

            // Send email notification via email-trigger-hub
            if (rdCall?.organizer_email) {
                await supabase.functions.invoke('email-trigger-hub', {
                    body: {
                        trigger: 'challenge.escalated',
                        recipient_email: rdCall.organizer_email,
                        entity_type: 'rd_proposal',
                        entity_id: proposal.id,
                        variables: {
                            proposalTitle: proposal.title_en,
                            proposalCode: proposal.proposal_code,
                            escalationLevel: escalationData.escalation_level
                        },
                        triggered_by: 'system'
                    }
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rd-proposal'] });
        },
        onError: (error) => {
            console.error('Escalation failed:', error);
        }
    });

    return { escalateMutation };
}

