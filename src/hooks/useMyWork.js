/**
 * Hook for fetching "My Work" items
 * Aggregates challenges, pilots, and tasks for the user dashboard.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export function useMyWork() {
    const { user } = useAuth();

    const { data: myChallenges = [], isLoading: loadingChallenges } = useQuery({
        queryKey: ['my-challenges', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('challenges')
                .select('*')
                .eq('is_deleted', false)
                .eq('created_by', user.email);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    const { data: myPilots = [], isLoading: loadingPilots } = useQuery({
        queryKey: ['my-pilots', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('pilots')
                .select('*')
                .eq('is_deleted', false)
                .eq('created_by', user.email);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    const { data: myTasks = [], isLoading: loadingTasks } = useQuery({
        queryKey: ['my-tasks', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', user.email)
                .neq('status', 'completed');

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.email
    });

    return {
        myChallenges,
        myPilots,
        myTasks,
        isLoading: loadingChallenges || loadingPilots || loadingTasks
    };
}
