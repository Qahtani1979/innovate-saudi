import { useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Hook to manage authentication mutations
 */
export function useAuthMutations() {

    const updatePassword = useMutation({
        /**
         * @param {string} newPassword
         */
        mutationFn: async (newPassword) => {
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            return data;
        }
    });

    return { updatePassword };
}

export function useTwoFactorMutations() {
    const queryClient = useAppQueryClient();

    const enrollMFA = useMutation({
        mutationFn: async () => {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'Authenticator App'
            });
            if (error) throw error;
            return data;
        }
    });

    const verifyMFA = useMutation({
        /**
         * @param {{ factorId: string, code: string }} variables
         */
        mutationFn: async ({ factorId, code }) => {
            // Challenge first
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: factorId
            });
            if (challengeError) throw challengeError;

            // Verify
            const { data, error } = await supabase.auth.mfa.verify({
                factorId: factorId,
                challengeId: challengeData.id,
                code: code
            });

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mfa-status'] });
        }
    });

    const unenrollMFA = useMutation({
        /**
         * @param {string} factorId
         */
        mutationFn: async (factorId) => {
            const { error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mfa-status'] });
        }
    });

    return { enrollMFA, verifyMFA, unenrollMFA };
}

export function useAccountMutations() {
    const queryClient = useAppQueryClient();

    const deleteAccount = useMutation({
        /**
         * @param {string} userId
         */
        mutationFn: async (userId) => {
            if (!userId) throw new Error('User ID required');

            // Soft delete profile
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                    is_deleted: true,
                    deleted_at: new Date().toISOString(),
                    full_name: '[Deleted User]',
                    phone_number: null,
                    avatar_url: null,
                })
                .eq('user_id', userId);

            if (profileError) throw profileError;

            // Delete roles
            const { error: rolesError } = await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', userId);

            if (rolesError) throw rolesError;
        }
    });

    return { deleteAccount };
}


