import { useQuery, useMutation } from '@/hooks/useAppQueryClient';

import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export function useProgramResources(programId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const { data: program } = useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data } = await supabase.from('programs').select('*').eq('id', programId).eq('is_deleted', false).maybeSingle();
            return data;
        },
        enabled: !!programId
    });

    const resources = program?.resources || [];

    const addResource = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('programs').update({
                resources: [...resources, {
                    ...data,
                    id: Date.now().toString(),
                    uploaded_date: new Date().toISOString(),
                    uploaded_by: user?.email
                }]
            }).eq('id', programId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['program', programId]);
            toast.success('Resource added successfully');
        }
    });

    return {
        resources,
        addResource,
        isLoading: !program
    };
}



