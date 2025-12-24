import { supabase } from '@/integrations/supabase/client';
import { useAuthMutations } from '@/hooks/useAuthMutations';

export function usePasswordReset() {
    const { updatePassword } = useAuthMutations();

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    };

    return {
        checkSession,
        updatePassword
    };
}
