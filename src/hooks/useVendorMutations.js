import { useAppQueryClient } from '@/hooks/useAppQueryClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAuditLogger, AUDIT_ACTIONS } from './useAuditLogger';
import { useEmailTrigger } from './useEmailTrigger';

/**
 * Hook for vendor mutations
 */
export function useVendorMutations() {
    const queryClient = useAppQueryClient();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { logCrudOperation, logStatusChange } = useAuditLogger();
    const { triggerEmail } = useEmailTrigger();

    const createVendor = useMutation({
        mutationFn: async (data) => {
            const vendorData = {
                ...data,
                created_by: user?.email,
                created_at: new Date().toISOString(),
                status: data.status || 'pending',
            };

            const { data: vendor, error } = await supabase
                .from('vendors')
                .insert(vendorData)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.CREATE, 'vendor', vendor.id, null, vendorData);

            return vendor;
        },
        onSuccess: (vendor) => {
            queryClient.invalidateQueries(['vendors']);
            toast.success(t({ en: 'Vendor created successfully', ar: 'تم إنشاء المورد بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to create vendor', ar: 'فشل إنشاء المورد' }));
            console.error('Create vendor error:', error);
        },
    });

    const updateVendor = useMutation({
        mutationFn: async ({ id, data }) => {
            const { data: currentVendor } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            const { data: vendor, error } = await supabase
                .from('vendors')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.UPDATE, 'vendor', id, currentVendor, data);

            return vendor;
        },
        onSuccess: (vendor) => {
            queryClient.invalidateQueries(['vendors']);
            queryClient.invalidateQueries(['vendor', vendor.id]);
            toast.success(t({ en: 'Vendor updated successfully', ar: 'تم تحديث المورد بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to update vendor', ar: 'فشل تحديث المورد' }));
            console.error('Update vendor error:', error);
        },
    });

    const deleteVendor = useMutation({
        mutationFn: async (id) => {
            const { data: currentVendor } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('vendors')
                .update({
                    is_deleted: true,
                    deleted_by: user?.email,
                    deleted_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;

            await logCrudOperation(AUDIT_ACTIONS.DELETE, 'vendor', id, currentVendor, { is_deleted: true });

            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            toast.success(t({ en: 'Vendor deleted successfully', ar: 'تم حذف المورد بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to delete vendor', ar: 'فشل حذف المورد' }));
            console.error('Delete vendor error:', error);
        },
    });

    const approveVendor = useMutation({
        mutationFn: async (id) => {
            const { data: currentVendor } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            const { data: vendor, error } = await supabase
                .from('vendors')
                .update({
                    status: 'approved',
                    approved_by: user?.email,
                    approved_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange('vendor', id, currentVendor.status, 'approved', {
                approved_by: user?.email,
            });

            // Send approval email
            await triggerEmail('vendor.approved', {
                entity_type: 'vendor',
                entity_id: id,
                recipient_email: vendor.contact_email || vendor.created_by,
                variables: {
                    vendor_name: vendor.name,
                    approved_by: user?.email,
                },
            }).catch(err => console.error('Email trigger failed:', err));

            return vendor;
        },
        onSuccess: (vendor) => {
            queryClient.invalidateQueries(['vendors']);
            queryClient.invalidateQueries(['vendor', vendor.id]);
            toast.success(t({ en: 'Vendor approved successfully', ar: 'تمت الموافقة على المورد بنجاح' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to approve vendor', ar: 'فشلت الموافقة على المورد' }));
            console.error('Approve vendor error:', error);
        },
    });

    const rejectVendor = useMutation({
        mutationFn: async ({ id, reason }) => {
            const { data: currentVendor } = await supabase
                .from('vendors')
                .select('*')
                .eq('id', id)
                .single();

            const { data: vendor, error } = await supabase
                .from('vendors')
                .update({
                    status: 'rejected',
                    rejection_reason: reason,
                    rejected_by: user?.email,
                    rejected_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            await logStatusChange('vendor', id, currentVendor.status, 'rejected', {
                rejected_by: user?.email,
                reason,
            });

            // Send rejection email
            await triggerEmail('vendor.rejected', {
                entity_type: 'vendor',
                entity_id: id,
                recipient_email: vendor.contact_email || vendor.created_by,
                variables: {
                    vendor_name: vendor.name,
                    rejection_reason: reason,
                },
            }).catch(err => console.error('Email trigger failed:', err));

            return vendor;
        },
        onSuccess: (vendor) => {
            queryClient.invalidateQueries(['vendors']);
            queryClient.invalidateQueries(['vendor', vendor.id]);
            toast.success(t({ en: 'Vendor rejected', ar: 'تم رفض المورد' }));
        },
        onError: (error) => {
            toast.error(t({ en: 'Failed to reject vendor', ar: 'فشل رفض المورد' }));
            console.error('Reject vendor error:', error);
        },
    });

    return {
        createVendor,
        updateVendor,
        deleteVendor,
        approveVendor,
        rejectVendor,
    };
}

export default useVendorMutations;

