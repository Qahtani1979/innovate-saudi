import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useSandboxCollaborators(sandboxId) {
    return useQuery({
        queryKey: ['sandbox-collaborators', sandboxId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('sandbox_collaborators')
                .select('*')
                .eq('sandbox_id', sandboxId);

            if (error) throw error;
            return data || [];
        },
        enabled: !!sandboxId
    });
}

export function useSandboxCollaboratorMutations() {
    const queryClient = useAppQueryClient();

    const createCollaborator = useMutation({
        /**
         * @param {{ data: any, sandboxId: string }} params
         */
        mutationFn: async ({ data, sandboxId }) => {
            const { error } = await supabase
                .from('sandbox_collaborators')
                .insert([{
                    ...data,
                    sandbox_id: sandboxId
                }]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-collaborators'] });
            toast.success('Collaborator added successfully');
        },
        onError: (error) => {
            console.error('Failed to add collaborator:', error);
            toast.error('Failed to add collaborator');
        }
    });

    const deleteCollaborator = useMutation({
        /**
         * @param {string} id
         */
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('sandbox_collaborators')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sandbox-collaborators'] });
            toast.success('Collaborator removed successfully');
        },
        onError: (error) => {
            console.error('Failed to remove collaborator:', error);
            toast.error('Failed to remove collaborator');
        }
    });

    return { createCollaborator, deleteCollaborator };
}



