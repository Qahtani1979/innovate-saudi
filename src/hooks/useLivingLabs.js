import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useLivingLabs() {
    return useQuery({
        queryKey: ['living-labs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('living_labs')
                .select('*')
                .eq('is_deleted', false);
            if (error) throw error;
            return data;
        }
    });
}

export function useMyLivingLabs(userEmail) {
    return useQuery({
        queryKey: ['my-labs', userEmail],
        queryFn: async () => {
            const { data, error } = await supabase.from('living_labs').select('*').eq('is_deleted', false);
            if (error) throw error;
            return data?.filter(l =>
                l.director_email === userEmail ||
                l.manager_email === userEmail ||
                l.created_by === userEmail
            ) || [];
        },
        enabled: !!userEmail
    });
}

export function useLivingLabMutations() {
    const queryClient = useQueryClient();

    const createLab = useMutation({
        mutationFn: async (data) => {
            const { data: newLab, error } = await supabase
                .from('living_labs')
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return newLab;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['living-labs'] });
            queryClient.invalidateQueries({ queryKey: ['my-labs'] });
            toast.success('Living Lab created successfully');
        },
        onError: (error) => {
            console.error('Error creating living lab:', error);
            toast.error('Failed to create Living Lab');
        }
    });

    return { createLab };
}
