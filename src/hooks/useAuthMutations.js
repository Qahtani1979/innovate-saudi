import { useMutation } from '@tanstack/react-query';
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
        },
        onSuccess: () => {
            toast.success('Password updated successfully');
        },
        onError: (error) => {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Failed to update password');
        }
    });

    return { updatePassword };
}
