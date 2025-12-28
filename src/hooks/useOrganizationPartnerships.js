import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export function useOrganizationPartnerships(organizationId) {
    const queryClient = useAppQueryClient();

    const query = useQuery({
        queryKey: ['organization-partnerships', organizationId],
        queryFn: async () => {
            let queryFn = supabase
                .from('organization_partnerships')
                .select('*');

            if (organizationId) {
                queryFn = queryFn.or(`organization_id.eq.${organizationId},partner_organization_id.eq.${organizationId}`);
            }

            const { data, error } = await queryFn;
            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const createPartnership = useMutation({
        mutationFn: async (newPartnership) => {
            const { data, error } = await supabase
                .from('organization_partnerships')
                .insert([newPartnership])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-partnerships'] });
            toast.success("Partnership created successfully");
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const updatePartnership = useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('organization_partnerships')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-partnerships'] });
            toast.success("Partnership updated successfully");
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    const deletePartnership = useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase
                .from('organization_partnerships')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization-partnerships'] });
            toast.success("Partnership deleted successfully");
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    return {
        partnerships: query.data || [],
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        createPartnership,
        updatePartnership,
        deletePartnership
    };
}

export default useOrganizationPartnerships;



