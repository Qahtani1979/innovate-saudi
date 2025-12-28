import { useQuery } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useStakeholders() {
    const queryClient = useAppQueryClient();

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



