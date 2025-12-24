import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTeams() {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data, error } = await supabase.from('teams').select('*');
            if (error) throw error;
            return data || [];
        }
    });
}

export function useTeamMutations() {
    const queryClient = useQueryClient();

    const createTeam = useMutation({
        mutationFn: async (data) => {
            const { data: result, error } = await supabase
                .from('teams')
                .insert([data])
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team created');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const updateTeam = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: result, error } = await supabase
                .from('teams')
                .update(data)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team updated');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    const deleteTeam = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('teams').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            toast.success('Team deleted');
        },
        onError: (error) => toast.error(`Error: ${error.message}`)
    });

    return { createTeam, updateTeam, deleteTeam };
}
