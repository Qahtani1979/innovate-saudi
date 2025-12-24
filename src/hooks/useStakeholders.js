import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStakeholders() {
    const queryClient = useQueryClient();

    const useGetAllStakeholders = () => useQuery({
        queryKey: ['stakeholders'],
        queryFn: async () => {
            const { data, error } = await supabase.from('stakeholders').select('*');
            if (error) throw error;
            return data;
        }
    });

    return {
        useGetAllStakeholders
    };
}
