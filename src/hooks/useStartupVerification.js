import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStartupVerifications() {
    return useQuery({
        queryKey: ['verifications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('startup_verifications')
                .select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useStartupVerificationMutations() {
    const queryClient = useAppQueryClient();

    const verifyStartup = useMutation({
        /**
     * @param {{ startupId: string, status: string, verificationData: any, notes: string, score: number }} variables
     */
        mutationFn: async ({ startupId, status, verificationData, notes, score }) => {
            // 1. Create verification record
            const { error: verifyError } = await supabase
                .from('startup_verifications')
                .insert({
                    startup_profile_id: startupId,
                    status,
                    legal_verification: verificationData.legal_verification,
                    financial_verification: verificationData.financial_verification,
                    team_verification: verificationData.team_verification,
                    product_verification: verificationData.product_verification,
                    overall_verification_score: score,
                    verification_notes: notes,
                    verification_date: new Date().toISOString()
                });

            if (verifyError) throw verifyError;

            // 2. Update startup profile status
            const { error: updateError } = await supabase
                .from('startup_profiles')
                .update({
                    is_verified: status === 'verified',
                    verification_date: new Date().toISOString()
                })
                .eq('id', startupId);

            if (updateError) throw updateError;

            // 3. Trigger notification (email)
            // Check for user email first - fetching simple profile to get email if not passed
            const { data: startup } = await supabase
                .from('startup_profiles')
                .select('user_email, name_en, company_name_en')
                .eq('id', startupId)
                .single();

            if (startup?.user_email) {
                await supabase.functions.invoke('email-trigger-hub', {
                    body: {
                        trigger: status === 'verified' ? 'STARTUP_VERIFIED' : 'STARTUP_VERIFICATION_UPDATE',
                        recipientEmail: startup.user_email,
                        entityType: 'startup',
                        entityId: startupId,
                        variables: {
                            startupName: startup.name_en || startup.company_name_en,
                            verificationStatus: status,
                            verificationNotes: notes,
                            verificationScore: score
                        }
                    }
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['startups'] });
            queryClient.invalidateQueries({ queryKey: ['verifications'] });
            queryClient.invalidateQueries({ queryKey: ['startups-verification'] }); // legacy key
            toast.success('Verification submitted');
        },
        onError: (error) => {
            console.error('Verification failed:', error);
            toast.error('Failed to submit verification');
        }
    });

    return {
        verifyStartup
    };
}



