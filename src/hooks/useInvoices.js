import { useQuery, useMutation } from '@/hooks/useAppQueryClient';
import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useInvoices(filters = {}) {
    return useQuery({
        queryKey: ['invoices', filters],
        queryFn: async () => {
            let query = supabase
                .from('invoices')
                .select('*, providers(name_en, name_ar)')
                .order('created_at', { ascending: false });

            if (filters.status && filters.status !== 'all') {
                query = query.eq('status', filters.status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useInvoice(id) {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            if (!id) return null;
            const { data, error } = await supabase
                .from('invoices')
                .select('*, providers(name_en, name_ar), invoice_items(*)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id
    });
}

export function useInvoiceMutations() {
    const queryClient = useAppQueryClient();

    const createInvoice = useMutation({
        mutationFn: async (invoiceData) => {
            const { data, error } = await supabase
                .from('invoices')
                .insert(invoiceData)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            toast.success('Invoice created successfully');
        },
        onError: (error) => {
            toast.error(`Failed to create invoice: ${error.message}`);
        }
    });

    const updateInvoice = useMutation({
        mutationFn: async ({ id, updates }) => {
            const { data, error } = await supabase
                .from('invoices')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
            toast.success('Invoice updated successfully');
        },
        onError: (error) => {
            toast.error(`Failed to update invoice: ${error.message}`);
        }
    });

    return {
        createInvoice,
        updateInvoice
    };
}


export function usePendingInvoices() {
    return useInvoices({ status: 'pending' });
}

