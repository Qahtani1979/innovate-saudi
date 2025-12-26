import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOrganizationVerificationData(user) {
    const queryClient = useAppQueryClient();

    // 1. Fetch organizations pending verification
    const { data: organizations = [], isLoading: organizationsLoading } = useQuery({
        queryKey: ['organizations-verification'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .eq('is_verified', false)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        }
    });

    // 2. Verification Mutation
    const verifyOrganization = useMutation({
        mutationFn: async ({ orgId, decision, verificationData }) => {
            const score = [
                verificationData.legal_verified,
                verificationData.financial_verified,
                verificationData.operational_verified,
                verificationData.technical_verified
            ].filter(Boolean).length * 25;

            const { error: verifyError } = await supabase
                .from('organization_verifications')
                .insert({
                    organization_id: orgId,
                    verifier_email: user?.email,
                    legal_verified: verificationData.legal_verified,
                    financial_verified: verificationData.financial_verified,
                    operational_verified: verificationData.operational_verified,
                    technical_verified: verificationData.technical_verified,
                    overall_status: decision,
                    verification_score: score,
                    verification_notes: verificationData.verification_notes,
                    risk_flags: verificationData.risk_flags,
                    verification_date: new Date().toISOString(),
                    expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                });
            if (verifyError) throw verifyError;

            const { error: updateError } = await supabase
                .from('organizations')
                .update({
                    is_verified: decision === 'verified',
                    verification_date: new Date().toISOString(),
                    verification_notes: verificationData.verification_notes
                })
                .eq('id', orgId);
            if (updateError) throw updateError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations-verification'] });
            // Toasts are usually handled in component or here? 
            // User context "toast" might not be available here simply.
            // But we can import toast.
            // toast.success is already imported.
        }
    });

    return {
        organizations,
        isLoading: organizationsLoading,
        verifyOrganization
    };
}

