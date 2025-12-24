import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function usePendingInvoices() {
    return useQuery({
        queryKey: ['invoices-pending'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .eq('status', 'submitted')
                .order('issue_date', { ascending: false });

            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000
    });
}

export function useInvoiceMutations() {
    const queryClient = useQueryClient();

    const approveInvoice = useMutation({
        mutationFn: async ({ invoiceId, approved, notes, approvedBy }) => {
            const { error } = await supabase.from('invoices').update({
                status: approved ? 'approved' : 'draft', // Rejecting usually sends back to draft or rejected
                approved_by: approved ? approvedBy : null,
                approval_date: approved ? new Date().toISOString() : null,
                approval_notes: notes
            }).eq('id', invoiceId);

            if (error) throw error;
            return { invoiceId, approved };
        },
        onSuccess: ({ approved }) => {
            queryClient.invalidateQueries({ queryKey: ['invoices-pending'] });
            toast.success(approved ? 'Invoice approved successfully' : 'Invoice rejected/returned to draft');
        },
        onError: (error) => {
            console.error('Invoice mutation error:', error);
            toast.error('Failed to update invoice status');
        }
    });

    return {
        approveInvoice
    };
}
