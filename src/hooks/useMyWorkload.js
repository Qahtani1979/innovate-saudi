import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function useMyChallenges() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['my-challenges', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];

            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_deleted', false)
                .or(`created_by.eq.${user.email},reviewer.eq.${user.email}`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });
}

export function useMyPilots() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['my-pilots', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];

            // Note: checking array column 'team' for email usually requires different syntax 
            // or fetching all and filtering if structural structure is complex JSON.
            // But assuming simple case or falling back to client filter if JSON.
            // Current implementation in dashboard was fetching ALL.
            // Let's optimize by fetching created_by first, and maybe we can't easily filter JSON array in Supabase directly without specific operator.
            // We will duplicate the logic: fetch common ones or all if needed, but 'or' with created_by is safest start.

            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false);

            if (error) throw error;

            // Client side filtering for team members as it's likely a JSONB col
            return data?.filter(p => p.created_by === user.email || p.team?.some(t => t.email === user.email)) || [];
        },
        enabled: !!user?.email
    });
}

export function useMyTasks() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['my-tasks', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];

            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .or(`assigned_to.eq.${user.email},created_by.eq.${user.email}`);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });
}

export function useMyExpertAssignments() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['my-expert-assignments', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];

            const { data, error } = await supabase
                .from('expert_assignments')
                .select('*')
                .eq('expert_email', user.email);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });
}
