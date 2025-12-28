import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useMutation } from '@/hooks/useAppQueryClient';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuditLogger } from '@/hooks/useAuditLogger';
import { useAuth } from '@/lib/AuthContext';

/**
 * Hook for managing matchmaker proposals.
 */
export function useMatchmakerProposalMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { notify } = useNotificationSystem();
    const { logCrudOperation } = useAuditLogger();
    const { user } = useAuth();

    const createProposal = useMutation({
        mutationFn: async ({ matchId, applicationId, challengeId, formData, status = 'draft' }) => {
            const { data, error } = await supabase
                .from('matchmaker_proposals')
                .insert([
                    {
                        match_id: matchId,
                        application_id: applicationId,
                        challenge_id: challengeId,
                        ...formData,
                        status: status,
                        submitted_at: status === 'submitted' ? new Date().toISOString() : null
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            // If submitted, update the match status as well
            if (status === 'submitted') {
                const { error: matchError } = await supabase
                    .from('challenge_solution_matches')
                    .update({ status: 'proposal_submitted' })
                    .eq('id', matchId);
                if (matchError) throw matchError;

                // Notification Logic
                // Fetch match details to find recipient (Challenge Owner)
                const { data: matchData } = await supabase
                    .from('challenge_solution_matches')
                    .select(`
                        id,
                        challenge:challenges!inner(
                            id,
                            title_en,
                            profiles:created_by(email)
                        )
                    `)
                    .eq('id', matchId)
                    .single();

                // @ts-ignore
                const recipientEmail = matchData?.challenge?.profiles?.email;

                if (recipientEmail) {
                    await notify({
                        type: 'matchmaker_proposal_submitted',
                        entityType: 'matchmaker_proposal',
                        entityId: data.id,
                        recipientEmails: [recipientEmail],
                        title: 'New Proposal Received',
                        message: `A new proposal has been submitted for match #${matchId}`,
                        metadata: { match_id: matchId, challenge_id: challengeId },
                        sendEmail: true,
                        emailTemplate: 'matchmaker_proposal_submitted',
                        emailVariables: {
                            // @ts-ignore
                            challenge_title: matchData?.challenge?.title_en,
                            proposal_id: data.id
                        }
                    });
                }
            }

            await logCrudOperation('create', 'matchmaker_proposal', data.id, null, { matchId, status });

            return data;
        },
        onSuccess: (data, variables) => {
            const status = variables.status; // 'draft' or 'submitted'
            toast.success(status === 'submitted'
                ? t({ en: 'Proposal submitted successfully', ar: 'تم تقديم العرض بنجاح' })
                : t({ en: 'Draft saved', ar: 'تم حفظ المسودة' })
            );

            queryClient.invalidateQueries({ queryKey: ['matchmaker-proposals'] });
            queryClient.invalidateQueries({ queryKey: ['challenge_solution_matches'] });
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to save proposal', ar: 'فشل حفظ العرض' }));
            console.error(error);
        }
    });

    return { createProposal };
}


