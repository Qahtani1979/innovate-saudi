import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePolicyTemplates() {
    return useQuery({
        queryKey: ['policy-templates'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('policy_templates')
                .select('*')
                .order('sort_order', { ascending: true })
                .limit(100);

            if (error) throw error;
            return /** @type {import('@/types/supa_ext').PolicyTemplate[]} */ (data) || [];
        }
    });
}

export function usePolicyTemplateMutations() {
    const queryClient = useAppQueryClient();

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<void, Error, any>}
     */
    const createTemplate = useMutation({
        mutationFn: async (data) => {
            const { error } = await supabase.from('policy_templates').insert(data);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policy-templates']);
            toast.success('Template created');
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<void, Error, { id: string; data: any }>}
     */
    const updateTemplate = useMutation({
        mutationFn: async ({ id, data }) => {
            const { error } = await supabase.from('policy_templates').update(data).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policy-templates']);
            toast.success('Template updated');
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<void, Error, string>}
     */
    const deleteTemplate = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('policy_templates').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['policy-templates']);
            toast.success('Template deleted');
        }
    });

    /**
     * @type {import('@tanstack/react-query').UseMutationResult<void, Error, { id: string; newOrder: number }>}
     */
    const reorderTemplate = useMutation({
        mutationFn: async ({ id, newOrder }) => {
            const { error } = await supabase.from('policy_templates').update({ sort_order: newOrder }).eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries(['policy-templates'])
    });

    return { createTemplate, updateTemplate, deleteTemplate, reorderTemplate };
}

