import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/components/permissions/usePermissions';

export function useSystemActivities(options = {}) {
    const { limit = 100 } = options;
    const { isAdmin } = usePermissions();

    return useQuery({
        queryKey: ['system-activities', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        enabled: !!isAdmin
    });
}

export function useUserActivities(options = {}) {
    const { limit = 100 } = options;
    const { isAdmin } = usePermissions();

    return useQuery({
        queryKey: ['user-activities', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_activities')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        },
        enabled: !!isAdmin
    });
}
