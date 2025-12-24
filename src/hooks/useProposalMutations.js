import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';

/**
 * Hook for proposal mutations
 */
export function useProposalMutations() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation } = useAuditLogger();

    const createProposal = useMutation({
        mutationFn: async (data) => {
            const proposalData = {
                ...data,
                proposer_email: user?.email,
                submitted_at: new Date().toISOString(),
                status: data.status || 'submitted'
            };

            const { data: proposal, error } = await supabase
                .from('challenge_proposals')
                .insert(proposalData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'challenge_proposal', proposal.id, null, proposalData);

            return proposal;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['my-proposals'] });
            toast.success(t({ en: 'Proposal submitted successfully', ar: 'تم إرسال المقترح بنجاح' }));
        },
        onError: (error) => {
            console.error('Create proposal error:', error);
            toast.error(t({ en: 'Failed to submit proposal', ar: 'فشل إرسال المقترح' }));
        }
    });

    const updateProposal = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentProposal } = await supabase
                .from('challenge_proposals')
                .select('*')
                .eq('id', id)
                .single();

            const { data: proposal, error } = await supabase
                .from('challenge_proposals')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'challenge_proposal', id, currentProposal, data);

            return proposal;
        },
        onSuccess: (proposal) => {
            queryClient.invalidateQueries({ queryKey: ['challenge-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['challenge-proposal', proposal.id] });
            toast.success(t({ en: 'Proposal updated', ar: 'تم تحديث المقترح' }));
        },
        onError: (error) => {
            console.error('Update proposal error:', error);
            toast.error(t({ en: 'Failed to update proposal', ar: 'فشل تحديث المقترح' }));
        }
    });

    return {
        createProposal,
        updateProposal
    };
}
