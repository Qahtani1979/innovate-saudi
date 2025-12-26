
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export function useProgramAssignments(programId) {
    const queryClient = useAppQueryClient();
    const { user } = useAuth();

    const { data: program } = useQuery({
        queryKey: ['program', programId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('programs')
                .select('*')
                .eq('id', programId)
                .eq('is_deleted', false)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        enabled: !!programId
    });

    const assignments = program?.assignments || [];

    const createAssignment = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase
                .from('programs')
                .update({
                    assignments: [...assignments, {
                        ...data,
                        id: Date.now().toString(),
                        created_date: new Date().toISOString(),
                        created_by: user?.email,
                        submissions: []
                    }]
                })
                .eq('id', programId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['program', programId]);
            toast.success('Assignment created');
        }
    });

    return {
        assignments,
        createAssignment
    };
}

